"""
Build genes_with_pathway_chlamydomonas.tsv
==========================================
Gene IDs in GSE276249 FPKM data: Cre01.g000017  (JGI v5.6 locus tags)

TWO PATHS — script tries Path A first, falls back to Path B:

  Path A (preferred): JGI Phytozome annotation file
    Download manually from https://phytozome-next.jgi.doe.gov/
    File: Creinhardtii_281_v5.6.annotation_info.txt
    Save to: All_Datasets/GSE276249_Chlamyd/  (next to the FPKM file)
    Format: same as ChrZ merged_annotation.tsv
    Columns used: locusName, Best-hit-arabi-name, Best-hit-arabi-defline, Pfam, KO, ec

  Path B (automatic): NCBI FTP download for C. reinhardtii (taxid 3055)
    Downloads Chlamydomonas_reinhardtii.gene_info.gz from NCBI FTP.
    Gene symbols/descriptions then keyword-matched to pathways.
    Note: NCBI gene symbols may differ from JGI locus tags; mapping is best-effort.

Output: Annotation_file/genes_with_pathway_chlamydomonas.tsv

Run from the Annotation_file/ directory:
    python build_chlamydomonas_annotation.py
"""

import os, re, gzip, io, json, time, urllib.request, urllib.parse
import pandas as pd

HERE     = os.path.dirname(os.path.abspath(__file__))
DS_DIR   = os.path.normpath(os.path.join(HERE, "..", "All_Datasets", "GSE276249_Chlamyd"))
JGI_FILE = os.path.join(DS_DIR, "Creinhardtii_281_v5.6.annotation_info.txt")
OUT_FILE = os.path.join(HERE, "genes_with_pathway_chlamydomonas.tsv")
GENE_PATHWAY_TSV = os.path.join(HERE, "Gene_Pathway.tsv")
TAXID_CHLAMY = "3055"  # Chlamydomonas reinhardtii
# Feature table URL for C. reinhardtii CC-503 v5.0 (GCF_000002595.2)
NCBI_URL_LIST = [
    ("https://ftp.ncbi.nlm.nih.gov/genomes/all/GCF/000/002/595/"
     "GCF_000002595.2_Chlamydomonas_reinhardtii_v5.0/"
     "GCF_000002595.2_Chlamydomonas_reinhardtii_v5.0_feature_table.txt.gz"),
]

# ── Load pathway assigner from Pathway.py ────────────────────────────────────
def _load_pathway_assigner():
    with open(os.path.join(HERE, "Pathway.py"), encoding="utf-8") as f:
        src = f.read()
    skip = ("df = pd", "df['Pathway']", "df.to_csv", "output_path =",
            "print(df", "print(f\"")
    clean = "\n".join(
        ln for ln in src.split("\n")
        if not any(ln.strip().startswith(s) for s in skip)
    )
    ns = {"re": re, "pd": pd}
    exec(clean, ns)
    return ns["assign_pathway"], len(ns["PATHWAY_RULES"])

assign_pathway, n_rules = _load_pathway_assigner()
print(f"Loaded {n_rules} pathway rules from Pathway.py")

# ── Load Gene_Pathway.tsv (AT code -> KEGG pathway) for Arabidopsis mapping ──
gp = pd.read_csv(GENE_PATHWAY_TSV, sep="\t", dtype=str).fillna("")
gp.columns = ["Symbol", "Pathway"]
gp = gp[gp["Pathway"].str.strip() != ""]
at_to_pathway = dict(zip(gp["Symbol"].str.strip(), gp["Pathway"].str.strip()))
print(f"Loaded {len(at_to_pathway):,} AT-code -> KEGG pathway entries")

# ── PATH A: JGI Phytozome annotation ─────────────────────────────────────────
def path_a_jgi():
    print(f"\n[Path A] Reading JGI annotation: {JGI_FILE}")
    df = pd.read_csv(JGI_FILE, sep="\t", low_memory=False, dtype=str).fillna("")

    # Normalise locus tag: strip transcript suffix  Cre01.g000017.t1.2 -> Cre01.g000017
    if "locusName" in df.columns:
        df["GeneID"] = df["locusName"].str.replace(r"\.\d+$", "", regex=True)
    elif "transcriptName" in df.columns:
        df["GeneID"] = df["transcriptName"].str.replace(r"\.t\d+.*$", "", regex=True)
    else:
        raise ValueError("Cannot find locusName or transcriptName column in JGI file")

    # Arabidopsis best-hit -> Gene_Pathway KEGG pathway
    arabi_col  = next((c for c in df.columns if "arabi-name" in c.lower()), None)
    arabi_desc = next((c for c in df.columns if "arabi-defline" in c.lower()), None)

    def jgi_pathway(row):
        at = str(row.get(arabi_col, "")).strip()
        defline = str(row.get(arabi_desc, "")).strip()
        # Try AT ortholog -> KEGG pathway first
        pw = at_to_pathway.get(at, "")
        if pw:
            return pw.split(";")[0].strip()   # first KEGG pathway if multiple
        # Fallback: keyword match on defline
        return assign_pathway(defline)

    print("  Assigning pathways via AT ortholog + keywords ...")
    df["Pathway"] = df.apply(jgi_pathway, axis=1)

    # Build description from available columns
    desc_col = arabi_desc or next((c for c in df.columns if "defline" in c.lower()), "")
    ec_col   = next((c for c in df.columns if "ec" == c.lower() or "ec " in c.lower()), "")
    ko_col   = next((c for c in df.columns if "ko" == c.lower() or c.lower().startswith("ko ")), "")
    go_col   = next((c for c in df.columns if "go" in c.lower() and "term" in c.lower()), "")

    out = pd.DataFrame({
        "GeneID":      df["GeneID"],
        "EC_Number":   df.get(ec_col, pd.Series([""] * len(df))),
        "GO_Terms":    df.get(go_col, pd.Series([""] * len(df))),
        "Symbol":      df.get(arabi_col, pd.Series([""] * len(df))),
        "Description": df.get(desc_col, pd.Series([""] * len(df))),
        "Pathway":     df["Pathway"],
    })
    return out

# ── PATH B: NCBI RefSeq feature table or E-utils fallback ────────────────────
def path_b_ncbi():
    print(f"\n[Path B] Fetching C. reinhardtii genes ...")

    # Try feature tables first
    for url in NCBI_URL_LIST:
        try:
            print(f"  Trying: {url}")
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=300) as resp:
                raw = resp.read()
            print(f"  Downloaded {len(raw)/1e6:.1f} MB")
            with gzip.open(io.BytesIO(raw)) as gz:
                ft = pd.read_csv(gz, sep="\t", low_memory=False, dtype=str).fillna("")
            print(f"  {len(ft):,} feature rows")
            # Extract gene info from feature table
            fc = ft.columns[0]
            genes = ft[ft[fc].isin(["gene", "CDS", "mRNA"])].copy()
            if len(genes) == 0:
                genes = ft.copy()
            locus_col = next((c for c in genes.columns if "locus" in c.lower()), None)
            name_col  = next((c for c in genes.columns if c.lower() in ("name", "symbol")), None)
            prod_col  = next((c for c in genes.columns if "product" in c.lower() and "accession" not in c.lower()), None)
            df = pd.DataFrame({
                "GeneID":      genes[locus_col].values if locus_col else [""] * len(genes),
                "Symbol":      genes[name_col].values  if name_col  else [""] * len(genes),
                "Description": genes[prod_col].values  if prod_col  else [""] * len(genes),
            }).dropna(subset=["GeneID"]).drop_duplicates("GeneID")
            df["Pathway"] = df["Description"].fillna("").apply(assign_pathway)
            out = pd.DataFrame({
                "GeneID": df["GeneID"], "EC_Number": "",
                "GO_Terms": "", "Symbol": df["Symbol"],
                "Description": df["Description"], "Pathway": df["Pathway"],
            })
            return out
        except Exception as e:
            print(f"  Failed: {e}")

    # E-utils fallback (WebEnv to avoid URI-too-long)
    print(f"\n  [E-utils fallback] taxid {TAXID_CHLAMY} ...")
    search_url = (
        f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
        f"?db=gene&term=txid{TAXID_CHLAMY}[orgn]+AND+alive[prop]"
        f"&retmax=0&usehistory=y&retmode=json"
    )
    req = urllib.request.Request(search_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as r:
        sdata = json.loads(r.read())
    webenv = sdata["esearchresult"]["webenv"]
    qkey   = sdata["esearchresult"]["querykey"]
    count  = int(sdata["esearchresult"]["count"])
    print(f"  Found {count} genes; fetching via WebEnv ...")
    rows = []
    for start in range(0, min(count, 30000), 500):
        surl = (
            f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
            f"?db=gene&query_key={qkey}&WebEnv={webenv}"
            f"&retstart={start}&retmax=500&retmode=json"
        )
        req2 = urllib.request.Request(surl, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req2, timeout=120) as r:
            gdata = json.loads(r.read())
        for gid, doc in gdata.get("result", {}).items():
            if gid == "uids":
                continue
            locus  = doc.get("name", "") or doc.get("symbol", "")
            symbol = doc.get("symbol", "")
            desc   = doc.get("description", "")
            rows.append({"GeneID": locus or symbol, "Symbol": symbol, "Description": desc})
        print(f"  Fetched {min(start+500, count)}/{count}", end="\r")
        time.sleep(0.12)
    print()
    df = pd.DataFrame(rows).dropna(subset=["GeneID"])
    df["Pathway"] = df["Description"].fillna("").apply(assign_pathway)
    out = pd.DataFrame({
        "GeneID": df["GeneID"], "EC_Number": "",
        "GO_Terms": "", "Symbol": df["Symbol"],
        "Description": df["Description"], "Pathway": df["Pathway"],
    })
    return out

# ── PATH C: EnsemblPlants BioMart (preferred — GO-term based) ────────────────
def path_c_ensembl():
    """Download Chlamydomonas GO terms from EnsemblPlants BioMart creinhardtii_eg_gene."""
    BIOMART_URL = "https://plants.ensembl.org/biomart/martservice"
    QUERY_XML = ('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE Query>'
                 '<Query virtualSchemaName="plants_mart" formatter="TSV" header="1" uniqueRows="1" count="">'
                 '<Dataset name="creinhardtii_eg_gene" interface="default">'
                 '<Attribute name="ensembl_gene_id"/>'
                 '<Attribute name="external_gene_name"/>'
                 '<Attribute name="description"/>'
                 '<Attribute name="go_id"/>'
                 '<Attribute name="name_1006"/>'
                 '</Dataset></Query>')
    # Use external_gene_name (Cre01.g format) as GeneID to match the FPKM data file
    QUERY_XML_CRE = ('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE Query>'
                     '<Query virtualSchemaName="plants_mart" formatter="TSV" header="1" uniqueRows="1" count="">'
                     '<Dataset name="creinhardtii_eg_gene" interface="default">'
                     '<Attribute name="external_gene_name"/>'
                     '<Attribute name="description"/>'
                     '<Attribute name="go_id"/>'
                     '<Attribute name="name_1006"/>'
                     '</Dataset></Query>')
    print("\n[Path C] EnsemblPlants BioMart (creinhardtii_eg_gene, Cre01.g IDs) ...")
    encoded_q = urllib.parse.quote(QUERY_XML_CRE)
    url = f"{BIOMART_URL}?query={encoded_q}"
    req = urllib.request.Request(url, headers={"User-Agent": "Python/build_chlamydomonas"})
    with urllib.request.urlopen(req, timeout=300) as r:
        raw = r.read().decode("utf-8")
    print(f"  Downloaded {len(raw):,} bytes")
    df = pd.read_csv(io.StringIO(raw), sep="\t", dtype=str, keep_default_na=False)
    df.columns = ["GeneID", "Description", "GO_ID", "GO_Name"]
    # Keep only rows where GeneID matches Cre01.g format (JGI locus tag)
    df = df[df["GeneID"].str.match(r"^Cre\d+\.g\d+$", na=False)].copy()
    print(f"  Cre*.g* genes: {df['GeneID'].nunique():,}")

    def consolidate_gene(group):
        gene_id   = group.name
        base_desc = group["Description"].replace("", pd.NA).dropna()
        base_desc = base_desc.iloc[0] if len(base_desc) > 0 else ""
        go_names  = group["GO_Name"].replace("", pd.NA).dropna().unique().tolist()
        go_text   = " ".join(go_names) if go_names else ""
        full_desc = (base_desc + " " + go_text).strip()
        return pd.Series({"Symbol": gene_id, "Description": full_desc or "Unknown"})

    agg = df.groupby("GeneID", sort=False).apply(consolidate_gene).reset_index()
    agg["Pathway"] = agg["Description"].apply(assign_pathway)
    out = pd.DataFrame({
        "GeneID": agg["GeneID"], "EC_Number": "",
        "GO_Terms": "", "Symbol": agg["Symbol"],
        "Description": agg["Description"], "Pathway": agg["Pathway"],
    })
    return out

# ── Run ───────────────────────────────────────────────────────────────────────
if os.path.isfile(JGI_FILE):
    out = path_a_jgi()
    source = "JGI Phytozome v5.6"
else:
    print(f"JGI file not found at {JGI_FILE}")
    try:
        out = path_c_ensembl()
        source = "EnsemblPlants BioMart"
    except Exception as e:
        print(f"EnsemblPlants failed ({e}), falling back to NCBI ...")
        out = path_b_ncbi()
        source = "NCBI gene_info"

# ── Stats ─────────────────────────────────────────────────────────────────────
total     = len(out)
annotated = (out["Pathway"] != "Unknown").sum()
print(f"\nSource      : {source}")
print(f"Total genes : {total:,}")
print(f"Annotated   : {annotated:,}  ({annotated/total*100:.1f}%)")
print("\nTop 20 pathways:")
print(out["Pathway"].value_counts().head(20).to_string())

# ── Save ──────────────────────────────────────────────────────────────────────
out.to_csv(OUT_FILE, sep="\t", index=False)
print(f"\nSaved: {OUT_FILE}")
print("Next step: run All_Datasets/GSE276249_Chlamyd/process.R")
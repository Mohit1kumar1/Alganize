"""
Build genes_with_pathway_wheat.tsv for Triticum aestivum using
EnsemblPlants BioMart dataset 'taalchemy_eg_gene' (GCA951799155v1).

Gene IDs are TraesCS02G format, matching the FPKM data in GSE294406.
GO term names are concatenated per gene and used as description text
for Pathway.py keyword matching.

Usage (run from Annotation_file/ directory):
    python build_wheat_alchemy_annotation.py
"""

import os, re, io, urllib.request, urllib.parse
import pandas as pd

HERE     = os.path.dirname(os.path.abspath(__file__))
OUT_FILE = os.path.join(HERE, "genes_with_pathway_wheat.tsv")

BIOMART_URL = "https://plants.ensembl.org/biomart/martservice"
QUERY_XML = '''<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE Query><Query virtualSchemaName="plants_mart" formatter="TSV" header="1" uniqueRows="1" count=""><Dataset name="taalchemy_eg_gene" interface="default"><Attribute name="ensembl_gene_id"/><Attribute name="external_gene_name"/><Attribute name="description"/><Attribute name="go_id"/><Attribute name="name_1006"/><Attribute name="namespace_1003"/></Dataset></Query>'''

# ── Load pathway assigner ─────────────────────────────────────────────────────
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

# ── Download from BioMart ─────────────────────────────────────────────────────
print("\nDownloading taalchemy_eg_gene from EnsemblPlants BioMart ...")
print("  (TraesCS02G IDs, GO terms — ~330k rows, may take 2-3 min)")

encoded_q = urllib.parse.quote(QUERY_XML)
url = f"{BIOMART_URL}?query={encoded_q}"
req = urllib.request.Request(url, headers={"User-Agent": "Python/build_wheat_annotation"})

with urllib.request.urlopen(req, timeout=600) as r:
    raw = r.read().decode("utf-8")

print(f"  Downloaded {len(raw):,} bytes")

# ── Parse TSV ─────────────────────────────────────────────────────────────────
df = pd.read_csv(io.StringIO(raw), sep="\t", dtype=str, keep_default_na=False)
df.columns = ["GeneID", "Symbol", "Description", "GO_ID", "GO_Name", "GO_Domain"]
print(f"  Rows: {len(df):,}")
print(f"  Genes: {df['GeneID'].nunique():,}")
print(f"  With GO terms: {(df['GO_Name'] != '').any()}")

# Keep only rows with TraesCS gene IDs
df = df[df["GeneID"].str.startswith("TraesCS", na=False)].copy()
print(f"  TraesCS genes: {df['GeneID'].nunique():,}")

# ── Consolidate per gene ───────────────────────────────────────────────────────
# Build one row per gene with concatenated GO names as description
def consolidate_gene(group):
    # group.name is the GeneID (groupby key); column excluded from group in pandas 2.x
    gene_id = group.name
    symbol  = group["Symbol"].replace("", pd.NA).dropna()
    sym     = symbol.iloc[0] if len(symbol) > 0 else gene_id

    base_desc = group["Description"].replace("", pd.NA).dropna()
    base_desc = base_desc.iloc[0] if len(base_desc) > 0 else ""

    go_names = group["GO_Name"].replace("", pd.NA).dropna().unique().tolist()
    go_text  = " ".join(go_names) if go_names else ""

    full_desc = (base_desc + " " + go_text).strip()
    return pd.Series({"Symbol": sym, "Description": full_desc or "Unknown"})

print("\nConsolidating GO terms per gene ...")
agg = df.groupby("GeneID", sort=False).apply(consolidate_gene).reset_index()
print(f"  Gene rows: {len(agg):,}")

# ── Assign pathways ───────────────────────────────────────────────────────────
print("Assigning pathways ...")
agg["Pathway"] = agg["Description"].apply(assign_pathway)

total     = len(agg)
annotated = (agg["Pathway"] != "Unknown").sum()
print(f"\nTotal genes : {total:,}")
print(f"Annotated   : {annotated:,}  ({annotated/total*100:.1f}%)")
print("\nTop 20 pathways:")
print(agg["Pathway"].value_counts().head(20).to_string())

print(f"\nSample IDs  : {list(agg['GeneID'].head(3))}")

# ── Save ──────────────────────────────────────────────────────────────────────
out = agg[["GeneID", "Symbol", "Description", "Pathway"]].reset_index(drop=True)
out.to_csv(OUT_FILE, sep="\t", index=False)
print(f"\nSaved: {OUT_FILE}")
print("Next step: run All_Datasets/GSE294406_Wheat/process.R")
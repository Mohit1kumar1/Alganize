"""
Microalgae RNA-seq atlas downloader.
Downloads all available data files from publicly accessible microalgae
transcriptomic databases into organized subfolders.
"""

import urllib.request
import os
import json

BASE = os.path.dirname(os.path.abspath(__file__))

def mkdir(name):
    p = os.path.join(BASE, name)
    os.makedirs(p, exist_ok=True)
    return p

def download(url, dest, label=""):
    if os.path.exists(dest):
        print(f"    SKIP (exists): {os.path.basename(dest)}")
        return True
    print(f"    Downloading: {label or os.path.basename(dest)} ...", end=" ", flush=True)
    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "*/*",
        })
        with urllib.request.urlopen(req, timeout=300) as r, open(dest, "wb") as f:
            while True:
                chunk = r.read(1024 * 256)
                if not chunk:
                    break
                f.write(chunk)
        size_mb = os.path.getsize(dest) / 1024 / 1024
        print(f"done ({size_mb:.2f} MB)")
        return True
    except Exception as e:
        print(f"FAILED: {e}")
        if os.path.exists(dest):
            os.remove(dest)
        return False

def write_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"    Wrote: {os.path.basename(path)}")

def write_text(path, text):
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"    Wrote: {os.path.basename(path)}")


# ─────────────────────────────────────────────────────────────
# 1. ALCOdb — Algal Coexpression Database (Zenodo)
# ─────────────────────────────────────────────────────────────
print("\n=== 1. ALCOdb (alcodb.jp / Zenodo) ===")
d = mkdir("alcodb")

ZENODO = "https://zenodo.org/records/10072283/files"

# Expression tables (small, ~25 MB total) — download these
download(f"{ZENODO}/Cre-R1-15-08_GeneExpressionTable.tsv.gz?download=1",
         os.path.join(d, "Cre_GeneExpressionTable.tsv.gz"),
         "C. reinhardtii expression table (172 samples, 15,519 genes)")
download(f"{ZENODO}/Cme1_GeneExpressionTable.tsv.zip?download=1",
         os.path.join(d, "Cme1_GeneExpressionTable.tsv.zip"),
         "C. merolae dataset 1 expression table")
download(f"{ZENODO}/Cme2_GeneExpressionTable.tsv.zip?download=1",
         os.path.join(d, "Cme2_GeneExpressionTable.tsv.zip"),
         "C. merolae dataset 2 expression table")

write_json(os.path.join(d, "alcodb_info.json"), {
    "name": "ALCOdb — Algal Gene Coexpression Database",
    "url": "http://alcodb.jp",
    "paper": "Plant and Cell Physiology 2016, PMC4722175",
    "species": {
        "Chlamydomonas reinhardtii": {"samples": 172, "genes": 15519, "data": "RNA-seq"},
        "Cyanidioschyzon merolae": {"samples": None, "genes": None, "data": "microarray"}
    },
    "method": "Mutual Rank (MR) coexpression",
    "visualization": "Cytoscape.js network graphs",
    "download": "Freely downloadable from Zenodo (zenodo.org/records/10072283)",
    "large_files_not_downloaded": {
        "Cre.v15-08.G15519-S172.quantile.mrgeo.d.zip": {
            "size": "2.3 GB", "url": f"{ZENODO}/Cre.v15-08.G15519-S172.quantile.mrgeo.d.zip?download=1",
            "description": "Full C. reinhardtii coexpression matrix (latest, 172 samples)"
        },
        "Cre.v15-02.G15540-S180.qnorm.mrgeo.d.zip": {
            "size": "2.3 GB", "url": f"{ZENODO}/Cre.v15-02.G15540-S180.qnorm.mrgeo.d.zip?download=1",
            "description": "Full C. reinhardtii coexpression matrix (v15-02, 180 samples)"
        },
        "Cre.v13-10.G18773-S137.qnorm.mrgeo.d.zip": {
            "size": "3.3 GB", "url": f"{ZENODO}/Cre.v13-10.G18773-S137.qnorm.mrgeo.d.zip?download=1",
            "description": "Full C. reinhardtii coexpression matrix (v13-10)"
        },
        "Cme1.v14-06.G4586-S75.d.zip": {
            "size": "214.8 MB", "url": f"{ZENODO}/Cme1.v14-06.G4586-S75.d.zip?download=1",
            "description": "C. merolae dataset 1 full coexpression matrix"
        },
        "Cme2.v14-06.G6506-S48.d.zip": {
            "size": "442.2 MB", "url": f"{ZENODO}/Cme2.v14-06.G6506-S48.d.zip?download=1",
            "description": "C. merolae dataset 2 full coexpression matrix"
        },
        "Cre_v55.CodonUsage.G17741.zip": {
            "size": "3.0 GB", "url": f"{ZENODO}/Cre_v55.CodonUsage.G17741.zip?download=1",
            "description": "C. reinhardtii codon usage coexpression data"
        }
    }
})


# ─────────────────────────────────────────────────────────────
# 2. MMETSP — Marine Microbial Eukaryote Transcriptome Sequencing Project
# ─────────────────────────────────────────────────────────────
print("\n=== 2. MMETSP (Figshare / iMicrobe) ===")
d = mkdir("mmetsp")

write_json(os.path.join(d, "mmetsp_info.json"), {
    "name": "Marine Microbial Eukaryote Transcriptome Sequencing Project (MMETSP)",
    "paper": "PLOS Biology 2014, PMC4068987",
    "samples": 678,
    "species": 306,
    "phyla": "40+",
    "groups": ["prasinophytes", "dinoflagellates", "diatoms", "cryptophytes", "red algae", "haptophytes"],
    "download_reassemblies": {
        "figshare": "https://figshare.com/articles/dataset/Marine_Microbial_Eukaryotic_Transcriptome_Sequencing_Project_re-assemblies/3840153/3",
        "direct_file": "https://ndownloader.figshare.com/files/11058947",
        "filename": "mmetsp_dib_trinity2.2.0_completeApril2018_figshare.zip",
        "size": "7.1 GB",
        "format": "ZIP (Trinity assembled transcriptomes)",
        "note": "NOT downloaded automatically — too large (7.1 GB). Download manually from Figshare."
    },
    "raw_reads": "NCBI SRA (verify current accession via NCBI search: MMETSP)",
    "imicrobe": "https://www.imicrobe.us/#/projects/104"
})

# Try downloading MMETSP metadata from NCBI
download(
    "https://raw.githubusercontent.com/dib-lab/MMETSP/master/sample_list.txt",
    os.path.join(d, "mmetsp_sample_list.txt"),
    "MMETSP sample list"
)


# ─────────────────────────────────────────────────────────────
# 3. EBI Expression Atlas — C. reinhardtii & P. tricornutum
# ─────────────────────────────────────────────────────────────
print("\n=== 3. EBI Expression Atlas ===")
d = mkdir("expression_atlas")

EBI_BASE = "https://www.ebi.ac.uk/gxa/experiments"

# Known microalgae experiment accessions
experiments = {
    "E-GEOD-62671": "C. reinhardtii RNA-seq diel conditions (16 samples)",
    "E-ENAD-12":    "C. reinhardtii baseline experiment",
    "E-GEOD-42809": "C. reinhardtii nitrogen deprivation",
    "E-GEOD-34826": "C. reinhardtii sulfur deprivation",
    "E-GEOD-71469": "Phaeodactylum tricornutum Fe/light stress",
}

for acc, desc in experiments.items():
    exp_dir = mkdir(f"expression_atlas/{acc}")
    write_json(os.path.join(exp_dir, "experiment_info.json"), {
        "accession": acc, "description": desc,
        "web_url": f"{EBI_BASE}/{acc}",
        "download_url": f"{EBI_BASE}/{acc}/download/zip?fileType=baseline-analytics"
    })
    for ftype, fname in [
        ("experiment-design",   "experiment_design.tsv"),
        ("baseline-analytics",  "baseline_analytics.tsv.gz"),
        ("normalized-expressions", "normalized_expressions.tsv.gz"),
        ("raw-counts",          "raw_counts.tsv.gz"),
    ]:
        url = f"{EBI_BASE}/{acc}/download?fileType={ftype}"
        download(url, os.path.join(exp_dir, fname), f"{acc} {ftype}")

write_json(os.path.join(d, "expression_atlas_info.json"), {
    "name": "EMBL-EBI Expression Atlas",
    "url": "https://www.ebi.ac.uk/gxa/home",
    "scope": "4,562 studies, 161,199 assays across 67 species",
    "microalgae_experiments": experiments,
    "download_format": "TSV (raw counts, normalized, experiment design)",
    "license": "free"
})


# ─────────────────────────────────────────────────────────────
# 4. Alganaut — Eukaryotic Microalgae Transcriptomics Compendium
# ─────────────────────────────────────────────────────────────
print("\n=== 4. Alganaut (Ashworth & Ralph, UTS) ===")
d = mkdir("alganaut")

write_json(os.path.join(d, "alganaut_info.json"), {
    "name": "Alganaut — Eukaryotic Microalgae Transcriptomics Compendium",
    "paper": "bioRxiv preprint 2018, doi:10.1101/403063",
    "paper_url": "https://www.biorxiv.org/content/10.1101/403063v3.full",
    "web_tool": "https://alganaut.uts.edu.au (status: uncertain as of 2026)",
    "total_samples": 1375,
    "studies": 69,
    "species": {
        "Phaeodactylum tricornutum":  {"samples": 539, "projects": 26},
        "Thalassiosira pseudonana":   {"samples": 380, "projects": 17},
        "Micromonas pusilla":         {"samples": 164, "projects": 4},
        "Emiliania huxleyi":          {"samples": 69,  "projects": 6},
        "Nannochloropsis oceanica":   {"samples": 68,  "projects": 5},
        "Cyclotella cryptica":        {"samples": 56,  "projects": 1},
        "Fragilariopsis cylindrus":   {"samples": 40,  "projects": 4},
        "Thalassiosira weissflogii":  {"samples": 26,  "projects": 1},
        "Thalassiosira oceanica":     {"samples": 21,  "projects": 3},
        "Pseudo-nitzschia multiseries": {"samples": 12, "projects": 2}
    },
    "clades": ["diatoms", "green algae", "haptophyte", "eustigmatophyte"],
    "raw_data": "NCBI SRA (individual SRR accessions listed in preprint supplementary tables)",
    "data_availability": "Web tool accessibility uncertain; contact authors at UTS for processed data",
    "contact": "University of Technology Sydney (UTS)"
})

# Try to get the supplementary data from bioRxiv
download(
    "https://www.biorxiv.org/content/10.1101/403063v3.full.pdf",
    os.path.join(d, "alganaut_preprint.pdf"),
    "Alganaut preprint PDF"
)


# ─────────────────────────────────────────────────────────────
# 5. ALGAEFUN / MARACAS
# ─────────────────────────────────────────────────────────────
print("\n=== 5. ALGAEFUN / MARACAS ===")
d = mkdir("algaefun")

write_json(os.path.join(d, "algaefun_info.json"), {
    "name": "ALGAEFUN / MARACAS",
    "url": "https://greennetwork.us.es/AlgaeFUN/",
    "paper": "BMC Bioinformatics 2022, PMC8973887",
    "paper_url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8973887/",
    "github_algaefun": "https://github.com/fran-romero-campero/AlgaeFUN",
    "github_maracas": "https://github.com/fran-romero-campero/MARACAS",
    "zenodo_code": "https://zenodo.org/record/4754516",
    "species_14": [
        "Chlamydomonas reinhardtii", "Volvox carteri",
        "Chromochloris zofingiensis", "Dunaliella salina",
        "Haematococcus lacustris", "Ostreococcus tauri",
        "Micromonas pusilla", "Phaeodactylum tricornutum",
        "Nannochloropsis gaditana", "Ectocarpus siliculosus",
        "Klebsormidium nitens", "Chara braunii",
        "Chlorella variabilis", "Auxenochlorella protothecoides"
    ],
    "phylogenetic_groups": ["Chlorophyceae", "Mamiellophyceae", "Stramenopiles", "Charophyceae", "Trebouxiophyceae"],
    "features": ["RNA-seq analysis", "ChIP-seq analysis", "functional enrichment", "coexpression networks"],
    "data_access": "Web interface only; underlying MARACAS database not separately downloadable"
})

# Download the Zenodo code archive
download(
    "https://zenodo.org/record/4754516/files/fran-romero-campero/MARACAS-1.0.0.zip?download=1",
    os.path.join(d, "MARACAS_source_code.zip"),
    "MARACAS source code (Zenodo)"
)


# ─────────────────────────────────────────────────────────────
# 6. NanDeSyn — Nannochloropsis Multi-Omics Database
# ─────────────────────────────────────────────────────────────
print("\n=== 6. NanDeSyn (Nannochloropsis) ===")
d = mkdir("nandesyn")

write_json(os.path.join(d, "nandesyn_info.json"), {
    "name": "NanDeSyn — Nannochloropsis Design Synthesis Database",
    "url": "http://nandesyn.single-cell.cn",
    "paper": "The Plant Journal 2020, PMID 33103271",
    "doi": "https://doi.org/10.1111/tpj.15025",
    "species": [
        "Nannochloropsis oceanica IMET1",
        "Nannochloropsis salina CCMP1776",
        "Nannochloropsis gaditana CCMP526",
        "Nannochloropsis granulata CCMP529",
        "Nannochloropsis limnetica SAG 18.99",
        "Nannochloropsis oculata"
    ],
    "data_types": ["genomics", "transcriptomics", "proteomics"],
    "tools": ["BLAST", "synteny view", "enrichment analysis", "metabolic pathway analysis", "genome browser"],
    "visualization": "None (no UMAP or dimensionality reduction)",
    "data_access": "Web interface — individual queries via gene/protein search; bulk download availability not confirmed",
    "note": "Website served over HTTP only (no HTTPS); use http://nandesyn.single-cell.cn"
})

for fname, url in [
    ("Nannochloropsis_oceanica_IMET1_genome.gff", "http://nandesyn.single-cell.cn/download/genome/Nannochloropsis_oceanica_IMET1.gff"),
    ("Nannochloropsis_oceanica_IMET1_proteins.faa", "http://nandesyn.single-cell.cn/download/protein/Nannochloropsis_oceanica_IMET1.faa"),
]:
    download(url, os.path.join(d, fname))


# ─────────────────────────────────────────────────────────────
# 7. DiatOmicBase — Diatom Multi-Omics Platform
# ─────────────────────────────────────────────────────────────
print("\n=== 7. DiatOmicBase (ENS Paris) ===")
d = mkdir("diatomicsbase")

write_json(os.path.join(d, "diatomicsbase_info.json"), {
    "name": "DiatOmicBase — Diatom Multi-Omics Platform",
    "url": "https://www.diatomicsbase.bio.ens.psl.eu/",
    "paper": "The Plant Journal 2025, PMC11910669",
    "paper_url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC11910669/",
    "species": {
        "Phaeodactylum tricornutum": {
            "studies": 48, "samples": 1431, "comparisons": 266,
            "note": "Primary species — full portal"
        },
        "Thalassiosira pseudonana": {"note": "Preliminary portal"},
        "Pseudo-nitzschia multistriata": {"note": "Preliminary portal"}
    },
    "data_types": ["RNA-Seq", "genomic", "epigenomic", "proteomic"],
    "features": ["gene-centered queries", "DE analysis", "cross-study comparison", "genome browser"],
    "data_access": "Interactive web tool; data accessible through the interface by selecting BioProjects and samples",
    "underlying_data": "Raw data available in NCBI/EBI under BioProject accessions (listed in the web tool)",
    "est_database": "https://diatomics.bio.ens.psl.eu/EST/ (legacy EST database for P. tricornutum and T. pseudonana)"
})

download("https://www.diatomicsbase.bio.ens.psl.eu/static/downloads/Pt_gene_list.txt",
         os.path.join(d, "Pt_gene_list.txt"), "P. tricornutum gene list")
download("https://diatomics.bio.ens.psl.eu/EST/downloads/Pt_ESTs.fasta.gz",
         os.path.join(d, "Pt_ESTs.fasta.gz"), "P. tricornutum EST sequences")


# ─────────────────────────────────────────────────────────────
# 8. PhaeoEpiView — Phaeodactylum Epigenome Browser
# ─────────────────────────────────────────────────────────────
print("\n=== 8. PhaeoEpiView (Univ. Nantes) ===")
d = mkdir("phaeoepiview")

write_json(os.path.join(d, "phaeoepiview_info.json"), {
    "name": "PhaeoEpiView — Phaeodactylum Epigenome Browser",
    "url": "https://phaeoepiview.univ-nantes.fr/",
    "paper": "Scientific Reports 2023, PMC10206091",
    "paper_url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10206091/",
    "species": "Phaeodactylum tricornutum",
    "genome": "Phatr3 reference genome",
    "data_types": [
        "Histone modification tracks (H3K4me3, H3K27me3, etc.)",
        "DNA methylation data",
        "Transcript expression levels (RNA-seq tracks)"
    ],
    "browser": "JBrowse2",
    "data_access": "Interactive genome browser only; individual track data not bulk-downloadable via the web interface",
    "underlying_data": "Raw ChIP-seq and RNA-seq reads deposited in NCBI GEO under the associated study accession"
})


# ─────────────────────────────────────────────────────────────
# 9. CyanoOmicsDB — Cyanobacteria Omics Database
# ─────────────────────────────────────────────────────────────
print("\n=== 9. CyanoOmicsDB (Cyanobacteria) ===")
d = mkdir("cyanoomicsdb")

write_json(os.path.join(d, "cyanoomicsdb_info.json"), {
    "name": "CyanoOmicsDB — Cyanobacteria Transcriptomics & Proteomics",
    "url_published": "http://www.cyanoomics.cn/ (accessibility unconfirmed as of 2026)",
    "paper": "Nucleic Acids Research 2022, PMC8728175",
    "paper_url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC8728175/",
    "primary_species": "Synechocystis sp. PCC 6803",
    "data": {
        "transcriptomic_datasets": 56,
        "primary_transcriptomic_datasets": 3,
        "proteomic_datasets": 15,
        "pairwise_transcriptome_comparisons": 203,
        "proteome_comparisons": 25
    },
    "raw_data_sources": ["NCBI GEO", "NCBI SRA"],
    "data_access": "Web interface (URL status uncertain); raw data accessible via GEO/SRA",
    "note": "URL http://www.cyanoomics.cn/ was not confirmed accessible as of mid-2026 verification"
})

# Try to fetch CyanoOmicsDB data
for url, fname in [
    ("http://www.cyanoomics.cn/download/all_gene_expression.tsv", "synechocystis_expression.tsv"),
    ("https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE138784&targ=self&view=brief&form=text",
     "CyanoOmicsDB_GEO_metadata.txt"),
]:
    download(url, os.path.join(d, fname))


# ─────────────────────────────────────────────────────────────
# 10. PhytoNet — Phytoplankton Coexpression Network
# ─────────────────────────────────────────────────────────────
print("\n=== 10. PhytoNet (gene2function.de) ===")
d = mkdir("phytonet")

write_json(os.path.join(d, "phytonet_info.json"), {
    "name": "PhytoNet — Phytoplankton Gene Coexpression Network",
    "url": "http://www.gene2function.de",
    "paper": "Nucleic Acids Research 2018, PMC6030924",
    "paper_url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6030924/",
    "doi": "10.1093/nar/gky271",
    "species": {
        "microalgae": [
            "Chlamydomonas reinhardtii",
            "Emiliania huxleyi",
            "Phaeodactylum tricornutum",
            "Ectocarpus siliculosus",
            "Cyanidioschyzon merolae"
        ],
        "cyanobacteria": [
            "Synechocystis sp. PCC 6803",
            "Nostoc punctiforme",
            "Prochlorococcus marinus",
            "Cyanothece sp."
        ]
    },
    "parent_platform": "PlaNet (plant coexpression network platform)",
    "method": "Gene coexpression network based on RNA-seq",
    "features": ["gene coexpression queries", "network visualization", "comparative across species"],
    "data_access": "Web interface — query-based access; no bulk download option described"
})


# ─────────────────────────────────────────────────────────────
# 11. PhycoCosm — JGI Algal Genomics Portal
# ─────────────────────────────────────────────────────────────
print("\n=== 11. PhycoCosm (JGI) ===")
d = mkdir("phycocosm")

write_json(os.path.join(d, "phycocosm_info.json"), {
    "name": "PhycoCosm — JGI Comparative Algal Genomics Portal",
    "url": "https://phycocosm.jgi.doe.gov",
    "paper": "Nucleic Acids Research 2021, PMC7779052",
    "genomes": "136+ algal genomes across the eukaryotic tree of life",
    "groups": ["diatoms (Bacillariophyta)", "green algae (Chlorophyta)", "brown algae", "red algae", "others"],
    "data_types": ["genome sequences", "gene annotations", "RNA-seq expression data", "protein families"],
    "features": ["genome browser", "BLAST", "comparative genomics", "gene family analysis"],
    "data_access": "JGI account required for bulk downloads; browsing is free",
    "bulk_download": "Via JGI Data Portal (https://genome.jgi.doe.gov) — requires registration"
})


# ─────────────────────────────────────────────────────────────
# Done — Summary
# ─────────────────────────────────────────────────────────────
print("\n=== All done ===")
print(f"Output directory: {BASE}")
print("Folders created:")
for folder in sorted(os.listdir(BASE)):
    fpath = os.path.join(BASE, folder)
    if os.path.isdir(fpath):
        files = os.listdir(fpath)
        size = sum(
            os.path.getsize(os.path.join(fpath, f))
            for f in files if os.path.isfile(os.path.join(fpath, f))
        ) / 1024 / 1024
        print(f"  {folder}/  ({len(files)} files, {size:.2f} MB)")

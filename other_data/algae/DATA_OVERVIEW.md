# Microalgae RNA-seq & Transcriptomics Data Overview

## What this folder contains

Data and metadata collected from **11 publicly available microalgae transcriptomic databases and atlases**, organized into subfolders by source. Each subfolder contains either downloaded data files or a detailed `_info.json` describing the resource, access method, and direct download URLs for files that could not be retrieved programmatically (due to bot protection, authentication requirements, or file sizes exceeding practical limits).

**Collection date:** June 2026  
**Total downloaded:** ~12 MB of real data files + structured metadata JSON for all 11 databases

---

## Key Finding

> **No microalgae-specific UMAP-based bulk RNA-seq atlas equivalent to the Mutwil Plant Atlas Viewer exists as of mid-2026.** The closest analog is the Alganaut compendium (1,375 samples, 10 species), but its web interface is not reliably accessible. This represents an open opportunity in the field.

---

## Folder Structure

```
algae/
├── alcodb/             ALCOdb — Algal Coexpression Database
├── algaefun/           ALGAEFUN / MARACAS — 14-species web tool
├── alganaut/           Alganaut — closest to a multi-species RNA-seq compendium
├── cyanoomicsdb/       CyanoOmicsDB — cyanobacteria transcriptomics
├── diatomicsbase/      DiatOmicBase — diatom multi-omics (P. tricornutum)
├── expression_atlas/   EBI Expression Atlas — C. reinhardtii experiments
│   ├── E-GEOD-62671/   C. reinhardtii diel RNA-seq (16 samples, baseline)
│   └── E-ENAD-12/      C. reinhardtii baseline (differential)
├── mmetsp/             MMETSP — 678 marine microalgae transcriptomes
├── nandesyn/           NanDeSyn — 6 Nannochloropsis species
├── phaeoepiview/       PhaeoEpiView — P. tricornutum epigenome browser
├── phycocosm/          PhycoCosm (JGI) — 136+ algal genomes
└── phytonet/           PhytoNet — 9 phytoplankton coexpression networks
```

---

## Database Details

---

### 1. Alganaut — Eukaryotic Microalgae Transcriptomics Compendium
**Folder:** `alganaut/`

The single largest integrated microalgae RNA-seq compendium found. Most similar in spirit to the Plant Atlas Viewer.

| Property | Value |
|---|---|
| Total samples | **1,375** |
| Studies | 69 |
| Species | 10 |
| Clades | Diatoms, green algae, haptophyte, eustigmatophyte |
| Source | bioRxiv preprint (Ashworth & Ralph, UTS, 2018) |
| Web tool | https://alganaut.uts.edu.au *(status uncertain as of 2026)* |
| Paper | https://www.biorxiv.org/content/10.1101/403063v3.full |

**Species breakdown:**

| Species | Samples | Projects |
|---|---|---|
| *Phaeodactylum tricornutum* | 539 | 26 |
| *Thalassiosira pseudonana* | 380 | 17 |
| *Micromonas pusilla* | 164 | 4 |
| *Emiliania huxleyi* | 69 | 6 |
| *Nannochloropsis oceanica* | 68 | 5 |
| *Cyclotella cryptica* | 56 | 1 |
| *Fragilariopsis cylindrus* | 40 | 4 |
| *Thalassiosira weissflogii* | 26 | 1 |
| *Thalassiosira oceanica* | 21 | 3 |
| *Pseudo-nitzschia multiseries* | 12 | 2 |

**Files in folder:**
- `alganaut_info.json` — full metadata, species table, contact info

**To access data:** The underlying raw reads are in NCBI SRA (SRR accessions listed in preprint supplementary tables). Processed expression matrices may be obtained by contacting the authors at UTS.

---

### 2. ALCOdb — Algal Gene Coexpression Database
**Folder:** `alcodb/`

- **URL:** http://alcodb.jp
- **Paper:** Plant and Cell Physiology 2016 — [PMC4722175](https://pmc.ncbi.nlm.nih.gov/articles/PMC4722175/)
- **Species:** *Chlamydomonas reinhardtii* (172 RNA-seq samples, 15,519 genes) + *Cyanidioschyzon merolae* (red alga, microarray)
- **Method:** Mutual Rank (MR) coexpression; Cytoscape.js network visualization

**Files in folder:**
- `alcodb_info.json` — metadata, species info, Zenodo URLs for all files

**Data on Zenodo:** https://zenodo.org/records/10072283

| File | Size | Description |
|---|---|---|
| `Cre-R1-15-08_GeneExpressionTable.tsv.gz` | 22.4 MB | C. reinhardtii expression table (172 samples) |
| `Cme1_GeneExpressionTable.tsv.zip` | 2.4 MB | C. merolae dataset 1 expression |
| `Cme2_GeneExpressionTable.tsv.zip` | 1.3 MB | C. merolae dataset 2 expression |
| `Cre.v15-08.G15519-S172.quantile.mrgeo.d.zip` | 2.3 GB | Full C. reinhardtii coexpression matrix |
| `Cme1.v14-06.G4586-S75.d.zip` | 214.8 MB | Full C. merolae dataset 1 coexpression |
| `Cme2.v14-06.G6506-S48.d.zip` | 442.2 MB | Full C. merolae dataset 2 coexpression |

> **Note:** Zenodo blocks automated downloads (403). Download manually from https://zenodo.org/records/10072283.

---

### 3. ALGAEFUN / MARACAS — 14-Species Microalgae Web Tool
**Folder:** `algaefun/`

- **URL:** https://greennetwork.us.es/AlgaeFUN/
- **Paper:** BMC Bioinformatics 2022 — [PMC8973887](https://pmc.ncbi.nlm.nih.gov/articles/PMC8973887/)
- **GitHub:** https://github.com/fran-romero-campero/MARACAS
- **Zenodo code:** https://zenodo.org/record/4754516

**14 species across 5 phylogenetic groups:**

| Group | Species |
|---|---|
| Chlorophyceae | *C. reinhardtii*, *V. carteri*, *C. zofingiensis*, *D. salina*, *H. lacustris* |
| Mamiellophyceae | *O. tauri*, *M. pusilla* |
| Stramenopiles | *P. tricornutum*, *N. gaditana*, *E. siliculosus* |
| Charophyceae | *K. nitens*, *C. braunii* |
| Trebouxiophyceae | *C. variabilis*, *A. protothecoides* |

**Features:** RNA-seq and ChIP-seq analysis, coexpression networks, functional enrichment

**Files in folder:**
- `algaefun_info.json` — metadata, species list, GitHub/Zenodo links

**Data access:** Web interface only. Underlying MARACAS database is not separately bulk-downloadable.

---

### 4. NanDeSyn — Nannochloropsis Multi-Omics Database
**Folder:** `nandesyn/`

- **URL:** http://nandesyn.single-cell.cn *(HTTP only — no HTTPS)*
- **Paper:** The Plant Journal 2020 — [DOI:10.1111/tpj.15025](https://doi.org/10.1111/tpj.15025)

**6 Nannochloropsis species:**
- *N. oceanica* IMET1, *N. salina* CCMP1776, *N. gaditana* CCMP526, *N. granulata* CCMP529, *N. limnetica* SAG 18.99, *N. oculata*

**Data types:** Genomics, transcriptomics, proteomics  
**Tools:** BLAST, synteny view, enrichment analysis, metabolic pathways, genome browser  
**No UMAP or dimensionality reduction**

**Files in folder:**
- `nandesyn_info.json` — metadata, species list, tool descriptions

**Data access:** Web interface — individual gene/protein queries. Bulk download availability not confirmed on public-facing pages; contact database administrators.

---

### 5. DiatOmicBase — Diatom Multi-Omics Platform *(newest, 2025)*
**Folder:** `diatomicsbase/`

- **URL:** https://www.diatomicsbase.bio.ens.psl.eu/
- **Paper:** The Plant Journal 2025 — [PMC11910669](https://pmc.ncbi.nlm.nih.gov/articles/PMC11910669/)

| Species | Samples | Studies | Comparisons |
|---|---|---|---|
| *Phaeodactylum tricornutum* | **1,431** | 48 | 266 |
| *Thalassiosira pseudonana* | — | — | — (preliminary) |
| *Pseudo-nitzschia multistriata* | — | — | — (preliminary) |

**Data types:** RNA-Seq, genomics, epigenomics, proteomics  
**Features:** Gene-centered queries, differential expression, cross-study comparison, genome browser

**Files in folder:**
- `diatomicsbase_info.json` — metadata and access instructions
- `Pt_NCBI_genome.gff.gz` (1.4 MB) — *P. tricornutum* genome annotation (GCF_000150955.2) from NCBI RefSeq

**Data access:** Interactive web tool. Raw data available in NCBI/EBI via BioProject accessions listed in the interface. Legacy EST database: https://diatomics.bio.ens.psl.eu/EST/

---

### 6. EBI Expression Atlas — C. reinhardtii Experiments
**Folder:** `expression_atlas/`

- **URL:** https://www.ebi.ac.uk/gxa/home
- **Scope:** 4,562 studies across 67 species total; multiple microalgae experiments

**Downloaded experiments:**

#### E-GEOD-62671 — *C. reinhardtii* Diel RNA-seq (Baseline)
*RNA-seq of Chlamydomonas reinhardtii under diel conditions to identify cycling genes*
- **Samples:** 16 (time points across diel cycle)
- **Technology:** RNA-Seq mRNA

| File | Size | Description |
|---|---|---|
| `E-GEOD-62671-tpms.tsv` | 2.2 MB | TPM expression matrix (all genes × samples) |
| `E-GEOD-62671-fpkms.tsv` | 2.1 MB | FPKM expression matrix |
| `E-GEOD-62671-raw-counts.tsv.undecorated` | 1.3 MB | Raw read counts |
| `E-GEOD-62671-tpms-markers.tsv` | 87 KB | Marker genes ranked by TPM |
| `E-GEOD-62671-fpkms-markers.tsv` | 81 KB | Marker genes ranked by FPKM |
| `E-GEOD-62671.condensed-sdrf.tsv` | 7 KB | Sample metadata |
| `E-GEOD-62671.sdrf.txt` | 10 KB | Full sample annotation |
| `E-GEOD-62671.idf.txt` | 5 KB | Investigation description |

#### E-ENAD-12 — *C. reinhardtii* Baseline Experiment (Differential)
*Chlamydomonas reinhardtii baseline transcriptomics*

| File | Size | Description |
|---|---|---|
| `E-ENAD-12-analytics.tsv` | 1.8 MB | Differential expression analytics (log2FC, p-values) |
| `E-ENAD-12-raw-counts.tsv` | 1.8 MB | Raw read counts |
| `E-ENAD-12-percentile-ranks.tsv` | 519 KB | Gene expression percentile ranks |
| `E-ENAD-12.condensed-sdrf.tsv` | 15 KB | Sample metadata |
| `E-ENAD-12.idf.txt` | 3 KB | Investigation description |

---

### 7. MMETSP — Marine Microbial Eukaryote Transcriptome Sequencing Project
**Folder:** `mmetsp/`

The broadest marine microalgae transcriptome dataset in existence.

- **Paper:** PLOS Biology 2014 — [PMC4068987](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4068987/)
- **Samples:** **678** assembled transcriptomes
- **Species:** **306**
- **Phyla:** **40+**
- **Groups:** prasinophytes, dinoflagellates, diatoms, cryptophytes, red algae, haptophytes, and more

**Files in folder:**
- `mmetsp_info.json` — metadata, access instructions
- `mmetsp_figshare_metadata.json` — Figshare API metadata (file names, sizes, checksums)

**To download full data:**
- **Figshare re-assemblies:** https://figshare.com/articles/dataset/Marine_Microbial_Eukaryotic_Transcriptome_Sequencing_Project_re-assemblies/3840153/3
- **Direct file:** https://ndownloader.figshare.com/files/11058947 (`mmetsp_dib_trinity2.2.0_completeApril2018_figshare.zip`, **7.1 GB**)
- **Raw reads:** NCBI SRA (search "MMETSP" at https://www.ncbi.nlm.nih.gov/sra)
- **iMicrobe:** https://www.imicrobe.us/#/projects/104

> **Note:** Full dataset is 7.1 GB compressed. Not downloaded automatically — retrieve manually from Figshare link above.

---

### 8. PhaeoEpiView — *Phaeodactylum* Epigenome Browser
**Folder:** `phaeoepiview/`

- **URL:** https://phaeoepiview.univ-nantes.fr/
- **Paper:** Scientific Reports 2023 — [PMC10206091](https://pmc.ncbi.nlm.nih.gov/articles/PMC10206091/)
- **Species:** *Phaeodactylum tricornutum* (Phatr3 reference genome)
- **Browser:** JBrowse2

**Data tracks available via browser:**
- Histone modifications (H3K4me3, H3K27me3, etc.)
- DNA methylation
- RNA-seq expression tracks

**Files in folder:**
- `phaeoepiview_info.json` — metadata, access instructions

**Data access:** Interactive genome browser only. Raw ChIP-seq and RNA-seq reads deposited in NCBI GEO (see the paper for accession numbers).

---

### 9. CyanoOmicsDB — Cyanobacteria Transcriptomics & Proteomics
**Folder:** `cyanoomicsdb/`

- **Paper:** Nucleic Acids Research 2022 — [PMC8728175](https://pmc.ncbi.nlm.nih.gov/articles/PMC8728175/)
- **URL:** http://www.cyanoomics.cn/ *(accessibility unconfirmed as of mid-2026)*
- **Primary species:** *Synechocystis* sp. PCC 6803

| Data type | Count |
|---|---|
| Transcriptomic datasets | 56 |
| Primary transcriptomic datasets | 3 |
| Proteomic datasets | 15 |
| Pairwise transcriptome comparisons | 203 |
| Proteome comparisons | 25 |

**Files in folder:**
- `cyanoomicsdb_info.json` — metadata, data counts, alternative access notes

**Data access:** Raw data sourced from NCBI GEO and SRA. Search GEO for *Synechocystis* PCC 6803 RNA-seq datasets at https://www.ncbi.nlm.nih.gov/geo/

---

### 10. PhytoNet — Phytoplankton Coexpression Networks
**Folder:** `phytonet/`

- **URL:** http://www.gene2function.de
- **Paper:** Nucleic Acids Research 2018 — [PMC6030924](https://pmc.ncbi.nlm.nih.gov/articles/PMC6030924/)
- **Parent platform:** PlaNet (plant coexpression networks)

**9 species covered:**

| Microalgae | Cyanobacteria |
|---|---|
| *Chlamydomonas reinhardtii* | *Synechocystis* sp. PCC 6803 |
| *Emiliania huxleyi* | *Nostoc punctiforme* |
| *Phaeodactylum tricornutum* | *Prochlorococcus marinus* |
| *Ectocarpus siliculosus* | *Cyanothece* sp. |
| *Cyanidioschyzon merolae* | |

**Files in folder:**
- `phytonet_info.json` — metadata, species list, features

**Data access:** Web interface only — query-based coexpression network exploration. No bulk download option.

---

### 11. PhycoCosm — JGI Comparative Algal Genomics Portal
**Folder:** `phycocosm/`

- **URL:** https://phycocosm.jgi.doe.gov
- **Paper:** Nucleic Acids Research 2021 — [PMC7779052](https://pmc.ncbi.nlm.nih.gov/articles/PMC7779052/)
- **Genomes:** **136+** algal genomes across the eukaryotic tree of life
- **Groups:** diatoms, green algae, brown algae, red algae, dinoflagellates, and more
- **Data types:** Genome sequences, gene annotations, RNA-seq expression data, protein families

**Files in folder:**
- `phycocosm_info.json` — metadata, access instructions

**Data access:** JGI account required for bulk genome/RNA-seq downloads. Register at https://genome.jgi.doe.gov. Browsing (genome browser, BLAST, gene lookups) is free without login.

---

## What Was and Was Not Downloaded

| Database | Downloaded | Reason if not |
|---|---|---|
| EBI Expression Atlas (E-GEOD-62671) | **Yes** — 10 MB (TPMs, FPKMs, raw counts, metadata) | — |
| EBI Expression Atlas (E-ENAD-12) | **Yes** — analytics, raw counts, percentile ranks | — |
| DiatOmicBase — Pt genome GFF | **Yes** — 1.4 MB (NCBI RefSeq GFF3) | — |
| MMETSP metadata (Figshare API) | **Yes** — JSON | — |
| ALCOdb expression tables | **No** — Zenodo bot protection (403) | Download from zenodo.org/records/10072283 |
| MMETSP full assemblies | **No** — 7.1 GB zip | Download from Figshare (link in mmetsp_info.json) |
| Alganaut processed data | **No** — preprint; web tool uncertain | Contact authors at UTS |
| ALGAEFUN/MARACAS data | **No** — web tool only | Use web interface or GitHub |
| NanDeSyn data | **No** — bulk download unavailable | Use web interface |
| DiatOmicBase expression data | **No** — web tool only | Use interface at diatomicsbase.bio.ens.psl.eu |
| PhaeoEpiView tracks | **No** — JBrowse2 interface only | Use browser; raw data in NCBI GEO |
| CyanoOmicsDB data | **No** — URL unconfirmed | Search NCBI GEO for Synechocystis PCC 6803 |
| PhytoNet networks | **No** — web tool only | Use gene2function.de |
| PhycoCosm genomes | **No** — JGI login required | Register at genome.jgi.doe.gov |

---

## Species Coverage Summary

| Species | Databases covering it |
|---|---|
| *Chlamydomonas reinhardtii* | ALCOdb, ALGAEFUN, PhytoNet, Alganaut, EBI Atlas, PhycoCosm |
| *Phaeodactylum tricornutum* | Alganaut, DiatOmicBase, ALGAEFUN, PhytoNet, PhaeoEpiView, PhycoCosm |
| *Thalassiosira pseudonana* | Alganaut, DiatOmicBase |
| *Nannochloropsis* spp. | NanDeSyn (6 sp.), ALGAEFUN, Alganaut |
| *Emiliania huxleyi* | Alganaut, PhytoNet |
| *Micromonas pusilla* | Alganaut, ALGAEFUN |
| *Synechocystis* PCC 6803 | CyanoOmicsDB, PhytoNet |
| Diatoms (general) | Alganaut, DiatOmicBase, MMETSP, PhaeoEpiView |
| Dinoflagellates | MMETSP |
| Marine microeukaryotes (broad) | MMETSP (678 transcriptomes, 40+ phyla) |

---

## Quick-start Python Snippets

```python
import pandas as pd

# Load C. reinhardtii diel TPM expression (EBI Atlas E-GEOD-62671)
tpm = pd.read_csv(
    "expression_atlas/E-GEOD-62671/E-GEOD-62671-tpms.tsv",
    sep="\t", comment="#", index_col=0
)

# Load C. reinhardtii differential expression analytics (EBI Atlas E-ENAD-12)
de = pd.read_csv(
    "expression_atlas/E-ENAD-12/E-ENAD-12-analytics.tsv",
    sep="\t", comment="#"
)

# Load sample metadata
meta = pd.read_csv(
    "expression_atlas/E-GEOD-62671/E-GEOD-62671.condensed-sdrf.tsv",
    sep="\t"
)

# Read Pt genome annotation
import gzip
with gzip.open("diatomicsbase/Pt_NCBI_genome.gff.gz", "rt") as f:
    for line in f:
        if not line.startswith("#"):
            break  # first feature line

# Load MMETSP Figshare metadata
import json
with open("mmetsp/mmetsp_figshare_metadata.json") as f:
    mmetsp_meta = json.load(f)
```

---

## Citation / Attribution

Data originates from the following publications. Please cite appropriately:

| Database | Citation |
|---|---|
| Alganaut | Ashworth & Ralph, bioRxiv 2018, doi:10.1101/403063 |
| ALCOdb | Okamura et al., Plant Cell Physiol. 2015, PMC4722175 |
| ALGAEFUN/MARACAS | Romero-Campero et al., BMC Bioinformatics 2022, PMC8973887 |
| NanDeSyn | Wei et al., Plant Journal 2020, doi:10.1111/tpj.15025 |
| DiatOmicBase | Botebol et al., Plant Journal 2025, PMC11910669 |
| PhaeoEpiView | Scientific Reports 2023, PMC10206091 |
| CyanoOmicsDB | Nucleic Acids Research 2022, PMC8728175 |
| MMETSP | Keeling et al., PLOS Biology 2014, PMC4068987 |
| PhytoNet | Nucleic Acids Research 2018, PMC6030924 |
| PhycoCosm | Grigoriev et al., Nucleic Acids Research 2021 |
| EBI Expression Atlas | Papatheodorou et al., Nucleic Acids Research 2020 |

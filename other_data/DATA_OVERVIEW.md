# Plant Atlas Data Overview

## Source

All data was downloaded from the **Mutwil Lab Plant Atlas Viewer**, a publicly accessible tool hosted on Hugging Face Spaces:

- **Web App:** https://mutwil-plant-atlas-viewer.hf.space
- **HuggingFace Space:** https://huggingface.co/spaces/mutwil/plant-atlas-viewer
- **Atlas Version:** v9.0.0 (DANN v9 sweep13 encoder re-embed)

The backend is a FastAPI application serving data originally derived from the **DANN (Deep Atlas of Network Neighborhoods)** pipeline, which aggregates and embeds publicly available plant RNA-seq studies into a unified 2D UMAP space.

---

## Dataset at a Glance

| Property | Value |
|---|---|
| Total RNA-seq samples | 629,983 |
| Number of traits | 57 |
| Number of plant species covered | Multiple (Arabidopsis, rice, maize, wheat, soybean, barley, tomato, etc.) |
| Dimensionality reduction | UMAP (2D) |
| Gene family system | eggNOG Orthologous Groups (OGs) |
| Expression unit | log1p(TPM) |
| Total data size | ~260 MB (downloaded) |

---

## Data Categories

### 1. UMAP Coordinates & Sample Metadata

These files describe where each of the 629,983 RNA-seq samples sits in the 2D UMAP embedding, and what biological context they come from.

| File | Format | Description |
|---|---|---|
| `points.arrow` | Arrow IPC | UMAP x/y coordinates + sample index for all samples |
| `meta.arrow` | Arrow IPC | Per-sample metadata: species, plant ontology (PO) term, study ID, clade, read alignment counts |
| `atlas.tsv` | TSV | Flat-file export of all samples: run_accession, species, po_term, study_id, UMAP x, UMAP y |

**Key columns in `atlas.tsv` / `meta.arrow`:**
- `run_accession` — SRA/ENA accession ID for the RNA-seq run
- `species` — Latin species name
- `po_term` — Plant Ontology term describing the sampled tissue/organ
- `study_id` — Originating study accession
- `clade` — Taxonomic clade grouping
- `x`, `y` — UMAP 2D coordinates

---

### 2. Trait / Phenotype Masks

57 evolutionary-developmental (evo-devo) traits are annotated across samples. Each trait is a boolean mask indicating which samples belong to that phenotypic group.

| File | Format | Description |
|---|---|---|
| `traits.arrow` | Arrow IPC | Boolean mask table — one column per trait, one row per sample |
| `trait_index.json` | JSON | Trait metadata: trait ID, display name, sample count per trait |
| `trait_panels.tsv` | TSV | All trait marker gene families (top markers + unique markers per trait) |

**Example traits:** mycorrhiza, nitrogen fixation, C4 photosynthesis, carnivorous plants, parasitic plants, succulence, aquatic adaptation, etc.

---

### 3. Gene Family (Orthologous Group) Expression

Expression data is aggregated at the level of eggNOG Orthologous Groups (OGs) rather than individual genes, enabling cross-species comparison.

| File | Format | Description |
|---|---|---|
| `og_cluster_means_16.tsv` | TSV | Mean log1p(TPM) per OG × 16 UMAP clusters |
| `og_cluster_means.tsv` | TSV | Mean log1p(TPM) per OG × 64 UMAP clusters |
| `og_cluster_means_256.tsv` | TSV | Mean log1p(TPM) per OG × 256 UMAP clusters |
| `og_annotations.json` | JSON | OG descriptions, COG functional category assignments |
| `og_vocab.json` | JSON | OG ID ↔ integer index vocabulary |
| `og_profile.json` | JSON | Cross-context expression profile per OG (presence across traits and PO terms) |

**Row format in cluster means TSVs:** `og_id | c00 | c01 | ... | cN` where each column is a UMAP cluster.

---

### 4. Organ × Clade Expression Heatmap

A precomputed matrix of mean expression per organ type and per taxonomic clade, enabling high-level cross-species organ comparison.

| File | Format | Description |
|---|---|---|
| `oc_heatmap.npz` | NumPy compressed | Organ × clade mean log1p(TPM) for all OGs; axes stored alongside data |

---

### 5. Plant Ontology (PO) Panels

Plant Ontology terms describe sampled tissues (e.g., leaf, root, seed, pollen). Marker gene families enriched in each PO-annotated tissue cluster are precomputed.

| File | Format | Description |
|---|---|---|
| `po_panels.json` | JSON | PO-enriched OG markers with differential expression stats per PO term |
| `po_panels.tsv` | TSV | Flat export of all PO-enriched families with DE statistics |
| `po_top_level_map.json` | JSON | Hierarchy map of PO terms to their top-level category |
| `po_bucket_counts.json` | JSON | Sample counts per PO top-level bucket |

---

### 6. Marker Gene Panels

Precomputed lists of the most discriminating gene families for each trait and tissue type, derived from differential expression analysis.

| File | Format | Description |
|---|---|---|
| `marker_panels.json` | JSON | Top-30 trait-unique OG markers per trait |
| `top_panels.json` | JSON | Top OGs ranked by log2FC per trait |
| `canonical_panels.json` | JSON | Curated "Try this" example gene sets (one per trait) |
| `canonical_og_sets.json` | JSON | The actual OG members of each canonical panel |
| `tissue_matched_panels.json` | JSON | Tissue-paired DE panels: POS_genera × tissue vs NEG_genera × same tissue |

---

### 7. Coexpression Network (TEA-GCN)

A large-scale gene coexpression network built using the TEA-GCN (Tissue-Enrichment-Aware Gene Co-expression Network) framework.

| File | Format | Description |
|---|---|---|
| `teagcn_topN.json.gz` | Gzipped JSON | Top-N coexpressed OG neighbors per OG, with ensemble Pearson correlation scores |
| `og_breadth.json.gz` | Gzipped JSON | Species/order/organ prevalence per OG — how broadly each gene family is expressed |
| `edge_clusters.json.gz` | Gzipped JSON | Condition-specificity per coexpression edge: which UMAP partitions each edge is active in |

---

### 8. UMAP Partition & Cluster Annotations

The 2D UMAP space is divided into partitions and clusters, each annotated with dominant organs, clades, and gene families.

| File | Format | Description |
|---|---|---|
| `cluster_annot.json` | JSON | Annotation per cluster: dominant organs, taxonomic groups, top gene families |
| `partition_annot.json` | JSON | Full enrichment statistics for all UMAP partitions |

---

### 9. Per-Species Gene ID → OG Mapping

Lookup tables to convert species-specific gene IDs to eggNOG OG identifiers, enabling users to query with known gene names.

| File | Format | Species |
|---|---|---|
| `id_to_og_arabidopsis.parquet` | Parquet | Arabidopsis thaliana |
| `id_to_og_barley.parquet` | Parquet | Hordeum vulgare (barley) |
| `id_to_og_brachy.parquet` | Parquet | Brachypodium distachyon |
| `id_to_og_glycine.parquet` | Parquet | Glycine max (soybean) |
| `id_to_og_maize.parquet` | Parquet | Zea mays (maize) |
| `id_to_og_medicago.parquet` | Parquet | Medicago truncatula |
| `id_to_og_oryza.parquet` | Parquet | Oryza sativa (rice) |
| `id_to_og_populus.parquet` | Parquet | Populus trichocarpa |
| `id_to_og_sorghum.parquet` | Parquet | Sorghum bicolor |
| `id_to_og_tomato.parquet` | Parquet | Solanum lycopersicum (tomato) |
| `id_to_og_wheat.parquet` | Parquet | Triticum aestivum (wheat) |

---

### 10. Visualization Assets & Versioning

| File | Format | Description |
|---|---|---|
| `fig1_organ_purity.png` | PNG | Figure 1 organ purity overlay image (1024×1024 RGBA) |
| `fig1_organ_purity_grid.arrow` | Arrow IPC | Grid data backing the purity figure |
| `fig1_organ_purity_bounds.json` | JSON | Coordinate bounds for the purity overlay |
| `fig1_organ_purity_summary.json` | JSON | Summary statistics for the purity figure |
| `family_palette.json` | JSON | Hex color assignments for top gene families and PO buckets |
| `ATLAS_VERSION.json` | JSON | Version stamp (v9.0.0) + SHA256 hashes for all data artifacts |

---

## Data Formats Used

| Format | Library to read | Used for |
|---|---|---|
| Arrow IPC (`.arrow`) | `pyarrow`, `pandas` | Large tabular data (samples, metadata, coordinates) |
| Parquet (`.parquet`) | `pyarrow`, `pandas` | Gene ID lookup tables |
| TSV (`.tsv`) | `pandas` | Expression matrices, flat bulk exports |
| JSON (`.json`) | `json` (stdlib) | Annotations, panel definitions, metadata |
| Gzipped JSON (`.json.gz`) | `gzip` + `json` | Large network/graph data |
| NumPy compressed (`.npz`) | `numpy` | Organ × clade expression matrix |
| PNG (`.png`) | `PIL`, `matplotlib` | Visualization figure |

### Quick-start Python snippets

```python
import pyarrow.feather as feather
import pandas as pd

# Load UMAP coordinates
points = feather.read_table("points.arrow").to_pandas()

# Load sample metadata
meta = feather.read_table("meta.arrow").to_pandas()

# Load trait masks
traits = feather.read_table("traits.arrow").to_pandas()

# Load atlas flat file
atlas = pd.read_csv("atlas.tsv", sep="\t")

# Load gene family expression (64 clusters)
og_expr = pd.read_csv("og_cluster_means.tsv", sep="\t", index_col=0)

# Load a species gene→OG map
og_map = pd.read_parquet("id_to_og_arabidopsis.parquet")
```

---

## Citation / Attribution

Data originates from the **Mutwil Lab** (Nanyang Technological University). If using this data in research, refer to the original publications associated with the DANN (Deep Atlas of Network Neighborhoods) framework and the Plant Atlas project.

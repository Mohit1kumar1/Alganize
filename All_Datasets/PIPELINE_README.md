# Transcriptomic Data Integration Pipeline

Run the steps in order. Within each section, species can be processed independently.

---

## STEP 1 — Build annotation files (Python, run from Annotation_file/)

```bash
cd Annotation_file/

# ── EXISTING ALGAE ────────────────────────────────────────────────────────────

# Chromochloris zofingiensis — already built (genes_with_pathway.tsv)

# Chlorella vulgaris (reads GSE162916_Annotation_of_unigene.txt — 80 MB)
python build_chlorella_vulgaris_annotation.py
# Output: genes_with_pathway_chlorella_vulgaris.tsv

# Chlamydomonas reinhardtii (auto-downloads NCBI FTP or JGI v5.6)
python build_chlamydomonas_annotation.py
# Output: genes_with_pathway_chlamydomonas.tsv

# Arabidopsis thaliana (auto-downloads ~1.4 MB from NCBI FTP)
python build_arabidopsis_annotation.py
# Output: genes_with_pathway_arabidopsis.tsv

# Lolium perenne / arundinaceum (reads GSE141654 Excel + GSE119957 TAR)
python build_lolium_annotation.py
# Output: genes_with_pathway_lolium.tsv

# ── NEW ALGAE ─────────────────────────────────────────────────────────────────

# Nannochloropsis oceanica IMET1 (downloads RefSeq feature_table ~5 MB)
python build_nannochloropsis_annotation.py
# Output: genes_with_pathway_nannochloropsis.tsv

# Haematococcus lacustris (downloads NCBI RefSeq feature_table or gene API)
python build_haematococcus_annotation.py
# Output: genes_with_pathway_haematococcus.tsv

# Dunaliella salina (downloads NCBI RefSeq feature_table or gene API)
python build_dunaliella_annotation.py
# Output: genes_with_pathway_dunaliella.tsv

# ── NEW TURF GRASS ────────────────────────────────────────────────────────────

# Cynodon dactylon (bermudagrass — de-novo transcriptome)
# Place GSE140362_Transcriptome_bermuda.fa.gz in All_Datasets/GSE140362_Cynodon/ first
python build_cynodon_annotation.py
# Output: genes_with_pathway_cynodon.tsv
# NOTE: annotation richness depends on BLAST descriptions in FASTA headers

# ── NEW CROPS ─────────────────────────────────────────────────────────────────

# Oryza sativa (auto-downloads Oryza_sativa.gene_info.gz ~1.2 MB from NCBI FTP)
python build_oryza_sativa_annotation.py
# Output: genes_with_pathway_oryza_sativa.tsv

# Hordeum vulgare (streams All_Plants.gene_info.gz ~189 MB from NCBI FTP — takes ~5 min)
python build_hordeum_vulgare_annotation.py
# Output: genes_with_pathway_hordeum_vulgare.tsv
# NOTE: this annotation is also used for Triticum aestivum (wheat) as a close relative
```

---

## STEP 2 — Download GEO data files

Download supplementary files from NCBI GEO before running R scripts.
Place each file in the corresponding All_Datasets/{GSE}/ folder.

| GEO Accession | Species | File to download |
|---------------|---------|-----------------|
| GSE317028 | C. zofingiensis | GSE317028_gene_expression.tsv.gz |
| GSE276249 | C. reinhardtii | GSE276249_gene_expression_fpkm.csv.gz |
| GSE162916 | C. vulgaris | GSE162916_merged_fpkm.txt.gz |
| GSE119957 | L. arundinaceum | GSE119957_RAW.tar (then extract) |
| **GSE225079** | N. oceanica | GSE225079_C0-vs-N1.total.DEG.xls.gz + _C0-vs-N2 + _N1-vs-N2 |
| **GSE161337** | H. lacustris | GSE161337_gene_expression.tsv.gz |
| **GSE74466** | D. salina | GSE74466_0118_Ds_Exp_Values_Matrix.txt.gz |
| **GSE140362** | C. dactylon | GSE140362_readcount-bermudagrass_abiotic_stress_7d.xls.gz |
| **GSE136182** | C. dactylon | GSE136182_readcount-bermudagrass-heat.xlsx |
| **GSE225255** | H. vulgare | GSE225255_1_genes_fpkm_expression.txt.gz |
| **GSE294406** | T. aestivum | GSE294406_FPKM_all_treatments.xlsx |
| **GSE315654** | O. sativa | GSE315654_Processed_data.txt.gz |

GEO FTP base URL: `https://ftp.ncbi.nlm.nih.gov/geo/series/`
Example: `https://ftp.ncbi.nlm.nih.gov/geo/series/GSE225nnn/GSE225079/suppl/`

---

## STEP 3 — Process datasets (R, run from each dataset folder in RStudio)

### EXISTING DATASETS (pending execution)

```r
All_Datasets/GSE317028_ChrZ/process.R          # -> Data_algae/GSE317028/
All_Datasets/GSE276249_Chlamyd/process.R       # -> Data_algae/GSE276249/
All_Datasets/GSE162916_Chlorella/process_v2.R  # -> Data_algae/GSE162916/ (improved v2)
All_Datasets/GSE119957_Lolium/process.R        # -> data_plant/GSE119957/
```

### NEW ALGAE DATASETS

```r
All_Datasets/GSE225079_NannoN/process.R    # N. oceanica N deprivation -> Data_algae/GSE225079/
All_Datasets/GSE161337_Haemato/process.R   # H. lacustris astaxanthin  -> Data_algae/GSE161337/
All_Datasets/GSE74466_Dunaliella/process.R # D. salina salinity        -> Data_algae/GSE74466/
```

### NEW TURF GRASS DATASETS

```r
All_Datasets/GSE140362_Cynodon/process.R      # Bermudagrass 4-stress  -> data_plant/GSE140362/
All_Datasets/GSE136182_CynodonHeat/process.R  # Bermudagrass heat      -> data_plant/GSE136182/
```

### NEW CROP DATASETS

```r
All_Datasets/GSE225255_Barley/process.R   # Barley drought     -> data_plant/GSE225255/
All_Datasets/GSE294406_Wheat/process.R    # Wheat 8-treatments -> data_plant/GSE294406/
All_Datasets/GSE315654_Rice/process.R     # Rice drought       -> data_plant/GSE315654/
```

---

## STEP 4 — Registry files (already updated)

| Registry | Datasets registered |
|----------|---------------------|
| `Data_algae/registry.json` | GSE92514, GSE317028, GSE125419, GSE162916, GSE276249, **GSE225079**, **GSE161337**, **GSE74466** |
| `data_plant/registry.json` | GSE289042, GSE119957, GSE141654, **GSE140362**, **GSE136182**, **GSE225255**, **GSE294406**, **GSE315654** |

Bold = newly added in this session.

---

## FULL DATASET SUMMARY

### Algae (Data_algae/)

| GSE | Species | Stress | # Samples | Data type |
|-----|---------|--------|-----------|-----------|
| GSE92514 | *Chromochloris zofingiensis* | High light (0.5–12h) | 30 | Cuffdiff |
| GSE317028 | *Chromochloris zofingiensis* | HL/LL × N conc. | 12 | FPKM (t-test) |
| GSE125419 | *Chromochloris zofingiensis* | Salt stress | 6 | FPKM (t-test) |
| GSE162916 | *Chlorella vulgaris* | Salt + PEG (osmotic) | 10 | FPKM (t-test) |
| GSE276249 | *Chlamydomonas reinhardtii* | Nutrient starvation | 12 | FPKM (t-test) |
| **GSE225079** | ***Nannochloropsis oceanica*** | **N deprivation 1–2d** | 6 | **Pre-computed DEG** |
| **GSE161337** | ***Haematococcus lacustris*** | **N limitation / astaxanthin** | 4 | **Counts (DESeq2)** |
| **GSE74466** | ***Dunaliella salina*** | **Salinity transition** | 18 | **RPKM (t-test)** |

### Plants (data_plant/)

| GSE | Species | Stress | # Samples | Data type |
|-----|---------|--------|-----------|-----------|
| GSE289042 | *Arabidopsis thaliana* | Drought (osmotic) | 6 | Counts (DESeq2) |
| GSE119957 | *Lolium arundinaceum* | Salt stress | 9 | FPKM (t-test) |
| GSE141654 | *Lolium perenne* | (various) | - | Excel annotation |
| **GSE140362** | ***Cynodon dactylon*** | **Drought/Salt/Heat/Submer (7d)** | 10 | **Counts (DESeq2)** |
| **GSE136182** | ***Cynodon dactylon*** | **Heat 2h/12h (42°C)** | 6 | **Counts (DESeq2)** |
| **GSE225255** | ***Hordeum vulgare*** | **Drought (7d), 2 genotypes** | 12 | **FPKM (t-test)** |
| **GSE294406** | ***Triticum aestivum*** | **8 treatments: D/T/CO2/combos** | 24 | **FPKM (t-test)** |
| **GSE315654** | ***Oryza sativa*** | **Drought (grain filling), hybrid** | 18 | **Counts or FPKM** |

---

## NOTES ON STATISTICS

| Approach | Used when | Caveats |
|----------|-----------|---------|
| **DESeq2** | Integer count matrix available | Gold standard; controls FDR properly |
| **FPKM t-test** | Only FPKM/RPKM values provided | n=3 replicates → low power; padj indicative only |
| **Pre-computed DEG** | Original authors provided fold-change tables | log2FC values trusted; padj from original pipeline |

For publication-quality results on FPKM datasets, obtain raw FASTQ and re-run with DESeq2.

---

## ANNOTATION BUILD TIMES (approximate)

| Builder | Download size | Build time |
|---------|---------------|------------|
| Arabidopsis | 1.4 MB | 30 sec |
| Oryza sativa | 1.2 MB | 30 sec |
| Nannochloropsis | ~5 MB | 1 min |
| Haematococcus | ~5 MB | 1–2 min |
| Dunaliella | ~3 MB | 1 min |
| Cynodon | ~14 MB FASTA | 2 min |
| Hordeum vulgare | 189 MB stream | **5–8 min** |
| Chlorella vulgaris | 80 MB (local) | 3 min |
| Chlamydomonas | 339 KB | 30 sec |
| Lolium | Excel files (local) | 1 min |
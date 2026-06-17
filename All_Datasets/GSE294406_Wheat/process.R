# ============================================================
# GSE294406 — Triticum aestivum (bread wheat cv. Alana)
# 8 treatment conditions at GS61 (beginning of anthesis):
#   Control, Drought(D), Temperature(T), CO2(C),
#   C+T, T+D, C+D, C+T+D (triple stress)
# 3 biological replicates per treatment = 24 samples total
#
# Download required (place in this folder before running):
#   https://ftp.ncbi.nlm.nih.gov/geo/series/GSE294nnn/GSE294406/suppl/
#     GSE294406_FPKM_all_treatments.xlsx   (25.4 MB)
#
# Data type: FPKM → log2FC + Welch t-test + BH correction
#
# Contrasts (all vs Control):
#   Drought_vs_Control
#   Heat_vs_Control
#   CO2_vs_Control
#   Heat_Drought_vs_Control
#   CO2_Heat_vs_Control
#   CO2_Drought_vs_Control
#   TripleStress_vs_Control
#
# Outputs: log2fc.tsv + meta.json -> data_plant/GSE294406/
# Run from: All_Datasets/GSE294406_Wheat/
# ============================================================

library(dplyr)
library(jsonlite)

setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

FPKM_FILE  <- "GSE294406_FPKM_all_treatments.xlsx"
ANNOT_FILE <- "../../Annotation_file/genes_with_pathway_hordeum_vulgare.tsv"
# Note: wheat annotation — if genes_with_pathway_wheat.tsv exists, use that;
# otherwise Hordeum vulgare annotation is used as a close relative
WHEAT_ANNOT <- "../../Annotation_file/genes_with_pathway_wheat.tsv"
OUT_TSV     <- "log2fc.tsv"
OUT_META    <- "meta.json"
TARGET_DIR  <- "../../data_plant/GSE294406"

PSEUDO <- 0.01

TARGET_PATHWAYS <- c(
  "Proline","Glycine_Betaine","Beta_Carotene","Lutein","Carotenoid","ABA","IAA",
  "Gibberellin_GA3","Omega3_Fatty_Acid","Omega6_Fatty_Acid","Vitamin_E_Tocopherol",
  "Vitamin_C_Ascorbate","Vitamin_B1_Thiamine","Vitamin_B2_Riboflavin",
  "Vitamin_B6_Pyridoxine","Folate","Biotin","Cytokinin","Ethylene","Brassinosteroid",
  "Jasmonate_JA","Salicylate_SA","Strigolactone","Trehalose","Inositol",
  "Fatty_Acid","Wax_Cutin","Cellulose","Starch","Sucrose","Glycolysis",
  "Calvin_Cycle","TCA_Cycle","Pentose_Phosphate","Purine","Pyrimidine",
  "Nitrogen_Assimilation","Chlorophyll","Photosynthesis","Flavonoid","Terpenoid",
  "Anthocyanin","Lignin","Glucosinolate","Protein_Kinase_Signalling",
  "MAPK_Signalling","ROS_Scavenging","tRNA_Aminoacylation","Translation",
  "Transcription","RNA_Processing","Ubiquitin_Proteasome","Chaperone",
  "Phospholipid_Biosynthesis","Glutathione_Metabolism",
  "Glycine","Tryptophan","Leucine","Valine","Isoleucine","Serine","Alanine",
  "Phenylalanine","Tyrosine","Lysine","Methionine","Cysteine","Histidine",
  "Arginine","Aspartate","Glutamate","Asparagine","Glutamine","Threonine"
)

# ── 1. Load FPKM data ─────────────────────────────────────────────────────────
cat("Reading FPKM Excel:", FPKM_FILE, "\n")
if (!file.exists(FPKM_FILE))
  stop(paste("Download from GEO:\nhttps://ftp.ncbi.nlm.nih.gov/geo/series/",
             "GSE294nnn/GSE294406/suppl/GSE294406_FPKM_all_treatments.xlsx"))

if (!requireNamespace("readxl", quietly = TRUE))
  stop("Install readxl:  install.packages('readxl')")

fpkm_raw <- readxl::read_excel(FPKM_FILE) |> as.data.frame()

# First column is gene ID
rownames(fpkm_raw) <- fpkm_raw[[1]]
fpkm <- fpkm_raw[, -1]

cat("Dimensions:", nrow(fpkm), "x", ncol(fpkm), "\n")
cat("Columns:", paste(colnames(fpkm), collapse = ", "), "\n")

# ── 2. Sample group detection ─────────────────────────────────────────────────
cols <- colnames(fpkm)
# Actual column naming: CTR=control, eT=elevated Temp, eC=elevated CO2, D=Drought
# CT=CO2+Temp, CD=CO2+Drought, TD=Temp+Drought, CTD=CO2+Temp+Drought
ctrl_cols <- cols[grepl("^CTR_|ctrl|control|CK|^C_[0-9]|^CK[0-9]", cols, ignore.case = TRUE)]
d_cols    <- cols[grepl("^D_|^D[0-9]|_D[0-9]|Drought[^_]", cols, ignore.case = TRUE) &
                  !grepl("^CD|^CTD|^TD", cols, ignore.case = TRUE)]
t_cols    <- cols[grepl("^eT_|^T[0-9]|_T[0-9]|Temp[^_]|Heat[^_]", cols, ignore.case = TRUE) &
                  !grepl("^CT|^CTD|^TD", cols, ignore.case = TRUE)]
c_cols    <- cols[grepl("^eC_|^CO2[0-9]|CO2_", cols, ignore.case = TRUE) &
                  !grepl("^CT|^CD|^CTD", cols, ignore.case = TRUE)]
td_cols   <- cols[grepl("^TD[0-9]|^TD_|T_D|Drought.*Heat|Heat.*Drought", cols, ignore.case = TRUE) &
                  !grepl("^CTD", cols, ignore.case = TRUE)]
ct_cols   <- cols[grepl("^CT_|^CT[0-9]|C_T|CO2.*Temp|CO2.*Heat", cols, ignore.case = TRUE) &
                  !grepl("^CTD", cols, ignore.case = TRUE)]
cd_cols   <- cols[grepl("^CD[0-9]|^CD_|C_D|CO2.*Drought", cols, ignore.case = TRUE) &
                  !grepl("^CTD", cols, ignore.case = TRUE)]
ctd_cols  <- cols[grepl("^CTD_|^CTD[0-9]|C_T_D|triple|Triple", cols, ignore.case = TRUE)]

cat("Control:", paste(ctrl_cols, collapse=", "), "\n")
cat("Drought:", paste(d_cols,    collapse=", "), "\n")
cat("Heat:   ", paste(t_cols,    collapse=", "), "\n")
cat("CO2:    ", paste(c_cols,    collapse=", "), "\n")
cat("T+D:    ", paste(td_cols,   collapse=", "), "\n")
cat("C+T:    ", paste(ct_cols,   collapse=", "), "\n")
cat("C+D:    ", paste(cd_cols,   collapse=", "), "\n")
cat("C+T+D:  ", paste(ctd_cols,  collapse=", "), "\n")

if (length(ctrl_cols) == 0)
  stop("Cannot detect control columns. Print colnames(fpkm) and adjust patterns above.")

# ── 3. Contrast function ──────────────────────────────────────────────────────
calc_contrast <- function(mat, cols_a, cols_b, label) {
  if (length(cols_a) == 0) return(NULL)
  a   <- mat[, cols_a, drop = FALSE]
  b   <- mat[, cols_b, drop = FALSE]
  lfc <- log2((rowMeans(a) + PSEUDO) / (rowMeans(b) + PSEUDO))
  pv  <- sapply(seq_len(nrow(mat)), function(i) {
    ai <- as.numeric(a[i, ]); bi <- as.numeric(b[i, ])
    if (sum(ai) + sum(bi) == 0) return(NA_real_)
    tryCatch(t.test(ai, bi, var.equal = FALSE)$p.value, error = function(e) NA_real_)
  })
  result <- data.frame(GeneID = rownames(mat), lfc = round(lfc, 4),
                       padj = round(p.adjust(pv, "BH"), 6),
                       stringsAsFactors = FALSE)
  colnames(result)[2] <- paste0(label, "_log2FC")
  colnames(result)[3] <- paste0(label, "_padj")
  result
}

cat("\nCalculating contrasts ...\n")

treatment_map <- list(
  list(cols = d_cols,   label = "Drought_vs_Control",       name = "Drought vs Control"),
  list(cols = t_cols,   label = "Heat_vs_Control",           name = "Heat (31°C) vs Control"),
  list(cols = c_cols,   label = "CO2_vs_Control",            name = "Elevated CO2 vs Control"),
  list(cols = td_cols,  label = "HeatDrought_vs_Control",    name = "Heat+Drought vs Control"),
  list(cols = ct_cols,  label = "CO2Heat_vs_Control",        name = "CO2+Heat vs Control"),
  list(cols = cd_cols,  label = "CO2Drought_vs_Control",     name = "CO2+Drought vs Control"),
  list(cols = ctd_cols, label = "TripleStress_vs_Control",   name = "Triple (CO2+Heat+Drought) vs Control")
)

meta_contrasts <- list()
meta_desc      <- list()
desc_map <- c(
  Drought_vs_Control      = "log2(drought / control) — water stress at GS61",
  Heat_vs_Control         = "log2(elevated temperature 31°C / control) at GS61",
  CO2_vs_Control          = "log2(elevated CO2 700 ppm / control) at GS61",
  HeatDrought_vs_Control  = "log2(combined heat+drought / control) at GS61",
  CO2Heat_vs_Control      = "log2(CO2+heat / control) at GS61",
  CO2Drought_vs_Control   = "log2(CO2+drought / control) at GS61",
  TripleStress_vs_Control = "log2(CO2+heat+drought triple stress / control) at GS61"
)

contrasts_list <- list()
for (tm in treatment_map) {
  res <- calc_contrast(fpkm, tm$cols, ctrl_cols, tm$label)
  if (!is.null(res)) {
    contrasts_list <- c(contrasts_list, list(res))
    meta_contrasts[[tm$name]] <- tm$label
    meta_desc[[tm$label]]     <- desc_map[[tm$label]]
  }
}

if (length(contrasts_list) == 0)
  stop("No treatment contrasts computed. Check column name patterns.")

all_fc <- Reduce(function(a, b) left_join(a, b, by = "GeneID"), contrasts_list)
cat("Contrasts computed:", length(contrasts_list), "\n")

# ── 4. Load annotation and fuzzy-match across IWGSC assembly versions ─────────
# Data uses IWGSC v2 (TraesCS1A02G000100); annotation may use v3 (03G format).
# Fuzzy-match: strip version number to get chr+gene_num key.
# Format: TraesCS + chr(e.g."1A") + [0-9]{2}G + gene_number
strip_version <- function(id) {
  # "TraesCS1A02G000100" → "TraesCS1A_000100"
  gsub("^(Traes[A-Z]+[A-Z0-9]+[A-Za-z]+)[0-9]{2}G([0-9]+).*$", "\\1_\\2", id, perl=TRUE)
}

annot_file <- if (file.exists(WHEAT_ANNOT)) WHEAT_ANNOT else ANNOT_FILE
cat("\nLoading annotation:", annot_file, "\n")
if (!file.exists(annot_file))
  stop("Run: python Annotation_file/build_triticum_annotation.py")
annot <- read.delim(annot_file, stringsAsFactors = FALSE)
cat("Annotation rows:", nrow(annot), "\n")

# Add fuzzy key to annotation
annot$key <- strip_version(annot$GeneID)
# Add fuzzy key to contrast output
all_fc$key <- strip_version(all_fc$GeneID)

exact_matches  <- sum(all_fc$GeneID %in% annot$GeneID)
fuzzy_matches  <- sum(all_fc$key %in% annot$key)
cat("Exact GeneID matches:", exact_matches, "\n")
cat("Fuzzy (version-stripped) matches:", fuzzy_matches, "\n")

# Join: try exact first, fall back to fuzzy
if (exact_matches > 0) {
  merged_base <- all_fc |>
    left_join(annot |> select(GeneID, Symbol, Description, Pathway), by = "GeneID")
} else {
  merged_base <- all_fc |>
    left_join(annot |> select(key, Symbol, Description, Pathway), by = "key") |>
    mutate(GeneID = all_fc$GeneID)
}

# ── 5. Merge and filter ───────────────────────────────────────────────────────
merged <- merged_base |>
  filter(Pathway %in% TARGET_PATHWAYS) |>
  select(Pathway, GeneID, Symbol, Description,
         setdiff(names(merged_base), c("GeneID","Symbol","Description","Pathway","key")))

cat("Annotated genes:", nrow(merged), "| Pathways:", length(unique(merged$Pathway)), "\n")
if (nrow(merged) > 0) print(sort(table(merged$Pathway), decreasing = TRUE)[1:20])

# ── 6. Save ───────────────────────────────────────────────────────────────────
write.table(merged, file = OUT_TSV, sep = "\t", quote = FALSE, row.names = FALSE)
cat("Saved:", OUT_TSV, "\n")

meta <- list(
  dataset_id         = "GSE294406",
  species            = "Triticum aestivum",
  species_details    = "Winter bread wheat cv. Alana; 8 treatments including single/combined drought, heat (31°C), and elevated CO2 (700 ppm); GS61 flag leaves; 3 biological replicates",
  geo_link           = "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE294406",
  technique          = "RNA-seq · FPKM · log2FC · Welch t-test + BH correction",
  induction_type     = "Multi-stress (drought, heat, CO2)",
  induction_details  = "8-condition factorial: single stresses (D, T, C) and combinations (C+T, T+D, C+D, C+T+D) vs control at GS61",
  pathways           = as.list(sort(unique(merged$Pathway))),
  contrasts          = meta_contrasts,
  contrast_descriptions = meta_desc
)
write(toJSON(meta, pretty = TRUE, auto_unbox = TRUE), file = OUT_META)
cat("Saved:", OUT_META, "\n")

if (!dir.exists(TARGET_DIR)) dir.create(TARGET_DIR, recursive = TRUE)
file.copy(OUT_TSV,  file.path(TARGET_DIR, "log2fc.tsv"),  overwrite = TRUE)
file.copy(OUT_META, file.path(TARGET_DIR, "meta.json"),   overwrite = TRUE)
cat("Copied to:", TARGET_DIR, "\n")
cat("Done. Update data_plant/registry.json to include GSE294406.\n")
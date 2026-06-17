# ============================================================
# GSE317028 — Chromochloris zofingiensis
# High light vs Low light × N concentration time-course
# Expression data: RPKM/FPKM (12 samples, 3 replicates each)
#   HL_1mMNO3   = high light,  1 mM nitrate (3 reps)
#   HL_10mMNO3  = high light, 10 mM nitrate (3 reps)
#   LL_1mMNO3   = low  light,  1 mM nitrate (3 reps)
#   LL_10mMNO3  = low  light, 10 mM nitrate (3 reps)
#
# Contrasts:
#   HL_vs_LL_1mM    — light effect under low nitrogen
#   HL_vs_LL_10mM   — light effect under high nitrogen
#   HighN_vs_LowN_HL — nitrogen effect under high light
#   HighN_vs_LowN_LL — nitrogen effect under low light
#
# Uses the existing ChrZ genes_with_pathway.tsv (no new annotation needed)
#
# Outputs: log2fc.tsv + meta.json
# Run from: All_Datasets/GSE317028_ChrZ/
# ============================================================

library(dplyr)
library(jsonlite)

setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

COUNT_FILE  <- "GSE317028_gene_expression.tsv.gz"
ANNOT_FILE  <- "../../Annotation_file/genes_with_pathway.tsv"   # ChrZ annotation
OUT_TSV     <- "log2fc.tsv"
OUT_META    <- "meta.json"
TARGET_DIR  <- "../../Data_algae/GSE317028"

# ── 1. Load expression data ───────────────────────────────────────────────────
cat("Reading expression data:", COUNT_FILE, "\n")
expr <- read.delim(COUNT_FILE, row.names = 1, check.names = FALSE)
# Remove quotes from row names if present
rownames(expr) <- gsub('"', '', rownames(expr))
cat("Dimensions:", nrow(expr), "genes x", ncol(expr), "samples\n")
cat("Columns:", paste(colnames(expr), collapse = ", "), "\n")

# Sample groups
HL_1  <- grep("HL_1mMNO3",  colnames(expr), value = TRUE)
HL_10 <- grep("HL_10mMNO3", colnames(expr), value = TRUE)
LL_1  <- grep("LL_1mMNO3",  colnames(expr), value = TRUE)
LL_10 <- grep("LL_10mMNO3", colnames(expr), value = TRUE)

cat("HL_1mMNO3  samples:", paste(HL_1,  collapse = ", "), "\n")
cat("HL_10mMNO3 samples:", paste(HL_10, collapse = ", "), "\n")
cat("LL_1mMNO3  samples:", paste(LL_1,  collapse = ", "), "\n")
cat("LL_10mMNO3 samples:", paste(LL_10, collapse = ", "), "\n")

# ── 2. Contrast calculation (FPKM-based) ──────────────────────────────────────
PSEUDO <- 0.01

calc_contrast <- function(expr_mat, cols_a, cols_b, label) {
  a    <- expr_mat[, cols_a, drop = FALSE]
  b    <- expr_mat[, cols_b, drop = FALSE]
  lfc  <- log2((rowMeans(a) + PSEUDO) / (rowMeans(b) + PSEUDO))
  pv   <- sapply(seq_len(nrow(expr_mat)), function(i) {
    ai <- as.numeric(a[i, ]); bi <- as.numeric(b[i, ])
    if (sum(ai) + sum(bi) == 0) return(NA_real_)
    tryCatch(t.test(ai, bi, var.equal = FALSE)$p.value, error = function(e) NA_real_)
  })
  data.frame(
    GeneID                          = rownames(expr_mat),
    stringsAsFactors                = FALSE
  ) |> mutate(
    !!paste0(label, "_log2FC") := round(lfc,              4),
    !!paste0(label, "_padj")   := round(p.adjust(pv, "BH"), 6)
  )
}

cat("\nCalculating contrasts ...\n")
c1 <- calc_contrast(expr, HL_1,  LL_1,  "HL_vs_LL_1mM")
c2 <- calc_contrast(expr, HL_10, LL_10, "HL_vs_LL_10mM")
c3 <- calc_contrast(expr, HL_10, HL_1,  "HighN_vs_LowN_HL")
c4 <- calc_contrast(expr, LL_10, LL_1,  "HighN_vs_LowN_LL")

all_fc <- Reduce(function(a, b) left_join(a, b, by = "GeneID"),
                 list(c1, c2, c3, c4))

# ── 3. Load ChrZ annotation ───────────────────────────────────────────────────
cat("Loading ChrZ annotation:", ANNOT_FILE, "\n")
annot <- read.delim(ANNOT_FILE, stringsAsFactors = FALSE)

target_pathways <- unique(annot$Pathway[annot$Pathway != "" & annot$Pathway != "Unknown"])
cat("ChrZ pathways available:", length(target_pathways), "\n")

# Clean gene IDs: strip transcript suffixes  Cz01g00020.t1 -> Cz01g00020
all_fc$GeneID_clean  <- sub("\\.t\\d+.*$", "", all_fc$GeneID)
annot$GeneID_clean   <- sub("\\.t\\d+.*$", "", annot$GeneID)

# ── 4. Merge and filter ───────────────────────────────────────────────────────
merged <- all_fc |>
  left_join(annot |> select(GeneID_clean, Symbol, Description, Pathway),
            by = "GeneID_clean") |>
  filter(!is.na(Pathway), Pathway != "", Pathway != "Unknown") |>
  select(Pathway, GeneID = GeneID_clean, Symbol, Description,
         starts_with("HL_vs_LL"), starts_with("HighN"))

cat("Annotated genes:", nrow(merged), "\n")
cat("Pathways covered:", length(unique(merged$Pathway)), "\n")
cat("\nTop pathways:\n")
print(sort(table(merged$Pathway), decreasing = TRUE)[1:20])

# ── 5. Save ───────────────────────────────────────────────────────────────────
write.table(merged, file = OUT_TSV, sep = "\t", quote = FALSE, row.names = FALSE)
cat("\nSaved:", OUT_TSV, "\n")

meta <- list(
  dataset_id         = "GSE317028",
  species            = "Chromochloris zofingiensis",
  species_details    = "Green microalga; high light (HL) vs low light (LL) under 1 mM and 10 mM nitrate",
  geo_link           = "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE317028",
  technique          = "RNA-seq · RPKM-based log2FC",
  induction_type     = "High light + Nitrogen interaction",
  induction_details  = "2 × 2 factorial: HL/LL × low N (1 mM NO3) / high N (10 mM NO3); 3 biological replicates each",
  pathways           = as.list(sort(unique(merged$Pathway))),
  contrasts          = list(
    "HL vs LL (1 mM N)"    = "HL_vs_LL_1mM",
    "HL vs LL (10 mM N)"   = "HL_vs_LL_10mM",
    "High N vs Low N (HL)" = "HighN_vs_LowN_HL",
    "High N vs Low N (LL)" = "HighN_vs_LowN_LL"
  ),
  contrast_descriptions = list(
    HL_vs_LL_1mM      = "log2(HL / LL) under 1 mM nitrate — light response at low nitrogen",
    HL_vs_LL_10mM     = "log2(HL / LL) under 10 mM nitrate — light response at high nitrogen",
    HighN_vs_LowN_HL  = "log2(10 mM / 1 mM NO3) under high light — nitrogen effect under HL",
    HighN_vs_LowN_LL  = "log2(10 mM / 1 mM NO3) under low light — nitrogen effect under LL"
  )
)
write(toJSON(meta, pretty = TRUE, auto_unbox = TRUE), file = OUT_META)
cat("Saved:", OUT_META, "\n")

if (!dir.exists(TARGET_DIR)) dir.create(TARGET_DIR, recursive = TRUE)
file.copy(OUT_TSV,  file.path(TARGET_DIR, "log2fc.tsv"),  overwrite = TRUE)
file.copy(OUT_META, file.path(TARGET_DIR, "meta.json"),   overwrite = TRUE)
cat("Copied to:", TARGET_DIR, "\n")
cat("Done. Update Data_algae/registry.json to include GSE317028.\n")
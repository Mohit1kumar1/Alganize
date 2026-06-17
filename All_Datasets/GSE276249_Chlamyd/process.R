# ============================================================
# GSE276249 — Chlamydomonas reinhardtii nutrient starvation
# Inositol polyphosphates regulate nutrient stress responses
# Expression data: FPKM (12 samples, 3 replicates each)
#   wtc   = wild-type control
#   wtns  = wild-type nutrient starvation
#   vipc  = vip1-1 mutant control
#   vipns = vip1-1 mutant nutrient starvation
#
# Contrasts:
#   wtns_vs_wtc   — starvation response in WT
#   vipns_vs_vipc — starvation response in vip1-1 mutant
#   vipc_vs_wtc   — baseline vip1-1 vs WT (control)
#   vipns_vs_wtns — mutant vs WT under starvation
#
# Outputs:
#   log2fc.tsv   (browser-ready wide format)
#   meta.json    (dataset metadata for browser)
#
# Run from: All_Datasets/GSE276249_Chlamyd/
# ============================================================

library(dplyr)
library(tidyr)
library(jsonlite)

setwd(dirname(rstudioapi::getActiveDocumentContext()$path))  # RStudio
# If running Rscript: setwd("All_Datasets/GSE276249_Chlamyd")

FPKM_FILE   <- "GSE276249_gene_expression_fpkm.csv.gz"
ANNOT_FILE  <- "../../Annotation_file/genes_with_pathway_chlamydomonas.tsv"
OUT_TSV     <- "log2fc.tsv"
OUT_META    <- "meta.json"
TARGET_DIR  <- "../../Data_algae/GSE276249"   # browser destination

# ── 1. Load FPKM data ─────────────────────────────────────────────────────────
cat("Reading FPKM data:", FPKM_FILE, "\n")
fpkm <- read.csv(FPKM_FILE, row.names = 1, check.names = FALSE)
cat("Dimensions:", nrow(fpkm), "genes x", ncol(fpkm), "samples\n")
cat("Sample names:", paste(colnames(fpkm), collapse = ", "), "\n")

# Sample groups (column names from data)
WT_CTRL   <- c("wtc_1",  "wtc_2",  "wtc_3")
WT_NS     <- c("wtns_1", "wtns_2", "wtns_3")
VIP_CTRL  <- c("vipc_1", "vipc_2", "vipc_3")
VIP_NS    <- c("vipns_1","vipns_2","vipns_3")

# ── 2. Per-gene t-test helper ──────────────────────────────────────────────────
PSEUDO <- 0.01   # added before log2 to avoid log(0)

calc_contrast <- function(fpkm_mat, cols_a, cols_b, label) {
  # cols_a = numerator (stressed / treated)
  # cols_b = denominator (control)
  a <- fpkm_mat[, cols_a, drop = FALSE]
  b <- fpkm_mat[, cols_b, drop = FALSE]

  mean_a <- rowMeans(a)
  mean_b <- rowMeans(b)
  lfc    <- log2((mean_a + PSEUDO) / (mean_b + PSEUDO))

  # t-test for each gene (n=3 per group; yields p-value only, low power)
  pvals <- sapply(seq_len(nrow(fpkm_mat)), function(i) {
    ai <- as.numeric(a[i, ])
    bi <- as.numeric(b[i, ])
    if (sum(ai) == 0 && sum(bi) == 0) return(NA_real_)
    tryCatch(t.test(ai, bi, var.equal = FALSE)$p.value, error = function(e) NA_real_)
  })
  padj <- p.adjust(pvals, method = "BH")

  result <- data.frame(GeneID = rownames(fpkm_mat), lfc = round(lfc, 4),
                       padj = round(padj, 6), stringsAsFactors = FALSE)
  colnames(result)[2] <- paste0(label, "_log2FC")
  colnames(result)[3] <- paste0(label, "_padj")
  result
}

cat("\nCalculating contrasts ...\n")
c1 <- calc_contrast(fpkm, WT_NS,    WT_CTRL,  "wtns_vs_wtc")
c2 <- calc_contrast(fpkm, VIP_NS,   VIP_CTRL, "vipns_vs_vipc")
c3 <- calc_contrast(fpkm, VIP_CTRL, WT_CTRL,  "vipc_vs_wtc")
c4 <- calc_contrast(fpkm, VIP_NS,   WT_NS,    "vipns_vs_wtns")

all_fc <- Reduce(function(a, b) left_join(a, b, by = "GeneID"),
                 list(c1, c2, c3, c4))
cat("Contrast table:", nrow(all_fc), "genes x", ncol(all_fc), "columns\n")

# ── 3. Load Chlamydomonas annotation ─────────────────────────────────────────
cat("\nLoading annotation:", ANNOT_FILE, "\n")
annot <- read.delim(ANNOT_FILE, stringsAsFactors = FALSE)
cat("Annotation rows:", nrow(annot), "| pathways:", length(unique(annot$Pathway)), "\n")

# Strip transcript version suffix from gene IDs in FPKM data:
# Cre01.g000017.t1.2  ->  Cre01.g000017
all_fc$GeneID_clean <- sub("\\.t\\d+.*$", "", all_fc$GeneID)

annot$GeneID_clean <- sub("\\.t\\d+.*$", "", annot$GeneID)

# ── 4. Join and filter to annotated pathways ──────────────────────────────────
TARGET_PATHWAYS <- c(
  "Proline","Glycine_Betaine","Beta_Carotene","Lutein","Astaxanthin","Zeaxanthin",
  "Alpha_Tocopherol","ABA","IAA","EPA_Eicosapentaenoic_Acid","DHA_Docosahexaenoic_Acid",
  "Gibberellin_GA3","Carotenoid","Omega3_Fatty_Acid","Omega6_Fatty_Acid",
  "Vitamin_E_Tocopherol","Vitamin_C_Ascorbate","Vitamin_B1_Thiamine","Vitamin_B2_Riboflavin",
  "Vitamin_B6_Pyridoxine","Vitamin_B12_Cobalamin","Folate","Biotin","Niacin_Nicotinamide",
  "Cytokinin","Ethylene","Brassinosteroid","Jasmonate_JA","Salicylate_SA","Strigolactone",
  "Trehalose","Inositol","Fatty_Acid","Wax_Cutin","Cellulose","Starch","Sucrose",
  "Glycolysis","Calvin_Cycle","TCA_Cycle","Pentose_Phosphate","Purine","Pyrimidine",
  "Nitrogen_Assimilation","Chlorophyll","Photosynthesis","Flavonoid","Terpenoid",
  "Anthocyanin","Lignin","Alkaloid","Glucosinolate","Protein_Kinase_Signalling",
  "cAMP_Signalling","MAPK_Signalling","ROS_Scavenging","tRNA_Aminoacylation",
  "Translation","Transcription","RNA_Processing","Ubiquitin_Proteasome","Chaperone",
  "Glycine","Tryptophan","Leucine","Valine","Isoleucine","Serine","Alanine",
  "Phenylalanine","Tyrosine","Lysine","Methionine","Cysteine","Histidine","Arginine",
  "Aspartate","Glutamate","Asparagine","Glutamine","Threonine","Phospholipid_Biosynthesis",
  "Glutathione_Metabolism"
)

merged <- all_fc |>
  left_join(annot |> select(GeneID_clean, Symbol, Description, Pathway),
            by = "GeneID_clean") |>
  filter(Pathway %in% TARGET_PATHWAYS) |>
  select(Pathway, GeneID = GeneID_clean, Symbol, Description,
         starts_with("wtns"), starts_with("vipns_vs_vipc"),
         starts_with("vipc_vs_wtc"), starts_with("vipns_vs_wtns"))

cat("Annotated genes:", nrow(merged), "\n")
cat("Pathways covered:", length(unique(merged$Pathway)), "\n")
cat("\nGenes per pathway:\n")
print(sort(table(merged$Pathway), decreasing = TRUE))

# ── 5. Save log2fc.tsv ────────────────────────────────────────────────────────
write.table(merged, file = OUT_TSV, sep = "\t", quote = FALSE, row.names = FALSE)
cat("\nSaved:", OUT_TSV, "\n")

# ── 6. Write meta.json ────────────────────────────────────────────────────────
meta <- list(
  dataset_id         = "GSE276249",
  species            = "Chlamydomonas reinhardtii",
  species_details    = "Green microalga; wild-type CC-4533 and vip1-1 (inositol polyphosphate kinase mutant) under nutrient starvation",
  geo_link           = "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE276249",
  technique          = "RNA-seq · Illumina NextSeq 500 · FPKM-based log2FC",
  induction_type     = "Nutrient starvation",
  induction_details  = "Complete nutrient starvation; WT and vip1-1 mutant; 3 biological replicates",
  pathways           = as.list(sort(unique(merged$Pathway))),
  contrasts          = list(
    "WT: starvation vs control"         = "wtns_vs_wtc",
    "vip1-1: starvation vs control"     = "vipns_vs_vipc",
    "vip1-1 vs WT (control)"            = "vipc_vs_wtc",
    "vip1-1 vs WT (starvation)"         = "vipns_vs_wtns"
  ),
  contrast_descriptions = list(
    wtns_vs_wtc    = "log2(WT nutrient-starved / WT control) — wild-type starvation response",
    vipns_vs_vipc  = "log2(vip1-1 starved / vip1-1 control) — mutant starvation response",
    vipc_vs_wtc    = "log2(vip1-1 control / WT control) — baseline mutant vs WT",
    vipns_vs_wtns  = "log2(vip1-1 starved / WT starved) — mutant vs WT under starvation"
  )
)
write(toJSON(meta, pretty = TRUE, auto_unbox = TRUE), file = OUT_META)
cat("Saved:", OUT_META, "\n")

# ── 7. Copy to browser directory ──────────────────────────────────────────────
if (!dir.exists(TARGET_DIR)) dir.create(TARGET_DIR, recursive = TRUE)
file.copy(OUT_TSV,  file.path(TARGET_DIR, "log2fc.tsv"),  overwrite = TRUE)
file.copy(OUT_META, file.path(TARGET_DIR, "meta.json"),   overwrite = TRUE)
cat("Copied to browser directory:", TARGET_DIR, "\n")
cat("\nDone. Remember to update Data_algae/registry.json to include GSE276249.\n")
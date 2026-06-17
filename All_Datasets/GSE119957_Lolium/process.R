# ============================================================
# GSE119957 — Lolium arundinaceum (tall fescue)
# Salt stress: control (CK), 24h NaCl, 48h NaCl
# Expression data: de-novo assembled transcriptome (Trinity IDs)
#
# Before running this script:
#   cd All_Datasets/GSE119957_Lolium
#   tar xf GSE119957_RAW.tar
#
# This script auto-detects the expression file format inside the
# extracted folder (FPKM matrix, raw counts, or per-sample files).
#
# Contrasts:
#   Salt24h_vs_CK  — 24-hour salt response
#   Salt48h_vs_CK  — 48-hour salt response
#   Salt48h_vs_24h — sustained vs early response
#
# Outputs: log2fc.tsv + meta.json
# Run from: All_Datasets/GSE119957_Lolium/
# ============================================================

library(dplyr)
library(jsonlite)

setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

ANNOT_FILE <- "../../Annotation_file/genes_with_pathway_lolium.tsv"
OUT_TSV    <- "log2fc.tsv"
OUT_META   <- "meta.json"
TARGET_DIR <- "../../data_plant/GSE119957"    # plant explorer

PSEUDO     <- 0.01
TARGET_PATHWAYS <- c(
  "Proline","Glycine_Betaine","Beta_Carotene","Lutein","Astaxanthin","Zeaxanthin",
  "Alpha_Tocopherol","ABA","IAA","Gibberellin_GA3","Carotenoid","Omega3_Fatty_Acid",
  "Omega6_Fatty_Acid","Vitamin_E_Tocopherol","Vitamin_C_Ascorbate","Vitamin_B1_Thiamine",
  "Vitamin_B2_Riboflavin","Vitamin_B6_Pyridoxine","Folate","Biotin","Niacin_Nicotinamide",
  "Cytokinin","Ethylene","Brassinosteroid","Jasmonate_JA","Salicylate_SA","Strigolactone",
  "Trehalose","Inositol","Fatty_Acid","Wax_Cutin","Starch","Sucrose","Glycolysis",
  "Calvin_Cycle","TCA_Cycle","Pentose_Phosphate","Purine","Pyrimidine",
  "Nitrogen_Assimilation","Chlorophyll","Photosynthesis","Flavonoid","Terpenoid",
  "Anthocyanin","Lignin","Protein_Kinase_Signalling","MAPK_Signalling","ROS_Scavenging",
  "tRNA_Aminoacylation","Translation","Transcription","RNA_Processing",
  "Ubiquitin_Proteasome","Chaperone","Phospholipid_Biosynthesis","Glutathione_Metabolism",
  "Glycine","Tryptophan","Leucine","Valine","Isoleucine","Serine","Alanine",
  "Phenylalanine","Tyrosine","Lysine","Methionine","Cysteine","Histidine",
  "Arginine","Aspartate","Glutamate","Asparagine","Glutamine","Threonine"
)

# ── 1. Load per-sample FPKM files ────────────────────────────────────────────
# GSE119957 provides one FPKM file per sample:
#   GSM3389404_CK.gene.fpkm.txt.gz           — control
#   GSM3389405_Salt-24h-gene.fpkm.txt.gz     — 24h NaCl
#   GSM3389406_Salt-48h-gene.fpkm.txt.gz     — 48h NaCl
# Columns: gene_id | transcript_id(s) | length | expected_count | FPKM | Nr | Nt | Swissprot | KEGG | KOG | Interpro | GO

read_fpkm_file <- function(fp, sample_name) {
  opener <- if (grepl("\\.gz$", fp)) gzfile else file
  df <- read.delim(opener(fp), stringsAsFactors = FALSE, check.names = FALSE)
  cat("  Loaded", fp, ":", nrow(df), "genes,", ncol(df), "cols\n")
  cat("  Cols:", paste(colnames(df)[1:min(8,ncol(df))], collapse=", "), "\n")
  # Rename FPKM column to sample name
  fpkm_col <- names(df)[grepl("^FPKM$", names(df), ignore.case = TRUE)]
  if (length(fpkm_col) == 0) fpkm_col <- names(df)[5]  # fallback: 5th col
  out <- data.frame(GeneID = df[[1]], fpkm = as.numeric(df[[fpkm_col]]),
                    stringsAsFactors = FALSE)
  colnames(out)[2] <- sample_name
  out
}

cat("Loading per-sample FPKM files ...\n")
files <- list.files(".", pattern = "gene\\.fpkm\\.txt\\.gz$", full.names = TRUE)
if (length(files) == 0) files <- list.files(".", pattern = "fpkm\\.txt\\.gz$", full.names = TRUE)
cat("Found:", paste(basename(files), collapse = ", "), "\n\n")

ck_file  <- files[grepl("CK|ctrl|control", files, ignore.case = TRUE)][1]
s24_file <- files[grepl("24[hH]|Salt.*24|24.*Salt", files, ignore.case = TRUE)][1]
s48_file <- files[grepl("48[hH]|Salt.*48|48.*Salt", files, ignore.case = TRUE)][1]

if (is.na(ck_file))  stop("Cannot find CK/control FPKM file")
if (is.na(s24_file)) stop("Cannot find Salt-24h FPKM file")

ck_df  <- read_fpkm_file(ck_file,  "CK")
s24_df <- read_fpkm_file(s24_file, "Salt24h")

expr_list <- list(ck_df, s24_df)
if (!is.na(s48_file)) {
  s48_df <- read_fpkm_file(s48_file, "Salt48h")
  expr_list <- c(expr_list, list(s48_df))
}

# Combine into a single matrix
expr_combined <- Reduce(function(a, b) merge(a, b, by = "GeneID", all = TRUE), expr_list)
expr_combined[is.na(expr_combined)] <- 0
rownames(expr_combined) <- expr_combined$GeneID
expr <- expr_combined[, -1]  # drop GeneID column, keep numeric cols

cat("Combined matrix:", nrow(expr), "genes x", ncol(expr), "samples\n")
cat("Sample columns:", paste(colnames(expr), collapse = ", "), "\n")

# Also extract annotation from CK file for pathway assignment
ck_raw <- read.delim((if (grepl("\\.gz$", ck_file)) gzfile else file)(ck_file),
                     stringsAsFactors = FALSE, check.names = FALSE)
annot_cols <- names(ck_raw)[names(ck_raw) %in% c("Nr","Nt","Swissprot","KEGG","KOG","GO")]
if (length(annot_cols) > 0) {
  extra_annot <- ck_raw[, c(names(ck_raw)[1], annot_cols), drop = FALSE]
  colnames(extra_annot)[1] <- "GeneID"
  cat("Loaded", nrow(extra_annot), "rows of NR/SwissProt annotation from CK file\n")
} else {
  extra_annot <- NULL
}

# ── 2. Sample group columns (already named) ───────────────────────────────────
cols   <- colnames(expr)
ck_cols  <- cols[grepl("CK",      cols, ignore.case = TRUE)]
s24_cols <- cols[grepl("Salt24h", cols, ignore.case = TRUE)]
s48_cols <- cols[grepl("Salt48h", cols, ignore.case = TRUE)]

cat("\nControl (CK) samples:", paste(ck_cols, collapse = ", "), "\n")
cat("Salt 24h samples:",      paste(s24_cols, collapse = ", "), "\n")
cat("Salt 48h samples:",      paste(s48_cols, collapse = ", "), "\n")

if (length(ck_cols) == 0)  stop("Cannot detect control (CK) columns.")
if (length(s24_cols) == 0) stop("Cannot detect 24h salt columns.")

# ── 3. Contrast calculation ───────────────────────────────────────────────────
calc_contrast <- function(mat, cols_a, cols_b, label) {
  a   <- mat[, cols_a, drop = FALSE]
  b   <- mat[, cols_b, drop = FALSE]
  lfc <- log2((rowMeans(a) + PSEUDO) / (rowMeans(b) + PSEUDO))
  pv  <- if (length(cols_a) >= 2 && length(cols_b) >= 2) {
    sapply(seq_len(nrow(mat)), function(i) {
      ai <- as.numeric(a[i, ]); bi <- as.numeric(b[i, ])
      if (sum(ai) + sum(bi) == 0) return(NA_real_)
      tryCatch(t.test(ai, bi, var.equal = FALSE)$p.value, error = function(e) NA_real_)
    })
  } else {
    rep(NA_real_, nrow(mat))
  }
  data.frame(GeneID = rownames(mat), stringsAsFactors = FALSE) |>
    mutate(!!paste0(label,"_log2FC") := round(lfc, 4),
           !!paste0(label,"_padj")   := round(p.adjust(pv, "BH"), 6))
}

cat("\nCalculating contrasts ...\n")
c1 <- calc_contrast(expr, s24_cols, ck_cols, "Salt24h_vs_CK")
contrasts_list <- list(c1)

if (length(s48_cols) > 0) {
  c2 <- calc_contrast(expr, s48_cols, ck_cols,  "Salt48h_vs_CK")
  c3 <- calc_contrast(expr, s48_cols, s24_cols, "Salt48h_vs_24h")
  contrasts_list <- c(contrasts_list, list(c2, c3))
}

all_fc <- Reduce(function(a, b) left_join(a, b, by = "GeneID"), contrasts_list)

# ── 4. Load Lolium annotation ─────────────────────────────────────────────────
cat("Loading Lolium annotation:", ANNOT_FILE, "\n")
annot <- read.delim(ANNOT_FILE, stringsAsFactors = FALSE)
cat("Annotation rows:", nrow(annot), "\n")

# ── 5. Join and filter ────────────────────────────────────────────────────────
merged <- all_fc |>
  left_join(annot |> select(GeneID, Symbol, Description, Pathway),
            by = "GeneID") |>
  filter(Pathway %in% TARGET_PATHWAYS) |>
  select(Pathway, GeneID, Symbol, Description, everything())

cat("Annotated genes:", nrow(merged), "\n")
cat("Pathways covered:", length(unique(merged$Pathway)), "\n")
print(sort(table(merged$Pathway), decreasing = TRUE)[1:20])

# ── 6. Save ───────────────────────────────────────────────────────────────────
write.table(merged, file = OUT_TSV, sep = "\t", quote = FALSE, row.names = FALSE)
cat("\nSaved:", OUT_TSV, "\n")

contrast_keys <- setdiff(
  names(all_fc), "GeneID"
) |> grep("_log2FC$", x = _, value = TRUE) |>
  sub("_log2FC$", "", x = _)

contrast_map  <- setNames(contrast_keys, gsub("_", " ", contrast_keys))
contrast_desc <- setNames(
  paste0("log2(", gsub("_vs_", " / ", contrast_keys), ")"),
  contrast_keys
)

meta <- list(
  dataset_id         = "GSE119957",
  species            = "Lolium arundinaceum",
  species_details    = "Tall fescue grass; de-novo assembled transcriptome (Trinity); 79,352 CDS",
  geo_link           = "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE119957",
  technique          = "RNA-seq · Illumina HiSeq 2000 · FPKM-based log2FC",
  induction_type     = "Salt stress",
  induction_details  = "NaCl salt stress; control vs 24h and 48h treatment",
  pathways           = as.list(sort(unique(merged$Pathway))),
  contrasts          = as.list(contrast_map),
  contrast_descriptions = as.list(contrast_desc)
)
write(toJSON(meta, pretty = TRUE, auto_unbox = TRUE), file = OUT_META)
cat("Saved:", OUT_META, "\n")

if (!dir.exists(TARGET_DIR)) dir.create(TARGET_DIR, recursive = TRUE)
file.copy(OUT_TSV,  file.path(TARGET_DIR, "log2fc.tsv"),  overwrite = TRUE)
file.copy(OUT_META, file.path(TARGET_DIR, "meta.json"),   overwrite = TRUE)
cat("Copied to:", TARGET_DIR, "\n")
cat("Done. Update data_plant/registry.json to include GSE119957.\n")
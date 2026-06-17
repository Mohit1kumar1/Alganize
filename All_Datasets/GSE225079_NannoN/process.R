# ============================================================
# GSE225079 — Nannochloropsis oceanica IMET1
# Nitrogen deprivation: control (C0) vs day1 (N1) vs day2 (N2)
# 2 biological replicates per condition = 6 samples
#
# Data provided: pre-computed DEG XLS files (already differential expression)
#   GSE225079_C0-vs-N1.total.DEG.xls.gz   — control vs 1-day N deprivation
#   GSE225079_C0-vs-N2.total.DEG.xls.gz   — control vs 2-day N deprivation
#   GSE225079_N1-vs-N2.total.DEG.xls.gz   — day1 vs day2 N deprivation
#
# Download all three from:
#   https://ftp.ncbi.nlm.nih.gov/geo/series/GSE225nnn/GSE225079/suppl/
#
# Strategy: parse log2FC and FDR/padj columns from pre-computed DEG tables.
# No raw counts available → log2FC used as provided by original authors.
#
# Contrasts:
#   N_dep_1d_vs_Control   — 1-day nitrogen starvation response
#   N_dep_2d_vs_Control   — 2-day nitrogen starvation response
#   N_dep_2d_vs_1d        — progression of N starvation
#
# Outputs: log2fc.tsv + meta.json -> Data_algae/GSE225079/
# Run from: All_Datasets/GSE225079_NannoN/
# ============================================================

library(dplyr)
library(jsonlite)

setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

DEG_C0_N1  <- "GSE225079_C0-vs-N1.total.DEG.xls.gz"
DEG_C0_N2  <- "GSE225079_C0-vs-N2.total.DEG.xls.gz"
DEG_N1_N2  <- "GSE225079_N1-vs-N2.total.DEG.xls.gz"
ANNOT_FILE <- "../../Annotation_file/genes_with_pathway_nannochloropsis.tsv"
OUT_TSV    <- "log2fc.tsv"
OUT_META   <- "meta.json"
TARGET_DIR <- "../../Data_algae/GSE225079"

GEO_FTP <- "https://ftp.ncbi.nlm.nih.gov/geo/series/GSE225nnn/GSE225079/suppl/"

TARGET_PATHWAYS <- c(
  "Proline","Glycine_Betaine","Beta_Carotene","Lutein","Astaxanthin","Zeaxanthin",
  "Alpha_Tocopherol","ABA","IAA","EPA_Eicosapentaenoic_Acid","DHA_Docosahexaenoic_Acid",
  "Carotenoid","Omega3_Fatty_Acid","Omega6_Fatty_Acid","Vitamin_E_Tocopherol",
  "Vitamin_C_Ascorbate","Vitamin_B1_Thiamine","Vitamin_B2_Riboflavin",
  "Vitamin_B6_Pyridoxine","Folate","Biotin","Niacin_Nicotinamide",
  "Trehalose","Inositol","Fatty_Acid","Glycolysis","Calvin_Cycle","TCA_Cycle",
  "Pentose_Phosphate","Purine","Pyrimidine","Nitrogen_Assimilation",
  "Chlorophyll","Photosynthesis","Flavonoid","Terpenoid","Protein_Kinase_Signalling",
  "MAPK_Signalling","ROS_Scavenging","tRNA_Aminoacylation","Translation",
  "Transcription","RNA_Processing","Ubiquitin_Proteasome","Chaperone",
  "Phospholipid_Biosynthesis","Glutathione_Metabolism",
  "Glycine","Tryptophan","Leucine","Valine","Isoleucine","Serine","Alanine",
  "Phenylalanine","Tyrosine","Lysine","Methionine","Cysteine","Histidine",
  "Arginine","Aspartate","Glutamate","Asparagine","Glutamine","Threonine"
)

# ── Helper: read a DEG XLS file (tab-delimited .xls.gz from GEO) ─────────────
read_deg_xls <- function(filename, label) {
  if (!file.exists(filename)) {
    cat("  WARNING:", filename, "not found. Skipping.\n")
    return(NULL)
  }
  df <- tryCatch(
    read.delim(gzfile(filename), check.names = FALSE, stringsAsFactors = FALSE),
    error = function(e) { cat("  ERROR reading", filename, ":", e$message, "\n"); NULL }
  )
  if (is.null(df) || nrow(df) == 0) return(NULL)
  cat("  Loaded", nrow(df), "rows from", filename, "\n")

  id_col   <- colnames(df)[1]
  lfc_col  <- names(df)[grepl("log2.*fold|log2FC|logFC|lfc|L2FC", names(df), ignore.case=TRUE)][1]
  if (is.na(lfc_col)) lfc_col <- names(df)[2]
  padj_col <- names(df)[grepl("padj|FDR|fdr|adj.*[pP]", names(df), ignore.case=TRUE)][1]
  if (is.na(padj_col)) padj_col <- names(df)[grepl("pvalue|p.value|Pvalue", names(df), ignore.case=TRUE)][1]
  if (is.na(padj_col)) padj_col <- names(df)[ncol(df)]

  # Extract functional annotation columns if present
  nr_col   <- names(df)[grepl("NR_def|nr_def|NR.def", names(df), ignore.case=TRUE)][1]
  go_col   <- names(df)[grepl("^GO_term$|^go_term$", names(df), ignore.case=TRUE)][1]
  kegg_col <- names(df)[grepl("KEGG.Pathway|KEGG_Pathway", names(df), ignore.case=TRUE)][1]
  ko_col   <- names(df)[grepl("^KO_gene$|^ko_gene$", names(df), ignore.case=TRUE)][1]

  result <- data.frame(
    GeneID = as.character(df[[id_col]]),
    lfc    = round(as.numeric(df[[lfc_col]]), 4),
    padj   = round(as.numeric(df[[padj_col]]), 6),
    NR_def   = if (!is.na(nr_col))   as.character(df[[nr_col]])   else "",
    GO_term  = if (!is.na(go_col))   as.character(df[[go_col]])   else "",
    KEGG_Path= if (!is.na(kegg_col)) as.character(df[[kegg_col]]) else "",
    KO_gene  = if (!is.na(ko_col))   as.character(df[[ko_col]])   else "",
    stringsAsFactors = FALSE
  )
  colnames(result)[2] <- paste0(label, "_log2FC")
  colnames(result)[3] <- paste0(label, "_padj")
  result[!is.na(result$GeneID) & result$GeneID != "", ]
}

# ── 1. Read all DEG files ─────────────────────────────────────────────────────
cat("Reading pre-computed DEG files ...\n")
for (f in c(DEG_C0_N1, DEG_C0_N2, DEG_N1_N2)) {
  if (!file.exists(f))
    cat("  MISSING:", f, "\n  Download from:", GEO_FTP, "\n")
}

d1 <- read_deg_xls(DEG_C0_N1, "N_dep_1d_vs_Control")
d2 <- read_deg_xls(DEG_C0_N2, "N_dep_2d_vs_Control")
d3 <- read_deg_xls(DEG_N1_N2, "N_dep_2d_vs_1d")

available <- Filter(Negate(is.null), list(d1, d2, d3))
if (length(available) == 0)
  stop("No DEG files found. Download all three .xls.gz files from GEO.")

# ── 2. Merge all contrasts ────────────────────────────────────────────────────
all_fc <- Reduce(function(a, b) full_join(a, b, by = "GeneID"), available)
cat("\nMerged:", nrow(all_fc), "genes across", length(available), "contrasts\n")

# ── 3. In-process annotation from DEG file columns ────────────────────────────
# DEG files include NR_def, GO_term, KEGG_Path, KO_gene — use these directly.
# Build annotation from the first available DEG file that has all columns.
# Drop duplicated annotation cols produced by full_join (NR_def.x, NR_def.y etc.)
annot_col_patt <- "^(NR_def|GO_term|KEGG_Path|KO_gene)"
all_fc <- all_fc[, !grepl(annot_col_patt, colnames(all_fc))]

cat("\nBuilding in-process annotation from DEG file NR/GO/KEGG columns ...\n")

assign_pathway_r <- function(desc) {
  d <- tolower(as.character(desc))
  if (grepl("rubisco|ribulose.*carboxylase|rbcl|rbcs|calvin", d)) return("Calvin_Cycle")
  if (grepl("photosystem|chlorophyll.*synthase|light.harvest|phytochrome", d)) return("Photosynthesis")
  if (grepl("chlorophyll|porphyrin|hemin|haem\\b|heme\\b|magnesium.chelatase", d)) return("Chlorophyll")
  if (grepl("fatty.acid.synth|acetyl.coa.carboxyl|fas\\b|fab[defghiz]\\b|ketoacyl", d)) return("Fatty_Acid")
  if (grepl("omega.3|eicosapentaenoic|epa\\b|dha\\b|docosahexaenoic|n-3.fatty", d)) return("Omega3_Fatty_Acid")
  if (grepl("omega.6|linoleic|arachidonic|n-6.fatty", d)) return("Omega6_Fatty_Acid")
  if (grepl("phospholipid|phosphatidyl|choline.phospho|glycerophospho", d)) return("Phospholipid_Biosynthesis")
  if (grepl("carotenoid|carotene|xanthophyll|fucoxanthin|violaxanthin|zeaxanthin", d)) return("Carotenoid")
  if (grepl("abscisic.acid|aba.receptor|pyr[lr]\\b|snrk2", d)) return("ABA")
  if (grepl("auxin|indole.acetic|iaa\\b|iaa.amido|tir1|aux\\b", d)) return("IAA")
  if (grepl("nitrogen.assimil|nitrate.reduct|nitrite.reduct|glutamine.synth|glutamate.synth|gln.synth", d)) return("Nitrogen_Assimilation")
  if (grepl("starch.synth|adp.glucose|granule.bound|waxy\\b", d)) return("Starch")
  if (grepl("sucrose.synth|sucrose.phosphate|invertase|sucrose.transport", d)) return("Sucrose")
  if (grepl("trehalose|tps\\b|tpp\\b", d)) return("Trehalose")
  if (grepl("inositol|phytase|phytic|phytol\\b", d)) return("Inositol")
  if (grepl("glycolysis|enolase|pyruvate.kinase|phosphoglycerate|phosphofructo|aldolase|triosephosphate", d)) return("Glycolysis")
  if (grepl("tca.cycle|citrate.synth|isocitrate|succinate.dehydro|fumarase|malate.dehydro", d)) return("TCA_Cycle")
  if (grepl("pentose.phosphate|glucose.6.phosphate.dehydro|transketolase|6.phosphogluconate", d)) return("Pentose_Phosphate")
  if (grepl("purine|adenylo|hypoxanthine|xanthine|guanine.deamin|inosine|adenine.phospho", d)) return("Purine")
  if (grepl("pyrimidine|uracil|thymidine|dihydroorotase|carbamoyl", d)) return("Pyrimidine")
  if (grepl("proline.synth|delta1.pyrroline|p5c\\b|proline.dehydro|ornithine", d)) return("Proline")
  if (grepl("glutathione.s.trans|glutathione.reduct|gst\\b|gpx\\b|gsh\\b", d)) return("Glutathione_Metabolism")
  if (grepl("superoxide.dismu|catalase|peroxiredox|thioredoxin|glutaredoxin|ros\\b|reactive.oxygen", d)) return("ROS_Scavenging")
  if (grepl("ubiquitin|proteasome|26s\\b|e3.ligase|cullin|ring.finger.ubiquit", d)) return("Ubiquitin_Proteasome")
  if (grepl("heat.shock.prot|hsp[679]\\d|chaperonin|dnak|groel|groes|dnaj", d)) return("Chaperone")
  if (grepl("protein.kinase|receptor.kinase|serine.threonine.kinase|tyrosine.kinase|rlk\\b|lrr.kinase", d)) return("Protein_Kinase_Signalling")
  if (grepl("translation|ribosom|eif\\d|eef\\d|rpl[0-9]|rps[0-9]|mrna.translation", d)) return("Translation")
  if (grepl("transcription.factor|rna.polym|transcription.regul|helicase.transcr|tfiid|tfiih", d)) return("Transcription")
  if (grepl("rna.splicing|spliceosom|u[12456].snrna|pre.mrna|serine.rich.splicing", d)) return("RNA_Processing")
  if (grepl("trna.ligase|trna.synth|aminoacyl.trna|trna.aminoacyl", d)) return("tRNA_Aminoacylation")
  if (grepl("serine.*synth|phosphoglycerate.dehydro|serine.hydroxymeth", d)) return("Serine")
  if (grepl("cysteine.*synth|serine.acetyltransf|cystathionine", d)) return("Cysteine")
  if (grepl("\\bglycine.synth|glycine.cleavage|glycine.decarb|lipoamide", d)) return("Glycine")
  if (grepl("tryptophan.*synth|anthranilate|indole.glycerol", d)) return("Tryptophan")
  if (grepl("leucine.*synth|isopropylmal|leucine.aminotrans", d)) return("Leucine")
  if (grepl("valine.*synth|acetolactate|ketol.acid.reduct", d)) return("Valine")
  if (grepl("isoleucine.*synth|threonine.deamin", d)) return("Isoleucine")
  if (grepl("alanine.transaminase|alanine.aminotrans|pyruvate.transaminase", d)) return("Alanine")
  if (grepl("phenylalanine.*synth|phenylalanine.aminotrans|prephenate", d)) return("Phenylalanine")
  if (grepl("tyrosine.*synth|tyrosine.aminotrans|4.hydroxyphenyl", d)) return("Tyrosine")
  if (grepl("lysine.*synth|diaminopimelate|saccharopine", d)) return("Lysine")
  if (grepl("methionine.*synth|cystathionine.gamma|methionine.adenos", d)) return("Methionine")
  if (grepl("histidine.*synth|atp.phosphoribosyl|histidinol", d)) return("Histidine")
  if (grepl("arginine.*synth|argininosuccinate|carbamoyl.phosphate.synth", d)) return("Arginine")
  if (grepl("aspartate.transaminase|aspartate.aminotrans|aspartyl", d)) return("Aspartate")
  if (grepl("glutamate.dehydro|glutamate.synth|glutaminase|alpha.ketoglutarate.transaminase", d)) return("Glutamate")
  if (grepl("asparagine.synth|asparaginase", d)) return("Asparagine")
  if (grepl("glutamine.synth|glna\\b|glns\\b|glutamine.amidotransf", d)) return("Glutamine")
  if (grepl("threonine.*synth|homoserine.kinase|threonine.deamin", d)) return("Threonine")
  if (grepl("vitamin.b1|thiamine|thi\\b", d)) return("Vitamin_B1_Thiamine")
  if (grepl("vitamin.b2|riboflavin|fmn\\b|fad\\b|lumazine", d)) return("Vitamin_B2_Riboflavin")
  if (grepl("vitamin.b6|pyridoxine|pyridoxal|pdx[12]\\b", d)) return("Vitamin_B6_Pyridoxine")
  if (grepl("folate|dihydrofolate|tetrahydrofolate|thymidylate|one.carbon", d)) return("Folate")
  if (grepl("biotin|bio[abcdf]\\b|lipoic.acid", d)) return("Biotin")
  if (grepl("mapk|map.kinase|mitogen.activated|mek\\b|erk\\b", d)) return("MAPK_Signalling")
  return("Unknown")
}

# Build annotation from all available DEG frames
annot_frames <- lapply(Filter(Negate(is.null), list(d1, d2, d3)), function(ddf) {
  if (!"NR_def" %in% colnames(ddf)) return(NULL)
  ddf |> select(GeneID, NR_def, GO_term, KEGG_Path, KO_gene) |> distinct(GeneID, .keep_all = TRUE)
})
annot_frames <- Filter(Negate(is.null), annot_frames)

if (length(annot_frames) > 0) {
  annot_raw <- bind_rows(annot_frames) |>
    distinct(GeneID, .keep_all = TRUE) |>
    mutate(
      combined_desc = paste(
        ifelse(is.na(NR_def)    | NR_def    == "NA" | NR_def    == "", "", NR_def),
        ifelse(is.na(GO_term)   | GO_term   == "NA" | GO_term   == "", "", GO_term),
        ifelse(is.na(KEGG_Path) | KEGG_Path == "NA" | KEGG_Path == "", "", KEGG_Path),
        ifelse(is.na(KO_gene)   | KO_gene   == "NA" | KO_gene   == "", "", KO_gene)
      ) |> trimws(),
      Symbol      = GeneID,
      Description = ifelse(NR_def == "" | is.na(NR_def), "Unknown", NR_def)
    ) |>
    rowwise() |>
    mutate(Pathway = assign_pathway_r(combined_desc)) |>
    ungroup()

  cat("In-process annotation: ", nrow(annot_raw), "genes |",
      sum(annot_raw$Pathway != "Unknown"), "with pathway\n")

  merged <- all_fc |>
    left_join(annot_raw |> select(GeneID, Symbol, Description, Pathway), by = "GeneID") |>
    filter(Pathway %in% TARGET_PATHWAYS) |>
    select(Pathway, GeneID, Symbol, Description, everything())
} else {
  cat("WARNING: No annotation columns found — trying external annotation file\n")
  if (!file.exists(ANNOT_FILE)) stop("No annotation available.")
  annot <- read.delim(ANNOT_FILE, stringsAsFactors = FALSE)
  merged <- all_fc |>
    left_join(annot |> select(GeneID, Symbol, Description, Pathway), by = "GeneID") |>
    filter(Pathway %in% TARGET_PATHWAYS) |>
    select(Pathway, GeneID, Symbol, Description, everything())
}

cat("Pathway-filtered genes:", nrow(merged), "| Pathways:", length(unique(merged$Pathway)), "\n")
if (nrow(merged) > 0) print(sort(table(merged$Pathway), decreasing = TRUE)[1:20])

# ── 4. Build meta ─────────────────────────────────────────────────────────────
meta_contrasts <- list()
meta_desc      <- list()
contrast_defs <- list(
  list(key="N_dep_1d_vs_Control", name="N deprivation 1d vs Control",  desc="log2(N-deprived day1 / N-replete control) — early N starvation"),
  list(key="N_dep_2d_vs_Control", name="N deprivation 2d vs Control",  desc="log2(N-deprived day2 / N-replete control) — sustained N starvation"),
  list(key="N_dep_2d_vs_1d",      name="N deprivation 2d vs 1d",       desc="log2(day2 / day1 N-deprived) — progression of N starvation")
)
for (cd in contrast_defs) {
  if (any(grepl(paste0("^",cd$key,"_log2FC$"), colnames(merged)))) {
    meta_contrasts[[cd$name]] <- cd$key
    meta_desc[[cd$key]]       <- cd$desc
  }
}

# ── 5. Save ───────────────────────────────────────────────────────────────────
write.table(merged, file = OUT_TSV, sep = "\t", quote = FALSE, row.names = FALSE)
cat("\nSaved:", OUT_TSV, "\n")

meta <- list(
  dataset_id         = "GSE225079",
  species            = "Nannochloropsis oceanica",
  species_details    = "Marine microalga strain IMET1; nitrogen deprivation time-course (day0 control, day1, day2); 2 biological replicates",
  geo_link           = "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE225079",
  technique          = "RNA-seq · Illumina HiSeq 2000 · pre-computed DEG (log2FC from original study)",
  induction_type     = "Nitrogen starvation",
  induction_details  = "Nitrogen-replete (C0) to nitrogen-deprived conditions; samples at day1 (N1) and day2 (N2); triggers lipid accumulation",
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
cat("Done. Update Data_algae/registry.json to include GSE225079.\n")
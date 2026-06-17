# ============================================================
# GSE315654 — Oryza sativa (rice)
# Drought stress during grain filling; hybrid vs parental lines
#   Hanyou73 (HY73) — hybrid
#   Hanhui3 (HH3)   — parent 1
#   Huhan7B (HH7B)  — parent 2
# Each: control (well-watered) + drought; 3 replicates → 18 samples
#
# Download required (place in this folder before running):
#   https://ftp.ncbi.nlm.nih.gov/geo/series/GSE315nnn/GSE315654/suppl/
#     GSE315654_Processed_data.txt.gz
#
# Contrasts:
#   Drought_vs_Control_HY73   — drought response in hybrid
#   Drought_vs_Control_HH3    — drought response in parent1
#   Drought_vs_Control_HH7B   — drought response in parent2
#   HY73_vs_HH3_Drought       — hybrid vs parent1 under drought
#
# Outputs: log2fc.tsv + meta.json -> data_plant/GSE315654/
# Run from: All_Datasets/GSE315654_Rice/
# ============================================================

library(dplyr)
library(jsonlite)

setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

DATA_FILE  <- "GSE315654_Processed_data.txt.gz"
ANNOT_FILE <- "../../Annotation_file/genes_with_pathway_oryza_sativa.tsv"
OUT_TSV    <- "log2fc.tsv"
OUT_META   <- "meta.json"
TARGET_DIR <- "../../data_plant/GSE315654"

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
  "Anthocyanin","Lignin","Protein_Kinase_Signalling","MAPK_Signalling","ROS_Scavenging",
  "tRNA_Aminoacylation","Translation","Transcription","RNA_Processing",
  "Ubiquitin_Proteasome","Chaperone","Phospholipid_Biosynthesis","Glutathione_Metabolism",
  "Glycine","Tryptophan","Leucine","Valine","Isoleucine","Serine","Alanine",
  "Phenylalanine","Tyrosine","Lysine","Methionine","Cysteine","Histidine",
  "Arginine","Aspartate","Glutamate","Asparagine","Glutamine","Threonine"
)

# ── 1. Load processed data ────────────────────────────────────────────────────
cat("Reading processed data:", DATA_FILE, "\n")
if (!file.exists(DATA_FILE))
  stop(paste("Download from GEO:\nhttps://ftp.ncbi.nlm.nih.gov/geo/series/",
             "GSE315nnn/GSE315654/suppl/GSE315654_Processed_data.txt.gz"))

raw_all <- read.delim(gzfile(DATA_FILE), check.names = FALSE)
cat("Dimensions (raw):", nrow(raw_all), "x", ncol(raw_all), "\n")
cat("Columns (first 25):", paste(colnames(raw_all)[1:min(25,ncol(raw_all))], collapse = ", "), "\n")

# First column is Gene ID; set as rownames
gene_ids <- as.character(raw_all[[1]])
gene_names <- if ("Gene Name" %in% colnames(raw_all)) as.character(raw_all[["Gene Name"]]) else
              if ("Gene_Name" %in% colnames(raw_all)) as.character(raw_all[["Gene_Name"]]) else gene_ids
gene_desc  <- if ("Gene Description" %in% colnames(raw_all)) as.character(raw_all[["Gene Description"]]) else
              if ("NR Description" %in% colnames(raw_all)) as.character(raw_all[["NR Description"]]) else ""

# Expression columns: match per-replicate names D73_1, D7B_1, DH3_1, W73_1, W7B_1, WH3_1
# (D=Drought, W=Well-watered; 73=HY73, 7B=HH7B, H3=HH3; _1/2/3 = replicate)
expr_pattern <- "^[DW](73|7B|H3)_[123]$"
expr_cols <- colnames(raw_all)[grepl(expr_pattern, colnames(raw_all))]
if (length(expr_cols) == 0) {
  # Try broader numeric-only columns
  expr_cols <- colnames(raw_all)[sapply(raw_all, is.numeric)]
}
cat("Expression columns:", paste(expr_cols, collapse = ", "), "\n")

expr <- raw_all[, expr_cols, drop = FALSE]
rownames(expr) <- gene_ids
cat("Dimensions (expr):", nrow(expr), "x", ncol(expr), "\n")

# ── 2. Sample group detection ─────────────────────────────────────────────────
# D = Drought, W = Well-watered; 73 = HY73 hybrid, 7B = HH7B parent2, H3 = HH3 parent1
cols <- colnames(expr)
hy73_ctrl <- cols[grepl("^W73_", cols)]     # W73_1/2/3 = well-watered HY73
hy73_dr   <- cols[grepl("^D73_", cols)]     # D73_1/2/3 = drought HY73
hh3_ctrl  <- cols[grepl("^WH3_", cols)]     # WH3_1/2/3 = well-watered HH3
hh3_dr    <- cols[grepl("^DH3_", cols)]     # DH3_1/2/3 = drought HH3
hh7b_ctrl <- cols[grepl("^W7B_", cols)]     # W7B_1/2/3 = well-watered HH7B
hh7b_dr   <- cols[grepl("^D7B_", cols)]     # D7B_1/2/3 = drought HH7B

cat("HY73 ctrl:    ", paste(hy73_ctrl,  collapse=", "), "\n")
cat("HY73 drought: ", paste(hy73_dr,    collapse=", "), "\n")
cat("HH3 ctrl:     ", paste(hh3_ctrl,   collapse=", "), "\n")
cat("HH3 drought:  ", paste(hh3_dr,     collapse=", "), "\n")
cat("HH7B ctrl:    ", paste(hh7b_ctrl,  collapse=", "), "\n")
cat("HH7B drought: ", paste(hh7b_dr,    collapse=", "), "\n")

# Fallback: generic ctrl vs drought (if specific naming fails)
if (length(hy73_ctrl) == 0) {
  ctrl_cols  <- cols[grepl("^W",   cols, ignore.case = FALSE)]
  dr_cols    <- cols[grepl("^D",   cols, ignore.case = FALSE)]
  cat("Generic detection — control:", paste(ctrl_cols, collapse=", "),
      "\ndrought:", paste(dr_cols, collapse=", "), "\n")
}

# ── 3. Auto-detect if data is counts or FPKM ─────────────────────────────────
vals <- as.numeric(unlist(expr[1:min(100, nrow(expr)), ]))
vals <- vals[!is.na(vals)]
is_counts <- length(vals) > 0 && all(vals >= 0) && mean(vals %% 1 == 0) > 0.95

cat("Data type detected:", if (is_counts) "integer counts (will try DESeq2)" else "continuous (FPKM/TPM, t-test)", "\n")

# ── 4. Contrast function ──────────────────────────────────────────────────────
calc_fpkm <- function(mat, cols_a, cols_b, label) {
  if (length(cols_a) == 0 || length(cols_b) == 0) return(NULL)
  a <- mat[, cols_a, drop=FALSE]; b <- mat[, cols_b, drop=FALSE]
  lfc <- log2((rowMeans(a)+PSEUDO)/(rowMeans(b)+PSEUDO))
  pv <- sapply(seq_len(nrow(mat)), function(i) {
    ai <- as.numeric(a[i,]); bi <- as.numeric(b[i,])
    if (sum(ai)+sum(bi)==0) return(NA_real_)
    tryCatch(t.test(ai, bi, var.equal=FALSE)$p.value, error=function(e) NA_real_)
  })
  data.frame(GeneID = rownames(mat)) |>
    mutate(!!paste0(label,"_log2FC") := round(lfc, 4),
           !!paste0(label,"_padj")   := round(p.adjust(pv,"BH"), 6))
}

run_deseq2 <- function(mat, treat_cols, ctrl_cols2, label) {
  if (!requireNamespace("DESeq2", quietly=TRUE))
    stop("Install DESeq2:  BiocManager::install('DESeq2')")
  sub <- round(mat[, c(ctrl_cols2, treat_cols), drop=FALSE])
  cd  <- data.frame(condition = factor(c(rep("ctrl",length(ctrl_cols2)),
                                         rep("treat",length(treat_cols))),
                                       levels=c("ctrl","treat")))
  dds <- DESeq2::DESeqDataSetFromMatrix(sub, cd, ~condition)
  dds <- DESeq2::DESeq(dds, quiet=TRUE)
  res <- DESeq2::results(dds, contrast=c("condition","treat","ctrl")) |>
    as.data.frame() |> tibble::rownames_to_column("GeneID")
  result <- data.frame(GeneID = res$GeneID,
                       lfc    = round(res$log2FoldChange, 4),
                       padj   = round(res$padj, 6),
                       stringsAsFactors = FALSE)
  colnames(result)[2] <- paste0(label, "_log2FC")
  colnames(result)[3] <- paste0(label, "_padj")
  result
}

calc_contrast <- if (is_counts) run_deseq2 else calc_fpkm

cat("\nCalculating contrasts ...\n")
contrasts_list <- list()
meta_contrasts <- list()
meta_desc      <- list()

if (length(hy73_ctrl) > 0) {
  pairs <- list(
    list(a=hy73_dr,  b=hy73_ctrl,  label="Drought_HY73",     name="Drought vs Control (HY73 hybrid)"),
    list(a=hh3_dr,   b=hh3_ctrl,   label="Drought_HH3",      name="Drought vs Control (HH3 parent)"),
    list(a=hh7b_dr,  b=hh7b_ctrl,  label="Drought_HH7B",     name="Drought vs Control (HH7B parent)"),
    list(a=hy73_dr,  b=hh3_dr,     label="HY73_vs_HH3_Drought", name="Hybrid vs Parent1 (drought)")
  )
  desc_map <- c(
    Drought_HY73          = "log2(drought / control) in Hanyou73 hybrid",
    Drought_HH3           = "log2(drought / control) in Hanhui3 parental line",
    Drought_HH7B          = "log2(drought / control) in Huhan7B parental line",
    HY73_vs_HH3_Drought   = "log2(hybrid HY73 / parent HH3) under drought — non-additive expression"
  )
  for (p in pairs) {
    res <- calc_contrast(expr, p$a, p$b, p$label)
    if (!is.null(res)) {
      contrasts_list <- c(contrasts_list, list(res))
      meta_contrasts[[p$name]] <- p$label
      meta_desc[[p$label]]     <- desc_map[[p$label]]
    }
  }
} else {
  res <- calc_contrast(expr, dr_cols, ctrl_cols, "Drought_vs_Control")
  contrasts_list <- list(res)
  meta_contrasts <- list("Drought vs Control" = "Drought_vs_Control")
  meta_desc      <- list(Drought_vs_Control = "log2(drought / control) — grain filling stage")
}

contrasts_list <- Filter(Negate(is.null), contrasts_list)
all_fc <- Reduce(function(a, b) left_join(a, b, by = "GeneID"), contrasts_list)

# ── 5. Build in-process annotation from data file columns ────────────────────
# The rice data file contains Gene Description, KO Name, Pathway Definition, etc.
# We use these to assign pathways without needing a separate annotation file.
cat("\nBuilding annotation from data file columns ...\n")

# Collect annotation columns from raw_all
get_col <- function(df, candidates) {
  hit <- intersect(candidates, colnames(df))
  if (length(hit) == 0) return(rep("", nrow(df)))
  as.character(df[[hit[1]]])
}

sym_col  <- get_col(raw_all, c("Gene Name","Gene_Name","Symbol"))
desc_col <- get_col(raw_all, c("Gene Description","Gene_Description","description","NR Description"))
ko_col   <- get_col(raw_all, c("KO Name","KO_Name","KO Description"))
pw_col   <- get_col(raw_all, c("Pathway Definition","Pathway_Definition","KEGG Pathway"))
go_col   <- get_col(raw_all, c("GO Description","GO Term","GO_Term"))

# Combine text for keyword matching
combined <- paste(desc_col, ko_col, pw_col, go_col, sep = " ")

# Pathway keyword rules (matches the Pathway.py logic used elsewhere)
PATHWAY_RULES <- list(
  Proline = "proline|P5CS|delta1-pyrroline|pyrroline-5-carboxylate",
  Glycine_Betaine = "betaine|choline|choline monooxygenase|betaine aldehyde",
  ABA = "abscisic|ABA|9-cis-epoxycarotenoid|NCED|xanthoxin|PYR|PYL|SnRK2",
  IAA = "auxin|indole-3-acetic|IAA[0-9]|YUCCA|PIN[0-9]|ARF[0-9]|TIR1|tryptophan-2-mono",
  Gibberellin_GA3 = "gibberellin|DELLA|GAI|GID1|GA20ox|GA3ox|ent-copalyl",
  Cytokinin = "cytokinin|isopentenyl|zeatin|LOG|ARR[0-9]|CRE1",
  Ethylene = "ethylene|ACC synthase|ACC oxidase|ACS[0-9]|ACO[0-9]|ERF|EIN3",
  Brassinosteroid = "brassinosteroid|brassinolide|BRI1|BAK1|BES1|BZR[0-9]|DWF",
  Jasmonate_JA = "jasmonate|jasmonic|JA-Ile|COI1|JAZ[0-9]|OPR[0-9]|allene oxide",
  Salicylate_SA = "salicylic|salicylate|SA-|NPR1|PR-|pathogenesis-related|benzoic acid",
  Strigolactone = "strigolactone|D14|MAX2|DWARF[0-9]|CCD7|CCD8",
  Beta_Carotene = "beta-carotene|beta.carotene|lycopene|phytoene",
  Lutein = "lutein|xanthophyll|violaxanthin|neoxanthin",
  Carotenoid = "carotenoid|carotene|xanthophyll|CRTISO|LCY",
  Vitamin_E_Tocopherol = "tocopherol|vitamin E|HPT|VTE[0-9]|homogentisate",
  Vitamin_C_Ascorbate = "ascorbate|L-ascorbic|GalLDH|vitamin C|MDHAR|DHAR",
  Vitamin_B1_Thiamine = "thiamine|thiamin|TPK|TH[12]|thiazole",
  Vitamin_B2_Riboflavin = "riboflavin|FAD |FMN |RIB[0-9]|lumazine",
  Vitamin_B6_Pyridoxine = "pyridoxine|pyridoxal|pyridoxamine|vitamin B6|PDX[0-9]",
  Folate = "folate|tetrahydrofolate|DHF|DHFR|dihydrofolate",
  Biotin = "biotin|bioA|bioB|bioC|bioD|bioF|bioH",
  Omega3_Fatty_Acid = "omega.3|linolenic|DHA|EPA|FAD3|FAD8|desaturase.*3",
  Omega6_Fatty_Acid = "omega.6|linoleic|arachidonic|FAD2|FAD6|desaturase.*6",
  Fatty_Acid = "fatty acid|acetyl-CoA carboxylase|FAS |acyl|enoyl|KASII",
  Wax_Cutin = "wax |cutin|cuticular|CER[0-9]|WAX|suberin|eceriferum",
  Cellulose = "cellulose|CesA|glucan synthase|CESA",
  Starch = "starch|amylose|amylopectin|granule-bound starch|Waxy|ADP-glucose|SSIIa",
  Sucrose = "sucrose|invertase|sucrose synthase|SPS[0-9]|SPP[0-9]|sucrose-phosphate",
  Trehalose = "trehalose|TPS[0-9]|TPP[0-9]|trehalose-6-phosphate",
  Inositol = "inositol|myo-inositol|phytic|IP3|MIPS",
  Glycolysis = "glycolysis|pyruvate kinase|PFK|GAPDH|phosphoglycerate|enolase|aldolase|PGI",
  Calvin_Cycle = "Calvin|RuBisCO|Rubisco|RubisCO|phosphoribulokinase|sedoheptulose|SBPase|FBPase",
  TCA_Cycle = "TCA cycle|citrate synthase|isocitrate|succinate|fumarate|malate dehydrogenase|aconitase|oxoglutarate",
  Pentose_Phosphate = "pentose phosphate|transketolase|transaldolase|glucose-6-phosphate dehydrogenase",
  Nitrogen_Assimilation = "nitrate reductase|nitrite reductase|glutamine synthetase|glutamate synthase|GOGAT|GS[12]|GDH",
  Purine = "purine|adenine|guanine|hypoxanthine|xanthine|HGPRT|PRPP|adenosine",
  Pyrimidine = "pyrimidine|uracil|cytosine|thymine|thymidine|dihydroorotase|CPS",
  Chlorophyll = "chlorophyll|porphyrin|Mg-chelatase|CHLH|CHLD|CHLI|protochlorophyllide|hemerythrin",
  Photosynthesis = "photosystem|PSI|PSII|Rubisco|ATP synthase|plastoquinone|ferredoxin|LHCII|LHCI",
  Flavonoid = "flavonoid|chalcone|flavone|flavonol|CHS|CHI|F3H|FLS|DFR",
  Terpenoid = "terpenoid|terpene|sesquiterpene|diterpene|MVA|MEP|GGPP|FPP|germacrene|linalool",
  Anthocyanin = "anthocyanin|anthocyanidine|pelargonidin|cyanidin|delphinidin|UFGT",
  Lignin = "lignin|monolignol|cinnamate|coumaryl|sinapyl|coniferyl|CAD|CCoAOMT|COMT|CCR",
  Glucosinolate = "glucosinolate|myrosinase|glucoraphanin|indole glucosinolate",
  Protein_Kinase_Signalling = "protein kinase|receptor kinase|serine/threonine kinase|MAP kinase kinase|CDK|cyclin",
  MAPK_Signalling = "MAPK|MAP kinase|MPK[0-9]|MKK[0-9]|MEK|ERK[0-9]|stress-activated",
  ROS_Scavenging = "superoxide dismutase|catalase|peroxidase|glutathione|ascorbate peroxidase|APX|SOD|CAT",
  Glutathione_Metabolism = "glutathione|GSH|GSSG|GR[0-9]|glutaredoxin|thioredoxin",
  Phospholipid_Biosynthesis = "phosphatidylcholine|phosphatidylethanolamine|phospholipid|CDP-diacylglycerol",
  tRNA_Aminoacylation = "aminoacyl-tRNA|tRNA ligase|tRNA synthetase",
  Translation = "ribosomal protein|ribosome|translation factor|eIF|EF-Tu|EF-G|peptidyl transferase",
  Transcription = "transcription factor|RNA polymerase|TATA|mediator|WRKY|MYB|NAC|bHLH|AP2|ERF",
  RNA_Processing = "splicing|spliceosome|RNA helicase|mRNA processing|snRNP|U2AF|SF3",
  Ubiquitin_Proteasome = "ubiquitin|proteasome|26S|E3 ligase|RING|SCF|CUL|ubiquitination",
  Chaperone = "chaperone|HSP[0-9]|heat shock protein|DnaK|GroEL|GRP|BiP|calreticulin",
  Glycine = "glycine|serine hydroxymethyltransferase|glycine decarboxylase|GCS",
  Tryptophan = "tryptophan|indole|TRP[A-Z]|anthranilate",
  Leucine = "leucine|IPMS|isopropylmalate|leucyl",
  Valine = "valine|threonine deaminase|acetolactate synthase|KARI|DHAD",
  Isoleucine = "isoleucine|threonine deaminase|2-ketobutyrate",
  Serine = "serine|phosphoserine|phosphoglycerate|PGDH|PSAT|PSP[1-9]",
  Alanine = "alanine aminotransferase|pyruvate aminotransferase|alanyl",
  Phenylalanine = "phenylalanine|PAL[0-9]|phenylalanine ammonia-lyase|arogenate",
  Tyrosine = "tyrosine|arogenate dehydrogenase|prephenate dehydrogenase|tyrosyl",
  Lysine = "lysine|diaminopimelate|aspartate kinase|lysyl",
  Methionine = "methionine|SAM synthetase|homocysteine|cystathionine|methionyl",
  Cysteine = "cysteine|O-acetylserine|cystathionine beta-lyase|cysteinyl",
  Histidine = "histidine|histidinol|ATP-phosphoribosyl|histidyl",
  Arginine = "arginine|ornithine|argininosuccinate|carbamoyl|arginase",
  Aspartate = "aspartate|aspartate aminotransferase|asparaginase|aspartyl",
  Glutamate = "glutamate|glutamine synthetase|glutamate dehydrogenase|GDH|GOGAT",
  Asparagine = "asparagine|asparagine synthetase|asparaginase",
  Glutamine = "glutamine synthetase|GS[12]|glutaminyl",
  Threonine = "threonine|threonine synthase|aspartate kinase|threonyl"
)

assign_pathway <- function(txt) {
  txt <- tolower(txt)
  for (nm in names(PATHWAY_RULES)) {
    if (grepl(PATHWAY_RULES[[nm]], txt, perl = TRUE, ignore.case = TRUE)) return(nm)
  }
  "Unknown"
}

annot_in_file <- data.frame(
  GeneID      = gene_ids,
  Symbol      = sym_col,
  Description = desc_col,
  Pathway     = sapply(combined, assign_pathway, USE.NAMES = FALSE),
  stringsAsFactors = FALSE
)
cat("In-file annotation: pathway assignment done for", nrow(annot_in_file), "genes\n")
cat("Known pathways:", sum(annot_in_file$Pathway != "Unknown"), "\n")

# Also try to supplement with external annotation if available and IDs match
if (file.exists(ANNOT_FILE)) {
  annot_ext <- read.delim(ANNOT_FILE, stringsAsFactors = FALSE)
  # Normalize IDs: remove LOC_ prefix
  annot_in_file$GeneID_norm <- gsub("^LOC_", "", annot_in_file$GeneID)
  annot_ext$GeneID_norm     <- gsub("^LOC_", "", annot_ext$GeneID)
  ext_match <- sum(annot_in_file$GeneID_norm %in% annot_ext$GeneID_norm)
  cat("External annotation match:", ext_match, "genes\n")
}
annot <- annot_in_file

# ── 6. Merge and filter ───────────────────────────────────────────────────────
merged <- all_fc |>
  left_join(annot |> select(GeneID, Symbol, Description, Pathway), by = "GeneID") |>
  filter(Pathway %in% TARGET_PATHWAYS) |>
  select(Pathway, GeneID, Symbol, Description, everything())

cat("Annotated genes:", nrow(merged), "| Pathways:", length(unique(merged$Pathway)), "\n")
if (nrow(merged) > 0) print(sort(table(merged$Pathway), decreasing=TRUE)[1:20])

# ── 7. Save ───────────────────────────────────────────────────────────────────
write.table(merged, file = OUT_TSV, sep = "\t", quote = FALSE, row.names = FALSE)
cat("Saved:", OUT_TSV, "\n")

meta <- list(
  dataset_id         = "GSE315654",
  species            = "Oryza sativa",
  species_details    = "Hybrid rice Hanyou73 and parental lines Hanhui3, Huhan7B; drought at grain filling; Illumina NovaSeq X Plus; 3 replicates",
  geo_link           = "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE315654",
  technique          = paste0("RNA-seq · ", if(is_counts) "counts · DESeq2" else "FPKM · log2FC · t-test"),
  induction_type     = "Drought stress",
  induction_details  = "Irrigation withheld at early grain filling (GS71–GS83); hybrid vs parental lines; 3 biological replicates",
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
cat("Done. Update data_plant/registry.json to include GSE315654.\n")
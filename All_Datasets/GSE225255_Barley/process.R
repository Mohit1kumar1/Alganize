# ============================================================
# GSE225255 — Hordeum vulgare (barley)
# Drought stress: control vs 7-day drought treatment
# Two genotypes: BCS8 (susceptible) and BCS24 (tolerant)
# 3 biological replicates per genotype × condition = 12 samples
#
# Download required (place in this folder before running):
#   https://ftp.ncbi.nlm.nih.gov/geo/series/GSE225nnn/GSE225255/suppl/
#     GSE225255_1_genes_fpkm_expression.txt.gz
#
# Data type: FPKM → FPKM-based log2FC with Welch t-test + BH correction
#
# Contrasts:
#   Drought_vs_Control_BCS8   — drought response in susceptible genotype
#   Drought_vs_Control_BCS24  — drought response in tolerant genotype
#   BCS24_vs_BCS8_Drought     — tolerant vs susceptible under drought
#   BCS24_vs_BCS8_Control     — baseline genotype difference
#
# Outputs: log2fc.tsv + meta.json -> data_plant/GSE225255/
# Run from: All_Datasets/GSE225255_Barley/
# ============================================================

library(dplyr)
library(jsonlite)

setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

FPKM_FILE  <- "GSE225255_1_genes_fpkm_expression.txt.gz"
ANNOT_FILE <- "../../Annotation_file/genes_with_pathway_hordeum_vulgare.tsv"
OUT_TSV    <- "log2fc.tsv"
OUT_META   <- "meta.json"
TARGET_DIR <- "../../data_plant/GSE225255"

PSEUDO <- 0.01

TARGET_PATHWAYS <- c(
  "Proline","Glycine_Betaine","Beta_Carotene","Lutein","Carotenoid","ABA","IAA",
  "Gibberellin_GA3","Omega3_Fatty_Acid","Omega6_Fatty_Acid","Vitamin_E_Tocopherol",
  "Vitamin_C_Ascorbate","Vitamin_B1_Thiamine","Vitamin_B2_Riboflavin",
  "Vitamin_B6_Pyridoxine","Folate","Biotin","Niacin_Nicotinamide",
  "Cytokinin","Ethylene","Brassinosteroid","Jasmonate_JA","Salicylate_SA",
  "Strigolactone","Trehalose","Inositol","Fatty_Acid","Wax_Cutin","Cellulose",
  "Starch","Sucrose","Glycolysis","Calvin_Cycle","TCA_Cycle","Pentose_Phosphate",
  "Purine","Pyrimidine","Nitrogen_Assimilation","Chlorophyll","Photosynthesis",
  "Flavonoid","Terpenoid","Anthocyanin","Lignin","Glucosinolate","Alkaloid",
  "Protein_Kinase_Signalling","MAPK_Signalling","ROS_Scavenging",
  "tRNA_Aminoacylation","Translation","Transcription","RNA_Processing",
  "Ubiquitin_Proteasome","Chaperone","Phospholipid_Biosynthesis","Glutathione_Metabolism",
  "Glycine","Tryptophan","Leucine","Valine","Isoleucine","Serine","Alanine",
  "Phenylalanine","Tyrosine","Lysine","Methionine","Cysteine","Histidine",
  "Arginine","Aspartate","Glutamate","Asparagine","Glutamine","Threonine"
)

# ── 1. Load FPKM data ─────────────────────────────────────────────────────────
cat("Reading FPKM:", FPKM_FILE, "\n")
if (!file.exists(FPKM_FILE))
  stop(paste("Download from GEO:\nhttps://ftp.ncbi.nlm.nih.gov/geo/series/",
             "GSE225nnn/GSE225255/suppl/GSE225255_1_genes_fpkm_expression.txt.gz"))

raw_all <- read.delim(gzfile(FPKM_FILE), row.names = 1, check.names = FALSE)
cat("Dimensions (raw):", nrow(raw_all), "x", ncol(raw_all), "\n")
cat("All columns:", paste(colnames(raw_all)[1:min(25, ncol(raw_all))], collapse=", "), "\n")

# Keep only numeric/FPKM columns; file mixes annotation + count + FPKM cols
fpkm_cols <- colnames(raw_all)[grepl("^FPKM\\.", colnames(raw_all))]
if (length(fpkm_cols) == 0) {
  # Fallback: keep only numeric columns
  fpkm_cols <- colnames(raw_all)[sapply(raw_all, is.numeric)]
}
cat("FPKM columns:", paste(fpkm_cols, collapse=", "), "\n")
fpkm <- raw_all[, fpkm_cols, drop=FALSE]

# Also extract annotation from the file for pathway matching
desc_col <- intersect(c("Description","description","gene_name"), colnames(raw_all))
go_col   <- intersect(c("GO","go"), colnames(raw_all))
annot_from_file <- data.frame(
  GeneID      = rownames(raw_all),
  Description = if(length(desc_col)>0) raw_all[[desc_col[1]]] else "",
  GO_Terms    = if(length(go_col)>0)   raw_all[[go_col[1]]]   else "",
  stringsAsFactors = FALSE
)

# ── 2. Sample group detection ─────────────────────────────────────────────────
# Actual columns: FPKM.W24CK1/2/3 (W24=week24/tolerant, CK=control, DR=drought)
#                 FPKM.W8CK1/2/3  (W8=week8/susceptible)
cols <- colnames(fpkm)
# Try W24/W8 genotype-specific groups
w24_ctrl    <- cols[grepl("W24CK|W24.*ctrl|W24.*CK",  cols, ignore.case=TRUE)]
w24_drought <- cols[grepl("W24DR|W24.*drought|W24.*DR",cols, ignore.case=TRUE)]
w8_ctrl     <- cols[grepl("W8CK|W8.*ctrl|W8.*CK",     cols, ignore.case=TRUE)]
w8_drought  <- cols[grepl("W8DR|W8.*drought|W8.*DR",   cols, ignore.case=TRUE)]
# Generic BCS patterns
bcs8_ctrl    <- cols[grepl("BCS8.*ctrl|BCS8.*CK", cols, ignore.case=TRUE)]
bcs8_drought <- cols[grepl("BCS8.*DR|BCS8.*drought", cols, ignore.case=TRUE)]
bcs24_ctrl   <- cols[grepl("BCS24.*ctrl|BCS24.*CK", cols, ignore.case=TRUE)]
bcs24_drought<- cols[grepl("BCS24.*DR|BCS24.*drought", cols, ignore.case=TRUE)]

cat("W24 ctrl:    ", paste(w24_ctrl,    collapse=", "), "\n")
cat("W24 drought: ", paste(w24_drought, collapse=", "), "\n")
cat("W8 ctrl:     ", paste(w8_ctrl,     collapse=", "), "\n")
cat("W8 drought:  ", paste(w8_drought,  collapse=", "), "\n")

# ── 3. Contrast calculation ───────────────────────────────────────────────────
calc_contrast <- function(mat, cols_a, cols_b, label) {
  if (length(cols_a) == 0 || length(cols_b) == 0)
    return(NULL)
  a   <- mat[, cols_a, drop = FALSE]
  b   <- mat[, cols_b, drop = FALSE]
  lfc <- log2((rowMeans(a) + PSEUDO) / (rowMeans(b) + PSEUDO))
  pv  <- sapply(seq_len(nrow(mat)), function(i) {
    ai <- as.numeric(a[i, ]); bi <- as.numeric(b[i, ])
    if (sum(ai) + sum(bi) == 0) return(NA_real_)
    tryCatch(t.test(ai, bi, var.equal = FALSE)$p.value, error = function(e) NA_real_)
  })
  data.frame(GeneID = rownames(mat)) |>
    mutate(!!paste0(label,"_log2FC") := round(lfc, 4),
           !!paste0(label,"_padj")   := round(p.adjust(pv,"BH"), 6))
}

cat("\nCalculating contrasts ...\n")
contrasts_list <- list()
meta_contrasts <- list()
meta_desc      <- list()

if (length(w24_ctrl) > 0) {
  # W24 = tolerant genotype, W8 = susceptible genotype (week timepoints)
  r1 <- calc_contrast(fpkm, w24_drought, w24_ctrl, "Drought_W24")
  r2 <- calc_contrast(fpkm, w8_drought,  w8_ctrl,  "Drought_W8")
  r3 <- calc_contrast(fpkm, w24_drought, w8_drought,"W24_vs_W8_Drought")
  r4 <- calc_contrast(fpkm, w24_ctrl,    w8_ctrl,   "W24_vs_W8_Control")
  contrasts_list <- Filter(Negate(is.null), list(r1,r2,r3,r4))
  meta_contrasts <- list(
    "Drought vs Control (W24 tolerant)" = "Drought_W24",
    "Drought vs Control (W8 susceptible)"= "Drought_W8",
    "W24 vs W8 (drought)"               = "W24_vs_W8_Drought",
    "W24 vs W8 (control)"               = "W24_vs_W8_Control"
  )
  meta_desc <- list(
    Drought_W24       = "log2(drought / control) in tolerant W24 genotype",
    Drought_W8        = "log2(drought / control) in susceptible W8 genotype",
    W24_vs_W8_Drought = "log2(tolerant W24 / susceptible W8) under drought",
    W24_vs_W8_Control = "log2(tolerant W24 / susceptible W8) under control"
  )
} else if (length(bcs8_ctrl) > 0) {
  r1 <- calc_contrast(fpkm, bcs8_drought, bcs8_ctrl,   "Drought_BCS8")
  r2 <- calc_contrast(fpkm, bcs24_drought, bcs24_ctrl, "Drought_BCS24")
  contrasts_list <- Filter(Negate(is.null), list(r1, r2))
  meta_contrasts <- list("Drought vs Control (BCS8)" = "Drought_BCS8",
                         "Drought vs Control (BCS24)"= "Drought_BCS24")
  meta_desc      <- list(Drought_BCS8  = "log2(drought / control) in BCS8",
                         Drought_BCS24 = "log2(drought / control) in BCS24")
} else {
  # Generic fallback
  ctrl_cols    <- cols[grepl("ctrl|control|CK|ww",  cols, ignore.case = TRUE)]
  drought_cols <- cols[grepl("drought|DR[0-9]|\\.DR",cols, ignore.case = TRUE)]
  r1 <- calc_contrast(fpkm, drought_cols, ctrl_cols, "Drought_vs_Control")
  contrasts_list <- Filter(Negate(is.null), list(r1))
  meta_contrasts <- list("Drought vs Control" = "Drought_vs_Control")
  meta_desc      <- list(Drought_vs_Control = "log2(drought 7d / control)")
}

contrasts_list <- Filter(Negate(is.null), contrasts_list)
all_fc <- Reduce(function(a, b) left_join(a, b, by = "GeneID"), contrasts_list)

# ── 4. Build in-process annotation from file's Description/GO/KEGG columns ───
# The FPKM file has Description, GO, KEGG, KO_ENTRY columns — use these
# for pathway keyword matching, similar to the rice approach.
get_col2 <- function(df, candidates) {
  hit <- intersect(candidates, colnames(df))
  if (length(hit) == 0) return(rep("", nrow(df)))
  as.character(df[[hit[1]]])
}

sym_col  <- get_col2(raw_all, c("gene_name","Symbol"))
desc_col <- get_col2(raw_all, c("Description","description"))
ko_col   <- get_col2(raw_all, c("KO_ENTRY","KO_Name","KO"))
kegg_col <- get_col2(raw_all, c("KEGG","kegg"))
go_col   <- get_col2(raw_all, c("GO","go_term","go"))
combined <- paste(desc_col, ko_col, kegg_col, go_col, sep = " ")

# Pathway rules matching TARGET_PATHWAYS keywords
PATHWAY_RULES <- list(
  Proline                   = "proline|P5CS|delta1-pyrroline|pyrroline-5-carboxylate",
  Glycine_Betaine           = "betaine|choline monooxygenase|betaine aldehyde",
  ABA                       = "abscisic|ABA|9-cis-epoxycarotenoid|NCED|PYR|SnRK2",
  IAA                       = "auxin|indole-3-acetic|IAA[0-9]|YUCCA|PIN[0-9]|ARF|TIR1",
  Gibberellin_GA3           = "gibberellin|DELLA|GAI|GID1|GA20ox|GA3ox|ent-copalyl",
  Cytokinin                 = "cytokinin|isopentenyl|zeatin|LOG|ARR[0-9]|CRE1",
  Ethylene                  = "ethylene|ACC synthase|ACC oxidase|ACS|ACO|ERF|EIN3",
  Brassinosteroid           = "brassinosteroid|brassinolide|BRI1|BAK1|BES1|BZR|DWF",
  Jasmonate_JA              = "jasmonate|jasmonic|COI1|JAZ|OPR|allene oxide",
  Salicylate_SA             = "salicylic|salicylate|NPR1|PR-|pathogenesis-related",
  Strigolactone             = "strigolactone|D14|MAX2|DWARF[0-9]|CCD7|CCD8",
  Beta_Carotene             = "beta-carotene|beta.carotene|lycopene|phytoene",
  Lutein                    = "lutein|xanthophyll|violaxanthin|neoxanthin",
  Carotenoid                = "carotenoid|carotene|xanthophyll|CRTISO|LCY",
  Vitamin_E_Tocopherol      = "tocopherol|vitamin E|HPT|VTE|homogentisate",
  Vitamin_C_Ascorbate       = "ascorbate|L-ascorbic|GalLDH|vitamin C|MDHAR|DHAR",
  Vitamin_B1_Thiamine       = "thiamine|thiamin|thiazole|TPK",
  Vitamin_B2_Riboflavin     = "riboflavin|FAD |FMN |lumazine",
  Vitamin_B6_Pyridoxine     = "pyridoxine|pyridoxal|pyridoxamine|PDX",
  Folate                    = "folate|tetrahydrofolate|DHF|DHFR",
  Biotin                    = "biotin|bio[ABCDFH]",
  Omega3_Fatty_Acid         = "omega.3|linolenic|DHA|EPA|FAD3|FAD8|desaturase.*3",
  Omega6_Fatty_Acid         = "omega.6|linoleic|arachidonic|FAD2|FAD6|desaturase.*6",
  Fatty_Acid                = "fatty acid|acetyl-CoA carboxylase|FAS |acyl-ACP|KASII",
  Wax_Cutin                 = "wax |cutin|cuticular|CER[0-9]|WAX|suberin",
  Cellulose                 = "cellulose|CesA|glucan synthase",
  Starch                    = "starch|amylose|amylopectin|granule-bound starch|Waxy|ADP-glucose",
  Sucrose                   = "sucrose|invertase|sucrose synthase|SPS|sucrose-phosphate",
  Trehalose                 = "trehalose|TPS|TPP|trehalose-6-phosphate",
  Inositol                  = "inositol|myo-inositol|phytic|IP3|MIPS",
  Glycolysis                = "glycolysis|pyruvate kinase|PFK|GAPDH|phosphoglycerate|enolase|aldolase",
  Calvin_Cycle              = "Calvin|RuBisCO|Rubisco|phosphoribulokinase|SBPase|FBPase",
  TCA_Cycle                 = "TCA cycle|citrate synthase|isocitrate|succinate|fumarate|aconitase",
  Pentose_Phosphate         = "pentose phosphate|transketolase|transaldolase|glucose-6-phosphate dehydrogenase",
  Nitrogen_Assimilation     = "nitrate reductase|nitrite reductase|glutamine synthetase|GOGAT|GS[12]|GDH",
  Purine                    = "purine|adenine|guanine|hypoxanthine|xanthine|HGPRT|PRPP|adenosine",
  Pyrimidine                = "pyrimidine|uracil|cytosine|thymine|thymidine|dihydroorotase",
  Chlorophyll               = "chlorophyll|porphyrin|Mg-chelatase|CHLH|CHLD|CHLI|protochlorophyllide",
  Photosynthesis            = "photosystem|PSI|PSII|ATP synthase.*chloro|plastoquinone|ferredoxin|LHCII|LHCI",
  Flavonoid                 = "flavonoid|chalcone|flavone|flavonol|CHS|CHI|F3H|FLS|DFR",
  Terpenoid                 = "terpenoid|terpene|sesquiterpene|diterpene|MVA|MEP|GGPP|FPP",
  Anthocyanin               = "anthocyanin|anthocyanidine|cyanidin|pelargonidin|UFGT",
  Lignin                    = "lignin|monolignol|cinnamate|coumaryl|sinapyl|CAD|CCoAOMT|COMT|CCR",
  Glucosinolate             = "glucosinolate|myrosinase|glucoraphanin",
  Protein_Kinase_Signalling = "protein kinase|receptor kinase|serine/threonine kinase|CDK|cyclin-dependent",
  MAPK_Signalling           = "MAPK|MAP kinase|MPK[0-9]|MKK|MEK|stress-activated",
  ROS_Scavenging            = "superoxide dismutase|catalase|peroxidase|glutathione peroxidase|APX|SOD|CAT",
  Glutathione_Metabolism    = "glutathione|GSH|GSSG|glutaredoxin|thioredoxin",
  Phospholipid_Biosynthesis = "phosphatidylcholine|phosphatidylethanolamine|phospholipid|CDP-diacylglycerol",
  tRNA_Aminoacylation       = "aminoacyl-tRNA|tRNA ligase|tRNA synthetase",
  Translation               = "ribosomal protein|ribosome biogenesis|eIF|EF-Tu|EF-G|peptidyl transferase",
  Transcription             = "transcription factor|RNA polymerase II|WRKY|MYB|NAC|bHLH|AP2|ERF.*TF",
  RNA_Processing            = "splicing|spliceosome|RNA helicase|mRNA processing|snRNP",
  Ubiquitin_Proteasome      = "ubiquitin|proteasome|26S|E3 ligase|RING.*finger|SCF.*complex",
  Chaperone                 = "chaperone|HSP[0-9]|heat shock protein|DnaK|GroEL|BiP|calreticulin",
  Glycine                   = "glycine|serine hydroxymethyltransferase|glycine decarboxylase|GCS",
  Tryptophan                = "tryptophan|indole|TRP[A-Z]|anthranilate",
  Leucine                   = "leucine|isopropylmalate|leucyl-tRNA",
  Valine                    = "valine|acetolactate synthase|KARI|valinyl",
  Isoleucine                = "isoleucine|threonine deaminase|2-ketobutyrate",
  Serine                    = "serine|phosphoserine|phosphoglycerate dehydrogenase|PGDH|PSAT",
  Alanine                   = "alanine aminotransferase|pyruvate aminotransferase|alanyl",
  Phenylalanine             = "phenylalanine|PAL[0-9]|phenylalanine ammonia-lyase|arogenate dehydratase",
  Tyrosine                  = "tyrosine|arogenate dehydrogenase|prephenate dehydrogenase|tyrosyl",
  Lysine                    = "lysine|diaminopimelate|lysyl-tRNA",
  Methionine                = "methionine|SAM synthetase|homocysteine|methionyl",
  Cysteine                  = "cysteine|O-acetylserine|cystathionine beta-lyase|cysteinyl",
  Histidine                 = "histidine|histidinol|ATP-phosphoribosyl|histidyl",
  Arginine                  = "arginine|ornithine|argininosuccinate|carbamoyl|arginase",
  Aspartate                 = "aspartate|aspartate aminotransferase|asparaginase|aspartyl",
  Glutamate                 = "glutamate|glutamine synthetase|glutamate dehydrogenase|GOGAT",
  Asparagine                = "asparagine|asparagine synthetase",
  Glutamine                 = "glutamine synthetase|glutaminyl|GS[12]$",
  Threonine                 = "threonine|threonine synthase|threonyl"
)

assign_pathway_r <- function(txt) {
  txt <- tolower(txt)
  for (nm in names(PATHWAY_RULES)) {
    if (grepl(PATHWAY_RULES[[nm]], txt, perl = TRUE, ignore.case = TRUE)) return(nm)
  }
  "Unknown"
}

cat("Assigning pathways from in-file annotation...\n")
pathway_vec <- vapply(combined, assign_pathway_r, character(1), USE.NAMES = FALSE)
annot_infile <- data.frame(
  GeneID      = rownames(raw_all),
  Symbol      = sym_col,
  Description = desc_col,
  Pathway     = pathway_vec,
  stringsAsFactors = FALSE
)
cat("In-file annotation: known pathways =", sum(annot_infile$Pathway != "Unknown"), "\n")

# ── 5. Merge and filter ───────────────────────────────────────────────────────
all_fc2 <- all_fc  # rownames are HORVU locus IDs, same as annotation GeneID

merged <- all_fc2 |>
  left_join(annot_infile |> select(GeneID, Symbol, Description, Pathway), by = "GeneID") |>
  filter(Pathway %in% TARGET_PATHWAYS) |>
  select(Pathway, GeneID, Symbol, Description, everything())

cat("Annotated genes:", nrow(merged), "| Pathways:", length(unique(merged$Pathway)), "\n")
if (nrow(merged) > 0)
  print(sort(table(merged$Pathway), decreasing = TRUE)[1:20])

# ── 6. Save ───────────────────────────────────────────────────────────────────
write.table(merged, file = OUT_TSV, sep = "\t", quote = FALSE, row.names = FALSE)
cat("Saved:", OUT_TSV, "\n")

meta <- list(
  dataset_id         = "GSE225255",
  species            = "Hordeum vulgare",
  species_details    = "Spring barley; two genotypes: BCS8 (susceptible) and BCS24 (tolerant); 7-day drought treatment; Illumina NovaSeq 6000",
  geo_link           = "https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE225255",
  technique          = "RNA-seq · FPKM · log2FC · Welch t-test + BH correction",
  induction_type     = "Drought stress",
  induction_details  = "7-day drought stress (water withheld) vs well-watered control; 3 biological replicates per genotype × condition",
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
cat("Done. Update data_plant/registry.json to include GSE225255.\n")
# run_process.R — sources any process.R from the command line
# Usage:  Rscript run_process.R <absolute_path_to_process.R>
# Works outside RStudio by replacing the rstudioapi::getActiveDocumentContext() call.

args <- commandArgs(trailingOnly = TRUE)
if (length(args) == 0) stop("Usage: Rscript run_process.R <path_to_process.R>")

script_path <- normalizePath(args[1], winslash = "/")
script_dir  <- dirname(script_path)
setwd(script_dir)

# Read script and patch out rstudioapi::getActiveDocumentContext() calls
content <- readLines(script_path, warn = FALSE)
escaped_dir <- gsub("\\\\", "/", script_dir)
patched <- gsub(
  "setwd\\(dirname\\(rstudioapi::getActiveDocumentContext\\(\\)\\$path\\)\\)",
  paste0('setwd("', escaped_dir, '")'),
  content
)

cat("=== Running:", script_path, "===\n")
cat("Working directory:", getwd(), "\n\n")

eval(parse(text = paste(patched, collapse = "\n")))
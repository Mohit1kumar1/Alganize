"""
preprocess_for_browser.py
Generates two small JSON files from the large atlas.tsv:
  atlas_summary.json   — species + tissue counts, top-family colours
  atlas_umap_10k.json  — stratified 10 000-point sample for UMAP scatter
"""

import json, random, csv, math, os

HERE = os.path.dirname(os.path.abspath(__file__))

ATLAS      = os.path.join(HERE, "atlas.tsv")
PALETTE    = os.path.join(HERE, "family_palette.json")
PO_COUNTS  = os.path.join(HERE, "po_bucket_counts.json")
OUT_SUM    = os.path.join(HERE, "atlas_summary.json")
OUT_UMAP   = os.path.join(HERE, "atlas_umap_10k.json")

TARGET_N = 10_000

# ── Load palette & tissue counts ──────────────────────────────────────────────
with open(PALETTE) as f:
    palette = json.load(f)

with open(PO_COUNTS) as f:
    po_counts = json.load(f)

family_hex    = palette["hex"]
atlas_counts  = palette["atlas_counts"]

# ── Stream atlas.tsv once ─────────────────────────────────────────────────────
print("Streaming atlas.tsv …")
species_count = {}  # species -> n
family_count  = {}  # family -> n (derived from species via a manual lookup)
rows = []            # list of (x, y, species, po_term)

# Build a simple family lookup from palette top-20 families
# We'll bin by clade using family_palette.json later; for the scatter
# we colour by po_term bucket instead (simpler)

PO_BUCKETS = {
    "leaf": "leaf", "shoot": "leaf", "cotyledon": "leaf",
    "root": "root", "nodule": "root",
    "flower": "flower", "petal": "flower", "stamen": "flower", "pistil": "flower",
    "seed": "seed", "embryo": "embryo",
    "fruit": "fruit",
    "stem": "stem", "internode": "stem",
    "whole": "whole-plant", "seedling": "whole-plant", "callus": "whole-plant",
    "cell": "cell-culture",
}
PO_COLORS = {
    "leaf":         "#2ca02c",
    "root":         "#8c564b",
    "flower":       "#e377c2",
    "seed":         "#ff7f0e",
    "embryo":       "#d62728",
    "fruit":        "#9467bd",
    "stem":         "#bcbd22",
    "whole-plant":  "#17becf",
    "cell-culture": "#7f7f7f",
    "other":        "#BDBDBD",
}

def po_bucket(po_term):
    t = po_term.lower()
    for key, bucket in PO_BUCKETS.items():
        if key in t:
            return bucket
    return "other"

with open(ATLAS, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f, delimiter="\t")
    for row in reader:
        sp = row["species"]
        species_count[sp] = species_count.get(sp, 0) + 1
        po = row["po_term"]
        try:
            x = float(row["umap_1"])
            y = float(row["umap_2"])
        except (ValueError, KeyError):
            continue
        rows.append((x, y, sp, po))

print(f"  {len(rows):,} rows read, {len(species_count):,} species")

# ── Stratified sample ─────────────────────────────────────────────────────────
# Stratify by po_bucket so each tissue is represented
bucket_rows = {}
for r in rows:
    b = po_bucket(r[3])
    bucket_rows.setdefault(b, []).append(r)

sample = []
total = len(rows)
for b, brows in bucket_rows.items():
    n = max(1, round(TARGET_N * len(brows) / total))
    if len(brows) <= n:
        sample.extend(brows)
    else:
        random.seed(42)
        sample.extend(random.sample(brows, n))

# Trim/top-up to exactly TARGET_N
random.shuffle(sample)
sample = sample[:TARGET_N]

print(f"  UMAP sample: {len(sample):,} points")

umap_out = [
    {"x": round(r[0], 3), "y": round(r[1], 3),
     "sp": r[2], "po": po_bucket(r[3]),
     "c": PO_COLORS.get(po_bucket(r[3]), PO_COLORS["other"])}
    for r in sample
]

with open(OUT_UMAP, "w") as f:
    json.dump(umap_out, f, separators=(",", ":"))
print(f"  Saved: {OUT_UMAP}  ({os.path.getsize(OUT_UMAP)//1024} KB)")

# ── Top-30 species ────────────────────────────────────────────────────────────
top_species = sorted(species_count.items(), key=lambda x: -x[1])[:30]

# ── Summary JSON ──────────────────────────────────────────────────────────────
summary = {
    "n_samples": len(rows),
    "n_species": len(species_count),
    "top_species": [{"name": s, "count": c} for s, c in top_species],
    "family_counts": atlas_counts,
    "family_hex": family_hex,
    "tissue_counts": po_counts,
    "tissue_colors": PO_COLORS,
}

with open(OUT_SUM, "w") as f:
    json.dump(summary, f, separators=(",", ":"))
print(f"  Saved: {OUT_SUM}  ({os.path.getsize(OUT_SUM)//1024} KB)")
print("Done.")
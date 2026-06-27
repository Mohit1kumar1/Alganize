import urllib.request
import os
import sys

BASE_HF = "https://huggingface.co/spaces/mutwil/plant-atlas-viewer/resolve/main/data/prepared/"
BASE_API = "https://mutwil-plant-atlas-viewer.hf.space/api/download/"

HF_FILES = [
    "ATLAS_VERSION.json",
    "canonical_og_sets.json",
    "canonical_panels.json",
    "cluster_annot.json",
    "edge_clusters.json.gz",
    "family_palette.json",
    "fig1_organ_purity.png",
    "fig1_organ_purity_bounds.json",
    "fig1_organ_purity_grid.arrow",
    "fig1_organ_purity_summary.json",
    "id_to_og_arabidopsis.parquet",
    "id_to_og_barley.parquet",
    "id_to_og_brachy.parquet",
    "id_to_og_glycine.parquet",
    "id_to_og_maize.parquet",
    "id_to_og_medicago.parquet",
    "id_to_og_oryza.parquet",
    "id_to_og_populus.parquet",
    "id_to_og_sorghum.parquet",
    "id_to_og_tomato.parquet",
    "id_to_og_wheat.parquet",
    "marker_panels.json",
    "meta.arrow",
    "oc_heatmap.npz",
    "og_annotations.json",
    "og_breadth.json.gz",
    "og_cluster_means.tsv",
    "og_cluster_means_16.tsv",
    "og_cluster_means_256.tsv",
    "og_profile.json",
    "og_vocab.json",
    "partition_annot.json",
    "po_bucket_counts.json",
    "po_panels.json",
    "po_top_level_map.json",
    "points.arrow",
    "teagcn_topN.json.gz",
    "tissue_matched_panels.json",
    "top_panels.json",
    "trait_index.json",
    "traits.arrow",
]

API_FILES = [
    ("atlas.tsv", "atlas.tsv"),
    ("po_panels.tsv", "po_panels.tsv"),
    ("trait_panels.tsv", "trait_panels.tsv"),
]

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

def download(url, dest):
    if os.path.exists(dest):
        print(f"  SKIP (exists): {os.path.basename(dest)}")
        return
    print(f"  Downloading: {os.path.basename(dest)} ...", end=" ", flush=True)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=120) as r, open(dest, "wb") as f:
            total = 0
            while True:
                chunk = r.read(1024 * 256)
                if not chunk:
                    break
                f.write(chunk)
                total += len(chunk)
        size_mb = os.path.getsize(dest) / 1024 / 1024
        print(f"done ({size_mb:.2f} MB)")
    except Exception as e:
        print(f"FAILED: {e}")
        if os.path.exists(dest):
            os.remove(dest)

print(f"\n=== Downloading to: {OUT_DIR} ===\n")

print("--- HuggingFace data files ---")
for fname in HF_FILES:
    url = BASE_HF + fname + "?download=true"
    dest = os.path.join(OUT_DIR, fname)
    download(url, dest)

print("\n--- API bulk downloads ---")
for api_path, out_name in API_FILES:
    url = BASE_API + api_path
    dest = os.path.join(OUT_DIR, out_name)
    download(url, dest)

print("\n=== Done ===")

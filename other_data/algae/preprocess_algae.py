"""
preprocess_algae.py
Generates browser-ready JSON from the two expression datasets we have:
  algae_diel.json    — C. reinhardtii diel RNA-seq (E-GEOD-62671, TPM)
  algae_nstress.json — C. reinhardtii N-stress DE   (E-ENAD-12, log2FC)
"""
import json, os, csv, math

HERE  = os.path.dirname(os.path.abspath(__file__))
ATLAS = os.path.join(HERE, 'expression_atlas')
OUT_DIEL    = os.path.join(HERE, 'algae_diel.json')
OUT_NSTRESS = os.path.join(HERE, 'algae_nstress.json')

# ── Diel experiment group → time label ────────────────────────────────────────
# From E-GEOD-62671-configuration.xml
DIEL_ORDER = [('g1','ZT0'),('g6','ZT3'),('g7','ZT6'),('g8','ZT9'),
              ('g2','ZT12'),('g3','ZT15'),('g4','ZT18'),('g5','ZT21')]
DIEL_COL   = [g for g,_ in DIEL_ORDER]
DIEL_LABEL = [l for _,l in DIEL_ORDER]

# ── N-stress contrasts ────────────────────────────────────────────────────────
CONTRASTS = {
    'g2_g1': 'N-resupply 12h (cht7 vs wt)',
    'g4_g3': 'N-resupply 6h (cht7 vs wt)',
    'g6_g5': 'N-deprivation (cht7 vs wt)',
    'g8_g7': 'No stress (cht7 vs wt)',
}

# ══════════════════════════════════════════════════════════════════════════════
# 1. Diel
# ══════════════════════════════════════════════════════════════════════════════
print("Processing E-GEOD-62671 diel TPM …")
diel_path = os.path.join(ATLAS, 'E-GEOD-62671', 'E-GEOD-62671-tpms.tsv')
genes = {}   # gene_id -> {name, tpm[8]}

with open(diel_path, newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    for row in reader:
        if row.get('#') or (not row.get('Gene Name') and 'Gene Name' not in row):
            continue
        gid  = row.get('Gene ID', '') or list(row.keys())[0]
        # The first column is actually the index (Gene ID), second is Gene Name
        # csv.DictReader uses first row as header; first col is the gene ID col
        # Let's work with ordered keys
        cols = list(row.keys())
        # gene ID is the DictReader index key (first col)
        name = row.get('Gene Name', '') or ''
        tpms = []
        for g in DIEL_COL:
            try:
                tpms.append(float(row.get(g, 0) or 0))
            except ValueError:
                tpms.append(0.0)
        genes[list(row.keys())[0]] = {'name': name, 'tpm': tpms}

# Re-read properly using index_col
import sys
print(f"  {len(genes)} genes total")

# Actually let's re-read the file more cleanly
genes = {}
with open(diel_path, newline='', encoding='utf-8') as f:
    lines = f.readlines()

# Skip comment lines
data_lines = [l for l in lines if not l.startswith('#')]
header = data_lines[0].rstrip('\n').split('\t')
print("  Header (first 5):", header[:5])

for line in data_lines[1:]:
    parts = line.rstrip('\n').split('\t')
    if len(parts) < 2: continue
    row = dict(zip(header, parts))
    gid  = parts[0]
    name = row.get('Gene Name', '') or ''
    tpms = []
    for g in DIEL_COL:
        try:
            tpms.append(round(float(row.get(g, 0) or 0), 3))
        except ValueError:
            tpms.append(0.0)
    genes[gid] = {'name': name, 'tpm': tpms}

print(f"  {len(genes)} genes read")

# Score each gene by temporal variance (cycling)
scored = []
for gid, d in genes.items():
    t = d['tpm']
    mu  = sum(t) / len(t)
    var = sum((x - mu)**2 for x in t) / len(t)
    peak = max(t)
    scored.append((var, peak, gid, d['name'], t))

scored.sort(reverse=True)

# Keep all named genes + top 500 by variance (whichever is larger)
named_ids = {gid for gid, d in genes.items() if d['name'].strip()}
keep_top  = {gid for _, _, gid, _, _ in scored[:500]}
keep_ids  = named_ids | keep_top
print(f"  Named genes: {len(named_ids)}, top-500 by variance, keeping: {len(keep_ids)}")

diel_out = {
    'labels': DIEL_LABEL,
    'genes': {}
}
for _, _, gid, name, tpm in scored:
    if gid in keep_ids:
        diel_out['genes'][gid] = {'name': name, 'tpm': tpm}

# Top 30 cycling markers (highest variance) — prefer named genes
diel_out['top_cycling'] = []
for _, peak, gid, name, tpm in scored:
    if name:
        diel_out['top_cycling'].append({'id': gid, 'name': name, 'tpm': tpm})
        if len(diel_out['top_cycling']) >= 30:
            break
# Fallback: fill with unnamed top-variance genes if < 30 named
if len(diel_out['top_cycling']) < 30:
    for _, peak, gid, name, tpm in scored:
        if gid not in {g['id'] for g in diel_out['top_cycling']}:
            diel_out['top_cycling'].append({'id': gid, 'name': name or gid, 'tpm': tpm})
            if len(diel_out['top_cycling']) >= 30:
                break

print(f"  Top cycling markers: {len(diel_out['top_cycling'])}")

with open(OUT_DIEL, 'w') as f:
    json.dump(diel_out, f, separators=(',', ':'))
print(f"  Saved: {OUT_DIEL}  ({os.path.getsize(OUT_DIEL)//1024} KB)")

# ══════════════════════════════════════════════════════════════════════════════
# 2. N-stress DE
# ══════════════════════════════════════════════════════════════════════════════
print("\nProcessing E-ENAD-12 N-stress analytics …")
de_path = os.path.join(ATLAS, 'E-ENAD-12', 'E-ENAD-12-analytics.tsv')

rows = []
with open(de_path, newline='', encoding='utf-8') as f:
    lines = [l for l in f if not l.startswith('#')]

header = lines[0].rstrip('\n').split('\t')
print("  Header:", header)

for line in lines[1:]:
    parts = line.rstrip('\n').split('\t')
    row = dict(zip(header, parts))
    rows.append(row)

print(f"  {len(rows)} rows")

nstress_out = {'contrasts': {}}
for cid, label in CONTRASTS.items():
    pv_col  = f'{cid}.p-value'
    fc_col  = f'{cid}.log2foldchange'
    genes_c = []
    for row in rows:
        try:
            pv = float(row.get(pv_col, 'nan') or 'nan')
            fc = float(row.get(fc_col, 'nan') or 'nan')
        except ValueError:
            continue
        if math.isnan(pv) or math.isnan(fc): continue
        gid  = row.get('Gene ID', '')
        name = row.get('Gene Name', '') or ''
        genes_c.append({'id': gid, 'name': name, 'fc': round(fc, 3), 'pv': round(pv, 6)})

    # Sort by abs(fc)
    genes_c.sort(key=lambda x: abs(x['fc']), reverse=True)
    nstress_out['contrasts'][cid] = {
        'label': label,
        'top': genes_c[:50],       # top 50 by abs(log2FC)
        'n_sig': sum(1 for g in genes_c if g['pv'] < 0.05 and abs(g['fc']) >= 1),
    }
    print(f"  {cid}: {len(genes_c)} genes with data, {nstress_out['contrasts'][cid]['n_sig']} sig (p<0.05 & |FC|>=1)")

with open(OUT_NSTRESS, 'w') as f:
    json.dump(nstress_out, f, separators=(',', ':'))
print(f"\nSaved: {OUT_NSTRESS}  ({os.path.getsize(OUT_NSTRESS)//1024} KB)")
print("Done.")
/* ═══════════════════════════════════════════════════════════════
   atlas.js  —  Plant Atlas (DANN v9, Mutwil Lab)
   Four tabs: Overview · Evolutionary Traits · UMAP · Gene Families
   ═══════════════════════════════════════════════════════════════ */

const ATLAS_ROOT = 'other_data';
const AT = {
  summary: null, traits: null, markers: null,
  clusterAnnot: null, ogMeans: null, ogAnnot: null, umapData: null,
  charts: {},
  loaded: {},
};

/* ── helpers ─────────────────────────────────────────────────── */
const atEl = id => document.getElementById(id);
function atEsc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
async function atFetchJSON(path) {
  const r = await fetch(path); if (!r.ok) throw new Error(path);
  return r.json();
}

/* ── tab switching ───────────────────────────────────────────── */
function atlasShowTab(tab) {
  ['overview','traits','umap','og'].forEach(t => {
    atEl('atlas-tab-' + t).classList.toggle('active', t === tab);
    atEl('atlas-panel-' + t).hidden = (t !== tab);
  });
  if (tab === 'overview' && !AT.loaded.overview) initAtlasOverview();
  if (tab === 'traits'   && !AT.loaded.traits)   initAtlasTraits();
  if (tab === 'umap'     && !AT.loaded.umap)     initAtlasUMAP();
  if (tab === 'og'       && !AT.loaded.og)       initAtlasOG();
}

/* ══════════════════════════════════════════════════════════════
   TAB 1 — OVERVIEW
   ══════════════════════════════════════════════════════════════ */
async function initAtlasOverview() {
  AT.loaded.overview = true;
  const panel = atEl('atlas-panel-overview');
  panel.innerHTML = '<div class="loading"><div class="spinner"></div>Loading…</div>';

  try {
    AT.summary = await atFetchJSON(ATLAS_ROOT + '/atlas_summary.json');
    const s = AT.summary;

    const families = Object.entries(s.family_counts)
      .sort((a,b) => b[1]-a[1]).slice(0,15);
    const fHex = s.family_hex || {};

    panel.innerHTML = `
      <div class="atlas-kpi-row">
        <div class="atlas-kpi"><div class="atlas-kpi-val">${(s.n_samples||629983).toLocaleString()}</div><div class="atlas-kpi-label">RNA-seq samples</div></div>
        <div class="atlas-kpi"><div class="atlas-kpi-val">${(s.n_species||10741).toLocaleString()}</div><div class="atlas-kpi-label">Plant species</div></div>
        <div class="atlas-kpi"><div class="atlas-kpi-val">57</div><div class="atlas-kpi-label">Evo-devo traits</div></div>
        <div class="atlas-kpi"><div class="atlas-kpi-val">27,897</div><div class="atlas-kpi-label">Gene families (OGs)</div></div>
      </div>
      <div class="atlas-charts-row">
        <div class="atlas-chart-box">
          <div class="atlas-chart-title">Top Plant Families by Sample Count</div>
          <div style="position:relative;height:320px"><canvas id="atlas-family-chart"></canvas></div>
        </div>
        <div class="atlas-chart-box">
          <div class="atlas-chart-title">Tissue / Organ Breakdown</div>
          <div style="position:relative;height:320px"><canvas id="atlas-tissue-chart"></canvas></div>
        </div>
      </div>
      <div class="atlas-species-section">
        <div class="atlas-chart-title">Top 30 Species</div>
        <div class="atlas-species-grid" id="atlas-species-grid"></div>
      </div>`;

    /* family bar chart */
    const fCtx = atEl('atlas-family-chart').getContext('2d');
    AT.charts.family = new Chart(fCtx, {
      type: 'bar',
      data: {
        labels: families.map(f => f[0]),
        datasets: [{
          data: families.map(f => f[1]),
          backgroundColor: families.map(f => fHex[f[0]] || '#BDBDBD'),
          borderWidth: 0, borderRadius: 3,
        }]
      },
      options: {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { font: { size: 10 }, callback: v => (v/1000).toFixed(0)+'k' } },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } },
        },
        responsive: true, maintainAspectRatio: false,
      }
    });

    /* tissue donut */
    const tissues = Object.entries(s.tissue_counts||{}).sort((a,b)=>b[1]-a[1]);
    const tColors = s.tissue_colors || {};
    const tCtx = atEl('atlas-tissue-chart').getContext('2d');
    AT.charts.tissue = new Chart(tCtx, {
      type: 'doughnut',
      data: {
        labels: tissues.map(t => t[0]),
        datasets: [{
          data: tissues.map(t => t[1]),
          backgroundColor: tissues.map(t => tColors[t[0]] || '#BDBDBD'),
          borderWidth: 2, borderColor: 'var(--bg)',
        }]
      },
      options: {
        plugins: {
          legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 14, padding: 10 } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw.toLocaleString()} samples` } },
        },
        responsive: true, maintainAspectRatio: false,
      }
    });

    /* top species list */
    const specGrid = atEl('atlas-species-grid');
    specGrid.innerHTML = (s.top_species||[]).map((sp,i) =>
      `<div class="atlas-species-row">
         <span class="atlas-species-rank">${i+1}</span>
         <span class="atlas-species-name">${atEsc(sp.name)}</span>
         <span class="atlas-species-count">${sp.count.toLocaleString()}</span>
       </div>`
    ).join('');

  } catch(e) {
    panel.innerHTML = `<div class="empty">Failed to load atlas summary: ${atEsc(e.message)}</div>`;
  }
}

/* ══════════════════════════════════════════════════════════════
   TAB 2 — EVOLUTIONARY TRAITS
   ══════════════════════════════════════════════════════════════ */
const QUAL_BADGE = { high: ['atlas-qual-hi','high'], mixed: ['atlas-qual-mid','mixed'], confounded: ['atlas-qual-lo','⚠ confounded'] };

async function initAtlasTraits() {
  AT.loaded.traits = true;
  const panel = atEl('atlas-panel-traits');
  panel.innerHTML = '<div class="loading"><div class="spinner"></div>Loading traits…</div>';
  try {
    [AT.traits, AT.markers] = await Promise.all([
      atFetchJSON(ATLAS_ROOT + '/trait_index.json'),
      atFetchJSON(ATLAS_ROOT + '/marker_panels.json'),
    ]);
    renderAtlasTraitGrid('');
  } catch(e) {
    panel.innerHTML = `<div class="empty">Failed to load traits: ${atEsc(e.message)}</div>`;
  }
}

function renderAtlasTraitGrid(filter) {
  const panel = atEl('atlas-panel-traits');
  const q = filter.toLowerCase();
  const visible = AT.traits.filter(t =>
    !q || t.name.toLowerCase().includes(q) || (t.expected_gene_families||'').toLowerCase().includes(q)
  );

  panel.innerHTML = `
    <div class="atlas-search-row">
      <input class="atlas-search-input" placeholder="Filter traits…" oninput="renderAtlasTraitGrid(this.value)" value="${atEsc(filter)}"/>
      <span class="atlas-search-count">${visible.length} / ${AT.traits.length} traits</span>
    </div>
    <div class="atlas-trait-grid" id="atlas-trait-grid">
      ${visible.map(t => renderTraitCard(t)).join('')}
    </div>
    <div id="atlas-trait-detail" class="atlas-trait-detail" hidden></div>`;
}

function renderTraitCard(t) {
  const [cls, label] = QUAL_BADGE[t.quality] || ['atlas-qual-mid', t.quality||''];
  return `<div class="atlas-trait-card" onclick="showAtlasTraitDetail('${atEsc(t.id)}')">
    <div class="atlas-trait-card-head">
      <span class="atlas-trait-name">${atEsc(t.name)}</span>
      <span class="${cls}">${label}</span>
    </div>
    <div class="atlas-trait-meta">
      <span class="atlas-trait-count">${(t.count||0).toLocaleString()} samples</span>
      <span class="atlas-trait-organ">${atEsc(t.key_organ||'')}</span>
    </div>
    <div class="atlas-trait-genes">${atEsc((t.expected_gene_families||'').slice(0,80))}${(t.expected_gene_families||'').length>80?'…':''}</div>
  </div>`;
}

function showAtlasTraitDetail(traitId) {
  const t = (AT.traits||[]).find(x => x.id === traitId);
  if (!t) return;
  const detail = atEl('atlas-trait-detail');
  if (!detail) return;

  /* Collect marker panels for this trait */
  const panels = t.panels || [];
  const allMarkers = panels.flatMap(pid => (AT.markers[pid]||[]).slice(0,10));
  const seen = new Set(); const dedupMarkers = [];
  for (const m of allMarkers) { if (!seen.has(m.og_id)) { seen.add(m.og_id); dedupMarkers.push(m); } }
  const top = dedupMarkers.slice(0,10);
  const maxFC = Math.max(...top.map(m => Math.abs(m.log2fc||0)), 1);

  detail.hidden = false;
  detail.innerHTML = `
    <div class="atlas-detail-header">
      <button class="atlas-detail-close" onclick="atEl('atlas-trait-detail').hidden=true">✕</button>
      <h3 class="atlas-detail-title">${atEsc(t.name)}</h3>
    </div>
    <div class="atlas-detail-meta">
      ${(t.count||0).toLocaleString()} samples · ${atEsc(t.key_organ||'')} · tissue: ${atEsc(t.tissue_matched?.default||'')}
    </div>
    <div class="atlas-detail-genes-label">Expected gene families:</div>
    <div class="atlas-detail-genes">${atEsc(t.expected_gene_families||'—')}</div>
    ${top.length ? `
      <div class="atlas-detail-table-label">Top marker OGs</div>
      <table class="atlas-marker-table">
        <thead><tr><th>OG</th><th>Description</th><th>log2FC</th><th>Specificity</th></tr></thead>
        <tbody>${top.map(m => {
          const pct = Math.round(Math.abs(m.log2fc||0) / maxFC * 100);
          const isUp = (m.log2fc||0) >= 0;
          return `<tr>
            <td><span class="atlas-og-id">${atEsc(m.og_id)}</span></td>
            <td class="atlas-marker-desc">${atEsc(m.description||'—')}</td>
            <td class="${isUp?'fc-up':'fc-dn'}">${(m.log2fc||0).toFixed(2)}</td>
            <td class="atlas-prev-cell">
              <div class="atlas-prev-bar-wrap"><div class="atlas-prev-bar ${isUp?'up':'dn'}" style="width:${pct}%"></div></div>
              <span class="atlas-prev-text">${Math.round((m.prev_pos||0)*100)}% pos / ${Math.round((m.prev_neg||0)*100)}% neg</span>
            </td>
          </tr>`;
        }).join('')}</tbody>
      </table>` : '<div class="empty" style="font-size:12px">No marker genes available for this trait.</div>'}
    `;

  detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ══════════════════════════════════════════════════════════════
   TAB 3 — UMAP
   ══════════════════════════════════════════════════════════════ */
const UMAP_TISSUE_LABELS = {
  leaf: 'Leaf / shoot', root: 'Root', flower: 'Flower',
  seed: 'Seed', embryo: 'Embryo', fruit: 'Fruit',
  stem: 'Stem', 'whole-plant': 'Whole plant / seedling',
  'cell-culture': 'Cell culture', other: 'Other',
};

async function initAtlasUMAP() {
  AT.loaded.umap = true;
  const panel = atEl('atlas-panel-umap');
  panel.innerHTML = '<div class="loading"><div class="spinner"></div>Loading 10,000-sample UMAP…</div>';

  try {
    AT.umapData = await atFetchJSON(ATLAS_ROOT + '/atlas_umap_10k.json');
    const buckets = {};
    for (const pt of AT.umapData) {
      if (!buckets[pt.po]) buckets[pt.po] = { color: pt.c, pts: [] };
      buckets[pt.po].pts.push({ x: pt.x, y: pt.y, sp: pt.sp });
    }

    panel.innerHTML = `
      <div class="atlas-umap-legend" id="atlas-umap-legend"></div>
      <div style="position:relative;height:520px;max-width:860px"><canvas id="atlas-umap-canvas"></canvas></div>
      <p class="atlas-umap-note">Stratified sample of 10,000 / 629,983 RNA-seq samples, coloured by tissue. UMAP 2D embedding — DANN v9 encoder (Mutwil Lab, NTU).</p>`;

    /* legend */
    const legend = atEl('atlas-umap-legend');
    legend.innerHTML = Object.entries(buckets).map(([po, b]) =>
      `<span class="atlas-legend-dot" style="background:${b.color}"></span><span class="atlas-legend-label">${UMAP_TISSUE_LABELS[po]||po} (${b.pts.length.toLocaleString()})</span>`
    ).join('');

    /* scatter */
    const ctx = atEl('atlas-umap-canvas').getContext('2d');
    AT.charts.umap = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: Object.entries(buckets).map(([po, b]) => ({
          label: UMAP_TISSUE_LABELS[po] || po,
          data: b.pts,
          backgroundColor: b.color + 'CC',
          pointRadius: 2, pointHoverRadius: 4,
          borderWidth: 0,
        }))
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: items => items[0]?.raw?.sp || '',
              label: ctx => `${ctx.dataset.label} (${ctx.parsed.x.toFixed(2)}, ${ctx.parsed.y.toFixed(2)})`,
            }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.04)' }, title: { display: true, text: 'UMAP 1', font: { size: 11 } } },
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, title: { display: true, text: 'UMAP 2', font: { size: 11 } } },
        },
        animation: false,
        responsive: true, maintainAspectRatio: false,
      }
    });

  } catch(e) {
    panel.innerHTML = `<div class="empty">Failed to load UMAP: ${atEsc(e.message)}</div>`;
  }
}

/* ══════════════════════════════════════════════════════════════
   TAB 4 — GENE FAMILIES
   ══════════════════════════════════════════════════════════════ */
async function initAtlasOG() {
  AT.loaded.og = true;
  const panel = atEl('atlas-panel-og');
  panel.innerHTML = '<div class="loading"><div class="spinner"></div>Loading gene family data (≈6 MB)…</div>';

  try {
    /* Load both in parallel */
    const [annotRaw, clusterRaw] = await Promise.all([
      atFetchJSON(ATLAS_ROOT + '/og_annotations.json'),
      atFetchJSON(ATLAS_ROOT + '/cluster_annot.json'),
    ]);
    AT.ogAnnot    = annotRaw;       /* {og_id: {description, cog}} */
    AT.clusterAnnot = clusterRaw;   /* {"0": {organ, order, ...}, ...} */

    /* Load OG means via PapaParse */
    panel.innerHTML = '<div class="loading"><div class="spinner"></div>Parsing OG expression matrix…</div>';
    await new Promise((resolve, reject) => {
      Papa.parse(ATLAS_ROOT + '/og_cluster_means_16.tsv', {
        download: true, header: true, dynamicTyping: true, skipEmptyLines: true,
        complete(results) {
          AT.ogMeans = {};
          for (const row of results.data) {
            if (row.og_id) AT.ogMeans[row.og_id] = row;
          }
          resolve();
        },
        error: reject,
      });
    });

    /* Build cluster label array */
    const clusterLabels = Object.keys(AT.clusterAnnot)
      .sort((a,b) => +a - +b)
      .map(k => {
        const c = AT.clusterAnnot[k];
        const organ = (c.organ||'').split(' ')[0];
        const sp    = (c.species||'').split(' ')[0];
        return `c${k.padStart(2,'0')} ${organ} ${sp}`;
      });

    panel.innerHTML = `
      <div class="atlas-og-header">
        <p class="atlas-og-desc">Browse expression profiles of 27,897 eggNOG orthologous gene families across 16 UMAP clusters. Each cluster is a group of biologically similar RNA-seq samples.</p>
        <div class="atlas-search-row">
          <input class="atlas-search-input" id="atlas-og-input" placeholder="Search OG ID (e.g. 37HDQ) or description…" oninput="searchAtlasOG(this.value)"/>
        </div>
      </div>
      <div id="atlas-og-results" class="atlas-og-results"></div>
      <div id="atlas-og-profile" class="atlas-og-profile" hidden>
        <div class="atlas-og-profile-header">
          <button class="atlas-detail-close" onclick="atEl('atlas-og-profile').hidden=true">✕</button>
          <span id="atlas-og-profile-title" class="atlas-og-profile-title"></span>
        </div>
        <div id="atlas-og-profile-desc" class="atlas-og-profile-desc"></div>
        <div style="position:relative;height:280px;max-width:860px"><canvas id="atlas-og-chart"></canvas></div>
        <div class="atlas-cluster-labels">
          ${clusterLabels.map((l,i) => `<span class="atlas-cluster-label">c${String(i).padStart(2,'0')}<br><small>${l.replace(/^c\d+ /,'').slice(0,14)}</small></span>`).join('')}
        </div>
      </div>`;

    AT._clusterLabels = clusterLabels;

  } catch(e) {
    panel.innerHTML = `<div class="empty">Failed to load OG data: ${atEsc(e.message)}</div>`;
  }
}

function searchAtlasOG(q) {
  const results = atEl('atlas-og-results');
  if (!results) return;
  const qt = q.trim().toLowerCase();
  if (!qt) { results.innerHTML = ''; return; }

  const matches = [];
  for (const [ogId, ann] of Object.entries(AT.ogAnnot||{})) {
    if (ogId.toLowerCase().includes(qt) || (ann.description||'').toLowerCase().includes(qt)) {
      matches.push([ogId, ann]);
      if (matches.length >= 50) break;
    }
  }

  if (!matches.length) { results.innerHTML = '<div class="atlas-og-empty">No gene families match this query.</div>'; return; }

  results.innerHTML = `<div class="atlas-og-count">${matches.length === 50 ? '50+ matches (showing first 50)' : matches.length + ' matches'}</div>` +
    matches.map(([id, ann]) => `
      <div class="atlas-og-row" onclick="renderAtlasOGProfile('${atEsc(id)}')">
        <span class="atlas-og-id">${atEsc(id)}</span>
        <span class="atlas-og-row-desc">${atEsc((ann.description||'—').slice(0,120))}</span>
        <span class="atlas-og-cog">COG: ${atEsc(ann.cog||'?')}</span>
      </div>`).join('');
}

function renderAtlasOGProfile(ogId) {
  const profile = atEl('atlas-og-profile');
  const row = AT.ogMeans[ogId];
  if (!row || !profile) return;

  const ann = (AT.ogAnnot||{})[ogId] || {};
  atEl('atlas-og-profile-title').textContent = ogId;
  atEl('atlas-og-profile-desc').textContent = ann.description || '—';

  const keys = Object.keys(row).filter(k => k.startsWith('c') && k !== 'og_id').sort();
  const vals = keys.map(k => +row[k] || 0);
  const labels = keys.map((k, i) => {
    const ca = AT.clusterAnnot?.[String(i)] || {};
    return (ca.organ||k).split(' ')[0];
  });

  profile.hidden = false;

  if (AT.charts.og) { AT.charts.og.destroy(); AT.charts.og = null; }
  const ctx = atEl('atlas-og-chart').getContext('2d');
  AT.charts.og = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: keys.map((k,i) => 'c' + String(i).padStart(2,'0')),
      datasets: [{
        label: 'Mean log1p(TPM)',
        data: vals,
        backgroundColor: vals.map(v => `rgba(99,153,34,${Math.min(1, 0.2 + v/6)})`),
        borderWidth: 0, borderRadius: 3,
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: {
          title: items => `Cluster ${items[0].label} — ${labels[items[0].dataIndex]}`,
          label: ctx => ` Mean log1p(TPM): ${ctx.raw.toFixed(3)}`,
        }}
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { grid: { color: 'rgba(0,0,0,.05)' }, title: { display: true, text: 'Mean log1p(TPM)', font: { size: 10 } } },
      },
      responsive: true, maintainAspectRatio: false,
    }
  });
  profile.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── entry point ─────────────────────────────────────────────── */
function initAtlasPage() {
  if (!AT.loaded.overview) initAtlasOverview();
}
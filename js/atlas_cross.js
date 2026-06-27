/* ═══════════════════════════════════════════════════════════════
   atlas_cross.js  —  Atlas data cross-referenced into the
                       main Microalgae and Plant browser tabs

   Feature 1: Arabidopsis gene → OG expression + trait membership
   Feature 2: Plant browser evo-devo trait context strip
   Feature 3: Microalgae browser — per-species database badge
   ═══════════════════════════════════════════════════════════════ */

const AX = {
  /* data caches */
  ogLookup:    null,   /* AT_id -> og_id */
  ogMeans:     null,   /* og_id -> {c00…c15} */
  ogAnnot:     null,   /* og_id -> {description, cog} */
  traitIndex:  null,   /* array of 57 trait objects */
  markerIndex: null,   /* og_id -> [{trait_id, trait_name, fc}] */
  clusterAnnot:null,   /* "0" -> {organ, order, …} */

  charts: {},
  traitExpanded: null,
  traitStripOpen: true,
};

const ATLAS_DATA = 'other_data';

/* ── Species → algae database coverage ──────────────────────── */
const ALGAE_DB_COVERAGE = {
  'Chlamydomonas reinhardtii':  ['ALCOdb','ALGAEFUN','PhytoNet','Alganaut','EBI Atlas','PhycoCosm'],
  'Phaeodactylum tricornutum':  ['Alganaut','DiatOmicBase','ALGAEFUN','PhytoNet','PhaeoEpiView','PhycoCosm'],
  'Thalassiosira pseudonana':   ['Alganaut','DiatOmicBase','PhycoCosm'],
  'Chromochloris zofingiensis': ['ALGAEFUN','PhycoCosm'],
  'Chlorella vulgaris':         ['PhycoCosm'],
  'Nannochloropsis oceanica':   ['NanDeSyn','ALGAEFUN','Alganaut'],
  'Dunaliella salina':          ['ALGAEFUN'],
  'Haematococcus lacustris':    ['ALGAEFUN'],
};
const ALGAE_DB_URLS = {
  'ALCOdb':      'http://alcodb.jp',
  'ALGAEFUN':    'https://greennetwork.us.es/AlgaeFUN/',
  'PhytoNet':    'http://www.gene2function.de',
  'Alganaut':    'https://alganaut.uts.edu.au',
  'EBI Atlas':   'https://www.ebi.ac.uk/gxa/home',
  'PhycoCosm':   'https://phycocosm.jgi.doe.gov',
  'DiatOmicBase':'https://www.diatomicsbase.bio.ens.psl.eu/',
  'PhaeoEpiView':'https://phaeoepiview.univ-nantes.fr/',
  'NanDeSyn':    'http://nandesyn.single-cell.cn',
};

/* ── Hook called after every renderMain() ────────────────────── */
function atlasOnRenderMain() {
  const page = S.page;
  if (page === 'plant')      { injectTraitStrip(); injectArabidopsisHooks(); }
  if (page === 'microalgae') { injectAlgaeBadge(); }
}

/* ══════════════════════════════════════════════════════════════
   FEATURE 3 — Algae database badge (microalgae browser)
   ══════════════════════════════════════════════════════════════ */
function injectAlgaeBadge() {
  /* Remove old badge if re-rendering */
  document.getElementById('ax-algae-badge')?.remove();

  const meta = S.allMeta[S.dataset];
  if (!meta) return;
  const species = meta.species || '';
  const dbs = ALGAE_DB_COVERAGE[species];
  if (!dbs) return;

  /* Insert after the .dataset-header block */
  const header = document.querySelector('#main-body .dataset-header');
  if (!header) return;

  const wrap = document.createElement('div');
  wrap.id = 'ax-algae-badge';
  wrap.className = 'ax-algae-badge';
  wrap.innerHTML = `
    <span class="ax-badge-label">Database coverage for <em>${esc(species)}</em></span>
    <div class="ax-badge-chips">
      ${dbs.map(db => {
        const url = ALGAE_DB_URLS[db] || '#';
        return `<a href="${url}" target="_blank" rel="noopener" class="ax-db-chip">${esc(db)} ↗</a>`;
      }).join('')}
    </div>`;
  header.insertAdjacentElement('afterend', wrap);
}

/* ══════════════════════════════════════════════════════════════
   FEATURE 2 — Evo-devo trait context strip (plant browser)
   ══════════════════════════════════════════════════════════════ */
const TRAIT_QUAL_CLS = { high: 'ax-tq-hi', mixed: 'ax-tq-mid', confounded: 'ax-tq-lo' };

function injectTraitStrip() {
  document.getElementById('ax-trait-strip')?.remove();

  const body = document.getElementById('main-body');
  if (!body) return;

  /* Insert after the .stat-row */
  const statRow = body.querySelector('.stat-row');
  if (!statRow) return;

  const strip = document.createElement('div');
  strip.id = 'ax-trait-strip';
  strip.className = 'ax-trait-strip';

  if (!AX.traitIndex) {
    strip.innerHTML = `<div class="ax-strip-head" onclick="axToggleTraitStrip()">
      <span class="ax-strip-title">Evo-devo Traits (Plant Atlas)</span>
      <span class="ax-strip-spinner">Loading…</span>
    </div>`;
    statRow.insertAdjacentElement('afterend', strip);
    loadTraitIndex().then(() => {
      if (document.getElementById('ax-trait-strip')) renderTraitStrip();
    });
    return;
  }
  statRow.insertAdjacentElement('afterend', strip);
  renderTraitStrip();
}

function renderTraitStrip() {
  const strip = document.getElementById('ax-trait-strip');
  if (!strip || !AX.traitIndex) return;
  const open = AX.traitStripOpen;

  strip.innerHTML = `
    <div class="ax-strip-head" onclick="axToggleTraitStrip()">
      <span class="ax-strip-title">Evo-devo Traits <span class="ax-strip-count">${AX.traitIndex.length}</span></span>
      <span class="ax-strip-source">Plant Atlas (DANN v9 · Mutwil Lab)</span>
      <span class="ax-strip-toggle">${open ? '▲' : '▼'}</span>
    </div>
    ${open ? `
    <div class="ax-trait-chips">
      ${AX.traitIndex.map(t => {
        const cls = TRAIT_QUAL_CLS[t.quality] || 'ax-tq-mid';
        return `<button class="ax-trait-chip ${cls} ${AX.traitExpanded===t.id?'ax-chip-active':''}"
          onclick="axShowTrait('${esc(t.id)}')"
          title="${esc(t.key_organ+' · '+t.count.toLocaleString()+' samples')}">
          ${esc(t.name)}
        </button>`;
      }).join('')}
    </div>
    <div id="ax-trait-detail" ${AX.traitExpanded ? '' : 'hidden'}>
      ${AX.traitExpanded ? renderTraitDetail(AX.traitExpanded) : ''}
    </div>` : ''}`;
}

function axToggleTraitStrip() {
  AX.traitStripOpen = !AX.traitStripOpen;
  renderTraitStrip();
}

function axShowTrait(id) {
  AX.traitExpanded = (AX.traitExpanded === id) ? null : id;
  renderTraitStrip();
  if (AX.traitExpanded) {
    requestAnimationFrame(() =>
      document.getElementById('ax-trait-detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    );
  }
}

function renderTraitDetail(id) {
  const t = AX.traitIndex.find(x => x.id === id);
  if (!t) return '';
  const [qlCls, qlLabel] = {
    high: ['ax-tq-hi','high confidence'],
    mixed: ['ax-tq-mid','mixed quality'],
    confounded: ['ax-tq-lo','confounded'],
  }[t.quality] || ['ax-tq-mid', t.quality];

  return `<div class="ax-trait-detail">
    <div class="ax-trait-detail-head">
      <span class="ax-trait-detail-name">${esc(t.name)}</span>
      <span class="${qlCls} ax-trait-ql">${qlLabel}</span>
    </div>
    <div class="ax-trait-detail-meta">
      ${t.count.toLocaleString()} samples · key organ: ${esc(t.key_organ)} · tissue: ${esc(t.tissue_matched?.default||'—')}
    </div>
    <div class="ax-trait-detail-genes">
      <span class="ax-trait-genes-label">Expected gene families:</span>
      <span class="ax-trait-genes-val">${esc(t.expected_gene_families || '—')}</span>
    </div>
  </div>`;
}

async function loadTraitIndex() {
  if (AX.traitIndex) return;
  try {
    const r = await fetch(`${ATLAS_DATA}/trait_index.json`);
    AX.traitIndex = await r.json();
  } catch(e) { AX.traitIndex = []; }
}

/* ══════════════════════════════════════════════════════════════
   FEATURE 1 — Arabidopsis gene → OG expression panel
   ══════════════════════════════════════════════════════════════ */
function injectArabidopsisHooks() {
  /* Only active for Arabidopsis dataset */
  if (!S.dataset || !S.allMeta[S.dataset]) return;
  if (S.allMeta[S.dataset].species !== 'Arabidopsis thaliana') return;

  /* Add click affordance hint */
  const tableHead = document.querySelector('#main-body .gene-table thead tr');
  if (tableHead && !tableHead.querySelector('.ax-og-col')) {
    const th = document.createElement('th');
    th.className = 'ax-og-col';
    th.textContent = 'Atlas OG';
    tableHead.appendChild(th);
  }

  /* Add OG badge to each row and click handler */
  const tbody = document.getElementById('gene-tbody');
  if (!tbody) return;
  tbody.querySelectorAll('tr[data-geneid]').forEach(tr => {
    if (tr.querySelector('.ax-og-btn')) return; // already injected
    const td = document.createElement('td');
    td.innerHTML = `<button class="ax-og-btn" onclick="axClickGene(event,'${esc(tr.dataset.geneid)}')">⊕</button>`;
    tr.appendChild(td);
  });
}

async function axClickGene(evt, geneId) {
  evt.stopPropagation();
  const bareId = geneId.split('.')[0];

  /* Load lookup if not cached */
  if (!AX.ogLookup) {
    const btn = evt.currentTarget;
    const origText = btn.textContent;
    btn.textContent = '…';
    try {
      const r = await fetch(`${ATLAS_DATA}/arabidopsis_og_lookup.json`);
      AX.ogLookup = await r.json();
    } catch(e) {
      btn.textContent = '!';
      return;
    }
    btn.textContent = origText;
  }

  const ogId = AX.ogLookup[bareId];
  if (!ogId) {
    axShowOGPanel(null, geneId, null, null);
    return;
  }

  /* Load heavy data lazily (once) */
  const needsHeavy = !AX.ogMeans || !AX.ogAnnot || !AX.clusterAnnot;
  if (needsHeavy) {
    axShowOGPanel('loading', geneId, ogId, null);
    await Promise.all([
      loadOGMeans(),
      loadOGAnnot(),
      loadClusterAnnot(),
    ]);
    /* Also build marker inverted index once */
    if (!AX.markerIndex) await loadMarkerIndex();
  }

  const means    = AX.ogMeans?.[ogId];
  const annot    = AX.ogAnnot?.[ogId];
  const traits   = AX.markerIndex?.[ogId] || [];
  axShowOGPanel('ready', geneId, ogId, { means, annot, traits });
}

function axShowOGPanel(state, geneId, ogId, payload) {
  let panel = document.getElementById('ax-og-panel');
  if (!panel) {
    const tablePanel = document.querySelector('#main-body .panel:last-of-type');
    if (!tablePanel) return;
    panel = document.createElement('div');
    panel.id = 'ax-og-panel';
    panel.className = 'ax-og-panel';
    tablePanel.insertAdjacentElement('afterend', panel);
  }

  if (state === 'loading') {
    panel.hidden = false;
    panel.innerHTML = `<div class="ax-og-panel-head">
      <span class="ax-og-panel-title">OG: <code>${esc(ogId)}</code> — <em>${esc(geneId)}</em></span>
      <button class="atlas-detail-close" onclick="axCloseOGPanel()">✕</button>
    </div>
    <div class="loading" style="padding:24px 0"><div class="spinner"></div>Loading atlas expression…</div>`;
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return;
  }

  if (state === null) {
    panel.hidden = false;
    panel.innerHTML = `<div class="ax-og-panel-head">
      <span class="ax-og-panel-title"><em>${esc(geneId)}</em></span>
      <button class="atlas-detail-close" onclick="axCloseOGPanel()">✕</button>
    </div>
    <div class="empty" style="padding:12px 0">No eggNOG orthologous group found for ${esc(geneId)}.</div>`;
    return;
  }

  const { means, annot, traits } = payload;
  if (!means) {
    panel.hidden = false;
    panel.innerHTML = `<div class="ax-og-panel-head">
      <span class="ax-og-panel-title">OG: <code>${esc(ogId)}</code> — <em>${esc(geneId)}</em></span>
      <button class="atlas-detail-close" onclick="axCloseOGPanel()">✕</button>
    </div>
    <div class="empty" style="padding:12px 0">Expression data not found for OG ${esc(ogId)}.</div>`;
    return;
  }

  /* Build cluster labels */
  const clusterKeys = Object.keys(means).filter(k => k.startsWith('c') && k !== 'og_id').sort();
  const clusterLabels = clusterKeys.map((k, i) => {
    const ca = AX.clusterAnnot?.[String(i)] || {};
    return (ca.organ || k).split(' ')[0].slice(0, 10);
  });
  const vals = clusterKeys.map(k => +means[k] || 0);

  const traitChips = traits.slice(0, 8).map(tr =>
    `<span class="ax-trait-chip ax-tq-mid" style="cursor:default">${esc(tr.trait_name)}</span>`
  ).join('');

  panel.hidden = false;
  panel.innerHTML = `
    <div class="ax-og-panel-head">
      <span class="ax-og-panel-title">OG: <code>${esc(ogId)}</code> — <em>${esc(geneId)}</em></span>
      <button class="atlas-detail-close" onclick="axCloseOGPanel()">✕</button>
    </div>
    ${annot ? `<div class="ax-og-desc">${esc(annot.description || '—')} · COG: <b>${esc(annot.cog || '?')}</b></div>` : ''}
    ${traits.length ? `<div class="ax-trait-membership">
      <span class="ax-tm-label">Evo-devo trait markers:</span> ${traitChips}
      ${traits.length > 8 ? `<span class="ax-tm-more">+${traits.length - 8} more</span>` : ''}
    </div>` : ''}
    <div class="ax-og-chart-title">Expression across 16 UMAP clusters (log1p TPM) — 629,983 plant RNA-seq samples</div>
    <div style="position:relative;height:220px;max-width:860px"><canvas id="ax-og-chart"></canvas></div>`;

  if (AX.charts.ogPanel) { AX.charts.ogPanel.destroy(); AX.charts.ogPanel = null; }
  const ctx = document.getElementById('ax-og-chart').getContext('2d');
  AX.charts.ogPanel = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: clusterKeys.map((k, i) => 'c' + String(i).padStart(2, '0')),
      datasets: [{
        data: vals,
        backgroundColor: vals.map(v => `rgba(99,153,34,${Math.min(1, 0.2 + v / 5)})`),
        borderWidth: 0, borderRadius: 3,
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: {
          title: items => `Cluster ${items[0].label} — ${clusterLabels[items[0].dataIndex]}`,
          label: ctx => ` ${ctx.raw.toFixed(3)} log1p(TPM)`,
        }},
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 9 } } },
        y: { grid: { color: 'rgba(0,0,0,.04)' }, title: { display: true, text: 'log1p(TPM)', font: { size: 10 } } },
      },
      animation: false, responsive: true, maintainAspectRatio: false,
    }
  });
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function axCloseOGPanel() {
  const p = document.getElementById('ax-og-panel');
  if (p) p.hidden = true;
  if (AX.charts.ogPanel) { AX.charts.ogPanel.destroy(); AX.charts.ogPanel = null; }
}

/* ── Data loaders ────────────────────────────────────────────── */
function loadOGMeans() {
  if (AX.ogMeans) return Promise.resolve();
  return new Promise((resolve) => {
    Papa.parse(`${ATLAS_DATA}/og_cluster_means_16.tsv`, {
      download: true, header: true, dynamicTyping: true, skipEmptyLines: true,
      complete(results) {
        AX.ogMeans = {};
        for (const row of results.data) {
          if (row.og_id) AX.ogMeans[row.og_id] = row;
        }
        resolve();
      },
      error: resolve,
    });
  });
}

async function loadOGAnnot() {
  if (AX.ogAnnot) return;
  try {
    const r = await fetch(`${ATLAS_DATA}/og_annotations.json`);
    AX.ogAnnot = await r.json();
  } catch(e) { AX.ogAnnot = {}; }
}

async function loadClusterAnnot() {
  if (AX.clusterAnnot) return;
  try {
    const r = await fetch(`${ATLAS_DATA}/cluster_annot.json`);
    AX.clusterAnnot = await r.json();
  } catch(e) { AX.clusterAnnot = {}; }
}

async function loadMarkerIndex() {
  if (AX.markerIndex) return;
  try {
    /* Build inverted index: og_id -> [{trait_id, trait_name, fc}] */
    const [panels, traitIdx] = await Promise.all([
      fetch(`${ATLAS_DATA}/marker_panels.json`).then(r => r.json()),
      AX.traitIndex ? Promise.resolve(AX.traitIndex) : fetch(`${ATLAS_DATA}/trait_index.json`).then(r => r.json()),
    ]);
    if (!AX.traitIndex) AX.traitIndex = traitIdx;

    /* Build panel_id -> trait map */
    const panelToTrait = {};
    for (const trait of traitIdx) {
      for (const pid of (trait.panels || [])) {
        panelToTrait[pid] = { id: trait.id, name: trait.name };
      }
    }
    /* Build inverted OG index */
    const idx = {};
    for (const [pid, markers] of Object.entries(panels)) {
      const trait = panelToTrait[pid];
      if (!trait) continue;
      for (const m of markers) {
        if (!idx[m.og_id]) idx[m.og_id] = [];
        idx[m.og_id].push({ trait_id: trait.id, trait_name: trait.name, fc: m.log2fc });
      }
    }
    AX.markerIndex = idx;
  } catch(e) { AX.markerIndex = {}; }
}
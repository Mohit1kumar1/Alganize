/* ═══════════════════════════════════════════════════════════════
   atlas_algae.js — Microalgae Atlas
   Four tabs: Landscape · Species Map · Diel Expression · N-Stress DE
   ═══════════════════════════════════════════════════════════════ */

const ALGAE_ROOT = 'other_data/algae';
const AG = {
  diel: null, nstress: null,
  charts: {},
  loaded: {},
};

/* ── helpers ─────────────────────────────────────────────────── */
const agEl = id => document.getElementById(id);
function agEsc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
async function agFetchJSON(path) {
  const r = await fetch(path); if (!r.ok) throw new Error(path);
  return r.json();
}

/* ── tab switching ───────────────────────────────────────────── */
function algaeShowTab(tab) {
  ['landscape','speciesmap','diel','nstress'].forEach(t => {
    agEl('algae-tab-' + t).classList.toggle('active', t === tab);
    agEl('algae-panel-' + t).hidden = (t !== tab);
  });
  if (tab === 'landscape'  && !AG.loaded.landscape)  initAlgaeLandscape();
  if (tab === 'speciesmap' && !AG.loaded.speciesmap)  initAlgaeSpeciesMap();
  if (tab === 'diel'       && !AG.loaded.diel)        initAlgaeDiel();
  if (tab === 'nstress'    && !AG.loaded.nstress)     initAlgaeNstress();
}

/* ══════════════════════════════════════════════════════════════
   STATIC METADATA (from info JSONs + DATA_OVERVIEW.md)
   ══════════════════════════════════════════════════════════════ */
const ALGAE_DBS = [
  { id:'alganaut',     name:'Alganaut',          species:10,  samples:1375, type:'RNA-seq compendium',   access:'preprint',      url:'https://alganaut.uts.edu.au',                    paper:'bioRxiv 2018',         color:'#4e79a7' },
  { id:'diatomicsbase',name:'DiatOmicBase',       species:3,   samples:1431, type:'RNA-seq / multi-omics',access:'web',           url:'https://www.diatomicsbase.bio.ens.psl.eu/',       paper:'Plant Journal 2025',   color:'#59a14f' },
  { id:'mmetsp',       name:'MMETSP',             species:306, samples:678,  type:'Transcriptome assembly',access:'Figshare (7 GB)',url:'https://figshare.com/articles/dataset/Marine_Microbial_Eukaryotic_Transcriptome_Sequencing_Project_re-assemblies/3840153', paper:'PLOS Biology 2014', color:'#f28e2b' },
  { id:'alcodb',       name:'ALCOdb',             species:2,   samples:172,  type:'Coexpression (RNA-seq)',access:'Zenodo',        url:'https://zenodo.org/records/10072283',            paper:'Plant Cell Physiol 2016', color:'#e15759' },
  { id:'algaefun',     name:'ALGAEFUN / MARACAS', species:14,  samples:null, type:'Coexpression / ChIP',  access:'web',           url:'https://greennetwork.us.es/AlgaeFUN/',           paper:'BMC Bioinformatics 2022', color:'#76b7b2' },
  { id:'expressionatlas',name:'EBI Expression Atlas',species:1,samples:32,  type:'Differential RNA-seq', access:'open download',  url:'https://www.ebi.ac.uk/gxa/home',                paper:'NAR 2020',             color:'#edc948' },
  { id:'nandesyn',     name:'NanDeSyn',            species:6,   samples:null, type:'Multi-omics (genomics/transcriptomics/proteomics)', access:'web', url:'http://nandesyn.single-cell.cn', paper:'Plant Journal 2020', color:'#b07aa1' },
  { id:'phycocosm',   name:'PhycoCosm (JGI)',     species:136, samples:null, type:'Genome / RNA-seq',    access:'JGI login',     url:'https://phycocosm.jgi.doe.gov',                  paper:'NAR 2021',             color:'#ff9da7' },
  { id:'phytonet',    name:'PhytoNet',            species:9,   samples:null, type:'Coexpression networks',access:'web',           url:'http://www.gene2function.de',                    paper:'NAR 2018',             color:'#9c755f' },
  { id:'phaeoepiview',name:'PhaeoEpiView',         species:1,   samples:null, type:'Epigenome browser',    access:'web (JBrowse2)', url:'https://phaeoepiview.univ-nantes.fr/',          paper:'Sci Reports 2023',     color:'#bab0ac' },
  { id:'cyanoomicsdb', name:'CyanoOmicsDB',        species:1,   samples:null, type:'Transcriptomics / proteomics', access:'web', url:'http://www.cyanoomics.cn/',                      paper:'NAR 2022',             color:'#a0cbe8' },
];

const ALGAE_SPECIES_MATRIX = [
  { name:'Chlamydomonas reinhardtii',  group:'Green algae',    dbs:['alcodb','algaefun','phytonet','alganaut','expressionatlas','phycocosm'] },
  { name:'Phaeodactylum tricornutum',  group:'Diatom',         dbs:['alganaut','diatomicsbase','algaefun','phytonet','phaeoepiview','phycocosm'] },
  { name:'Thalassiosira pseudonana',   group:'Diatom',         dbs:['alganaut','diatomicsbase','phycocosm'] },
  { name:'Nannochloropsis spp.',       group:'Ochrophyte',     dbs:['nandesyn','algaefun','alganaut'] },
  { name:'Emiliania huxleyi',          group:'Haptophyte',     dbs:['alganaut','phytonet'] },
  { name:'Micromonas pusilla',         group:'Green algae',    dbs:['alganaut','algaefun'] },
  { name:'Synechocystis PCC 6803',     group:'Cyanobacterium', dbs:['cyanoomicsdb','phytonet'] },
  { name:'Chromochloris zofingiensis', group:'Green algae',    dbs:['algaefun'] },
  { name:'Dunaliella salina',          group:'Green algae',    dbs:['algaefun'] },
  { name:'Haematococcus lacustris',    group:'Green algae',    dbs:['algaefun'] },
  { name:'Ectocarpus siliculosus',     group:'Brown alga',     dbs:['algaefun','phytonet'] },
  { name:'Cyanidioschyzon merolae',    group:'Red alga',       dbs:['alcodb','phytonet'] },
  { name:'Marine microeukaryotes (306 sp.)', group:'Mixed',   dbs:['mmetsp'] },
  { name:'Fragilariopsis cylindrus',   group:'Diatom',         dbs:['alganaut'] },
  { name:'Micromonas commoda',         group:'Green algae',    dbs:['mmetsp'] },
];

const GROUP_COLORS = {
  'Green algae':'#59a14f','Diatom':'#4e79a7','Haptophyte':'#f28e2b',
  'Ochrophyte':'#76b7b2','Cyanobacterium':'#edc948','Brown alga':'#b07aa1',
  'Red alga':'#e15759','Mixed':'#bab0ac',
};

const ACCESS_BADGE = {
  'web':'#6b7280','open download':'#059669','Zenodo':'#2563eb',
  'Figshare (7 GB)':'#dc2626','preprint':'#7c3aed','JGI login':'#9d174d',
  'web (JBrowse2)':'#6b7280',
};

/* ══════════════════════════════════════════════════════════════
   TAB 1 — DATABASE LANDSCAPE
   ══════════════════════════════════════════════════════════════ */
function initAlgaeLandscape() {
  AG.loaded.landscape = true;
  const panel = agEl('algae-panel-landscape');

  const totalSpecies = new Set(ALGAE_DBS.flatMap(d => [])); // rough
  const totalSamples = ALGAE_DBS.reduce((s,d) => s + (d.samples || 0), 0);

  /* Sample count bar chart data */
  const hasSamples = ALGAE_DBS.filter(d => d.samples).sort((a,b) => b.samples - a.samples);

  panel.innerHTML = `
    <div class="atlas-kpi-row">
      <div class="atlas-kpi"><div class="atlas-kpi-val">11</div><div class="atlas-kpi-label">Databases</div></div>
      <div class="atlas-kpi"><div class="atlas-kpi-val">3,500+</div><div class="atlas-kpi-label">Expression samples</div></div>
      <div class="atlas-kpi"><div class="atlas-kpi-val">300+</div><div class="atlas-kpi-label">Species catalogued</div></div>
      <div class="atlas-kpi"><div class="atlas-kpi-val">2014–2025</div><div class="atlas-kpi-label">Publication range</div></div>
    </div>
    <div class="algae-note">
      <span class="algae-note-icon">ℹ</span>
      No microalgae-specific UMAP-based RNA-seq atlas equivalent to the Plant Atlas exists as of mid-2026.
      The closest analog is Alganaut (1,375 samples, 10 species). This page aggregates the 11 best available resources.
    </div>
    <div class="atlas-chart-box" style="margin-bottom:22px">
      <div class="atlas-chart-title">Samples per Database (where reported)</div>
      <div style="position:relative;height:200px"><canvas id="algae-samples-chart"></canvas></div>
    </div>
    <div class="algae-db-grid" id="algae-db-grid">
      ${ALGAE_DBS.map(d => renderDbCard(d)).join('')}
    </div>`;

  const ctx = agEl('algae-samples-chart').getContext('2d');
  AG.charts.samples = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: hasSamples.map(d => d.name),
      datasets: [{
        data: hasSamples.map(d => d.samples),
        backgroundColor: hasSamples.map(d => d.color + 'CC'),
        borderWidth: 0, borderRadius: 4,
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.raw.toLocaleString()} samples` } }
      },
      scales: {
        x: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font:{size:10} } },
        y: { grid: { display: false }, ticks: { font:{size:11} } },
      },
      responsive: true, maintainAspectRatio: false,
    }
  });
}

function renderDbCard(d) {
  const badgeColor = ACCESS_BADGE[d.access] || '#6b7280';
  return `<div class="algae-db-card">
    <div class="algae-db-card-top">
      <span class="algae-db-dot" style="background:${d.color}"></span>
      <span class="algae-db-name">${agEsc(d.name)}</span>
      <span class="algae-db-badge" style="background:${badgeColor}20;color:${badgeColor};border:1px solid ${badgeColor}40">${agEsc(d.access)}</span>
    </div>
    <div class="algae-db-meta">
      <span>Species: <b>${d.species}</b></span>
      ${d.samples ? `<span>Samples: <b>${d.samples.toLocaleString()}</b></span>` : ''}
      <span>${agEsc(d.paper)}</span>
    </div>
    <div class="algae-db-type">${agEsc(d.type)}</div>
    <a href="${agEsc(d.url)}" target="_blank" rel="noopener" class="algae-db-link">Visit →</a>
  </div>`;
}

/* ══════════════════════════════════════════════════════════════
   TAB 2 — SPECIES MAP
   ══════════════════════════════════════════════════════════════ */
function initAlgaeSpeciesMap() {
  AG.loaded.speciesmap = true;
  const panel = agEl('algae-panel-speciesmap');

  const dbIds  = ALGAE_DBS.map(d => d.id);
  const dbName = Object.fromEntries(ALGAE_DBS.map(d => [d.id, d.name]));

  panel.innerHTML = `
    <p class="algae-map-desc">Which databases cover which microalgae species. Each cell shows presence (●) or absence.</p>
    <div class="algae-matrix-wrap">
      <table class="algae-matrix">
        <thead>
          <tr>
            <th class="algae-matrix-species-col">Species</th>
            <th class="algae-matrix-group-col">Group</th>
            ${dbIds.map(id => `<th class="algae-matrix-db-head" title="${agEsc(dbName[id])}">
              <div class="algae-matrix-db-rotated">${agEsc(dbName[id].replace(' / ',' / ').split(' ').slice(0,2).join(' '))}</div>
            </th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${ALGAE_SPECIES_MATRIX.map(sp => `
            <tr>
              <td class="algae-matrix-name"><em>${agEsc(sp.name)}</em></td>
              <td class="algae-matrix-group" style="color:${GROUP_COLORS[sp.group]||'#888'}">${agEsc(sp.group)}</td>
              ${dbIds.map(id => {
                const has = sp.dbs.includes(id);
                const db  = ALGAE_DBS.find(d => d.id === id);
                return `<td class="algae-matrix-cell ${has?'algae-mc-yes':'algae-mc-no'}"
                  style="${has ? 'color:' + db.color : ''}">
                  ${has ? '●' : '·'}
                </td>`;
              }).join('')}
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="algae-legend-row">
      ${Object.entries(GROUP_COLORS).map(([g,c]) =>
        `<span><span class="algae-legend-dot" style="background:${c}"></span>${agEsc(g)}</span>`
      ).join('')}
    </div>`;
}

/* ══════════════════════════════════════════════════════════════
   TAB 3 — DIEL EXPRESSION
   ══════════════════════════════════════════════════════════════ */
const DIEL_COLORS = [
  '#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd',
  '#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf',
];

async function initAlgaeDiel() {
  AG.loaded.diel = true;
  const panel = agEl('algae-panel-diel');
  panel.innerHTML = '<div class="loading"><div class="spinner"></div>Loading diel expression…</div>';
  try {
    AG.diel = await agFetchJSON(ALGAE_ROOT + '/algae_diel.json');
    renderAlgaeDiel();
  } catch(e) {
    panel.innerHTML = `<div class="empty">Failed to load diel data: ${agEsc(e.message)}</div>`;
  }
}

function renderAlgaeDiel() {
  const panel = agEl('algae-panel-diel');
  const labels = AG.diel.labels;

  panel.innerHTML = `
    <p class="algae-panel-desc">
      <b><em>Chlamydomonas reinhardtii</em> diel RNA-seq</b> — baseline expression across an 8-point 24 h light/dark cycle
      (zeitgeber time 0–21, 16 samples). Source: EBI Expression Atlas <a href="https://www.ebi.ac.uk/gxa/experiments/E-GEOD-62671" target="_blank" rel="noopener" class="algae-link">E-GEOD-62671</a>.
    </p>
    <div class="algae-diel-top">
      <div class="algae-chart-half">
        <div class="atlas-chart-title">Top 10 Cycling Genes (by temporal variance)</div>
        <div style="position:relative;height:300px"><canvas id="algae-diel-top-chart"></canvas></div>
      </div>
      <div class="algae-search-half">
        <div class="atlas-chart-title">Search gene</div>
        <div class="atlas-search-row">
          <input class="atlas-search-input" id="algae-diel-input" placeholder="Gene name or ID (e.g. RBCS, LHCB, CAB5)…" oninput="searchAlgaeDiel(this.value)"/>
        </div>
        <div id="algae-diel-results" class="algae-diel-results"></div>
      </div>
    </div>
    <div id="algae-diel-profile" class="atlas-og-profile" hidden>
      <div class="atlas-og-profile-header">
        <button class="atlas-detail-close" onclick="agEl('algae-diel-profile').hidden=true">✕</button>
        <span id="algae-diel-profile-title" class="atlas-og-profile-title"></span>
        <span id="algae-diel-profile-id" style="font-size:11px;color:var(--text-dim);margin-left:8px;font-family:var(--font-mono)"></span>
      </div>
      <div style="position:relative;height:240px;max-width:700px"><canvas id="algae-diel-profile-chart"></canvas></div>
    </div>`;

  /* Top-10 cycling genes line chart */
  const top = AG.diel.top_cycling.slice(0, 10);
  const ctx = agEl('algae-diel-top-chart').getContext('2d');
  AG.charts.dielTop = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: top.map((g, i) => ({
        label: g.name || g.id,
        data: g.tpm,
        borderColor: DIEL_COLORS[i % DIEL_COLORS.length],
        backgroundColor: 'transparent',
        borderWidth: 2, pointRadius: 3, tension: 0.3,
      }))
    },
    options: {
      plugins: {
        legend: { position: 'right', labels: { font:{size:10}, boxWidth:12, padding:8 } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.raw} TPM` } },
      },
      scales: {
        x: { grid:{ color:'rgba(0,0,0,.04)' }, title:{ display:true, text:'Zeitgeber time (h)', font:{size:10} } },
        y: { grid:{ color:'rgba(0,0,0,.04)' }, title:{ display:true, text:'TPM', font:{size:10} } },
      },
      responsive: true, maintainAspectRatio: false,
    }
  });
}

function searchAlgaeDiel(q) {
  const results = agEl('algae-diel-results');
  if (!results) return;
  const qt = q.trim().toLowerCase();
  if (!qt) { results.innerHTML = ''; return; }

  const matches = [];
  for (const [gid, d] of Object.entries(AG.diel.genes)) {
    if (gid.toLowerCase().includes(qt) || (d.name||'').toLowerCase().includes(qt)) {
      matches.push([gid, d]);
      if (matches.length >= 30) break;
    }
  }

  if (!matches.length) { results.innerHTML = '<div class="algae-og-empty">No genes match this query.</div>'; return; }
  results.innerHTML = matches.map(([id, d]) => {
    const peak = Math.max(...d.tpm).toFixed(1);
    return `<div class="atlas-og-row" onclick="showAlgaeDielProfile('${agEsc(id)}')">
      <span class="atlas-og-id">${agEsc(id)}</span>
      <span class="atlas-og-row-desc">${agEsc(d.name || '—')}</span>
      <span class="atlas-og-cog">peak: ${peak} TPM</span>
    </div>`;
  }).join('');
}

function showAlgaeDielProfile(gid) {
  const d = AG.diel.genes[gid];
  if (!d) return;
  const profile = agEl('algae-diel-profile');
  agEl('algae-diel-profile-title').textContent = d.name || gid;
  agEl('algae-diel-profile-id').textContent   = d.name ? gid : '';
  profile.hidden = false;

  if (AG.charts.dielProfile) { AG.charts.dielProfile.destroy(); }
  const ctx = agEl('algae-diel-profile-chart').getContext('2d');
  const maxTPM = Math.max(...d.tpm, 0.1);
  AG.charts.dielProfile = new Chart(ctx, {
    type: 'line',
    data: {
      labels: AG.diel.labels,
      datasets: [{
        label: d.name || gid,
        data: d.tpm,
        borderColor: '#639922',
        backgroundColor: 'rgba(99,153,34,0.08)',
        fill: true, borderWidth: 2.5, pointRadius: 5, tension: 0.3,
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.raw} TPM` } },
      },
      scales: {
        x: { grid:{color:'rgba(0,0,0,.04)'}, title:{display:true,text:'Zeitgeber time (h)',font:{size:10}} },
        y: { grid:{color:'rgba(0,0,0,.04)'}, min:0, title:{display:true,text:'TPM',font:{size:10}} },
      },
      responsive: true, maintainAspectRatio: false,
    }
  });
  profile.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

/* ══════════════════════════════════════════════════════════════
   TAB 4 — N-STRESS DE
   ══════════════════════════════════════════════════════════════ */
async function initAlgaeNstress() {
  AG.loaded.nstress = true;
  const panel = agEl('algae-panel-nstress');
  panel.innerHTML = '<div class="loading"><div class="spinner"></div>Loading N-stress data…</div>';
  try {
    AG.nstress = await agFetchJSON(ALGAE_ROOT + '/algae_nstress.json');
    renderAlgaeNstress(Object.keys(AG.nstress.contrasts)[0]);
  } catch(e) {
    panel.innerHTML = `<div class="empty">Failed to load N-stress data: ${agEsc(e.message)}</div>`;
  }
}

function renderAlgaeNstress(activeContrast) {
  const panel = agEl('algae-panel-nstress');
  const contrasts = AG.nstress.contrasts;
  const ids = Object.keys(contrasts);

  panel.innerHTML = `
    <p class="algae-panel-desc">
      <b><em>Chlamydomonas reinhardtii</em> nitrogen-stress DE</b> — <em>cht7</em> chromatin remodelling mutant vs wild type
      under nitrogen deprivation and re-supply conditions.
      Source: EBI Expression Atlas <a href="https://www.ebi.ac.uk/gxa/experiments/E-ENAD-12" target="_blank" rel="noopener" class="algae-link">E-ENAD-12</a>.
    </p>
    <div class="ct-tabbar" style="margin-bottom:20px">
      ${ids.map(id => `<button class="ct-tab${id===activeContrast?' active':''}" onclick="renderAlgaeNstress('${agEsc(id)}')">${agEsc(contrasts[id].label.replace(' (cht7 vs wt)',''))}</button>`).join('')}
    </div>
    ${renderNstressContrast(activeContrast)}`;
}

function renderNstressContrast(cid) {
  const c = AG.nstress.contrasts[cid];
  const top = c.top.slice(0, 20);
  const maxFC = Math.max(...top.map(g => Math.abs(g.fc)), 1);

  return `
    <div class="algae-ns-summary">
      <b>${c.n_sig.toLocaleString()}</b> significant genes (p &lt; 0.05, |log₂FC| ≥ 1) · contrast: <em>${agEsc(c.label)}</em>
    </div>
    <div class="algae-ns-layout">
      <div class="algae-chart-half">
        <div class="atlas-chart-title">Top 20 DE Genes — ${agEsc(cid)}</div>
        <div style="position:relative;height:380px"><canvas id="algae-ns-chart-${agEsc(cid)}"></canvas></div>
      </div>
      <div class="algae-ns-table-half">
        <div class="atlas-chart-title">Gene list (top 50 by |log₂FC|)</div>
        <table class="algae-ns-table">
          <thead><tr><th>Gene</th><th>Name</th><th>log₂FC</th><th>p-value</th></tr></thead>
          <tbody>
            ${c.top.slice(0,50).map(g => `<tr>
              <td class="atlas-og-id">${agEsc(g.id)}</td>
              <td>${agEsc(g.name||'—')}</td>
              <td class="${g.fc>=0?'fc-up':'fc-dn'}">${g.fc>0?'+':''}${g.fc.toFixed(2)}</td>
              <td style="font-family:var(--font-mono);font-size:10.5px;color:var(--text-dim)">${g.pv.toExponential(1)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

/* Draw the N-stress bar chart after rendering — called after DOM update */
function drawNstressChart(cid) {
  const canvas = agEl(`algae-ns-chart-${cid}`);
  if (!canvas) return;
  if (AG.charts['ns_' + cid]) return;
  const c = AG.nstress.contrasts[cid];
  const top = c.top.slice(0, 20);
  const ctx = canvas.getContext('2d');
  AG.charts['ns_' + cid] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top.map(g => g.name || g.id),
      datasets: [{
        label: 'log₂FC',
        data: top.map(g => g.fc),
        backgroundColor: top.map(g => g.fc >= 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)'),
        borderWidth: 0, borderRadius: 3,
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: {
          label: ctx => ` log₂FC: ${ctx.raw.toFixed(3)}`,
          afterLabel: (ctx) => { const g = top[ctx.dataIndex]; return ` p = ${g.pv.toExponential(1)}`; },
        }},
      },
      scales: {
        x: { grid:{ color:'rgba(0,0,0,.04)' }, title:{ display:true, text:'log₂ Fold Change', font:{size:10} } },
        y: { grid:{ display:false }, ticks:{ font:{size:10} } },
      },
      responsive: true, maintainAspectRatio: false,
    }
  });
}

/* Override renderAlgaeNstress to trigger chart draw after DOM insert */
const _renderNstressOrig = renderAlgaeNstress;
function renderAlgaeNstress(cid) {
  const panel = agEl('algae-panel-nstress');
  if (!AG.nstress) return;
  const contrasts = AG.nstress.contrasts;
  const ids = Object.keys(contrasts);

  panel.innerHTML = `
    <p class="algae-panel-desc">
      <b><em>Chlamydomonas reinhardtii</em> nitrogen-stress DE</b> — <em>cht7</em> chromatin remodelling mutant vs wild type
      under nitrogen deprivation and re-supply conditions.
      Source: EBI Expression Atlas <a href="https://www.ebi.ac.uk/gxa/experiments/E-ENAD-12" target="_blank" rel="noopener" class="algae-link">E-ENAD-12</a>.
    </p>
    <div class="ct-tabbar" style="margin-bottom:20px">
      ${ids.map(id => `<button class="ct-tab${id===cid?' active':''}" onclick="renderAlgaeNstress('${agEsc(id)}')">${agEsc(contrasts[id].label.replace(' (cht7 vs wt)',''))}</button>`).join('')}
    </div>
    ${renderNstressContrast(cid)}`;

  requestAnimationFrame(() => drawNstressChart(cid));
}

/* ── entry point ─────────────────────────────────────────────── */
function initAlgaeAtlasPage() {
  if (!AG.loaded.landscape) initAlgaeLandscape();
}
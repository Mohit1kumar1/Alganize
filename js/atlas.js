/* ═══════════════════════════════════════════════════════════════
   atlas.js  —  Plant Atlas (DANN v9, Mutwil Lab)
   3-panel layout: sidebar · UMAP canvas · legend+signature
   ═══════════════════════════════════════════════════════════════ */

const ATLAS_ROOT = 'other_data';

const ATV = {
  pts:         [],    // 10k UMAP points {x,y,sp,po,c}
  traits:      [],    // 57 trait objects
  ogAnnot:     null,
  ogMeans:     null,
  ogLookup:    null,
  clusterAnnot:null,

  colorMode:   'organ',
  traitSel:    new Set(),
  sortBy:      'quality',
  hideConf:    false,
  searchQ:     '',
  searchMode:  'filter', // 'filter' | 'gene'

  organColors: {},
  organLabels: {
    leaf:'Leaf / shoot', root:'Root', flower:'Flower',
    seed:'Seed', embryo:'Embryo', fruit:'Fruit',
    stem:'Stem', 'whole-plant':'Whole plant',
    'cell-culture':'Cell culture', other:'Other',
  },
  speciesColors: {},
  speciesCounts: {},

  // Canvas
  zoom: 1, panX: 0, panY: 0,
  dragging: false, dragX: 0, dragY: 0,
  wb: null, baseScale: 1,
  animFrame: null,
  dirty: true,

  // OG expression panel
  ogChart: null,
  sigChart: null,
  legendFilter: '',
  legendEntries: [],
};

const SPECIES_PAL = [
  '#4e79a7','#f28e2b','#e15759','#76b7b2','#59a14f',
  '#edc948','#b07aa1','#ff9da7','#9c755f','#2196f3',
  '#ff5722','#009688','#e91e63','#673ab7','#3f51b5',
  '#8bc34a','#ffc107','#795548','#607d8b','#00bcd4',
];
const CLUSTER_PAL = [
  '#e6194b','#3cb44b','#ffe119','#4363d8','#f58231',
  '#911eb4','#42d4f4','#f032e6','#bfef45','#fabed4',
  '#469990','#dcbeff','#9a6324','#fffac8','#800000','#aaffc3',
];
const QUAL_COL = { high:'#2ea378', clean:'#2ea378', mixed:'#f7b424', confounded:'#d63d3c', unknown:'#aaa' };

/* ── Entry ──────────────────────────────────────────────────── */
function initAtlasPage() {
  if (ATV.pts.length) { atvFitCanvas(); return; }
  atvLoadData();
}

async function atvLoadData() {
  const wrap = document.getElementById('atv-canvas-wrap');
  if (!wrap) return;
  wrap.innerHTML = '<div id="atv-load" class="atv-load-msg"><div class="spinner"></div>Loading atlas (10k UMAP points)…</div>';

  try {
    const [pts, traits] = await Promise.all([
      fetch(ATLAS_ROOT + '/atlas_umap_10k.json').then(r => r.json()),
      fetch(ATLAS_ROOT + '/trait_index.json').then(r => r.json()),
    ]);
    ATV.pts    = pts;
    ATV.traits = traits;

    wrap.innerHTML = '<canvas id="atv-umap-canvas"></canvas><div class="atv-tooltip" id="atv-tooltip" hidden></div>';

    atvBuildColorMaps();
    atvAssignClusters();
    atvInitCanvas();
    atvRenderTraitList();
    atvRenderLegend();
    atvScheduleDraw();
  } catch(e) {
    wrap.innerHTML = `<div class="empty" style="padding:40px">Failed to load atlas: ${e.message}</div>`;
  }
}

function atvBuildColorMaps() {
  for (const pt of ATV.pts) {
    if (!ATV.organColors[pt.po]) ATV.organColors[pt.po] = pt.c;
  }
  const counts = {};
  for (const pt of ATV.pts) counts[pt.sp] = (counts[pt.sp]||0)+1;
  ATV.speciesCounts = counts;
  Object.entries(counts).sort((a,b)=>b[1]-a[1]).forEach(([sp],i) => {
    ATV.speciesColors[sp] = i < SPECIES_PAL.length ? SPECIES_PAL[i] : '#cccccc';
  });
}

function atvAssignClusters() {
  const { minX, maxX, minY, maxY } = atvGetBounds();
  for (const pt of ATV.pts) {
    const ci_x = Math.min(3, Math.floor(((pt.x-minX)/(maxX-minX))*4));
    const ci_y = Math.min(3, Math.floor(((pt.y-minY)/(maxY-minY))*4));
    pt.ci = ci_y*4 + ci_x;
  }
}

function atvGetBounds() {
  if (ATV.wb) return ATV.wb;
  const xs = ATV.pts.map(p=>p.x), ys = ATV.pts.map(p=>p.y);
  const minX=Math.min(...xs), maxX=Math.max(...xs);
  const minY=Math.min(...ys), maxY=Math.max(...ys);
  ATV.wb = { minX, maxX, minY, maxY,
    midX:(minX+maxX)/2, midY:(minY+maxY)/2,
    spanX:maxX-minX, spanY:maxY-minY };
  return ATV.wb;
}

/* ── Canvas ──────────────────────────────────────────────────── */
function atvInitCanvas() {
  const canvas = document.getElementById('atv-umap-canvas');
  const wrap   = document.getElementById('atv-canvas-wrap');
  if (!canvas||!wrap) return;

  const resize = () => {
    canvas.width  = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
    atvCalcScale();
    atvScheduleDraw();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(wrap);

  atvCalcScale();

  canvas.addEventListener('wheel',      atvOnWheel,     {passive:false});
  canvas.addEventListener('mousedown',  atvOnMouseDown);
  canvas.addEventListener('mousemove',  atvOnMouseMove);
  canvas.addEventListener('mouseup',    ()=>{ ATV.dragging=false; });
  canvas.addEventListener('mouseleave', ()=>{ ATV.dragging=false; document.getElementById('atv-tooltip').hidden=true; });
}

function atvCalcScale() {
  const canvas = document.getElementById('atv-umap-canvas');
  if (!canvas) return;
  const b = atvGetBounds();
  const sx = canvas.width  / b.spanX;
  const sy = canvas.height / b.spanY;
  ATV.baseScale = Math.min(sx, sy) * 0.88;
}

function atvFitCanvas() {
  ATV.zoom=1; ATV.panX=0; ATV.panY=0;
  atvCalcScale();
  atvScheduleDraw();
}

function atvWorldToCanvas(wx, wy) {
  const canvas = document.getElementById('atv-umap-canvas');
  if (!canvas) return [0,0];
  const b = atvGetBounds();
  const s = ATV.baseScale * ATV.zoom;
  return [
    (wx - b.midX)*s + canvas.width/2  + ATV.panX,
    -(wy - b.midY)*s + canvas.height/2 + ATV.panY,
  ];
}

function atvCanvasToWorld(cx, cy) {
  const canvas = document.getElementById('atv-umap-canvas');
  if (!canvas) return [0,0];
  const b = atvGetBounds();
  const s = ATV.baseScale * ATV.zoom;
  return [
    (cx - canvas.width/2  - ATV.panX)/s + b.midX,
    -(cy - canvas.height/2 - ATV.panY)/s + b.midY,
  ];
}

function atvGetColor(pt, q) {
  if (q) {
    const m = pt.sp.toLowerCase().includes(q) || (pt.po||'').toLowerCase().includes(q);
    if (!m) return null; // will draw dim
  }
  switch (ATV.colorMode) {
    case 'organ':   return ATV.organColors[pt.po]  || '#999';
    case 'species': return ATV.speciesColors[pt.sp] || '#ccc';
    case 'cluster': return CLUSTER_PAL[pt.ci]       || '#999';
    case 'trait': {
      const qlMatch = [...ATV.traitSel].some(id => {
        const t = ATV.traits.find(x=>x.id===id);
        return t && (pt.po||'').toLowerCase().includes((t.key_organ||'').toLowerCase());
      });
      return qlMatch ? '#63991f' : '#cccccc';
    }
    default: return '#999';
  }
}

function atvScheduleDraw() {
  if (ATV.animFrame) cancelAnimationFrame(ATV.animFrame);
  ATV.animFrame = requestAnimationFrame(atvDraw);
}

function atvDraw() {
  const canvas = document.getElementById('atv-umap-canvas');
  if (!canvas || !ATV.pts.length) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const q = ATV.searchQ.toLowerCase();
  const hasFilter = !!q;

  // Background
  const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#f8f9fa';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0,0,W,H);

  // Two-pass: dim first, bright on top
  const bright = [];

  for (const pt of ATV.pts) {
    const [cx,cy] = atvWorldToCanvas(pt.x, pt.y);
    if (cx < -8 || cy < -8 || cx > W+8 || cy > H+8) continue;
    const color = atvGetColor(pt, hasFilter ? q : null);
    if (hasFilter && !color) {
      ctx.fillStyle = 'rgba(150,150,150,0.12)';
      ctx.beginPath(); ctx.arc(cx,cy,2,0,Math.PI*2); ctx.fill();
    } else {
      bright.push({cx,cy,color});
    }
  }

  ctx.globalAlpha = 0.78;
  for (const {cx,cy,color} of bright) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(cx,cy,2.5,0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/* ── Canvas events ───────────────────────────────────────────── */
function atvOnWheel(e) {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.15 : 1/1.15;
  const rect = e.target.getBoundingClientRect();
  const mx = e.clientX - rect.left, my = e.clientY - rect.top;
  const [wx,wy] = atvCanvasToWorld(mx,my);
  ATV.zoom = Math.max(0.4, Math.min(60, ATV.zoom*factor));
  const [nx,ny] = atvWorldToCanvas(wx,wy);
  ATV.panX += mx-nx; ATV.panY += my-ny;
  atvScheduleDraw();
}

function atvOnMouseDown(e) {
  ATV.dragging=true; ATV.dragX=e.clientX; ATV.dragY=e.clientY;
  e.target.style.cursor='grabbing';
}

function atvOnMouseMove(e) {
  if (ATV.dragging) {
    ATV.panX += e.clientX-ATV.dragX; ATV.panY += e.clientY-ATV.dragY;
    ATV.dragX=e.clientX; ATV.dragY=e.clientY;
    atvScheduleDraw(); return;
  }

  const rect = e.target.getBoundingClientRect();
  const mx = e.clientX-rect.left, my = e.clientY-rect.top;
  const [wx,wy] = atvCanvasToWorld(mx,my);
  const b = atvGetBounds();
  const hoverR = (b.spanX/200) / ATV.zoom;

  let nearest=null, minD=Infinity;
  for (const pt of ATV.pts) {
    const dx=pt.x-wx, dy=pt.y-wy, d=Math.hypot(dx,dy);
    if (d<hoverR && d<minD) { nearest=pt; minD=d; }
  }

  const tip = document.getElementById('atv-tooltip');
  if (nearest && tip) {
    tip.hidden=false;
    const ox = mx+14 > rect.width-160 ? mx-160 : mx+14;
    tip.style.left=ox+'px'; tip.style.top=(my-6)+'px';
    const label = ATV.organLabels[nearest.po]||nearest.po||'';
    tip.innerHTML=`<div class="atv-tt-sp"><em>${nearest.sp}</em></div><div class="atv-tt-po">${label}</div>`;
  } else if (tip) tip.hidden=true;
}

document.addEventListener('mouseup', ()=>{ ATV.dragging=false; const c=document.getElementById('atv-umap-canvas'); if(c)c.style.cursor='crosshair'; });

/* ── Controls ────────────────────────────────────────────────── */
function atvColorBy(mode) {
  ATV.colorMode = mode;
  document.querySelectorAll('.atv-radio-row').forEach(el =>
    el.classList.toggle('active', el.dataset.val===mode));
  atvRenderLegend();
  atvScheduleDraw();
}

function atvSearch(q) {
  const qt = q.trim();
  const upper = qt.toUpperCase();
  // Detect gene ID pattern: AT[0-9]G[0-9] or 5-char OG ID
  if (/^AT\dG\d{5}/.test(upper) || /^AT\dG\d{4,}/.test(upper)) {
    ATV.searchQ = '';
    atvLookupGene(upper);
  } else if (/^[A-Z0-9]{5}$/.test(upper) && qt.length===5) {
    ATV.searchQ = '';
    atvShowOGProfile(upper);
  } else {
    ATV.searchQ = qt.toLowerCase();
    atvScheduleDraw();
    document.getElementById('atv-og-panel').hidden = true;
  }
}

function atvResetZoom() { ATV.zoom=1; ATV.panX=0; ATV.panY=0; atvScheduleDraw(); }

function atvExportPNG() {
  const canvas = document.getElementById('atv-umap-canvas');
  if (!canvas) return;
  const a = document.createElement('a');
  a.download='plant-atlas-umap.png'; a.href=canvas.toDataURL('image/png'); a.click();
}

/* ── Trait list ──────────────────────────────────────────────── */
function atvRenderTraitList() {
  const el = document.getElementById('atv-trait-list');
  if (!el||!ATV.traits.length) return;

  let list = [...ATV.traits];
  if (ATV.hideConf) list=list.filter(t=>t.quality!=='confounded');
  if (ATV.sortBy==='quality') {
    const ord={high:0,clean:0,mixed:1,confounded:2,unknown:3};
    list.sort((a,b)=>(ord[a.quality]||3)-(ord[b.quality]||3)||(b.count||0)-(a.count||0));
  } else {
    list.sort((a,b)=>(b.count||0)-(a.count||0));
  }

  const hd = document.getElementById('atv-trait-hd-count');
  if (hd) hd.textContent=`(${list.length}/${ATV.traits.length})`;

  el.innerHTML = list.map(t => {
    const qlCls = {high:'clean',clean:'clean',mixed:'mixed',confounded:'conf'}[t.quality]||'conf';
    const checked = ATV.traitSel.has(t.id);
    return `<label class="atv-trait-row${checked?' checked':''}">
      <input type="checkbox" ${checked?'checked':''} onchange="atvToggleTrait('${t.id.replace(/'/g,"\\'")}',this.checked)">
      <span class="atv-ql-dot ${qlCls}"></span>
      <span class="atv-trait-nm" title="${t.name}">${t.name}</span>
      <span class="atv-trait-cnt">${(t.count||0).toLocaleString()}</span>
    </label>`;
  }).join('');
}

function atvToggleTrait(id, checked) {
  if (checked) ATV.traitSel.add(id); else ATV.traitSel.delete(id);
  const nEl = document.getElementById('atv-n-traits');
  if (nEl) nEl.textContent = ATV.traitSel.size;
  if (checked && ATV.colorMode!=='trait') atvColorBy('trait');
  if (!checked && !ATV.traitSel.size && ATV.colorMode==='trait') atvColorBy('organ');
  atvRenderTraitList();
  atvScheduleDraw();
}

function atvSortTraits(by) {
  ATV.sortBy=by;
  document.querySelectorAll('.atv-sort').forEach(b=>b.classList.remove('active'));
  document.getElementById('atv-sort-'+by)?.classList.add('active');
  atvRenderTraitList();
}

function atvToggleConf(hide) { ATV.hideConf=hide; atvRenderTraitList(); }

/* ── Legend panel ────────────────────────────────────────────── */
function atvRenderLegend() {
  const listEl  = document.getElementById('atv-legend-list');
  const titleEl = document.getElementById('atv-legend-title');
  if (!listEl) return;

  let entries = [];
  switch (ATV.colorMode) {
    case 'organ': {
      titleEl.textContent='ORGAN';
      const counts={};
      for (const pt of ATV.pts) counts[pt.po]=(counts[pt.po]||0)+1;
      entries = Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([po,cnt])=>({
        label: ATV.organLabels[po]||po, count:cnt, color:ATV.organColors[po]||'#999'
      }));
      break;
    }
    case 'species': {
      titleEl.textContent='SPECIES';
      entries = Object.entries(ATV.speciesCounts).sort((a,b)=>b[1]-a[1]).map(([sp,cnt])=>({
        label:sp, count:cnt, color:ATV.speciesColors[sp]||'#ccc'
      }));
      break;
    }
    case 'cluster': {
      titleEl.textContent='CLUSTER (k=16)';
      const counts={};
      for (const pt of ATV.pts) counts[pt.ci]=(counts[pt.ci]||0)+1;
      entries = Object.keys(counts).sort((a,b)=>+a-+b).map(ci=>({
        label:'Cluster '+ci, count:counts[ci], color:CLUSTER_PAL[ci]||'#999'
      }));
      break;
    }
    case 'trait': {
      titleEl.textContent='SELECTED TRAITS';
      entries = [...ATV.traitSel].map(id=>{
        const t=ATV.traits.find(x=>x.id===id);
        return t?{label:t.name,count:t.count||0,color:QUAL_COL[t.quality]||'#aaa'}:null;
      }).filter(Boolean);
      break;
    }
  }

  ATV.legendEntries = entries;
  atvFilterLegend(document.getElementById('atv-legend-filter')?.value||'');
}

function atvFilterLegend(q) {
  const listEl = document.getElementById('atv-legend-list');
  if (!listEl) return;
  const filtered = q
    ? ATV.legendEntries.filter(e=>e.label.toLowerCase().includes(q.toLowerCase()))
    : ATV.legendEntries;
  const show = filtered.slice(0, 50);
  listEl.innerHTML = show.map(e=>
    `<div class="atv-legend-row">
      <span class="atv-legend-dot" style="background:${e.color}"></span>
      <span class="atv-legend-label">${e.label}</span>
      <span class="atv-legend-count">${e.count.toLocaleString()}</span>
    </div>`
  ).join('') + `<div class="atv-legend-footer">${filtered.length} shown</div>`;
}

/* ── Gene / OG search ────────────────────────────────────────── */
async function atvLookupGene(geneId) {
  const panel = document.getElementById('atv-og-panel');
  if (!panel) return;
  panel.hidden=false;
  panel.innerHTML='<div class="atv-og-loading"><div class="spinner" style="width:14px;height:14px"></div>Looking up gene…</div>';

  if (!ATV.ogLookup) {
    try { ATV.ogLookup = await fetch(ATLAS_ROOT+'/arabidopsis_og_lookup.json').then(r=>r.json()); }
    catch(e) { panel.innerHTML=`<div class="empty">Failed to load gene lookup: ${e.message}</div>`; return; }
  }

  const bare = geneId.split('.')[0];
  const ogId = ATV.ogLookup[bare];
  if (!ogId) {
    panel.innerHTML=`<div class="atv-og-notfound"><b>${bare}</b> — no eggNOG OG found</div>`;
    return;
  }
  atvShowOGProfile(ogId, bare);
}

async function atvShowOGProfile(ogId, geneLabel) {
  const panel = document.getElementById('atv-og-panel');
  if (!panel) return;
  panel.hidden=false;
  panel.innerHTML='<div class="atv-og-loading"><div class="spinner" style="width:14px;height:14px"></div>Loading expression data…</div>';

  const needLoad = !ATV.ogMeans || !ATV.ogAnnot || !ATV.clusterAnnot;
  if (needLoad) {
    await Promise.all([atvLoadOGMeans(), atvLoadOGAnnot(), atvLoadClusterAnnot()]);
  }

  const row  = ATV.ogMeans?.[ogId];
  const ann  = ATV.ogAnnot?.[ogId] || {};
  if (!row) {
    panel.innerHTML=`<div class="atv-og-notfound">OG <b>${ogId}</b> — expression data not found</div>`;
    return;
  }

  const keys = Object.keys(row).filter(k=>k.startsWith('c')&&k!=='og_id').sort();
  const vals = keys.map(k=>+row[k]||0);
  const labels = keys.map((_,i)=>{
    const ca=ATV.clusterAnnot?.[String(i)]||{};
    return (ca.organ||'c'+i).split(' ')[0].slice(0,10);
  });

  const headerLabel = geneLabel ? `<code>${geneLabel}</code> → ` : '';
  panel.innerHTML=`
    <div class="atv-og-head">
      <span class="atv-og-title">${headerLabel}<strong>${ogId}</strong></span>
      <button class="atv-og-close" onclick="document.getElementById('atv-og-panel').hidden=true">✕</button>
    </div>
    ${ann.description?`<div class="atv-og-desc">${ann.description} · COG: <b>${ann.cog||'?'}</b></div>`:''}
    <div class="atv-og-chart-lbl">Expression across 16 UMAP clusters (log₁p TPM · 629k samples)</div>
    <div style="position:relative;height:180px"><canvas id="atv-og-canvas"></canvas></div>`;

  if (ATV.ogChart) { ATV.ogChart.destroy(); ATV.ogChart=null; }
  const ctx = document.getElementById('atv-og-canvas')?.getContext('2d');
  if (!ctx) return;
  ATV.ogChart = new Chart(ctx, {
    type:'bar',
    data:{
      labels: keys.map((_,i)=>'c'+String(i).padStart(2,'0')),
      datasets:[{
        data:vals,
        backgroundColor:vals.map(v=>`rgba(99,153,34,${Math.min(1,0.18+v/5)})`),
        borderWidth:0, borderRadius:3,
      }]
    },
    options:{
      plugins:{legend:{display:false},tooltip:{callbacks:{
        title:items=>`Cluster ${items[0].label} — ${labels[items[0].dataIndex]}`,
        label:ctx=>` ${ctx.raw.toFixed(3)} log₁p(TPM)`,
      }}},
      scales:{
        x:{grid:{display:false},ticks:{font:{size:9}}},
        y:{grid:{color:'rgba(0,0,0,.05)'},title:{display:true,text:'Mean log₁p(TPM)',font:{size:9}}},
      },
      animation:false, responsive:true, maintainAspectRatio:false,
    }
  });
}

function atvLoadOGMeans() {
  if (ATV.ogMeans) return Promise.resolve();
  return new Promise((res)=>{
    Papa.parse(ATLAS_ROOT+'/og_cluster_means_16.tsv',{
      download:true,header:true,dynamicTyping:true,skipEmptyLines:true,
      complete(results){
        ATV.ogMeans={};
        for(const row of results.data) if(row.og_id) ATV.ogMeans[row.og_id]=row;
        res();
      },
      error:res,
    });
  });
}

async function atvLoadOGAnnot() {
  if (ATV.ogAnnot) return;
  try { ATV.ogAnnot = await fetch(ATLAS_ROOT+'/og_annotations.json').then(r=>r.json()); }
  catch(e) { ATV.ogAnnot={}; }
}

async function atvLoadClusterAnnot() {
  if (ATV.clusterAnnot) return;
  try { ATV.clusterAnnot = await fetch(ATLAS_ROOT+'/cluster_annot.json').then(r=>r.json()); }
  catch(e) { ATV.clusterAnnot={}; }
}

/* ── Signature overlay ──────────────────────────────────────── */
async function atvScoreSignature() {
  const input  = document.getElementById('atv-sig-input')?.value||'';
  const lines  = input.split('\n').map(l=>l.split('#')[0].trim()).filter(Boolean);
  if (!lines.length) return;

  const resultEl = document.getElementById('atv-sig-result');
  const genesEl  = document.getElementById('atv-sig-genes');
  if (resultEl) resultEl.hidden=false;
  if (genesEl)  genesEl.innerHTML='<span class="atv-sig-status">Loading OG data…</span>';

  if (!ATV.ogLookup) {
    try { ATV.ogLookup = await fetch(ATLAS_ROOT+'/arabidopsis_og_lookup.json').then(r=>r.json()); }
    catch(e){ if(genesEl) genesEl.innerHTML='<span class="atv-sig-err">Failed to load gene lookup.</span>'; return; }
  }

  const mapped = lines.map(g=>{
    const bare=g.split('.')[0].toUpperCase();
    const og=ATV.ogLookup[bare];
    return {gene:g, bare, og:og||null};
  });
  const ogIds=[...new Set(mapped.filter(g=>g.og).map(g=>g.og))];

  if (!ATV.ogMeans) {
    if(genesEl) genesEl.innerHTML='<span class="atv-sig-status">Loading expression matrix (~3 MB)…</span>';
    await atvLoadOGMeans();
    await atvLoadClusterAnnot();
  }

  const N=16;
  const scores=new Array(N).fill(0);
  let found=0;
  for (const ogId of ogIds) {
    const row=ATV.ogMeans?.[ogId]; if(!row) continue; found++;
    for (let i=0;i<N;i++) scores[i]+=(+row[`c${String(i).padStart(2,'0')}`]||0);
  }
  if (found) scores.forEach((_,i)=>scores[i]=scores[i]/found);

  const clusterLabels=Array.from({length:N},(_,i)=>{
    const ca=ATV.clusterAnnot?.[String(i)]||{};
    return (ca.organ||'c'+i).split(' ')[0].slice(0,8);
  });

  if (ATV.sigChart) { ATV.sigChart.destroy(); ATV.sigChart=null; }
  const sigCanvas=document.getElementById('atv-sig-chart');
  if (sigCanvas&&found) {
    const ctx=sigCanvas.getContext('2d');
    ATV.sigChart=new Chart(ctx,{
      type:'bar',
      data:{
        labels:Array.from({length:N},(_,i)=>'c'+String(i).padStart(2,'0')),
        datasets:[{
          data:scores,
          backgroundColor:scores.map(v=>`rgba(99,153,34,${Math.min(1,0.15+v/4)})`),
          borderWidth:0,borderRadius:3,
        }]
      },
      options:{
        plugins:{legend:{display:false},tooltip:{callbacks:{
          title:items=>`Cluster ${items[0].label} — ${clusterLabels[items[0].dataIndex]}`,
          label:ctx=>` ${ctx.raw.toFixed(3)} log₁p(TPM)`,
        }}},
        scales:{
          x:{grid:{display:false},ticks:{font:{size:9}}},
          y:{grid:{color:'rgba(0,0,0,.05)'},title:{display:true,text:'Mean log₁p(TPM)',font:{size:9}}},
        },
        animation:false,responsive:true,maintainAspectRatio:false,
      }
    });
  }

  if (genesEl) genesEl.innerHTML=
    mapped.map(g=>`<div class="atv-sig-gene-row">
      <code>${g.gene}</code>
      ${g.og?`<span class="atv-og-found">→ ${g.og}</span>`:'<span class="atv-og-miss">not found</span>'}
    </div>`).join('')+
    `<div class="atv-sig-summary">${found}/${ogIds.length} OGs in expression matrix</div>`;
}

function atvClearSig() {
  const inp=document.getElementById('atv-sig-input');
  const res=document.getElementById('atv-sig-result');
  if(inp) inp.value='';
  if(res) res.hidden=true;
  if(ATV.sigChart){ATV.sigChart.destroy();ATV.sigChart=null;}
}
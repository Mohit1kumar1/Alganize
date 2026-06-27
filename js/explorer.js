const S = {
  page: null, dataDir: null, registry: null,
  allMeta: {}, allData: {},
  species: null, induction: null, dataset: null, contrast: null,
  pathway: 'All', search: '', sortCol: 'log2FC',
  activeTab: 'bar', barMode: 'top10', charts: {},
};

function showComingSoon(title) {
  document.getElementById('main-loading').style.display = 'none';
  const body = document.getElementById('main-body');
  body.hidden = false;
  body.style.cssText = 'display:flex;flex-direction:column;gap:24px;';
  body.innerHTML = `<div class="empty-state"><h2>${esc(title)}</h2><p>Data for this section is coming soon. Check back later.</p></div>`;
}

function populateSpecies() {
  const sm = S.registry.species_map || {};
  const el = document.getElementById('sel-species');
  el.innerHTML = Object.keys(sm).map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('');
  S.species = Object.keys(sm)[0] || null;
}

async function onSpeciesChange() {
  S.species = document.getElementById('sel-species').value;
  S.pathway = 'All';
  const spDs = (S.registry.species_map || {})[S.species] || [];
  const indMap = S.registry.induction_map || {};
  const validInd = Object.keys(indMap).filter(k => (indMap[k]||[]).some(d => spDs.includes(d)));
  const el = document.getElementById('sel-induction');
  el.innerHTML = validInd.map(i => `<option value="${esc(i)}">${esc(i)}</option>`).join('');
  S.induction = validInd[0] || null;
  await onInductionChange();
}

async function onInductionChange() {
  S.induction = document.getElementById('sel-induction').value;
  S.pathway = 'All';
  const spDs = (S.registry.species_map || {})[S.species] || [];
  const indDs = (S.registry.induction_map || {})[S.induction] || [];
  const ds = spDs.filter(d => indDs.includes(d));
  const el = document.getElementById('sel-dataset');
  el.innerHTML = ds.map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('');
  S.dataset = ds[0] || null;
  await onDatasetChange();
}

async function onDatasetChange() {
  S.dataset = document.getElementById('sel-dataset').value;
  S.pathway = 'All';
  if (!S.dataset) { showComingSoon(EXPLORER_PAGES[S.page]?.title || ''); return; }
  showLoading();
  try { await ensureDatasetLoaded(S.dataset); populateContrast(); onContrastChange(); }
  catch (e) { showErr(e.message); }
}

function populateContrast() {
  const meta = S.allMeta[S.dataset]; if (!meta) return;
  const el = document.getElementById('sel-contrast');
  el.innerHTML = Object.entries(meta.contrasts || {})
    .map(([l,k]) => `<option value="${esc(k)}">${esc(l)}</option>`).join('');
  S.contrast = Object.values(meta.contrasts || {})[0] || null;
}

function onContrastChange() {
  S.contrast = document.getElementById('sel-contrast').value;
  S.pathway = 'All';
  const meta = S.allMeta[S.dataset];
  if (meta) renderPathwayList(meta);
  renderMain();
}

async function ensureDatasetLoaded(id) {
  if (S.allMeta[id] && S.allData[id]) return;
  const [meta, tsvText] = await Promise.all([
    fetch(`${S.dataDir}/${id}/meta.json`).then(r => { if (!r.ok) throw new Error(`meta.json not found for ${id}`); return r.json(); }),
    fetch(`${S.dataDir}/${id}/log2fc.tsv`).then(r => { if (!r.ok) throw new Error(`log2fc.tsv not found for ${id}`); return r.text(); })
  ]);
  S.allMeta[id] = meta;
  S.allData[id] = Papa.parse(tsvText.trim(), { header:true, dynamicTyping:true, skipEmptyLines:true }).data;
}

function renderPathwayList(meta) {
  const data = S.allData[S.dataset] || [];
  const pathways = ['All', ...(meta.pathways || [...new Set(data.map(r=>r.Pathway).filter(Boolean))])];
  const counts = {};
  data.forEach(r => { counts[r.Pathway] = (counts[r.Pathway]||0)+1; });
  document.getElementById('pathway-list').innerHTML = pathways.map(pw => {
    const cnt = pw === 'All' ? data.length : (counts[pw]||0);
    return `<button class="pathway-btn ${S.pathway===pw?'active':''}" onclick="setPathway('${esc(pw)}',this)">
      <span>${esc(pw)}</span><span class="pathway-count">${cnt}</span></button>`;
  }).join('');
}

function setPathway(pw, btn) {
  S.pathway = pw;
  document.querySelectorAll('.pathway-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMain();
}

function lcCol()   { return S.contrast ? S.contrast+'_log2FC' : null; }
function padjCol() { return S.contrast ? S.contrast+'_padj'   : null; }
function showNS()     { return document.getElementById('opt-ns')?.checked !== false; }
function heatmapAll() { return document.getElementById('opt-heatmap-all')?.checked; }

function filteredData() {
  const all = S.allData[S.dataset] || [], lc = lcCol();
  let d = S.pathway === 'All' ? all : all.filter(r => r.Pathway === S.pathway);
  if (!showNS() && lc) d = d.filter(r => { const p = r[padjCol()]; return p!=null&&isFinite(p)&&p<0.05; });
  if (S.search) {
    const q = S.search.toLowerCase();
    d = d.filter(r => (r.Symbol||'').toLowerCase().includes(q)||(r.GeneID||'').toLowerCase().includes(q)||(r.Description||'').toLowerCase().includes(q));
  }
  if (lc) d = [...d].sort((a,b) => (b[lc]||0)-(a[lc]||0));
  return d;
}

function renderMain() {
  const meta = S.allMeta[S.dataset], body = document.getElementById('main-body');
  if (!meta || !S.contrast) { showLoading(); return; }
  document.getElementById('main-loading').style.display = 'none';
  body.hidden = false; body.style.cssText = 'display:flex;flex-direction:column;gap:24px;'; body.innerHTML = '';
  const data = filteredData(), lc = lcCol(), pc = padjCol();
  const vals = data.map(r=>r[lc]).filter(v=>v!=null&&isFinite(v));
  const up = vals.filter(v=>v>0).length, dn = vals.filter(v=>v<0).length;
  const maxFC = vals.length ? Math.max(...vals.map(Math.abs)).toFixed(2) : '—';
  const allContrasts = Object.entries(meta.contrasts||{}).map(([l,k])=>({label:l,key:k}));

  body.innerHTML += `<div class="dataset-header"><div>
    <h1>${esc(meta.species||S.dataset)}</h1><p>${esc(meta.induction_details||'')}</p>
    <div class="meta-tags">
      ${meta.induction_type?`<span class="meta-tag green">${esc(meta.induction_type)}</span>`:''}
      ${meta.technique?`<span class="meta-tag">${esc(meta.technique)}</span>`:''}
      <span class="meta-tag mono">${esc(S.dataset)}</span>
    </div></div>
    ${meta.geo_link?`<a class="geo-link" href="${esc(meta.geo_link)}" target="_blank" rel="noopener">View on GEO ↗</a>`:''}
  </div>`;

  body.innerHTML += `<div class="stat-row">
    <div class="stat-card"><div class="stat-label">Genes shown</div><div class="stat-value">${data.length}</div><div class="stat-sub">${S.pathway==='All'?'all pathways':esc(S.pathway)}</div></div>
    <div class="stat-card"><div class="stat-label">Upregulated</div><div class="stat-value stat-up">${up}</div><div class="stat-sub">log2FC &gt; 0</div></div>
    <div class="stat-card"><div class="stat-label">Downregulated</div><div class="stat-value stat-down">${dn}</div><div class="stat-sub">log2FC &lt; 0</div></div>
    <div class="stat-card"><div class="stat-label">Max |log2FC|</div><div class="stat-value">${maxFC}</div><div class="stat-sub">strongest change</div></div>
  </div>`;

  if (allContrasts.length > 1) body.innerHTML += `<div class="contrast-tabs">${allContrasts.map(c=>
    `<button class="contrast-tab ${S.contrast===c.key?'active':''}" onclick="setContrast('${esc(c.key)}')">${esc(c.label)}</button>`).join('')}</div>`;

  body.innerHTML += `<div class="panel">
    <div class="chart-tab-row">
      <button class="chart-tab ${S.activeTab==='bar'?'active':''}"     onclick="setTab('bar',this)">Bar chart</button>
      <button class="chart-tab ${S.activeTab==='volcano'?'active':''}" onclick="setTab('volcano',this)">Volcano</button>
      <button class="chart-tab ${S.activeTab==='heatmap'?'active':''}" onclick="setTab('heatmap',this)">Heatmap</button>
    </div><div id="chart-area"></div></div>`;

  body.innerHTML += `<div class="panel">
    <div class="panel-header"><div class="panel-title">Gene-level results</div></div>
    <div class="search-row">
      <input class="search-input" id="gene-search" placeholder="Search gene, symbol, description…" value="${esc(S.search)}" oninput="doSearch(this.value)"/>
      <select class="sort-select-sm" onchange="setSort(this.value)">
        <option value="log2FC" ${S.sortCol==='log2FC'?'selected':''}>Sort: |log2FC|</option>
        <option value="padj"   ${S.sortCol==='padj'  ?'selected':''}>Sort: p-adj</option>
        <option value="symbol" ${S.sortCol==='symbol'?'selected':''}>Sort: symbol</option>
      </select>
    </div>
    <div class="gene-table-wrap"><table class="gene-table">
      <thead><tr><th>Pathway</th><th>Symbol</th><th>Description</th><th>GeneID</th><th>log2FC</th><th>p-adj</th></tr></thead>
      <tbody id="gene-tbody"></tbody>
    </table></div></div>`;

  renderChartArea(data, lc, pc);
  renderTable(data, lc, pc);
  if (typeof atlasOnRenderMain === 'function') atlasOnRenderMain();
}

function renderChartArea(data, lc, pc) {
  destroyCharts();
  const area = document.getElementById('chart-area'); if (!area) return;
  if (S.activeTab==='bar') renderBar(area,data,lc);
  else if (S.activeTab==='volcano') renderVolcano(area,lc,pc);
  else if (S.activeTab==='heatmap') renderHeatmap(area,lc);
}
function setTab(tab,btn) {
  S.activeTab = tab;
  document.querySelectorAll('.chart-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderChartArea(filteredData(),lcCol(),padjCol());
}
function destroyCharts() {
  Object.keys(S.charts).forEach(k=>{ if(S.charts[k]){S.charts[k].destroy();delete S.charts[k];} });
}

function renderBar(area, data, lc) {
  area.innerHTML = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
    <div class="legend-row">
      <div class="legend-item"><span class="legend-swatch" style="background:#2ea378"></span>Up</div>
      <div class="legend-item"><span class="legend-swatch" style="background:#d63d3c"></span>Down</div>
    </div>
    <div class="toggle-group">
      <button class="toggle-btn ${S.barMode==='top10'?'active':''}" id="btn-top10" onclick="setBarMode('top10')">Top 10</button>
      <button class="toggle-btn ${S.barMode==='all'?'active':''}"   id="btn-all"   onclick="setBarMode('all')">All</button>
    </div></div>
    <div style="position:relative;" id="bar-wrap"><canvas id="barChart"></canvas></div>`;
  drawBar(data, lc);
}
function drawBar(data, lc) {
  let d = [...data].filter(r=>r[lc]!=null&&isFinite(r[lc]));
  d.sort((a,b)=>Math.abs(b[lc])-Math.abs(a[lc]));
  if (S.barMode==='top10') d = d.slice(0,10);
  const labels=d.map(r=>r.Symbol||r.GeneID||''), vals=d.map(r=>parseFloat(r[lc].toFixed(3)));
  const colors=vals.map(v=>v>=0?'#2ea378':'#d63d3c'), h=Math.max(280,d.length*40+60);
  const wrap=document.getElementById('bar-wrap'); if(wrap) wrap.style.height=h+'px';
  const ctx=document.getElementById('barChart'); if(!ctx) return;
  if(S.charts.bar) S.charts.bar.destroy();
  S.charts.bar = new Chart(ctx, {
    type:'bar', data:{labels,datasets:[{data:vals,backgroundColor:colors,borderRadius:3,borderSkipped:false}]},
    options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>' log2FC: '+c.raw.toFixed(3)}}},
      scales:{x:{grid:{color:'#eaecea'},ticks:{color:'#8a9577',font:{size:11}},border:{color:'#dde2cf'}},
              y:{grid:{display:false},ticks:{color:'#556242',font:{size:11}},border:{display:false}}}}
  });
}
function setBarMode(mode) {
  S.barMode = mode;
  document.getElementById('btn-top10')?.classList.toggle('active',mode==='top10');
  document.getElementById('btn-all')?.classList.toggle('active',mode==='all');
  drawBar(filteredData(),lcCol());
}

function renderVolcano(area, lc, pc) {
  const all = S.allData[S.dataset]||[];
  const rows = all.filter(r=>r[lc]!=null&&isFinite(r[lc])&&r[pc]!=null&&isFinite(r[pc])&&r[pc]>0);
  if (!rows.length) { area.innerHTML='<div class="empty">No valid padj values</div>'; return; }
  const pwSet = new Set(S.pathway==='All'?[]:all.filter(r=>r.Pathway===S.pathway).map(r=>r.GeneID));
  const isInPw = r => S.pathway!=='All' && pwSet.has(r.GeneID);
  const bg=[],fg=[];
  rows.forEach(r=>{
    const x=r[lc],y=-Math.log10(Math.max(r[pc],1e-300)),sig=r[pc]<0.05&&Math.abs(x)>1;
    const col=!sig?'rgba(138,149,122,0.35)':x>=0?'#2ea378':'#d63d3c';
    const pt={x,y,label:r.Symbol||r.GeneID,col};
    if(isInPw(r)) fg.push({...pt,col:sig?(x>=0?'#2ea378':'#d63d3c'):'rgba(99,153,34,0.55)',pw:true});
    else bg.push(pt);
  });
  area.innerHTML=`<div style="position:relative;height:460px;"><canvas id="volcanoChart"></canvas></div>`;
  const ctx=document.getElementById('volcanoChart'); if(!ctx) return;
  if(S.charts.scatter) S.charts.scatter.destroy();
  S.charts.scatter = new Chart(ctx, {
    type:'scatter',
    data:{datasets:[
      {label:'Background',data:bg.map(p=>({x:p.x,y:p.y})),backgroundColor:bg.map(p=>p.col),pointRadius:2.5,pointHoverRadius:4},
      {label:S.pathway==='All'?'All genes':'Pathway genes',data:fg.map(p=>({x:p.x,y:p.y})),
       backgroundColor:fg.map(p=>p.col),pointRadius:fg.map(p=>p.pw?5.5:3),pointStyle:fg.map(p=>p.pw?'rectRot':'circle'),pointHoverRadius:7}
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>{
        const arr=ctx.datasetIndex===0?bg:fg,pt=arr[ctx.dataIndex];
        return pt?[pt.label,' log2FC: '+pt.x.toFixed(3),' -log10(padj): '+pt.y.toFixed(2)]:'';
      }}}},
      scales:{x:{title:{display:true,text:'log2 Fold Change',color:'#556242',font:{size:11}},grid:{color:'#eaecea'},ticks:{color:'#8a9577',font:{size:11}}},
              y:{title:{display:true,text:'-log10(padj)',color:'#556242',font:{size:11}},grid:{color:'#eaecea'},ticks:{color:'#8a9577',font:{size:11}}}}}
  });
}

function heatColor(v,absMax) {
  if(v==null||!isFinite(v)) return {bg:'#f5f8ee',text:'#8a9577'};
  const n=Math.max(-1,Math.min(1,v/Math.max(absMax,0.001)));
  if(n>=0) return {bg:`rgba(46,163,120,${0.10+n*0.70})`,text:n>0.55?'#fff':'#1f6b4f'};
  return {bg:`rgba(214,61,60,${0.10+(-n)*0.70})`,text:-n>0.55?'#fff':'#992c2c'};
}
function renderHeatmap(area, lc) {
  const src=heatmapAll()?(S.allData[S.dataset]||[]):filteredData(), meta=S.allMeta[S.dataset];
  const allCtKeys=Object.values(meta.contrasts||{});
  const allLcCols=allCtKeys.map(k=>k+'_log2FC').filter(c=>src.length&&c in src[0]);
  const allLabels=allCtKeys.map(k=>{const e=Object.entries(meta.contrasts||{}).find(([,v])=>v===k);return e?e[0]:k;})
    .filter((_,i)=>allCtKeys[i]+'_log2FC' in (src[0]||{}));
  const pathways=[...new Set(src.map(r=>r.Pathway).filter(Boolean))];
  const allVals=src.flatMap(r=>allLcCols.map(c=>r[c])).filter(v=>v!=null&&isFinite(v));
  const absMax=allVals.length?Math.max(...allVals.map(Math.abs)):1;
  let html=`<div style="overflow-x:auto;"><table class="heatmap-table"><thead><tr><th class="gene-col">Pathway / Gene</th>${allLabels.map(l=>`<th>${esc(l)}</th>`).join('')}</tr></thead><tbody>`;
  pathways.forEach(pw=>{
    const genes=src.filter(r=>r.Pathway===pw);
    html+=`<tr><td colspan="${allLcCols.length+1}" style="padding:12px 6px 4px;color:var(--accent-hi);font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">${esc(pw)}</td></tr>`;
    genes.forEach(g=>{
      html+=`<tr><td class="gene-name" title="${esc(g.Description||'')}">${esc(g.Symbol||g.GeneID)}</td>`;
      allLcCols.forEach(c=>{const v=g[c];const{bg,text}=heatColor(v,absMax);html+=`<td><span class="hm-cell" style="background:${bg};color:${text};">${(v!=null&&isFinite(v))?v.toFixed(2):'NA'}</span></td>`;});
      html+=`</tr>`;
    });
  });
  html+='</tbody></table></div>';
  const steps=7;
  const legend=Array.from({length:steps},(_,i)=>{const v=absMax*(2*i/(steps-1)-1);const{bg}=heatColor(v,absMax);return `<span style="display:inline-block;width:30px;height:14px;background:${bg};border-radius:2px;"></span>`;}).join('');
  area.innerHTML=`<div style="display:flex;align-items:center;gap:6px;margin-bottom:16px;font-size:11px;color:var(--text-dim);font-variant-numeric:tabular-nums;"><span>-${absMax.toFixed(1)}</span>${legend}<span>+${absMax.toFixed(1)}</span><span style="margin-left:12px;letter-spacing:0.06em;text-transform:uppercase;font-size:10px;font-weight:600;">log2FC</span></div>${html}`;
}

function renderTable(data, lc, pc) {
  const tbody=document.getElementById('gene-tbody'); if(!tbody) return;
  if(!data.length){tbody.innerHTML='<tr><td colspan="6" class="empty">No genes match current filters</td></tr>';return;}
  const vals=data.map(r=>r[lc]).filter(v=>v!=null&&isFinite(v));
  const absMax=vals.length?Math.max(...vals.map(Math.abs)):1;
  tbody.innerHTML=data.map(r=>{
    const fc=r[lc],pv=r[pc],fcN=(fc!=null&&isFinite(fc))?fc.toFixed(3):'NA';
    const fcP=(fc!=null&&isFinite(fc))?Math.min(100,Math.abs(fc)/absMax*100):0;
    const fcC=(fc!=null&&fc>=0)?'#2ea378':'#d63d3c';
    const pvD=(pv!=null&&isFinite(pv))?pv.toExponential(2):'NA',sig=pv!=null&&isFinite(pv)&&pv<0.05;
    return `<tr data-geneid="${esc(r.GeneID||'')}">
      <td><span class="pathway-pill">${esc(r.Pathway||'')}</span></td>
      <td style="color:var(--text);font-weight:500;">${esc(r.Symbol||'—')}</td>
      <td style="color:var(--text-mu);font-size:12px;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(r.Description||'')}">${esc(r.Description||'—')}</td>
      <td style="color:var(--text-dim);font-size:11.5px;font-family:var(--font-mono);">${esc(r.GeneID||'')}</td>
      <td><div class="fc-bar-wrap"><span class="fc-num" style="color:${fcC}">${fcN}</span><div class="fc-bar-bg"><div class="fc-bar-fill" style="width:${fcP.toFixed(1)}%;background:${fcC};"></div></div></div></td>
      <td><span class="sig-dot" style="background:${sig?'#2ea378':'#fff'};border:1px solid ${sig?'#2ea378':'rgba(0,0,0,0.12)'};margin-right:8px;"></span><span style="font-family:var(--font-mono);font-size:11.5px;">${pvD}</span></td>
    </tr>`;
  }).join('');
}

function setContrast(key) { S.contrast=key; document.getElementById('sel-contrast').value=key; renderMain(); }
function doSearch(q) {
  S.search=q; const data=filteredData();
  renderTable(data,lcCol(),padjCol());
  if(S.activeTab==='bar') drawBar(data,lcCol());
  else if(S.activeTab==='heatmap') renderHeatmap(document.getElementById('chart-area'),lcCol());
}
function setSort(col) { S.sortCol=col; renderMain(); }
function showLoading() { document.getElementById('main-loading').style.display='flex'; document.getElementById('main-body').hidden=true; }
function showErr(msg) { document.getElementById('main-loading').innerHTML=`<span style="color:var(--down)">${esc(msg)}</span>`; }

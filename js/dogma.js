let DG = { init: false, viewer: null, spinning: true, surface: false, sticks: false, currentStress: null, currentEnzyme: 0, dmolReady: false };

async function initDogma() {
  if (DG.init) return;
  DG.init = true;
  const helix = document.getElementById('dogma-dna-helix');
  if (helix) helix.innerHTML = Array.from({length:12}, (_,i) =>
    `<div class="dna-bp" style="--i:${i}"><div class="dna-bp-a"></div><div class="dna-bp-b"></div></div>`
  ).join('');
  buildStressTabs();
  initMetmap();
  loadScript('https://3dmol.csb.pitt.edu/build/3Dmol-min.js')
    .then(() => { DG.dmolReady = true; })
    .catch(() => console.warn('3Dmol.js unavailable'));
}

function buildStressTabs() {
  const el = document.getElementById('dogma-stress-tabs');
  if (!el) return;
  el.innerHTML = DOGMA_STRESSES.map(s => {
    const enzyme0 = s.enzymes ? s.enzymes[0] : s.protein;
    return `<button class="dogma-stress-tab" data-sid="${s.id}" style="--s-bg:${s.bg};--s-text:${s.text}" onclick="selectStress('${s.id}')">
      <span class="dogma-stress-icon">${esc(s.icon)}</span>${esc(s.name)}
    </button>`;
  }).join('');
}

async function selectStress(sid) {
  const s = DOGMA_STRESSES.find(x => x.id === sid);
  if (!s) return;
  DG.currentStress = sid;
  DG.currentEnzyme = 0;

  document.querySelectorAll('.dogma-stress-tab').forEach(b => b.classList.toggle('active', b.dataset.sid === sid));

  const enzyme = s.enzymes ? s.enzymes[0] : s.protein;
  _updateFlowEnzyme(s, enzyme);
  _updateMetaboliteFlow(s);

  document.getElementById('dogma-viewer-title').textContent = enzyme.name || s.protein.name;
  document.getElementById('dogma-viewer-src').textContent = s.protein.src || '';
  const afLink = document.getElementById('dogma-af-link');
  if (afLink) afLink.href = `https://alphafold.ebi.ac.uk/entry/${enzyme.uniprot}`;

  const enzymeTabs = s.enzymes ? `
    <div class="dogma-info-section">Select Enzyme</div>
    <div class="dogma-enzyme-tabs" id="dogma-enzyme-tabs">
      ${s.enzymes.map((e, i) => `<button class="dogma-enzyme-tab ${i===0?'active':''}" onclick="selectEnzyme('${sid}',${i})">${esc(e.short)}</button>`).join('')}
    </div>` : '';

  const paperCard = s.paper ? `
    <div class="dogma-paper-card" id="dogma-paper-card">
      <div class="dogma-info-section" style="margin-top:0;margin-bottom:12px;">Research Paper</div>
      <div class="dogma-paper-card-title">
        <a href="https://doi.org/${esc(s.paper.doi)}" target="_blank" rel="noopener">${esc(s.paper.title)}</a>
      </div>
      <div class="dogma-paper-card-meta">
        <span class="dogma-paper-card-authors">${esc(s.paper.authors)}</span>
        <span class="dogma-paper-card-journal">${esc(s.paper.journal)}</span>
        <span class="dogma-paper-card-year">${s.paper.year}</span>
        <span class="dogma-paper-pmid"><a href="https://pubmed.ncbi.nlm.nih.gov/${esc(s.paper.pmid)}/" target="_blank" rel="noopener">PMID ${esc(s.paper.pmid)}</a></span>
      </div>
      <div class="dogma-paper-summary">${esc(s.paper.summary)}</div>
    </div>` : '';

  document.getElementById('dogma-info-panel').innerHTML = `
    <div class="dogma-info-stress-chip" style="background:${s.bg};color:${s.text}">
      <span>${esc(s.icon)}</span>${esc(s.name)}
    </div>
    <p class="dogma-info-desc">${esc(s.description)}</p>
    <div class="dogma-info-section">Upregulated Genes</div>
    <div class="dogma-gene-list">
      ${s.genes.map(g=>`<div class="dogma-gene-row">
        <span class="dogma-gene-sym">${esc(g.sym)}</span>
        <span class="dogma-gene-name">${esc(g.name)}</span>
        <span class="dogma-gene-fc">↑ ${g.fc}×</span>
      </div>`).join('')}
    </div>
    ${enzymeTabs}
    <div class="dogma-info-section">Key Enzyme</div>
    <div id="dogma-enzyme-detail" style="font-size:12.5px;color:var(--text-mu);line-height:1.7;padding:9px 13px;background:var(--bg);border-radius:var(--radius-sm);">
      <strong style="color:var(--text)">${esc(enzyme.name)}</strong><br>${esc(enzyme.fn)}
    </div>
    <div class="dogma-info-section">Biosynthetic Pathway</div>
    <div class="dogma-pathway-box">${esc(s.pathway)}</div>
    <div class="dogma-info-section">Key Metabolite</div>
    <div class="dogma-met-card">
      <img class="dogma-met-img" src="https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${s.metabolite.cid}/PNG?record_type=2d&image_size=200x200" alt="${esc(s.metabolite.name)}" onerror="this.style.display='none'"/>
      <div>
        <div class="dogma-met-name">${esc(s.metabolite.name)}</div>
        <div class="dogma-met-desc">${esc(s.metabolite.desc)}</div>
      </div>
    </div>
    <div class="dogma-info-actions">
      <button class="dogma-act-btn primary" onclick="dogmaSearchPubMed()">Search PubMed →</button>
      <button class="dogma-act-btn ghost" onclick="document.getElementById('metmap-tree')?.scrollIntoView({behavior:'smooth',block:'start'})">Metabolite Map ↓</button>
      <a href="https://alphafold.ebi.ac.uk/entry/${esc(enzyme.uniprot)}" target="_blank" rel="noopener" class="dogma-act-btn ghost" style="text-decoration:none">AlphaFold ↗</a>
    </div>
    ${paperCard}`;

  await dogmaLoad3D({ protein: enzyme });
}

function selectEnzyme(sid, idx) {
  const s = DOGMA_STRESSES.find(x => x.id === sid);
  if (!s || !s.enzymes) return;
  DG.currentEnzyme = idx;
  const enzyme = s.enzymes[idx];

  document.querySelectorAll('.dogma-enzyme-tab').forEach((btn, i) =>
    btn.classList.toggle('active', i === idx));

  _updateFlowEnzyme(s, enzyme);

  document.getElementById('dogma-viewer-title').textContent = enzyme.name;
  const afLink = document.getElementById('dogma-af-link');
  if (afLink) afLink.href = `https://alphafold.ebi.ac.uk/entry/${enzyme.uniprot}`;

  const detail = document.getElementById('dogma-enzyme-detail');
  if (detail) {
    detail.innerHTML = `<strong style="color:var(--text)">${esc(enzyme.name)}</strong><br>${esc(enzyme.fn)}`;
  }

  const actAlphaBtn = document.querySelector('.dogma-info-actions a.dogma-act-btn.ghost');
  if (actAlphaBtn) actAlphaBtn.href = `https://alphafold.ebi.ac.uk/entry/${esc(enzyme.uniprot)}`;

  dogmaLoad3D({ protein: enzyme });
}

function _updateFlowEnzyme(s, enzyme) {
  document.getElementById('dogma-flow-protein-name').textContent = enzyme.name.split(' (')[0];
  const enzymeImg = document.getElementById('dogma-flow-enzyme-img');
  const enzymeFallback = document.getElementById('dogma-flow-enzyme-fallback');
  const enzymeBadge = document.getElementById('dogma-flow-enzyme-badge');
  const enzymeUrl = getPDBImgUrl(enzyme.pdbId);
  enzymeImg.src = enzymeUrl;
  enzymeImg.alt = enzyme.name;
  enzymeImg.style.display = 'block';
  enzymeFallback.style.display = 'none';
  enzymeBadge.textContent = 'PDB ' + enzyme.pdbId;
  enzymeBadge.style.display = 'block';
  enzymeImg.onerror = () => {
    enzymeImg.style.display = 'none';
    enzymeFallback.style.display = 'flex';
    enzymeBadge.style.display = 'none';
  };
}

function _updateMetaboliteFlow(s) {
  const metabImg = document.getElementById('dogma-flow-metab-img');
  const metabPlaceholder = document.getElementById('dogma-metab-placeholder');
  const metabBadge = document.getElementById('dogma-flow-metab-badge');
  metabImg.src = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${s.metabolite.cid}/PNG?record_type=2d&image_size=200x200`;
  metabImg.alt = s.metabolite.name;
  metabImg.style.display = 'block';
  metabPlaceholder.style.display = 'none';
  metabBadge.textContent = 'CID ' + s.metabolite.cid;
  metabBadge.style.display = 'block';
  metabImg.onerror = () => { metabImg.style.display = 'none'; metabPlaceholder.style.display = 'block'; };
  document.getElementById('dogma-flow-metab-name').textContent = s.metabolite.name.split(' /')[0].split(' (')[0];
}

async function dogmaLoad3D(s) {
  if (!DG.dmolReady) {
    try {
      await loadScript('https://3dmol.csb.pitt.edu/build/3Dmol-min.js');
      DG.dmolReady = true;
    } catch(e) {
      show3dError(); return;
    }
  }
  document.getElementById('dogma-3d-placeholder').style.display = 'none';
  document.getElementById('dogma-3d-error').style.display = 'none';
  document.getElementById('dogma-3d-loading').style.display = 'flex';

  const el = document.getElementById('dogma-3d-viewer');
  if (!DG.viewer) {
    DG.viewer = $3Dmol.createViewer(el, { backgroundColor: '#f7f9f3', id: 'dogma-mol-view' });
  } else {
    DG.viewer.clear();
    if (DG.spinning) DG.viewer.spin(false);
  }

  let loaded = false;

  try {
    const url = `https://alphafold.ebi.ac.uk/files/AF-${s.protein.uniprot}-F1-model_v4.pdb`;
    const pdbText = await fetch(url).then(r => { if (!r.ok) throw new Error(); return r.text(); });
    DG.viewer.addModel(pdbText, 'pdb');
    loaded = true;
  } catch(e) { /* try fallback */ }

  if (!loaded && s.protein.pdbId) {
    try {
      await new Promise((res, rej) => {
        $3Dmol.download(`pdb:${s.protein.pdbId}`, DG.viewer, {}, () => res());
        setTimeout(() => rej(new Error('timeout')), 12000);
      });
      loaded = true;
    } catch(e) { /* fail */ }
  }

  document.getElementById('dogma-3d-loading').style.display = 'none';
  if (!loaded) { show3dError(); return; }

  applyProteinStyle();
  DG.viewer.zoomTo();
  DG.viewer.render();
  if (DG.spinning) DG.viewer.spin('y', 1);
}

function applyProteinStyle() {
  if (!DG.viewer) return;
  DG.viewer.setStyle({}, { cartoon: { color: 'spectrum' } });
  if (DG.surface) {
    DG.viewer.addSurface($3Dmol.SurfaceType.VDW, { opacity: 0.35, colorscheme: { gradient: 'rwb' } });
  }
  if (DG.sticks) {
    DG.viewer.addStyle({hetflag: true}, { stick: { radius: 0.2, colorscheme: 'greenCarbon' } });
  }
  DG.viewer.render();
}

function show3dError() {
  document.getElementById('dogma-3d-error').style.display = 'flex';
}

function dogmaToggleSpin() {
  DG.spinning = !DG.spinning;
  document.getElementById('dogma-btn-spin').classList.toggle('active', DG.spinning);
  if (DG.viewer) DG.viewer.spin(DG.spinning ? 'y' : false, 1);
}

function dogmaToggleSurface() {
  DG.surface = !DG.surface;
  document.getElementById('dogma-btn-surf').classList.toggle('active', DG.surface);
  if (DG.viewer) { DG.viewer.removeAllSurfaces(); applyProteinStyle(); }
}

function dogmaToggleStick() {
  DG.sticks = !DG.sticks;
  document.getElementById('dogma-btn-stick').classList.toggle('active', DG.sticks);
  if (DG.viewer) applyProteinStyle();
}

function dogmaResetView() {
  if (!DG.viewer) return;
  DG.viewer.zoomTo(); DG.viewer.render();
}

function dogmaSearchPubMed() {
  const s = DOGMA_STRESSES.find(x => x.id === DG.currentStress);
  if (!s) return;
  const q = `microalgae ${s.name.toLowerCase().replace(/[/()↓△]/g,' ')} stress ${s.metabolite.name.split('/')[0].trim()}`;
  document.getElementById('pubmed-query').value = q.trim();
  PM.loaded = false;
  showPage('pubmed');
}

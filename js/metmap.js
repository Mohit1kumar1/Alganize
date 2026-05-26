let MM = { init:false, currentCat:null, currentMetIdx:-1 };

function initMetmap() {
  if (MM.init) return;
  MM.init = true;
  renderMetmapTree();
  document.getElementById('metmap-tree').addEventListener('click', e => {
    const chip = e.target.closest('.metmap-chip');
    if (chip) { e.stopPropagation(); metmapSelectMet(chip.dataset.cat, +chip.dataset.idx); return; }
    const box = e.target.closest('.metmap-cat-box');
    if (box) metmapSelectCat(box.dataset.cat);
  });
  document.getElementById('metmap-panel-body').addEventListener('click', e => {
    const chip = e.target.closest('.metmap-panel-chip');
    if (chip) { metmapSelectMet(chip.dataset.cat, +chip.dataset.idx); return; }
    const bc = e.target.closest('.metmap-panel-breadcrumb');
    if (bc) metmapSelectCat(bc.dataset.cat);
  });
}

function renderMetmapTree() {
  document.getElementById('metmap-tree').innerHTML = METMAP_DATA.categories.map(cat => `
    <div class="metmap-cat-col" id="metmap-cat-${cat.id}">
      <div class="metmap-cat-box" data-cat="${cat.id}" style="--cat-bg:${cat.color};--cat-text:${cat.textColor}">
        <div class="metmap-cat-title">${esc(cat.name)}</div>
        <div class="metmap-chips">
          ${cat.metabolites.map((m,i) => `<span class="metmap-chip" data-cat="${cat.id}" data-idx="${i}">${esc(m.name)}</span>`).join('')}
        </div>
      </div>
    </div>`).join('');
}

function metmapSelectCat(catId) {
  MM.currentCat = catId; MM.currentMetIdx = -1;
  const cat = METMAP_DATA.categories.find(c => c.id === catId);
  if (!cat) return;
  document.querySelectorAll('.metmap-cat-box').forEach(b => b.classList.toggle('active', b.dataset.cat === catId));
  document.querySelectorAll('.metmap-chip').forEach(c => c.classList.remove('active'));
  document.getElementById('metmap-panel-body').innerHTML = `
    <div class="metmap-panel-cat-label" style="background:${cat.color};color:${cat.textColor}">${esc(cat.name)}</div>
    <p class="metmap-panel-desc">${esc(cat.description)}</p>
    <div class="metmap-panel-section-title">Key Biostimulatory Functions</div>
    <ul class="metmap-panel-fns">${cat.functions.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>
    <div class="metmap-panel-section-title">Metabolites in this class</div>
    <div class="metmap-panel-chips">${cat.metabolites.map((m,i)=>`<span class="metmap-panel-chip" data-cat="${catId}" data-idx="${i}">${esc(m.name)}</span>`).join('')}</div>
    <div class="metmap-panel-actions">
      <button class="metmap-action-btn" onclick="metmapDoSearchPubMed()">Search PubMed →</button>
    </div>`;
  document.getElementById('metmap-panel').classList.add('open');
}

function metmapSelectMet(catId, metIdx) {
  MM.currentCat = catId; MM.currentMetIdx = metIdx;
  const cat = METMAP_DATA.categories.find(c => c.id === catId);
  const met = cat?.metabolites[metIdx];
  if (!met) return;
  document.querySelectorAll('.metmap-cat-box').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.metmap-chip').forEach(c =>
    c.classList.toggle('active', c.dataset.cat === catId && +c.dataset.idx === metIdx));
  const pcLink = met.pubchem
    ? `<a href="https://pubchem.ncbi.nlm.nih.gov/compound/${met.pubchem}" target="_blank" rel="noopener" class="metmap-db-link">PubChem ↗</a>` : '';
  const kgLink = met.kegg
    ? `<a href="https://www.genome.jp/entry/${met.kegg}" target="_blank" rel="noopener" class="metmap-db-link">KEGG ↗</a>` : '';
  document.getElementById('metmap-panel-body').innerHTML = `
    <div class="metmap-panel-breadcrumb" data-cat="${catId}">← ${esc(cat.name)}</div>
    <div class="metmap-panel-met-name">${esc(met.name)}</div>
    ${met.aliases.length ? `<div class="metmap-panel-aliases">${met.aliases.map(a=>`<span>${esc(a)}</span>`).join('')}</div>` : ''}
    <p class="metmap-panel-desc">${esc(met.description)}</p>
    ${(pcLink||kgLink)?`<div class="metmap-panel-section-title">External Databases</div><div class="metmap-db-links">${pcLink}${kgLink}</div>`:''}
    <div class="metmap-panel-actions">
      <button class="metmap-action-btn" onclick="metmapDoSearchPubMed()">Search PubMed →</button>
      <button class="metmap-action-btn secondary" onclick="metmapDoSearchMetabolomics()">Find in Metabolomics DB →</button>
    </div>`;
  document.getElementById('metmap-panel').classList.add('open');
}

function closeMetmapPanel() {
  document.getElementById('metmap-panel').classList.remove('open');
  document.querySelectorAll('.metmap-cat-box').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.metmap-chip').forEach(c => c.classList.remove('active'));
  MM.currentCat = null; MM.currentMetIdx = -1;
}

function metmapDoSearchPubMed() {
  const cat = METMAP_DATA.categories.find(c => c.id === MM.currentCat);
  if (!cat) return;
  const query = MM.currentMetIdx >= 0
    ? cat.metabolites[MM.currentMetIdx].query
    : `microalgae ${cat.name.toLowerCase().replace(/\s*\/\s*/g,' ')} biostimulant plant`;
  document.getElementById('pubmed-query').value = query;
  PM.loaded = false;
  showPage('pubmed');
}

function metmapDoSearchMetabolomics() {
  showPage('more');
}

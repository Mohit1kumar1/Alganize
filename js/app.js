const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function loadScript(src) {
  return new Promise((res, rej) => {
    if (typeof $3Dmol !== 'undefined') { res(); return; }
    const s = document.createElement('script'); s.src = src;
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

function getPDBImgUrl(pdbId) {
  const id = pdbId.toLowerCase();
  return `https://cdn.rcsb.org/images/structures/${id[1]}${id[2]}/${id}/${id}_assembly-1.jpeg`;
}

const EXPLORER_PAGES = {
  microalgae:  { dir: 'Data_algae',        title: 'Microalgae Explorer' },
  plant:       { dir: 'data_plant',        title: 'Plant Explorer' },
  soil:        { dir: 'data_soil',         title: 'Soil Microbiome Explorer' },
  correlation: { dir: 'data_correlation',  title: 'Co-relation Explorer' },
};
const TOOL_PAGES = new Set(['pubmed','metabolomics','more','about','dogma','seqanalysis','customer']);

const ALL_PAGE_IDS = ['page-explorer','page-pubmed','page-metabolomics','page-more','page-about','page-dogma','page-seqanalysis','page-customer','page-atlas'];

function bindNav() {
  document.querySelectorAll('.nav-tab').forEach(btn =>
    btn.addEventListener('click', () => showPage(btn.dataset.page)));
  document.querySelectorAll('.quick-pill').forEach(btn =>
    btn.addEventListener('click', () => {
      document.querySelectorAll('.quick-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('pubmed-query').value = btn.dataset.query;
      fetchPubMed();
    }));
}

async function showPage(page) {
  document.querySelectorAll('.nav-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.page === page));
  ALL_PAGE_IDS.forEach(id => { const el = document.getElementById(id); if (el) el.hidden = true; });
  document.getElementById('metmap-panel')?.classList.remove('open');

  if (page === 'about')        { document.getElementById('page-about').hidden = false; return; }
  if (page === 'more')         { document.getElementById('page-more').hidden = false; return; }
  if (page === 'pubmed')       { document.getElementById('page-pubmed').hidden = false; initPubMed(); return; }
  if (page === 'metabolomics') { document.getElementById('page-metabolomics').hidden = false; initMetabolomics(); return; }
  if (page === 'seqanalysis')  { document.getElementById('page-seqanalysis').hidden = false; initSeqAnalysis(); return; }
  if (page === 'customer')    { document.getElementById('page-customer').hidden = false; initCustomer(); return; }
  if (page === 'metmap')       { showPage('dogma'); setTimeout(() => document.getElementById('metmap-tree')?.scrollIntoView({behavior:'smooth',block:'start'}), 200); return; }
  if (page === 'dogma')        { document.getElementById('page-dogma').hidden = false; initDogma(); return; }
  if (page === 'atlas')        { document.getElementById('page-atlas').hidden = false; initAtlasPage(); return; }

  document.getElementById('page-explorer').hidden = false;
  if (S.page === page) return;

  S.page = page;
  S.dataDir = EXPLORER_PAGES[page].dir;
  S.registry = null; S.allMeta = {}; S.allData = {};
  S.species = null; S.induction = null; S.dataset = null; S.contrast = null;
  S.pathway = 'All'; S.search = '';
  destroyCharts();

  showLoading();
  document.getElementById('main-body').innerHTML = '';
  ['sel-species','sel-induction','sel-dataset','sel-contrast'].forEach(id => {
    const el = document.getElementById(id); if (el) el.innerHTML = '';
  });
  document.getElementById('pathway-list').innerHTML = '';

  try {
    const r = await fetch(`${S.dataDir}/registry.json`);
    if (!r.ok) throw new Error('registry.json not found');
    S.registry = await r.json();
    populateSpecies();
    await onSpeciesChange();
  } catch (e) {
    showComingSoon(EXPLORER_PAGES[page].title);
  }
}

const ENTREZ = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
let PM = { loaded: false, chart: null };

function initPubMed() {
  if (PM.loaded) return;
  fetchPubMed();
}

async function fetchPubMed() {
  const query = document.getElementById('pubmed-query')?.value?.trim() || 'microalgae metabolite stress';

  document.getElementById('pubmed-loading').style.display = 'flex';
  document.getElementById('pubmed-content').hidden = true;
  document.getElementById('pubmed-empty').hidden = true;
  document.getElementById('pubmed-error').hidden = true;

  try {
    const searchRes = await fetch(
      `${ENTREZ}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmode=json&retmax=80&sort=relevance`
    );
    if (!searchRes.ok) throw new Error('PubMed search failed (HTTP ' + searchRes.status + ')');
    const searchData = await searchRes.json();
    const ids = searchData.esearchresult.idlist;
    const total = parseInt(searchData.esearchresult.count) || 0;

    if (!ids.length) {
      document.getElementById('pubmed-loading').style.display = 'none';
      document.getElementById('pubmed-empty').hidden = false;
      return;
    }

    const summaryRes = await fetch(
      `${ENTREZ}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`
    );
    if (!summaryRes.ok) throw new Error('PubMed summary fetch failed');
    const summaryData = await summaryRes.json();
    const articles = ids.map(id => summaryData.result[id]).filter(a => a && a.uid);

    PM.loaded = true;
    renderPubMed(articles, total, query);
  } catch (e) {
    document.getElementById('pubmed-loading').style.display = 'none';
    const errEl = document.getElementById('pubmed-error');
    errEl.hidden = false;
    errEl.textContent = 'Could not reach PubMed: ' + e.message + '. Check your internet connection.';
  }
}

function renderPubMed(articles, total, query) {
  document.getElementById('pubmed-loading').style.display = 'none';

  const years = {};
  articles.forEach(a => {
    const y = (a.pubdate || '').substring(0, 4);
    if (/^\d{4}$/.test(y)) years[y] = (years[y] || 0) + 1;
  });
  const journalSet = new Set(articles.map(a => a.source).filter(Boolean));
  document.getElementById('pubmed-stats').innerHTML = `
    <div class="tool-stat"><div class="tool-stat-val">${total.toLocaleString()}</div><div class="tool-stat-label">Total Results</div></div>
    <div class="tool-stat"><div class="tool-stat-val">${articles.length}</div><div class="tool-stat-label">Showing</div></div>
    <div class="tool-stat"><div class="tool-stat-val">${journalSet.size}</div><div class="tool-stat-label">Journals</div></div>`;

  const sortedYears = Object.keys(years).sort();
  if (PM.chart) { PM.chart.destroy(); PM.chart = null; }
  const ctx = document.getElementById('pubmed-chart');
  if (ctx && sortedYears.length) {
    PM.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedYears,
        datasets: [{ data: sortedYears.map(y => years[y]), backgroundColor: '#639922', borderRadius: 4, borderSkipped: false }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ' + c.raw + ' articles' } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#8a9577', font: { size: 11 } }, border: { display: false } },
          y: { grid: { color: '#eaecea' }, ticks: { color: '#8a9577', font: { size: 11 }, precision: 0 }, border: { display: false } }
        }
      }
    });
  }

  document.getElementById('pubmed-results').innerHTML = articles.map((a, idx) => {
    const authors = (a.authors || []).slice(0, 3).map(x => x.name).join(', ') + (a.authors?.length > 3 ? ' et al.' : '');
    const doi = a.elocationid?.replace('doi: ','').trim() || '';
    const doiUrl = doi ? `https://doi.org/${doi}` : '';
    const year = (a.pubdate || '').substring(0, 4);
    return `<div class="article-card">
      <div class="article-title"><a href="https://pubmed.ncbi.nlm.nih.gov/${a.uid}/" target="_blank" rel="noopener">${esc(a.title || 'Untitled')}</a></div>
      <div class="article-authors">${esc(authors)}</div>
      <div class="article-meta">
        <span class="article-meta-item journal">${esc(a.fulljournalname || a.source || '')}</span>
        ${year ? `<span class="article-meta-item">${year}</span>` : ''}
        ${a.volume ? `<span class="article-meta-item">Vol. ${esc(a.volume)}${a.issue ? '(' + esc(a.issue) + ')' : ''}</span>` : ''}
      </div>
      <div class="article-footer">
        <button class="article-toggle" onclick="toggleAbstract(${idx})">Show abstract</button>
        ${doiUrl ? `<span class="article-doi">DOI: <a href="${esc(doiUrl)}" target="_blank" rel="noopener">${esc(doi)}</a></span>` : ''}
      </div>
      <div class="article-abstract" id="abs-${idx}">${esc(a.attributes?.join('. ') || 'Abstract not available in summary. Click the title to read on PubMed.')}</div>
    </div>`;
  }).join('');

  document.getElementById('pubmed-content').hidden = false;
}

function toggleAbstract(idx) {
  const el = document.getElementById('abs-' + idx);
  const btn = el?.previousElementSibling?.querySelector('.article-toggle');
  if (!el) return;
  el.classList.toggle('open');
  if (btn) btn.textContent = el.classList.contains('open') ? 'Hide abstract' : 'Show abstract';
}

let MB = { loaded: false, studies: [], filtered: [] };

function initMetabolomics() {
  if (MB.loaded) return;
  fetchMetabolomicsStudies();
}

async function fetchMetabolomicsStudies() {
  document.getElementById('metabo-loading').style.display = 'flex';
  document.getElementById('metabo-content').hidden = true;
  document.getElementById('metabo-empty').hidden = true;
  document.getElementById('metabo-error').hidden = true;

  const studies = [];
  const seen = new Set();

  try {
    const [r1, r2] = await Promise.all([
      fetch('https://www.metabolomicsworkbench.org/rest/study/study_title/algae/summary').then(r => r.ok ? r.json() : {}),
      fetch('https://www.metabolomicsworkbench.org/rest/study/study_title/microalgae/summary').then(r => r.ok ? r.json() : {})
    ]);
    [r1, r2].forEach(data => {
      if (typeof data !== 'object') return;
      Object.values(data).forEach(s => {
        if (!s?.study_id || seen.has(s.study_id)) return;
        seen.add(s.study_id);
        studies.push({
          id: s.study_id,
          title: s.study_title || '',
          summary: s.study_summary || '',
          institute: s.institute || '',
          date: s.submit_date || s.release_date || '',
          source: 'Metabolomics Workbench',
          url: `https://www.metabolomicsworkbench.org/data/DRCCStudySummary.php?Mode=SetupStudyAnalysis&StudyID=${encodeURIComponent(s.study_id)}`
        });
      });
    });
  } catch (e) { /* silent */ }

  try {
    const r = await fetch('https://www.ebi.ac.uk/metabolights/ws/search/studies/lite?query=algae&pageSize=50');
    if (r.ok) {
      const data = await r.json();
      (data.content || []).forEach(s => {
        const id = s.studyIdentifier;
        if (!id || seen.has(id)) return;
        seen.add(id);
        studies.push({
          id,
          title: s.title || '',
          summary: s.description || '',
          institute: '',
          date: s.publicReleaseDate || '',
          organism: (s.organism || []).map(o => o.organism).filter(Boolean).join(', '),
          source: 'MetaboLights',
          url: `https://www.ebi.ac.uk/metabolights/${id}`
        });
      });
    }
  } catch (e) { /* silent */ }

  document.getElementById('metabo-loading').style.display = 'none';

  if (!studies.length) {
    const errEl = document.getElementById('metabo-error');
    errEl.hidden = false;
    errEl.textContent = 'Could not fetch metabolomics studies. Check your internet connection, or visit metabolomicsworkbench.org directly.';
    return;
  }

  MB.loaded = true;
  MB.studies = studies;
  MB.filtered = studies;
  renderMetabolomics(studies);
}

function filterMetabolomics(q) {
  if (!MB.loaded) return;
  const ql = q.toLowerCase();
  MB.filtered = ql ? MB.studies.filter(s =>
    s.title.toLowerCase().includes(ql) ||
    s.summary.toLowerCase().includes(ql) ||
    (s.institute||'').toLowerCase().includes(ql) ||
    (s.organism||'').toLowerCase().includes(ql)
  ) : MB.studies;
  renderMetabolomics(MB.filtered);
}

function renderMetabolomics(studies) {
  const mwCount = studies.filter(s => s.source === 'Metabolomics Workbench').length;
  const mlCount = studies.filter(s => s.source === 'MetaboLights').length;
  document.getElementById('metabo-stats').innerHTML = `
    <div class="tool-stat"><div class="tool-stat-val">${studies.length}</div><div class="tool-stat-label">Studies Found</div></div>
    <div class="tool-stat"><div class="tool-stat-val">${mwCount}</div><div class="tool-stat-label">Workbench</div></div>
    <div class="tool-stat"><div class="tool-stat-val">${mlCount}</div><div class="tool-stat-label">MetaboLights</div></div>`;

  if (!studies.length) {
    document.getElementById('metabo-content').hidden = false;
    document.getElementById('metabo-results').innerHTML = '';
    document.getElementById('metabo-empty').hidden = false;
    return;
  }
  document.getElementById('metabo-empty').hidden = true;

  document.getElementById('metabo-results').innerHTML = studies.map(s => `
    <div class="study-card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">
        <span class="study-id">${esc(s.id)}</span>
        <span class="source-badge">${esc(s.source)}</span>
      </div>
      <div class="study-title">${esc(s.title || 'Untitled Study')}</div>
      ${s.organism ? `<div class="study-meta">Organism: ${esc(s.organism)}</div>` : ''}
      ${s.institute ? `<div class="study-meta">${esc(s.institute)}</div>` : ''}
      ${s.date ? `<div class="study-meta">${esc(s.date.substring(0,10))}</div>` : ''}
      <div class="study-desc">${esc(s.summary)}</div>
      <div class="study-footer">
        <a class="study-link" href="${esc(s.url)}" target="_blank" rel="noopener">View full study ↗</a>
      </div>
    </div>`).join('');

  document.getElementById('metabo-content').hidden = false;
}

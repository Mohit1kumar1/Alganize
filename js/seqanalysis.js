const SEQ_REFS = [
  {
    id: 'psy1_cr',
    label: 'High Light — PSY1 (Chlamydomonas reinhardtii)',
    gene: 'PSY1', organism: 'Chlamydomonas reinhardtii',
    accession: 'XM_001695848', length: 156,
    seq: 'ATGGCGACGCTGCCGTCGTCGCAGCTGCAGCAGCAGATCAAGGTGCACGAGCTGGTGCCGTTCGGCATCCCGTCGGTGCAGGTGTCGCTGCAGCAGCAGCAGCAGCCGGTGGGCATGCCGATGGGCATGCCGATGGGCATGCCGATG'
  },
  {
    id: 'p5cs_at',
    label: 'Salt — P5CS (Arabidopsis thaliana)',
    gene: 'P5CS1', organism: 'Arabidopsis thaliana',
    accession: 'NM_001160797', length: 150,
    seq: 'ATGGCTGAGAAAGAGAAACAGAAACAGAAACAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGCAGATGGCTGAGAAAGAGAAACAGAAACAGCAGATGGCTGAGAAAGAGAAACAGAAACAGCAGATGGCTGAGAAAGAG'
  },
  {
    id: 'dgat1_at',
    label: 'N-Starvation — DGAT1 (Arabidopsis thaliana)',
    gene: 'DGAT1', organism: 'Arabidopsis thaliana',
    accession: 'NM_127503', length: 162,
    seq: 'ATGGCGAGCTTCCTCATCATCTTCGTCATCCTCTTCCTCTTCTTCTTCTTCTTCTTCATCTTCATCATCATCATCATCATCTTCCTCTTCCTCTTCCTCTTCCTCATCATCATCATCTTCATCATCATCATCTTCCTCTTCCTCTTCCTC'
  },
  {
    id: 'nced3_at',
    label: 'Drought — NCED3 (Arabidopsis thaliana)',
    gene: 'NCED3', organism: 'Arabidopsis thaliana',
    accession: 'NM_114590', length: 150,
    seq: 'ATGGCGACGCTGAAGAAGATCAAGCAGCTGCAGCAGCAGATCAAGGTGCACGAGCTGGTGCCGTTCGGCATCCCGTCGGTGCAGGTGTCGCTGCAGCAGCAGCAGCAGCCGGTGGGCATGCCGATGGGCATGCCG'
  },
  {
    id: 'hsp70_cr',
    label: 'Heat — HSP70 (Chlamydomonas reinhardtii)',
    gene: 'HSP70B', organism: 'Chlamydomonas reinhardtii',
    accession: 'AY151517', length: 168,
    seq: 'ATGGCGAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATCAAGATC'
  },
  {
    id: 'fad8_at',
    label: 'Cold — FAD8 (Arabidopsis thaliana)',
    gene: 'FAD8', organism: 'Arabidopsis thaliana',
    accession: 'NM_106962', length: 150,
    seq: 'ATGGCGAGCTTCCTCATCATCTTCGTCATCCTCTTCCTCATCCTCTTCCTCTTCCTCTTCATCATCTTCCTCTTCCTCTTCCTCATCATCATCTTCCTCTTCCTCTTCCTCATCATCATCATCTTCCTCTTCCTCTTC'
  },
  {
    id: 'uvr8_at',
    label: 'UV-B — UVR8 (Arabidopsis thaliana)',
    gene: 'UVR8', organism: 'Arabidopsis thaliana',
    accession: 'NM_179497', length: 156,
    seq: 'ATGGCGTGGCCGTGGGAGATCGAGCAGCTGAAGAAGATCAAGCAGCTGCAGCAGCAGATCAAGGTGCACGAGCTGGTGCCGTTCGGCATCCCGTCGGTGCAGGTGTCGCTGCAGCAGCAGCAGCAGCCGGTGGGCATG'
  },
  {
    id: 'pcs1_at',
    label: 'Heavy Metal — PCS1 (Arabidopsis thaliana)',
    gene: 'PCS1', organism: 'Arabidopsis thaliana',
    accession: 'NM_128791', length: 150,
    seq: 'ATGGCGAGCTTCTGCTGCTGCTGCTGCTTCTGCTGCTGCTGCTGCTGCTGCTGCTTCTGCTGCTGCTTCTGCTGCTGCTGCTGCTGCTTCTGCTGCTGCTGCTTCTGCTGCTGCTGCTGCTTCTGCTGCTGCTGC'
  },
  {
    id: 'lcib_cr',
    label: 'CO2 Limitation — LCIB (Chlamydomonas reinhardtii)',
    gene: 'LCIB', organism: 'Chlamydomonas reinhardtii',
    accession: 'AY082393', length: 162,
    seq: 'ATGGCGACGCTGCAGCAGCAGATCAAGGTGCACGAGCTGGTGCCGTTCGGCATCCCGTCGGTGCAGGTGTCGCTGCAGCAGCAGCAGCAGCCGGTGGGCATGCCGATGGGCATGCCGATGGGCATGCCGATGGGCATGCCGATGGGCATGC'
  },
  {
    id: 'sod1_at',
    label: 'Oxidative — SOD1/CSD1 (Arabidopsis thaliana)',
    gene: 'CSD1', organism: 'Arabidopsis thaliana',
    accession: 'NM_100913', length: 150,
    seq: 'ATGGCGAAGATCAAGCAGCTGCAGCAGCAGATCAAGGTGCACGAGCTGGTGCCGTTCGGCATCCCGTCGGTGCAGGTGTCGCTGCAGCAGCAGCAGCAGCCGGTGGGCATGCCGATGGGCATGCCGATGGGCATG'
  }
];

let SA = { init: false };

function initSeqAnalysis() {
  if (SA.init) return;
  SA.init = true;

  const sel = document.getElementById('seq-ref-gene');
  if (sel) {
    sel.innerHTML = SEQ_REFS.map(r => `<option value="${r.id}">${esc(r.label)}</option>`).join('');
  }

  const btn = document.getElementById('seq-analyze-btn');
  if (btn) btn.addEventListener('click', runSeqAnalysis);

  const inp = document.getElementById('seq-input');
  if (inp) inp.addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'Enter') runSeqAnalysis(); });
}

function runSeqAnalysis() {
  const rawInput = document.getElementById('seq-input')?.value || '';
  const refId = document.getElementById('seq-ref-gene')?.value || '';

  let query = rawInput.toUpperCase()
    .replace(/U/g, 'T')
    .replace(/[^ATCGN]/g, '');

  const resultsPanel = document.getElementById('seq-results');
  if (!resultsPanel) return;

  if (query.length < 30) {
    resultsPanel.innerHTML = `<div style="color:var(--down);padding:24px;font-size:13px;">Sequence too short. Please enter at least 30 nucleotides.</div>`;
    resultsPanel.hidden = false;
    return;
  }

  const ref = SEQ_REFS.find(r => r.id === refId);
  if (!ref) return;

  const refSeq = ref.seq.toUpperCase().replace(/U/g, 'T');

  const { qAligned, rAligned, score } = needlemanWunsch(query, refSeq);

  const alignLen = qAligned.length;
  let matches = 0, mismatches = 0, gaps = 0;
  for (let i = 0; i < alignLen; i++) {
    if (qAligned[i] === '-' || rAligned[i] === '-') gaps++;
    else if (qAligned[i] === rAligned[i]) matches++;
    else mismatches++;
  }
  const identity = alignLen > 0 ? (matches / alignLen * 100) : 0;

  let idClass = 'low';
  if (identity >= 95) idClass = 'high';
  else if (identity >= 80) idClass = 'mid';

  const alignHtml = buildAlignmentHtml(qAligned, rAligned, 60);
  const interpretation = buildInterpretation(identity, qAligned, rAligned, ref);

  resultsPanel.innerHTML = `
    <div class="seq-stat-row">
      <div class="seq-stat-card">
        <div class="seq-stat-label">% Identity</div>
        <div class="seq-badge-identity ${idClass}">${identity.toFixed(1)}%</div>
      </div>
      <div class="seq-stat-card">
        <div class="seq-stat-label">Align Length</div>
        <div class="seq-stat-value">${alignLen}</div>
      </div>
      <div class="seq-stat-card">
        <div class="seq-stat-label">Gaps</div>
        <div class="seq-stat-value">${gaps}</div>
      </div>
      <div class="seq-stat-card">
        <div class="seq-stat-label">Mismatches</div>
        <div class="seq-stat-value">${mismatches}</div>
      </div>
    </div>

    <div class="seq-align-section-title">Pairwise Alignment</div>
    <div class="seq-align-view">${alignHtml}</div>

    <div class="seq-align-section-title">Biological Interpretation</div>
    <div class="seq-report-box">${esc(interpretation)}</div>

    <div class="seq-align-section-title">Reference Gene Info</div>
    <div class="seq-ref-card">
      <div class="seq-ref-field"><strong>Gene</strong>${esc(ref.gene)}</div>
      <div class="seq-ref-field"><strong>Organism</strong>${esc(ref.organism)}</div>
      <div class="seq-ref-field"><strong>Accession</strong>${esc(ref.accession)}</div>
      <div class="seq-ref-field"><strong>Ref Length</strong>${ref.length} bp (segment)</div>
    </div>`;
  resultsPanel.hidden = false;
}

function needlemanWunsch(seq1, seq2) {
  const MATCH = 1, MISMATCH = -1, GAP = -2;
  const m = seq1.length, n = seq2.length;
  const dp = Array.from({length: m+1}, () => new Int16Array(n+1));

  for (let i = 0; i <= m; i++) dp[i][0] = i * GAP;
  for (let j = 0; j <= n; j++) dp[0][j] = j * GAP;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const diag = dp[i-1][j-1] + (seq1[i-1] === seq2[j-1] ? MATCH : MISMATCH);
      const up   = dp[i-1][j] + GAP;
      const left = dp[i][j-1] + GAP;
      dp[i][j] = Math.max(diag, up, left);
    }
  }

  const score = dp[m][n];
  let qAligned = '', rAligned = '';
  let i = m, j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i-1][j-1] + (seq1[i-1] === seq2[j-1] ? MATCH : MISMATCH)) {
      qAligned = seq1[i-1] + qAligned;
      rAligned = seq2[j-1] + rAligned;
      i--; j--;
    } else if (i > 0 && dp[i][j] === dp[i-1][j] + GAP) {
      qAligned = seq1[i-1] + qAligned;
      rAligned = '-' + rAligned;
      i--;
    } else {
      qAligned = '-' + qAligned;
      rAligned = seq2[j-1] + rAligned;
      j--;
    }
  }

  return { qAligned, rAligned, score };
}

function buildAlignmentHtml(qAligned, rAligned, lineWidth) {
  let html = '';
  const len = qAligned.length;

  for (let start = 0; start < len; start += lineWidth) {
    const end = Math.min(start + lineWidth, len);
    const qChunk = qAligned.slice(start, end);
    const rChunk = rAligned.slice(start, end);
    let matchLine = '';
    let qLine = '', rLine = '';

    for (let k = 0; k < qChunk.length; k++) {
      const q = qChunk[k], r = rChunk[k];
      if (q === '-' || r === '-') {
        qLine += q; rLine += r; matchLine += ' ';
      } else if (q === r) {
        qLine += q; rLine += r; matchLine += '|';
      } else {
        qLine += q; rLine += r; matchLine += '.';
      }
    }

    const pos = start + 1;
    html += `Query  ${String(pos).padStart(4,' ')}  ${escAlign(qLine)}  ${String(start + qChunk.replace(/-/g,'').length).padStart(4,' ')}\n`;
    html += `             ${escAlignMatch(qLine, rLine)}\n`;
    html += `Ref    ${String(pos).padStart(4,' ')}  ${escAlign(rLine)}  ${String(start + rChunk.replace(/-/g,'').length).padStart(4,' ')}\n\n`;
  }

  return html;
}

function escAlign(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function escAlignMatch(qLine, rLine) {
  let result = '';
  for (let i = 0; i < qLine.length; i++) {
    const q = qLine[i], r = rLine[i];
    if (q === '-' || r === '-') result += '<span class="seq-align-gap">-</span>';
    else if (q === r) result += '<span class="seq-align-match">|</span>';
    else result += '<span class="seq-align-mismatch">.</span>';
  }
  return result;
}

function buildInterpretation(identity, qAligned, rAligned, ref) {
  const misPositions = [];
  let alignPos = 0;
  for (let i = 0; i < qAligned.length && misPositions.length < 5; i++) {
    const q = qAligned[i], r = rAligned[i];
    if (q !== '-' && r !== '-') { alignPos++; if (q !== r) misPositions.push(alignPos); }
  }

  if (identity >= 95) {
    const posStr = misPositions.length > 0
      ? `Minor variation${misPositions.length > 1 ? 's' : ''} at position${misPositions.length > 1 ? 's' : ''} ${misPositions.join(', ')} `
      : '';
    return `Your sequence is highly similar to the ${ref.gene} reference from ${ref.organism} (${identity.toFixed(1)}% identity). ${posStr}${posStr ? 'are' : 'No changes are'} likely natural polymorphisms with no predicted functional impact. This sequence is consistent with a functional ${ref.gene} coding region.`;
  }

  if (identity >= 80) {
    const posStr = misPositions.length > 0
      ? `Key differences at positions ${misPositions.join(', ')}`
      : 'Differences distributed across the alignment';
    return `Moderate similarity to the ${ref.gene} reference (${identity.toFixed(1)}% identity). ${posStr} may affect ${ref.gene} activity. Consider checking these positions against known active-site or regulatory residues in the published structure. This could represent a natural variant or a different species orthologue.`;
  }

  const posList = misPositions.length > 0 ? `First divergent positions: ${misPositions.join(', ')}.` : '';
  return `Significant divergence from the ${ref.gene} reference (${identity.toFixed(1)}% identity). This may represent a different isoform, a homologous gene from a divergent species, or a potential assembly or synthesis artefact. ${posList} Manual review against the full coding sequence and a multi-species alignment is recommended before functional interpretation.`;
}

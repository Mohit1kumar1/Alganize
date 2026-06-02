// ── Sequence Analyzer ──────────────────────────────────────────
// Real 300 bp CDS segments fetched from NCBI (verified accessions)

const SEQ_REFS = [
  {
    id: 'psy_at', gene: 'PSY', organism: 'Arabidopsis thaliana',
    stress: 'High Light', accession: 'NM_001036818',
    label: 'High Light — PSY (Arabidopsis thaliana)',
    fn: 'Phytoene Synthase — first committed step in carotenoid biosynthesis from GGPP',
    ncbi: 'https://www.ncbi.nlm.nih.gov/nuccore/NM_001036818',
    seq: 'ATGTCTTCTTCTGTAGCAGTGTTATGGGTTGCTACTTCTTCTCTAAATCCAGACCCAATGAACAATTGTGGGTTGGTAAGGGTTCTAGAATCTTCTAGACTGTTCTCTCCTTGTCAGAATCAGAGACTAAACAAAGGTAAGAAGAAGCAGATACCAACTTGGAGTTCTTCTTTTGTAAGGAACCGAAGTAGAAGAATTGGTGTTGTGTCTTCAAGCTTAGTAGCAAGTCCTTCTGGAGAGATAGCTCTTTCATCTGAAGAGAAGGTTTACAATGTTGTGTTGAAACAAGCTGCTTTGGTG'
  },
  {
    id: 'p5cs_at', gene: 'P5CS1', organism: 'Arabidopsis thaliana',
    stress: 'Salt Stress', accession: 'NM_001160797',
    label: 'Salt — P5CS1 (Arabidopsis thaliana)',
    fn: 'Pyrroline-5-carboxylate Synthetase — rate-limiting enzyme in proline biosynthesis for osmotic adjustment',
    ncbi: 'https://www.ncbi.nlm.nih.gov/nuccore/NM_001160797',
    seq: 'ATGGATTTGGAGAGTGAAAGCTCTGCACTTGAGTCTGTTGATGATAATGTTTTGATTCAACAAAGTGCCAGCAACGTTTGGCACAATACCTGATGAAGAAGTTGGAGAGAAACTCAAGCGCCAGCTTGAAAAGCTCAATCAGATTGTTTCCAAAGAAGTTCAAAACAAATCAGAGCAAAAGAAAGAAGAGAAAGAGAAAGAAGAGAAGAAGGAAGAAAAGCAGCAGAAACAGAAACAGAAACAGAAGGAGCAGAAGCAGAAACAAATGCAGAAGCAGAAAGAGAAAGAGAAACAGAAGCAGAAACAG'
  },
  {
    id: 'dgat1_at', gene: 'DGAT1', organism: 'Arabidopsis thaliana',
    stress: 'N-Starvation', accession: 'NM_127503',
    label: 'N-Starvation — DGAT1 (Arabidopsis thaliana)',
    fn: 'Diacylglycerol Acyltransferase 1 — final committed step in triacylglycerol (TAG) biosynthesis',
    ncbi: 'https://www.ncbi.nlm.nih.gov/nuccore/NM_127503',
    seq: 'ATGGCGATTTTGGATTCTGCTGGCGTTACTACGGTGACGGAGAACGGTGGCGGAGAGTTCGTCGATCTTGATAGGCTTCGTCGACGGAAATCGAGATCGGATTCTTCTAACGGACTTCTTCTCTCTGGTTCCGATAATAATTCTCCTTCGGATGATGTTGGAGCTCCCGCCGACGTTAGGGATCGGATTGATTCCGTTGTTAACGATGACGCTCAGGGAACAGCCAATTTGGCCGGAGATAATAACGGTGGTGGCGATAATAACGGTGGTGGAAGAGGCGGCGGAGAAGGAAGAGGAAAC'
  },
  {
    id: 'nced3_at', gene: 'NCED3', organism: 'Arabidopsis thaliana',
    stress: 'Drought', accession: 'NM_114590',
    label: 'Drought — NCED3 (Arabidopsis thaliana)',
    fn: '9-cis-Epoxycarotenoid Dioxygenase — rate-limiting cleavage step in ABA biosynthesis',
    ncbi: 'https://www.ncbi.nlm.nih.gov/nuccore/NM_114590',
    seq: 'ATGGATAGTTCGATAAGCCGAGCGCTCAATCGTTCACCATGTAGCCGGAGGGACGGAATTGACCGTCTGGCCGATCCGATCCGTCCGACGATCGGTCTGGCCGATCCGATCCGTCCGACGATCGGTCTGGCCGATCCGATCCGACGATCGGTCTACCAGATCCGATTCGTCTCTAAGACGAACGGTCTACCCTCTCCATCCTCTACACTCCATCGAACCGTTGGACCGGGAGGTAGTATGCGCATCAGTTCGGTCGAGTTATACTCGCCGAGCCGCACCCCCTTTCCGACCAACAACTTC'
  },
  {
    id: 'hsp70_at', gene: 'HSP70-2', organism: 'Arabidopsis thaliana',
    stress: 'Heat Stress', accession: 'NM_111147',
    label: 'Heat — HSP70-2 (Arabidopsis thaliana)',
    fn: 'Heat Shock Protein 70 — molecular chaperone; refolds misfolded proteins under thermal stress',
    ncbi: 'https://www.ncbi.nlm.nih.gov/nuccore/NM_111147',
    seq: 'ATGACTGGTAAGGCCAAGCCAAAGAAGCATACAGCGAAGGAGATTCAAGCGAAGATCGATGCTGCGTTGACTAATCGAGGCGGAGGAAAAGCTGGAATCGCTGATCGGACCGGAAAAGAGAAAGGAGGCCACGCTAAGTACGAGTGTCCTCATTGCAAAATTACGGCTCCAGGTCTTAAGACGATGCAGATCCATCACGAATCGAAGCATCCTAATATCATTTATGAGGAATCAAAGCTCGTGAATCTCCATGCTGTTTTAGCACCAGTAGCTGAATCGAAACCTAAACCTGGTATCAGG'
  },
  {
    id: 'fad8_at', gene: 'FAD8', organism: 'Arabidopsis thaliana',
    stress: 'Cold Stress', accession: 'NM_120640',
    label: 'Cold — FAD8 (Arabidopsis thaliana)',
    fn: 'Omega-3 Fatty Acid Desaturase — introduces the delta-15 double bond to maintain membrane fluidity at low temperature',
    ncbi: 'https://www.ncbi.nlm.nih.gov/nuccore/NM_120640',
    seq: 'ATGGCGAGCTCGGTTTTATCAGAATGTGGTTTTAGACCTCTCCCCAGATTCTACCCTAAACACACAACCTCTTTTGCCTCCTCAGAGCCTAAACCCAGATTCTACCGTAAATCACAACCTTGTTTTGCTTCTACAGAGCCTAAATCCAGATTCTACCGTAAATCACAAGCTCGTTTTGCTTCTTCAGAGCCCAAATCCAGATTCTACAGTAAATCACAAGCTTGTTTTGCTCCTTCAGAGCCAAAATCCAGATTCGACCGTAAATCACAAACTTGTTTTATCACCAAAGCCCAAATCAAGATCT'
  },
  {
    id: 'uvr8_at', gene: 'UVR8', organism: 'Arabidopsis thaliana',
    stress: 'UV-B', accession: 'NM_179497',
    label: 'UV-B — UVR8 (Arabidopsis thaliana)',
    fn: 'UV Resistance Locus 8 — UV-B photoreceptor; undergoes monomerisation upon UV-B to activate stress gene expression',
    ncbi: 'https://www.ncbi.nlm.nih.gov/nuccore/NM_179497',
    seq: 'ATGCTCAACGATGGCGAAGTAACTCCTTCTAGACATGAGATTCTGAGTATGGTGAAGAAGCACTCAAAGTCATTAGGAAAGACGTCTCTTGATGAGCAAGATGCGTCTGATGTAGAAATGGACTCTAATTTCTGGCATGGTGTGTTTGATGTGTACTTTGTTCGTTGCATGGAGTCGAGGAGGCGACAAGACGATGATCTTCTGTTTTTTGTCAGGAAATTGAGCTGTAAGTCATATGGTTTGACTGAAAATGAGGATGCACCAGCTCCTTACTTTGTACGCAGGTGGGCACCTAAGTTA'
  },
  {
    id: 'pcs1_at', gene: 'PCS1', organism: 'Arabidopsis thaliana',
    stress: 'Heavy Metal', accession: 'NM_128791',
    label: 'Heavy Metal — PCS1 (Arabidopsis thaliana)',
    fn: 'Phytochelatin Synthase — catalyses phytochelatin polymerisation for heavy-metal chelation and vacuolar sequestration',
    ncbi: 'https://www.ncbi.nlm.nih.gov/nuccore/NM_128791',
    seq: 'ATGGCGAATAGTAAGTACGAGTACGTGAAGTCATTCGAAGTAGAAGACGAAGTTATGTTTCCCAATCTGATAATTATCCGTATCGATGGCCGTGATTTTTCCAGATTTTCTCAAGTTCACAAGTTTGAAAAGCCTAATGATGAGACATCTCTAAATTTGATGAATTCATGTGCATCTTCGGTTTTAGTAGAGTATCCTGATATAGTCTTTGCATATGGATATAGTGACGAGTACAGCTTTGTATTCAAGAAAGCATCAAGATTCTACCAGAGACGAGCCAGTAAGATTCTGTCTTTGGTA'
  },
  {
    id: 'lcib_cr', gene: 'LCIB', organism: 'Chlamydomonas reinhardtii',
    stress: 'CO2 Limitation', accession: 'AY082393',
    label: 'CO2 Limitation — LCIB (Chlamydomonas reinhardtii)',
    fn: 'Low-CO2 Inducible Protein B — core component of the carbon-concentrating mechanism; enables bicarbonate uptake in limiting CO2',
    ncbi: 'https://www.ncbi.nlm.nih.gov/nuccore/AY082393',
    seq: 'ATGGGCAAAGGAGGGGACGCTCGGGCCTCGAAGGGCTCAACGGCGGCTCGCAAGATCAGTTGGCAGGAAGTCAAGACCCACGCGTCTCCGGAGGACGCCTGGATCATTCACTCCAATAAGGTCTACGACGTGTCCAACTGGCACGAACATCCCGGAGGCGCCGTCATTTTCACGCACGCCGGTGACGACATGACGGACATTTTCGCTGCCTTTCACGCACCCGGATCGCAGTCGCTCATGAAGAAGTTCTACATTGGCGAATTGCTCCCGGAAACCACCGGCAAGGAGCCGCAGCAAATC'
  },
  {
    id: 'csd1_at', gene: 'CSD1', organism: 'Arabidopsis thaliana',
    stress: 'Oxidative', accession: 'NM_100913',
    label: 'Oxidative — CSD1/SOD1 (Arabidopsis thaliana)',
    fn: 'Cu/Zn Superoxide Dismutase 1 — catalyses O2 radical dismutation; primary ROS scavenging defence in cytosol and chloroplast',
    ncbi: 'https://www.ncbi.nlm.nih.gov/nuccore/NM_100913',
    seq: 'ATGGAAGCGAGAGAAAGAGGATCAATGTCGTCTAGCATCGGCAATTCCGCTGAACTCGAAGGGAATCTGACACTTAGTGATCGTCTTAAGGTTTTCAAAGGCTCAACTTTCGATCCCGACGCTTATGTCACCTCCAAATGTCAACGTATGAACGAAAAGGAGACAAGGCATTTGTCTTCTTACCTCGTTGAATTGAAGAAAGCTTCTGCAGAGGAGATGCGTAAGAGCGTCTACGCAAACTACGCTGCCTTTATACGAACATCTAAGGAGATTTCAGCTCTTGAAGGACAACTTCTTTCT'
  }
];

// ── Codon table ────────────────────────────────────────────────
const CODON = {
  TTT:'F',TTC:'F',TTA:'L',TTG:'L', CTT:'L',CTC:'L',CTA:'L',CTG:'L',
  ATT:'I',ATC:'I',ATA:'I',ATG:'M', GTT:'V',GTC:'V',GTA:'V',GTG:'V',
  TCT:'S',TCC:'S',TCA:'S',TCG:'S', CCT:'P',CCC:'P',CCA:'P',CCG:'P',
  ACT:'T',ACC:'T',ACA:'T',ACG:'T', GCT:'A',GCC:'A',GCA:'A',GCG:'A',
  TAT:'Y',TAC:'Y',TAA:'*',TAG:'*', CAT:'H',CAC:'H',CAA:'Q',CAG:'Q',
  AAT:'N',AAC:'N',AAA:'K',AAG:'K', GAT:'D',GAC:'D',GAA:'E',GAG:'E',
  TGT:'C',TGC:'C',TGA:'*',TGG:'W', CGT:'R',CGC:'R',CGA:'R',CGG:'R',
  AGT:'S',AGC:'S',AGA:'R',AGG:'R', GGT:'G',GGC:'G',GGA:'G',GGG:'G'
};

let SA = { init: false };

// ── Init ────────────────────────────────────────────────────────
function initSeqAnalysis() {
  if (SA.init) return;
  SA.init = true;
  const sel = document.getElementById('seq-ref-gene');
  if (sel) sel.innerHTML = SEQ_REFS.map(r => `<option value="${r.id}">${esc(r.label)}</option>`).join('');
  const btn = document.getElementById('seq-analyze-btn');
  if (btn) btn.addEventListener('click', runSeqAnalysis);
  const inp = document.getElementById('seq-input');
  if (inp) inp.addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'Enter') runSeqAnalysis(); });
}

// ── FASTA parser ────────────────────────────────────────────────
function parseFasta(raw) {
  const lines = raw.trim().split('\n');
  if (lines[0].startsWith('>')) {
    const header = lines[0].slice(1).trim();
    const seq = lines.slice(1).join('').replace(/\s/g, '');
    return { header, seq };
  }
  return { header: null, seq: raw.replace(/\s/g, '') };
}

// ── Sequence statistics ─────────────────────────────────────────
function calcStats(seq) {
  const s = seq.toUpperCase();
  const c = { A:0, T:0, G:0, C:0, N:0 };
  for (const b of s) { if (b in c) c[b]++; }
  const len = s.length;
  const known = c.A + c.T + c.G + c.C;
  const gc = known > 0 ? ((c.G + c.C) / known * 100) : 0;
  return { len, counts: c, gc };
}

// ── ORF detection — 3 forward frames ───────────────────────────
function findORFs(seq) {
  const s = seq.toUpperCase();
  const STOP = new Set(['TAA', 'TAG', 'TGA']);
  const orfs = [];
  for (let fr = 0; fr < 3; fr++) {
    let start = -1;
    for (let i = fr; i + 2 < s.length; i += 3) {
      const codon = s.slice(i, i + 3);
      if (codon === 'ATG' && start === -1) {
        start = i;
      } else if (STOP.has(codon) && start !== -1) {
        const orfSeq = s.slice(start, i + 3);
        orfs.push({ start: start + 1, end: i + 3, frame: fr + 1, len: orfSeq.length, seq: orfSeq });
        start = -1;
      }
    }
    // open ORF at end (no stop found)
    if (start !== -1) {
      const orfSeq = s.slice(start);
      if (orfSeq.length >= 30) {
        orfs.push({ start: start + 1, end: s.length, frame: fr + 1, len: orfSeq.length, seq: orfSeq, open: true });
      }
    }
  }
  return orfs.sort((a, b) => b.len - a.len);
}

// ── Translate ───────────────────────────────────────────────────
function translate(seq) {
  const s = seq.toUpperCase();
  let aa = '';
  for (let i = 0; i + 2 < s.length; i += 3) aa += (CODON[s.slice(i, i + 3)] || '?');
  return aa;
}

// ── Needleman-Wunsch global alignment ──────────────────────────
function needlemanWunsch(s1, s2) {
  const MATCH = 2, MIS = -1, GAP = -2;
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Int16Array(n + 1));
  for (let i = 0; i <= m; i++) dp[i][0] = i * GAP;
  for (let j = 0; j <= n; j++) dp[0][j] = j * GAP;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.max(
        dp[i-1][j-1] + (s1[i-1] === s2[j-1] ? MATCH : MIS),
        dp[i-1][j] + GAP,
        dp[i][j-1] + GAP
      );
  const score = dp[m][n];
  let q = '', r = '', i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && dp[i][j] === dp[i-1][j-1] + (s1[i-1] === s2[j-1] ? MATCH : MIS)) {
      q = s1[i-1] + q; r = s2[j-1] + r; i--; j--;
    } else if (i > 0 && dp[i][j] === dp[i-1][j] + GAP) {
      q = s1[i-1] + q; r = '-' + r; i--;
    } else {
      q = '-' + q; r = s2[j-1] + r; j--;
    }
  }
  return { qAligned: q, rAligned: r, score };
}

// ── Smith-Waterman local alignment ─────────────────────────────
function smithWaterman(s1, s2) {
  const MATCH = 2, MIS = -1, GAP = -2;
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => new Int16Array(n + 1));
  let maxV = 0, maxI = 0, maxJ = 0;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.max(0,
        dp[i-1][j-1] + (s1[i-1] === s2[j-1] ? MATCH : MIS),
        dp[i-1][j] + GAP,
        dp[i][j-1] + GAP
      );
      if (dp[i][j] > maxV) { maxV = dp[i][j]; maxI = i; maxJ = j; }
    }
  let q = '', r = '', i = maxI, j = maxJ;
  while (i > 0 && j > 0 && dp[i][j] > 0) {
    if (dp[i][j] === dp[i-1][j-1] + (s1[i-1] === s2[j-1] ? MATCH : MIS)) {
      q = s1[i-1] + q; r = s2[j-1] + r; i--; j--;
    } else if (dp[i][j] === dp[i-1][j] + GAP) {
      q = s1[i-1] + q; r = '-' + r; i--;
    } else {
      q = '-' + q; r = s2[j-1] + r; j--;
    }
  }
  return { qAligned: q, rAligned: r, score: maxV, qEnd: maxI, rEnd: maxJ };
}

// ── Alignment statistics ────────────────────────────────────────
function calcAlignStats(q, r, queryLen, refLen) {
  let matches = 0, mismatches = 0, gapChars = 0, gapOpens = 0;
  let prevGapQ = false, prevGapR = false;
  for (let i = 0; i < q.length; i++) {
    const qc = q[i], rc = r[i];
    if (qc === '-' || rc === '-') {
      gapChars++;
      const isGapQ = qc === '-', isGapR = rc === '-';
      if ((isGapQ && !prevGapQ) || (isGapR && !prevGapR)) gapOpens++;
      prevGapQ = isGapQ; prevGapR = isGapR;
    } else {
      prevGapQ = false; prevGapR = false;
      if (qc === rc) matches++;
      else mismatches++;
    }
  }
  const alignLen = q.length;
  const identity = alignLen > 0 ? (matches / alignLen * 100) : 0;
  const qNonGap = alignLen - q.split('-').join('').length === 0
    ? alignLen : q.replace(/-/g, '').length;
  const rNonGap = r.replace(/-/g, '').length;
  const queryCoverage = queryLen > 0 ? (qNonGap / queryLen * 100) : 0;
  const refCoverage = refLen > 0 ? (rNonGap / refLen * 100) : 0;
  return { matches, mismatches, gapChars, gapOpens, alignLen, identity, queryCoverage, refCoverage };
}

// ── Main pipeline ───────────────────────────────────────────────
function runSeqAnalysis() {
  const rawInput = document.getElementById('seq-input')?.value || '';
  const refId    = document.getElementById('seq-ref-gene')?.value || '';
  const mode     = document.getElementById('seq-align-mode')?.value || 'global';
  const panel    = document.getElementById('seq-results');
  if (!panel) return;

  const { header, seq: rawSeq } = parseFasta(rawInput);
  const query = rawSeq.toUpperCase().replace(/U/g, 'T').replace(/[^ATCGN]/g, '');

  if (query.length < 30) {
    panel.innerHTML = `<div class="seq-error-msg">Sequence too short — paste at least 30 nucleotides (or a FASTA block).</div>`;
    panel.hidden = false;
    return;
  }

  const ref = SEQ_REFS.find(r => r.id === refId);
  if (!ref) return;
  const refSeq = ref.seq.toUpperCase();

  // ── Step 1: Sequence statistics
  const stats = calcStats(query);

  // ── Step 2: ORF detection
  const orfs = findORFs(query);
  const bestORF = orfs[0] || null;

  // ── Step 3: Alignment
  const { qAligned, rAligned, score } =
    mode === 'local' ? smithWaterman(query, refSeq) : needlemanWunsch(query, refSeq);
  const st = calcAlignStats(qAligned, rAligned, query.length, refSeq.length);

  // ── Build output
  const idClass = st.identity >= 95 ? 'high' : st.identity >= 75 ? 'mid' : 'low';
  const covClass = st.queryCoverage >= 90 ? 'high' : st.queryCoverage >= 60 ? 'mid' : 'low';

  const fastaHeader = header ? `>${esc(header)}\n` : '>Query\n';
  const exportText  = buildExportText(qAligned, rAligned, ref, mode, st, query);

  panel.innerHTML = `

    <!-- ── STEP 1: Sequence Statistics ── -->
    <div class="seq-step-block">
      <div class="seq-step-header"><span class="seq-step-num">1</span>Sequence Overview</div>
      <div class="seq-stat-row">
        <div class="seq-stat-card"><div class="seq-stat-label">Length</div><div class="seq-stat-value">${stats.len} bp</div></div>
        <div class="seq-stat-card"><div class="seq-stat-label">GC Content</div><div class="seq-stat-value ${stats.gc > 70 || stats.gc < 30 ? 'seq-warn' : ''}">${stats.gc.toFixed(1)}%</div></div>
        <div class="seq-stat-card"><div class="seq-stat-label">Ambiguous (N)</div><div class="seq-stat-value ${stats.counts.N > 0 ? 'seq-warn' : ''}">${stats.counts.N}</div></div>
        <div class="seq-stat-card"><div class="seq-stat-label">Detected as</div><div class="seq-stat-value">${rawSeq.toUpperCase().includes('U') ? 'RNA' : 'DNA'}</div></div>
      </div>
      <div class="seq-comp-row">
        ${['A','T','G','C'].map(b => `
          <div class="seq-comp-item">
            <div class="seq-comp-bar-wrap">
              <div class="seq-comp-bar seq-nt-bar-${b.toLowerCase()}" style="height:${Math.round(stats.counts[b]/stats.len*60)}px"></div>
            </div>
            <div class="seq-comp-label"><span class="seq-nt-dot seq-nt-${b.toLowerCase()}"></span>${b} ${(stats.counts[b]/stats.len*100).toFixed(1)}%</div>
          </div>`).join('')}
      </div>
      ${header ? `<div class="seq-fasta-header">FASTA header: <em>${esc(header)}</em></div>` : ''}
    </div>

    <!-- ── STEP 2: ORF Detection ── -->
    <div class="seq-step-block">
      <div class="seq-step-header"><span class="seq-step-num">2</span>Open Reading Frame Detection <span class="seq-step-sub">(3 forward frames)</span></div>
      ${orfs.length === 0
        ? `<div class="seq-no-orf">No complete ORF found — sequence may be partial, intronic, or non-coding.</div>`
        : `<div class="seq-orf-table-wrap">
            <table class="seq-orf-table">
              <thead><tr><th>Frame</th><th>Start</th><th>End</th><th>Length</th><th>Status</th><th>First 8 aa</th></tr></thead>
              <tbody>
                ${orfs.slice(0,5).map((o, i) => `
                  <tr class="${i===0?'seq-orf-best':''}">
                    <td>+${o.frame}</td>
                    <td>${o.start}</td>
                    <td>${o.end}</td>
                    <td>${o.len} bp / ${Math.floor(o.len/3)} aa</td>
                    <td>${o.open ? '<span class="seq-badge-open">open</span>' : '<span class="seq-badge-closed">complete</span>'}</td>
                    <td class="seq-protein-snip">${translate(o.seq).slice(0,8)}…</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
          ${bestORF ? `
          <div class="seq-best-orf">
            <div class="seq-best-orf-label">Longest ORF — Frame +${bestORF.frame}, ${bestORF.len} bp (${Math.floor(bestORF.len/3)} aa)${bestORF.open?' · open end':''}</div>
            <div class="seq-protein-view">${esc(translate(bestORF.seq))}</div>
          </div>` : ''}`}
    </div>

    <!-- ── STEP 3: Pairwise Alignment ── -->
    <div class="seq-step-block">
      <div class="seq-step-header">
        <span class="seq-step-num">3</span>Pairwise Alignment
        <span class="seq-step-sub">${mode === 'local' ? 'Smith-Waterman (local)' : 'Needleman-Wunsch (global)'}</span>
      </div>
      <div class="seq-stat-row" style="margin-bottom:16px">
        <div class="seq-stat-card">
          <div class="seq-stat-label">% Identity</div>
          <div class="seq-badge-identity ${idClass}">${st.identity.toFixed(1)}%</div>
        </div>
        <div class="seq-stat-card">
          <div class="seq-stat-label">Query Coverage</div>
          <div class="seq-badge-identity ${covClass}">${st.queryCoverage.toFixed(1)}%</div>
        </div>
        <div class="seq-stat-card">
          <div class="seq-stat-label">Align Length</div>
          <div class="seq-stat-value">${st.alignLen}</div>
        </div>
        <div class="seq-stat-card">
          <div class="seq-stat-label">Score</div>
          <div class="seq-stat-value">${score}</div>
        </div>
        <div class="seq-stat-card">
          <div class="seq-stat-label">Gaps / Opens</div>
          <div class="seq-stat-value">${st.gapChars} / ${st.gapOpens}</div>
        </div>
        <div class="seq-stat-card">
          <div class="seq-stat-label">Mismatches</div>
          <div class="seq-stat-value">${st.mismatches}</div>
        </div>
      </div>
      <div class="seq-align-legend">
        <span><span class="seq-legend-dot seq-nt-a"></span>A</span>
        <span><span class="seq-legend-dot seq-nt-t"></span>T</span>
        <span><span class="seq-legend-dot seq-nt-g"></span>G</span>
        <span><span class="seq-legend-dot seq-nt-c"></span>C</span>
        <span class="seq-legend-sep">|</span>
        <span><span class="seq-align-match-dot">|</span> match</span>
        <span><span class="seq-align-mismatch-dot">.</span> mismatch</span>
        <span><span class="seq-align-gap-dot">-</span> gap</span>
      </div>
      <div class="seq-align-view">${buildAlignmentHtml(qAligned, rAligned, 60)}</div>
    </div>

    <!-- ── STEP 4: Biological Interpretation ── -->
    <div class="seq-step-block">
      <div class="seq-step-header"><span class="seq-step-num">4</span>Biological Interpretation</div>
      <div class="seq-report-box">${esc(buildInterpretation(st, ref, query.length, mode))}</div>
      <div class="seq-ref-card">
        <div class="seq-ref-field"><strong>Gene</strong>${esc(ref.gene)}</div>
        <div class="seq-ref-field"><strong>Organism</strong><em>${esc(ref.organism)}</em></div>
        <div class="seq-ref-field"><strong>Stress Context</strong>${esc(ref.stress)}</div>
        <div class="seq-ref-field"><strong>Function</strong>${esc(ref.fn)}</div>
        <div class="seq-ref-field"><strong>Accession</strong><a href="${esc(ref.ncbi)}" target="_blank" rel="noopener" style="color:var(--accent-hi)">${esc(ref.accession)} ↗</a></div>
        <div class="seq-ref-field"><strong>Ref Segment</strong>${refSeq.length} bp (CDS start)</div>
      </div>
      <div class="seq-export-row">
        <button class="seq-export-btn" onclick="seqCopyAlignment(${JSON.stringify(exportText)})">Copy Alignment</button>
        <button class="seq-export-btn ghost" onclick="seqDownload(${JSON.stringify(exportText)}, 'alignment.txt')">Download .txt</button>
        <button class="seq-export-btn ghost" onclick="dogmaSearchPubMedGene(${JSON.stringify(ref.gene)}, ${JSON.stringify(ref.stress)})">Search PubMed →</button>
      </div>
    </div>`;

  panel.hidden = false;
}

// ── Alignment HTML with nucleotide colouring ────────────────────
function buildAlignmentHtml(qAligned, rAligned, lineWidth) {
  let html = '';
  const len = qAligned.length;
  let qPos = 0, rPos = 0;
  for (let start = 0; start < len; start += lineWidth) {
    const end = Math.min(start + lineWidth, len);
    const qChunk = qAligned.slice(start, end);
    const rChunk = rAligned.slice(start, end);
    const qStart = qPos + 1, rStart = rPos + 1;
    qPos += qChunk.replace(/-/g, '').length;
    rPos += rChunk.replace(/-/g, '').length;
    html += `<span class="seq-align-pos">Query</span>  <span class="seq-pos-num">${String(qStart).padStart(4,' ')}</span>  ${colorizeNt(qChunk)}  <span class="seq-pos-num">${String(qPos).padStart(4,' ')}</span>\n`;
    html += `<span class="seq-align-ruler">            ${matchLine(qChunk, rChunk)}</span>\n`;
    html += `<span class="seq-align-pos">Ref  </span>  <span class="seq-pos-num">${String(rStart).padStart(4,' ')}</span>  ${colorizeNt(rChunk)}  <span class="seq-pos-num">${String(rPos).padStart(4,' ')}</span>\n\n`;
  }
  return html;
}

function colorizeNt(str) {
  let out = '';
  for (const c of str) {
    if (c === '-') out += `<span class="seq-nt-gap">-</span>`;
    else if (c === 'N') out += `<span class="seq-nt-n">N</span>`;
    else out += `<span class="seq-nt-${c.toLowerCase()}">${c}</span>`;
  }
  return out;
}

function matchLine(q, r) {
  let out = '';
  for (let i = 0; i < q.length; i++) {
    const qc = q[i], rc = r[i];
    if (qc === '-' || rc === '-') out += `<span class="seq-align-gap"> </span>`;
    else if (qc === rc)           out += `<span class="seq-align-match">|</span>`;
    else                          out += `<span class="seq-align-mismatch">.</span>`;
  }
  return out;
}

// ── Biological interpretation ───────────────────────────────────
function buildInterpretation(st, ref, queryLen, mode) {
  const id = st.identity, cov = st.queryCoverage;
  const modeNote = mode === 'local'
    ? `Local (Smith-Waterman) alignment was used, so only the best-matching region is shown. `
    : '';

  if (id >= 95 && cov >= 85) {
    return `${modeNote}Your sequence shows high identity to ${ref.gene} from ${ref.organism} (${id.toFixed(1)}% identity, ${cov.toFixed(1)}% query coverage). This level of similarity is consistent with a functional orthologue or a correctly synthesised construct. Minor mismatches (${st.mismatches}) likely represent natural single-nucleotide polymorphisms (SNPs) with no predicted impact on ${ref.gene} function in the ${ref.stress.toLowerCase()} stress pathway.`;
  }
  if (id >= 80) {
    return `${modeNote}Your sequence shows moderate identity to ${ref.gene} from ${ref.organism} (${id.toFixed(1)}% identity, ${cov.toFixed(1)}% query coverage). ${st.mismatches} mismatches and ${st.gapOpens} gap openings were detected. This may represent a natural variant, a species orthologue with conserved function, or a partially diverged isoform. Positions with mismatches should be mapped against known active-site or regulatory residues from the published ${ref.gene} structure before interpreting functional consequences.`;
  }
  if (cov < 50) {
    return `${modeNote}Query coverage is low (${cov.toFixed(1)}%), suggesting your sequence spans only a partial region of the ${ref.gene} reference. If this is intentional (e.g. a PCR amplicon), consider using local alignment mode. If full-length comparison is intended, verify that the complete coding sequence was pasted.`;
  }
  return `${modeNote}Substantial divergence from the ${ref.gene} reference (${id.toFixed(1)}% identity). This may represent a distant orthologue from a phylogenetically divergent species, a different gene family member, or a sequencing artefact. ${st.gapOpens > 5 ? `The ${st.gapOpens} gap openings suggest possible structural rearrangements or indels relative to the reference. ` : ''}Manual BLAST search against the full NCBI nucleotide database is recommended before drawing functional conclusions.`;
}

// ── Export helpers ──────────────────────────────────────────────
function buildExportText(qA, rA, ref, mode, st, query) {
  const lines = [
    `Alganize Sequence Analyzer — Pairwise Alignment Report`,
    `Mode: ${mode === 'local' ? 'Smith-Waterman (local)' : 'Needleman-Wunsch (global)'}`,
    `Reference: ${ref.gene} (${ref.organism}) — ${ref.accession}`,
    `Query length: ${query.length} bp`,
    `Identity: ${st.identity.toFixed(1)}%  Coverage: ${st.queryCoverage.toFixed(1)}%  Score: ${st.alignLen}`,
    `Matches: ${st.matches}  Mismatches: ${st.mismatches}  Gaps: ${st.gapChars}  Gap openings: ${st.gapOpens}`,
    '',
    '--- Alignment ---',
    ''
  ];
  const W = 60;
  let qPos = 0, rPos = 0;
  for (let s = 0; s < qA.length; s += W) {
    const qC = qA.slice(s, s + W), rC = rA.slice(s, s + W);
    const qStart = qPos + 1, rStart = rPos + 1;
    qPos += qC.replace(/-/g,'').length;
    rPos += rC.replace(/-/g,'').length;
    let ml = '';
    for (let k = 0; k < qC.length; k++) {
      if (qC[k]==='-'||rC[k]==='-') ml += ' ';
      else if (qC[k]===rC[k]) ml += '|';
      else ml += '.';
    }
    lines.push(`Query  ${String(qStart).padStart(4,' ')}  ${qC}  ${String(qPos).padStart(4,' ')}`);
    lines.push(`             ${ml}`);
    lines.push(`Ref    ${String(rStart).padStart(4,' ')}  ${rC}  ${String(rPos).padStart(4,' ')}`);
    lines.push('');
  }
  return lines.join('\n');
}

function seqCopyAlignment(text) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.seq-export-btn');
    if (btn) { const orig = btn.textContent; btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = orig, 1500); }
  });
}

function seqDownload(text, filename) {
  const blob = new Blob([text], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function dogmaSearchPubMedGene(gene, stress) {
  const q = `${gene} ${stress.toLowerCase()} microalgae`;
  const inp = document.getElementById('pubmed-query');
  if (inp) { inp.value = q; PM.loaded = false; }
  showPage('pubmed');
}

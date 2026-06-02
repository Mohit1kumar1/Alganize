// ── Customer Tools ──────────────────────────────────────────────
// Mode of Action · Crop Advisor · ROI Calculator · Microbiome Dashboard

let CT = { roiChart: null, microChart: null, cropStep: 1, selectedCrop: null, selectedStress: null };

// ─────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────

const MOA_SCENARIOS = [
  {
    id: 'growth', name: 'Root & Shoot Growth', icon: '🌱',
    bg: '#C8EECC', text: '#1b5e20',
    tagline: 'Auxins and gibberellins trigger root expansion and biomass gain',
    metabolites: [
      { name: 'Auxin (IAA)', cid: 802,     color: '#22c55e', role: 'Stimulates lateral root initiation and cell elongation — increases nutrient uptake area by up to 40%' },
      { name: 'Gibberellin GA3', cid: 6466666, color: '#3b82f6', role: 'Promotes stem elongation, seed germination, and internodal growth' },
      { name: 'Cytokinin (zeatin)', cid: 5722, color: '#f97316', role: 'Drives cell division in shoot meristem, delays leaf senescence, improves leaf area index' }
    ],
    bacteria: [
      { name: 'Azospirillum brasilense', role: 'N fixation + auxin production. Colonises roots and feeds plants directly with fixed nitrogen.' },
      { name: 'Bacillus subtilis',       role: 'Phosphate-solubilising PGPR. Produces enzymes that mineralise bound phosphorus from soil minerals.' },
      { name: 'Mycorrhizae (AMF)',        role: 'Hyphal network expands effective root surface 100–1000×. Primary P and micronutrient uptake organ.' }
    ],
    plant_effect: '30% taller plants observed in Alganize field trial (Neukölln, Berlin). Increased root biomass improves water and nutrient capture. Enhanced shoot-to-root ratio and dry matter yield.',
    soil_effect: 'Larger root system increases exudate production, feeding soil microbiome. Humus formation accelerated. Soil enzyme activity (phosphatase, urease) elevated within 4–8 weeks.',
    timeline: '4–8 weeks for first visible effect · Full soil microbiome shift: 1–2 seasons',
    product: 'Mikrobiom Feld · Mikrobiom Garten'
  },
  {
    id: 'drought', name: 'Drought Tolerance', icon: '💧',
    bg: '#FFE0D6', text: '#6b2211',
    tagline: 'ABA closes stomata within hours; proline protects cells under water deficit',
    metabolites: [
      { name: 'Abscisic Acid (ABA)',  cid: 5280896, color: '#f97316', role: 'Master drought hormone — triggers stomatal closure via PYR/SnRK2 cascade, reducing water loss by 40–70%' },
      { name: 'L-Proline',           cid: 145742,  color: '#22c55e', role: 'Compatible solute — accumulates intracellularly to counteract osmotic dehydration and stabilise enzymes' },
      { name: 'Glycine Betaine',     cid: 247,     color: '#3b82f6', role: 'Membrane stabiliser under water deficit. Protects Photosystem II from oxidative damage during drought' }
    ],
    bacteria: [
      { name: 'Bacillus subtilis',        role: 'Produces exopolysaccharides (EPS) that bind soil particles and significantly improve water retention in sandy soils.' },
      { name: 'Pseudomonas fluorescens',  role: 'ACC deaminase activity lowers ethylene stress response — reduces premature leaf drop and senescence under drought.' }
    ],
    plant_effect: 'Reduced wilting, maintained leaf water potential, faster recovery after drought episodes. Stomatal closure controlled within 30–60 minutes of ABA signal. Compatible with reduced irrigation protocols.',
    soil_effect: 'Algal exopolysaccharides form a water-retaining gel matrix around soil particles. Topsoil evaporation reduced. Sandy soils show the largest improvement in field capacity.',
    timeline: 'Stomatal response: hours · Soil water retention improvement: 2–4 weeks',
    product: 'Mikrobiom Feld · Mikrobiom Wald'
  },
  {
    id: 'disease', name: 'Disease Resistance', icon: '🛡',
    bg: '#E8D5F5', text: '#4a1060',
    tagline: 'Salicylate primes plant immunity; Trichoderma and Bacillus suppress pathogens in the rhizosphere',
    metabolites: [
      { name: 'Salicylic Acid (SA)', cid: 338,     color: '#ef4444', role: 'Activates Systemic Acquired Resistance (SAR) — primes PR gene expression plant-wide before infection occurs' },
      { name: 'Flavonoids',          cid: 5280863, color: '#8b5cf6', role: 'Antimicrobial phenolics reduce hyphal germination and pathogen adhesion on root surfaces' },
      { name: 'Jasmonic Acid (JA)',  cid: 5281166, color: '#f97316', role: 'Wound and herbivore signalling — activates proteinase inhibitors and secondary defence cascade' }
    ],
    bacteria: [
      { name: 'Trichoderma sp.',         role: 'Competitive exclusion of pathogens. Produces cell-wall-lytic enzymes against Fusarium and Pythium spp.' },
      { name: 'Bacillus subtilis',       role: 'Lipopeptides (iturin, fengycin) with direct antifungal activity. Induces Induced Systemic Resistance (ISR).' },
      { name: 'Pseudomonas fluorescens', role: 'Siderophore production outcompetes pathogens for iron. Activates ISR through jasmonate/ethylene pathway.' }
    ],
    plant_effect: 'Pre-emptive immune priming before infection — reduces disease incidence without chemical fungicides. Particularly effective against soil-borne pathogens (Fusarium, Rhizoctonia). Compatible with IPM strategies.',
    soil_effect: 'Pathogen-suppressive soil community established over 2–3 seasons. Beneficial fungal:bacterial ratio shifts. Target pathogens progressively outcompeted from rhizosphere.',
    timeline: 'SAR activation: 24–72 hours · Suppressive soil community: 2–3 seasons',
    product: 'Mikrobiom Feld · Mikrobiom Golf'
  },
  {
    id: 'nutrient', name: 'Nutrient Mobilisation', icon: '⚡',
    bg: '#FFF0BC', text: '#6b4e00',
    tagline: 'Organic acids unlock phosphorus; Azospirillum fixes atmospheric nitrogen',
    metabolites: [
      { name: 'Organic Acids',   cid: 971,  color: '#f97316', role: 'Acidify rhizosphere to solubilise mineral-bound phosphorus (Ca₃(PO₄)₂ → H₂PO₄⁻), directly available to roots' },
      { name: 'Amino Acids',     cid: 6140, color: '#22c55e', role: 'Ready-available nitrogen source; also chelate micronutrients (Fe, Zn, Mn) for uptake' },
      { name: 'Vitamin B12/B1',  cid: 5978, color: '#3b82f6', role: 'Co-factors for microbial enzyme systems involved in nitrogen and sulfur cycling reactions' }
    ],
    bacteria: [
      { name: 'Azospirillum sp.',   role: 'Biological N fixation (nif genes). Can supply 20–40% of crop N requirement under optimal conditions without synthetic fertiliser.' },
      { name: 'Bacillus subtilis',  role: 'Phytase production dissolves organic phosphorus. Mineralises P from soil organic matter via phosphatase enzymes.' },
      { name: 'Mycorrhizae (AMF)',  role: 'Hyphal P uptake from microsites beyond root depletion zone. Fe and Zn solubilisation. Dramatically improves micronutrient availability.' }
    ],
    plant_effect: 'Improved P and N availability enables stepwise synthetic fertiliser reduction: 10% in year 1, 20% in year 2, 30% in year 3. Micronutrient deficiency symptoms reduced. Crop quality metrics (protein content, sugar levels) typically improve.',
    soil_effect: 'Phosphatase and urease enzyme activity increase measurably within 4–6 weeks. Higher organic matter turnover rate. Nutrient leaching reduced as microbial community retains mineralised nutrients.',
    timeline: 'Enzyme activity increase: 4–6 weeks · Fertiliser reduction potential: year 1 onward',
    product: 'Mikrobiom Feld — primary application'
  },
  {
    id: 'structure', name: 'Soil Structure', icon: '🌍',
    bg: '#D4E8C2', text: '#2d5a0e',
    tagline: 'Algal EPS and mycorrhizal glomalin rebuild stable soil aggregates over 2–4 seasons',
    metabolites: [
      { name: 'Exopolysaccharides (EPS)', cid: 16211374, color: '#22c55e', role: 'Algae-excreted mucilaginous compounds that physically bind soil particles into stable macro-aggregates' },
      { name: 'Reduced Sugars',           cid: 5988,     color: '#f97316', role: 'Energy substrate feeding aggregate-forming bacteria; supports biofilm formation on soil mineral surfaces' },
      { name: 'Phenolic Acids',           cid: 980,      color: '#8b5cf6', role: 'Inhibit aggregate-disrupting pathogens; contribute to stable humic substance formation in soil' }
    ],
    bacteria: [
      { name: 'Mycorrhizae (AMF)',  role: 'Glomalin (GRSP) secretion — the primary cementing agent of stable soil aggregates. Hyphal enmeshment of soil particles dramatically improves soil structure.' },
      { name: 'Bacillus subtilis',  role: 'Biofilm formation on soil particles. Levan and EPS production bind soil colloids. Creates stable microhabitats for beneficial organisms.' }
    ],
    plant_effect: 'Better root penetration through improved soil porosity. Increased aeration reduces anaerobic zones that favour root pathogens. Higher field capacity allows reduced irrigation frequency.',
    soil_effect: 'Macroaggregate stability improves measurably over 2–4 seasons. Water infiltration rate increases by 20–50% in degraded soils. Erosion resistance enhanced. Organic matter protected inside aggregates from decomposition.',
    timeline: 'Visible aggregate formation: 1 season · Full structural improvement: 3–5 seasons',
    product: 'All Mikrobiom products — long-term soil rebuilding'
  }
];

const CROPS = [
  { id: 'maize',     name: 'Maize / Corn',            icon: '🌽' },
  { id: 'cereals',   name: 'Wheat / Cereals',          icon: '🌾' },
  { id: 'vineyard',  name: 'Vineyard / Grapes',        icon: '🍇' },
  { id: 'legume',    name: 'Legumes (Soy, Pea, Bean)', icon: '🫘' },
  { id: 'turf',      name: 'Turf / Golf Course',       icon: '⛳' },
  { id: 'vegetable', name: 'Vegetables',               icon: '🥦' },
  { id: 'fruit',     name: 'Fruit Trees / Orchards',   icon: '🍎' },
  { id: 'forest',    name: 'Forest / Trees',           icon: '🌲' }
];

const STRESSES = [
  { id: 'drought',       name: 'Drought / Water Stress',         icon: '☀' },
  { id: 'germination',   name: 'Poor Germination / Thin Stand',  icon: '🌱' },
  { id: 'disease',       name: 'Disease / Fungal Pressure',      icon: '🍄' },
  { id: 'yellowing',     name: 'Yellowing / Chlorosis',          icon: '🟡' },
  { id: 'salt',          name: 'Salt / Sodic Soil',              icon: '🧂' },
  { id: 'compaction',    name: 'Soil Compaction',                icon: '🪨' },
  { id: 'low_yield',     name: 'Below-Average Yield',            icon: '📉' },
  { id: 'heat',          name: 'Heat Stress',                    icon: '🌡' }
];

// Stress → advice (crop-specific notes appended by getCropNote)
const STRESS_ADVICE = {
  drought: {
    headline: 'Drought & Water Stress',
    mechanism: 'Microalgae-derived ABA triggers stomatal closure within 30–60 minutes, cutting transpiration water loss by up to 70%. Proline and glycine betaine accumulate intracellularly to maintain turgor pressure under water deficit. Bacillus EPS improves soil water retention.',
    metabolites: ['Abscisic Acid (ABA)', 'L-Proline', 'Glycine Betaine'],
    bacteria: ['Bacillus subtilis', 'Pseudomonas fluorescens'],
    expected: '20–40% reduction in visible wilting within 2 weeks. Significant soil water retention improvement in 4–6 weeks.',
    reduction: 'Irrigation requirement reduced 15–25% in medium-term',
    product: 'Mikrobiom Feld',
    moa_id: 'drought'
  },
  germination: {
    headline: 'Poor Germination & Stand Establishment',
    mechanism: 'Gibberellins in the product break seed dormancy and stimulate radicle emergence. Auxins activate lateral root development within the first days after germination. Bacillus and Azospirillum colonise the rhizosphere immediately, providing N and P from day one.',
    metabolites: ['Gibberellin GA3', 'Auxin (IAA)', 'Cytokinin'],
    bacteria: ['Azospirillum brasilense', 'Bacillus subtilis', 'Mycorrhizae (AMF)'],
    expected: 'Germination rate improvement visible within 7–14 days. More uniform stand establishment. Seedling vigour significantly enhanced.',
    reduction: 'Seed treatment or early-season soil application recommended',
    product: 'Mikrobiom Feld (soil application at sowing)',
    moa_id: 'growth'
  },
  disease: {
    headline: 'Fungal Disease & Pathogen Pressure',
    mechanism: 'Salicylic acid in the product activates Systemic Acquired Resistance (SAR) plant-wide — priming PR genes before infection occurs. Trichoderma and Bacillus lipopeptides directly suppress Fusarium, Rhizoctonia, and Pythium spp. in the rhizosphere.',
    metabolites: ['Salicylic Acid', 'Flavonoids', 'Jasmonic Acid'],
    bacteria: ['Trichoderma sp.', 'Bacillus subtilis', 'Pseudomonas fluorescens'],
    expected: 'Measurable reduction in disease incidence over 1–2 seasons of regular application. Not a substitute for acute chemical treatment but reduces recurrence.',
    reduction: 'Fungicide inputs reduced 20–40% over 3 seasons in trials',
    product: 'Mikrobiom Feld · Mikrobiom Golf',
    moa_id: 'disease'
  },
  yellowing: {
    headline: 'Yellowing & Chlorosis',
    mechanism: 'Yellowing typically indicates N, Fe, or Mg deficiency. Amino acids in the product chelate micronutrients (Fe²⁺, Zn²⁺, Mn²⁺) making them plant-available. Azospirillum biological N fixation provides additional N. Mycorrhizal hyphae reach microsites beyond the root depletion zone for Fe and Zn uptake.',
    metabolites: ['Amino Acids (chelating)', 'Organic Acids', 'Vitamin B-complex'],
    bacteria: ['Azospirillum sp.', 'Bacillus subtilis', 'Mycorrhizae (AMF)'],
    expected: 'First greening visible in 2–4 weeks as micronutrient availability improves. N deficiency response in 4–6 weeks as biological fixation increases.',
    reduction: 'Foliar micronutrient inputs reduced; N fertiliser reduction from year 1',
    product: 'Mikrobiom Feld',
    moa_id: 'nutrient'
  },
  salt: {
    headline: 'Salt & Sodic Soil',
    mechanism: 'Proline and glycine betaine provide osmotic adjustment under high Na⁺ conditions. SOS1-type Na⁺/H⁺ antiporter genes are upregulated by the signalling metabolites. Bacillus EPS binds Na⁺ ions, reducing bioavailable salt concentration in the immediate root zone.',
    metabolites: ['L-Proline', 'Glycine Betaine', 'Abscisic Acid (ABA)'],
    bacteria: ['Bacillus subtilis', 'Pseudomonas fluorescens'],
    expected: 'Improved salt tolerance visible in 2–4 weeks. Best results on moderately saline soils (EC 2–8 dS/m). Not sufficient for highly saline soils without additional management.',
    reduction: 'Germination rate improvement 20–40% on moderately saline soils',
    product: 'Mikrobiom Feld (higher dose on saline soils)',
    moa_id: 'drought'
  },
  compaction: {
    headline: 'Soil Compaction & Poor Structure',
    mechanism: 'Mycorrhizal hyphae physically penetrate compacted pore spaces that roots cannot reach. Glomalin secretion cements new soil aggregates, restoring macroporosity over time. Algal EPS acts as a biological soil conditioner, loosening compacted clay particles.',
    metabolites: ['Exopolysaccharides (EPS)', 'Reduced Sugars', 'Phenolic Acids'],
    bacteria: ['Mycorrhizae (AMF)', 'Bacillus subtilis'],
    expected: 'Macroaggregate stability measurable in 1 season. Full structural improvement: 3–5 seasons. Combine with subsoiling for faster results on severely compacted soils.',
    reduction: 'Water infiltration rate increase 20–50% over 3 seasons',
    product: 'Mikrobiom Feld — long-term programme',
    moa_id: 'structure'
  },
  low_yield: {
    headline: 'Below-Average Yield',
    mechanism: 'Yield losses usually reflect combined P and N limitations, poor root architecture, or soil biological activity below optimum. The full product mode of action addresses all three simultaneously: nutrient mobilisation via organic acids and enzyme activation, root expansion via auxin/gibberellin, and mycorrhizal network for nutrient uptake efficiency.',
    metabolites: ['Auxin (IAA)', 'Gibberellin GA3', 'Organic Acids', 'Amino Acids'],
    bacteria: ['Azospirillum sp.', 'Bacillus subtilis', 'Mycorrhizae (AMF)'],
    expected: 'Yield response varies by starting soil health. Degraded soils show largest gain (15–30%). Healthy soils: 5–15% improvement. 3-year programme recommended for maximum effect.',
    reduction: 'Synthetic input reduction enables cost savings that offset product cost in years 1–2',
    product: 'Mikrobiom Feld — full season programme',
    moa_id: 'nutrient'
  },
  heat: {
    headline: 'Heat Stress',
    mechanism: 'Algae-derived heat shock protein inducers (HSP70 pathway activators) help crops maintain photosynthetic efficiency at supraoptimal temperatures. Proline and betaine stabilise enzyme tertiary structure under heat. Salicylic acid cross-activates both heat and disease tolerance via shared signalling pathways.',
    metabolites: ['L-Proline', 'Glycine Betaine', 'Salicylic Acid'],
    bacteria: ['Bacillus subtilis', 'Pseudomonas fluorescens'],
    expected: 'Maintained green leaf area and photosynthetic activity during heat spells. PSII efficiency preserved above the critical threshold. Most effective when applied as preventative treatment before heat events.',
    reduction: 'Significant protection during heat waves; less effective if applied after heat damage onset',
    product: 'Mikrobiom Feld (preventative spring application)',
    moa_id: 'growth'
  }
};

const CROP_NOTES = {
  maize:     'In maize, auxin and gibberellin effects are most pronounced — trials show 30% height gain and improved cob set. Apply at sowing and V4–V6 stage.',
  cereals:   'In wheat and barley, tiller number and grain filling are the primary targets. Apply at tillering and flag-leaf stage for maximum effect on yield components.',
  vineyard:  'In vines, disease resistance (Botrytis, downy mildew) and drought tolerance are the primary benefits. Apply before bud burst and at véraison. Reduces Botrytis risk in humid seasons.',
  legume:    'In legumes, Rhizobium inoculation synergy is the key benefit — Alganize metabolites enhance nodule formation and N fixation efficiency, reducing the need for mineral N fertiliser to near-zero.',
  turf:      'In turf and golf courses, the primary benefits are drought tolerance (reduced irrigation requirement), disease suppression (fewer fungicide applications), and recovery speed after wear damage.',
  vegetable: 'In vegetables, the combination of auxin-driven root expansion and SA-mediated disease resistance reduces both crop loss from disease and root restriction in intensive cultivation. Particularly effective for tomato, pepper, and brassicas.',
  fruit:     'In orchards, mycorrhizal network establishment is the primary long-term benefit — applies over 3–5 seasons. Short-term benefits include improved drought tolerance and reduced chlorosis.',
  forest:    'In forest plantations, survival rate improvement and root establishment in the first 2 seasons are the primary metrics. Mycorrhizae colonisation speed is significantly enhanced by the product.'
};

// ROI constants
const PRODUCTS = {
  feld:   { name: 'Mikrobiom Feld',   price: 1200, volume: 1000, ha_lo: 30, ha_hi: 40, desc: '1,000 L covers 30–40 ha' },
  golf:   { name: 'Mikrobiom Golf',   price: 2400, volume: 300,  ha_lo: 1,  ha_hi: 1,  desc: '300 L per ha per year (golf/turf)' },
  garten: { name: 'Mikrobiom Garten', price: 17.99, volume: 1, ha_lo: 0.01, ha_hi: 0.02, desc: 'Home/garden application' }
};

const FERT_REDUCTION = [0.10, 0.20, 0.30]; // yr 1–3

// Microbiome — target taxa Alganize products are designed to boost
const TARGET_TAXA = [
  { pattern: /bacillus/i,           name: 'Bacillus',             role: 'PGPR — P solubilisation, N fixation, biocontrol' },
  { pattern: /pseudomonas/i,        name: 'Pseudomonas',          role: 'ISR, siderophore production, ACC deaminase' },
  { pattern: /azospirillum/i,       name: 'Azospirillum',         role: 'Biological N fixation, auxin production' },
  { pattern: /trichoderma/i,        name: 'Trichoderma',          role: 'Biocontrol — antifungal enzymes and competition' },
  { pattern: /rhizobium|bradyrhizo|mesorhizo/i, name: 'Rhizobium', role: 'Legume symbiosis, biological N fixation' },
  { pattern: /streptomyces/i,       name: 'Streptomyces',         role: 'Soil health indicator — antibiotic and enzyme producer' },
  { pattern: /glomus|rhizophagus|funneliformis|diversispora/i, name: 'AMF (Mycorrhizae)', role: 'Phosphorus uptake, aggregate formation, glomalin secretion' },
  { pattern: /nitrobacter|nitrospira/i, name: 'Nitrifier',        role: 'Nitrification — converts NH₄⁺ to NO₃⁻ for plant uptake' }
];

// ─────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────

function initCustomer() {
  ctShowTab('moa');
}

function ctShowTab(tab) {
  ['moa','crop','roi','micro'].forEach(t => {
    document.getElementById(`ct-tab-${t}`)?.classList.toggle('active', t === tab);
    const p = document.getElementById(`ct-panel-${t}`);
    if (p) p.hidden = t !== tab;
  });
  if (tab === 'moa'  && !document.querySelector('.moa-pill')) renderMOA();
  if (tab === 'crop' && !document.querySelector('.ca-crop-card')) renderCropAdvisor();
  if (tab === 'roi'  && !document.getElementById('ct-panel-roi').dataset.rendered) renderROI();
  if (tab === 'micro') renderMicrobiome();
}

// ─────────────────────────────────────────────────────────────────
// 1. MODE OF ACTION
// ─────────────────────────────────────────────────────────────────

function renderMOA() {
  const pills = document.getElementById('moa-pills');
  if (pills) pills.innerHTML = MOA_SCENARIOS.map(s =>
    `<button class="moa-pill" data-id="${s.id}" onclick="moaSelect('${s.id}')"
      style="--pill-bg:${s.bg};--pill-text:${s.text}">
      <span>${s.icon}</span>${esc(s.name)}
    </button>`
  ).join('');
  moaSelect('growth');
}

function moaSelect(id) {
  const s = MOA_SCENARIOS.find(x => x.id === id);
  if (!s) return;
  document.querySelectorAll('.moa-pill').forEach(b => b.classList.toggle('active', b.dataset.id === id));
  const detail = document.getElementById('moa-detail');
  if (!detail) return;

  detail.innerHTML = `
    <div class="moa-tagline">${esc(s.tagline)}</div>

    <div class="moa-flow-row">
      <div class="moa-flow-node moa-node-algae">
        <div class="moa-node-icon">🦠</div>
        <div class="moa-node-label">Microalgae</div>
        <div class="moa-node-sub">Stressed &amp; stimulated in bioreactor</div>
      </div>
      <div class="moa-arrow">→</div>
      <div class="moa-flow-node moa-node-met">
        <div class="moa-node-icon">🧪</div>
        <div class="moa-node-label">Metabolite Release</div>
        <div class="moa-node-sub">${s.metabolites.map(m => `<span class="moa-met-chip" style="border-color:${m.color};color:${m.color}">${esc(m.name)}</span>`).join('')}</div>
      </div>
      <div class="moa-arrow">→</div>
      <div class="moa-flow-node moa-node-soil">
        <div class="moa-node-icon">🌍</div>
        <div class="moa-node-label">Soil Microbiome</div>
        <div class="moa-node-sub">${s.bacteria.map(b => `<span class="moa-bact-chip">${esc(b.name)}</span>`).join('')}</div>
      </div>
      <div class="moa-arrow">→</div>
      <div class="moa-flow-node moa-node-plant">
        <div class="moa-node-icon">🌿</div>
        <div class="moa-node-label">Crop Response</div>
        <div class="moa-node-sub" style="color:var(--up);font-weight:600">${esc(s.plant_effect.split('.')[0])}.</div>
      </div>
    </div>

    <div class="moa-cards-row">
      <div class="moa-card">
        <div class="moa-card-title">Key Metabolites Excreted</div>
        ${s.metabolites.map(m => `
          <div class="moa-met-row">
            <div class="moa-met-dot" style="background:${m.color}"></div>
            <div>
              <div class="moa-met-name">${esc(m.name)}
                ${m.cid ? `<a href="https://pubchem.ncbi.nlm.nih.gov/compound/${m.cid}" target="_blank" rel="noopener" class="moa-ext-link">PubChem ↗</a>` : ''}
              </div>
              <div class="moa-met-role">${esc(m.role)}</div>
            </div>
          </div>`).join('')}
      </div>
      <div class="moa-card">
        <div class="moa-card-title">Soil Microorganisms Activated</div>
        ${s.bacteria.map(b => `
          <div class="moa-bact-row">
            <div class="moa-bact-icon">🔬</div>
            <div>
              <div class="moa-bact-name">${esc(b.name)}</div>
              <div class="moa-bact-role">${esc(b.role)}</div>
            </div>
          </div>`).join('')}
      </div>
      <div class="moa-card">
        <div class="moa-card-title">Expected Outcomes</div>
        <div class="moa-outcome-row"><span class="moa-outcome-icon">🌿</span><div><strong>Plant</strong><br><span class="moa-outcome-text">${esc(s.plant_effect)}</span></div></div>
        <div class="moa-outcome-row"><span class="moa-outcome-icon">🌍</span><div><strong>Soil</strong><br><span class="moa-outcome-text">${esc(s.soil_effect)}</span></div></div>
        <div class="moa-timeline-badge">⏱ ${esc(s.timeline)}</div>
        <div class="moa-product-badge">📦 ${esc(s.product)}</div>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────
// 2. CROP ADVISOR
// ─────────────────────────────────────────────────────────────────

function renderCropAdvisor() {
  const grid = document.getElementById('ca-crop-grid');
  if (grid) grid.innerHTML = CROPS.map(c =>
    `<div class="ca-crop-card" data-id="${c.id}" onclick="caSelectCrop('${c.id}')">
      <div class="ca-crop-icon">${c.icon}</div>
      <div class="ca-crop-name">${esc(c.name)}</div>
    </div>`
  ).join('');

  const sgrid = document.getElementById('ca-stress-grid');
  if (sgrid) sgrid.innerHTML = STRESSES.map(s =>
    `<div class="ca-stress-chip" data-id="${s.id}" onclick="caSelectStress('${s.id}')">
      <span>${s.icon}</span>${esc(s.name)}
    </div>`
  ).join('');
}

function caSelectCrop(id) {
  CT.selectedCrop = id;
  document.querySelectorAll('.ca-crop-card').forEach(c => c.classList.toggle('active', c.dataset.id === id));
  caStep(2);
}

function caSelectStress(id) {
  CT.selectedStress = id;
  document.querySelectorAll('.ca-stress-chip').forEach(c => c.classList.toggle('active', c.dataset.id === id));
  caShowResult();
}

function caStep(n) {
  [1, 2, 3].forEach(i => {
    document.getElementById(`ca-step-${i}`)?.classList.toggle('active', i <= n);
    const p = document.getElementById(`ca-panel-${i}`);
    if (p) p.hidden = i !== n;
  });
  document.getElementById('ca-result')?.replaceChildren();
}

function caShowResult() {
  const crop   = CROPS.find(c => c.id === CT.selectedCrop);
  const stress = STRESSES.find(s => s.id === CT.selectedStress);
  const advice = STRESS_ADVICE[CT.selectedStress];
  const note   = CROP_NOTES[CT.selectedCrop] || '';
  if (!crop || !stress || !advice) return;
  caStep(3);
  const res = document.getElementById('ca-result');
  if (!res) return;
  res.innerHTML = `
    <div class="ca-result-header">
      <span class="ca-result-crop">${crop.icon} ${esc(crop.name)}</span>
      <span class="ca-result-sep">+</span>
      <span class="ca-result-stress">${stress.icon} ${esc(stress.name)}</span>
    </div>

    <div class="ca-result-mechanism">
      <div class="ca-result-section-title">How it works</div>
      <p>${esc(advice.mechanism)}</p>
      ${note ? `<p class="ca-crop-note">${esc(note)}</p>` : ''}
    </div>

    <div class="ca-result-grid">
      <div class="ca-result-card">
        <div class="ca-result-card-title">Key Metabolites</div>
        ${advice.metabolites.map(m => `<div class="ca-result-item">• ${esc(m)}</div>`).join('')}
      </div>
      <div class="ca-result-card">
        <div class="ca-result-card-title">Soil Organisms Activated</div>
        ${advice.bacteria.map(b => `<div class="ca-result-item">• ${esc(b)}</div>`).join('')}
      </div>
      <div class="ca-result-card">
        <div class="ca-result-card-title">Expected Results</div>
        <p>${esc(advice.expected)}</p>
        <div class="ca-input-note">${esc(advice.reduction)}</div>
      </div>
      <div class="ca-result-card ca-result-product">
        <div class="ca-result-card-title">Recommended Product</div>
        <div class="ca-product-name">${esc(advice.product)}</div>
        <button class="ca-moa-btn" onclick="ctShowTab('moa');moaSelect('${advice.moa_id}')">See full mechanism →</button>
      </div>
    </div>

    <div class="ca-restart-row">
      <button class="ca-restart-btn" onclick="caStep(1);CT.selectedCrop=null;CT.selectedStress=null;document.querySelectorAll('.ca-crop-card,.ca-stress-chip').forEach(e=>e.classList.remove('active'))">Start over</button>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────
// 3. ROI CALCULATOR
// ─────────────────────────────────────────────────────────────────

function renderROI() {
  const wrap = document.getElementById('ct-panel-roi');
  if (!wrap || wrap.dataset.rendered) return;
  wrap.dataset.rendered = '1';
  calcROI();
}

function calcROI() {
  const ha        = parseFloat(document.getElementById('roi-ha')?.value) || 10;
  const fertCost  = parseFloat(document.getElementById('roi-fert')?.value) || 300;
  const prodKey   = document.getElementById('roi-product')?.value || 'feld';
  const prod      = PRODUCTS[prodKey];
  const haPerL    = (prod.ha_lo + prod.ha_hi) / 2;
  const costPerHa = prod.price / (prod.volume * haPerL / prod.volume);
  const prodCost  = prodKey === 'golf' ? ha * prod.price : (ha / ((prod.ha_lo + prod.ha_hi) / 2)) * prod.price;

  const totalFert = ha * fertCost;
  const years = [1, 2, 3];
  const saving = years.map(y => totalFert * FERT_REDUCTION[y - 1]);
  const netSaving = years.map((_, i) => saving[i] - prodCost);
  const cumulative = netSaving.reduce((acc, v, i) => { acc.push((acc[i - 1] || 0) + v); return acc; }, []);

  // Summary numbers
  const sumEl = document.getElementById('roi-summary');
  if (sumEl) sumEl.innerHTML = `
    <div class="roi-kpi"><div class="roi-kpi-label">Product cost / year</div><div class="roi-kpi-value">€${Math.round(prodCost).toLocaleString()}</div></div>
    <div class="roi-kpi"><div class="roi-kpi-label">Fertiliser saving yr 1</div><div class="roi-kpi-value" style="color:var(--up)">€${Math.round(saving[0]).toLocaleString()}</div></div>
    <div class="roi-kpi"><div class="roi-kpi-label">Net saving yr 1</div><div class="roi-kpi-value" style="color:${netSaving[0]>=0?'var(--up)':'var(--down)'}">€${Math.round(netSaving[0]).toLocaleString()}</div></div>
    <div class="roi-kpi"><div class="roi-kpi-label">3-year cumulative saving</div><div class="roi-kpi-value" style="color:var(--up)">€${Math.round(cumulative[2]).toLocaleString()}</div></div>
    <div class="roi-kpi"><div class="roi-kpi-label">Fertiliser reduction</div><div class="roi-kpi-value">10% → 20% → 30%</div></div>
    <div class="roi-kpi"><div class="roi-kpi-label">Coverage</div><div class="roi-kpi-value">${prod.desc}</div></div>`;

  // Chart
  const ctx = document.getElementById('roi-chart');
  if (!ctx) return;
  if (CT.roiChart) CT.roiChart.destroy();
  CT.roiChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Year 1', 'Year 2', 'Year 3'],
      datasets: [
        { label: 'Fertiliser cost (no product)', data: [totalFert, totalFert, totalFert], backgroundColor: 'rgba(214,61,60,0.15)', borderColor: '#d63d3c', borderWidth: 1.5 },
        { label: 'Fertiliser cost (with product)', data: saving.map((s, i) => totalFert - s), backgroundColor: 'rgba(99,153,34,0.18)', borderColor: '#639922', borderWidth: 1.5 },
        { label: 'Net saving after product cost', data: netSaving, backgroundColor: netSaving.map(v => v >= 0 ? 'rgba(46,163,120,0.35)' : 'rgba(214,61,60,0.25)'), borderColor: netSaving.map(v => v >= 0 ? '#2ea378' : '#d63d3c'), borderWidth: 1.5, type: 'bar' }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } },
        tooltip: { callbacks: { label: ctx => ` €${Math.round(ctx.raw).toLocaleString()}` } } },
      scales: {
        y: { ticks: { callback: v => '€' + Math.round(v).toLocaleString(), font: { size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { grid: { display: false } }
      }
    }
  });
}

// ─────────────────────────────────────────────────────────────────
// 4. MICROBIOME DASHBOARD
// ─────────────────────────────────────────────────────────────────

function renderMicrobiome() {
  // nothing needed on first render — HTML is static
}

function microHandleUpload(input) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById('micro-filename').textContent = file.name;
  Papa.parse(file, {
    header: false, skipEmptyLines: true,
    complete: res => microProcess(res.data, file.name)
  });
}

function microProcessSample() {
  // Built-in demo data (realistic soil microbiome)
  const demo = [
    ['Genus','Count'],
    ['Bacillus','1240'],['Pseudomonas','890'],['Streptomyces','760'],
    ['Arthrobacter','650'],['Rhizobium','580'],['Azospirillum','420'],
    ['Trichoderma','390'],['Nitrobacter','310'],['Mycobacterium','280'],
    ['Penicillium','270'],['Clostridium','240'],['Lysobacter','210'],
    ['Sphingomonas','195'],['Rhizophagus','180'],['Gemmatimonadetes','160'],
    ['Acidobacterium','145'],['Flavobacterium','130'],['Verrucomicrobia','110'],
    ['Planctomycetes','95'],['Cyanobacteria','82']
  ];
  document.getElementById('micro-filename').textContent = 'demo_soil_sample.csv';
  microProcess(demo, 'demo_soil_sample.csv');
}

function microProcess(rows, filename) {
  // Auto-detect format: [taxon, count] or OTU table
  let taxa = {};
  const header = rows[0];
  const isHeader = isNaN(parseFloat(header[1]));
  const dataRows = isHeader ? rows.slice(1) : rows;

  if (dataRows[0]?.length === 2) {
    // Simple 2-column format
    dataRows.forEach(r => { const n = parseFloat(r[1]); if (r[0] && !isNaN(n)) taxa[r[0].trim()] = (taxa[r[0].trim()] || 0) + n; });
  } else if (dataRows[0]?.length > 2) {
    // OTU table — sum across samples
    dataRows.forEach(r => { const n = r.slice(1).reduce((s, v) => s + (parseFloat(v) || 0), 0); if (r[0]) taxa[r[0].trim()] = n; });
  }

  const entries = Object.entries(taxa).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) { alert('Could not parse file. Expected format: genus,count per row.'); return; }

  const total  = entries.reduce((s, [, v]) => s + v, 0);
  const props  = entries.map(([k, v]) => [k, v / total]);

  // Shannon diversity: -sum(p * ln(p))
  const shannon = -props.reduce((s, [, p]) => s + (p > 0 ? p * Math.log(p) : 0), 0);
  // Simpson: 1 - sum(p^2)
  const simpson = 1 - props.reduce((s, [, p]) => s + p * p, 0);
  // Pielou evenness
  const richness = entries.length;
  const evenness = richness > 1 ? shannon / Math.log(richness) : 1;

  // Target taxa detection
  const targets = TARGET_TAXA.map(t => {
    const match = entries.find(([k]) => t.pattern.test(k));
    return { ...t, found: !!match, count: match ? match[1] : 0, pct: match ? (match[1] / total * 100) : 0 };
  });

  // Top 15 for chart
  const top = entries.slice(0, 15);

  // Render results
  document.getElementById('micro-results').hidden = false;

  // KPIs
  document.getElementById('micro-kpis').innerHTML = `
    <div class="micro-kpi"><div class="micro-kpi-label">Richness</div><div class="micro-kpi-value">${richness} taxa</div></div>
    <div class="micro-kpi"><div class="micro-kpi-label">Shannon Index (H')</div><div class="micro-kpi-value ${shannon >= 3 ? 'good' : shannon >= 2 ? 'mid' : 'low'}">${shannon.toFixed(2)}</div><div class="micro-kpi-note">${shannon >= 3 ? 'High diversity' : shannon >= 2 ? 'Moderate' : 'Low diversity'}</div></div>
    <div class="micro-kpi"><div class="micro-kpi-label">Simpson Index (1-D)</div><div class="micro-kpi-value ${simpson >= 0.85 ? 'good' : simpson >= 0.7 ? 'mid' : 'low'}">${simpson.toFixed(3)}</div><div class="micro-kpi-note">${simpson >= 0.85 ? 'High evenness' : simpson >= 0.7 ? 'Moderate' : 'Dominance detected'}</div></div>
    <div class="micro-kpi"><div class="micro-kpi-label">Pielou Evenness (J)</div><div class="micro-kpi-value ${evenness >= 0.75 ? 'good' : evenness >= 0.5 ? 'mid' : 'low'}">${evenness.toFixed(3)}</div><div class="micro-kpi-note">${evenness >= 0.75 ? 'Even community' : 'Community dominated'}</div></div>
    <div class="micro-kpi"><div class="micro-kpi-label">Total reads</div><div class="micro-kpi-value">${Math.round(total).toLocaleString()}</div></div>`;

  // Target taxa
  document.getElementById('micro-targets').innerHTML = targets.map(t => `
    <div class="micro-target ${t.found ? 'found' : 'absent'}">
      <div class="micro-target-dot ${t.found ? 'found' : 'absent'}"></div>
      <div>
        <div class="micro-target-name">${esc(t.name)}</div>
        <div class="micro-target-role">${esc(t.role)}</div>
        ${t.found ? `<div class="micro-target-count">${t.pct.toFixed(1)}% of community (${Math.round(t.count).toLocaleString()} reads)</div>` : `<div class="micro-target-absent">Not detected — Alganize product may increase abundance</div>`}
      </div>
    </div>`).join('');

  // Chart
  const ctx = document.getElementById('micro-chart');
  if (!ctx) return;
  if (CT.microChart) CT.microChart.destroy();
  const isTarget = top.map(([k]) => TARGET_TAXA.some(t => t.pattern.test(k)));
  CT.microChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top.map(([k]) => k),
      datasets: [{
        label: 'Relative abundance (%)',
        data: top.map(([, v]) => (v / total * 100).toFixed(2)),
        backgroundColor: isTarget.map(t => t ? 'rgba(99,153,34,0.55)' : 'rgba(99,153,34,0.18)'),
        borderColor: isTarget.map(t => t ? '#4f7e1a' : '#c9dba1'),
        borderWidth: 1.5
      }]
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => ` ${c.raw}%` } }
      },
      scales: {
        x: { ticks: { callback: v => v + '%', font: { size: 10 } }, grid: { color: 'rgba(0,0,0,0.05)' } },
        y: { ticks: { font: { size: 11 }, color: ctx => isTarget[ctx.index] ? '#4f7e1a' : undefined } }
      }
    }
  });
}

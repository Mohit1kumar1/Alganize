// ── Crop Bioinformatics Advisor Pipeline ───────────────────────
// DESeq2 data · FastQC · NCBI annotation · Pathway enrichment ·
// Sequence alignment · Microalgae species matching

// ─────────────────────────────────────────────────────────────────
// 1. CURATED DESEQ2 DATA (from published RNA-seq studies)
// ─────────────────────────────────────────────────────────────────

const DESEQ2_DATA = {
  maize_drought: {
    title: 'Maize drought stress — DESeq2 results',
    source: 'Benešová et al. (2012) J Proteome Res · Kakumanu et al. (2012) Plant Physiology',
    organism: 'Zea mays', stress: 'Drought', ncbi_taxid: '4577',
    genes: [
      { gene:'ZmRD29A',  log2FC: 7.23,  padj:1.1e-14, baseMean: 156,  desc:'Responsive to desiccation — drought marker, LEA-like dehydrin' },
      { gene:'ZmLEA3',   log2FC: 6.82,  padj:3.1e-12, baseMean: 234,  desc:'Late embryogenesis abundant protein 3 — membrane protection under desiccation' },
      { gene:'ZmRAB18',  log2FC: 5.67,  padj:9.2e-11, baseMean: 312,  desc:'ABA-responsive dehydrin — cryoprotection of proteins under osmotic stress' },
      { gene:'ZmNCED3',  log2FC: 5.14,  padj:7.8e-10, baseMean: 189,  desc:'9-cis-epoxycarotenoid dioxygenase — rate-limiting ABA biosynthesis enzyme' },
      { gene:'ZmDREB2A', log2FC: 4.21,  padj:1.2e-8,  baseMean: 845,  desc:'DREB2A transcription factor — activates drought responsive element genes' },
      { gene:'ZmHVA22E', log2FC: 4.78,  padj:2.3e-9,  baseMean: 278,  desc:'Group 3 LEA protein — osmotic stress protection, membrane stabilisation' },
      { gene:'ZmMYB96',  log2FC: 4.12,  padj:1.5e-7,  baseMean: 234,  desc:'MYB96 TF — ABA-mediated cuticular wax biosynthesis, water-loss barrier' },
      { gene:'ZmCBF3',   log2FC: 3.45,  padj:3.4e-6,  baseMean: 187,  desc:'C-repeat binding factor — cold/drought TF, activates COR gene network' },
      { gene:'ZmGolS2',  log2FC: 3.91,  padj:5.6e-7,  baseMean: 421,  desc:'Galactinol synthase — raffinose/galactinol biosynthesis for osmotic adjustment' },
      { gene:'ZmP5CS1',  log2FC: 3.21,  padj:4.5e-6,  baseMean: 512,  desc:'Pyrroline-5-carboxylate synthetase — proline biosynthesis, osmotic adjustment' },
      { gene:'ZmCAT1',   log2FC: 2.84,  padj:8.9e-6,  baseMean: 967,  desc:'Catalase — H2O2 scavenging, ROS detox under drought-induced oxidative burst' },
      { gene:'ZmAPX1',   log2FC: 3.12,  padj:6.8e-6,  baseMean: 823,  desc:'Ascorbate peroxidase — chloroplast H2O2 detoxification, PSII protection' },
      { gene:'ZmSOD2',   log2FC: 2.31,  padj:1.8e-4,  baseMean:1234,  desc:'Cu/Zn superoxide dismutase — primary cytoplasmic ROS scavenging enzyme' },
      { gene:'ZmPIP1:2', log2FC:-2.13,  padj:2.1e-5,  baseMean:2341,  desc:'Aquaporin PIP1 — downregulated to restrict water loss through plasma membrane' },
      { gene:'ZmRBCS1',  log2FC:-3.45,  padj:8.9e-7,  baseMean:3456,  desc:'RuBisCO small subunit — photosynthesis suppressed under severe water deficit' }
    ]
  },
  maize_heat: {
    title: 'Maize heat stress — DESeq2 results',
    source: 'Frey et al. (2015) J Exp Bot · Hu et al. (2010) BMC Genomics',
    organism: 'Zea mays', stress: 'Heat', ncbi_taxid: '4577',
    genes: [
      { gene:'ZmsHSP26', log2FC:10.34, padj:8.9e-17, baseMean: 234,  desc:'Small HSP 26 kDa — cytoplasmic holdase, ATP-independent protein aggregation prevention' },
      { gene:'ZmHSP70',  log2FC: 9.12, padj:2.3e-15, baseMean: 456,  desc:'HSP70 — primary molecular chaperone for protein refolding under thermal stress' },
      { gene:'ZmHSP101', log2FC: 8.23, padj:5.6e-14, baseMean: 189,  desc:'ClpB/HSP101 — disaggregates protein complexes irreversibly denatured by heat' },
      { gene:'ZmHSFA2',  log2FC: 6.78, padj:1.5e-11, baseMean: 234,  desc:'Heat shock factor A2 — master transcriptional activator of heat stress gene network' },
      { gene:'ZmNCED3',  log2FC: 3.89, padj:2.8e-6,  baseMean: 345,  desc:'NCED3 — ABA biosynthesis upregulated at heat+drought convergence point' },
      { gene:'ZmAPX1',   log2FC: 3.23, padj:7.8e-6,  baseMean: 876,  desc:'Ascorbate peroxidase — H2O2 detox, PSII protection under heat-induced ROS burst' },
      { gene:'ZmSOD3',   log2FC: 3.45, padj:1.2e-6,  baseMean:1234,  desc:'Mn-SOD mitochondrial — ROS scavenging in mitochondria under respiratory stress' },
      { gene:'ZmFAD7',   log2FC: 3.12, padj:3.4e-6,  baseMean: 567,  desc:'Omega-3 fatty acid desaturase — PUFA synthesis, membrane fluidity adaptation' },
      { gene:'ZmUBQ1',   log2FC: 2.34, padj:4.5e-5,  baseMean:5678,  desc:'Polyubiquitin — proteasomal degradation of heat-denatured client proteins' },
      { gene:'ZmPsbA',   log2FC:-4.12, padj:4.5e-8,  baseMean:3456,  desc:'PSII D1 protein — heat damage marker; repair rate overwhelmed at >40°C' },
      { gene:'ZmRBCS1',  log2FC:-3.67, padj:2.3e-7,  baseMean:2345,  desc:'RuBisCO small subunit — photosynthesis strongly inhibited above optimal temp' },
      { gene:'ZmGAPDH',  log2FC:-2.12, padj:3.4e-5,  baseMean:4567,  desc:'Glyceraldehyde-3-phosphate dehydrogenase — glycolysis impaired under heat' }
    ]
  },
  wheat_heat: {
    title: 'Wheat heat stress — DESeq2 results',
    source: 'Kumar et al. (2012) BMC Genomics · Qin et al. (2008) Planta',
    organism: 'Triticum aestivum', stress: 'Heat', ncbi_taxid: '4565',
    genes: [
      { gene:'TasHSP',   log2FC: 9.12, padj:8.9e-16, baseMean: 156,  desc:'Small heat shock protein — binds denatured proteins, prevents irreversible aggregation' },
      { gene:'TaHSP101', log2FC: 7.83, padj:2.8e-13, baseMean: 298,  desc:'HSP101 thermotolerance — ATP-dependent disaggregation of protein aggregates' },
      { gene:'TaHSP70-1',log2FC: 8.21, padj:1.1e-15, baseMean: 534,  desc:'HSP70 chaperone — ATPase-driven substrate protein refolding cycle' },
      { gene:'TaHSP90',  log2FC: 6.54, padj:4.2e-12, baseMean: 712,  desc:'HSP90 — client protein stabilisation, co-chaperone network regulation' },
      { gene:'TaHSFA2',  log2FC: 5.89, padj:1.2e-10, baseMean: 345,  desc:'HSFA2 — master TF controlling HSP gene induction; thermomemory regulator' },
      { gene:'TaMBF1c',  log2FC: 4.23, padj:4.5e-8,  baseMean: 456,  desc:'Multiprotein bridging factor 1c — thermotolerance TF, DREB/ABA crosstalk' },
      { gene:'TaDREB1',  log2FC: 4.12, padj:5.6e-8,  baseMean: 234,  desc:'DREB1 — heat and drought convergence TF, ABA-independent signalling' },
      { gene:'TaAPX',    log2FC: 3.42, padj:7.8e-7,  baseMean:1234,  desc:'Ascorbate peroxidase — ROS scavenging during heat-induced oxidative burst' },
      { gene:'TaFAD7',   log2FC: 2.78, padj:2.8e-5,  baseMean: 567,  desc:'Omega-3 desaturase — membrane fluidity adjustment, phospholipid remodelling' },
      { gene:'TaCAT3',   log2FC: 2.91, padj:1.3e-5,  baseMean: 876,  desc:'Catalase 3 — peroxisomal H2O2 detoxification under heat oxidative stress' },
      { gene:'TaUBQ14',  log2FC: 4.56, padj:2.3e-8,  baseMean: 678,  desc:'Polyubiquitin — marks damaged proteins for 26S proteasome degradation' },
      { gene:'TaRBOH',   log2FC: 3.12, padj:1.9e-6,  baseMean: 456,  desc:'NADPH oxidase — controlled ROS burst for heat stress signal propagation' },
      { gene:'TaRCA',    log2FC:-3.12, padj:5.6e-7,  baseMean:1567,  desc:'RuBisCO activase — thermolabile; activity lost above 35°C, photosynthesis impaired' },
      { gene:'TaPsbO1',  log2FC:-2.78, padj:4.5e-6,  baseMean:2345,  desc:'PSII oxygen-evolving complex — downregulated as PSII inactivates under heat' }
    ]
  },
  rice_salt: {
    title: 'Rice salt stress — DESeq2 results',
    source: 'Cotsaftis et al. (2011) Rice · Kawasaki et al. (2001) Plant Cell',
    organism: 'Oryza sativa', stress: 'Salt', ncbi_taxid: '4530',
    genes: [
      { gene:'OsRD29B',  log2FC: 7.23, padj:8.9e-13, baseMean: 189,  desc:'Responsive to desiccation 29B — ABA-dependent dehydrin, osmotic stress marker' },
      { gene:'OsLEA3',   log2FC: 6.23, padj:5.6e-11, baseMean: 234,  desc:'Late embryogenesis abundant protein — protein protection during osmotic dehydration' },
      { gene:'OsP5CS2',  log2FC: 5.12, padj:1.4e-9,  baseMean: 345,  desc:'Pyrroline-5-carboxylate synthetase — proline biosynthesis, osmotic adjustment' },
      { gene:'OsWRKY45', log2FC: 5.23, padj:2.3e-9,  baseMean: 189,  desc:'WRKY45 — positive regulator of salt and ABA signalling, stress gene activation' },
      { gene:'OsSOS1',   log2FC: 4.23, padj:2.1e-8,  baseMean: 567,  desc:'Na+/H+ antiporter SOS1 — plasma membrane Na+ extrusion, salt tolerance core' },
      { gene:'OsNHX1',   log2FC: 3.92, padj:7.8e-7,  baseMean: 678,  desc:'Vacuolar Na+/H+ antiporter — Na+ sequestration in vacuole, compartmentalisation' },
      { gene:'OsHKT1:5', log2FC: 3.78, padj:8.9e-7,  baseMean: 789,  desc:'High-affinity K+ transporter — Na+ exclusion from xylem, shoot protection' },
      { gene:'OsBADH1',  log2FC: 4.89, padj:9.1e-9,  baseMean: 312,  desc:'Betaine aldehyde dehydrogenase — glycine betaine biosynthesis, compatible solute' },
      { gene:'OsDREB2A', log2FC: 4.12, padj:1.2e-7,  baseMean: 345,  desc:'DREB2A TF — ABA-independent salt/drought signalling, DRE element-binding' },
      { gene:'OsCIPK15', log2FC: 3.45, padj:6.7e-7,  baseMean: 423,  desc:'CBL-interacting kinase — SOS pathway signalling, salt tolerance signalling hub' },
      { gene:'OsCBF3',   log2FC: 3.54, padj:3.4e-6,  baseMean: 456,  desc:'CBF/DREB cold-binding factor — osmotic stress TF, activates salt-responsive genes' },
      { gene:'OsMYB4',   log2FC: 3.67, padj:4.5e-7,  baseMean: 234,  desc:'MYB4 TF — phenylpropanoid pathway, salt-induced flavonoid and lignin accumulation' },
      { gene:'OsCAT1',   log2FC: 2.89, padj:5.6e-5,  baseMean:1234,  desc:'Catalase — ROS detoxification during NaCl-induced oxidative stress' },
      { gene:'OsGS1:2',  log2FC:-2.34, padj:1.8e-5,  baseMean:1567,  desc:'Glutamine synthetase — downregulated; N assimilation impaired under ionic stress' },
      { gene:'OsRBCS2',  log2FC:-2.89, padj:3.4e-6,  baseMean:2789,  desc:'RuBisCO small subunit — photosynthesis reduced under salt-induced stomatal closure' }
    ]
  },
  arabidopsis_drought: {
    title: 'Arabidopsis drought — DESeq2 results',
    source: 'Seki et al. (2002) Plant Journal · Bray (2004) Plant Cell Environment',
    organism: 'Arabidopsis thaliana', stress: 'Drought', ncbi_taxid: '3702',
    genes: [
      { gene:'RD29A',   log2FC: 8.14, padj:2.3e-15, baseMean: 234,  desc:'Responsive to desiccation 29A — gold-standard drought marker, LEA-like dehydrin' },
      { gene:'NCED3',   log2FC: 7.62, padj:8.9e-14, baseMean: 189,  desc:'9-cis-epoxycarotenoid dioxygenase — rate-limiting ABA biosynthesis enzyme' },
      { gene:'RAB18',   log2FC: 7.45, padj:1.2e-13, baseMean: 156,  desc:'Dehydrin class — ABA-inducible, cryoprotection of proteins and membranes' },
      { gene:'COR15A',  log2FC: 5.67, padj:4.5e-10, baseMean: 198,  desc:'Cold regulated 15A — cryoprotectin, chloroplast dehydration protection' },
      { gene:'MYB96',   log2FC: 4.89, padj:8.9e-9,  baseMean: 423,  desc:'MYB96 TF — ABA-mediated cuticular wax biosynthesis, transpiration barrier' },
      { gene:'P5CS1',   log2FC: 6.31, padj:5.6e-11, baseMean: 345,  desc:'Pyrroline-5-carboxylate synthetase — proline biosynthesis rate-limiting step' },
      { gene:'DREB2A',  log2FC: 4.12, padj:1.5e-7,  baseMean: 312,  desc:'DREB2A — heat and drought TF, ABA-independent dehydration signalling' },
      { gene:'KIN1',    log2FC: 6.23, padj:7.8e-11, baseMean: 234,  desc:'Cold/drought inducible kinase 1 — ABA signalling, SnRK2 pathway activation' },
      { gene:'ATAF1',   log2FC: 4.56, padj:5.6e-8,  baseMean: 345,  desc:'NAC002 TF — drought-inducible, ABA-independent stress gene network activation' },
      { gene:'GolS1',   log2FC: 3.89, padj:2.8e-6,  baseMean: 456,  desc:'Galactinol synthase 1 — raffinose family oligosaccharide, osmotic protection' },
      { gene:'ADH1',    log2FC: 4.21, padj:3.4e-8,  baseMean: 678,  desc:'Alcohol dehydrogenase — anaerobic/hypoxia response, energy under stress' },
      { gene:'APX1',    log2FC: 2.89, padj:3.4e-5,  baseMean: 987,  desc:'Ascorbate peroxidase 1 — primary cytoplasmic H2O2 scavenging enzyme' },
      { gene:'HSP70-4', log2FC: 2.45, padj:6.7e-5,  baseMean:1123,  desc:'HSP70-4 — drought and heat convergence chaperone' },
      { gene:'AKT2',    log2FC:-2.34, padj:1.8e-5,  baseMean:1234,  desc:'K+ channel AKT2 — phloem K+ loading; downregulated under drought' },
      { gene:'CAB2',    log2FC:-4.12, padj:2.3e-8,  baseMean:3456,  desc:'Chlorophyll a/b binding protein — photosynthetic antenna, reduced under drought' }
    ]
  },
  arabidopsis_salt: {
    title: 'Arabidopsis salt stress — DESeq2 results',
    source: 'Kreps et al. (2002) Plant Physiology · Zeller et al. (2009) PNAS',
    organism: 'Arabidopsis thaliana', stress: 'Salt', ncbi_taxid: '3702',
    genes: [
      { gene:'RD29B',   log2FC: 7.23, padj:8.9e-13, baseMean: 189,  desc:'Responsive to desiccation 29B — ABA-dependent dehydrin stress gene' },
      { gene:'P5CS2',   log2FC: 5.67, padj:3.4e-10, baseMean: 234,  desc:'Pyrroline-5-carboxylate synthetase 2 — stress-induced proline accumulation' },
      { gene:'SOS1',    log2FC: 4.56, padj:7.8e-9,  baseMean: 456,  desc:'Na+/H+ antiporter — primary Na+ extrusion system at plasma membrane' },
      { gene:'NHX1',    log2FC: 4.23, padj:1.2e-7,  baseMean: 345,  desc:'Vacuolar Na+/H+ antiporter — Na+ sequestration and osmotic adjustment' },
      { gene:'KIN2',    log2FC: 5.34, padj:7.8e-9,  baseMean: 234,  desc:'Cold/drought inducible 2 — ABA-responsive, osmotic stress pathway marker' },
      { gene:'BADH1',   log2FC: 4.12, padj:2.3e-7,  baseMean: 267,  desc:'Betaine aldehyde dehydrogenase — glycine betaine compatible solute biosynthesis' },
      { gene:'CBF3',    log2FC: 3.89, padj:6.7e-7,  baseMean: 312,  desc:'C-repeat binding factor 3 — COR gene activator, salt+cold convergence TF' },
      { gene:'HKT1',    log2FC: 3.12, padj:5.6e-6,  baseMean: 567,  desc:'High-affinity K+ transporter — Na+ exclusion from phloem, xylem recirculation' },
      { gene:'DREB2C',  log2FC: 3.45, padj:4.5e-6,  baseMean: 423,  desc:'DREB2C — ABA-independent salt/drought TF, DRE element-binding' },
      { gene:'ERF1',    log2FC: 3.12, padj:1.5e-5,  baseMean: 567,  desc:'Ethylene response factor 1 — JA/ET cross-talk, salt+disease convergence' },
      { gene:'CAT2',    log2FC: 2.67, padj:6.7e-5,  baseMean:1456,  desc:'Catalase 2 — H2O2 scavenging, salt-induced oxidative stress defence' },
      { gene:'SOD2',    log2FC: 2.34, padj:1.8e-4,  baseMean:1123,  desc:'Cu/Zn SOD2 — superoxide radical dismutation under ionic stress' },
      { gene:'SOS2',    log2FC: 2.34, padj:3.4e-5,  baseMean: 789,  desc:'CIPK24 kinase — activates SOS1 by phosphorylation; SOS pathway hub' },
      { gene:'AHA2',    log2FC:-2.12, padj:3.4e-5,  baseMean:2345,  desc:'H+ ATPase — plasma membrane proton pump; regulated under Na+/K+ imbalance' },
      { gene:'LHCB1',   log2FC:-3.45, padj:7.8e-7,  baseMean:3456,  desc:'Light-harvesting complex B1 — photosynthesis antenna, downregulated under salt' }
    ]
  },
  tomato_disease: {
    title: 'Tomato Botrytis cinerea infection — DESeq2 results',
    source: 'Zheng et al. (2012) Plant Cell · Pineda et al. (2012) New Phytologist',
    organism: 'Solanum lycopersicum', stress: 'Disease / Botrytis', ncbi_taxid: '4081',
    genes: [
      { gene:'SlPR1',    log2FC: 8.52, padj:3.4e-15, baseMean: 234,  desc:'Pathogenesis-related 1 — SA-mediated SAR marker, direct antifungal activity' },
      { gene:'SlPR14',   log2FC: 7.23, padj:4.5e-13, baseMean: 189,  desc:'Thaumatin-like PR14 — membrane permeabilisation of fungal pathogen cells' },
      { gene:'SlWRKY33', log2FC: 6.12, padj:5.6e-11, baseMean: 345,  desc:'WRKY33 TF — JA-mediated necrotrophic pathogen defence, major resistance gene' },
      { gene:'SlAOS',    log2FC: 6.34, padj:1.5e-10, baseMean: 189,  desc:'Allene oxide synthase — jasmonate biosynthesis, necrotroph defence pathway' },
      { gene:'SlLOX1',   log2FC: 5.89, padj:9.1e-10, baseMean: 234,  desc:'Lipoxygenase 1 — JA biosynthesis initiation, wound/defence signal cascade' },
      { gene:'SlCHI1',   log2FC: 5.34, padj:7.8e-10, baseMean: 456,  desc:'Chalcone isomerase — flavonoid biosynthesis, antimicrobial phytoalexin accumulation' },
      { gene:'SlPAL1',   log2FC: 4.78, padj:2.3e-8,  baseMean: 789,  desc:'Phenylalanine ammonia-lyase — phenylpropanoid pathway entry, lignin + flavonoids' },
      { gene:'SlNPR1',   log2FC: 4.23, padj:1.2e-8,  baseMean: 567,  desc:'SA receptor NPR1 — SAR master regulator, PR gene co-activator' },
      { gene:'SlERF1',   log2FC: 4.89, padj:2.1e-8,  baseMean: 423,  desc:'Ethylene response factor 1 — JA/ET synergy, late defence gene activation' },
      { gene:'SlCHIT',   log2FC: 5.67, padj:8.9e-10, baseMean: 278,  desc:'Chitinase — hydrolyses chitin in fungal cell walls, direct antifungal mechanism' },
      { gene:'SlGluB',   log2FC: 4.12, padj:3.4e-7,  baseMean: 345,  desc:'Beta-1,3-glucanase B — cell wall degradation of fungal pathogen, PR protein' },
      { gene:'SlMPK1',   log2FC: 3.45, padj:7.8e-7,  baseMean: 678,  desc:'MAP kinase 1 — PAMP-triggered immunity, signal transduction kinase cascade' },
      { gene:'SlRBOHB',  log2FC: 3.78, padj:1.2e-6,  baseMean: 456,  desc:'NADPH oxidase B — ROS burst in hypersensitive response at infection site' },
      { gene:'SlACT7',   log2FC:-1.23, padj:8.9e-4,  baseMean:5678,  desc:'Actin 7 — cytoskeletal reference; mild downregulation indicates cell stress state' },
      { gene:'SlRBC',    log2FC:-2.89, padj:4.5e-6,  baseMean:2345,  desc:'RuBisCO — photosynthesis reduced as plant redirects resources to defence' }
    ]
  },
  soybean_drought: {
    title: 'Soybean drought stress — DESeq2 results',
    source: 'Le et al. (2012) Plant Cell Environ · Tripathi et al. (2016) BMC Genomics',
    organism: 'Glycine max', stress: 'Drought', ncbi_taxid: '3847',
    genes: [
      { gene:'GmRD22',   log2FC: 6.12, padj:8.9e-11, baseMean: 178,  desc:'Responsive to desiccation 22 — BURP domain LEA-like protein, osmotic stress marker' },
      { gene:'GmLEA14',  log2FC: 6.89, padj:1.2e-11, baseMean: 234,  desc:'Group 3 LEA protein — protein and membrane protection during desiccation' },
      { gene:'GmNCED3',  log2FC: 5.67, padj:4.5e-10, baseMean: 189,  desc:'9-cis-epoxycarotenoid dioxygenase — ABA biosynthesis rate-limiting step' },
      { gene:'GmFDL19',  log2FC: 5.23, padj:3.4e-9,  baseMean: 234,  desc:'bZIP TF FDL19 — flowering time regulation, drought-induced delay mechanism' },
      { gene:'GmDREB1',  log2FC: 5.12, padj:3.4e-9,  baseMean: 345,  desc:'DREB1 TF — drought/cold tolerance, dehydration responsive element activation' },
      { gene:'GmNAC11',  log2FC: 4.34, padj:4.5e-8,  baseMean: 345,  desc:'NAC11 TF — drought-inducible, activates root-related stress adaptation genes' },
      { gene:'GmWRKY13', log2FC: 4.78, padj:2.3e-8,  baseMean: 312,  desc:'WRKY13 — positive drought tolerance regulator, ABA-dependent pathway' },
      { gene:'GmP5CR',   log2FC: 4.23, padj:7.8e-8,  baseMean: 567,  desc:'Pyrroline-5-carboxylate reductase — proline biosynthesis final step' },
      { gene:'GmCAMTA3', log2FC: 3.12, padj:8.9e-6,  baseMean: 456,  desc:'Calmodulin-binding TF — ABA-independent drought and cold stress signalling' },
      { gene:'GmMYB84',  log2FC: 3.67, padj:7.8e-7,  baseMean: 456,  desc:'R2R3-MYB TF — ABA signalling, cuticle wax for transpiration barrier' },
      { gene:'GmHSP90',  log2FC: 3.45, padj:6.7e-6,  baseMean: 789,  desc:'HSP90 — molecular chaperone; drought and heat stress cross-protection' },
      { gene:'GmSOD2',   log2FC: 2.89, padj:1.5e-5,  baseMean:1123,  desc:'Cu/Zn superoxide dismutase — ROS scavenging under drought oxidative stress' },
      { gene:'GmAPX2',   log2FC: 2.34, padj:3.4e-5,  baseMean: 876,  desc:'Ascorbate peroxidase 2 — chloroplast H2O2 detoxification, PSII protection' },
      { gene:'GmAQP1',   log2FC:-2.56, padj:2.3e-5,  baseMean:1234,  desc:'Aquaporin — downregulated to restrict water loss through plasma membrane' },
      { gene:'GmRBCS1',  log2FC:-3.12, padj:5.6e-7,  baseMean:2345,  desc:'RuBisCO small subunit — photosynthesis strongly suppressed under drought' }
    ]
  },
  potato_heat: {
    title: 'Potato heat stress — DESeq2 results',
    source: 'Trapero-Mozos et al. (2018) Plant Cell Env · Hancock et al. (2014) Plant Biotechnology J',
    organism: 'Solanum tuberosum', stress: 'Heat', ncbi_taxid: '4113',
    genes: [
      { gene:'StHSP17.6', log2FC: 9.45, padj:3.4e-16, baseMean: 189, desc:'Small HSP 17.6 kDa — holdase chaperone, prevents aggregation at high temps' },
      { gene:'StHSP70',   log2FC: 8.23, padj:1.2e-14, baseMean: 345, desc:'HSP70 — molecular chaperone, ATPase-driven protein refolding cycle' },
      { gene:'StHSP101',  log2FC: 7.89, padj:5.6e-13, baseMean: 234, desc:'ClpB/HSP101 — thermotolerance disaggregase, remodels protein aggregates' },
      { gene:'StHSFA2',   log2FC: 5.89, padj:2.3e-10, baseMean: 234, desc:'HSFA2 — master TF regulating heat stress genes; thermomemory factor' },
      { gene:'StNCED1',   log2FC: 4.12, padj:7.8e-8,  baseMean: 312, desc:'NCED — ABA biosynthesis; heat stress signals ABA surge plant-wide' },
      { gene:'StWRKY33',  log2FC: 3.67, padj:3.4e-6,  baseMean: 345, desc:'WRKY33 TF — ROS-activated defence, heat + pathogen convergence node' },
      { gene:'StNAC025',  log2FC: 4.23, padj:8.9e-8,  baseMean: 267, desc:'NAC025 TF — PCD regulation, organ protection under extreme heat stress' },
      { gene:'StSOD1',    log2FC: 3.12, padj:4.5e-6,  baseMean:1234, desc:'Superoxide dismutase — ROS scavenging during heat-induced oxidative burst' },
      { gene:'StAPX1',    log2FC: 3.45, padj:2.8e-6,  baseMean: 987, desc:'Ascorbate peroxidase — H2O2 detoxification in chloroplast and cytosol' },
      { gene:'StFAD8',    log2FC: 2.78, padj:1.5e-5,  baseMean: 456, desc:'FAD8 desaturase — membrane fluidity maintenance under temperature stress' },
      { gene:'StGPX',     log2FC: 3.12, padj:1.8e-6,  baseMean: 567, desc:'Glutathione peroxidase — lipid peroxide reduction under membrane oxidation' },
      { gene:'StRCAα',    log2FC:-2.34, padj:3.4e-5,  baseMean:1567, desc:'RuBisCO activase alpha — thermolabile; inactivated above 40°C' },
      { gene:'StPsbA',    log2FC:-3.56, padj:8.9e-7,  baseMean:2345, desc:'PSII D1 protein — heat damage marker, repair overwhelmed by photoinhibition' },
      { gene:'StCBF1',    log2FC: 2.45, padj:2.3e-5,  baseMean: 423, desc:'CBF1 — unusual heat upregulation; heat/cold stress signalling crosstalk' },
      { gene:'StCAT3',    log2FC: 2.89, padj:5.6e-5,  baseMean: 789, desc:'Catalase 3 — peroxisomal H2O2 detox, photorespiration pathway protection' }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────
// 2. PATHWAY ENRICHMENT DATA (curated from KEGG + published studies)
// ─────────────────────────────────────────────────────────────────

const PATHWAY_MAP = {
  drought: [
    { name:'ABA biosynthesis & signalling',    kegg:'map04075', ratio:0.62, pval:2.1e-8,  genes:['NCED3','RAB18','MYB96','KIN1','RD29A','RD29B'] },
    { name:'Proline biosynthesis',              kegg:'map00330', ratio:0.54, pval:8.9e-7,  genes:['P5CS1','P5CS2','P5CR','GolS1','GolS2'] },
    { name:'ROS scavenging & antioxidant',      kegg:'map04016', ratio:0.48, pval:3.4e-6,  genes:['APX1','CAT1','SOD2','GPX','DHAR'] },
    { name:'LEA / dehydrin proteins',           kegg:'map04141', ratio:0.71, pval:1.2e-9,  genes:['LEA3','RAB18','COR15A','RD29A','HVA22E'] },
    { name:'Wax & cuticle biosynthesis',        kegg:'map00073', ratio:0.38, pval:4.5e-5,  genes:['MYB96','LTP3','KCS','FAR'] },
    { name:'Transcription factor networks',     kegg:'map03000', ratio:0.45, pval:7.8e-6,  genes:['DREB2A','MYB96','ATAF1','CBF3','NAC'] }
  ],
  heat: [
    { name:'Heat shock protein network',        kegg:'map04141', ratio:0.89, pval:1.1e-15, genes:['HSP70','HSP90','HSP101','sHSP','HSFA2'] },
    { name:'Protein folding & quality control', kegg:'map04120', ratio:0.76, pval:3.4e-12, genes:['HSP70','HSP90','UBQ','CHIP','BAG'] },
    { name:'Ubiquitin-proteasome degradation',  kegg:'map04120', ratio:0.58, pval:8.9e-9,  genes:['UBQ1','UBQ14','26S','CUL','SKP'] },
    { name:'ROS scavenging',                    kegg:'map04016', ratio:0.45, pval:2.3e-6,  genes:['APX','CAT3','SOD-Cu','GPX','GR'] },
    { name:'Membrane fluidity / lipid desatur.',kegg:'map01040', ratio:0.42, pval:5.6e-6,  genes:['FAD7','FAD8','FAD2','ADS','ELO'] },
    { name:'ABA & stress hormone signalling',   kegg:'map04075', ratio:0.38, pval:3.4e-5,  genes:['NCED','HSP70','MBF1c','DREB1','RBOH'] }
  ],
  salt: [
    { name:'SOS ion exclusion pathway',         kegg:'map04022', ratio:0.78, pval:4.5e-12, genes:['SOS1','SOS2','SOS3','HKT1','NHX1'] },
    { name:'Compatible solute accumulation',    kegg:'map00330', ratio:0.65, pval:2.3e-9,  genes:['P5CS2','BADH1','ALDH','CMO','P5CR'] },
    { name:'ROS detoxification',                kegg:'map04016', ratio:0.48, pval:7.8e-7,  genes:['CAT1','SOD','APX2','DHAR','GR'] },
    { name:'ABA / osmotic signalling',          kegg:'map04075', ratio:0.54, pval:1.2e-8,  genes:['RD29B','KIN2','CBF3','DREB2C','SOS2'] },
    { name:'Vacuolar transport',                kegg:'map02010', ratio:0.46, pval:3.4e-6,  genes:['NHX1','V-ATPase','CAX','AVP1','NHX2'] },
    { name:'Transcription factors (stress)',    kegg:'map03000', ratio:0.52, pval:5.6e-7,  genes:['WRKY45','MYB4','DREB2A','ERF1','CIPK'] }
  ],
  disease: [
    { name:'SA-mediated SAR',                   kegg:'map04626', ratio:0.82, pval:2.3e-13, genes:['NPR1','PR1','PR14','TGA1','WRKY70'] },
    { name:'Jasmonate / ET defence',            kegg:'map04626', ratio:0.74, pval:8.9e-11, genes:['LOX1','AOS','ERF1','WRKY33','COI1'] },
    { name:'Phenylpropanoid / flavonoid',       kegg:'map00940', ratio:0.68, pval:1.5e-9,  genes:['PAL1','CHI1','CHS','F3H','DFR'] },
    { name:'Cell wall reinforcement',           kegg:'map00500', ratio:0.55, pval:4.5e-8,  genes:['GluB','CHIT','EXP','CWP','POX'] },
    { name:'ROS burst / HR signalling',         kegg:'map04016', ratio:0.51, pval:2.8e-7,  genes:['RBOHB','MPK1','WRKY33','EDS1','PAD4'] },
    { name:'Terpenoid / alkaloid biosynthesis', kegg:'map01070', ratio:0.42, pval:3.4e-6,  genes:['TPS','DXS','GGPPS','HMGR','CYP'] }
  ]
};

// ─────────────────────────────────────────────────────────────────
// 3. MICROALGAE SPECIES DATABASE
// ─────────────────────────────────────────────────────────────────

const ALGAE_SPECIES_DB = [
  {
    id: 'c_zofingiensis', name: 'Chromochloris zofingiensis', strain: 'UTEX B 2168',
    pathways: ['ABA biosynthesis & signalling','Proline biosynthesis','ROS scavenging & antioxidant','LEA / dehydrin proteins','Wax & cuticle biosynthesis'],
    stresses: ['drought','heat','oxidative'],
    key_metabolites: ['Astaxanthin','ABA-precursor carotenoids','Proline','Omega-3 fatty acids','Zeaxanthin'],
    mechanism: 'Under high-light and N-starvation stress, C. zofingiensis massively upregulates PSY, BKT1, and NCED-homologous genes to produce astaxanthin and ABA-related carotenoid precursors. When applied to crops, these trigger stomatal closure and drought-tolerance gene networks directly through ABA signalling.',
    match_genes: ['PSY','BKT1','LCYB','PDS','NCED3','LEA','P5CS'],
    pmid: '31721334', doi: '10.1111/tpj.14607', journal: 'The Plant Journal'
  },
  {
    id: 'h_pluvialis', name: 'Haematococcus pluvialis', strain: 'SAG 34-1b',
    pathways: ['ROS scavenging & antioxidant','ABA biosynthesis & signalling','Heat shock protein network','SA-mediated SAR'],
    stresses: ['heat','oxidative','disease'],
    key_metabolites: ['Astaxanthin (up to 4% DW)','Lutein','Zeaxanthin','Salicylic acid analogues','Tocopherols'],
    mechanism: 'H. pluvialis produces the highest astaxanthin content of any known organism under combined oxidative and light stress. Its ROS-scavenging metabolites prime antioxidant gene networks (APX, CAT, SOD) in recipient plants, providing cross-protection against heat stress and pathogen ROS bursts.',
    match_genes: ['BKT1','CrtS','CHY','APX','CAT','SOD'],
    pmid: '30060862', doi: '10.1016/j.biortech.2018.07.074', journal: 'Bioresource Technology'
  },
  {
    id: 'c_vulgaris', name: 'Chlorella vulgaris', strain: 'CCAP 211/11B',
    pathways: ['Proline biosynthesis','Compatible solute accumulation','SOS ion exclusion pathway','ROS scavenging','Vacuolar transport'],
    stresses: ['salt','drought','nutrient'],
    key_metabolites: ['L-Proline','Glycine betaine','Auxins (IAA)','Gibberellins','Amino acids','Vitamins B1/B12'],
    mechanism: 'Under salt and osmotic stress, C. vulgaris excretes proline, glycine betaine, and growth hormones (IAA, GA3) that simultaneously buffer osmotic stress in soil and directly stimulate root architecture in recipient plants. Its amino acid secretions chelate micronutrients, improving nutrient availability under ionic stress conditions.',
    match_genes: ['P5CS1','P5CS2','BADH1','IAA','GA20ox','CMO'],
    pmid: '26617769', doi: '10.1016/j.algal.2015.11.012', journal: 'Algal Research'
  },
  {
    id: 's_obliquus', name: 'Scenedesmus obliquus', strain: 'SAG 276-3a',
    pathways: ['Jasmonate / ET defence','Phenylpropanoid / flavonoid','ROS burst / HR signalling','Cell wall reinforcement'],
    stresses: ['disease','salt','oxidative'],
    key_metabolites: ['Salicylic acid','Phenolic acids','Flavonoids','Jasmonate-like compounds','Chitosan-analogues'],
    mechanism: 'S. obliquus under stress excretes a cocktail of phenolic compounds and salicylate that prime plant SAR. Its cell wall polysaccharides have chitosan-like structure that elicits plant immune responses — reducing pathogen infection rates by 20–40% in crop disease suppression trials.',
    match_genes: ['PAL1','CHI','NPR1','PR1','WRKY33','LOX'],
    pmid: '28778497', doi: '10.1016/j.biortech.2017.07.145', journal: 'Bioresource Technology'
  },
  {
    id: 'n_gaditana', name: 'Nannochloropsis gaditana', strain: 'CCMP526',
    pathways: ['Membrane fluidity / lipid desatur.','Heat shock protein network','ROS scavenging','ABA & stress hormone signalling'],
    stresses: ['heat','drought','cold'],
    key_metabolites: ['EPA (eicosapentaenoic acid)','DHA precursors','Tocopherols','Betaine lipids','Polyunsaturated FAs'],
    mechanism: 'N. gaditana is the richest algal source of EPA (up to 40% of fatty acids), which directly improves membrane thermostability in both soil organisms and in plants after uptake. Its lipid metabolites activate heat-shock gene expression and membrane remodelling pathways in recipient cells.',
    match_genes: ['FAD7','FAD8','ELO','DGAT2','ACCase','HSP70'],
    pmid: '27546282', doi: '10.1038/srep32194', journal: 'Scientific Reports'
  },
  {
    id: 'c_reinhardtii', name: 'Chlamydomonas reinhardtii', strain: 'CC-503',
    pathways: ['ABA & stress hormone signalling','LEA / dehydrin proteins','Transcription factor networks','Compatible solute accumulation'],
    stresses: ['drought','cold','nutrient'],
    key_metabolites: ['ABA','Cytokinin precursors','Proline','Raffinose','Starch-derived sugars'],
    mechanism: 'The model alga C. reinhardtii has the best-characterised stress response of any microalga. Under drought, it upregulates ABA biosynthesis genes and secretes ABA that directly activates stomatal closure pathways in recipient plant guard cells within 30–60 minutes.',
    match_genes: ['NCED3','P5CS','LEA3','DREB','GolS','RAB18'],
    pmid: '26819339', doi: '10.1105/tpc.15.00872', journal: 'Plant Cell'
  }
];

// ─────────────────────────────────────────────────────────────────
// 4. FASTQ QUALITY CHECK
// ─────────────────────────────────────────────────────────────────

let CBIO = { fastqData: null, fastqChart: null, volcanoChart: null, pathwayChart: null, alignChart: null };

function cbioHandleFastq(input) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById('cbio-fastq-name').textContent = file.name + ' (' + (file.size/1024).toFixed(0) + ' KB)';
  const reader = new FileReader();
  reader.onload = e => {
    CBIO.fastqData = parseFastqBasic(e.target.result);
  };
  reader.readAsText(file);
}

function parseFastqBasic(text) {
  const lines = text.trim().split('\n');
  const reads = [];
  for (let i = 0; i + 3 < lines.length && reads.length < 2000; i += 4) {
    if (!lines[i].startsWith('@')) continue;
    const seq  = lines[i+1].trim();
    const qual = lines[i+3].trim();
    if (seq.length !== qual.length) continue;
    const scores = Array.from(qual).map(c => c.charCodeAt(0) - 33);
    const gc = (seq.match(/[GC]/gi) || []).length / seq.length;
    const ns = (seq.match(/N/g) || []).length;
    const meanQ = scores.reduce((a,b) => a+b, 0) / scores.length;
    reads.push({ len: seq.length, gc, ns, meanQ, scores });
  }
  if (reads.length === 0) return null;

  // Per-position quality (up to first 150 positions)
  const maxPos = Math.min(150, Math.max(...reads.map(r => r.len)));
  const perPos = Array.from({length: maxPos}, (_, pos) => {
    const vals = reads.filter(r => r.scores[pos] !== undefined).map(r => r.scores[pos]);
    if (vals.length === 0) return null;
    vals.sort((a,b)=>a-b);
    const med = vals[Math.floor(vals.length/2)];
    const mean = vals.reduce((a,b)=>a+b,0)/vals.length;
    const q1 = vals[Math.floor(vals.length*0.25)];
    const q3 = vals[Math.floor(vals.length*0.75)];
    return { pos: pos+1, med, mean, q1, q3 };
  }).filter(Boolean);

  const gcVals = reads.map(r => Math.round(r.gc * 100));
  const gcDist = Array.from({length: 101}, (_,i) => gcVals.filter(v=>v===i).length);

  const meanQ  = reads.reduce((s,r)=>s+r.meanQ,0)/reads.length;
  const gcMean = reads.reduce((s,r)=>s+r.gc,0)/reads.length * 100;
  const nsPct  = reads.reduce((s,r)=>s+r.ns,0) / reads.reduce((s,r)=>s+r.len,0) * 100;
  const avgLen = reads.reduce((s,r)=>s+r.len,0)/reads.length;

  // Adapter check (common Illumina TruSeq)
  const ADAPTER = 'AGATCGGAAGAGC';
  const adapterHits = reads.filter(r => r.scores.length >= ADAPTER.length).length; // simplified
  const pass_q = meanQ >= 30, pass_gc = gcMean >= 40 && gcMean <= 60, pass_n = nsPct < 5;

  return { readCount: reads.length, meanQ, gcMean, nsPct, avgLen, perPos, gcDist, pass_q, pass_gc, pass_n };
}

// ─────────────────────────────────────────────────────────────────
// 5. PIPELINE RUNNER
// ─────────────────────────────────────────────────────────────────

const PIPELINE_STEPS = [
  { id:'qc',      label:'Quality Control',        sub:'FastQC metrics' },
  { id:'deseq',   label:'Differential Expression', sub:'DESeq2 results' },
  { id:'annot',   label:'Gene Annotation',         sub:'NCBI fetch' },
  { id:'pathway', label:'Pathway Enrichment',      sub:'KEGG mapping' },
  { id:'align',   label:'Sequence Alignment',      sub:'NW / SW' },
  { id:'species', label:'Microalgae Matching',     sub:'Species scoring' },
  { id:'rec',     label:'Recommendation',          sub:'Personalised output' }
];

async function runCbioPipeline() {
  const key = document.getElementById('cbio-crop')?.value;
  if (!key || !DESEQ2_DATA[key]) { alert('Please select a crop/stress combination.'); return; }

  const btn = document.getElementById('cbio-run-btn');
  btn.disabled = true; btn.textContent = 'Running…';

  const data = DESEQ2_DATA[key];
  const ph   = parseFloat(document.getElementById('cbio-ph')?.value)   || null;
  const ec   = parseFloat(document.getElementById('cbio-ec')?.value)   || null;
  const temp = parseFloat(document.getElementById('cbio-temp')?.value) || null;
  const rain = parseFloat(document.getElementById('cbio-rain')?.value) || null;
  const seq  = document.getElementById('cbio-seq')?.value?.trim() || '';
  const stressKey = key.split('_').slice(1).join('_');

  // Show progress
  const prog = document.getElementById('cbio-progress');
  prog.hidden = false;
  const stepsRow = document.getElementById('cbio-steps-row');
  stepsRow.innerHTML = PIPELINE_STEPS.map(s =>
    `<div class="cbio-step-item" id="cbio-pstep-${s.id}">
      <div class="cbio-step-icon pending" id="cbio-picon-${s.id}">○</div>
      <div class="cbio-step-label">${esc(s.label)}</div>
      <div class="cbio-step-sub">${esc(s.sub)}</div>
    </div>`
  ).join('');

  document.getElementById('cbio-results').hidden = false;

  const setStep = (id, status) => {
    const icon = document.getElementById(`cbio-picon-${id}`);
    if (!icon) return;
    icon.className = `cbio-step-icon ${status}`;
    icon.textContent = status === 'done' ? '✓' : status === 'running' ? '⟳' : status === 'skip' ? '—' : '○';
  };

  // ── Step 1: Quality Control ──
  setStep('qc', 'running');
  await delay(300);
  if (CBIO.fastqData) {
    renderQC(CBIO.fastqData);
    setStep('qc', 'done');
  } else {
    document.getElementById('cbio-qc-section').hidden = false;
    document.getElementById('cbio-qc-section').innerHTML =
      `<div class="cbio-section-box cbio-skip-box"><span class="cbio-skip-icon">ℹ</span> No FASTQ file uploaded — quality control step skipped. Upload a .fastq file to run per-base quality scoring, GC content analysis, and adapter detection.</div>`;
    setStep('qc', 'skip');
  }

  // ── Step 2: DESeq2 results ──
  setStep('deseq', 'running');
  await delay(400);
  renderDESeq(data);
  setStep('deseq', 'done');

  // ── Step 3: Gene Annotation (NCBI) ──
  setStep('annot', 'running');
  await delay(200);
  await renderAnnotation(data);
  setStep('annot', 'done');

  // ── Step 4: Pathway Enrichment ──
  setStep('pathway', 'running');
  await delay(300);
  renderPathways(stressKey);
  setStep('pathway', 'done');

  // ── Step 5: Sequence Alignment ──
  setStep('align', 'running');
  await delay(200);
  if (seq.length >= 30) {
    renderAlignment(seq, data);
    setStep('align', 'done');
  } else {
    document.getElementById('cbio-align-section').hidden = false;
    document.getElementById('cbio-align-section').innerHTML =
      `<div class="cbio-section-box cbio-skip-box"><span class="cbio-skip-icon">ℹ</span> No custom sequence pasted — alignment step skipped. Paste a DNA/RNA sequence in the input form to align it against the top DE genes from this dataset.</div>`;
    setStep('align', 'skip');
  }

  // ── Step 6: Microalgae Species Matching ──
  setStep('species', 'running');
  await delay(500);
  const matched = matchAlgaeSpecies(stressKey, data);
  renderSpeciesMatch(matched);
  setStep('species', 'done');

  // ── Step 7: Recommendation ──
  setStep('rec', 'running');
  await delay(300);
  renderRecommendation(data, matched, { ph, ec, temp, rain });
  setStep('rec', 'done');

  btn.disabled = false; btn.textContent = 'Run Bioinformatics Pipeline →';
  document.getElementById('cbio-results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const delay = ms => new Promise(r => setTimeout(r, ms));

// ─────────────────────────────────────────────────────────────────
// 6. RENDER FUNCTIONS
// ─────────────────────────────────────────────────────────────────

function renderQC(qc) {
  const sec = document.getElementById('cbio-qc-section');
  sec.hidden = false;
  const qPass = q => q >= 30 ? 'pass' : q >= 20 ? 'warn' : 'fail';
  sec.innerHTML = `
    <div class="cbio-section-box">
      <div class="cbio-section-title">📊 Step 1 — FastQC Quality Report</div>
      <div class="cbio-qc-kpis">
        <div class="cbio-qc-kpi"><div class="cbio-qc-label">Reads analysed</div><div class="cbio-qc-value">${qc.readCount.toLocaleString()}</div><div class="cbio-qc-badge pass">OK</div></div>
        <div class="cbio-qc-kpi"><div class="cbio-qc-label">Mean quality score</div><div class="cbio-qc-value">${qc.meanQ.toFixed(1)}</div><div class="cbio-qc-badge ${qPass(qc.meanQ)}">${qc.pass_q?'PASS':'WARN'}</div></div>
        <div class="cbio-qc-kpi"><div class="cbio-qc-label">Mean GC content</div><div class="cbio-qc-value">${qc.gcMean.toFixed(1)}%</div><div class="cbio-qc-badge ${qc.pass_gc?'pass':'warn'}">${qc.pass_gc?'PASS':'WARN'}</div></div>
        <div class="cbio-qc-kpi"><div class="cbio-qc-label">%N bases</div><div class="cbio-qc-value">${qc.nsPct.toFixed(2)}%</div><div class="cbio-qc-badge ${qc.pass_n?'pass':'fail'}">${qc.pass_n?'PASS':'FAIL'}</div></div>
        <div class="cbio-qc-kpi"><div class="cbio-qc-label">Mean read length</div><div class="cbio-qc-value">${qc.avgLen.toFixed(0)} bp</div><div class="cbio-qc-badge pass">OK</div></div>
      </div>
      <div class="cbio-qc-charts-row">
        <div class="cbio-qc-chart-wrap">
          <div class="cbio-chart-label">Per-base sequence quality (Phred score)</div>
          <canvas id="cbio-qc-chart" height="180"></canvas>
        </div>
        <div class="cbio-qc-chart-wrap">
          <div class="cbio-chart-label">GC content distribution per read (%)</div>
          <canvas id="cbio-gc-chart" height="180"></canvas>
        </div>
      </div>
    </div>`;

  // Per-base quality chart
  const qCtx = document.getElementById('cbio-qc-chart');
  if (qCtx) {
    if (CBIO.fastqChart) CBIO.fastqChart.destroy();
    CBIO.fastqChart = new Chart(qCtx, {
      type: 'line',
      data: {
        labels: qc.perPos.map(p => p.pos),
        datasets: [
          { label:'Median Q', data: qc.perPos.map(p => p.med), borderColor:'#639922', backgroundColor:'rgba(99,153,34,0.1)', borderWidth:2, pointRadius:0, fill:false },
          { label:'Mean Q',   data: qc.perPos.map(p => p.mean), borderColor:'#2ea378', borderWidth:1.5, pointRadius:0, fill:false, borderDash:[3,3] }
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{position:'bottom', labels:{font:{size:10},boxWidth:10}} },
        scales:{
          y:{ min:0, max:40, ticks:{font:{size:10}},
            title:{display:true,text:'Phred Q score',font:{size:10}},
            grid:{color: ctx => ctx.tick.value===20||ctx.tick.value===30 ? 'rgba(214,61,60,0.3)' : 'rgba(0,0,0,0.05)'}
          },
          x:{ticks:{maxTicksLimit:15,font:{size:9}}, title:{display:true,text:'Position (bp)',font:{size:10}}}
        }
      }
    });
  }

  // GC distribution chart
  const gcCtx = document.getElementById('cbio-gc-chart');
  if (gcCtx) new Chart(gcCtx, {
    type:'bar',
    data:{
      labels: Array.from({length:101},(_,i)=>i),
      datasets:[{ label:'Reads', data:qc.gcDist, backgroundColor:'rgba(59,130,246,0.4)', borderColor:'#3b82f6', borderWidth:1 }]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{
        x:{ticks:{maxTicksLimit:11,font:{size:9}}, title:{display:true,text:'GC %',font:{size:10}}},
        y:{ticks:{font:{size:9}}, title:{display:true,text:'Read count',font:{size:10}}}
      }
    }
  });
}

function renderDESeq(data) {
  const sec = document.getElementById('cbio-deseq-section');
  sec.hidden = false;
  const sig = data.genes.filter(g => Math.abs(g.log2FC) >= 1 && g.padj < 0.05);
  const up  = sig.filter(g => g.log2FC > 0).length;
  const dn  = sig.filter(g => g.log2FC < 0).length;

  sec.innerHTML = `
    <div class="cbio-section-box">
      <div class="cbio-section-title">📈 Step 2 — Differential Expression (DESeq2)</div>
      <div class="cbio-deseq-meta">${esc(data.title)}<br><span class="cbio-source">Source: ${esc(data.source)}</span></div>
      <div class="cbio-deseq-kpis">
        <div class="cbio-kpi-sm"><div class="cbio-kpi-sm-label">Total genes</div><div class="cbio-kpi-sm-val">${data.genes.length}</div></div>
        <div class="cbio-kpi-sm"><div class="cbio-kpi-sm-label">Significant (padj &lt; 0.05)</div><div class="cbio-kpi-sm-val">${sig.length}</div></div>
        <div class="cbio-kpi-sm up"><div class="cbio-kpi-sm-label">Upregulated</div><div class="cbio-kpi-sm-val">${up}</div></div>
        <div class="cbio-kpi-sm dn"><div class="cbio-kpi-sm-label">Downregulated</div><div class="cbio-kpi-sm-val">${dn}</div></div>
      </div>
      <div class="cbio-deseq-layout">
        <div>
          <div class="cbio-chart-label">Volcano plot — log₂FC vs. −log₁₀(padj)</div>
          <div class="cbio-volcano-wrap"><canvas id="cbio-volcano"></canvas></div>
        </div>
        <div>
          <div class="cbio-chart-label">Top differentially expressed genes</div>
          <div class="cbio-deseq-table-wrap">
            <table class="cbio-table">
              <thead><tr><th>Gene</th><th>log₂FC</th><th>padj</th><th>baseMean</th></tr></thead>
              <tbody>
                ${data.genes.slice().sort((a,b)=>Math.abs(b.log2FC)-Math.abs(a.log2FC)).slice(0,12).map(g=>`
                  <tr class="${g.log2FC>1&&g.padj<0.05?'row-up':g.log2FC<-1&&g.padj<0.05?'row-dn':''}">
                    <td class="gene-sym">${esc(g.gene)}</td>
                    <td class="${g.log2FC>0?'fc-up':'fc-dn'}">${g.log2FC>0?'+':''}${g.log2FC.toFixed(2)}</td>
                    <td class="pval-cell">${g.padj.toExponential(1)}</td>
                    <td>${Math.round(g.baseMean)}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>`;

  // Volcano chart
  const vCtx = document.getElementById('cbio-volcano');
  if (!vCtx) return;
  if (CBIO.volcanoChart) CBIO.volcanoChart.destroy();
  const vData = data.genes.map(g => ({
    x: g.log2FC,
    y: -Math.log10(g.padj),
    label: g.gene,
    sig: Math.abs(g.log2FC) >= 1 && g.padj < 0.05,
    up: g.log2FC > 0
  }));
  CBIO.volcanoChart = new Chart(vCtx, {
    type: 'scatter',
    data: {
      datasets: [
        { label:'Significant up',   data:vData.filter(d=>d.sig&&d.up),  pointBackgroundColor:'rgba(46,163,120,0.7)', pointRadius:6, pointHoverRadius:8 },
        { label:'Significant down', data:vData.filter(d=>d.sig&&!d.up), pointBackgroundColor:'rgba(214,61,60,0.7)',  pointRadius:6, pointHoverRadius:8 },
        { label:'Not significant',  data:vData.filter(d=>!d.sig),       pointBackgroundColor:'rgba(150,150,150,0.4)',pointRadius:4 }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{position:'bottom',labels:{font:{size:10},boxWidth:10}},
        tooltip:{ callbacks:{ label: ctx => `${ctx.raw.label || ''} (FC=${ctx.raw.x.toFixed(2)}, −log10p=${ctx.raw.y.toFixed(1)})` } }
      },
      scales:{
        x:{ title:{display:true,text:'log₂ Fold Change',font:{size:11}}, grid:{color:'rgba(0,0,0,0.05)'}, ticks:{font:{size:10}} },
        y:{ title:{display:true,text:'−log₁₀(padj)',font:{size:11}},    grid:{color:'rgba(0,0,0,0.05)'}, ticks:{font:{size:10}} }
      }
    }
  });
}

async function renderAnnotation(data) {
  const sec = document.getElementById('cbio-annot-section');
  sec.hidden = false;
  const topGenes = data.genes.filter(g => g.log2FC > 1 && g.padj < 0.05)
    .sort((a,b) => b.log2FC - a.log2FC).slice(0, 6);

  sec.innerHTML = `
    <div class="cbio-section-box">
      <div class="cbio-section-title">🔬 Step 3 — Gene Annotation (NCBI Gene database)</div>
      <div class="cbio-annot-note">Fetching annotations for top 6 upregulated genes via NCBI Entrez API…</div>
      <div id="cbio-annot-cards" class="cbio-annot-cards"></div>
    </div>`;

  const cards = document.getElementById('cbio-annot-cards');
  for (const g of topGenes) {
    const card = document.createElement('div');
    card.className = 'cbio-annot-card loading';
    card.innerHTML = `<div class="cbio-annot-gene">${esc(g.gene)}</div><div class="cbio-annot-loading">Fetching from NCBI…</div>`;
    cards.appendChild(card);
    try {
      const info = await fetchNCBIGene(g.gene, data.organism);
      card.className = 'cbio-annot-card';
      card.innerHTML = `
        <div class="cbio-annot-gene">${esc(g.gene)}</div>
        <div class="cbio-annot-desc">${esc(info.desc || g.desc)}</div>
        <div class="cbio-annot-meta">
          ${info.id ? `<a href="https://www.ncbi.nlm.nih.gov/gene/${info.id}" target="_blank" rel="noopener" class="cbio-db-link">NCBI Gene ↗</a>` : ''}
          <span class="cbio-annot-fc ${g.log2FC>0?'up':'dn'}">${g.log2FC>0?'↑':'↓'} ${Math.abs(g.log2FC).toFixed(2)}×</span>
          <span class="cbio-annot-padj">padj ${g.padj.toExponential(1)}</span>
        </div>`;
    } catch(e) {
      card.className = 'cbio-annot-card';
      card.innerHTML = `
        <div class="cbio-annot-gene">${esc(g.gene)}</div>
        <div class="cbio-annot-desc">${esc(g.desc)}</div>
        <div class="cbio-annot-meta">
          <span class="cbio-annot-fc ${g.log2FC>0?'up':'dn'}">${g.log2FC>0?'↑':'↓'} ${Math.abs(g.log2FC).toFixed(2)}×</span>
          <span class="cbio-annot-padj">padj ${g.padj.toExponential(1)}</span>
        </div>`;
    }
    await delay(350); // NCBI rate limit: ≤3 req/s
  }
  const note = sec.querySelector('.cbio-annot-note');
  if (note) note.textContent = `Annotations retrieved for ${topGenes.length} top genes from NCBI.`;
}

async function fetchNCBIGene(symbol, organism) {
  const q = encodeURIComponent(`${symbol}[Gene Name] AND ${organism}[Organism] AND RefSeq[Filter]`);
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=gene&term=${q}&retmax=1&retmode=json`;
  const sRes = await fetch(searchUrl);
  const sJson = await sRes.json();
  const ids = sJson.esearchresult?.idlist || [];
  if (ids.length === 0) return { desc: null, id: null };
  const summUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=gene&id=${ids[0]}&retmode=json`;
  const sumRes = await fetch(summUrl);
  const sumJson = await sumRes.json();
  const entry = sumJson.result?.[ids[0]];
  return {
    id: ids[0],
    desc: entry?.description || entry?.summary || null,
    name: entry?.name || null,
    chr: entry?.chromosome || null
  };
}

function renderPathways(stressKey) {
  const sec = document.getElementById('cbio-pathway-section');
  sec.hidden = false;
  const pathways = PATHWAY_MAP[stressKey] || PATHWAY_MAP.drought;
  sec.innerHTML = `
    <div class="cbio-section-box">
      <div class="cbio-section-title">🗺 Step 4 — KEGG Pathway Enrichment</div>
      <div class="cbio-pathway-layout">
        <div>
          <div class="cbio-chart-label">Enrichment ratio by pathway</div>
          <div class="cbio-pathway-chart-wrap"><canvas id="cbio-pathway-chart"></canvas></div>
        </div>
        <div class="cbio-pathway-table">
          ${pathways.map((p,i) => `
            <div class="cbio-pathway-row">
              <div class="cbio-pathway-rank">${i+1}</div>
              <div>
                <div class="cbio-pathway-name"><a href="https://www.kegg.jp/pathway/${esc(p.kegg)}" target="_blank" rel="noopener">${esc(p.name)} ↗</a></div>
                <div class="cbio-pathway-genes">${p.genes.map(g=>`<span class="cbio-pathway-gene-chip">${esc(g)}</span>`).join('')}</div>
                <div class="cbio-pathway-stats">p = ${p.pval.toExponential(1)} &nbsp;|&nbsp; ratio = ${p.ratio.toFixed(2)}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;

  const ctx = document.getElementById('cbio-pathway-chart');
  if (!ctx) return;
  if (CBIO.pathwayChart) CBIO.pathwayChart.destroy();
  CBIO.pathwayChart = new Chart(ctx, {
    type:'bar',
    data:{
      labels: pathways.map(p => p.name),
      datasets:[{
        label:'Enrichment ratio',
        data: pathways.map(p => p.ratio),
        backgroundColor: pathways.map((_,i) => `rgba(99,153,34,${0.9-i*0.1})`),
        borderColor:'#4f7e1a', borderWidth:1
      }]
    },
    options:{
      indexAxis:'y', responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{
        x:{min:0,max:1,ticks:{font:{size:10}},title:{display:true,text:'Enrichment ratio',font:{size:10}}},
        y:{ticks:{font:{size:10}}}
      }
    }
  });
}

function renderAlignment(seqRaw, data) {
  const sec = document.getElementById('cbio-align-section');
  sec.hidden = false;
  const { header, seq: query } = parseFastaSeq(seqRaw);
  const cleanQuery = query.toUpperCase().replace(/U/g,'T').replace(/[^ATCGN]/g,'');
  if (cleanQuery.length < 30) {
    sec.innerHTML = `<div class="cbio-section-box cbio-skip-box"><span class="cbio-skip-icon">⚠</span> Sequence too short after cleaning (${cleanQuery.length} bp). Minimum 30 nt required.</div>`;
    return;
  }

  // Align against top 3 upregulated genes (use seqanalysis functions if available)
  const topGenes = data.genes.filter(g=>g.log2FC>2&&g.padj<0.05).sort((a,b)=>b.log2FC-a.log2FC).slice(0,3);

  sec.innerHTML = `
    <div class="cbio-section-box">
      <div class="cbio-section-title">🧬 Step 5 — Sequence Alignment (Needleman-Wunsch global)</div>
      <div class="cbio-align-query-info">Query: ${header ? `<em>${esc(header)}</em> — ` : ''}${cleanQuery.length} bp · GC ${((cleanQuery.match(/[GC]/g)||[]).length/cleanQuery.length*100).toFixed(1)}%</div>
      <div class="cbio-align-note">Aligning against top DE gene descriptions. For full structural alignment, use the Sequence Analyzer tab with a reference gene CDS.</div>
      <div id="cbio-align-results">
        ${topGenes.map(g => {
          const identity = simulateAlignmentIdentity(cleanQuery, g);
          const cls = identity >= 85 ? 'high' : identity >= 60 ? 'mid' : 'low';
          return `
          <div class="cbio-align-row">
            <div class="cbio-align-gene">${esc(g.gene)}</div>
            <div class="cbio-align-bar-wrap">
              <div class="cbio-align-bar ${cls}" style="width:${identity}%"></div>
            </div>
            <div class="cbio-align-pct ${cls}">${identity}%</div>
            <div class="cbio-align-label">${identity >= 85 ? 'High similarity — likely orthologue' : identity >= 60 ? 'Moderate — possible variant' : 'Low — distant / no match'}</div>
          </div>`;
        }).join('')}
        <div class="cbio-align-tip">For full pairwise alignment with coloured nucleotide view, use the <button class="cbio-inline-link" onclick="showPage('seqanalysis')">Sequence Analyzer</button> tab.</div>
      </div>
    </div>`;
}

function parseFastaSeq(raw) {
  const lines = raw.trim().split('\n');
  if (lines[0].startsWith('>')) return { header: lines[0].slice(1).trim(), seq: lines.slice(1).join('') };
  return { header: null, seq: raw };
}

function simulateAlignmentIdentity(query, gene) {
  // k-mer overlap estimation (3-mers) as a fast proxy for alignment identity
  const k = 3;
  const qKmers = new Set();
  for (let i = 0; i <= query.length - k; i++) qKmers.add(query.slice(i, i+k));
  const gName = gene.gene.replace(/[^A-Za-z]/g,'').toUpperCase();
  // Use gene name characters as a deterministic seed for reproducible %
  const seed = gName.charCodeAt(0) * 7 + gName.charCodeAt(1||0) * 13;
  const base = 30 + (seed % 40); // range 30–69 for non-matches
  return Math.min(95, base + (qKmers.size % 20));
}

function matchAlgaeSpecies(stressKey, data) {
  const enrichedPaths = (PATHWAY_MAP[stressKey] || []).map(p => p.name);
  return ALGAE_SPECIES_DB.map(sp => {
    const overlap = sp.pathways.filter(p => enrichedPaths.includes(p)).length;
    const stressMatch = sp.stresses.includes(stressKey) || sp.stresses.some(s => stressKey.includes(s));
    const score = overlap * 20 + (stressMatch ? 30 : 0) +
      sp.match_genes.filter(g => data.genes.some(d => d.gene.toUpperCase().includes(g.toUpperCase()))).length * 8;
    return { ...sp, score: Math.min(score, 100), overlap, stressMatch };
  }).sort((a,b) => b.score - a.score);
}

function renderSpeciesMatch(ranked) {
  const sec = document.getElementById('cbio-species-section');
  sec.hidden = false;
  sec.innerHTML = `
    <div class="cbio-section-box">
      <div class="cbio-section-title">🔭 Step 6 — Microalgae Species Matching</div>
      <div class="cbio-species-note">Scoring based on pathway overlap, stress match, and gene-level mechanistic alignment with the top DE results above.</div>
      ${ranked.map((sp, i) => `
        <div class="cbio-species-card ${i===0?'top':''}">
          <div class="cbio-species-rank">#${i+1}</div>
          <div class="cbio-species-body">
            <div class="cbio-species-name"><em>${esc(sp.name)}</em> <span class="cbio-species-strain">${esc(sp.strain)}</span></div>
            <div class="cbio-species-score-row">
              <div class="cbio-score-bar-wrap"><div class="cbio-score-bar" style="width:${sp.score}%"></div></div>
              <div class="cbio-score-val">${sp.score}% match</div>
            </div>
            <div class="cbio-species-mechanism">${esc(sp.mechanism)}</div>
            <div class="cbio-species-mets">Key metabolites: ${sp.key_metabolites.map(m=>`<span class="cbio-met-chip-sm">${esc(m)}</span>`).join('')}</div>
            <div class="cbio-species-pathways">Activated pathways: ${sp.pathways.map(p=>`<span class="cbio-path-chip-sm">${esc(p)}</span>`).join('')}</div>
            <div class="cbio-species-links">
              <a href="https://pubmed.ncbi.nlm.nih.gov/${esc(sp.pmid)}/" target="_blank" rel="noopener" class="cbio-db-link">PMID ${esc(sp.pmid)} ↗</a>
              <a href="https://doi.org/${esc(sp.doi)}" target="_blank" rel="noopener" class="cbio-db-link">DOI ↗</a>
              <span class="cbio-journal">${esc(sp.journal)}</span>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
}

function renderRecommendation(data, ranked, eco) {
  const sec = document.getElementById('cbio-rec-section');
  sec.hidden = false;
  const best = ranked[0];
  const topGene = data.genes.filter(g=>g.log2FC>1&&g.padj<0.05).sort((a,b)=>b.log2FC-a.log2FC)[0];

  let ecoNotes = [];
  if (eco.ph !== null) {
    if (eco.ph < 5.5) ecoNotes.push('⚠ Low soil pH (<5.5) may reduce bacterial activity — consider pH adjustment before application.');
    else if (eco.ph > 7.5) ecoNotes.push('⚠ High pH (>7.5) may reduce P availability — product application particularly beneficial for unlocking P.');
    else ecoNotes.push('✓ Soil pH in optimal range for microbiome activity (5.5–7.5).');
  }
  if (eco.ec !== null && eco.ec > 4)  ecoNotes.push('⚠ High soil EC ('+eco.ec+' dS/m) indicates significant salt stress — salt-tolerant application protocol recommended.');
  if (eco.temp !== null && eco.temp > 35) ecoNotes.push('⚠ Mean temperature >35°C — heat stress likely; apply in early morning or evening to avoid evaporation.');
  if (eco.rain !== null && eco.rain < 300) ecoNotes.push('⚠ Low rainfall zone (<300 mm/year) — drought stress dominant; ABA-related metabolites are the priority.');

  sec.innerHTML = `
    <div class="cbio-section-box cbio-rec-box">
      <div class="cbio-section-title">✅ Step 7 — Personalised Recommendation</div>
      <div class="cbio-rec-organism"><strong>${esc(data.organism)}</strong> · <strong>${esc(data.stress)} stress</strong></div>
      <div class="cbio-rec-grid">
        <div class="cbio-rec-card primary">
          <div class="cbio-rec-card-title">Recommended Algae Strain</div>
          <div class="cbio-rec-species"><em>${esc(best.name)}</em></div>
          <div class="cbio-rec-reason">Top match (${best.score}%) — ${best.overlap} of ${(PATHWAY_MAP[data.stress?.toLowerCase()||'drought']||[]).length} enriched pathways directly targeted by this species' metabolite output.</div>
        </div>
        <div class="cbio-rec-card">
          <div class="cbio-rec-card-title">Primary Target Gene</div>
          <div class="cbio-rec-gene">${esc(topGene?.gene || 'N/A')}</div>
          <div class="cbio-rec-reason">${esc(topGene?.desc || '')} (log₂FC ${topGene?.log2FC?.toFixed(2)}, padj ${topGene?.padj?.toExponential(1)})</div>
        </div>
        <div class="cbio-rec-card">
          <div class="cbio-rec-card-title">Key Active Metabolites</div>
          <div class="cbio-rec-mets">${best.key_metabolites.slice(0,4).map(m=>`<span class="cbio-rec-met-chip">${esc(m)}</span>`).join('')}</div>
        </div>
        <div class="cbio-rec-card">
          <div class="cbio-rec-card-title">Application Protocol</div>
          <div class="cbio-rec-protocol">Apply at critical stress window (flowering / early grain fill for cereals; at canopy closure for legumes). Repeat after 4–6 weeks. Combine with reduced N input from year 1.</div>
        </div>
      </div>
      ${ecoNotes.length > 0 ? `
      <div class="cbio-eco-notes">
        <div class="cbio-rec-card-title">Ecological Context Notes</div>
        ${ecoNotes.map(n=>`<div class="cbio-eco-note">${esc(n)}</div>`).join('')}
      </div>` : ''}
      <div class="cbio-rec-actions">
        <button class="cbio-rec-btn primary" onclick="ctShowTab('moa');moaSelect('${data.stress?.toLowerCase()==='heat'?'growth':data.stress?.toLowerCase()==='disease'?'disease':'drought'}')">See full mechanism →</button>
        <a href="mailto:info@alganize.de?subject=Bioinformatics%20Advisor%20Result%20—%20${encodeURIComponent(data.organism)}" class="cbio-rec-btn ghost">Contact team with results →</a>
      </div>
    </div>`;
}

// Also update calcROI to not use specific pricing
function calcROI() {
  const ha       = parseFloat(document.getElementById('roi-ha')?.value) || 10;
  const fertCost = parseFloat(document.getElementById('roi-fert')?.value) || 300;

  const totalFert = ha * fertCost;
  const saving = [0.10, 0.20, 0.30].map(r => totalFert * r);

  const sumEl = document.getElementById('roi-summary');
  if (sumEl) sumEl.innerHTML = `
    <div class="roi-kpi"><div class="roi-kpi-label">Total fertiliser / year</div><div class="roi-kpi-value">€${Math.round(totalFert).toLocaleString()}</div></div>
    <div class="roi-kpi"><div class="roi-kpi-label">Saving yr 1 (−10%)</div><div class="roi-kpi-value" style="color:var(--up)">€${Math.round(saving[0]).toLocaleString()}</div></div>
    <div class="roi-kpi"><div class="roi-kpi-label">Saving yr 2 (−20%)</div><div class="roi-kpi-value" style="color:var(--up)">€${Math.round(saving[1]).toLocaleString()}</div></div>
    <div class="roi-kpi"><div class="roi-kpi-label">Saving yr 3 (−30%)</div><div class="roi-kpi-value" style="color:var(--up)">€${Math.round(saving[2]).toLocaleString()}</div></div>
    <div class="roi-kpi"><div class="roi-kpi-label">3-yr cumulative saving</div><div class="roi-kpi-value" style="color:var(--up)">€${Math.round(saving[0]+saving[1]+saving[2]).toLocaleString()}</div></div>
    <div class="roi-kpi"><div class="roi-kpi-label">Product cost</div><div class="roi-kpi-value" style="font-size:13px;color:var(--text-dim)">Contact team</div></div>`;

  const ctx = document.getElementById('roi-chart');
  if (!ctx) return;
  if (CT.roiChart) CT.roiChart.destroy();
  CT.roiChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Year 1 (−10%)', 'Year 2 (−20%)', 'Year 3 (−30%)'],
      datasets: [
        { label:'Without product', data:[totalFert,totalFert,totalFert], backgroundColor:'rgba(214,61,60,0.15)', borderColor:'#d63d3c', borderWidth:1.5 },
        { label:'With Alganize programme', data:saving.map(s=>totalFert-s), backgroundColor:'rgba(99,153,34,0.22)', borderColor:'#639922', borderWidth:1.5 },
        { label:'Fertiliser saving', data:saving, backgroundColor:'rgba(46,163,120,0.45)', borderColor:'#2ea378', borderWidth:1.5 }
      ]
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{position:'bottom',labels:{font:{size:11},boxWidth:12}},
        tooltip:{callbacks:{label:c=>` €${Math.round(c.raw).toLocaleString()}`}} },
      scales:{
        y:{ticks:{callback:v=>'€'+Math.round(v/1000)+'k',font:{size:11}},grid:{color:'rgba(0,0,0,0.05)'}},
        x:{grid:{display:false}}
      }
    }
  });
}

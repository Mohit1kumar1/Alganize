const DOGMA_STRESSES = [
  {
    id: 'highlight', name: 'High Light', icon: '☀', bg: '#FFF0BC', text: '#6b4e00', group:'abiotic',
    description: 'Excess photon flux overwhelms the photosynthetic apparatus, generating reactive oxygen species (ROS) that damage PSII and the LHC. Microalgae respond by inducing secondary carotenogenesis — accumulating astaxanthin and β-carotene in lipid droplets as photoprotective "sunscreens".',
    genes: [
      { sym:'PSY',  name:'Phytoene synthase',          fc:8.2 },
      { sym:'PDS',  name:'Phytoene desaturase',         fc:5.1 },
      { sym:'BKT1', name:'β-Ketolase',                  fc:12.4 },
      { sym:'LCYB', name:'Lycopene β-cyclase',          fc:3.8 },
    ],
    enzymes: [
      { short:'PSY', name:'Phytoene Synthase', fn:'First committed enzyme in carotenoid biosynthesis — condenses two GGPP molecules to form phytoene, the colourless carotenoid precursor to all downstream pigments including β-carotene and astaxanthin.', uniprot:'P37217', pdbId:'4OPO' },
      { short:'PDS', name:'Phytoene Desaturase', fn:'Introduces the first two double bonds into phytoene, converting it to ζ-carotene via phytofluene. Uses plastoquinone as electron acceptor and is the target of several herbicides including norflurazon.', uniprot:'P49078', pdbId:'6OHR' },
      { short:'BKT1', name:'β-Ketolase (CrtS)', fn:'Introduces keto groups at the 4,4′-positions of β-carotene to produce canthaxanthin and ultimately astaxanthin. The key enzyme for secondary ketocarotenoid accumulation in Haematococcus and Chromochloris under high-light stress.', uniprot:'Q9LJF5', pdbId:'5ZY3' },
      { short:'LCYB', name:'Lycopene β-Cyclase', fn:'Cyclises both ends of lycopene to form β-carotene, a key branch-point enzyme that diverts flux from the linear carotenoid pathway towards the β,β-xanthophylls including zeaxanthin and astaxanthin.', uniprot:'P37217', pdbId:'4OPO' },
    ],
    protein: { name:'Phytoene Synthase (PSY)', fn:'First committed enzyme in carotenoid biosynthesis — condenses two GGPP molecules to form phytoene, the colourless carotenoid precursor to all downstream pigments including β-carotene and astaxanthin.', uniprot:'P37217', pdbId:'4OPO', src:'AlphaFold2 · At PSY (P37217)' },
    pathway: 'MEP/DOXP → GGPP → Phytoene → Lycopene → β-Carotene → Zeaxanthin → Astaxanthin',
    metabolite: { name:'Astaxanthin / β-Carotene', cid:5280895, desc:'The most potent natural antioxidant (singlet oxygen quenching ~500× stronger than Vit.E). Accumulates to 4–7% DW in Chromochloris zofingiensis under combined high-light and N-starvation, providing photoprotection and high commercial value.' },
    paper: {
      title: 'Chromochloris zofingiensis as an emerging model for carotenogenesis: Metabolic profiling under high-light and nitrogen-stress conditions',
      authors: 'Huang et al.',
      journal: 'The Plant Journal',
      year: 2020,
      pmid: '31721334',
      doi: '10.1111/tpj.14607',
      summary: 'Huang et al. used multi-omics profiling of Chromochloris zofingiensis under combined high-light and nitrogen starvation to map the full carotenoid biosynthesis pathway from MEP/DOXP to astaxanthin. They showed that PSY is the primary transcriptional bottleneck, with BKT1 expression correlating most strongly with astaxanthin accumulation. The study established C. zofingiensis as a tractable model for engineering high-value ketocarotenoid production in microalgae.'
    }
  },
  {
    id: 'salt', name: 'Salt Stress', icon: '≈', bg: '#CCDCE8', text: '#1e3a5f',
    description: 'High NaCl causes ion toxicity (Na⁺/K⁺ imbalance), osmotic dehydration, and secondary oxidative stress. Microalgae rapidly synthesise compatible solutes (proline, betaine) to rebalance osmotic potential, and upregulate ion transporters and antioxidant enzymes.',
    genes: [
      { sym:'P5CS',  name:'Pyrroline-5-carboxylate synthetase', fc:6.3 },
      { sym:'BADH',  name:'Betaine aldehyde dehydrogenase',      fc:4.2 },
      { sym:'SOS1',  name:'Na⁺/H⁺ antiporter (SOS pathway)',    fc:3.1 },
      { sym:'CAT',   name:'Catalase (ROS detox)',                fc:5.8 },
    ],
    enzymes: [
      { short:'P5CS', name:'Δ¹-Pyrroline-5-Carboxylate Synthetase', fn:'Bifunctional enzyme catalysing the first two steps of proline biosynthesis from glutamate (γ-glutamyl kinase + γ-glutamyl phosphate reductase activities). Rate-limiting enzyme for osmotic adjustment under salt/drought stress.', uniprot:'Q44445', pdbId:'2EKN' },
      { short:'P5CR', name:'Pyrroline-5-Carboxylate Reductase', fn:'Catalyses the final NADPH-dependent reduction of Δ¹-pyrroline-5-carboxylate to L-proline in the cytosol. Maintains the P5C/proline balance that also serves as a redox shuttle between organelle compartments during stress.', uniprot:'P32266', pdbId:'2GR2' },
      { short:'BADH', name:'Betaine Aldehyde Dehydrogenase', fn:'Oxidises betaine aldehyde to glycine betaine using NAD⁺ as co-factor. Together with choline monooxygenase (CMO), constitutes the two-step pathway for glycine betaine synthesis, a powerful compatible solute that stabilises PSII under salt stress.', uniprot:'P49249', pdbId:'1WNB' },
      { short:'SOS1', name:'Na⁺/H⁺ Antiporter (SOS1)', fn:'Plasma-membrane antiporter that extrudes Na⁺ from the cytosol in exchange for H⁺, driven by the electrochemical proton gradient. Activated by the SOS2–SOS3 kinase cascade; the primary Na⁺ detoxification system at the cell surface under salt stress.', uniprot:'Q9XEA8', pdbId:'7D3Y' },
    ],
    protein: { name:'P5CS (Δ¹-Pyrroline-5-carboxylate Synthetase)', fn:'Bifunctional enzyme catalysing the first two steps of proline biosynthesis from glutamate (γ-glutamyl kinase + γ-glutamyl phosphate reductase activities). Rate-limiting enzyme for osmotic adjustment under salt/drought stress.', uniprot:'Q44445', pdbId:'2EKN', src:'AlphaFold2 · At P5CS1 (Q44445)' },
    pathway: 'Glutamate → γ-Glutamyl-P → Glutamate-5-semialdehyde → Δ¹-Pyrroline-5-carboxylate → L-Proline',
    metabolite: { name:'L-Proline', cid:145742, desc:'Primary compatible solute under salt and osmotic stress. Stabilises protein tertiary structure, scavenges hydroxyl radicals, and acts as an osmotic buffer. Intracellular proline can increase 10–100-fold within hours of salt exposure.' },
    paper: {
      title: 'Reactive oxygen species and abscisic acid are key signalling molecules during salt stress in Arabidopsis and Solanum lycopersicum',
      authors: 'Ben Rejeb et al.',
      journal: 'Journal of Experimental Botany',
      year: 2014,
      pmid: '24687979',
      doi: '10.1093/jxb/eru044',
      summary: 'Ben Rejeb et al. demonstrated that ROS accumulation under salt stress activates ABA biosynthesis, which in turn induces P5CS1 and P5CS2 expression to drive proline accumulation as a compatible solute. The study established a direct ABA-ROS-proline signalling axis, showing that exogenous ABA could rescue salt-sensitive mutants deficient in proline synthesis. These findings underscore the central role of P5CS in coordinating osmotic adjustment under salinity stress in photosynthetic organisms.'
    }
  },
  {
    id: 'nitrogen', name: 'N-Starvation', icon: '↓N', bg: '#C8EECC', text: '#1b5e20',
    description: 'Nitrogen deficiency triggers global metabolic reprogramming: chloroplast dismantling, protein catabolism, and carbon redirection from the Calvin cycle into neutral lipid (TAG) and starch biosynthesis. N-starvation is the primary industrial strategy for high-value lipid production in microalgae.',
    genes: [
      { sym:'DGAT1',  name:'Diacylglycerol acyltransferase 1',   fc:9.1 },
      { sym:'DGAT2',  name:'Diacylglycerol acyltransferase 2',   fc:7.4 },
      { sym:'ACCase', name:'Acetyl-CoA carboxylase',             fc:4.8 },
      { sym:'LPAT',   name:'Lysophosphatidic acid acyltransferase', fc:3.5 },
    ],
    enzymes: [
      { short:'DGAT1', name:'Diacylglycerol Acyltransferase 1', fn:'Catalyses the final, committed step of TAG biosynthesis — acyl-CoA-dependent esterification of sn-1,2-diacylglycerol to form triacylglycerol. Membrane-associated enzyme embedded in the ER bilayer via multiple transmembrane helices.', uniprot:'O80937', pdbId:'6VYH' },
      { short:'ACCase', name:'Acetyl-CoA Carboxylase', fn:'Biotin-dependent enzyme catalysing the first committed step of de novo fatty acid synthesis — carboxylation of acetyl-CoA to malonyl-CoA. Under N-starvation, carbon flux through ACCase increases 3–5-fold as nitrogen-containing compounds are catabolised and carbon is redirected to fatty acids.', uniprot:'P27154', pdbId:'2YFX' },
      { short:'LPAT', name:'Lysophosphatidic Acid Acyltransferase', fn:'Acylates lysophosphatidic acid (LPA) at the sn-2 position to produce phosphatidic acid (PA), the key intermediate diverging to either phospholipids or TAG via dephosphorylation. Activity is upregulated under N-starvation to increase TAG flux.', uniprot:'Q9C748', pdbId:'5KYM' },
      { short:'DGAT2', name:'Diacylglycerol Acyltransferase 2', fn:'A distinct DGAT isoform with preference for polyunsaturated acyl-CoAs (EPA, DHA). Particularly abundant in microalgae and responsible for incorporating omega-3 PUFA into storage TAG under nutrient stress conditions.', uniprot:'Q9LDK4', pdbId:'7C2F' },
    ],
    protein: { name:'DGAT1 (Diacylglycerol Acyltransferase 1)', fn:'Catalyses the final, committed step of TAG biosynthesis — acyl-CoA-dependent esterification of sn-1,2-diacylglycerol to form triacylglycerol. Membrane-associated enzyme embedded in the ER bilayer via multiple transmembrane helices.', uniprot:'O80937', pdbId:'6VYH', src:'AlphaFold2 · At DGAT1 (O80937)' },
    pathway: 'Acetyl-CoA → Malonyl-ACP (ACCase) → Fatty acids (FAS) → Glycerol-3-P → PA → DAG → TAG (lipid droplets)',
    metabolite: { name:'Triacylglycerol (TAG) / ω-3 Fatty Acids', cid:5282283, desc:'Neutral lipids stored in cytoplasmic lipid bodies. Under N-starvation, TAG content exceeds 50% DW in Chromochloris zofingiensis. Rich in EPA and DHA (ω-3 PUFA) with high biotechnological and nutraceutical value.' },
    paper: {
      title: 'Nitrogen and phosphorus starvation induce triacylglycerol accumulation in Nannochloropsis sp. and Chlamydomonas reinhardtii',
      authors: 'Msanne et al.',
      journal: 'Phytochemistry',
      year: 2012,
      pmid: '22265705',
      doi: '10.1016/j.phytochem.2011.12.007',
      summary: 'Msanne et al. demonstrated that nitrogen starvation causes massive TAG accumulation in both Nannochloropsis sp. and Chlamydomonas reinhardtii, with DGAT1 and DGAT2 being the primary upregulated genes. The study showed that carbon redistribution from the Calvin cycle to de novo fatty acid synthesis is the central metabolic switch, driven by ACCase upregulation. Importantly, the authors identified that lipid droplet biogenesis involves specific DGAT isoforms with distinct substrate specificities for saturated versus polyunsaturated fatty acids.'
    }
  },
  {
    id: 'drought', name: 'Drought / Osmotic', icon: '◌', bg: '#FFE0D6', text: '#6b2211',
    description: 'Water deficit or PEG-induced osmotic stress triggers ABA biosynthesis and stomatal signalling. Microalgae-derived ABA acts as a potent biostimulant when applied to crops — directly activating stomatal closure, drought-tolerance genes (DREB, LEA, RD29), and root architecture changes.',
    genes: [
      { sym:'NCED3',  name:'9-cis-Epoxycarotenoid dioxygenase', fc:7.6 },
      { sym:'AAO3',   name:'Abscisic aldehyde oxidase',         fc:5.2 },
      { sym:'DREB1',  name:'Dehydration-responsive element binding', fc:4.9 },
      { sym:'LEA',    name:'Late embryogenesis abundant protein', fc:11.3 },
    ],
    enzymes: [
      { short:'NCED3', name:'9-cis-Epoxycarotenoid Dioxygenase 3', fn:'Rate-limiting enzyme in ABA biosynthesis — oxidative cleavage of 9-cis-violaxanthin or 9-cis-neoxanthin via a non-haem iron(II)/2-oxoglutarate-dependent dioxygenase mechanism to yield xanthoxin, the ABA precursor.', uniprot:'Q9LI99', pdbId:'3NPE' },
      { short:'AAO3', name:'Abscisic Aldehyde Oxidase 3', fn:'Molybdenum cofactor-containing oxidase that catalyses the final step of ABA biosynthesis — oxidation of abscisic aldehyde to abscisic acid. Localised in the cytosol; its activity is rapidly induced by drought within 30 minutes of water deficit onset.', uniprot:'Q9M7Q2', pdbId:'3ZXY' },
      { short:'ABA2', name:'Short-chain Dehydrogenase/Reductase (ABA2)', fn:'Converts xanthoxin (the NCED3 cleavage product) to abscisic aldehyde in the cytosol. A short-chain alcohol dehydrogenase/reductase (SDR) that operates between the plastidial NCED3 step and the cytosolic AAO3 step of ABA biosynthesis.', uniprot:'Q9CAP9', pdbId:'1O8T' },
      { short:'PYR1', name:'ABA Receptor PYR1 (RCAR11)', fn:'Cytosolic ABA receptor of the PYR/PYL/RCAR family. ABA binding promotes PYR1 dimerisation and interaction with PP2C phosphatases (ABI1/ABI2), inhibiting them and allowing SnRK2 kinase activation — the central ABA signalling cascade that controls stomatal closure and stress gene expression.', uniprot:'E5GCI3', pdbId:'3K90' },
    ],
    protein: { name:'NCED3 (9-cis-Epoxycarotenoid Dioxygenase)', fn:'Rate-limiting enzyme in ABA biosynthesis — oxidative cleavage of 9-cis-violaxanthin or 9-cis-neoxanthin via a non-haem iron(II)/2-oxoglutarate-dependent dioxygenase mechanism to yield xanthoxin, the ABA precursor.', uniprot:'Q9LI99', pdbId:'3NPE', src:'AlphaFold2 · At NCED3 (Q9LI99)' },
    pathway: '9-cis-Violaxanthin → Xanthoxin (NCED3) → Abscisic aldehyde (ABA2) → Abscisic Acid (ABA) (AAO3)',
    metabolite: { name:'Abscisic Acid (ABA)', cid:5280896, desc:'The master drought/stress phytohormone. Microalgae-derived ABA functions as a biostimulant — activating stomatal closure via guard cell ABA receptors (PYR/PYL), inducing LEA/dehydrin expression, and enhancing root-to-shoot signalling under water deficit.' },
    paper: {
      title: 'Molecular cloning and functional characterization of Arabidopsis thaliana NCED3, a key enzyme in ABA biosynthesis under drought',
      authors: 'Iuchi et al.',
      journal: 'The Plant Journal',
      year: 2001,
      pmid: '11553371',
      doi: '10.1046/j.1365-313x.2001.01122.x',
      summary: 'Iuchi et al. cloned and characterised NCED3 as the primary rate-limiting enzyme in drought-induced ABA biosynthesis in Arabidopsis. Overexpression of NCED3 elevated ABA levels 5-fold, enhanced drought tolerance, and reduced water loss via stomatal closure without a significant growth penalty. The study established NCED3 as the primary molecular switch connecting drought perception to ABA-mediated adaptive responses, making it a priority target for biotechnological improvement of crop drought tolerance.'
    }
  },
  {
    id: 'heat', name: 'Heat Stress', icon: '△T', bg: '#FFD4BC', text: '#7a3b1c',
    description: 'Supraoptimal temperature causes protein unfolding, membrane phase transitions, and disruption of the photosynthetic electron transport chain. Heat shock proteins (HSPs) act as ATP-dependent molecular chaperones to refold misfolded proteins and prevent fatal aggregation.',
    genes: [
      { sym:'HSP70',  name:'Heat shock protein 70 (chaperone)',  fc:15.2 },
      { sym:'HSP90',  name:'Heat shock protein 90',              fc:9.8 },
      { sym:'sHSP',   name:'Small heat shock protein (IbpA)',    fc:22.1 },
      { sym:'FAD',    name:'Fatty acid desaturase (membrane)',   fc:4.3 },
    ],
    enzymes: [
      { short:'HSP70', name:'Heat Shock Protein 70 (BiP/Hsc70)', fn:'ATP-dependent chaperone with two functional domains: an N-terminal ATPase domain and a C-terminal substrate-binding domain. Binds exposed hydrophobic segments of unfolded proteins, preventing aggregation, and uses ATP hydrolysis to drive iterative cycles of client binding and release.', uniprot:'P22953', pdbId:'2QXL' },
      { short:'HSP90', name:'Heat Shock Protein 90', fn:'Molecular chaperone that folds late-stage client proteins including kinases, transcription factors, and steroid hormone receptors. Works in concert with HSP70 via co-chaperone bridges (HOP/Sti1). Its ATPase cycle drives conformational changes that stabilise misfolded clients under heat stress.', uniprot:'P27162', pdbId:'2CG9' },
      { short:'sHSP', name:'Small Heat Shock Protein (Class I)', fn:'ATP-independent oligomeric chaperones (~12–43 kDa) that form large 12–24-mer assemblies. Act as holdases — binding misfolded proteins and preventing irreversible aggregation, then delivering them to the HSP70/HSP100 disaggregation machinery for refolding.', uniprot:'P19037', pdbId:'1GME' },
      { short:'HSF1', name:'Heat Shock Factor 1 (Transcription Factor)', fn:'Master transcriptional activator of the heat-stress response. Under normal conditions HSF1 is kept monomeric and inactive by HSP70/HSP90. Heat stress causes chaperone sequestration, HSF1 trimerisation, nuclear translocation, and binding to heat shock elements (HSEs) to drive HSP gene expression.', uniprot:'P41154', pdbId:'3G2V' },
    ],
    protein: { name:'HSP70 (Heat Shock Protein 70)', fn:'ATP-dependent chaperone with two functional domains: an N-terminal ATPase domain and a C-terminal substrate-binding domain. Binds exposed hydrophobic segments of unfolded proteins, preventing aggregation, and uses ATP hydrolysis to drive iterative cycles of client binding and release.', uniprot:'P22953', pdbId:'2QXL', src:'AlphaFold2 · At HSP70-1 (P22953)' },
    pathway: 'Heat stress → HSF1 activation → HSP70/90 expression → Chaperone binding → Protein refolding or UPS degradation',
    metabolite: { name:'Trehalose / Unsaturated Membrane Lipids', cid:7427, desc:'Trehalose vitrifies the cytoplasm and stabilises protein-lipid interfaces at heat-stress temperatures. Concurrently, fatty acid desaturases (FADs) increase membrane PUFA content to maintain bilayer fluidity and prevent lipid phase separation above the optimal growth temperature.' },
    paper: {
      title: 'HSP70 in Chlamydomonas reinhardtii: functions in protein quality control and temperature acclimation',
      authors: 'Schroda et al.',
      journal: 'Frontiers in Plant Science',
      year: 2015,
      pmid: '25954305',
      doi: '10.3389/fpls.2015.00247',
      summary: 'Schroda et al. reviewed the multi-functional roles of HSP70 family members in Chlamydomonas reinhardtii, demonstrating that chloroplast-localised HSP70B is essential for PSII repair under both heat and photoinhibitory stress. The study showed that HSP70 co-operates with co-chaperone CDJ2 (a J-domain protein) to disaggregate and reactivate denatured proteins in the pyrenoid and thylakoid compartments. Mutants depleted of HSP70B showed drastically reduced survival at 42°C, confirming the non-redundant role of algal HSP70 in heat tolerance.'
    }
  },
  {
    id: 'cold', name: 'Cold / Chilling', icon: '❄', bg: '#DDEEFF', text: '#1a3a6b', group:'abiotic',
    description: 'Sub-optimal temperatures cause membrane rigidification (reduced fluidity), inhibit enzyme kinetics, and impair photosynthetic electron transport. Microalgae respond by increasing polyunsaturated fatty acid (PUFA) content in membranes and inducing cold-responsive transcription factors (CBFs/DREBs).',
    genes: [
      { sym:'FAD7',  name:'ω-3 fatty acid desaturase 7',           fc:9.1 },
      { sym:'FAD8',  name:'ω-3 fatty acid desaturase 8 (cold)',    fc:11.4 },
      { sym:'CBF1',  name:'C-repeat binding factor 1 (DREB)',      fc:6.8 },
      { sym:'COR15A',name:'Cold-regulated protein 15A',            fc:8.9 },
      { sym:'KIN1',  name:'Cold-inducible kinase 1',               fc:5.2 },
    ],
    enzymes: [
      { short:'FAD8', name:'ω-3 Fatty Acid Desaturase 8 (Cold)', fn:'Chloroplast-localised membrane desaturase that introduces a double bond at the Δ15 (ω-3) position of linoleic acid (18:2) to produce α-linolenic acid (18:3). Cold-specific isoform; its expression is induced within hours of temperature downshift to restore membrane fluidity.', uniprot:'P46271', pdbId:'1AFR' },
      { short:'FAD7', name:'ω-3 Fatty Acid Desaturase 7', fn:'Chloroplastic Δ15-desaturase similar to FAD8 but constitutively expressed. Desaturates both monogalactosyldiacylglycerol (MGDG) and digalactosyldiacylglycerol (DGDG) in the thylakoid membrane, maintaining the high ALA content essential for optimal photosystem II performance at low temperatures.', uniprot:'P46867', pdbId:'1AFR' },
      { short:'CBF1', name:'C-Repeat Binding Factor 1 (DREB1B)', fn:'AP2-domain transcription factor that binds C-repeat/dehydration-responsive elements (CRT/DRE) in the promoters of cold-regulated (COR) genes. Induced within minutes of cold stress; activates >40 target genes including COR15A, KIN1, and LEA proteins that collectively enhance freezing tolerance.', uniprot:'O80375', pdbId:'1GW2' },
      { short:'COR15A', name:'Cold-Regulated Protein 15A', fn:'Chloroplast stroma-targeted protein that forms oligomers under freezing stress and protects the inner chloroplast envelope membrane from fusion/lamellar-to-hexagonal-II phase transitions, a primary cause of chilling injury. One of the most strongly induced cold-response proteins in Arabidopsis.', uniprot:'P31168', pdbId:'2LIG' },
    ],
    protein: { name:'FAD8 (ω-3 Fatty Acid Desaturase 8)', fn:'Chloroplast-localised membrane desaturase that introduces a double bond at the Δ15 (ω-3) position of linoleic acid (18:2) to produce α-linolenic acid (18:3). Cold-specific isoform; its expression is induced within hours of temperature downshift to restore membrane fluidity.', uniprot:'P46271', pdbId:'1AFR', src:'AlphaFold2 · At FAD8 (P46271)' },
    pathway: 'Linoleic acid (18:2 Δ9,12) → α-Linolenic acid (18:3 Δ9,12,15) → Membrane phospholipid remodelling → PUFA enrichment',
    metabolite: { name:'α-Linolenic Acid (ALA, ω-3)', cid:5280934, desc:'A C18 ω-3 polyunsaturated fatty acid that restores membrane fluidity at low temperatures. Also the precursor for jasmonic acid (JA) biosynthesis and a bioactive lipid mediator in plant stress signalling. Rich in cold-acclimated microalgae and valuable as a nutraceutical.' },
    paper: {
      title: 'The ω-3 desaturase gene FAD8 from Arabidopsis thaliana is cold-inducible',
      authors: 'Gibson et al.',
      journal: 'Plant Physiology',
      year: 1994,
      pmid: '8202384',
      doi: '10.1104/pp.106.4.1615',
      summary: 'Gibson et al. cloned and characterised the Arabidopsis FAD8 gene, demonstrating that it is specifically induced by cold temperature (4°C) but not by other abiotic stresses, distinguishing it from the constitutive FAD7 isoform. Promoter analysis identified a cold-responsive element upstream of the FAD8 coding sequence, and antisense suppression of FAD8 resulted in reduced α-linolenic acid content and impaired cold acclimation. The study established FAD8 as the cold-specific arm of chloroplast membrane PUFA remodelling in response to temperature downshift.'
    }
  },
  {
    id: 'uvb', name: 'UV-B Radiation', icon: '⚡', bg: '#EDE0FF', text: '#4a1a7a', group:'radiation',
    description: 'UV-B photons (280–315 nm) cause direct DNA damage (cyclobutane pyrimidine dimers, 6-4 photoproducts), generate ROS, and impair the D1 protein of PSII. Microalgae protect themselves by accumulating UV-absorbing mycosporine-like amino acids (MAAs) and inducing DNA photolyase repair enzymes.',
    genes: [
      { sym:'UVR8',  name:'UV-B receptor 8',                       fc:7.3 },
      { sym:'PHR1',  name:'Photolyase (CPD repair)',                fc:9.6 },
      { sym:'MysA',  name:'Mycosporine biosynthesis gene A',        fc:14.2 },
      { sym:'CHS',   name:'Chalcone synthase (flavonoid UV-screen)',fc:5.1 },
      { sym:'HY5',   name:'Elongated hypocotyl 5 (UV-B TF)',       fc:4.7 },
    ],
    enzymes: [
      { short:'UVR8', name:'UV-B Receptor 8', fn:'Homodimeric β-propeller protein that acts as the primary UV-B photoreceptor. UV-B photons are absorbed by tryptophan residues within the β-propeller, causing monomerisation and interaction with COP1/HY5 to activate UV-B gene expression. Unique as a protein-based (non-chromophore) photoreceptor.', uniprot:'Q9C5S3', pdbId:'4D9S' },
      { short:'PHR1', name:'Cyclobutane Pyrimidine Dimer Photolyase', fn:'Flavoprotein enzyme that uses visible light (310–500 nm) as energy source to catalyse direct reversal of UV-induced cyclobutane pyrimidine dimers (CPDs) in DNA. The photoexcited FADH⁻ cofactor transfers an electron to the CPD, splitting the C-C bonds and restoring canonical nucleotide pairs.', uniprot:'P49451', pdbId:'1DNP' },
      { short:'MysA', name:'Mycosporine Biosynthesis Gene A (Dehydroquinate Synthase-Like)', fn:'Catalyses the first committed step in mycosporine-like amino acid (MAA) biosynthesis via the shikimate pathway, condensing phosphoenolpyruvate with glycine or serine to form the cyclohexenone MAA core. Found in microalgae, cyanobacteria, and some fungi exposed to UV radiation.', uniprot:'A0A0E3TJ93', pdbId:'3LMH' },
      { short:'CHS', name:'Chalcone Synthase', fn:'Polyketide synthase that catalyses the first committed step of flavonoid biosynthesis — condensation of 4-coumaroyl-CoA with three malonyl-CoA units to form naringenin chalcone. Strongly induced by UV-B via HY5/MYB transcription factors; the upstream enzyme for all flavonoid UV-screens including quercetin.', uniprot:'P13114', pdbId:'1BI5' },
    ],
    protein: { name:'UVR8 (UV-B Receptor 8)', fn:'Homodimeric β-propeller protein that acts as the primary UV-B photoreceptor. UV-B photons are absorbed by tryptophan residues within the β-propeller, causing monomerisation and interaction with COP1/HY5 to activate UV-B gene expression. Unique as a protein-based (non-chromophore) photoreceptor.', uniprot:'Q9C5S3', pdbId:'4D9S', src:'AlphaFold2 · At UVR8 (Q9C5S3)' },
    pathway: 'UV-B → UVR8 monomerisation → COP1/HY5 interaction → MAA biosynthesis genes & photolyase expression → DNA repair + UV screen',
    metabolite: { name:'Shinorine (Mycosporine-Gly-Thr)', cid:5742040, desc:'The most abundant mycosporine-like amino acid (MAA) in microalgae. A water-soluble UV-absorbing compound (λmax ~334 nm) that acts as a "biological sunscreen" without generating ROS. Also has antioxidant, anti-inflammatory, and osmotic roles. High commercial interest as a natural UV-filter in sunscreens.' },
    paper: {
      title: 'The UVR8 UV-B photoreceptor: perception, signaling and response',
      authors: 'Tilbrook et al.',
      journal: 'The Plant Cell',
      year: 2013,
      pmid: '23525832',
      doi: '10.1105/tpc.112.107987',
      summary: 'Tilbrook et al. provided a comprehensive analysis of UVR8 photoreception, demonstrating through structural and biochemical studies that UV-B absorption by Trp285 and Trp233 drives homodimer dissociation into monomers that interact with COP1. Loss-of-function uvr8 mutants accumulated cyclobutane pyrimidine dimers and showed hypersensitivity to UV-B, confirming UVR8 as the non-redundant UV-B sensor. The study also revealed that RUP1/RUP2 repressors facilitate UVR8 redimerisation to re-attenuate UV-B signalling, establishing a complete photocycle for the UV-B response.'
    }
  },
  {
    id: 'metal', name: 'Heavy Metal', icon: 'Cd', bg: '#E8E4D8', text: '#3a2e10', group:'chemical',
    description: 'Heavy metals (Cd²⁺, Pb²⁺, Cu²⁺ excess, Hg²⁺) displace essential cofactors from metalloenzymes, generate ROS via Fenton-type reactions, and form toxic complexes with thiol groups. Microalgae detoxify by synthesising phytochelatins and metallothioneins that chelate and sequester metal ions.',
    genes: [
      { sym:'PCS1',  name:'Phytochelatin synthase 1',              fc:18.4 },
      { sym:'MT2',   name:'Metallothionein 2',                     fc:12.7 },
      { sym:'ABCC1', name:'ABC transporter (vacuolar sequestration)',fc:8.3 },
      { sym:'GSH1',  name:'γ-Glutamylcysteine synthetase',         fc:7.1 },
      { sym:'APX',   name:'Ascorbate peroxidase (ROS detox)',      fc:6.5 },
    ],
    enzymes: [
      { short:'PCS1', name:'Phytochelatin Synthase 1', fn:'Constitutively expressed but post-translationally activated by metal ions. A γ-glutamylcysteine dipeptidyl transpeptidase that polymerises glutathione (GSH) into phytochelatins ((γ-Glu-Cys)n-Gly, n=2–11). The Cys-rich phytochelatins coordinate metal ions via thiolate bonds, forming stable PC-metal complexes transported into the vacuole by ABCC transporters.', uniprot:'Q9FGX7', pdbId:'2BTW' },
      { short:'GSH1', name:'γ-Glutamylcysteine Synthetase (GSH1)', fn:'Rate-limiting enzyme for glutathione biosynthesis — catalyses γ-glutamylcysteine formation from glutamate and cysteine using ATP. Provides the GSH substrate for PCS1-mediated phytochelatin synthesis; its upregulation ensures sufficient glutathione supply for metal chelation under heavy-metal stress.', uniprot:'P46569', pdbId:'3LVN' },
      { short:'ABCC1', name:'ABC Transporter ABCC1 (MRP1)', fn:'ATP-binding cassette transporter in the vacuolar membrane that imports phytochelatin-metal complexes into the vacuole, effectively sequestering toxic metals away from the cytosol and metabolic enzymes. A key effector of the glutathione-phytochelatin-vacuolar detoxification pathway.', uniprot:'Q9XF89', pdbId:'5UJA' },
      { short:'MT2', name:'Metallothionein 2 (MT2A/MT2B)', fn:'Small, cysteine-rich protein that binds metal ions (Cd²⁺, Cu²⁺, Zn²⁺) via thiolate coordination in two metal-thiolate cluster domains. Unlike phytochelatins (enzymatically synthesised), metallothioneins are encoded gene products, providing a rapid transcriptional metal-detoxification response.', uniprot:'P29747', pdbId:'2MDJ' },
    ],
    protein: { name:'PCS1 (Phytochelatin Synthase 1)', fn:'Constitutively expressed but post-translationally activated by metal ions. A γ-glutamylcysteine dipeptidyl transpeptidase that polymerises glutathione (GSH) into phytochelatins ((γ-Glu-Cys)n-Gly, n=2–11). The Cys-rich phytochelatins coordinate metal ions via thiolate bonds, forming stable PC-metal complexes transported into the vacuole by ABCC transporters.', uniprot:'Q9FGX7', pdbId:'2BTW', src:'AlphaFold2 · At PCS1 (Q9FGX7)' },
    pathway: 'GSH (×n) + Cd²⁺/Pb²⁺ → PCS1 activation → Phytochelatins (PC2–PC11) → PC-Cd/Pb complexes → ABCC vacuolar sequestration',
    metabolite: { name:'Phytochelatin (γ-Glu-Cys)₂-Gly', cid:124886, desc:'Metal-binding thiol peptides synthesised from glutathione. PC₂ is the most common form; longer chains (PC₃–PC₆) form high-affinity complexes with Cd²⁺, As³⁺, Pb²⁺, and Hg²⁺. Algae that over-produce phytochelatins are candidates for phytoremediation of heavy metal-contaminated water and soils.' },
    paper: {
      title: 'Genetics of metal tolerance and accumulation in higher plants',
      authors: 'Clemens',
      journal: 'Biochimie',
      year: 2006,
      pmid: '16546312',
      doi: '10.1016/j.biochi.2006.01.009',
      summary: 'Clemens reviewed the molecular genetics of heavy-metal tolerance in plants and algae, with emphasis on the phytochelatin synthase (PCS)/glutathione detoxification pathway and its interconnection with metallothionein gene expression. The review highlighted that PCS1 is post-translationally activated by direct metal binding rather than transcriptional induction, and that the ABCC vacuolar transport step is required to prevent cytosolic re-equilibration of the PC-metal complex. The author also discussed natural variation in metal hyperaccumulator species as a model for engineering tolerance into crop plants and bioremediation organisms.'
    }
  },
  {
    id: 'co2', name: 'CO₂ Limitation', icon: 'CO₂', bg: '#E0F4E8', text: '#1b4a28', group:'chemical',
    description: 'When dissolved CO₂ falls below the Km of Rubisco, microalgae activate the Carbon Concentrating Mechanism (CCM) — a suite of carbonic anhydrases and inorganic carbon transporters that elevate CO₂ around Rubisco to near-saturating levels, maximising photosynthetic carbon fixation efficiency.',
    genes: [
      { sym:'CIA5',  name:'Carbon limitation-induced adaptor 5 (master TF)',fc:22.1 },
      { sym:'LCIB',  name:'CO₂/HCO₃⁻ concentrating protein B',    fc:18.5 },
      { sym:'CAH1',  name:'Periplasmic carbonic anhydrase 1',       fc:15.3 },
      { sym:'RBCA', name:'Rubisco activase',                        fc:4.8 },
      { sym:'SLC4',  name:'HCO₃⁻ transporter (plasma membrane)',   fc:9.2 },
    ],
    enzymes: [
      { short:'LCIB', name:'CO₂/HCO₃⁻ Concentrating Protein B', fn:'A chloroplast-localised protein essential for CO₂ concentrating mechanism in Chlamydomonas. Localises as a ring around the pyrenoid at limiting CO₂. May function as a CO₂-trapping carbonic anhydrase that converts escaping CO₂ back to HCO₃⁻, effectively creating a CO₂-enriched microenvironment around Rubisco.', uniprot:'A9I8F1', pdbId:'1RXO' },
      { short:'CAH1', name:'Periplasmic Carbonic Anhydrase 1', fn:'Periplasmic α-class carbonic anhydrase in Chlamydomonas that catalyses reversible CO₂/HCO₃⁻ interconversion at the cell surface. Under CO₂ limitation, CAH1 is massively induced and secreted to the periplasmic space where it converts ambient HCO₃⁻ to CO₂ for uptake by the CCM.', uniprot:'P20507', pdbId:'1QRE' },
      { short:'CIA5', name:'Carbon Limitation-Induced Adaptor 5 (CIA5/CCM1)', fn:'Master transcriptional regulator of the CCM response in Chlamydomonas reinhardtii. A Zn-finger transcription factor that activates over 150 genes under low-CO₂ conditions including LCIB, CAH1, CAH4, HCO₃⁻ transporters, and pyrenoid assembly factors. Loss of CIA5 abolishes inducible CCM expression.', uniprot:'A9I896', pdbId:'5FJD' },
      { short:'RBCL', name:'Rubisco Large Subunit (rbcL)', fn:'The catalytic large subunit of ribulose-1,5-bisphosphate carboxylase/oxygenase (Rubisco). Under CCM activation, elevated CO₂ concentration around Rubisco shifts its carboxylation:oxygenation ratio strongly towards CO₂ fixation, dramatically improving photosynthetic efficiency and reducing photorespiration.', uniprot:'P00878', pdbId:'1GK8' },
    ],
    protein: { name:'LCIB (CO₂/HCO₃⁻ Concentrating Protein B)', fn:'A chloroplast-localised protein essential for CO₂ concentrating mechanism in Chlamydomonas. Localises as a ring around the pyrenoid at limiting CO₂. May function as a CO₂-trapping carbonic anhydrase that converts escaping CO₂ back to HCO₃⁻, effectively creating a CO₂-enriched microenvironment around Rubisco.', uniprot:'A9I8F1', pdbId:'1RXO', src:'AlphaFold2 · Cr LCIB (A9I8F1)' },
    pathway: 'HCO₃⁻ (external) → CAH1 → CO₂ → LCIB ring at pyrenoid → CO₂ trapping → Rubisco (rbcL) → 3-PGA → Calvin cycle',
    metabolite: { name:'3-Phosphoglycerate (3-PGA)', cid:724, desc:'The first stable product of CO₂ fixation by Rubisco. Under CCM activation, elevated Rubisco efficiency increases 3-PGA flux, boosting overall carbon fixation rate 2–5×. The accumulated fixed carbon then flows into starch, fatty acid, and amino acid biosynthesis.' },
    paper: {
      title: 'The CO₂-concentrating mechanism and its regulation in Chlamydomonas reinhardtii',
      authors: 'Wang et al.',
      journal: 'The Plant Cell',
      year: 2015,
      pmid: '25634988',
      doi: '10.1105/tpc.114.131664',
      summary: 'Wang et al. elucidated the full CIA5-dependent regulatory network of the Chlamydomonas CCM through transcriptomic and ChIP-seq analysis, identifying over 150 CIA5 target genes with binding sites for the Zn-finger transcription factor. They demonstrated that LCIB localises dynamically to pyrenoid-surrounding rings under CO₂ limitation, and that lcib mutants are deficient in inorganic carbon concentration even under conditions where other CCM components are intact. The study provided the first genome-wide view of CCM gene regulation and identified novel pyrenoid components essential for CO₂ accumulation around Rubisco.'
    }
  },
  {
    id: 'oxidative', name: 'Oxidative Stress', icon: 'O₂', bg: '#FFECEC', text: '#7a0000', group:'chemical',
    description: 'Excess ROS (superoxide O₂·⁻, hydrogen peroxide H₂O₂, hydroxyl radicals ·OH) are generated as by-products of photosynthesis, respiration, and abiotic stresses. They damage DNA, proteins, and lipids via oxidation. Microalgae deploy a multi-tier antioxidant enzyme network to scavenge ROS and restore redox homeostasis.',
    genes: [
      { sym:'SOD',   name:'Superoxide dismutase (O₂·⁻ → H₂O₂)',   fc:11.3 },
      { sym:'CAT',   name:'Catalase (H₂O₂ → H₂O + O₂)',           fc:8.7 },
      { sym:'APX',   name:'Ascorbate peroxidase',                   fc:9.2 },
      { sym:'GR',    name:'Glutathione reductase',                  fc:6.4 },
      { sym:'Prx',   name:'Peroxiredoxin (thioredoxin-coupled)',    fc:10.1 },
    ],
    enzymes: [
      { short:'SOD', name:'Cu/Zn-Superoxide Dismutase (CSD1)', fn:'First-line antioxidant enzyme that catalyses the dismutation of superoxide radical (O₂·⁻) to H₂O₂ and O₂ with a rate constant near the diffusion limit (2×10⁹ M⁻¹s⁻¹). Chloroplastic (FeSOD), cytosolic (Cu/ZnSOD), and mitochondrial (MnSOD) isoforms cover all ROS-generating compartments.', uniprot:'P25794', pdbId:'1SPD' },
      { short:'APX', name:'Ascorbate Peroxidase (Cytosolic)', fn:'Class-I haem peroxidase that reduces H₂O₂ to water using ascorbate as the electron donor. Central enzyme of the ascorbate-glutathione (Halliwell-Asada) cycle; operates in concert with MDAR, DHAR, and GR to regenerate ascorbate from dehydroascorbate, forming a complete antioxidant cycle.', uniprot:'P48534', pdbId:'1OAF' },
      { short:'CAT', name:'Catalase (CAT2)', fn:'Haem-containing enzyme that disproportionates H₂O₂ to water and molecular oxygen without consuming reducing equivalents. Most abundant in peroxisomes where H₂O₂ from β-oxidation and photorespiration is generated. Rate constant 10⁷ M⁻¹s⁻¹ makes it one of the fastest enzymes known.', uniprot:'P25819', pdbId:'1SY7' },
      { short:'GR', name:'Glutathione Reductase', fn:'NADPH-dependent flavoenzyme that reduces oxidised glutathione (GSSG) back to reduced GSH, regenerating the major cellular thiol buffer. Maintains the high GSH/GSSG ratio essential for peroxidase reactions, protein glutathionylation/deglutathionylation, and phytochelatin synthesis under oxidative stress.', uniprot:'P42770', pdbId:'1GR2' },
    ],
    protein: { name:'Cu/Zn-SOD (Superoxide Dismutase)', fn:'First-line antioxidant enzyme that catalyses the dismutation of superoxide radical (O₂·⁻) to H₂O₂ and O₂ with a rate constant near the diffusion limit (2×10⁹ M⁻¹s⁻¹). Chloroplastic (FeSOD), cytosolic (Cu/ZnSOD), and mitochondrial (MnSOD) isoforms cover all ROS-generating compartments.', uniprot:'P25794', pdbId:'1SPD', src:'AlphaFold2 · At CSD1/SOD1 (P25794)' },
    pathway: 'O₂·⁻ → SOD → H₂O₂ → CAT/APX → H₂O | GSH–GSSG cycle (GR/GPX) | Thioredoxin–Peroxiredoxin cascade',
    metabolite: { name:'Ascorbate (Vitamin C)', cid:54670067, desc:'The most abundant antioxidant in photosynthetic organisms, reaching millimolar concentrations in chloroplasts. Acts as the electron donor for APX (H₂O₂ detox), as a co-factor for violaxanthin de-epoxidase (xanthophyll cycle), and as a direct ROS quencher. Microalgae-derived ascorbate is also a high-value nutraceutical.' },
    paper: {
      title: 'Oxidative stress and the molecular biology of antioxidant defenses',
      authors: 'Mittler',
      journal: 'Trends in Plant Science',
      year: 2002,
      pmid: '12167376',
      doi: '10.1016/S1360-1385(02)02312-9',
      summary: 'Mittler reviewed the molecular biology of the plant antioxidant defense network, demonstrating through genetic and biochemical evidence that SOD, CAT, and APX function in a hierarchical and spatially compartmentalised ROS scavenging cascade. The review introduced the concept of the ROS gene network — over 150 genes in Arabidopsis encoding ROS-producing and ROS-scavenging enzymes — whose co-ordinate expression determines cellular redox homeostasis under abiotic stress. Crucially, the author showed that transgenic overexpression of individual antioxidant enzymes (especially SOD + APX combinations) confers enhanced abiotic stress tolerance, validating the pathway as a biotechnological target.'
    }
  }
];

const METMAP_DATA = { categories: [
  { id:'phytohormone', name:'Phytohormone', color:'#FFD4BC', textColor:'#7a3b1c',
    description:'Plant growth hormones synthesised by microalgae that regulate root growth, shoot elongation, cell division, stress responses, and fruit development in target plants.',
    functions:['Root and shoot elongation','Cell division and tissue expansion','Stress signal transduction','Stomatal regulation and aperture control','Fruit ripening and seed germination'],
    metabolites:[
      { name:'Auxin', aliases:['IAA','IBA','IAM'], description:'The primary plant growth hormone, promoting cell elongation, lateral root formation, and phototropism. IAA (indole-3-acetic acid) is the most abundant form secreted by microalgae.', pubchem:802, kegg:'C00153', query:'microalgae auxin IAA plant growth biostimulant' },
      { name:'Cytokinin', aliases:['Trans-zeatin','Zeatin riboside','Isopentenyl adenine'], description:'Adenine-derived hormones that promote cell division, delay leaf senescence, and stimulate shoot organogenesis. Trans-zeatin is the most biologically active natural cytokinin.', pubchem:5735, kegg:'C00173', query:'microalgae cytokinin zeatin plant biostimulant' },
      { name:'Abscisic Acid', aliases:['ABA'], description:'A terpenoid stress hormone that induces stomatal closure during drought, promotes seed dormancy, and mediates tolerance to multiple abiotic stresses including salinity and cold.', pubchem:5280896, kegg:'C06082', query:'microalgae abscisic acid ABA drought stress tolerance' },
      { name:'Gibberellins', aliases:['GA3','GA7'], description:'Diterpenoid hormones that stimulate stem elongation, promote seed germination, and induce flowering. GA3 (gibberellic acid) is the most commercially important form produced by microalgae.', pubchem:107689, kegg:'C01699', query:'microalgae gibberellin GA3 plant growth elongation' },
      { name:'Ethylene', aliases:['ACC'], description:'A gaseous hormone involved in fruit ripening, leaf abscission, and stress responses. Microalgae produce ACC (1-aminocyclopropane-1-carboxylic acid), the direct ethylene precursor.', pubchem:6325, kegg:'C01234', query:'microalgae ethylene ACC plant hormone stress' }
    ]
  },
  { id:'signalling', name:'Signalling Molecule', color:'#CCDCE8', textColor:'#1e3a5f',
    description:'Bioactive signal compounds from microalgae that prime plant immune and stress-response systems, enhance systemic acquired resistance, and act as compatible solute protectants.',
    functions:['Systemic acquired resistance (SAR) induction','Osmotic stress protection via compatible solutes','ROS signalling cascade activation','Polyamine-mediated growth regulation','Defense gene transcriptional reprogramming'],
    metabolites:[
      { name:'Brassinosteroids', aliases:['Brassinolide','Castasterone'], description:'Steroidal plant hormones that regulate cell elongation, vascular differentiation, and stress tolerance via the BRI1 receptor-kinase signalling cascade.', pubchem:6436823, kegg:'C09734', query:'microalgae brassinosteroid brassinolide plant growth stress tolerance' },
      { name:'Jasmonic Acid', aliases:['JA','Jasmonate'], description:'A lipid-derived signal molecule critical for defense against herbivores and pathogens, as well as abiotic stress responses including wound, UV, and drought signalling.', pubchem:5281944, kegg:'C08491', query:'microalgae jasmonic acid JA defense stress response' },
      { name:'Salicylic Acid', aliases:['SA'], description:'A phenolic signal molecule central to systemic acquired resistance. It activates pathogenesis-related (PR) proteins and NPR1-mediated transcriptional reprogramming of defense genes.', pubchem:338, kegg:'C00805', query:'microalgae salicylic acid SA plant immunity SAR' },
      { name:'Betaine & Proline', aliases:['betaine','proline','compatible solutes'], description:'Compatible solutes that accumulate under osmotic stress to stabilize proteins and membranes. Proline also acts as a ROS scavenger and nitrogen reservoir under drought stress.', pubchem:247, kegg:'C00148', query:'microalgae proline betaine osmolyte abiotic stress tolerance' },
      { name:'Polyamines', aliases:['Putrescine','Spermine','Spermidine'], description:'Polycationic aliphatic amines that bind nucleic acids and membranes, regulating cell growth, stress tolerance, and ion channel activity under osmotic and heavy-metal stress.', pubchem:1045, kegg:'C00134', query:'microalgae polyamine putrescine spermine stress response' }
    ]
  },
  { id:'antioxidants', name:'Antioxidants / Micronutrient', color:'#FFF0BC', textColor:'#6b4e00',
    description:'Microalgae-derived antioxidant compounds and micronutrients that scavenge reactive oxygen species, protect photosystems from excess light, and support enzymatic defense in plants.',
    functions:['ROS scavenging and oxidative stress protection','Photosystem II and LHC protection','Antioxidant enzyme co-factor supply','UV-B radiation screening','Essential micronutrient supplementation'],
    metabolites:[
      { name:'Carotenoids', aliases:['β-carotene','Lutein','Astaxanthin'], description:'Isoprenoid pigments with strong antioxidant activity. β-carotene quenches singlet oxygen and protects the photosystems from excess light damage. Lutein is a key structural xanthophyll in the light-harvesting complex.', pubchem:5280489, kegg:'C02094', query:'microalgae carotenoid beta-carotene lutein antioxidant biosynthesis' },
      { name:'Vitamins', aliases:['Vit.C','B12','B3','B5'], description:'Essential water-soluble micronutrients. Vitamin C (ascorbate) is a major ROS scavenger; B12 (cobalamin), B3 (niacin), and B5 (pantothenate) serve as enzyme co-factors in plant metabolic pathways.', pubchem:54670067, kegg:'C00072', query:'microalgae vitamins cobalamin ascorbate B12 biosynthesis plant' },
      { name:'Minerals', aliases:['Fe','Zn','Mn','Mg'], description:'Essential inorganic micronutrients including Fe (enzyme cofactor, chlorophyll precursor), Zn (zinc-finger transcription factors), Mn (SOD cofactor), and Mg (chlorophyll center) supporting plant metabolism.', pubchem:null, kegg:null, query:'microalgae minerals trace elements plant nutrition biostimulant' }
    ]
  },
  { id:'polyphenols', name:'Polyphenols', color:'#C8EECC', textColor:'#1b5e20',
    description:'Aromatic secondary metabolites with multiple hydroxyl groups, providing antioxidant protection, UV absorption, and signalling functions in both microalgae and the plants they treat.',
    functions:['Non-enzymatic antioxidant defense','UV-B radiation screening and absorption','Heavy metal chelation','Anti-inflammatory signalling','Antimicrobial and antifungal activity'],
    metabolites:[
      { name:'Phenolic Acids', aliases:['Caffeic acid','Ferulic acid','p-Coumaric acid'], description:'Hydroxycinnamic and hydroxybenzoic acids that act as antioxidants, enzyme activators, and signalling molecules. They enhance plant secondary metabolite production under abiotic stress conditions.', pubchem:994, kegg:'C00180', query:'microalgae phenolic acid ferulic caffeic antioxidant secondary metabolite' },
      { name:'Flavonoids', aliases:['Quercetin','Kaempferol'], description:'Polyphenolic C6–C3–C6 compounds that absorb UV light, scavenge ROS, and modulate auxin transport. Key roles in plant pigmentation, UV defense, and pathogen resistance.', pubchem:72281, kegg:'C01514', query:'microalgae flavonoid quercetin kaempferol antioxidant UV stress' }
    ]
  },
  { id:'polysaccharide', name:'Polysaccharide', color:'#FFF9C4', textColor:'#6b5900',
    description:'Complex carbohydrates secreted by microalgae that improve soil structure, trigger plant immune priming via DAMP signalling, and enhance nutrient and water uptake in the rhizosphere.',
    functions:['Soil aggregate stabilization','Water retention in the rhizosphere','Plant innate immunity priming (DAMP)','Biofilm formation and maintenance','Beneficial microbial community support'],
    metabolites:[
      { name:'EPS', aliases:['Exopolysaccharides'], description:'Extracellular polysaccharides secreted by microalgae that form a hydrated protective matrix. In soil, EPS improve aggregate stability, water retention, and support beneficial rhizosphere microbiomes.', pubchem:null, kegg:null, query:'microalgae exopolysaccharide EPS soil biostimulant rhizosphere' },
      { name:'β-glucan', aliases:['Beta-glucan','(1,3)-β-D-glucan'], description:'Linear glucose polymers linked by β-1,3 or β-1,3/1,6 bonds. In plants, β-glucans act as damage-associated molecular patterns (DAMPs) that prime innate immune defense responses.', pubchem:69581580, kegg:'C00965', query:'microalgae beta-glucan plant immunity DAMP priming defense' }
    ]
  },
  { id:'macromolecule', name:'Other Macromolecule', color:'#FFE0D6', textColor:'#6b2211',
    description:'High-molecular-weight biomolecules from microalgae biomass providing structural building blocks, photoprotective pigments, and bioactive compounds for plant nutrition and stress tolerance.',
    functions:['Nitrogen supplementation via peptide hydrolysates','Membrane stabilization under thermal stress','Stress-response enzyme activation','Photoprotective and antioxidant pigmentation','Brassinosteroid pathway modulation'],
    metabolites:[
      { name:'Protein', aliases:['Peptides','Amino acids'], description:'Microalgae are 40–70% protein by dry weight. Hydrolysed peptide fractions stimulate plant growth, activate nitrogen metabolism enzymes, and enhance stress-response enzyme activities.', pubchem:null, kegg:null, query:'microalgae protein peptide hydrolysate plant biostimulant growth' },
      { name:'Phycocyanin', aliases:['C-phycocyanin','Phycobiliprotein'], description:'A blue phycobiliprotein pigment from cyanobacteria and Rhodophyta with strong antioxidant and anti-inflammatory properties. Its chromophore (phycocyanobilin) efficiently absorbs red light.', pubchem:null, kegg:'C20298', query:'phycocyanin microalgae antioxidant anti-inflammatory biostimulant' },
      { name:'Lipids', aliases:['Omega-3','EPA','DHA','PUFA'], description:'Microalgae are rich in EPA, DHA, and ARA — polyunsaturated fatty acids (PUFA) that enhance plant membrane fluidity under chilling stress and serve as precursors for jasmonate biosynthesis.', pubchem:null, kegg:null, query:'microalgae lipid fatty acid PUFA EPA DHA plant stress membrane' },
      { name:'Terpenoids', aliases:['Isoprenoids','Terpenes','Sterols'], description:'A large class of isoprenoid compounds including carotenoids, sterols, and volatile terpenes that play roles in photosynthesis, membrane structure, and hormonal signalling in plants.', pubchem:null, kegg:null, query:'microalgae terpenoids isoprenoids terpene biosynthesis stress response' },
      { name:'Phytosterols', aliases:['Ergosterol','Sitosterol','Stigmasterol'], description:'Plant-like sterols in microalgae membranes that stabilize lipid bilayers under thermal stress and can modulate brassinosteroid signalling pathways in treated plants.', pubchem:null, kegg:null, query:'microalgae phytosterol ergosterol sitosterol brassinosteroid membrane' }
    ]
  }
]};

import pandas as pd
import io
import re

# TSV content from the user
df = pd.read_csv("gene_annotations_clean.tsv", sep="\t")


# Pathway keyword mapping: (keyword_patterns) -> Pathway_label
# Ordered from most-specific to more-general so the first match wins
PATHWAY_RULES = [

    # ── HIGH-PRIORITY: Specific named compounds ────────────────────────────────

    # Protein methylation — must precede amino acid Arginine rule
    (r'\barginine.methyltransferase\b|\bprotein.methyltransferase\b'
     r'|\bPRMT\b|\bhistone.methyltransferase\b|\bSET.domain\b'
     r'|\bPRMT[0-9]+\b|\btype [IV]+ protein arginine methyltransferase\b'
     r'|\bhistone-lysine N-methyltransferase\b|\bhistone.lysine.methyltransfer\w+\b'
     r'|\blysine.methyltransferase\b|\bN-methyltransferase\b'
     r'|\bSET.domain.contain\w+\b|\bASHR\w*\b|\bATX[0-9]+\b'
     r'|\bSETD\w*\b|\bNSD\w*\b|\bEZH\w*\b|\bSUVH\w*\b|\bEZA\w*\b',
                                                                    'Protein_Methylation'),

    # Glutathione — must precede amino acid Glutamate/Alanine rules
    (r'\bglutathione\b|\bGSH\b|\bglutathione.transferase\b|\bGST\b(?!\w)'
     r'|\bgamma.glutamyl\b|\bgamma.glutamyltransferase\b|\bGGT\b(?!\w)'
     r'|\bgamma.glutamyl.hydrolase\b|\bglutamyl.transpeptidase\b'
     r'|\bglutathione.reductase\b|\bglutathione.peroxidase\b'
     r'|\bglutathione.S-transferase\b|\bGPX\b|\bGST[A-Z]\w*\b'
     r'|\bDHAR\w*\b|\bglutathione.synthase\b|\bglutathione.gamma-glutamyl\w*\b'
     r'|\bphytochelatin.synthase\b|\bglutathionase\b',              'Glutathione_Metabolism'),

    # ── Amino Acids & Derivatives ─────────────────────────────────────────────
    (r'\bprol\w*\b|\bpyrrolidine\b|\bpyrroline-5-carboxylate\b'
     r'|\bP5CR\b|\bprolyl.4.hydroxylase\b|\bprolyl.aminopeptidase\b',
                                                                    'Proline'),

    # Glycine Betaine — must come BEFORE generic Glycine rule
    (r'\bglycine[\s\-]betaine\b|\bbetaine[\s\-]aldehyde\b|\bbetaine\b'
     r'|\bcholine\b|\bcholine.dehydrogenase\b|\bcholine.oxidase\b'
     r'|\bBADH\b|\bCMO\b|\bcholine.transporter\b|\bcholine.kinase\b'
     r'|\bphosphomethylethanolamine\b|\bphosphorylcholine\b'
     r'|\bethanolamine.kinase\b|\bethanol.amine.phosphotransferase\b',
                                                                    'Glycine_Betaine'),

    # ── Carotenoids ───────────────────────────────────────────────────────────
    (r'\bastaxanthin\b|\bketolutein\b|\bcanthaxanthin\b',           'Astaxanthin'),
    (r'\bzeaxanthin\b|\bzeaxanthin.epoxidase\b|\bZEP\b|\bviolaxanthin.de-epoxidase\b'
     r'|\bVDE\b|\bNPQ1\b',                                         'Zeaxanthin'),
    (r'\blutein\b|\blutein.biosynthesis\b|\bLUT[0-9]+\b'
     r'|\bcytochrome P450.97\b|\bCYP97\b|\bbeta-ring.hydroxylase\b'
     r'|\bcarotene.epsilon-monooxygenase\b|\bcaotene.3.hydroxylase\b',
                                                                    'Lutein'),
    (r'\bbeta.carotene\b|\bβ.carotene\b|\blycopene.cyclase\b'
     r'|\bcarotene.desaturase\b|\bPDS\b|\bZDS\b|\bCRTISO\b'
     r'|\bphytoene.desaturase\b|\bphytoene.synthase\b'
     r'|\b15-cis-phytoene.desaturase\b|\bphytoene.desatur\w+\b'
     r'|\blycopene.beta.cyclase\b|\bcrtL\b|\bcrtY\b|\blcyB\b'
     r'|\blycopene.beta/epsilon.cyclase\b|\bphytoene.desaturase\b',
                                                                    'Beta_Carotene'),
    (r'\bcarotenoid\b|\bxanthophyll\b|\blycopene\b'
     r'|\bviolaxanthin\b|\bneoxanthin\b|\bcaroten\w+\b'
     r'|\bcarotenoid.cleavage.dioxygenase\b|\bCCD[0-9]+\b'
     r'|\bneoxanthin.synthase\b|\bprolycopene.isomerase\b|\bcrtISO\b'
     r'|\bzeta-carotene.isomerase\b|\bzeta-carotene.desaturase\b'
     r'|\bpheophorbide.a.oxygenase\b|\bPAO\b|\bACD1\b'
     r'|\bchlorophyllase\b|\bpheophytinase\b|\bchlorophyll\w*.b.reductase\b'
     r'|\bmagnesium.dechelatase\b',                                 'Carotenoid'),

    # ── Omega / PUFA ──────────────────────────────────────────────────────────
    (r'\beicosapentaenoic\b|\bEPA\b|\b20:5\b|\bc20:5\b'
     r'|\bdelta.5.desaturase\b|\bD5D\b',                           'EPA_Eicosapentaenoic_Acid'),
    (r'\bdocosahexaenoic\b|\bDHA\b|\b22:6\b|\bc22:6\b'
     r'|\bdelta.4.desaturase\b|\bD4D\b',                           'DHA_Docosahexaenoic_Acid'),
    (r'\bomega.3\b|\bn.3.fatty\b|\bALA\b|\balpha.linolenic\b'
     r'|\blinolenic\b|\bdesaturase\b|\bFAD[2-9]\b'
     r'|\bacyl-lipid.omega-6.desaturase\b|\bacyl-lipid.omega-3.desaturase\b'
     r'|\bpalmitoyl.*glycerolipid.*desaturase\b|\bsn-2.acyl-lipid.omega-3\b',
                                                                    'Omega3_Fatty_Acid'),
    (r'\bomega.6\b|\bn.6.fatty\b|\blinoleic\b|\barachidonic\b'
     r'|\bstearoyl-CoA.desaturase\b|\bstearoyl.*acyl-carrier.*desaturase\b'
     r'|\bacyl-CoA.*desaturase\b|\bsphingolipid.*desaturase\b',    'Omega6_Fatty_Acid'),

    # ── Vitamins ──────────────────────────────────────────────────────────────
    (r'\btocopherol\b|\btocotrienol\b|\bVitamin.E\b|\bvit\.?\s*E\b'
     r'|\balpha.tocopherol\b|\bHPPD\b|\bVTE[0-9A-Z]\b'
     r'|\bhomogentisate\b|\bphytyl.diphosphate\b'
     r'|\btocopherol.O-methyltransferase\b|\btocopherol.cyclase\b'
     r'|\bhomogentisate.phytyltransferase\b|\bhomogentisate.solanesyltransferase\b'
     r'|\bMPBQ\b|\bMSBQ\b|\bVTE6\b|\bphytol.kinase\b'
     r'|\bgeranylgeranyl.reductase\b|\bGGR\b',                     'Vitamin_E_Tocopherol'),
    (r'\bVitamin.C\b|\bascorbate\b|\bascorbic.acid\b|\bL.ascorbic\b'
     r'|\bGulonolactone\b|\bAPX\b|\bL-ascorbate.peroxidase\b'
     r'|\bL-galactonolactone.dehydrogenase\b|\bL-galactose.1-dehydrogenase\b'
     r'|\bmonodehydroascorbate.reductase\b|\bL-galactose.1-phosphate\b',
                                                                    'Vitamin_C_Ascorbate'),
    (r'\bVitamin.B1\b|\bthiamine\b|\bthiamin\b'
     r'|\bthiamine.phosphate.synthase\b|\bthiamine.thiazole.synthase\b'
     r'|\bTHI[14]\b|\bthiamine.pyrophosphokinase\b|\bTPK\b'
     r'|\bhydroxyethylthiazole.kinase\b|\bhomothiamine\b',         'Vitamin_B1_Thiamine'),
    (r'\bVitamin.B2\b|\briboflavin\b|\bFAD\b|\bFMN\b'
     r'|\briboflavin.kinase\b|\bFAD.synthase\b|\bRFK\b'
     r'|\bmonofunctional.riboflavin.biosynthesis\b|\bRIBA\b'
     r'|\bDHBP.synthase\b|\blumazine.synthase\b|\briboflavin.biosynthesis\b',
                                                                    'Vitamin_B2_Riboflavin'),
    (r'\bVitamin.B6\b|\bpyridoxal\b|\bpyridoxine\b|\bpyridoxamine\b'
     r'|\bpyridoxal.kinase\b|\bpyridoxal.phosphate.synthase\b'
     r'|\bPLP.synthase\b|\bSNZ\w*\b|\bpyridoxamine.phosphate.oxidase\b',
                                                                    'Vitamin_B6_Pyridoxine'),
    (r'\bVitamin.B12\b|\bcobalamin\b',                             'Vitamin_B12_Cobalamin'),
    (r'\bfolate\b|\bfolic.acid\b|\btetrahydrofolate\b|\bTHF\b'
     r'|\bdihydrofolate\b|\bDHFR\b|\bfolylpolyglutamate.synthase\b'
     r'|\bdihydrofolate.synthase\b|\bfolate.receptor\b'
     r'|\bmethylenetetrahydrofolate\b|\bformate-tetrahydrofolate.ligase\b'
     r'|\bfolate.biopterin.transporter\b|\bdihydropteroate.synthase\b'
     r'|\baminocarboxypropyl\w+\b|\bformyltetrahydrofolate\b'
     r'|\bgluamate.formimidoyltransferase\b|\b5-formyltetrahydrofolate\b',
                                                                    'Folate'),
    (r'\bbiotin\b|\bbiotin.synthase\b|\bbioB\b|\bbiotin.carboxylase\b'
     r'|\bBPL\b|\bbiotin.carboxyl.carrier\b|\bBCCP\b'
     r'|\badenylyltransferase.*biotin\b|\bbiotin.protein.ligase\b',
                                                                    'Biotin'),
    (r'\bniacin\b|\bnicotinamide\b|\bNAD.biosynthesis\b'
     r'|\bnicotinate.nucleotide\b|\bquinolinate\b|\bQPRT\b'
     r'|\bNAD.synthase\b|\bnicotinate.nucleotide.adenylyltransferase\b'
     r'|\bNAD.diphosphatase\b|\bNMNAT\b',                          'Niacin_Nicotinamide'),
    (r'\bpantothenate\b|\bpantothenic.acid\b|\bCoA.synthase\b'
     r'|\bdephospho-CoA.kinase\b|\bphosphopantothenate\b|\bPPAT\b'
     r'|\bketopantoate\b|\bpantoate-beta-alanine\b',               'Pantothenate_CoA'),
    (r'\bubiquinone\b|\bubiquinol\b|\bCoQ\b|\bCOQ[0-9]+\b'
     r'|\bpolyprenyl.hydroxybenzoate\b|\bcoenzyme.Q\b'
     r'|\bUBIB\b|\bUBIE\b|\bdemethylubiquinol\b',                  'Ubiquinone_Biosynthesis'),

    # ── Phytohormones ─────────────────────────────────────────────────────────
    (r'\bgibberellin\b|\bGibberellic.Acid\b|\bGA[_\-]?3\b|\bGA3\b'
     r'|\bGA[0-9]+\b|\bgibberell\w+\b|\bent.kaurene\b'
     r'|\bGA.20.oxidase\b|\bGA.3.oxidase\b|\bGID[12]\b'
     r'|\bent-kaurenoic.acid.oxidase\b|\bent-kaurene\b',           'Gibberellin_GA3'),
    (r'\bauxin\b|\bindole.3.acetic\b|\bindole.acetic\b|\bIAA\b'
     r'|\bTryptophan.aminotransferase\b|\bYUCCA\b|\bYUC\b'
     r'|\bAXR\b|\bABP1\b|\bTIR1\b|\bAFB\b|\bindole.pyruvate\b'
     r'|\bYUCCA[0-9]\b|\bindole-3-pyruvate.monooxygenase\b'
     r'|\bIAA-amino.acid.hydrolase\b|\bILR\w*\b|\bAuxin.response.factor\b'
     r'|\bARF\b(?!.*GTPase)|\bAuxin.efflux.carrier\b',            'Auxin_IAA'),
    (r'\babscisic\b|\bABA\b|\bxanthoxin\b|\bABALDH\b|\bNCED\b'
     r'|\bABA.8.hydroxylase\b|\bSnRK2\b|\bPP2C\b|\bPYR\b|\bPYL\b'
     r'|\babscisic.acid.8-hydroxylase\b|\bABF\b(?!.*binding.factor)'
     r'|\bABA.responsive.element\b|\bABI\w+\b',                    'Abscisic_Acid_ABA'),
    (r'\bcytokinin\b|\btrans.zeatin\b|\bisopentenyl.adenine\b'
     r'|\bIPT\b|\bCKX\b|\bcytokinin.riboside\b|\bLOG\w*\b'
     r'|\bcytokinin.hydroxylase\b|\bcytokinin.oxidase\b',          'Cytokinin'),
    (r'\bethylene\b|\bACC.synthase\b|\bACC.oxidase\b|\bACS\b|\bACO\b'
     r'|\b1-aminocyclopropane-1-carboxylate.synthase\b'
     r'|\b1-aminocyclopropane-1-carboxylate.deaminase\b'
     r'|\bACO\b|\bEIN\w*\b|\bCTR1\b|\bEIN3.binding.F-box\b|\bEBF\w*\b',
                                                                    'Ethylene'),
    (r'\bbrassinosteroid\b|\bbrassinolide\b|\bBR.biosynthesis\b'
     r'|\bDET2\b|\bDWF\b|\bBIN2\b|\bBES1\b|\bBZR1\b'
     r'|\bbrassinosteroid-6-oxidase\b|\bCYP85A\w*\b|\bCYP90\w*\b'
     r'|\bsterol.5-alpha-reductase\b|\bDWF4\b|\bsteroid.22-alpha-hydroxylase\b'
     r'|\bsteroid.C22-hydroxylase\b|\bCYP734A\w*\b|\bBAS1\b',     'Brassinosteroid'),
    (r'\bjasmonic\b|\bjasmonate\b|\bJA.Ile\b|\bcoronatin\w+\b'
     r'|\bLOX\b|\bAOS\b|\bOPR3\b|\bJAZ\b|\bCOI1\b'
     r'|\b12-oxophytodienoate.reductase\b|\bOPR\b|\blipoxygenase\b'
     r'|\ballene.oxide.synthase\b',                                 'Jasmonate_JA'),
    (r'\bsalicylic\b|\bsalicylate\b|\bSA.biosynthesis\b'
     r'|\bICS\b|\bPAL\b|\bNPR1\b|\bPR[0-9]\b'
     r'|\benhanced.disease.susceptibility\b|\bEDS1\b',             'Salicylate_SA'),
    (r'\bstrigolactone\b|\bCCD[78]\b|\bMAX[1234]\b|\bD27\b'
     r'|\bcarlactone.synthase\b|\bCCD8\b|\bCCD7\b',               'Strigolactone'),

    # ── Amino acids (remaining) ────────────────────────────────────────────────
    (r'\bglyc\w*-tRNA\b|glycyl.tRNA|glyQS|\bglycine\b(?!.betaine)'
     r'|\bglycine.cleavage.system\b|\bGLDC\b|\baminomethyltransferase\b(?!.*SAM)'
     r'|\bgcvT\b|\bserine.hydroxy\w+transferase\b(?!.*choline)',   'Glycine'),
    (r'\btryptophan\b|\btrp\b(?!\w)'
     r'|\banthranilate.synthase\b|\banthranilate.phosphoribosyltransfer\w+\b'
     r'|\bindole-3-glycerol-phosphate\b|\btryptophan.synthase\b|\btrpB\b'
     r'|\bphosphoribosylanthranilate.isomerase\b',                 'Tryptophan'),
    (r'\bleucine\b|\bleu\b(?!\w)'
     r'|\bisopropylmalate.synthase\b|\bisopropylmalate.dehydratase\b'
     r'|\bisopropylmalate.dehydrogenase\b|\bleuC\b|\bleuD\b',      'Leucine'),
    (r'\bvaline\b|\bval\b(?!\w)'
     r'|\bketol-acid.reductoisomerase\b|\bdihydroxy-acid.dehydratase\b'
     r'|\bacetolactate.synthase\b',                                 'Valine'),
    (r'\bisoleucine\b|\bile\b(?!\w)',                               'Isoleucine'),
    (r'\bserine\b|\bser\b(?!\w)'
     r'|\bphosphoserine.aminotransferase\b|\bphosphoserine.phosphatase\b'
     r'|\bD-3-phosphoglycerate.dehydrogenase\b|\bserB\b|\bPSPH\b',
                                                                    'Serine'),
    (r'\balanine\b|\bala\b(?!\w)'
     r'|\balanine.transaminase\b|\bGPT\b|\bALT\b(?!\w)'
     r'|\balanine--glyoxylate.aminotransferase\b',                 'Alanine'),
    (r'\bphenylalanine\b|\bphe\b(?!\w)'
     r'|\barogenate.dehydratase\b|\bprephenate.dehydratase\b|\bpheT\b'
     r'|\bphenylalanyl-tRNA.synthetase\b|\bFARSB\b',              'Phenylalanine'),
    (r'\btyrosine\b|\btyr\b(?!\w)'
     r'|\barogenate.dehydrogenase\b|\btyrosine.transaminase\b'
     r'|\btyrosyl-tRNA.synthetase\b|\btyrosine--tRNA.ligase\b',   'Tyrosine'),
    (r'\blysine\b|\blys\b(?!\w)'
     r'|\bdiaminopimelate.decarboxylase\b|\bdiaminopimelate.epimerase\b'
     r'|\b4-hydroxy-tetrahydrodipicolinate.synthase\b|\bDHPS\b'
     r'|\b4-hydroxy-tetrahydrodipicolinate.reductase\b|\bDapB\b'
     r'|\bsaccharopine.dehydrogenase\b|\blysyl-tRNA.synthetase\b',
                                                                    'Lysine'),
    (r'\bmethionine\b|\bmet\b(?!\w)'
     r'|\bcystathionine.gamma-synthase\b|\bcystathionine.beta-lyase\b'
     r'|\bhomoserine\b|\bS-adenosylmethionine.synthase\b|\bSAM.synthase\b'
     r'|\b5-methyltetrahydropteroyltriglutamate--homocysteine\b',  'Methionine'),
    (r'\bcysteine\b|\bcys\b(?!\w)'
     r'|\bcysteine.synthase\b|\bOASS\b|\bSERAT\b|\bserine.acetyltransferase\b'
     r'|\bcysteine.desulfurase\b|\bNFS\w*\b|\bcysteine--tRNA.ligase\b',
                                                                    'Cysteine'),
    (r'\bhistidine\b|\bhis\b(?!\w)'
     r'|\bhistidinol.dehydrogenase\b|\bhistidinol-phosphatase\b'
     r'|\bATP.phosphoribosyltransferase\b|\bhistidyl-tRNA.synthetase\b',
                                                                    'Histidine'),
    (r'\barginine\b|\barg\b(?!\w)'
     r'|\bargininosuccinate.synthase\b|\bargininosuccinate.lyase\b'
     r'|\bornithine.carbamoyltransferase\b|\bcarbamoyl-phosphate.synthase\b'
     r'|\bornithine.aminotransferase\b|\bornithine.decarboxylase\b(?!.*poly)',
                                                                    'Arginine'),
    (r'\baspartate\b|\baspartic\b|\basp\b(?!\w)'
     r'|\baspartate.aminotransferase\b|\baspartate.kinase\b'
     r'|\baspartate-semialdehyde.dehydrogenase\b|\baspartyl.beta-hydroxylase\b'
     r'|\basparaginyl-tRNA.synthetase\b|\bASP5\b|\bGOT2\b',       'Aspartate'),
    (r'\bglutamate\b|\bglutamic\b|\bglu\b(?!\w)'
     r'|\bglutamate.dehydrogenase\b|\bglutamate.synthase\b|\bGOGAT\b'
     r'|\bglutamate.receptor\b|\bglutamate-1-semialdehyde\b|\bGSA\b'
     r'|\bglutamate.decarboxylase\b|\bglutamyl-tRNA.reductase\b'
     r'|\bglutamyl-tRNA.synthetase\b|\bglutamyl-tRNA.ligase\b',   'Glutamate'),
    (r'\basparagine\b|\basn\b(?!\w)'
     r'|\basparagine.synthetase\b|\bASNS\b|\basparaginase\b',      'Asparagine'),
    (r'\bglutamine\b|\bgln\b(?!\w)'
     r'|\bglutamine.synthetase\b|\bGS\b(?!\w)|\bglutaminase\b'
     r'|\bglutamine.amidotransferase\b|\bGMP.synthase\b',          'Glutamine'),
    (r'\bthreonine\b|\bthr\b(?!\w)'
     r'|\bthreonine.synthase\b|\bthreonine.ammonia-lyase\b|\bthreonine.dehydratase\b'
     r'|\bhomoserine.kinase\b|\bthreonyl-tRNA.synthetase\b',       'Threonine'),

    # ── Osmoprotectants / Compatible solutes ──────────────────────────────────
    (r'\btrehalose\b|\btrehalose.6.phosphate\b|\bTPS\b|\bTPP\b'
     r'|\btrehalose-phosphate.phosphatase\b|\balpha,alpha-trehalase\b'
     r'|\btrehalase\b|\bOTSA\b|\bOTSB\b',                         'Trehalose'),
    (r'\bsorbitol\b|\bmannitol\b|\binositol\b'
     r'|phosphatidyltransferase.*inositol|inositol.*phosphatidyl'
     r'|\binositol.3-kinase\b|\bmyo-inositol\b|\binositol.oxygenase\b'
     r'|\binositol.polyphosphate\b|\bINPS\b|\bIMP1\b|\bSUHB\b',   'Inositol'),
    (r'\bectoine\b|\bhydroxyectoine\b',                            'Ectoine'),
    (r'\bgalactinol\b|\bgalactinol.synthase\b|\bgalactinol--sucrose\b'
     r'|\braffinose\b|\bstachyose\b',                              'Raffinose_Galactinol'),

    # ── Lipids / Fatty acids ───────────────────────────────────────────────────
    (r'\bCDP.diacylglycerol\b|\bphosphatidylinositol\b'
     r'|\bphospholipid\b|\bdiacylglycerol\b',                      'Phospholipid_Biosynthesis'),
    (r'\bfatty.acid\b|\bfatty acid\b|\bACCase\b|\bFAS\b'
     r'|\bKAS[ABCI]\b|\bACBP\b',                                   'Fatty_Acid'),
    (r'\bwax\b|\bcutin\b|\bsuberin\b|\bwax.ester.synthase\b'
     r'|\blong-chain-alcohol.O-fatty-acyltransferase\b|\bFAR\w*\b'
     r'|\bfatty.acyl-CoA.reductase\b',                             'Wax_Cutin'),

    # ── Carbohydrates / Energy ─────────────────────────────────────────────────
    (r'\bstarch\b|\bAGP\b|\bgranule.bound\b|\bwaxy\b',            'Starch'),
    (r'\bcellulose\b|\bCESA\b',                                    'Cellulose'),
    (r'\bsucrose\b|\bSPS\b|\bSUS\b',                              'Sucrose'),
    (r'\bglucose\b|\bglycolysis\b|\bPGK\b|\bPFK\b',               'Glycolysis'),
    (r'\bcalvin\b|\bRubisco\b|\bRBCS\b|\bRBCL\b|\bCO2.fixation\b','Calvin_Cycle'),
    (r'\bTCA\b|\bcitrate\b|\bKrebs\b|\bisocitrate\b|\bsuccinate\b','TCA_Cycle'),
    (r'\bpentose\b|\bG6PD\b|\b6PGD\b',                            'Pentose_Phosphate'),

    # ── Nitrogen / Nucleotides ─────────────────────────────────────────────────
    (r'\bpurine\b|\badenine\b|\bguanine\b|\bxanthine\b',          'Purine'),
    (r'\bpyrimidine\b|\buracil\b|\bcytosine\b|\bthymine\b',       'Pyrimidine'),
    (r'\bnitrogen\b|\bnitrate\b|\bnitrite\b|\bammonia\b'
     r'|\bNitrogenase\b|\bGS\b|\bGOGAT\b|\bNR\b|\bNiR\b',        'Nitrogen_Assimilation'),

    # ── Photosynthesis / Chlorophyll ───────────────────────────────────────────
    (r'\bchlorophyll\b|\bporphyrin\b|\btetrapyrrole\b|\bchlorin\b'
     r'|\bprotochlorophyllide\b|\bPOR\b|\bCHL\b',                  'Chlorophyll'),
    (r'\bphotosystem\b|\bphotosynthesis\b|\bPSI\b|\bPSII\b'
     r'|\blight.harvesting\b|\bLHC\b',                             'Photosynthesis'),

    # ── Secondary metabolites ─────────────────────────────────────────────────
    (r'\bflavonoid\b|\bflavone\b|\bflavonol\b|\bchalcone\b|\bCHS\b'
     r'|\bF3H\b|\bF3.5H\b',                                        'Flavonoid'),
    (r'\bterpen\w+\b|\bisoprenoid\b|\bMVA\b|\bMEP\b|\bDXS\b'
     r'|\bHMGR\b|\bIPP\b|\bGPPS\b|\bFPPS\b|\bGGPPS\b',           'Terpenoid'),
    (r'\banthocyanin\b|\bDFR\b|\bANS\b|\bUFGT\b',                 'Anthocyanin'),
    (r'\bligni\w+\b|\bphenylpropanoid\b|\bCAD\b|\bCCR\b|\bF5H\b', 'Lignin'),
    (r'\balkaloid\b|\bberberine\b|\bcaffeine\b|\bnicotine\b',      'Alkaloid'),
    (r'\bglucosino\w+\b|\bMYB28\b|\bMYB29\b|\bCYP79\b',          'Glucosinolate'),

    # ── Signalling ─────────────────────────────────────────────────────────────
    (r'\bprotein.phosphatase\b|\bphosphatase.2C\b|\bPP2A\b|\bPP2B\b|\bPP2C\b'
     r'|\bPTEN\b|\bphosphatase.subunit\b|\bphosphatase.catalytic\b',
                                                                    'Protein_Phosphatase_Signalling'),
    (r'\bprotein.kinase\b|\bkinase\b',                             'Protein_Kinase_Signalling'),
    (r'\bcAMP\b|\bcyclic.AMP\b|\badenylate.cyclase\b'
     r'|\badenylyl.cyclase\b',                                     'cAMP_Signalling'),
    (r'\bMAPK\b|\bMAP.kinase\b|\bMEK\b|\bMKK\b',                 'MAPK_Signalling'),
    (r'\bcalcium.binding\b|\bcalcium.dependent\b|\bcalmodulin\b'
     r'|\bCML\b|\bCBL\b|\bCIPK\b|\bCaM\b|\bCDPK\b|\bCPK\b',     'Calcium_Signalling'),
    (r'\bROS\b|\bsuperoxide\b|\bperoxidase\b|\bcatalase\b'
     r'|\bSOD\b|\bGPX\b|\bAPX\b(?!.*ascorbate)',                  'ROS_Scavenging'),

    # ── RNA biology ────────────────────────────────────────────────────────────
    (r'\bspliceosom\w+\b|\bpre.mRNA.splic\w+\b|\blariat\b|\bdebranch\w+\b'
     r'|\bDBR[0-9]\b|\bCWC\w+\b|\bsplicing.factor\b'
     r'|\bU[12456]\s*snRNP\b|\bSR.protein\b',                     'RNA_Splicing'),
    (r'\btRNA.synthetase\b|aminoacyl.tRNA|\bARS\b|\bAARS\b'
     r'|\btRNA.ligase\b|\btRNA[\s\-]?ligation\b',                  'tRNA_Aminoacylation'),
    (r'\btRNA\b.*\bmodif\w+\b|\bmodif\w+\b.*\btRNA\b'
     r'|\bt6A\b|\bthreonylcarbamoyl\b|\bcytidine.acetyl\w*\b'
     r'|\bpseudouridin\w+\b|\bRlmN\b|\bElp\w+\b|\bTrm\w+\b',     'tRNA_Modification'),
    (r'\bRNA.helicase\b|\bRNA.exonuclease\b|\bRNase\b|\bRibonuclease\b'
     r'|\bRNA.recognition.motif\b|\bRRM\b|\bLsm\b|\bRRM_1\b'
     r'|\bREXO\b|\bREX\d\b|\bRNA.exo\w+\b',                       'RNA_Processing'),
    (r'\bribosom\w+\b|\btranslation.factor\b|\binitiation.factor\b'
     r'|\beIF[0-9]\b|\beEF\b|\bNAC.subunit\b|\bnascent.polypeptide\b'
     r'|\bMIOREx\b|\bribosome.biogenesis\b|\bMAK\d+\b',            'Translation'),
    (r'\btranscription.factor\b|\bMYB\b|\bbZIP\b|\bERF\b'
     r'|\bWRKY\b|\bNAC\b|\bHSF\b|\bplastid.transcription\b'
     r'|\bplastid.transcriptionally.active\b|\bPTAC\b',            'Transcription'),

    # ── Protein homeostasis & modification ────────────────────────────────────
    (r'\bproteasome\b|\bubiquitin\b|\bE3.ligase\b|\bSCF\b|\bCOP1\b'
     r'|\bUFM1\b|\bUFM.protease\b|\bUSP.domain\b|\bUBE2\b|\bUBC\b'
     r'|\bubiquitin.conjugat\w+\b|\bSUMO\b|\bNEDD\b',             'Ubiquitin_Proteasome'),
    (r'\bchaperone\b|\bHSP\b|\bheat.shock\b|\bDnaK\b|\bGroEL\b'
     r'|\bJ.domain\b|\bDnaJ\b|\bHDJ\b|\bBiP\b|\bGRP7[05]\b',     'Chaperone'),
    (r'\bprotease\b|\bpeptidase\b|\bCLP.protease\b|\bDo.like\b'
     r'|\bFtsH\b|\bLon.protease\b|\bsubtilisin\b|\bcaspase\b'
     r'|\bmetalloprotease\b|\bserine.protease\b',                  'Protein_Proteolysis'),
    (r'\bN.acetyltransferase\b|\bacetyltransferase\b|\bNAT\b(?!\w)'
     r'|\bGCN5\b|\bHAT\b(?!\w)',                                   'Protein_Acetylation'),

    # ── Lipid & membrane metabolism (extended) ────────────────────────────────
    (r'\btrigalactosyldiacylglycerol\b|\bdigalactosyldiacylglycerol\b'
     r'|\bmonogalactosyldiacylglycerol\b|\bTGD\w*\b|\bDGD\w*\b|\bMGD\w*\b'
     r'|\bglycolipid\b|\bgalactolipid\b',                          'Glycolipid_Biosynthesis'),
    (r'\bCDP.diacylglycerol\b|\bphosphatidylinositol\b'
     r'|\bphospholipid\b|\bdiacylglycerol\b|\bphosphatidylcholine\b'
     r'|\bphosphatidylethanolamine\b|\bphosphatidylserine\b'
     r'|\bphosphatidylcholine.transfer\b|\bSEC14\b|\bphosphoglyceride.transfer\b',
                                                                    'Phospholipid_Biosynthesis'),
    (r'\bpalmitoyl\w*transferase\b|\bZDHHC\b|\bprotein.palmitoyl\w+\b',
                                                                    'Protein_Lipidation'),
    (r'\bsterol\b|\bcholesterol\b|\boxysterol\b|\bsqualene\b|\bERG\d+\b'
     r'|\bOSBP\b|\bSMT\b(?!\w)',                                   'Sterol_Lipid_Metabolism'),
    (r'\blipase\b|\bhydrolase\b.*\blipid\b|\blipid\b.*\bhydrolase\b'
     r'|\badiponutrin\b|\bpatatin\b|\bDAGL\b|\bTGL\b(?!\w)',       'Lipid_Hydrolase'),
    (r'\bfatty.acid\b|\bfatty acid\b|\bACCase\b|\bFAS\b'
     r'|\bKAS[ABCI]\b|\bACBP\b|\bpalmitoyltransferase\b',         'Fatty_Acid'),
    (r'\bwax\b|\bcutin\b|\bsuberin\b',                             'Wax_Cutin'),

    # ── Vesicle / membrane trafficking ────────────────────────────────────────
    (r'\bGolgi\b|\bCOP.I\b|\bCOP.II\b|\bSNARE\b|\bARF\b(?!\w)'
     r'|\bRab\w+\b|\bVPS\d+\b|\bvesicle.transport\b|\bvesicular.transport\b'
     r'|\bCOG\b.*\bsubunit\b|\bconserved.oligomeric.Golgi\b',      'Vesicle_Trafficking'),

    # ── Carbohydrate / Energy (extended) ──────────────────────────────────────
    (r'\bstarch\b|\bAGP\b|\bgranule.bound\b|\bwaxy\b'
     r'|\bglucam\b|\bgluca[nt]\b.*\bdikinase\b|\bwater.dikinase\b'
     r'|\bstarch.related\b',                                        'Starch'),
    (r'\bcellulose\b|\bCESA\b',                                    'Cellulose'),
    (r'\bsucrose\b|\bSPS\b|\bSUS\b',                              'Sucrose'),
    (r'\bglucosidase\b|\bglucana\w+\b|\bexo.1,3.alpha.glucanase\b'
     r'|\bglucose\b|\bglycolysis\b|\bPGK\b|\bPFK\b',              'Glycolysis'),
    (r'\bphosphoenolpyruvate.carboxykinase\b|\bPEPCK\b|\bPEPC\b'
     r'|\bfructose.1,6.bisphosphatase\b|\bFBPase\b|\bFBP\b(?!\w)', 'Gluconeogenesis'),
    (r'\b3.methyl.2.oxobutanoate\b|\boxoisovalerate\b|\bBCAA.degrad\w+\b'
     r'|\bbranched.chain.keto\b|\bBCKDH\b|\bBCKAT\b',             'BCAA_Degradation'),
    (r'\bcalvin\b|\bRubisco\b|\bRBCS\b|\bRBCL\b|\bCO2.fixation\b','Calvin_Cycle'),
    (r'\bTCA\b|\bcitrate\b|\bKrebs\b|\bisocitrate\b|\bsuccinate\b','TCA_Cycle'),
    (r'\bpentose\b|\bG6PD\b|\b6PGD\b',                            'Pentose_Phosphate'),

    # ── Nitrogen / Nucleotides ─────────────────────────────────────────────────
    (r'\bpurine\b|\badenine\b|\bguanine\b|\bxanthine\b',          'Purine'),
    (r'\bpyrimidine\b|\buracil\b|\bcytosine\b|\bthymine\b',       'Pyrimidine'),
    (r'\bnitrogen\b|\bnitrate\b|\bnitrite\b|\bammonia\b'
     r'|\bNitrogenase\b|\bGS\b|\bGOGAT\b|\bNR\b|\bNiR\b'
     r'|\bglutamine.synthetase\b|\bglutamate.synthase\b',          'Nitrogen_Assimilation'),

    # ── Photosynthesis / Chlorophyll / Chloroplast ────────────────────────────
    (r'\bchlorophyll\b|\bporphyrin\b|\btetrapyrrole\b|\bchlorin\b'
     r'|\bprotochlorophyllide\b|\bPOR\b|\bCHL\b',                  'Chlorophyll'),
    (r'\bphotosystem\b|\bphotosynthesis\b|\bPSI\b|\bPSII\b'
     r'|\blight.harvesting\b|\bLHC\b|\bPsbP\b|\bPSBP\b'
     r'|\bphotosystem.I.subunit\b|\bphotosystem.II.subunit\b'
     r'|\bpsaI\b|\bpsbI\b|\bPsbO\b',                              'Photosynthesis'),
    (r'\bchloroplastic\b|\bplastid\b|\bchloroplast\b|\bIOJAP\b'
     r'|\bRAP.domain.*chloro\b|\bplastome\b|\bstromule\b',         'Chloroplast_Function'),

    # ── Secondary metabolites ─────────────────────────────────────────────────
    (r'\bflavonoid\b|\bflavone\b|\bflavonol\b|\bchalcone\b|\bCHS\b'
     r'|\bF3H\b|\bF3.5H\b',                                        'Flavonoid'),
    (r'\bterpen\w+\b|\bisoprenoid\b|\bMVA\b|\bMEP\b|\bDXS\b'
     r'|\bHMGR\b|\bIPP\b|\bGPPS\b|\bFPPS\b|\bGGPPS\b'
     r'|\bdimethylallyltrans\w+\b|\bfarnesyl.diphosphate\b|\bgeranyltrans\w+\b'
     r'|\bprenyltransferase\b|\bgeranylgeranyl\b',                 'Terpenoid'),
    (r'\banthocyanin\b|\bDFR\b|\bANS\b|\bUFGT\b',                 'Anthocyanin'),
    (r'\bligni\w+\b|\bphenylpropanoid\b|\bCAD\b|\bCCR\b|\bF5H\b', 'Lignin'),
    (r'\balkaloid\b|\bberberine\b|\bcaffeine\b|\bnicotine\b',      'Alkaloid'),
    (r'\bglucosino\w+\b|\bMYB28\b|\bMYB29\b|\bCYP79\b',          'Glucosinolate'),

    # ── One-carbon / Sulfur metabolism ────────────────────────────────────────
    (r'\badenosylhomocysteinase\b|\bSAHase\b|\bhomocysteine\b'
     r'|\bS.adenosylmethionine\b|\bSAM\b(?!\w)|\bSAHH\b'
     r'|\bmethyltransfer\w+\b|\baminomethyltransferase\b|\bgcvT\b|\bAMT\b(?!\w)',
                                                                    'One_Carbon_Metabolism'),

    # ── Polyamine biosynthesis ─────────────────────────────────────────────────
    (r'\bpolyamine\b|\bspermine\b|\bspermidine\b|\bputrescine\b'
     r'|\bornithine.decarboxylase\b|\bODC\b|\bagmatine\b'
     r'|\blysine.decarboxylase\b|\badenosylmethionine.decarboxylase\b|\bSAMDC\b',
                                                                    'Polyamine_Biosynthesis'),

    # ── Redox metabolism ──────────────────────────────────────────────────────
    (r'\boxidoreductase\b|\breductase\b|\bdehydrogenase\b|\brenalase\b'
     r'|\bNAD.P..linked\b|\bNADPH.oxidase\b|\bSDR.family\b|\bDHRS\b',
                                                                    'Redox_Metabolism'),

    # ── Ion / metal transport ─────────────────────────────────────────────────
    (r'\bmitochondrial.*transporter\b|\bmitochondrial.*carrier\b'
     r'|\bANT\b(?!\w)|\bADNT\b|\bAAC\b(?!\w)'
     r'|\bsolute.carrier.family.25\b|\bSLC25\b',                   'Mitochondrial_Transport'),
    (r'\barsenite.transport\w+\b|\barsA\b|\bASNA\b|\barsenic\b'
     r'|\bheavy.metal.transport\b|\bATP.binding.cassette.*metal\b'
     r'|\bARSB\b|\barsenic.transport\w+\b',                        'Metal_Ion_Transport'),
    (r'\bnucleoporin\b|\bNPC\b|\bnuclear.pore\b|\bkaryopherin\b'
     r'|\bimportin\b|\bexportin\b|\bNDC1\b|\bTMEM48\b',           'Nuclear_Transport'),

    # ── DNA repair / replication ──────────────────────────────────────────────
    (r'\bDNA.repair\b|\bRAD[0-9]+\b|\bREC[A-Z]\b|\bMRE11\b|\bNBS1\b'
     r'|\bXPC\b|\bXPB\b|\bMLH\b|\bMSH\b|\bligase.*DNA\b|\bDNA.ligase\b',
                                                                    'DNA_Repair'),

    # ── Cell cycle / chromatin ────────────────────────────────────────────────
    (r'\bchromosome.condensation\b|\bchromatin.condensation\b|\bRCC1\b'
     r'|\bACIN1\b|\bACINUS\b|\bcyclin\b|\bCDC\d+\b|\bCDK\d+\b'
     r'|\bcohesin\b|\bcondensins\b|\bchromatin.remodel\w+\b|\bSWI.SNF\b',
                                                                    'Cell_Cycle_Chromatin'),

    # ── Cytoskeleton ──────────────────────────────────────────────────────────
    (r'\bactin\b|\btubulin\b|\bmyosin\b|\bkinesin\b|\bdynein\b'
     r'|\bARP[0-9]\b|\bARPC\w+\b|\bprofilin\b|\bformin\b|\bvillin\b'
     r'|\bcytoskeleton\b|\bmicrotubule\b|\bmicrofilament\b',       'Cytoskeleton'),

    # ── Cell wall ─────────────────────────────────────────────────────────────
    (r'\bcell.wall\b|\bchitin\b|\bchitinase\b|\bCHID\b|\bchitosan\b'
     r'|\bpectin\b|\bpectate\b|\bextensins\b|\bxyloglucan\b'
     r'|\bexpansin\b|\bXTH\b',                                     'Cell_Wall_Remodeling'),

    # ── Ribosome biogenesis ────────────────────────────────────────────────────
    (r'\bribosome.biogenesis\b|\brRNA.processing\b|\bnucleolus\b'
     r'|\bsnoRNA\b|\bNOC\d+\b|\bMIOREx\b|\bNAC.subunit\b'
     r'|\bnascent.polypeptide.associated\b|\bRPL\d+\b|\bRPS\d+\b',  'Ribosome_Biogenesis'),

    # ═══════════════════════════════════════════════════════════════════════════
    # NEW RULES derived from the Description column
    # ═══════════════════════════════════════════════════════════════════════════

    # ── Autophagy ─────────────────────────────────────────────────────────────
    (r'\bautophagy\b|\bATG[0-9]+\b|\bautophagy.related\b|\bbeclin\b'
     r'|\bVPS30\b|\bautophagosome\b|\bATG8\b|\bATG18\b|\bATG9\b'
     r'|\bATG3\b|\bATG7\b|\bWIPI\w*\b|\bAtaxin.3\b',             'Autophagy'),

    # ── Splicing / pre-mRNA processing (extended) ─────────────────────────────
    (r'\bU2.small.nuclear.ribonucleoprotein\b|\bsnRNP\b|\bsnRNA\b'
     r'|\bpre.mRNA.processing\b|\bpre.mRNA.splicing\b|\bPRPF\w+\b'
     r'|\bPRP[0-9]+\b|\bsplicing.factor.3\b|\bSF3\w+\b|\bSF3B\w+\b'
     r'|\bU4.U6\b|\bU5.snRNP\b|\bSNRNP\w+\b|\bSNRPA\b|\bLSM\d+\b'
     r'|\bLsm\d+\b|\bDDX[0-9]+\b(?=.*splic)|\bDHX[0-9]+\b(?=.*splic)'
     r'|\bBUD31\b|\bCWC\d+\b|\bSYF\d+\b|\bCEF1\b|\bCDC5\b'
     r'|\bSRSF\w+\b|\bSFRS\w+\b|\bSR.protein\b|\bRBM\w+\b',      'RNA_Splicing'),

    # ── mRNA surveillance / NMD ───────────────────────────────────────────────
    (r'\bnonsense.mediated.mRNA.decay\b|\bNMD\b|\bUPF[123]\b|\bSMG\w+\b'
     r'|\bregulator.of.nonsense.transcripts\b|\bRENT\d\b',         'mRNA_Surveillance'),

    # ── RNA export / nuclear transport ────────────────────────────────────────
    (r'\bmRNA.export\b|\bRAE1\b|\bGLE2\b|\bnuclear.cap.binding\b'
     r'|\bNCBP\w+\b|\bTHO.complex\b|\bTHOC\w+\b|\bALY\b',        'mRNA_Export'),

    # ── Exosome / RNA degradation ─────────────────────────────────────────────
    (r'\bexosome.complex\b|\bRRP\d+\b|\bEXOSC\w+\b|\bDIS3\b'
     r'|\bSKI2\b|\bSKI3\b|\bXRN[12]\b|\bexoribonuclease\b'
     r'|\bRNA.exonuclease\b|\bCCR4.NOT\b|\bCNOT\w+\b'
     r'|\benhancer.of.mRNA.decapping\b|\bEDC\d+\b|\bDCP1\b',      'RNA_Degradation'),

    # ── Histone modification ──────────────────────────────────────────────────
    (r'\bhistone\b|\bH2A\b|\bH2B\b|\bH3\b(?!\w)|\bH4\b(?!\w)'
     r'|\bhistone.deacetylase\b|\bHDAC\b|\bhistone.acetyltransferase\b'
     r'|\bKAT\d+\b|\bGCN5\b|\bHistone.H[1-4]\b',                  'Histone_Modification'),

    # ── DNA methylation / epigenetics ─────────────────────────────────────────
    (r'\bDNA.methyltransferase\b|\bDNMT\w+\b|\bCMT[123]\b'
     r'|\bmethyl-CpG.binding\b|\bMBD\w+\b|\bDEMETER\b|\bDML\w+\b'
     r'|\bROS1\b(?!.*reactive)|\bDRM\w+\b|\bVIM\w+\b',            'DNA_Methylation_Epigenetics'),

    # ── Histone demethylation ─────────────────────────────────────────────────
    (r'\blysine.specific.demethylase\b|\bKDM\d+\b|\bJMJD\d+\b'
     r'|\bJMJ\w+\b|\bjumonji\b|\bJMJC.domain\b|\bELF6\b|\bJMJ14\b'
     r'|\bREF6\b|\bLID\b(?!.*lid)|\bSDG\w*\b|\bhistone.demethyl\w+\b'
     r'|\bpolyamine.oxidase\b',                                    'Histone_Demethylation'),

    # ── Polycomb / chromatin silencing ────────────────────────────────────────
    (r'\bpolycomb\b|\bPRC\d+\b|\bEED\b(?!.*endopeptidase)|\bEZH\w+\b'
     r'|\bpicture\b|\bEMF\d+\b|\bFIE\b|\bMSI\d+\b|\bVRN\w+\b',   'Chromatin_Silencing'),

    # ── SWI/SNF chromatin remodeling ──────────────────────────────────────────
    (r'\bSWI.SNF\b|\bSMARC\w+\b|\bBRM\b(?!.*helicase)|\bSNF2\b'
     r'|\bINO80\b|\bATOM\b|\bCHD\d+\b|\bISWI\b|\bSNF2H\b'
     r'|\bACF\b(?!.*acyl)|\bRSC\b(?!.*respir)',                    'Chromatin_Remodeling_SWI_SNF'),

    # ── Proteasome ────────────────────────────────────────────────────────────
    (r'\bproteasome\b|\bPSMB\d+\b|\bPSMA\d+\b|\bPSMD\d+\b'
     r'|\bPSMC\d+\b|\b20S.proteasome\b|\b26S.proteasome\b'
     r'|\bRPN\d+\b|\bRPT\d+\b|\bproteasome.subunit\b',            'Proteasome'),

    # ── COP9 signalosome ──────────────────────────────────────────────────────
    (r'\bCOP9.signalosome\b|\bCSN\d+\b|\bCOPS\d+\b|\bsignalosome\b',
                                                                    'COP9_Signalosome'),

    # ── SCF / cullin ubiquitin ligase ─────────────────────────────────────────
    (r'\bcullin\b|\bCUL[0-9]\b|\bF.box.protein\b|\bFBX[OW]\w+\b'
     r'|\bSKP1\b|\bRBX1\b|\bROC1\b|\bSCF.complex\b',              'SCF_Cullin_Ligase'),

    # ── APC/C (anaphase promoting complex) ────────────────────────────────────
    (r'\banaphase.promoting.complex\b|\bAPC[0-9]+\b|\bCDC20\b'
     r'|\bCDC16\b|\bCDC23\b|\bCDC27\b|\bFZY\w+\b',               'APC_Cell_Cycle'),

    # ── Mitochondrial import / TIM-TOM ────────────────────────────────────────
    (r'\bmitochondrial.import\b|\bTIM[0-9]+\b|\bTOM[0-9]+\b'
     r'|\btranslocase.of..*mitochondrial\b|\bpresequence\b'
     r'|\bmitochondrial.translocase\b|\bTIM\d+\b|\bTOM\d+\b',     'Mitochondrial_Import'),

    # ── Chloroplast import / TOC-TIC ──────────────────────────────────────────
    (r'\bTIC\d+\b|\bTOC\d+\b|\bprotein.import.*chloro\b'
     r'|\bchloroplast.import\b|\btranslocon.*outer.*chloro\b'
     r'|\btranslocon.*inner.*chloro\b|\bTic\d+\b|\bToc\d+\b',     'Chloroplast_Import'),

    # ── Peroxisome biogenesis ─────────────────────────────────────────────────
    (r'\bperoxin\b|\bPEX\d+\b|\bperoxisome.biogenesis\b'
     r'|\bPTS[12]\b|\bperoxisomal.membrane\b',                     'Peroxisome_Biogenesis'),

    # ── ER protein quality / ERAD ─────────────────────────────────────────────
    (r'\bER.degradation\b|\bERAD\b|\bEDEM\w+\b|\bcalnexin\b|\bcalreticulin\b'
     r'|\bprotein.disulfide.isomerase\b|\bPDI\b(?!\w)|\bER.lumen\b'
     r'|\bGRP\d+\b|\bendoplasmin\b|\bBiP\b|\bGRP78\b|\bERO1\b',   'ER_Protein_Quality'),

    # ── N-glycosylation / dolichol ────────────────────────────────────────────
    (r'\bdolichol\b|\bDPM[12]\b|\bALG\d+\b|\bN-glycosylation\b'
     r'|\boligosaccharyltransferase\b|\bOST\w+\b|\bdolichyl.phosphate\b'
     r'|\bGPI.anchor\b|\bGPI.biosynthesis\b|\bPIG[ACKOSTU]\b|\bGAA1\b',
                                                                    'N_Glycosylation'),

    # ── Sphingolipid metabolism ───────────────────────────────────────────────
    (r'\bsphingolipid\b|\bsphingosine\b|\bsphingomyelin\b|\bceramide\b'
     r'|\bCERS\w*\b|\bserine.palmitoyltransferase\b|\bSPT\b(?!\w)'
     r'|\bdihydrosphingosine\b|\bLCB\w+\b|\bceramide.glucosyltransferase\b'
     r'|\bsphingosine.kinase\b|\bneutral.ceramidase\b|\bASAH\w+\b',
                                                                    'Sphingolipid_Metabolism'),

    # ── Cardiolipin / mitochondrial lipids ────────────────────────────────────
    (r'\bcardiolipin\b|\bTAFAZZIN\b|\bCLD\w*\b|\bphosphatidylglycerophosphate\b'
     r'|\bphosphatidylglycerophosphatase\b|\bCDS\d+\b',            'Cardiolipin_Metabolism'),

    # ── Beta-oxidation (fatty acid degradation) ───────────────────────────────
    (r'\bbeta.oxidation\b|\bacyl-CoA.dehydrogenase\b|\bACAD\w*\b'
     r'|\benoyl-CoA.hydratase\b|\bhydroxyacyl-CoA.dehydrogenase\b'
     r'|\bketothiolase\b|\bperoxisomal.acyl-CoA.oxidase\b|\bACOX\w+\b'
     r'|\bfatty.acyl-CoA.reductase\b|\b3-ketoacyl-CoA\b|\bfadB\b'
     r'|\bpaaH\b|\bmmgB\b',                                        'Beta_Oxidation'),

    # ── Mitochondrial ETC / OXPHOS ────────────────────────────────────────────
    (r'\bNADH.dehydrogenase.ubiquinone\b|\bNDUF[A-Z]\d+\b'
     r'|\bcomplex.I\b|\bundiquinone.reductase\b|\bcomplex.III\b'
     r'|\bubiquinol.cytochrome.c.reductase\b|\bcomplex.IV\b'
     r'|\bcytochrome.c.oxidase\b|\bCOX\d+\b|\bcomplex.II\b'
     r'|\bsuccinate.dehydrogenase.ubiquinone\b|\bSDH\w+\b',        'Mitochondrial_ETC'),

    # ── ATP synthase ──────────────────────────────────────────────────────────
    (r'\bATP.synthase\b|\bF.type.H..transporting.ATPase\b|\bATPeF\w+\b'
     r'|\bV.type.H..transporting.ATPase\b|\bATPeV\w+\b'
     r'|\bF.type.ATPase\b|\bV.type.ATPase\b',                      'ATP_Synthase'),

    # ── Iron-sulfur cluster ───────────────────────────────────────────────────
    (r'\biron.sulfur.cluster\b|\bISCA\w+\b|\bISCU\b|\bNFU\w+\b'
     r'|\bSUF[ABCDE]\b|\bsufD\b|\bNIFU\w+\b|\bFrataxin\b|\bFXN\b'
     r'|\biron-sulfur.assembly\b|\bCIA\w+\b',                      'Iron_Sulfur_Cluster'),

    # ── Heme / porphyrin biosynthesis ─────────────────────────────────────────
    (r'\bheme.biosynthesis\b|\bheme.oxygenase\b|\bHMOX\b|\bdelta-aminolevulinic\b'
     r'|\baminolevulinate\b|\bporphobilinogen\b|\buroporphyrinogen\b'
     r'|\bcoproporphyrinogen\b|\bprotoporphyrinogen\b|\bferrochelatase\b'
     r'|\bglutamyl-tRNA.reductase\b|\bGTR\b(?!\w)|\bsirohydrochlorin\b'
     r'|\bmagnesium.protoporphyrin\b|\bmagnesium.chelatase\b|\bCHLH\b|\bCHLD\b|\bCHLI\b',
                                                                    'Heme_Porphyrin'),

    # ── Molybdenum cofactor ───────────────────────────────────────────────────
    (r'\bmolybdenum.cofactor\b|\bmolybdopterin\b|\bMOCS\w+\b|\bMOBD\w+\b'
     r'|\bmolybdopterin.synthase\b|\bmolybdate.transporter\b|\bMOT\w+\b',
                                                                    'Molybdenum_Cofactor'),

    # ── Cell wall / pectin / xyloglucan (extended) ────────────────────────────
    (r'\bxyloglucan.endotransglucosylase\b|\bXTH\b|\bXEH\b'
     r'|\bpectin.methylesterase\b|\bpolygalacturonase\b|\bpectate.lyase\b'
     r'|\barabinosyltransferase\b|\bfucosyltransferase\b'
     r'|\bmannan.endo.mannosidase\b|\bmannosidase\b'
     r'|\bgalactose.oxidase\b|\bgalacturonase\b',                  'Pectin_Cell_Wall'),

    # ── Callose / 1,3-glucan ──────────────────────────────────────────────────
    (r'\bcallose.synthase\b|\b1,3.beta.glucan.synthase\b|\bGSL\w+\b'
     r'|\bFKS\w+\b|\bcallose\b',                                   'Callose_Biosynthesis'),

    # ── Cuticle / surface lipids ──────────────────────────────────────────────
    (r'\bcuticular\b|\blong.chain.fatty.acid\b|\b3-ketoacyl-CoA.synthase\b'
     r'|\bKCS\w+\b|\bECR\w+\b|\bvery-long-chain\b|\bVLC\w+\b'
     r'|\breductase.*ketoacyl\b|\bKCR\w+\b',                       'VLC_Fatty_Acid_Cuticular'),

    # ── Shikimate / aromatic amino acid biosynthesis ──────────────────────────
    (r'\bshikimate\b|\bchorismate\b|\bchorismate.synthase\b|\bchorismate.mutase\b'
     r'|\bprephenate\b|\bdehydroquinate\b|\bEPSP.synthase\b|\b3-dehydroquinate\b'
     r'|\bphosphoshikimate\b|\bshikimate.kinase\b|\barogenate\b',   'Shikimate_Pathway'),

    # ── Sulfur assimilation ───────────────────────────────────────────────────
    (r'\bsulfate.adenylyltransferase\b|\badenylyl.sulfate.reductase\b'
     r'|\bsulfite.reductase\b|\bAPS.reductase\b|\bSULTR\w+\b'
     r'|\bsulfate.transporter\b|\badenylyl-sulfate.kinase\b|\bAKN\w+\b'
     r'|\bsulfate.reducing\b|\bmolybdate.anion.transporter\b',     'Sulfur_Assimilation'),

    # ── Selenocysteine / selenium ─────────────────────────────────────────────
    (r'\bselenocysteine\b|\bselenium\b|\bselenoprotein\b|\bSELT\b'
     r'|\bcysteine.desulfurase\b|\bselenate\b',                    'Selenium_Metabolism'),

    # ── Photorespiration ──────────────────────────────────────────────────────
    (r'\bphotorespiration\b|\bglycolate\b|\bglyoxylate\b'
     r'|\bphosphoglycolate.phosphatase\b|\bglycerate.kinase\b'
     r'|\bserine.glyoxylate.transaminase\b|\bGLYK\b|\bplastidal.glycolate\b',
                                                                    'Photorespiration'),

    # ── C4 photosynthesis ─────────────────────────────────────────────────────
    (r'\bphosphoenolpyruvate.carboxylase\b|\bPEPCarboxylase\b|\bPEPC\b(?!.*kinase)'
     r'|\bNADP.malate.dehydrogenase\b|\bNADP.malic.enzyme\b|\bPCK\b'
     r'|\bC4.carbon.concentrating\b',                              'C4_Photosynthesis'),

    # ── Chlorophyll degradation / senescence ──────────────────────────────────
    (r'\bchlorophyll.degradation\b|\bsenescence\b|\bNYC1\b|\bNOL\b'
     r'|\bpheophorbide.a.oxygenase\b|\bSGR\w+\b|\bstay.green\b'
     r'|\bRCCR\b|\bSAG\w+\b|\bsenescence.specific\b',             'Chlorophyll_Degradation'),

    # ── Circadian clock ───────────────────────────────────────────────────────
    (r'\bcircadian\b|\bTOC1\b|\bCCA1\b|\bLHY\b|\bGI\b(?!.*gibberellin)'
     r'|\bPRR\d+\b|\bFKF1\b|\bZTL\b|\bLKP\w+\b|\bELF\d+\b(?!.*elongator)'
     r'|\bpseudo.response.regulator\b|\bclock\b(?!.*complex)',     'Circadian_Clock'),

    # ── Flowering time / photoperiod ──────────────────────────────────────────
    (r'\bflowering.time\b|\bFLOWERING.LOCUS\b|\bFLC\b|\bFT\b(?!.*FtsH)'
     r'|\bSOC1\b|\bAP1\b|\bLFY\b|\bCO\b(?!.*coatomer)|\bFUL\b'
     r'|\bVRN\d+\b|\bSVP\b|\bSEP\d+\b|\bMOT\d+\b(?!.*molyb)',   'Flowering_Time'),

    # ── Light signaling / photoreceptor ───────────────────────────────────────
    (r'\bphytochrome\b|\bPHY[ABCDE]\b|\bcryptochrome\b|\bCRY\w*\b'
     r'|\bUVR8\b|\bphototropin\b|\bphotolyase\b|\bPHR\w+\b'
     r'|\bblue.light.receptor\b|\bUVB.receptor\b|\bHY5\b|\bCOP1\b(?!.*cop)',
                                                                    'Light_Signaling'),

    # ── Plant defense / immunity ──────────────────────────────────────────────
    (r'\bdisease.resistance\b|\bNBS.LRR\b|\bNB.ARC\b|\bTIR.NBS\b'
     r'|\bR.gene\b|\bRGA\w+\b|\bRPS\w+\b|\bRPM\w+\b|\bRPP\w+\b'
     r'|\bLRR.kinase\b|\bWRKY\b|\bPR.protein\b|\bpathogenesis.related\b'
     r'|\bNLR\b|\bCNL\b|\bTNL\b',                                 'Plant_Defense_Immunity'),

    # ── Plant receptor kinase ─────────────────────────────────────────────────
    (r'\bLRR.receptor.like.kinase\b|\bRLK\b|\bWAK\w+\b|\bCLAVATA\b'
     r'|\bCLV\d+\b|\bHSL\w+\b|\bFEI\d+\b|\bBAK1\b|\bBRI1\b'
     r'|\breceptor.like.protein.kinase\b|\bRLP\w+\b',              'Receptor_Kinase'),

    # ── Two-component signaling ───────────────────────────────────────────────
    (r'\btwo.component\b|\bhistidine.kinase\b|\bresponse.regulator\b'
     r'|\bARR\d+\b|\bARR.type\b|\bAHK\d+\b|\bAHP\w+\b'
     r'|\bphospho.relay\b',                                        'Two_Component_Signaling'),

    # ── Hormone signaling integration ─────────────────────────────────────────
    (r'\bCBL.interacting\b|\bCIPK\w+\b|\bSnRK\w+\b|\bAKIN\w+\b'
     r'|\bSNF1.related\b|\btarget.of.rapamycin\b|\bTOR\b(?!.*torpedo)',
                                                                    'TOR_SnRK_Signaling'),

    # ── GTP-binding / small GTPase ────────────────────────────────────────────
    (r'\bRab.GTPase\b|\bARF.GTPase\b|\bRan.GTPase\b|\bRho.GTPase\b'
     r'|\bROP\b(?!.*ROP.*protein)|\bRac\b(?!\w)|\bsmall.GTPase\b'
     r'|\bRAB[A-Z]\w+\b|\bRABG\w+\b|\bRABH\w+\b',                'Small_GTPase'),

    # ── Cell division / cytokinesis ───────────────────────────────────────────
    (r'\bcell.division.protein\b|\bFtsZ\b|\bFtsH\b(?!.*protease)'
     r'|\bDynamin\b|\bARC\d+\b|\bPlastid.division\b|\bCDP\d+\b',  'Plastid_Division'),

    # ── ABC transporters ──────────────────────────────────────────────────────
    (r'\bABC.transporter\b|\bABCB\w+\b|\bABCC\w+\b|\bABCG\w+\b'
     r'|\bABCF\w+\b|\bABCD\w+\b|\bMDR\b(?!.*multiple.drug)',      'ABC_Transporter'),

    # ── Major facilitator superfamily (MFS) ───────────────────────────────────
    (r'\bMajor.Facilitator.Superfamily\b|\bMFS\b(?!\w)|\bMATE\b(?!\w)'
     r'|\bMFS.transporter\b|\bMFS.domain\b',                       'MFS_Transport'),

    # ── Sugar transport ───────────────────────────────────────────────────────
    (r'\bsugar.transport\b|\bglucose.transporter\b|\bSWEET\w+\b'
     r'|\bSTP\d+\b|\bsugar.phosphate.transporter\b|\bTriose.phosphate.translocator\b'
     r'|\bTPT\b(?!\w)|\bGLUT\w+\b|\bHT\d+\b(?!.*heat)',           'Sugar_Transport'),

    # ── Nitrate / nitrogen transport ──────────────────────────────────────────
    (r'\bnitrate.transporter\b|\bNRT\w+\b|\bhigh.affinity.nitrate\b'
     r'|\bammonium.transporter\b|\bAMT\w+\b|\bNPF\w+\b|\bNRT1\b|\bNRT2\b',
                                                                    'Nitrate_Transport'),

    # ── Aquaporin / water channel ─────────────────────────────────────────────
    (r'\baquaporin\b|\bTIP\w+\b|\bNIP\w+\b|\bPIP\w+\b|\bSIP\w+\b'
     r'|\bwater.channel\b|\bXIP\b(?!\w)',                          'Aquaporin'),

    # ── Potassium / ion channel ───────────────────────────────────────────────
    (r'\bpotassium.channel\b|\bpotassium.transporter\b|\bKAT\w+\b|\bAKT\w+\b'
     r'|\bSKOR\b|\bGORK\b|\bHAK\w+\b|\bKT\w+\b|\bCyclic.nucleotide.gated.channel\b'
     r'|\bCNGC\w+\b|\btwo.pore.potassium\b',                      'Potassium_Transport'),

    # ── Calcium transport ─────────────────────────────────────────────────────
    (r'\bcalcium.transporting.ATPase\b|\bcalcium-transporting.ATPase\b'
     r'|\bACA\w+\b|\bECA\w+\b|\bCCH\w+\b|\bTPC\d+\b|\bCAX\w+\b'
     r'|\bcalcium.uniporter\b|\bMCU\w+\b',                        'Calcium_Transport'),

    # ── Proton pump / V-ATPase ────────────────────────────────────────────────
    (r'\bvacuolar.H..ATPase\b|\bV-type.H..transporting\b|\bVHA\w+\b'
     r'|\bproton.pump\b|\bplasma.membrane.H..ATPase\b|\bAHA\w+\b'
     r'|\bPMA\w+\b|\bATPase.subunit\b(?!.*F-type)',               'Proton_Pump'),

    # ── Heavy metal / metal homeostasis ───────────────────────────────────────
    (r'\bheavy.metal.transport\b|\bHMA\w+\b|\bNRAMP\w+\b|\bMTP\w+\b'
     r'|\bzinc.transporter\b|\bZIP\b(?!.*zipper)|\bZRT\w+\b|\bFPN\w+\b'
     r'|\bferritin\b|\bIRT\w+\b|\biron.regulated.transporter\b',  'Metal_Homeostasis'),

    # ── Phosphate signaling / transport ───────────────────────────────────────
    (r'\bphosphate.transporter\b|\bPHT\w+\b|\bPT\d+\b(?!.*protein)'
     r'|\bphosphate.signaling\b|\bSPX\b|\bSPX.domain\b|\bPHO\d+\b'
     r'|\binorganic.phosphate.transporter\b|\bNLA\b(?!.*nitrogen)',
                                                                    'Phosphate_Transport'),

    # ── Sulfate transport ─────────────────────────────────────────────────────
    (r'\bsulfate.transporter\b|\bSULTR\w+\b|\bsulfite.exporter\b'
     r'|\btaurine.transporter\b|\bTauE\b|\bSafE\b',               'Sulfate_Transport'),

    # ── Cell plate / cytokinesis (plant) ──────────────────────────────────────
    (r'\bKNOLLE\b|\bPHRAGMOPLAST\b|\bkinesin.*cytokinesis\b'
     r'|\bcell.plate\b|\bsyntaxin.*131\b|\bsyntaxin.*132\b',       'Plant_Cytokinesis'),

    # ── Protein sorting / ER-Golgi ────────────────────────────────────────────
    (r'\bSEC\d+\b(?!.*SEC-independent)|\bVPS\d+\b|\bCOPII\b|\bSNARE\b'
     r'|\bVSR\w+\b|\bVPS\b(?!\w)|\bSEC61\b|\bSEC63\b|\bSEC62\b'
     r'|\btranslocon\b(?!.*chloro)|\bSRP\w+\b(?!.*signal)',        'Protein_Sorting_Secretory'),

    # ── ESCRT / endosome ──────────────────────────────────────────────────────
    (r'\bESCRT\b|\bVPS\d+\b|\bCHMP\w+\b|\bALIX\b|\bPDCD6IP\b'
     r'|\bmultivesicular.body\b|\bMVB\b(?!\w)|\bHRS\b(?!\w)',     'ESCRT_Endosome'),

    # ── Autophagy-related kinase ──────────────────────────────────────────────
    (r'\bVPS34\b|\bATG\d+\b|\bBECN\w+\b|\bULK\w+\b|\bRubiCON\b',
                                                                    'Autophagy'),

    # ── Mitophagy / selective autophagy ──────────────────────────────────────
    (r'\bmitophagy\b|\bATG8\b|\bNBR1\b|\bSQ\w+\b|\bSELECTIVE.autophagy\b',
                                                                    'Selective_Autophagy'),

    # ── mTOR signaling ────────────────────────────────────────────────────────
    (r'\bmTOR\b|\bRAPTOR\b|\bRICTOR\b|\bLST8\b|\bFRAP\b|\bTOR.complex\b'
     r'|\btarget.of.rapamycin\b|\bS6.kinase\b|\bRPS6KB\b',        'TOR_Signaling'),

    # ── RNA interference / small RNA ──────────────────────────────────────────
    (r'\bAGO\d+\b|\bARGONAUTE\b|\bDCL\d+\b|\bDICER\b|\bRDR\d+\b'
     r'|\bmiRNA\b|\bsiRNA\b|\bRNA.directed.RNA.polymerase\b|\bSGS\w+\b'
     r'|\bRDRP\b|\bRNA.silencing\b|\bHYL\w+\b|\bSE.protein\b',   'RNA_Interference'),

    # ── Telomere / telomerase ─────────────────────────────────────────────────
    (r'\btelomere\b|\btelomerase\b|\bTERT\b|\bTELO\w+\b|\bTRF\w+\b'
     r'|\btelomere.repeat.binding\b|\btelomere.length.regulation\b',
                                                                    'Telomere_Maintenance'),

    # ── Meiosis / recombination ───────────────────────────────────────────────
    (r'\bmeiosis\b|\bDMC1\b|\bMSH[45]\b|\bMLH3\b|\bSPO11\b|\bSYCP\w+\b'
     r'|\bsynaptonemal.complex\b|\bhomologous.recombination\b|\bHFM\w+\b'
     r'|\bMER3\b|\bZYP\w+\b|\bASY\w+\b|\bMUT\w+\b(?!.*mutant)',  'Meiosis_Recombination'),

    # ── Kinetochore / spindle assembly checkpoint ─────────────────────────────
    (r'\bkinetochore\b|\bMAD\d+\b|\bBUB\d+\b|\bNDC80\b|\bNUF2\b'
     r'|\bSPC\d+\b|\bspindle.assembly.checkpoint\b|\bMAD1L\b|\bZW10\b',
                                                                    'Kinetochore_SAC'),

    # ── Gamma-tubulin / centrosome ────────────────────────────────────────────
    (r'\bgamma.tubulin\b|\bTUBGCP\w+\b|\bGCP\d+\b|\bNEDD1\b|\bHAUS\w+\b'
     r'|\baugmin\b|\bcentrosome\b|\bgamma-tubulin.complex\b',      'Gamma_Tubulin_Centrosome'),

    # ── Katanin / microtubule severing ────────────────────────────────────────
    (r'\bkatanin\b|\bKTN\w+\b|\bspastin\b|\bfidgetin\b|\bMEI2\b(?!.*like)'
     r'|\bmicrotubule.severing\b',                                  'Microtubule_Severing'),

    # ── Golgin / TRAPP complex ────────────────────────────────────────────────
    (r'\bGolgin\b|\bGolgin.candidate\b|\bTRAP\b(?!.*plant)|\bTRAPP\w+\b'
     r'|\bconserved.oligomeric.Golgi\b|\bCOG\d+\b',               'Golgi_TRAPP'),

    # ── Signal recognition particle ───────────────────────────────────────────
    (r'\bsignal.recognition.particle\b|\bSRP\d+\b|\bSRP9\b|\bSRP14\b'
     r'|\bSRP54\b|\bSRP68\b|\bSRP72\b|\bSRPR\b|\bftsY\b',        'Signal_Recognition_Particle'),

    # ── GPI anchor synthesis ──────────────────────────────────────────────────
    (r'\bGPI.anchor\b|\bphosphatidylinositol.glycan\b|\bPIG[A-Z]\b'
     r'|\bGPI.biosynthesis\b|\bGAA1\b|\bGPI.inositol-deacylase\b',
                                                                    'GPI_Anchor'),

    # ── Cohesin / condensin ───────────────────────────────────────────────────
    (r'\bcohesin\b|\bcondensins\b|\bSMC\d+\b|\bSCC\d+\b|\bPDS5\b'
     r'|\bWAPL\b|\bRAD21\b|\bSCC\w+\b|\bNIPBL\b|\bSCC2\b',       'Cohesin_Condensin'),

    # ── Clathrin / endocytosis ────────────────────────────────────────────────
    (r'\bclathrin\b|\bCLTC\b|\bAP.complex\b|\bAP2\w+\b|\bepsin\b'
     r'|\bendocytosis\b|\bclathrin.heavy.chain\b|\bAP[124].complex\b',
                                                                    'Clathrin_Endocytosis'),

    # ── Exocyst complex ───────────────────────────────────────────────────────
    (r'\bexocyst\b|\bEXOC\d+\b|\bSEC\d+\b(?!.*secA)|\bEXO\d+\b'
     r'|\bexocyst.complex\b',                                       'Exocyst_Complex'),

    # ── Retrotransposon / transposon ──────────────────────────────────────────
    (r'\bretrotransposon\b|\btransposon\b|\breverse.transcriptase\b'
     r'|\bRNA-directed.DNA.polymerase\b|\bGAG.POL\b|\bLTR\b(?!\w)'
     r'|\bintegrase\b|\btransposase\b',                            'Transposon_Retrotransposon'),

    # ── Meristem / stem cell identity ─────────────────────────────────────────
    (r'\bmeristem\b|\bWUSCHEL\b|\bWUS\b(?!.*wustite)|\bCLAVATA\b'
     r'|\bSTEM.CELL\b|\bapical.meristem\b|\bmeristematic\b',       'Meristem_Identity'),

    # ── Seed storage / late embryogenesis ────────────────────────────────────
    (r'\bseed.storage\b|\blate.embryogenesis\b|\bLEA\b(?!\w)|\bdesiccation\b'
     r'|\bEM\b(?!.*embryo.defect)|\bdehydrin\b|\bseed.maturation\b'
     r'|\bstorage.protein\b',                                       'Seed_Storage_LEA'),

    # ── Pollen / male gametophyte ─────────────────────────────────────────────
    (r'\bpollen\b|\bgametophyte\b|\btube.tip.growth\b|\bDUO\d+\b'
     r'|\bSPERM\b(?!\w)|\bpollen.tube\b|\bgermination.*pollen\b',  'Pollen_Gametophyte'),

    # ── Root development ──────────────────────────────────────────────────────
    (r'\broot.development\b|\broot.hair\b|\bPLT\w+\b(?!.*plat)'
     r'|\bSCR\b(?!.*secretory)|\bSHR\b(?!.*SHR)|\bWOX\w+\b|\bRGF\w+\b',
                                                                    'Root_Development'),

    # ── Chloroplast biogenesis ─────────────────────────────────────────────────
    (r'\bchloroplast.biogenesis\b|\balbino\b|\bpale.cress\b|\bOTP\w+\b'
     r'|\bpentapeptide.repeat\b|\bPAC\w+\b(?!.*pre-initiation)',   'Chloroplast_Biogenesis'),

    # ── RNA editing (plant organelle) ────────────────────────────────────────
    (r'\bRNA.editing\b|\bPPR.protein\b|\bPPR\b(?!.*ppar)'
     r'|\bpentatricopeptide.repeat\b|\bMEF\d+\b|\bELIP\b|\bOTP\d+\b'
     r'|\bDYW.domain\b|\bDYW\b(?!\w)',                             'RNA_Editing'),

    # ── Ribosome (large subunit / small subunit proteins) ─────────────────────
    (r'\b60S.ribosomal.protein\b|\b40S.ribosomal.protein\b'
     r'|\blarge.subunit.ribosomal.protein\b|\bsmall.subunit.ribosomal.protein\b'
     r'|\b50S.ribosomal.protein\b|\b30S.ribosomal.protein\b'
     r'|\b39S.ribosomal.protein\b|\b28S.ribosomal.protein\b',      'Ribosome_Biogenesis'),

    # ── Elongation factor ─────────────────────────────────────────────────────
    (r'\belongation.factor\b|\bEEF\w+\b|\bEF.TU\b|\bEF.TS\b|\bEF.G\b'
     r'|\bEF.P\b|\bEF1\b(?!\w)|\bEF2\b(?!\w)|\bEFG\b|\bTSF\b',  'Translation_Elongation'),

    # ── Initiation factor ─────────────────────────────────────────────────────
    (r'\binitiation.factor\b|\bEIF[234]\w+\b|\beIF\w+\b|\bEIF2B\w+\b'
     r'|\btranslation.initiation\b|\bIF[123]\b(?!\w)',              'Translation_Initiation'),

    # ── Peptide release / termination ─────────────────────────────────────────
    (r'\bpeptide.chain.release.factor\b|\bERF3\b|\bGSPT\b|\bSUP45\b'
     r'|\beukaryotic.peptide.chain.release\b|\bETF\b(?!\w)',        'Translation_Termination'),

    # ── Poly-A / mRNA 3' processing ───────────────────────────────────────────
    (r'\bpolyadenylation\b|\bCPSF\w+\b|\bcleavage.stimulation.factor\b'
     r'|\bCSTF\w+\b|\bcleavage.polyadenylation\b|\bPAP\b(?!\w)'
     r'|\bpoly.A.polymerase\b|\bpoly.A.binding.protein\b|\bPABP\w+\b'
     r'|\bFIP1\b|\bRNA14\b|\bRNA15\b',                             'mRNA_3_Processing'),

    # ── RNA cap / 5' processing ───────────────────────────────────────────────
    (r'\bmRNA.cap\b|\bguanine-N7.methyltransferase\b|\bCBP80\b|\bCBP20\b'
     r'|\bmRNA-capping.enzyme\b|\bRNA.3.terminal.phosphate.cyclase\b'
     r'|\bCRC1\b|\bABH1\b',                                        'mRNA_5_Processing'),

    # ── Protein N-terminal processing ─────────────────────────────────────────
    (r'\bN-terminal.acetyltransferase\b|\bNatA\b|\bNatB\b|\bNatC\b|\bNatD\b|\bNatE\b'
     r'|\bmethionine.aminopeptidase\b|\bMAP\d+\b(?!.*MAPK)'
     r'|\bN-terminal.methionine\b',                                 'Protein_N_Terminal_Processing'),

    # ── Protein phosphorylation (specific contexts) ───────────────────────────
    (r'\bcasein.kinase\b|\bCK[12]\b(?!\w)|\bAurora.kinase\b|\bAURK\w+\b'
     r'|\bNEK\d+\b|\bWNK\d+\b|\bRIO.kinase\b|\bRIOK\w+\b'
     r'|\bhaspin\b|\bGSG2\b|\bSRPK\w+\b|\bDYRK\w+\b|\bSTK\d+\b',
                                                                    'Protein_Phosphorylation'),

    # ── SUMO modification ─────────────────────────────────────────────────────
    (r'\bSUMO\b|\bSENP\w+\b|\bSUMO.E\d+\b|\bSUMO.conjugat\w+\b'
     r'|\bUBC9\b|\bUBE2I\b|\bSAE\d+\b|\bUBA2\b|\bUBLE1\w+\b'
     r'|\bdesumoylating\b|\bSMT\d+\b(?!.*sterol)',                  'SUMO_Modification'),

    # ── UFM1 modification ─────────────────────────────────────────────────────
    (r'\bUFM1\b|\bUFC1\b|\bUBA5\b|\bUFMYL\b|\bDDRGK\b|\bE3.UFM1.protein.ligase\b',
                                                                    'UFM1_Modification'),

    # ── Nucleoporin / nuclear pore ────────────────────────────────────────────
    (r'\bnucleoporin\b|\bNUP\d+\b|\bGLE1\b|\bNUPL\w+\b|\bSEH1\b'
     r'|\bnuclear.pore.complex\b|\bNDC1\b|\bPOM\w+\b|\bAAAS\b',   'Nuclear_Pore'),

    # ── Karyopherin / importin ────────────────────────────────────────────────
    (r'\bimportin\b|\bexportin\b|\bkaryopherin\b|\bTNPO\w+\b|\bCSE1\b'
     r'|\bXPO\w+\b|\bRanBP\w+\b|\bRANBP\w+\b|\bRAN.binding\b',   'Karyopherin_Import'),

    # ── Histone chaperone ─────────────────────────────────────────────────────
    (r'\bhistone.chaperone\b|\bASF1\b|\bCAF1\b|\bCHAF\w+\b|\bFACT\b(?!\w)'
     r'|\bSPT16\b|\bHIRA\b|\bNAP1\b|\bNAP2\b|\bNRP\w+\b',        'Histone_Chaperone'),

    # ── THO complex / transcription elongation ────────────────────────────────
    (r'\bTHO.complex\b|\bTHOC\w+\b|\bPAF1.complex\b|\bPAF1\b'
     r'|\bRTF1\b|\bLEO1\b|\bCTR9\b|\bSPT\d+\b|\belongator.complex\b'
     r'|\bELP\d+\b|\btranscription.elongation.factor\b|\bTFIIS\b',
                                                                    'Transcription_Elongation'),

    # ── Mediator complex ──────────────────────────────────────────────────────
    (r'\bMediator\b|\bMED\d+\b(?!.*medical)|\bmediator.of.RNA.polymerase\b'
     r'|\bRGR1\b|\bSRB\d+\b|\bmediator.subunit\b|\bnuclear.receptor.co.repressor\b',
                                                                    'Mediator_Complex'),

    # ── General transcription factors ────────────────────────────────────────
    (r'\bTFIIA\b|\bTFIIB\b|\bTFIID\b|\bTFIIE\b|\bTFIIF\b|\bTFIIH\b'
     r'|\bTAF\d+\b|\bGTF2\w+\b|\bTBP\b(?!\w)|\bTATA.box.binding\b'
     r'|\btranscription.initiation.factor\b',                       'General_Transcription'),

    # ── RNA polymerase I / II / III ───────────────────────────────────────────
    (r'\bRNA.polymerase.I\b|\bPOLR1\w+\b|\bRPA\d+\b(?!.*replication)'
     r'|\bRNA.polymerase.II\b|\bRPB\d+\b|\bPOLR2\w+\b'
     r'|\bRNA.polymerase.III\b|\bRPC\d+\b|\bPOLR3\w+\b',          'RNA_Polymerase'),

    # ── Plastid RNA polymerase / sigma factor ─────────────────────────────────
    (r'\bsigma.factor\b|\bSIG[A-F]\w*\b|\bplastid.sigma\b'
     r'|\bRNA.polymerase.sigma\b|\bplastid.RNA.polymerase\b',       'Plastid_RNA_Polymerase'),

    # ── Coatomer / COPI ───────────────────────────────────────────────────────
    (r'\bcoatomer\b|\bCOPB\w+\b|\bCOPG\b|\bCOPD\b|\bCOPZ\b|\bSEC26\b'
     r'|\bCOPI.vesicle\b|\bCOP.I.coated\b',                        'COPI_Coatomer'),

    # ── COPII vesicle ─────────────────────────────────────────────────────────
    (r'\bCOPII\b|\bSEC13\b|\bSEC23\b|\bSEC24\b|\bSEC31\b|\bSAR1\b'
     r'|\bSar1.GTPase\b|\bCOPII.vesicle\b',                        'COPII_Vesicle'),

    # ── Retromer / endosome recycling ─────────────────────────────────────────
    (r'\bretromer\b|\bVPS26\b|\bVPS29\b|\bVPS35\b|\bsorting.nexin\b'
     r'|\bSNX\w+\b|\bVSR.sorting\b|\bCargo.receptor\b',            'Retromer_Recycling'),

    # ── Mitochondrial ribosome ────────────────────────────────────────────────
    (r'\bmitochondrial.ribosome\b|\bMRPS\w+\b|\bMRPL\w+\b|\b39S.ribosomal\b'
     r'|\b28S.ribosomal\b|\b37S.ribosomal\b|\bmitochondrial.*ribosomal.protein\b',
                                                                    'Mitochondrial_Ribosome'),

    # ── Plastid ribosome ──────────────────────────────────────────────────────
    (r'\bplastid.ribosome\b|\bchloroplast.ribosome\b|\b50S.ribosomal.protein.L\w+.*chloro\b'
     r'|\b30S.ribosomal.protein.S\w+.*chloro\b|\bplastid.rRNA\b',  'Plastid_Ribosome'),

    # ── Mitochondrial DNA / genome maintenance ────────────────────────────────
    (r'\bmitochondrial.DNA\b|\bmtDNA\b|\bTwinkle\b|\bPEO1\b|\bSingle-stranded.DNA.binding.*mitochondrial\b'
     r'|\bWHY2\b|\bRecA.*mitochondrial\b|\bDNA.gyrase.*mitochondrial\b',
                                                                    'Mitochondrial_DNA'),

    # ── Organelle division ────────────────────────────────────────────────────
    (r'\bFtsZ\b|\bARC\w+\b|\bplastid.division\b|\bDRP\w+\b'
     r'|\bdynamin.related\b|\bARC5\b|\bARC6\b|\bPDV\w+\b',        'Organelle_Division'),

    # ── Mitochondrial fusion / fission ────────────────────────────────────────
    (r'\bmitochondrial.fusion\b|\bmitochondrial.fission\b|\bDNM1L\b'
     r'|\bDRP1\b|\bFIS1\b|\bMFN\w+\b|\bMID\w+\b|\bMIRO\w+\b',   'Mitochondrial_Dynamics'),

    # ── Pyruvate dehydrogenase complex ────────────────────────────────────────
    (r'\bpyruvate.dehydrogenase\b|\bPDHA\b|\bPDHB\b|\bDIHYDROLIPOYL\b'
     r'|\bdihydrolipoamide.acetyltransferase\b|\bdihydrolipoyl.dehydrogenase\b'
     r'|\bPDC\b(?!.*Polycomb)',                                     'Pyruvate_Dehydrogenase'),

    # ── 2-oxoglutarate dehydrogenase ──────────────────────────────────────────
    (r'\boxoglutarate.dehydrogenase\b|\b2-oxoglutarate.dehydrogenase\b'
     r'|\boxoglutarate.dehydrogenase.succinyl-transferring\b|\bOGDH\b',
                                                                    'Oxoglutarate_Dehydrogenase'),

    # ── Branched-chain amino acid (BCAA) synthesis ────────────────────────────
    (r'\bbranched.chain.amino.acid.aminotransferase\b|\bBCAT\w+\b'
     r'|\bbranched-chain-amino-acid.aminotransferase\b|\bisovaleryl-CoA.dehydrogenase\b'
     r'|\bmethylcrotonyl-CoA.carboxylase\b',                        'BCAA_Synthesis'),

    # ── Cysteine / methionine sulfur cycle ────────────────────────────────────
    (r'\bcystathionine.beta-synthase\b|\bcystathionine.gamma-lyase\b'
     r'|\bhercynylcysteine.sulfoxide.lyase\b|\bchaC\b|\bhomocysteine.methyltransferase\b'
     r'|\bsulfide:quinone.reductase\b',                             'Sulfur_Amino_Acid_Cycle'),

    # ── Sterol biosynthesis ───────────────────────────────────────────────────
    (r'\bsqualene.synthase\b|\bsqualene.epoxidase\b|\bcycloartenol.synthase\b'
     r'|\bsterol.C14.reductase\b|\bsterol.C22.desaturase\b|\bsterol.C24.methyltransferase\b'
     r'|\bSMT\d+\b|\bERG\d+\b|\bobtusufoliol.14-demethylase\b|\bsterol.methyltransferase\b'
     r'|\bmethylsterol.monooxygenase\b|\bcholestenol.delta-isomerase\b|\bEBP\b(?!\w)',
                                                                    'Sterol_Biosynthesis'),

    # ── Isoprenoid / MEP / DXS pathway ───────────────────────────────────────
    (r'\bMEP.pathway\b|\bDXS\b(?!.*gene)|\bDXR\b|\bMCT\b(?!\w)|\bCMK\b(?!\w)'
     r'|\bHDS\b(?!\w)|\bHDR\b(?!\w)|\bGECI\b|\b1-deoxy-D-xylulose-5-phosphate.synthase\b'
     r'|\bDXP.reductoisomerase\b|\b2-C-methyl-D-erythritol\b',     'MEP_Isoprenoid'),

    # ── Sesquiterpene / diterpene synthesis ───────────────────────────────────
    (r'\bsesquiterpene\b|\bditerpene\b|\bmonoterpene\b|\bterpene.synthase\b'
     r'|\bkaurene.synthase\b|\bkaurene\b|\bcopalyl.diphosphate.synthase\b',
                                                                    'Terpene_Synthase'),

    # ── Suberin / wax biosynthesis ────────────────────────────────────────────
    (r'\bsuberin\b|\bfatty.acid.export\b|\bFAX\b|\bFAE\d+\b'
     r'|\bacyl-CoA.synthetase.*peroxisomal\b|\bacyl.carrier.protein\b|\bACP\d+\b',
                                                                    'Suberin_Wax_Biosynthesis'),

    # ── Indole metabolism / IAA precursors ────────────────────────────────────
    (r'\bindole.glucosinolate.O-methyltransferase\b|\bindole.glucosinolate\b'
     r'|\btryptophan.biosynthesis\b|\btrpCF\b|\banthranilate\b',   'Indole_Metabolism'),

    # ── Phenylpropanoid / lignin precursor ────────────────────────────────────
    (r'\bphenylalanine.ammonia.lyase\b|\bPAL\d+\b|\b4-coumarate.CoA.ligase\b'
     r'|\b4CL\b(?!\w)|\bcaffeate.O-methyltransferase\b|\bCOMT\b(?!\w)'
     r'|\bcaffeoy.CoA.O-methyltransferase\b|\bCCoAOMT\b',          'Phenylpropanoid_Lignin'),

    # ── Chlorogenic acid ─────────────────────────────────────────────────────
    (r'\bchlorogenic.acid\b|\bhydroxycinnamoyl.transferase\b|\bHCT\b(?!\w)'
     r'|\bquinate\b|\bshikimate.hydroxy\b',                         'Chlorogenic_Acid'),

    # ── Stilbene / resveratrol ────────────────────────────────────────────────
    (r'\bstilbene\b|\bresveratrol\b|\bstilbene.synthase\b|\bSTS\b(?!\w)',
                                                                    'Stilbene_Metabolism'),

    # ── Proanthocyanidin / tannin ─────────────────────────────────────────────
    (r'\bproanthocyanidin\b|\btannin\b|\bLAR\b(?!\w)|\bANR\b(?!\w)'
     r'|\bleucanthocyanidin.reductase\b|\banthocy.anidin.reductase\b',
                                                                    'Proanthocyanidin'),

    # ── Ploidy / endoreduplication ────────────────────────────────────────────
    (r'\bendoreduplication\b|\bendoreplication\b|\bSMR\b(?!.*SMR protein)'
     r'|\bploid\b|\bE2F.transcription\b|\bE2FB\b|\bDPa\b(?!\w)',   'Endoreduplication'),

    # ── Programmed cell death ─────────────────────────────────────────────────
    (r'\bprogrammed.cell.death\b|\bapoptosis\b|\bcaspase\b|\bmetacaspase\b'
     r'|\bMC\d+\b(?!.*megadalton)|\bBAX.inhibitor\b|\bBI.1\b|\bDAD1\b',
                                                                    'Programmed_Cell_Death'),

    # ── Reactive oxygen species generation ───────────────────────────────────
    (r'\brespiratory.burst.oxidase\b|\bNADPH.oxidase\b|\bRBOH\w+\b'
     r'|\bflavin-containing.monooxygenase\b|\bFMO\w+\b',           'ROS_Production'),

    # ── Peroxiredoxin / thioredoxin ────────────────────────────────────────────
    (r'\bperoxiredoxin\b|\bPRX\w+\b|\bPRDX\w+\b|\bthioredoxin\b|\bTRX\w+\b'
     r'|\bthioredoxin.reductase\b|\bNTR\w+\b|\bFTR\w+\b',         'Thioredoxin_Peroxiredoxin'),

    # ── Glutaredoxin ──────────────────────────────────────────────────────────
    (r'\bglutaredoxin\b|\bGRX\w+\b|\bmonothiol.glutaredoxin\b|\bGLRX\w+\b'
     r'|\bGRXS\w+\b',                                              'Glutaredoxin'),

    # ── 2-oxoglutarate-dependent dioxygenase ──────────────────────────────────
    (r'\b2-oxoglutarate.*dioxygenase\b|\b2OG.Fe.II.dependent\b|\bALKBH\w+\b'
     r'|\bJMJD\d+\b(?!.*histone)|\bKDM\d+\b(?!.*histone)|\bJMJC\b(?!\w)',
                                                                    '2OG_Dioxygenase'),

    # ── Cytochrome P450 ───────────────────────────────────────────────────────
    (r'\bcytochrome.P450\b|\bCYP\d+[A-Z]\d+\b|\bCYP450\b'
     r'|\bmonooxygenase.CYP\b',                                     'Cytochrome_P450'),

    # ── Laccase / multicopper oxidase ─────────────────────────────────────────
    (r'\blaccase\b|\bLAC\d+\b|\bmulticopper.oxidase\b|\bdiamine.oxidase\b'
     r'|\bamine.oxidase\b|\bcopper.amine.oxidase\b',               'Laccase_Multicopper_Oxidase'),

    # ── Germin / oxalate oxidase ──────────────────────────────────────────────
    (r'\bgermin\b|\bGLP\w+\b|\boxalate.oxidase\b|\boxalate.decarboxylase\b'
     r'|\boxalyl-CoA\b',                                            'Germin_Oxalate'),

    # ── Lipoxygenase pathway ──────────────────────────────────────────────────
    (r'\blipoxygenase\b|\bLOX\d+\b|\ballene.oxide.cyclase\b|\bAOC\b(?!\w)'
     r'|\b12-oxophytodienoic\b|\bOPDA\b|\bDES\d+\b',              'Lipoxygenase'),

    # ── Glyoxalase / methylglyoxal detox ─────────────────────────────────────
    (r'\bglyoxalase\b|\bglyoxal.oxidase\b|\bglyoxylate.reductase\b'
     r'|\blactoylglutathione.lyase\b|\bGLO\d+\b|\bglutathione.S-lactoylglutathione\b',
                                                                    'Glyoxalase'),

    # ── Mannitol / sorbitol synthesis ─────────────────────────────────────────
    (r'\bmannitol.dehydrogenase\b|\bMTD\w+\b|\bsorbitol.dehydrogenase\b'
     r'|\baldo-keto.reductase\b|\bAKR\w+\b|\baldose.reductase\b|\bALDR\w+\b'
     r'|\baldehyde.reductase\b',                                    'Polyol_Sugar_Alcohol'),

    # ── Starch degradation ────────────────────────────────────────────────────
    (r'\bbeta-amylase\b|\balpha-amylase\b|\bisoamylase\b|\blimit.dextrinase\b'
     r'|\bAMY\w+\b|\bBAM\w+\b|\bISA\w+\b|\bpullulanase\b|\bstarch.phosphorylase\b'
     r'|\bDBE\w+\b|\bstarch.synthase\b|\bADP-glucose.pyrophosphorylase\b',
                                                                    'Starch_Degradation'),

    # ── Fructan / fructooligosaccharide ──────────────────────────────────────
    (r'\bfructan\b|\bfructan.exohydrolase\b|\bfructosyl\w+transferase\b'
     r'|\blevanase\b|\binulinase\b|\bbeta-fructofuranosidase\b|\bCWINV\w+\b',
                                                                    'Fructan_Metabolism'),

    # ── Cell cycle arrest / checkpoint ────────────────────────────────────────
    (r'\bDNA.damage.checkpoint\b|\bATM\b(?!.*atmosphere)|\bATR\b(?!\w)'
     r'|\bCHK\d+\b|\bRAD17\b|\bRAD24\b|\bRAD1\b|\bHUS1\b|\bRFC\w+\b',
                                                                    'DNA_Damage_Checkpoint'),

    # ── Catch-all for unknowns
]

def assign_pathway(description):
    if pd.isna(description) or str(description).strip() == '':
        return 'Unknown'
    desc = str(description)
    for pattern, pathway in PATHWAY_RULES:
        if re.search(pattern, desc, re.IGNORECASE):
            return pathway
    return 'Unknown'

df['Pathway'] = df['Description'].apply(assign_pathway)

print(df[['GeneID', 'Description', 'Pathway']].to_string())
print("\nAll columns:")
print(df.to_string())

# Save to TSV
output_path = 'genes_with_pathway.tsv'
df.to_csv(output_path, sep='\t', index=False)
print(f"\nSaved to {output_path}")
import {
  Paper,
  ResearchGap,
  InnovationMilestone,
  ContradictionItem,
  ResearchOpportunity,
  MapNode,
  MapLink,
  ResearchProject,
  SourceStreamStatus,
  AIProviderStatus
} from '../types';

export const DEMO_PROJECTS: ResearchProject[] = [
  {
    id: 'proj-alpha',
    title: 'Vision-based industrial waste sorting algorithms',
    query: 'AI-based industrial waste classification and autonomous sorting methodologies',
    status: 'Active',
    papersCount: 24,
    lastActive: '2h ago',
    depth: 'deep',
    sources: ['Semantic Scholar', 'arXiv', 'Crossref']
  },
  {
    id: 'proj-beta',
    title: 'Edge AI optimization for smart agriculture sensors',
    query: 'Edge-native quantization and tinyML models for precision soil and crop sensing',
    status: 'Draft',
    papersCount: 12,
    lastActive: '1d ago',
    depth: 'standard',
    sources: ['arXiv', 'OpenAlex']
  },
  {
    id: 'proj-gamma',
    title: 'Quantum coherence dynamics in avian navigation',
    query: 'Quantum entanglement and radical pair mechanism in macroscopic biological structures',
    status: 'Completed',
    papersCount: 38,
    lastActive: '3d ago',
    depth: 'deep',
    sources: ['Semantic Scholar', 'Crossref', 'arXiv']
  }
];

export const DEMO_EXPANDED_CONCEPTS = [
  { label: 'Computer vision', icon: 'visibility', cluster: 'CV' },
  { label: 'Waste segregation', icon: 'delete_sweep', cluster: 'Industrial' },
  { label: 'Recycling automation', icon: 'precision_manufacturing', cluster: 'Robotics' },
  { label: 'Deep Learning', icon: 'memory', cluster: 'AI/ML' },
  { label: 'Hyperspectral imaging', icon: 'camera', cluster: 'Sensing' },
  { label: 'Edge inference', icon: 'cpu', cluster: 'Hardware' },
  { label: 'Material spectroscopy', icon: 'waves', cluster: 'Spectroscopy' },
  { label: 'Object detection', icon: 'view_in_ar', cluster: 'CV' }
];

export const DEMO_SOURCES: SourceStreamStatus[] = [
  {
    id: 's2',
    name: 'Semantic Scholar',
    icon: 'school',
    status: 'complete',
    papersFound: 64,
    latencyMs: 340
  },
  {
    id: 'arxiv',
    name: 'arXiv',
    icon: 'article',
    status: 'complete',
    papersFound: 48,
    latencyMs: 210
  },
  {
    id: 'crossref',
    name: 'Crossref',
    icon: 'share',
    status: 'complete',
    papersFound: 35,
    latencyMs: 490
  },
  {
    id: 'openalex',
    name: 'OpenAlex',
    icon: 'library_books',
    status: 'complete',
    papersFound: 28,
    latencyMs: 380
  }
];

export const DEMO_PAPERS: Paper[] = [
  {
    id: 'paper-01',
    displayId: 'P01',
    title: 'Attention Is All You Need: Architectural Advances in Neural Machine Translation',
    authors: ['Dr. A. Vaswani, et al.'],
    year: 2023,
    venue: 'Advances in Neural Information Processing (NeurIPS)',
    citations: 1420,
    relevanceScore: 94,
    isOpenAccess: true,
    source: 'arXiv',
    isVerified: true,
    isDemoPaper: true,
    abstract:
      'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on machine translation and sequence modeling tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
    methodology: 'Multi-Head Self-Attention with Scaled Dot-Product Formulation',
    dataset: 'WMT 2014 English-German Benchmark (4.5M pairs)',
    datasetSize: '4.5M sequence pairs',
    evaluationMetric: 'BLEU-4 Score & FLOPS efficiency',
    bestResult: '28.4 BLEU (state-of-the-art with 3.5x faster convergence)',
    advantages: [
      'Eliminates sequential recurrence bottlenecks',
      'Captures long-range token dependencies directly in O(1) path length',
      'Highly optimized for distributed matrix tensor cores'
    ],
    limitations: [
      'Quadratic O(N^2) memory scaling with respect to sequence length',
      'Requires substantial pretraining compute footprint',
      'Lacks inductive bias for localized 2D spatial translation equivariance'
    ],
    innovations: [
      'Self-attention replacing recurrent gates',
      'Sinusoidal positional embeddings for order encoding'
    ],
    futureWork: [
      'Linearized attention approximations for million-token contexts',
      'Sparse attention masks for localized visual parsing'
    ],
    cluster: 'Deep Learning Core',
    whyRelevant:
      'Foundational architectural blueprint utilized across modern vision-transformer waste classification pipelines and multimodal semantic representations.',
    evidenceThreads: [
      {
        paperId: 'P01',
        paperTitle: 'Attention Is All You Need',
        section: 'Section 3.2',
        quote: 'Self-attention allows connecting all pairs of input tokens regardless of their relative position distance.'
      },
      {
        paperId: 'P01',
        paperTitle: 'Attention Is All You Need',
        section: 'Section 5.4',
        quote: 'Computational efficiency increases due to parallelized matrix multiplications over batch dimensions.'
      }
    ],
    fullTextSections: {
      abstract:
        'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
      introduction:
        'Recurrent neural networks, long short-term memory and gated recurrent neural networks in particular, have been firmly established as state of the art approaches in sequence modeling. In this work we propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies.',
      methodology:
        'The Transformer follows an encoder-decoder architecture using stacked self-attention and point-wise, fully connected layers for both the encoder and decoder. Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.',
      results:
        'On the WMT 2014 English-to-German translation task, the big transformer model achieves a state-of-the-art BLEU score of 28.4, outperforming the best previously reported ensembles by more than 2.0 BLEU.',
      limitations:
        'Memory consumption scales quadratically with sequence length N, limiting standard architectures on long documents or gigapixel image tiles without patch tokenization.',
      futureWork:
        'Extending attention mechanisms to continuous spatial and multimodal data streams with linear complexity bounds.',
      references: [
        'Bahdanau et al. (2015) Neural Machine Translation by Jointly Learning to Align and Translate',
        'Hochreiter & Schmidhuber (1997) Long Short-Term Memory',
        'Kim et al. (2017) Structured Attention Networks'
      ]
    },
    interpretation: {
      problem: 'Recurrent sequence encoders suffer from sequential processing bottlenecks and degraded long-range token context.',
      approach: 'Constructed an all-attention feedforward architecture with multi-head self-attention and positional encodings.',
      data: 'Benchmarked on WMT 2014 English-German (4.5M sentence pairs) and English-French (36M pairs).',
      result: 'Achieved 28.4 BLEU with 3.5x reduced training time relative to state-of-the-art recurrent baselines.',
      limitation: 'Quadratic O(N^2) memory footprint prevents direct application to raw uncompressed sensor arrays without patch downsampling.',
      contribution: 'Established the Transformer paradigm that underpins both modern NLP and Vision Transformers in sorting robotics.'
    }
  },
  {
    id: 'paper-02',
    displayId: 'P02',
    title: 'Scaling Laws for Neural Language Models & Dense Multi-Modal Encoders',
    authors: ['Dr. J. Kaplan, et al.'],
    year: 2024,
    venue: 'Journal of Artificial Intelligence Research (JAIR)',
    citations: 980,
    relevanceScore: 88,
    isOpenAccess: true,
    source: 'Semantic Scholar',
    isVerified: true,
    isDemoPaper: true,
    abstract:
      'Empirical scaling laws for language and multimodal model performance on cross-entropy loss. The test loss scales as a smooth power-law with parameter count, dataset size, and compute budget spanning more than seven orders of magnitude with predictable extrapolation.',
    methodology: 'Empirical Power-Law Parameter & Compute Regression Modeling',
    dataset: 'Curated 800GB Multidomain Academic & Industrial Corpus',
    datasetSize: '800 GB / 300B Tokens',
    evaluationMetric: 'Cross-Entropy Validation Loss vs PetaFLOP-days',
    bestResult: 'Predictable smooth scaling exponent alpha = 0.076 across 7 orders of magnitude',
    advantages: [
      'Allows precise compute allocation between model capacity and data volume',
      'Provides empirical predictive bounds prior to million-dollar training runs',
      'Unifies vision and language scaling dynamics under identical thermodynamic loss formulations'
    ],
    limitations: [
      'Does not account for synthetic data degradation loops or noisy web scrape artifacts',
      'Focuses primarily on loss metrics rather than specific downstream edge latency or reasoning tasks',
      'Assumes uniform batch token entropy distributions'
    ],
    innovations: [
      'Power-law parameter scaling formulation',
      'Compute-optimal frontier derivation for industrial neural systems'
    ],
    futureWork: [
      'Investigating sub-linear scaling regimes under heavily quantized edge microcontrollers',
      'Domain-specialized scaling curves for industrial spectroscopy datasets'
    ],
    cluster: 'Deep Learning Core',
    whyRelevant:
      'Essential for sizing compact vision models deployed on edge sorting conveyor robotics without incurring unnecessary inference latencies.',
    evidenceThreads: [
      {
        paperId: 'P02',
        paperTitle: 'Scaling Laws for Neural Language Models',
        section: 'Section 4.1',
        quote: 'Performance improves predictably as a power-law when not bottlenecked by dataset size.'
      }
    ],
    fullTextSections: {
      abstract:
        'Empirical scaling laws for model performance on cross-entropy loss. The loss scales as a power-law with model size, dataset size, and compute used for training across seven orders of magnitude.',
      introduction:
        'Understanding how deep learning systems scale with resource allocation is critical for both theoretical understanding and engineering decisions.',
      methodology:
        'We trained hundreds of autoregressive models ranging from 1,000 parameters to billions of parameters, systematically varying depth, width, and tokens.',
      results:
        'Loss scales as L(N) = (Nc/N)^alphaN with alphaN ≈ 0.076. Larger models are significantly more sample-efficient.',
      limitations:
        'The empirical power-laws break down when model capacity far exceeds token diversity or when training on quantized weights.',
      futureWork:
        'Characterizing scaling behavior on domain-specific high-noise physical sensor signals.',
      references: [
        'Hestness et al. (2017) Deep Learning Scaling is Predictable',
        'Amodei et al. (2018) AI and Compute'
      ]
    },
    interpretation: {
      problem: 'Lack of predictive mathematical models for choosing neural architecture size versus inference budget in automated systems.',
      approach: 'Conducted rigorous empirical parameter sweeps across 7 orders of magnitude of compute and dataset scale.',
      data: 'Tested over 120 model configurations spanning 10^3 to 10^10 parameters on 800GB corpora.',
      result: 'Derived smooth power-law equations accurately forecasting validation loss from compute budget.',
      limitation: 'Does not model hardware-specific edge inference latency or INT8 quantization noise.',
      contribution: 'Provides fundamental equations to design compute-optimal classifiers for autonomous sorting machines.'
    }
  },
  {
    id: 'paper-03',
    displayId: 'P03',
    title: 'Quantum Entanglement in Macroscopic Biological Structures & Avian Magnetoreception',
    authors: ['Dr. Elena Rostova, et al.'],
    year: 2023,
    venue: 'Nature Quantum Biology',
    citations: 512,
    relevanceScore: 91,
    isOpenAccess: true,
    source: 'Crossref',
    isVerified: true,
    isDemoPaper: true,
    abstract:
      'Recent theoretical frameworks suggest that quantum coherence may persist in warm, wet biological environments longer than previously anticipated. This study investigates sustained quantum entanglement within specific microtubule and cryptochrome structures in avian navigational systems utilizing non-invasive femtosecond spectroscopy.',
    methodology: 'Ultra-Fast Femtosecond Transient Absorption Spectroscopy',
    dataset: 'In Vitro Cryptochrome-4 Avian Protein Samples (n=140)',
    datasetSize: '140 protein crystalline structures',
    evaluationMetric: 'Spin-Coherence Dephasing Lifetime (T2*) at 310K',
    bestResult: 'Coherence lifetime sustained for 14.2 microseconds at physiological 37°C',
    advantages: [
      'Direct experimental observation of room-temperature quantum spin states in protein scaffolding',
      'Resolves longstanding thermodynamic decoherence paradox in biological magnetoreceptors',
      'Provides biomimetic blueprints for room-temperature quantum sensor miniaturization'
    ],
    limitations: [
      'Constrained to in vitro purified protein isolates; in vivo verification remains technically challenging',
      'Sensitive to external RF electromagnetic interference across 1-10 MHz bands',
      'High instrumentation cost for femtosecond laser excitation setups'
    ],
    innovations: [
      'Structural protein shielding mechanism preventing thermal decoherence',
      'Femtosecond pump-probe protocol for biological spin-entangled states'
    ],
    futureWork: [
      'Translating radical pair quantum mechanics to bio-inspired solid-state magnetic sensors',
      'Investigating entanglement longevity in synthetic polymer analogs for industrial sensing'
    ],
    cluster: 'Bio-Sensing & Quantum',
    whyRelevant:
      'Demonstrates biomimetic quantum sensor principles applicable to ultra-high sensitivity magnetic and electromagnetic material separation in recycled scrap sorting.',
    evidenceThreads: [
      {
        paperId: 'P03',
        paperTitle: 'Quantum Entanglement in Macroscopic Biological Structures',
        section: 'Section 2.3',
        quote: 'Observed anomalous energy transfer rates deviating 40% from classical thermal relaxation predictions.'
      },
      {
        paperId: 'P03',
        paperTitle: 'Quantum Entanglement in Macroscopic Biological Structures',
        section: 'Section 4.1',
        quote: 'Protein structural scaffolding creates localized dry electrostatic pockets that shield radical pairs from bulk water thermal bath fluctuations.'
      }
    ],
    fullTextSections: {
      abstract:
        'Recent theoretical frameworks suggest that quantum coherence may persist in warm, wet biological environments longer than previously anticipated. This study investigates the potential for sustained quantum entanglement within specific microtubule structures found in avian navigational systems. Utilizing a novel non-invasive femtosecond spectroscopy technique, we observed anomalous energy transfer rates that deviate significantly from classical thermodynamic predictions.',
      introduction:
        'The intersection of quantum mechanics and biology has long been viewed with skepticism due to rapid decoherence expected in biological thermal baths. However, the phenomenon of avian magnetoreception provides a compelling macroscopic example where classical models fall short. We propose a refined radical pair mechanism shielded within hydrophobic cellular pockets.',
      methodology:
        'Isolated Cryptochrome-4 samples were subjected to 80-fs laser pulses across 400-750 nm. Magnetic field modulations from 0 to 500 microtesla were synchronized with optical absorption tracking.',
      results:
        'Spin coherence survived up to 14.2 microseconds at 310K, yielding a 40% deviation from expected classical thermal relaxation times.',
      limitations:
        'Results are currently constrained to in vitro samples; in vivo verification remains technically unfeasible with current instrumentation.',
      futureWork:
        'Fabricating synthetic peptide matrices mimicking the hydrophobic shielding pocket for room-temperature quantum sensors.',
      references: [
        'Ritz et al. (2000) A Model for Photoreceptor-Based Magnetoreception in Birds',
        'Lambert et al. (2013) Quantum Biology: Nature Physics Review'
      ]
    },
    interpretation: {
      problem: 'Classical thermodynamic models fail to explain the extreme magnetic sensitivity of avian navigation at 37°C.',
      approach: 'Applied femtosecond spectroscopy to observe real-time spin coherence in isolated cryptochrome protein structures.',
      data: 'Identified a 40% deviation from expected classical thermal relaxation times across 140 calibrated trials.',
      result: 'Demonstrated room-temperature quantum entanglement stability up to 14.2 microseconds in biological scaffolding.',
      limitation: 'Results are currently constrained to in vitro samples; in vivo verification remains unfeasible with present probes.',
      contribution: 'Proved biological macromolecules can structurally insulate quantum coherent states from ambient thermal noise.'
    }
  },
  {
    id: 'paper-04',
    displayId: 'P04',
    title: 'Real-Time Hyperspectral Vision Transformers for Automated Post-Consumer Polymer Sorting',
    authors: ['Dr. Marcus Thorne, et al.'],
    year: 2024,
    venue: 'IEEE Transactions on Industrial Informatics',
    citations: 184,
    relevanceScore: 96,
    isOpenAccess: true,
    source: 'OpenAlex',
    isVerified: true,
    isDemoPaper: true,
    abstract:
      'Post-consumer plastic waste streams exhibit high visual clutter, surface contamination, and overlapping spectral signatures. We introduce HyperSort-ViT, an edge-optimized spatial-spectral transformer running at 120 FPS on embedded neural accelerators to classify 14 distinct polymer grades with 98.7% purity.',
    methodology: 'Spatial-Spectral Attention with Quantized Edge ViT Backbones',
    dataset: 'PolymerScan-100k Industrial Scrap Dataset (14 classes)',
    datasetSize: '102,400 calibrated spectral cubes',
    evaluationMetric: 'Classification F1-Score & Conveyor Throughput (tons/hr)',
    bestResult: '98.7% F1-score at 4.2 m/s conveyor speed (120 FPS)',
    advantages: [
      'Accurately separates black plastics (carbon-black additives) via mid-infrared shortwave bands',
      'Sub-8ms latency allows direct actuation of high-speed pneumatic air nozzles',
      'Robust against grease, labels, and crushed physical deformations'
    ],
    limitations: [
      'Requires calibrated halogen lighting arrays prone to thermal drift over 8-hour continuous shifts',
      'Edge TPU memory limits spectral band channels to 64 discrete wavelengths',
      'High initial capital expenditure for hyperspectral line-scan sensors'
    ],
    innovations: [
      'Dual-stream spectral-spatial self-attention',
      'INT8-quantized lightweight transformer for pneumatic ejection synchronization'
    ],
    futureWork: [
      'Unsupervised domain adaptation for newly formulated bioplastics and composite films',
      'Multimodal fusion with tactile robotic grippers for flexible packaging'
    ],
    cluster: 'Computer Vision & Robotics',
    whyRelevant:
      'Direct benchmark for industrial automated recycling systems, resolving the black plastics classification bottleneck on high-speed conveyor belts.',
    evidenceThreads: [
      {
        paperId: 'P04',
        paperTitle: 'Real-Time Hyperspectral Vision Transformers',
        section: 'Section 4.3',
        quote: 'Achieved 98.7% sorting accuracy at 4.2 m/s belt velocity, outperforming 2D RGB baselines by 31.4% on black plastics.'
      }
    ],
    fullTextSections: {
      abstract:
        'Post-consumer plastic waste streams exhibit high visual clutter and overlapping spectral signatures. We introduce HyperSort-ViT, an edge-optimized spatial-spectral transformer running at 120 FPS on embedded neural accelerators to classify 14 distinct polymer grades.',
      introduction:
        'Recycling facilities struggle with manual sorting and standard RGB camera limitations, particularly with dark polymers that absorb visible light completely.',
      methodology:
        'Line-scan hyperspectral cameras capture 900-1700 nm NIR bands. A two-stage ViT processes spatial geometry and spectral reflectance in parallel before cross-attention fusion.',
      results:
        'Testing on high-speed industrial pilot belts demonstrated 98.7% purity across PET, HDPE, PVC, PP, and PS streams at 4.2 m/s.',
      limitations:
        'Sensor sensitivity drops when dust accumulation exceeds 15 mg/m2 on optical quartz windows.',
      futureWork:
        'Self-cleaning acoustic levitation dust barriers and self-calibrating light sources.',
      references: [
        'Zheng et al. (2022) Spectral Sorting of Plastic Flakes',
        'Dosovitskiy et al. (2020) An Image is Worth 16x16 Words'
      ]
    },
    interpretation: {
      problem: 'Traditional RGB computer vision fails to distinguish identical-looking polymer types (e.g. HDPE vs PP) and black plastics.',
      approach: 'Integrated near-infrared hyperspectral imaging with an edge-optimized dual-stream Vision Transformer.',
      data: 'Trained on PolymerScan-100k containing 102,400 labeled spectral cubes under dirty industrial conditions.',
      result: 'Reached 98.7% F1-score at 120 FPS on embedded Jetson Orin hardware, driving 64 pneumatic ejectors.',
      limitation: 'Optical degradation from ambient airborne particulate dust requires hourly maintenance intervals.',
      contribution: 'First demonstrated 120 FPS hyperspectral transformer capable of real-time pneumatic scrap sorting.'
    }
  },
  {
    id: 'paper-05',
    displayId: 'P05',
    title: 'Self-Supervised Contrastive Representation Learning for E-Waste PCB Component Disassembly',
    authors: ['Dr. S. Chen, et al.'],
    year: 2024,
    venue: 'Robotics and Computer-Integrated Manufacturing',
    citations: 92,
    relevanceScore: 89,
    isOpenAccess: false,
    source: 'Crossref',
    isVerified: true,
    isDemoPaper: true,
    abstract:
      'Robotic desoldering and precious metal recovery from electronic waste requires segmenting varied surface-mount components on printed circuit boards. We present CircuitSiam, a self-supervised contrastive framework trained without manual annotations that identifies integrated circuits, capacitors, and gold-plated connectors with 94.2% mIoU.',
    methodology: 'Self-Supervised SimSiam Contrastive Pretraining with 3D Point-Cloud Fusion',
    dataset: 'PCB-Recycle 50k High-Res Multimodal Dataset',
    datasetSize: '52,000 PCB board images and depth scans',
    evaluationMetric: 'Mean Intersection-over-Union (mIoU) & Gripper Desoldering Success Rate',
    bestResult: '94.2% mIoU with 91.5% autonomous component desoldering extraction rate',
    advantages: [
      'Eliminates the cost of annotating millions of microscopic IC pins and solder joints',
      'Transfers seamlessly across legacy 1990s boards and modern multilayer server motherboards',
      'Combines 3D height maps with 2D texture for depth-aware robotic suction gripper positioning'
    ],
    limitations: [
      'Fails on heavily charred or physically crushed PCB fragments with obscured solder traces',
      'Requires high-resolution 4K optical sensors with telecentric lenses',
      'Thermal desoldering nozzle collision avoidance adds 400ms planning overhead'
    ],
    innovations: [
      'Zero-annotation self-supervised component clustering',
      'Multimodal depth-reflectance contrastive loss'
    ],
    futureWork: [
      'Reinforcement learning for adaptive force-torque desoldering tool control',
      'Online continuous learning as new electronic form factors enter the waste stream'
    ],
    cluster: 'Computer Vision & Robotics',
    whyRelevant:
      'Addresses autonomous robotic disassembly for high-value precious metal recovery in electronic waste streams without manual labeling.',
    evidenceThreads: [
      {
        paperId: 'P05',
        paperTitle: 'Self-Supervised Contrastive Representation Learning for E-Waste',
        section: 'Section 3.4',
        quote: 'Self-supervised contrastive pretraining reduced required labeled fine-tuning samples by 92% while maintaining 94.2% mIoU.'
      }
    ],
    fullTextSections: {
      abstract:
        'Robotic desoldering and precious metal recovery from electronic waste requires segmenting varied surface-mount components. We present CircuitSiam, a self-supervised contrastive framework identifying microcomponents with 94.2% mIoU.',
      introduction:
        'Electronic waste contains significant concentrations of gold, copper, and rare-earth elements, but manual component recovery is hazardous and economically inefficient.',
      methodology:
        'Using twin neural branches with stop-gradient operators, the network learns invariant component representations under synthetic lighting and scratch augmentations.',
      results:
        'Achieved 94.2% mIoU on unseen industrial e-waste boards, facilitating a 91.5% autonomous pick-and-desolder rate.',
      limitations:
        'Charred board surfaces with significant carbon residue reflect light inconsistently, causing false negatives on capacitors.',
      futureWork:
        'Multi-spectral X-ray fluorescence fusion to identify internal precious metal traces.',
      references: [
        'Chen & He (2021) Exploring Simple Siamese Representation Learning',
        'Krizhevsky et al. (2012) ImageNet Classification with Deep CNNs'
      ]
    },
    interpretation: {
      problem: 'High manual annotation bottleneck when training vision models on thousands of unpredictable legacy PCB designs.',
      approach: 'Leveraged self-supervised Siamese contrastive pretraining on 52k unlabeled circuit board scans.',
      data: 'Tested across 15 different electronic categories from consumer laptops to industrial automotive controllers.',
      result: 'Attained 94.2% mIoU and 91.5% robotic desoldering accuracy without requiring manual bounding box labels.',
      limitation: 'Degrades severely when circuit boards have suffered physical fire or chemical corrosion damage.',
      contribution: 'Established an annotation-free vision pipeline for autonomous robotic e-waste dismantling.'
    }
  },
  {
    id: 'paper-06',
    displayId: 'P06',
    title: 'TinyML on Ultra-Low-Power Edge Microcontrollers for Decentralized Waste Sorting Bins',
    authors: ['Dr. Linnea Weber, et al.'],
    year: 2023,
    venue: 'ACM Transactions on Embedded Computing Systems',
    citations: 74,
    relevanceScore: 86,
    isOpenAccess: true,
    source: 'arXiv',
    isVerified: true,
    isDemoPaper: true,
    abstract:
      'Smart municipal waste bins require autonomous sorting without access to mains power or cloud networks. We present BinNet-Tiny, a 180 KB quantized convolutional network executing on ARM Cortex-M4 microcontrollers drawing under 45 mW of solar energy to sort municipal recyclables with 89.4% top-1 accuracy.',
    methodology: 'Post-Training Integer INT4/INT8 Weight Quantization with Neural Architecture Search',
    dataset: 'MuniSort-20k Municipal Item Dataset (6 categories)',
    datasetSize: '24,000 edge camera captures',
    evaluationMetric: 'Inference Energy (mJ/frame) & Battery Autonomy (Months)',
    bestResult: '42 mW average power consumption with 18-month solar autonomy',
    advantages: [
      'Operates entirely off-grid using a 5W miniature solar panel and supercapacitor',
      'Eliminates privacy concerns by processing all visual data strictly in volatile SRAM with no storage',
      'BOM cost under $15 per sorting actuator unit'
    ],
    limitations: [
      'Restricted to 6 broad waste categories (Plastic, Paper, Glass, Metal, Organic, Trash)',
      'Frame rate limited to 3 FPS due to 64MHz MCU clock frequency',
      'Accuracy drops in extreme low-light conditions without active LED strobe illumination'
    ],
    innovations: [
      'Ultra-dense integer-only convolution kernels',
      'Energy-harvesting aware dynamic frame skip algorithm'
    ],
    futureWork: [
      'Spiking neural networks (SNN) on neuromorphic microchips to reduce power under 5 mW',
      'Acoustic impact sensor fusion for hollow container recognition'
    ],
    cluster: 'Edge AI & IoT',
    whyRelevant:
      'Exemplifies low-cost, decentralized edge intelligence for consumer and municipal point-of-disposal waste classification.',
    evidenceThreads: [
      {
        paperId: 'P06',
        paperTitle: 'TinyML on Ultra-Low-Power Edge Microcontrollers',
        section: 'Section 5.2',
        quote: 'Operated continuously for 18 months across winter conditions with zero battery replacements using 45mW average power budget.'
      }
    ],
    fullTextSections: {
      abstract:
        'Smart municipal waste bins require autonomous sorting without mains power or cloud access. We present BinNet-Tiny, a 180 KB quantized network executing on ARM Cortex-M4 microcontrollers drawing under 45 mW.',
      introduction:
        'Decentralized source segregation reduces municipal landfill contamination by over 60%, but existing camera-based systems require expensive GPUs and grid connections.',
      methodology:
        'We formulated a specialized NAS search space constrained to 256KB SRAM and 1MB Flash, applying mixed 4-bit and 8-bit quantization.',
      results:
        'BinNet-Tiny achieved 89.4% accuracy at 3 FPS on an STM32F401RE MCU, consuming only 14 mJ per inference.',
      limitations:
        'Cannot perform multi-object detection; assumes a single waste item placed into the intake hopper at a time.',
      futureWork:
        'Exploring neuromorphic event-based cameras for micro-watt object triggering.',
      references: [
        'Warden & Situnayake (2019) TinyML: Machine Learning with TensorFlow Lite on Arduino',
        'Howard et al. (2017) MobileNets: Efficient Convolutional Neural Networks'
      ]
    },
    interpretation: {
      problem: 'High power consumption and hardware cost prevent deploying AI sorting at public municipal garbage cans.',
      approach: 'Engineered a 180KB neural model optimized for integer arithmetic on sub-$5 ARM Cortex-M microcontrollers.',
      data: 'Validated over 24,000 real-world discarded objects in outdoor municipal test installations.',
      result: 'Enabled 18 months continuous off-grid operation powered purely by ambient solar energy at 89.4% accuracy.',
      limitation: 'Cannot resolve overlapping mixed items in a single frame; requires sequential item disposal.',
      contribution: 'Pioneered decentralized sub-50mW smart bin classification for urban circular economy logistics.'
    }
  }
];

export const DEMO_GAPS: ResearchGap[] = [
  {
    id: 'gap-01',
    number: '01',
    title: 'Constrained Edge Deployment & Real-Time Synchronization under Heavy Vibration',
    evidenceLine: 'Only 3 of 38 highly relevant papers evaluate edge deployment under industrial mechanical vibration.',
    whyItMatters:
      'High-speed sorting conveyor belts generate intense mechanical vibration (10-200 Hz) and thermal swings that degrade camera calibrations, induce optical blur, and stress uncooled edge accelerators.',
    confidence: 'High',
    status: 'Potentially underexplored',
    relatedPaperIds: ['P01', 'P04', 'P06'],
    supportingPapers: [
      {
        paperId: 'P04',
        title: 'Real-Time Hyperspectral Vision Transformers for Polymer Sorting',
        limitationMentioned: 'Optical line-scan alignment degraded after 120 hours of continuous conveyor motor vibrations.'
      },
      {
        paperId: 'P01',
        title: 'Attention Is All You Need',
        limitationMentioned: 'Quadratic latency bounds prevent real-time microsecond-level synchronization on embedded microchips.'
      },
      {
        paperId: 'P06',
        title: 'TinyML on Ultra-Low-Power Edge Microcontrollers',
        limitationMentioned: 'Low 3 FPS compute throughput inadequate for high-speed 4.5 m/s commercial recycling conveyors.'
      }
    ],
    extractedExcerpts: [
      'P04 [Sec 5.2]: "Calibration drifts caused by conveyor harmonic vibrations reduced purity by 4.2% over consecutive shifts."',
      'P06 [Sec 6.1]: "Thermal throttling in sealed IP67 enclosures reduced sustained MCU clock speed by 25%."'
    ]
  },
  {
    id: 'gap-02',
    number: '02',
    title: 'Zero-Shot Multi-Modal Generalization to Novel Bio-Degradable and Composite Polymers',
    evidenceLine: 'Only 2 of 38 analyzed papers evaluate multi-layer composite flexible packaging or bioplastics.',
    whyItMatters:
      'The consumer market is rapidly adopting multi-layer barrier films and polylactic acid (PLA) bioplastics that share visible and infrared signatures with standard PET/PP, leading to catastrophic recycling batch contamination.',
    confidence: 'High',
    status: 'Potentially underexplored',
    relatedPaperIds: ['P04', 'P05'],
    supportingPapers: [
      {
        paperId: 'P04',
        title: 'Real-Time Hyperspectral Vision Transformers',
        limitationMentioned: 'PLA bioplastic bottles were misclassified as recyclable PET in 28.6% of test trials.'
      },
      {
        paperId: 'P05',
        title: 'Self-Supervised Contrastive Representation Learning',
        limitationMentioned: 'Unsupervised representations failed to distinguish laminated multi-polymer foil substrates.'
      }
    ],
    extractedExcerpts: [
      'P04 [Sec 4.4]: "Spectral overlap between PLA and PET in the 1200-1400 nm band causes significant false-positive contamination in recycled PET flakes."',
      'P05 [Sec 5.3]: "Coated composite layers shield underlying metallic traces from reflectance sensors."'
    ]
  },
  {
    id: 'gap-03',
    number: '03',
    title: 'Closed-Loop Robotic Pneumatic Nozzle Fluid Dynamics Feedback',
    evidenceLine: '1 of 38 papers models aerodynamic deflection and projectile trajectory post-air-blast.',
    whyItMatters:
      'Current systems trigger pneumatic air ejectors in open-loop mode without compensating for irregular object aerodynamics, causing lightweight film plastics to deflect unpredictably and miss capture bins.',
    confidence: 'Medium',
    status: 'Emerging signal',
    relatedPaperIds: ['P04'],
    supportingPapers: [
      {
        paperId: 'P04',
        title: 'Real-Time Hyperspectral Vision Transformers',
        limitationMentioned: 'Pneumatic air blast timing assumed uniform object mass, resulting in 18% ejection misses on crumpled film.'
      }
    ],
    extractedExcerpts: [
      'P04 [Sec 5.1]: "Aerodynamic drag forces on non-rigid plastic bags cause unpredictable parabolic trajectories after air nozzle firing."'
    ]
  }
];

export const DEMO_INNOVATIONS: InnovationMilestone[] = [
  {
    id: 'inno-01',
    year: 2021,
    technology: 'Supervised 2D CNN Classification on Fixed RGB Feeds',
    firstObserved: 'Early industrial conveyor pilot benches (P01 baselines)',
    status: 'Declining',
    adoptingPapersCount: 22,
    significance: 'Established baseline sorting on rigid plastic bottles and aluminum cans; limited by lighting changes.',
    keyPaperIds: ['P01']
  },
  {
    id: 'inno-02',
    year: 2022,
    technology: 'SWIR Hyperspectral Line-Scan Imaging with Shallow ResNets',
    firstObserved: 'Commercial waste sorting prototypes in Europe',
    status: 'Established',
    adoptingPapersCount: 16,
    significance: 'Enabled reliable detection of clear vs colored polymers and distinct plastic resin codes.',
    keyPaperIds: ['P04']
  },
  {
    id: 'inno-03',
    year: 2023,
    technology: 'Spatial-Spectral Vision Transformers & Self-Attention Backbones',
    firstObserved: 'HyperSort-ViT (P04) and transformer vision papers',
    status: 'Rapidly growing',
    adoptingPapersCount: 11,
    significance: 'Solved black plastic detection via parallel spatial geometry and mid-infrared spectral self-attention.',
    keyPaperIds: ['P04', 'P01']
  },
  {
    id: 'inno-04',
    year: 2024,
    technology: 'Self-Supervised Zero-Annotation Contrastive Dismantling Models',
    firstObserved: 'CircuitSiam (P05) for complex e-waste disassembly',
    status: 'Emerging',
    adoptingPapersCount: 5,
    significance: 'Eliminated manual bounding box labeling bottleneck across thousands of legacy printed circuit boards.',
    keyPaperIds: ['P05']
  },
  {
    id: 'inno-05',
    year: 2025,
    technology: 'Sub-50mW Neuromorphic Event-Based Sensing & TinyML on Edge MCUs',
    firstObserved: 'BinNet-Tiny (P06) municipal deployments',
    status: 'Emerging',
    adoptingPapersCount: 4,
    significance: 'Pioneered decentralized, solar-powered point-of-disposal intelligence for urban circular economy bins.',
    keyPaperIds: ['P06']
  }
];

export const DEMO_CONTRADICTIONS: ContradictionItem[] = [
  {
    id: 'contra-01',
    question: 'Does increasing spectral band count beyond 64 channels improve industrial sorting purity on conveyor belts?',
    domain: 'Hyperspectral Sensing vs Edge Latency',
    severity: 'Condition-dependent',
    paperFindings: [
      {
        paperId: 'P04',
        title: 'HyperSort-ViT (2024)',
        finding: '64 calibrated NIR wavelengths provide 98.7% accuracy; additional bands increase INT8 quantization latency past 8ms deadline without statistically significant purity gain.',
        conditions: 'Tested on rigid polymers at 4.2 m/s conveyor speeds with Jetson Orin edge TPU.'
      },
      {
        paperId: 'P02',
        title: 'Scaling Laws for Dense Multi-Modal Encoders (2024)',
        finding: 'High-dimensional continuous spectral curves (256+ bands) follow power-law error reduction when paired with large multi-head self-attention encoders.',
        conditions: 'Tested on offline unconstrained server GPUs without real-time microsecond ejection deadlines.'
      }
    ],
    reconciliation:
      'The disagreement is governed by deployment constraints: offline laboratory classification scales with spectral resolution, whereas real-time conveyor actuation is bounded by edge memory bandwidth and 8ms pneumatic ejection deadlines.'
  },
  {
    id: 'contra-02',
    question: 'Are self-supervised representations superior to supervised transfer learning for dirty/damaged waste streams?',
    domain: 'Representation Learning for Physical Clutter',
    severity: 'Moderate',
    paperFindings: [
      {
        paperId: 'P05',
        title: 'CircuitSiam E-Waste (2024)',
        finding: 'Self-supervised contrastive pretraining outperforms supervised ImageNet transfer by 8.4% on heavily scratched and fragmented industrial components.',
        conditions: 'Unseen industrial e-waste boards with variable solder oxidation.'
      },
      {
        paperId: 'P06',
        title: 'BinNet-Tiny (2023)',
        finding: 'Supervised compact models with heavy synthetic lighting augmentation achieve higher top-1 accuracy on quantized integer microcontrollers than self-supervised weights.',
        conditions: 'Constrained to 256KB SRAM Cortex-M4 architectures with 6 discrete classes.'
      }
    ],
    reconciliation:
      'Self-supervised embeddings require higher parameter dimensionality to capture subtle invariant textures, making them ideal for high-capacity GPU systems (P05) but sub-optimal for ultra-constrained TinyML microcontrollers (P06).'
  }
];

export const DEMO_OPPORTUNITIES: ResearchOpportunity[] = [
  {
    id: 'opp-01',
    number: '01',
    title: 'Neuromorphic Event-Vision + Hyperspectral Fusion for Microsecond Waste Tracking',
    whyItEmerged:
      'Standard high-speed cameras suffer from motion blur at 5+ m/s conveyor velocities, while continuous hyperspectral line scanners generate massive data bandwidth.',
    existingWorkPaperIds: ['P04', 'P06'],
    missingCombination: ['Event-based neuromorphic cameras', 'Hyperspectral line-scan', 'Sparse spiking neural networks'],
    potentialImpact: 'Transformative',
    evidenceStrength: 'Strong',
    difficulty: 'High',
    researchDirection:
      'Use event cameras to track high-speed spatial trajectories at microsecond resolution, triggering narrowband spectral strobe interrogation only when an object crosses the pneumatic firing line.',
    coverageScore: 22,
    opportunityScore: 92,
    quadrant: 'Underexplored'
  },
  {
    id: 'opp-02',
    number: '02',
    title: 'Closed-Loop Trajectory Prediction with Physics-Informed Aerodynamic Transformers',
    whyItEmerged:
      'Air nozzle ejection accuracy collapses when sorting lightweight film plastics, deformed beverage cartons, and flexible bags due to chaotic fluid dynamics.',
    existingWorkPaperIds: ['P04', 'P05'],
    missingCombination: ['Physics-informed neural networks (PINNs)', 'Real-time air blast feedback', '3D depth trajectory tracking'],
    potentialImpact: 'High',
    evidenceStrength: 'Emerging',
    difficulty: 'Medium',
    researchDirection:
      'Incorporate differential fluid dynamics equations directly into the edge Vision Transformer to dynamically adjust air pressure, nozzle angle, and timing based on estimated object 3D drag coefficient.',
    coverageScore: 18,
    opportunityScore: 88,
    quadrant: 'Underexplored'
  },
  {
    id: 'opp-03',
    number: '03',
    title: 'Multi-Modal Acoustic-Impact + RF Spectroscopy for Opaque Composite Packaging',
    whyItEmerged:
      'Surface coatings and aluminium foil lamination completely block optical and near-infrared sensors from identifying interior core resins.',
    existingWorkPaperIds: ['P03', 'P06'],
    missingCombination: ['Acoustic resonance spectroscopy', 'Millimeter-wave RF sensing', 'Edge transformer sensor fusion'],
    potentialImpact: 'High',
    evidenceStrength: 'Moderate',
    difficulty: 'Medium',
    researchDirection:
      'Combine acoustic tap-response frequencies with low-power mmWave radar reflections to non-destructively measure internal material density and foil thickness in beverage cartons.',
    coverageScore: 35,
    opportunityScore: 82,
    quadrant: 'Emerging'
  },
  {
    id: 'opp-04',
    number: '04',
    title: 'Federated Continuous Learning Across Distributed Municipal Recycling Plants',
    whyItEmerged:
      'Packaging shapes and polymer compositions vary significantly by geographical region and seasonal brand packaging campaigns, causing centralized static models to suffer distribution drift.',
    existingWorkPaperIds: ['P02', 'P05', 'P06'],
    missingCombination: ['Federated learning', 'Privacy-preserving edge updates', 'Continual learning without catastrophic forgetting'],
    potentialImpact: 'High',
    evidenceStrength: 'Strong',
    difficulty: 'Medium',
    researchDirection:
      'Deploy privacy-preserving federated aggregation allowing hundreds of independent MRF sorting machines to collaboratively update anomaly detection heads on newly introduced packaging formats.',
    coverageScore: 28,
    opportunityScore: 78,
    quadrant: 'Emerging'
  },
  {
    id: 'opp-05',
    number: '05',
    title: 'Standard 2D RGB Deep CNN ResNet Benchmarking on Clean Rigid Bottles',
    whyItEmerged: 'Heavily saturated in early literature from 2018-2021; diminishing returns on clean lab datasets.',
    existingWorkPaperIds: ['P01'],
    missingCombination: ['2D RGB Only', 'Standard ImageNet ResNet50'],
    potentialImpact: 'Moderate',
    evidenceStrength: 'Strong',
    difficulty: 'Low',
    researchDirection: 'Legacy baseline studies; mostly superseded by multi-spectral and spatial-spectral transformers.',
    coverageScore: 85,
    opportunityScore: 24,
    quadrant: 'Crowded'
  }
];

export const DEMO_MAP_NODES: MapNode[] = [
  {
    id: 'node-dl-core',
    label: 'Deep Learning Core',
    cluster: 'Deep Learning Core',
    x: 50,
    y: 50,
    size: 22,
    year: 2023,
    relevance: 95,
    citations: 1420,
    color: '#c0c1ff',
    paperId: 'paper-01',
    isCentral: true
  },
  {
    id: 'node-cv',
    label: 'Computer Vision & Transformers',
    cluster: 'Computer Vision',
    x: 22,
    y: 28,
    size: 18,
    year: 2024,
    relevance: 96,
    citations: 184,
    color: '#4cd7f6',
    paperId: 'paper-04'
  },
  {
    id: 'node-ewaste',
    label: 'Self-Supervised E-Waste',
    cluster: 'Computer Vision',
    x: 15,
    y: 45,
    size: 14,
    year: 2024,
    relevance: 89,
    citations: 92,
    color: '#4cd7f6',
    paperId: 'paper-05'
  },
  {
    id: 'node-scaling',
    label: 'Neural Scaling Laws',
    cluster: 'Deep Learning Core',
    x: 72,
    y: 22,
    size: 16,
    year: 2024,
    relevance: 88,
    citations: 980,
    color: '#c0c1ff',
    paperId: 'paper-02'
  },
  {
    id: 'node-nlp',
    label: 'NLP & Tokenizers',
    cluster: 'NLP & Representations',
    x: 82,
    y: 68,
    size: 15,
    year: 2023,
    relevance: 84,
    citations: 760,
    color: '#4cd7f6'
  },
  {
    id: 'node-edge',
    label: 'TinyML Edge Sorting',
    cluster: 'Edge AI & IoT',
    x: 32,
    y: 82,
    size: 16,
    year: 2023,
    relevance: 86,
    citations: 74,
    color: '#4edea3',
    paperId: 'paper-06'
  },
  {
    id: 'node-sensors',
    label: 'IoT Agriculture & Sensors',
    cluster: 'Edge AI & IoT',
    x: 12,
    y: 78,
    size: 12,
    year: 2024,
    relevance: 81,
    citations: 45,
    color: '#4edea3'
  },
  {
    id: 'node-quantum',
    label: 'Quantum Biological Sensing',
    cluster: 'Bio-Sensing & Quantum',
    x: 75,
    y: 85,
    size: 16,
    year: 2023,
    relevance: 91,
    citations: 512,
    color: '#ffb4ab',
    paperId: 'paper-03'
  }
];

export const DEMO_MAP_LINKS: MapLink[] = [
  { source: 'node-dl-core', target: 'node-cv', strength: 5, color: '#4cd7f6' },
  { source: 'node-dl-core', target: 'node-scaling', strength: 4, color: '#c0c1ff' },
  { source: 'node-dl-core', target: 'node-nlp', strength: 4, color: '#4cd7f6' },
  { source: 'node-dl-core', target: 'node-edge', strength: 3, color: '#4edea3' },
  { source: 'node-cv', target: 'node-ewaste', strength: 4, color: '#4cd7f6' },
  { source: 'node-edge', target: 'node-sensors', strength: 3, color: '#4edea3' },
  { source: 'node-dl-core', target: 'node-quantum', strength: 2, color: '#ffb4ab' },
  { source: 'node-cv', target: 'node-edge', strength: 3, color: '#4cd7f6' }
];

export const DEMO_AI_PROVIDERS: AIProviderStatus[] = [
  {
    name: 'Gemini 2.5 Flash (Server)',
    status: 'Active',
    currentModel: 'gemini-2.5-flash',
    latencyMs: 140,
    isLocal: false
  },
  {
    name: 'Groq LPU (Orchestrator)',
    status: 'Available',
    currentModel: 'llama-3.3-70b-versatile',
    latencyMs: 85,
    isLocal: false
  },
  {
    name: 'OpenRouter Hybrid Engine',
    status: 'Available',
    currentModel: 'anthropic/claude-3.5-sonnet',
    latencyMs: 290,
    isLocal: false
  },
  {
    name: 'Ollama Edge Engine',
    status: 'Standby',
    currentModel: 'mistral-small:latest',
    latencyMs: 420,
    isLocal: true
  }
];

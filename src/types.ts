export type NavTab = 
  | 'overview'
  | 'discover'
  | 'papers'
  | 'compare'
  | 'map'
  | 'trends'
  | 'gaps'
  | 'innovations'
  | 'contradictions'
  | 'opportunities'
  | 'test-idea'
  | 'literature-review'
  | 'reports'
  | 'settings';

export type ResearchDepth = 'quick' | 'standard' | 'deep';

export interface SourceStreamStatus {
  id: string;
  name: string;
  icon: string;
  status: 'searching' | 'complete' | 'rate-limited' | 'unavailable';
  papersFound: number;
  latencyMs: number;
}

export interface EvidenceThreadItem {
  paperId: string;
  paperTitle: string;
  section: string;
  quote: string;
}

export interface Paper {
  id: string;
  displayId: string; // e.g. "P01", "P12"
  title: string;
  authors: string[];
  year: number;
  venue: string;
  citations: number;
  relevanceScore: number; // 0-100
  isOpenAccess: boolean;
  source: 'Semantic Scholar' | 'arXiv' | 'Crossref' | 'OpenAlex';
  isVerified: boolean;
  isDemoPaper: boolean;
  abstract: string;
  methodology: string;
  dataset: string;
  datasetSize: string;
  evaluationMetric: string;
  bestResult: string;
  advantages: string[];
  limitations: string[];
  innovations: string[];
  futureWork: string[];
  cluster: string;
  whyRelevant: string;
  evidenceThreads: EvidenceThreadItem[];
  fullTextSections: {
    abstract: string;
    introduction: string;
    methodology: string;
    results: string;
    limitations: string;
    futureWork: string;
    references: string[];
  };
  interpretation: {
    problem: string;
    approach: string;
    data: string;
    result: string;
    limitation: string;
    contribution: string;
  };
}

export interface ResearchGap {
  id: string;
  number: string; // e.g. "01"
  title: string;
  evidenceLine: string;
  whyItMatters: string;
  confidence: 'Low' | 'Medium' | 'High';
  status: 'Potentially underexplored' | 'Emerging signal' | 'Methodological void';
  relatedPaperIds: string[];
  supportingPapers: {
    paperId: string;
    title: string;
    limitationMentioned: string;
  }[];
  extractedExcerpts: string[];
}

export interface InnovationMilestone {
  id: string;
  year: number;
  technology: string;
  firstObserved: string;
  status: 'Emerging' | 'Rapidly growing' | 'Established' | 'Declining';
  adoptingPapersCount: number;
  significance: string;
  keyPaperIds: string[];
}

export interface ContradictionItem {
  id: string;
  question: string;
  domain: string;
  severity: 'Moderate' | 'High' | 'Condition-dependent';
  paperFindings: {
    paperId: string;
    title: string;
    finding: string;
    conditions: string;
  }[];
  reconciliation: string;
}

export interface ResearchOpportunity {
  id: string;
  number: string;
  title: string;
  whyItEmerged: string;
  existingWorkPaperIds: string[];
  missingCombination: string[];
  potentialImpact: 'High' | 'Transformative' | 'Moderate';
  evidenceStrength: 'Strong' | 'Emerging' | 'Moderate';
  difficulty: 'Low' | 'Medium' | 'High';
  researchDirection: string;
  coverageScore: number; // 0-100 (x-axis for matrix)
  opportunityScore: number; // 0-100 (y-axis for matrix)
  quadrant: 'Established' | 'Crowded' | 'Emerging' | 'Underexplored';
}

export interface MapNode {
  id: string;
  label: string;
  cluster: string;
  x: number;
  y: number;
  size: number;
  year: number;
  relevance: number;
  citations: number;
  color: string;
  paperId?: string;
  isCentral?: boolean;
}

export interface MapLink {
  source: string;
  target: string;
  strength: number; // 1-5
  color?: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  query: string;
  status: 'Active' | 'Draft' | 'Completed';
  papersCount: number;
  lastActive: string;
  depth: ResearchDepth;
  sources: string[];
}

export interface FilterState {
  searchQuery: string;
  minRelevance: number;
  selectedYears: number[];
  selectedSources: string[];
  selectedClusters: string[];
  openAccessOnly: boolean;
  minCitations: number;
  verifiedOnly: boolean;
}

export interface AIProviderStatus {
  name: string;
  status: 'Available' | 'Active' | 'Offline' | 'Standby';
  currentModel: string;
  latencyMs: number;
  isLocal: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning';
  title: string;
  description?: string;
}

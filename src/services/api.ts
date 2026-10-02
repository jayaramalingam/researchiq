import { MapNode, MapLink, Paper } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface BackendNode {
  id: string;
  label: string;
  year?: number;
  paper_id: string;
  type: string;
}

export interface BackendEdge {
  id: string;
  source: string;
  target: string;
  relationship_type: string;
  strength: number;
  explanation?: string;
}

export interface BackendResearchMapResponse {
  project_id: string;
  nodes: BackendNode[];
  edges: BackendEdge[];
  stats: {
    papers: number;
    relationships: number;
  };
}

export interface BackendPaper {
  id: string;
  title: string;
  abstract?: string;
  authors?: any;
  publication_year?: number;
  doi?: string;
  url?: string;
  pdf_url?: string;
  source?: string;
  citation_count: number;
  venue?: string;
  is_open_access?: boolean;
}

export interface BackendProjectPaper {
  id: string;
  project_id: string;
  paper_id: string;
  relevance_score?: number;
  rank?: number;
  selected: boolean;
  added_at: string;
  paper?: BackendPaper;
}

export interface PaperAnalysis {
  id: string;
  paper_id: string;
  summary?: string | null;
  problem?: string | null;
  methodology?: string | null;
  dataset?: string | null;
  results?: string | null;
  limitations?: string | null;
  contribution?: string | null;
  future_work?: string | null;
  ai_model?: string | null;
  confidence?: number | null;
  analyzed_at: string;
}

export interface BackendInsight {
  id: string;
  project_id: string;
  type: 'similarity' | 'difference' | 'trend' | 'gap' | 'innovation' | 'contradiction' | 'opportunity' | 'future_scope';
  title: string;
  description?: string | null;
  evidence?: string | null;
  confidence?: number | null;
  created_at: string;
}

export interface BackendDashboardData {
  project_id: string;
  project_summary: {
    id: string;
    title: string;
    research_question?: string | null;
    description?: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    papers_count: number;
    insights_count: number;
    relationships_count: number;
  };
  global_overview: {
    total_projects: number;
    total_papers: number;
    total_analyses: number;
    total_insights: number;
    total_relationships: number;
  };
  paper_analysis: {
    total_papers: number;
    analyzed_papers: number;
    unanalyzed_papers: number;
    coverage_percentage: number;
  };
  insights: {
    total_insights: number;
    gaps_count: number;
    innovations_count: number;
    contradictions_count: number;
    opportunities_count: number;
    by_type: Record<string, number>;
  };
  relationships: {
    total_relationships: number;
    by_type: Record<string, number>;
    average_strength: number;
  };
}

export interface BackendSearchResultPaper {
  id?: string | null;
  title: string;
  abstract?: string | null;
  authors?: any;
  publication_year?: number | null;
  doi?: string | null;
  url?: string | null;
  pdf_url?: string | null;
  source?: string | null;
  citation_count: number;
  venue?: string | null;
  is_open_access?: boolean | null;
  created_at?: string | null;
  is_attached: boolean;
  relevance_score?: number | null;
  rank?: number | null;
  semantic_scholar_id?: string | null;
  fields_of_study?: string[] | null;
}

export interface BackendSearchResponse {
  project_id: string;
  query: string;
  total_results: number;
  results: BackendSearchResultPaper[];
  source: string;
  note?: string | null;
}

export interface BackendSynthesisRelationship {
  source_paper_title: string;
  target_paper_title: string;
  relationship_type: string;
  confidence: number;
  evidence?: string;
}

export interface BackendCrossPaperSynthesis {
  common_methods: string[];
  common_datasets: string[];
  major_findings: string[];
  contradictions: string[];
  research_trends: string[];
  limitations_across_papers: string[];
  research_gaps: string[];
  future_directions: string[];
  relationships: BackendSynthesisRelationship[];
}

export interface BackendSynthesisResponse {
  project_id: string;
  papers_analyzed: number;
  synthesis: BackendCrossPaperSynthesis;
  insights_created: number;
  relationships_created: number;
}

export interface BackendCollectionAnalysisResponse {
  project_id: string;
  total: number;
  skipped_already_analyzed: number;
  to_analyze: number;
  analyzed: number;
  failed: number;
  errors: { paper: string; error: string }[];
  papers: { paper_id: string; title: string; status: string }[];
}

export interface BackendPaperSource {
  id: string;
  paper_id: string;
  source_name: string;
  source_identifier: string;
  source_url?: string | null;
  created_at: string;
}

export interface BackendEvidenceItem {
  id: string;
  type: string;
  paper_id?: string | null;
  paper_title?: string | null;
  authors?: any;
  publication_year?: number | null;
  doi?: string | null;
  source_venue?: string | null;
  url?: string | null;
  quote_or_text: string;
  related_insight_title?: string | null;
  insight_type?: string | null;
  confidence?: number | null;
  sources: BackendPaperSource[];
}

export interface BackendProjectEvidenceResponse {
  project_id: string;
  total_evidence_items: number;
  items: BackendEvidenceItem[];
}

export interface BackendReport {
  id: string;
  project_id: string;
  title: string;
  content: string;
  citation_style?: string | null;
  format: 'pdf' | 'markdown' | 'html';
  created_at: string;
  updated_at: string;
}

export interface ResearchMapUIData {
  projectId: string;
  nodes: MapNode[];
  links: MapLink[];
  papers: Paper[];
  clusters: string[];
}


/**
 * Fetch projects list from backend
 */
export async function fetchProjects() {
  const res = await fetch(`${API_BASE_URL}/projects`);
  if (!res.ok) {
    throw new Error(`Failed to fetch projects: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Create a new research project
 */
export async function createProject(data: {
  title: string;
  research_question?: string;
  description?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to create project: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Seed demo data for a project
 */
export async function seedDemoData(projectId: string) {
  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/demo-data`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(`Failed to seed demo data: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Get or create a default demo project with backend data
 */
export async function getOrCreateDemoProject(): Promise<string> {
  const DEMO_PROJECT_TITLE = 'Vision-Based Industrial Waste Sorting';

  try {
    const projects = await fetchProjects();
    const matchingProjects = projects?.filter(
      (p: { title: string; id: string }) => p.title === DEMO_PROJECT_TITLE
    ) || [];

    // Check if any matching project already has graph nodes populated
    for (const proj of matchingProjects) {
      try {
        const mapRes = await fetch(
          `${API_BASE_URL}/projects/${proj.id}/research-map`
        );
        if (mapRes.ok) {
          const mapData: BackendResearchMapResponse = await mapRes.json();
          if (mapData.nodes && mapData.nodes.length > 0) {
            return proj.id;
          }
        }
      } catch (mapErr) {
        console.warn('Could not verify nodes for matching project:', mapErr);
      }
    }

    // If matching project exists but has 0 papers/nodes, seed demo data into the first one
    if (matchingProjects.length > 0) {
      await seedDemoData(matchingProjects[0].id);
      return matchingProjects[0].id;
    }
  } catch (err) {
    console.warn('Backend reachability issue or project fetch error:', err);
  }

  // If no matching project exists, create one
  const newProj = await createProject({
    title: 'Vision-Based Industrial Waste Sorting',
    research_question: 'How effectively can computer vision classify recyclable waste?',
    description: 'MVP study on CV waste sorting.',
  });

  await seedDemoData(newProj.id);
  return newProj.id;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolve frontend project ID to backend PostgreSQL / SQLite UUID
 */
export async function resolveResearchMapProjectId(
  frontendProjectId?: string
): Promise<string> {
  try {
    const projects = await fetchProjects();
    if (projects && Array.isArray(projects) && projects.length > 0) {
      if (frontendProjectId) {
        const match = projects.find(
          (p: { id: string; title: string }) =>
            p.id === frontendProjectId ||
            (p.title && frontendProjectId && p.title.toLowerCase().includes(frontendProjectId.toLowerCase()))
        );
        if (match) return match.id;
      }

      // If specific ID wasn't found, use vision demo project or first project
      const demo = projects.find(
        (p: { id: string; title: string }) =>
          p.title && p.title.toLowerCase().includes('vision')
      );
      if (demo) return demo.id;
      return projects[0].id;
    }
  } catch (e) {
    console.warn('Error matching project ID:', e);
  }

  return getOrCreateDemoProject();
}

/**
 * Fetch paper metadata details from backend
 */
export async function fetchPaperDetails(paperId: string): Promise<BackendSearchResultPaper | null> {
  if (!paperId || !UUID_REGEX.test(paperId)) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/papers/${paperId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Failed to fetch paper: ${res.statusText}`);
    return res.json();
  } catch (err) {
    console.warn(`Could not fetch details for paper ${paperId}:`, err);
    return null;
  }
}

/**
 * Fetch project papers from backend
 */
export async function fetchProjectPapers(projectId: string): Promise<BackendProjectPaper[]> {
  const backendProjectId = await resolveResearchMapProjectId(projectId);
  const res = await fetch(`${API_BASE_URL}/projects/${backendProjectId}/papers`);
  if (!res.ok) {
    throw new Error(`Failed to fetch project papers: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch paper analysis from backend
 */
export async function fetchPaperAnalysis(
  paperId: string
): Promise<PaperAnalysis | null> {
  const res = await fetch(`${API_BASE_URL}/papers/${paperId}/analysis`);

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch paper analysis: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch insights and research gaps for a project from backend
 */
export async function fetchProjectInsights(
  projectId?: string,
  type?: string
): Promise<BackendInsight[]> {
  const backendProjectId = await resolveResearchMapProjectId(projectId);
  const url = type
    ? `${API_BASE_URL}/projects/${backendProjectId}/insights?type=${encodeURIComponent(type)}`
    : `${API_BASE_URL}/projects/${backendProjectId}/insights`;
  const res = await fetch(url);

  if (res.status === 404) {
    return [];
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch project insights: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch Project Dashboard overview statistics from backend
 */
export async function fetchProjectDashboard(
  projectId?: string
): Promise<BackendDashboardData> {
  let backendProjectId = await resolveResearchMapProjectId(projectId);
  let res = await fetch(`${API_BASE_URL}/projects/${backendProjectId}/dashboard`);

  if (res.status === 404) {
    backendProjectId = await getOrCreateDemoProject();
    res = await fetch(`${API_BASE_URL}/projects/${backendProjectId}/dashboard`);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch project dashboard: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Search papers for a project in backend
 */
export async function searchProjectPapers(
  projectId?: string,
  query?: string
): Promise<BackendSearchResponse> {
  const backendProjectId = await resolveResearchMapProjectId(projectId);
  const queryParam = query ? `?q=${encodeURIComponent(query)}` : '';
  const res = await fetch(`${API_BASE_URL}/projects/${backendProjectId}/search${queryParam}`);

  if (!res.ok) {
    throw new Error(`Failed to perform search: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Attach an existing backend paper to a project
 */
export async function attachPaperToProject(
  projectId: string | undefined,
  paperId: string
): Promise<BackendProjectPaper> {
  const backendProjectId = await resolveResearchMapProjectId(projectId);
  const res = await fetch(
    `${API_BASE_URL}/projects/${backendProjectId}/search/attach/${paperId}`,
    {
      method: 'POST',
    }
  );

  if (res.status === 409) {
    throw new Error('This paper is already attached to the research project.');
  }

  if (!res.ok) {
    throw new Error(`Failed to attach paper: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Add a new paper from search and attach to project
 */
export async function addPaperFromSearch(
  projectId: string | undefined,
  payload: {
    title: string;
    abstract?: string;
    authors?: any;
    publication_year?: number;
    doi?: string;
    url?: string;
    pdf_url?: string;
    source?: string;
    citation_count?: number;
    venue?: string;
    is_open_access?: boolean;
    relevance_score?: number;
  }
): Promise<BackendProjectPaper> {
  const backendProjectId = await resolveResearchMapProjectId(projectId);
  const res = await fetch(`${API_BASE_URL}/projects/${backendProjectId}/search/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (res.status === 409) {
    throw new Error('This paper is already attached to the project.');
  }

  if (!res.ok) {
    throw new Error(`Failed to add paper: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Trigger AI analysis of a single paper using OpenRouter
 */
export async function triggerPaperAnalysis(
  paperId: string,
  refresh: boolean = false
): Promise<PaperAnalysis> {
  const endpoint = refresh
    ? `${API_BASE_URL}/papers/${paperId}/analysis/refresh`
    : `${API_BASE_URL}/papers/${paperId}/analysis`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.detail || `AI analysis request failed (${res.status})`;
    throw new Error(message);
  }

  return res.json();
}

/**
 * Trigger batch AI analysis of unanalyzed papers in the project collection
 */
export async function triggerCollectionAnalysis(
  projectId?: string
): Promise<BackendCollectionAnalysisResponse> {
  const backendProjectId = await resolveResearchMapProjectId(projectId);
  const res = await fetch(`${API_BASE_URL}/projects/${backendProjectId}/analyze-collection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.detail || `Collection analysis request failed (${res.status})`;
    throw new Error(message);
  }

  return res.json();
}

/**
 * Run cross-paper AI synthesis using OpenRouter for the project
 */
export async function triggerAISynthesis(
  projectId?: string
): Promise<BackendSynthesisResponse> {
  const backendProjectId = await resolveResearchMapProjectId(projectId);
  const res = await fetch(`${API_BASE_URL}/projects/${backendProjectId}/ai-synthesis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.detail || `AI synthesis request failed (${res.status})`;
    throw new Error(message);
  }

  return res.json();
}

/**
 * Fetch project evidence & provenance list from backend
 */
export async function fetchProjectEvidence(
  projectId?: string
): Promise<BackendProjectEvidenceResponse> {
  const backendProjectId = await resolveResearchMapProjectId(projectId);
  const res = await fetch(`${API_BASE_URL}/projects/${backendProjectId}/evidence`);

  if (!res.ok) {
    throw new Error(`Failed to fetch project evidence: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch source records for a specific paper
 */
export async function fetchPaperSources(paperId: string): Promise<BackendPaperSource[]> {
  const res = await fetch(`${API_BASE_URL}/papers/${paperId}/sources`);

  if (res.status === 404) {
    return [];
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch paper sources: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Create a new source record for a paper
 */
export async function createPaperSource(
  paperId: string,
  payload: {
    source_name: string;
    source_identifier: string;
    source_url?: string;
  }
): Promise<BackendPaperSource> {
  const res = await fetch(`${API_BASE_URL}/papers/${paperId}/sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to create paper source: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Generate a comprehensive research report from PostgreSQL project data
 */
export async function generateProjectReport(
  projectId?: string,
  title?: string
): Promise<BackendReport> {
  const backendProjectId = await resolveResearchMapProjectId(projectId);
  const res = await fetch(`${API_BASE_URL}/projects/${backendProjectId}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: title || undefined,
      citation_style: 'IEEE',
      format: 'markdown',
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to generate research report: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch all generated reports for a project
 */
export async function fetchProjectReports(projectId?: string): Promise<BackendReport[]> {
  const backendProjectId = await resolveResearchMapProjectId(projectId);
  const res = await fetch(`${API_BASE_URL}/projects/${backendProjectId}/reports`);

  if (!res.ok) {
    throw new Error(`Failed to fetch project reports: ${res.statusText}`);
  }

  const reports: BackendReport[] = await res.json();

  // If no reports generated yet, generate initial demo report and return it
  if (reports.length === 0) {
    try {
      const newReport = await generateProjectReport(backendProjectId);
      return [newReport];
    } catch (e) {
      console.warn('Auto-generation of initial report failed:', e);
      return [];
    }
  }

  return reports;
}

/**
 * Fetch specific report details by ID
 */
export async function fetchReportById(reportId: string): Promise<BackendReport> {
  const res = await fetch(`${API_BASE_URL}/reports/${reportId}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch report ${reportId}: ${res.statusText}`);
  }

  return res.json();
}







/**
 * Fetch Research Map from backend and adapt it for frontend rendering
 */
export async function fetchResearchMap(projectId?: string): Promise<ResearchMapUIData> {
  const backendProjectId = await resolveResearchMapProjectId(projectId);

  const res = await fetch(`${API_BASE_URL}/projects/${backendProjectId}/research-map`);

  if (!res.ok) {
    throw new Error(`Failed to fetch research map: ${res.statusText}`);
  }

  const rawMap: BackendResearchMapResponse = await res.json();

  // Fetch detailed project papers metadata to enrich nodes
  let projectPapers: BackendProjectPaper[] = [];
  try {
    projectPapers = await fetchProjectPapers(backendProjectId);
  } catch (e) {
    console.warn('Could not fetch project paper details:', e);
  }

  return adaptBackendMapToUI(rawMap, backendProjectId, projectPapers);
}

/**
 * Adapter: Converts backend Research Map graph JSON into exact frontend MapNode[], MapLink[], Paper[]
 */
function adaptBackendMapToUI(
  rawMap: BackendResearchMapResponse,
  projectId: string,
  projectPapers: BackendProjectPaper[] = []
): ResearchMapUIData {
  const paperDetailsMap = new Map<string, BackendProjectPaper>();
  projectPapers.forEach((pp) => {
    paperDetailsMap.set(pp.paper_id, pp);
  });

  const PRESET_POSITIONS = [
    { x: 50, y: 50, isCentral: true, color: '#F59E0B', cluster: 'Deep Learning Core' },
    { x: 26, y: 32, isCentral: false, color: '#4cd7f6', cluster: 'Computer Vision' },
    { x: 24, y: 72, isCentral: false, color: '#C2410C', cluster: 'Edge AI & IoT' },
    { x: 74, y: 32, isCentral: false, color: '#4edea3', cluster: 'Computer Vision' },
    { x: 76, y: 72, isCentral: false, color: '#F87171', cluster: 'Bio-Sensing & Quantum' },
  ];

  const nodes: MapNode[] = rawMap.nodes.map((node, index) => {
    const preset = PRESET_POSITIONS[index % PRESET_POSITIONS.length];
    const pp = paperDetailsMap.get(node.paper_id);
    const paperObj = pp?.paper;

    // Determine position algorithmically if more nodes
    let x = preset.x;
    let y = preset.y;
    if (index >= PRESET_POSITIONS.length) {
      const angle = (index / rawMap.nodes.length) * 2 * Math.PI;
      x = Math.round(50 + 35 * Math.cos(angle));
      y = Math.round(50 + 35 * Math.sin(angle));
    }

    const cluster = paperObj?.venue?.includes('IEEE')
      ? 'Computer Vision'
      : paperObj?.venue?.includes('NeurIPS')
      ? 'Deep Learning Core'
      : preset.cluster;

    return {
      id: node.paper_id || node.id,
      label: node.label,
      cluster: cluster,
      x: x,
      y: y,
      size: preset.isCentral ? 22 : 18,
      year: node.year || 2025,
      relevance: pp?.relevance_score ? Math.round(pp.relevance_score) : 90,
      citations: paperObj?.citation_count ?? 25,
      color: preset.color,
      paperId: node.paper_id,
      isCentral: index === 0,
    };
  });

  const nodeIds = new Set(nodes.map((n) => n.id));
  const links: MapLink[] = rawMap.edges
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
    .map((edge) => ({
      source: edge.source,
      target: edge.target,
      strength: Math.max(1, Math.round(edge.strength * 5)),
    }));

  const papers: Paper[] = rawMap.nodes.map((node, nodeIndex) => {
    const pp = paperDetailsMap.get(node.paper_id);
    const p = pp?.paper;
    const authorsArr = Array.isArray(p?.authors)
      ? p.authors
      : typeof p?.authors === 'string'
      ? [p.authors]
      : [];
    const nodeCluster = nodes[nodeIndex]?.cluster || 'General';

    return {
      id: node.paper_id,
      displayId: `P${node.paper_id.slice(0, 4).toUpperCase()}`,
      title: node.label,
      authors: authorsArr,
      year: node.year || new Date().getFullYear(),
      venue: p?.venue || '',
      citations: p?.citation_count ?? 0,
      relevanceScore: pp?.relevance_score ? Math.round(pp.relevance_score) : 0,
      isOpenAccess: p?.is_open_access ?? false,
      source: (p?.source as any) || 'Semantic Scholar',
      isVerified: true,
      isDemoPaper: false,
      abstract: p?.abstract || '',
      methodology: '',
      dataset: '',
      datasetSize: '',
      evaluationMetric: '',
      bestResult: '',
      advantages: [],
      limitations: [],
      innovations: [],
      futureWork: [],
      cluster: nodeCluster,
      whyRelevant: '',
      evidenceThreads: [],
      fullTextSections: {
        abstract: p?.abstract || '',
        introduction: '',
        methodology: '',
        results: '',
        limitations: '',
        futureWork: '',
        references: [],
      },
      interpretation: {
        problem: '',
        approach: '',
        data: '',
        result: '',
        limitation: '',
        contribution: '',
      },
    };
  });

  const clusterSet = new Set<string>(['All']);
  nodes.forEach((n) => clusterSet.add(n.cluster));

  return {
    projectId: rawMap.project_id || projectId,
    nodes,
    links,
    papers,
    clusters: Array.from(clusterSet),
  };
}

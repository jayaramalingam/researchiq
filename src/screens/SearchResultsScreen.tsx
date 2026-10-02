import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Check,
  Sparkles,
  BarChart3,
  Bookmark,
  GitCompare,
  ArrowUpRight,
  ChevronDown,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
  X,
  BookOpen,
  Database,
  Loader2,
  Plus,
  AlertCircle,
  RefreshCw,
  Globe,
  Cpu,
  FolderPlus,
  ExternalLink
} from 'lucide-react';
import { Paper, FilterState, NavTab } from '../types';
import { RelevanceGauge } from '../components/common/RelevanceGauge';
import { EvidenceThread } from '../components/common/EvidenceThread';
import {
  searchProjectPapers,
  attachPaperToProject,
  addPaperFromSearch,
  triggerCollectionAnalysis,
  triggerAISynthesis,
  BackendSearchResponse,
  BackendSearchResultPaper,
  BackendCollectionAnalysisResponse,
  BackendSynthesisResponse
} from '../services/api';

interface SearchResultsScreenProps {
  onSelectPaper: (paperId: string) => void;
  onNavigateToCompare: (selectedPaperIds: string[]) => void;
  onNavigate: (tab: NavTab) => void;
  projectId?: string;
  initialQuery?: string;
}

export const SearchResultsScreen: React.FC<SearchResultsScreenProps> = ({
  onSelectPaper,
  onNavigateToCompare,
  onNavigate,
  projectId,
  initialQuery = 'AI based computer vision for industrial waste sorting'
}) => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [rawResults, setRawResults] = useState<Map<string, BackendSearchResultPaper>>(new Map());
  const [attachedPaperIds, setAttachedPaperIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dbNote, setDbNote] = useState<string | null>(null);
  const [backendTotal, setBackendTotal] = useState<number | null>(null);
  const [searchProvider, setSearchProvider] = useState<string>('Semantic Scholar');

  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [expandedInsightIds, setExpandedInsightIds] = useState<string[]>([]);
  const [savedPaperIds, setSavedPaperIds] = useState<string[]>([]);

  // Action status / Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isAddingSelected, setIsAddingSelected] = useState<boolean>(false);

  // Collection Analysis state
  const [isAnalyzingCollection, setIsAnalyzingCollection] = useState<boolean>(false);
  const [collectionReport, setCollectionReport] = useState<BackendCollectionAnalysisResponse | null>(null);
  const [showCollectionModal, setShowCollectionModal] = useState<boolean>(false);

  // AI Synthesis state
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisResult, setSynthesisResult] = useState<BackendSynthesisResponse | null>(null);
  const [showSynthesisModal, setShowSynthesisModal] = useState<boolean>(false);

  // Filters
  const [filterQuery, setFilterQuery] = useState('');
  const [minRelevance, setMinRelevance] = useState(50);
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [openAccessOnly, setOpenAccessOnly] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // Manual Add Paper Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthors, setNewAuthors] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newYear, setNewYear] = useState(2024);
  const [newAbstract, setNewAbstract] = useState('');
  const [newDoi, setNewDoi] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  const executeSearch = async (queryText?: string) => {
    setIsLoading(true);
    setError(null);
    setFeedback(null);
    const q = queryText !== undefined ? queryText : searchQuery;

    try {
      const data: BackendSearchResponse = await searchProjectPapers(projectId, q);
      setBackendTotal(data.total_results);
      setDbNote(data.note || null);
      if (data.source) {
        setSearchProvider(data.source);
      }

      const attached = new Set<string>();
      const rawMap = new Map<string, BackendSearchResultPaper>();

      const mappedPapers: Paper[] = data.results.map((r: BackendSearchResultPaper, idx: number) => {
        const idKey = r.id || r.semantic_scholar_id || `paper-${idx}`;
        rawMap.set(idKey, r);

        if (r.is_attached && r.id) {
          attached.add(r.id);
          attached.add(idKey);
        }

        const authorsArr = Array.isArray(r.authors)
          ? r.authors
          : (typeof r.authors === 'string' ? [r.authors] : ['ResearchIQ Author']);

        return {
          id: idKey,
          displayId: `P${(idx + 1).toString().padStart(2, '0')}`,
          title: r.title,
          authors: authorsArr,
          year: r.publication_year || 2024,
          venue: r.venue || 'Semantic Scholar Index',
          citations: r.citation_count || 0,
          relevanceScore: r.relevance_score ? Math.round(r.relevance_score) : Math.max(65, 96 - idx * 3),
          isOpenAccess: r.is_open_access ?? false,
          source: (r.source as any) || 'Semantic Scholar',
          isVerified: true,
          isDemoPaper: false,
          abstract: r.abstract || 'No abstract text available from repository.',
          methodology: 'Academic research methodology and technical pipeline.',
          dataset: 'Evaluated Benchmark Datasets',
          datasetSize: 'Standard evaluation set',
          evaluationMetric: 'Standard evaluation benchmarks',
          bestResult: 'Evaluated against baselines',
          advantages: ['Scholarly indexed paper', 'Peer-reviewed contribution'],
          limitations: ['Extracted from scholarly index metadata'],
          innovations: ['Primary research literature contribution'],
          futureWork: ['Cross-paper synthesis and validation'],
          cluster: r.fields_of_study?.[0] || 'Computer Science',
          whyRelevant: `Matches research topic "${q}" via ${data.source || 'Semantic Scholar'}.`,
          evidenceThreads: [],
          fullTextSections: {
            abstract: r.abstract || '',
            introduction: 'Introduction section content...',
            methodology: 'Methodology details...',
            results: 'Experimental evaluation...',
            limitations: 'Limitations analysis...',
            futureWork: 'Future work directions...',
            references: [],
          },
          interpretation: {
            problem: 'Research challenge identified in abstract',
            approach: 'Scholarly proposed methodology',
            data: 'Empirical benchmark dataset',
            result: 'Reported experimental findings',
            limitation: 'Identified experimental constraints',
            contribution: 'Scholarly innovation and analysis',
          },
        };
      });

      setRawResults(rawMap);
      setAttachedPaperIds(attached);
      setPapers(mappedPapers);
    } catch (err: any) {
      console.warn('Search backend fetch failed:', err);
      setError('Search service unavailable.');
      setPapers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(initialQuery);
  }, [projectId]);

  const handleAttachSinglePaper = async (paperId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const raw = rawResults.get(paperId);

    try {
      if (raw && !raw.id) {
        // Semantic Scholar paper not yet in local DB: add via addPaperFromSearch
        const added = await addPaperFromSearch(projectId, {
          title: raw.title,
          abstract: raw.abstract || undefined,
          authors: raw.authors,
          publication_year: raw.publication_year || undefined,
          venue: raw.venue || undefined,
          doi: raw.doi || undefined,
          url: raw.url || undefined,
          pdf_url: raw.pdf_url || undefined,
          source: raw.source || 'Semantic Scholar',
          citation_count: raw.citation_count,
          is_open_access: raw.is_open_access ?? false,
          relevance_score: raw.relevance_score || undefined,
        });
        setAttachedPaperIds((prev) => {
          const next = new Set(prev);
          next.add(paperId);
          if (added.paper_id) next.add(added.paper_id);
          return next;
        });
      } else if (raw && raw.id) {
        await attachPaperToProject(projectId, raw.id);
        setAttachedPaperIds((prev) => {
          const next = new Set(prev);
          next.add(paperId);
          next.add(raw.id!);
          return next;
        });
      } else {
        await attachPaperToProject(projectId, paperId);
        setAttachedPaperIds((prev) => new Set(prev).add(paperId));
      }
      setFeedback({ type: 'success', message: 'Paper added to project successfully!' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to attach paper to project.' });
    }
  };

  const handleAddSelectedPapers = async () => {
    if (selectedPaperIds.length === 0) return;
    setIsAddingSelected(true);
    setFeedback(null);

    let addedCount = 0;
    const errors: string[] = [];

    for (const pid of selectedPaperIds) {
      if (attachedPaperIds.has(pid)) continue;
      const raw = rawResults.get(pid);

      try {
        if (raw && !raw.id) {
          const added = await addPaperFromSearch(projectId, {
            title: raw.title,
            abstract: raw.abstract || undefined,
            authors: raw.authors,
            publication_year: raw.publication_year || undefined,
            venue: raw.venue || undefined,
            doi: raw.doi || undefined,
            url: raw.url || undefined,
            pdf_url: raw.pdf_url || undefined,
            source: raw.source || 'Semantic Scholar',
            citation_count: raw.citation_count,
            is_open_access: raw.is_open_access ?? false,
          });
          setAttachedPaperIds((prev) => {
            const next = new Set(prev);
            next.add(pid);
            if (added.paper_id) next.add(added.paper_id);
            return next;
          });
          addedCount++;
        } else if (raw && raw.id) {
          await attachPaperToProject(projectId, raw.id);
          setAttachedPaperIds((prev) => {
            const next = new Set(prev);
            next.add(pid);
            next.add(raw.id!);
            return next;
          });
          addedCount++;
        }
      } catch (err: any) {
        if (err.message && err.message.includes('already attached')) {
          setAttachedPaperIds((prev) => new Set(prev).add(pid));
        } else {
          errors.push(err.message || `Failed to add ${pid}`);
        }
      }
    }

    setIsAddingSelected(false);
    if (addedCount > 0) {
      setFeedback({
        type: 'success',
        message: `Successfully added ${addedCount} selected paper${addedCount > 1 ? 's' : ''} to project.`
      });
    } else if (errors.length > 0) {
      setFeedback({ type: 'error', message: errors[0] });
    } else {
      setFeedback({ type: 'info', message: 'All selected papers are already in the project.' });
    }
  };

  const handleAnalyzeCollection = async () => {
    setIsAnalyzingCollection(true);
    setFeedback(null);

    try {
      const res = await triggerCollectionAnalysis(projectId);
      setCollectionReport(res);
      setShowCollectionModal(true);
      setFeedback({
        type: 'success',
        message: `Collection analyzed: ${res.analyzed} newly analyzed, ${res.skipped_already_analyzed} already analyzed.`
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Collection analysis failed. Ensure OPENROUTER_API_KEY is configured in backend/.env.'
      });
    } finally {
      setIsAnalyzingCollection(false);
    }
  };

  const handleRunAISynthesis = async () => {
    setIsSynthesizing(true);
    setFeedback(null);

    try {
      const res = await triggerAISynthesis(projectId);
      setSynthesisResult(res);
      setShowSynthesisModal(true);
      setFeedback({
        type: 'success',
        message: `AI Synthesis complete! Extracted ${res.insights_created} insights and ${res.relationships_created} paper relationships.`
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'OpenRouter integration is implemented but requires OPENROUTER_API_KEY for live execution.'
      });
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCreatePaperSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsSubmittingNew(true);

    try {
      await addPaperFromSearch(projectId, {
        title: newTitle,
        abstract: newAbstract || undefined,
        authors: newAuthors ? newAuthors.split(',').map((a) => a.trim()) : undefined,
        venue: newVenue || undefined,
        publication_year: newYear,
        doi: newDoi || undefined,
        source: 'Manual Add',
        is_open_access: true,
      });

      setAddModalOpen(false);
      setNewTitle('');
      setNewAuthors('');
      setNewVenue('');
      setNewAbstract('');
      setNewDoi('');

      setFeedback({ type: 'success', message: 'Custom paper added to project.' });
      executeSearch(searchQuery);
    } catch (err: any) {
      alert(err.message || 'Failed to add paper');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  const toggleSelectPaper = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPaperIds.includes(id)) {
      setSelectedPaperIds(selectedPaperIds.filter((p) => p !== id));
    } else {
      setSelectedPaperIds([...selectedPaperIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedPaperIds.length === filteredPapers.length) {
      setSelectedPaperIds([]);
    } else {
      setSelectedPaperIds(filteredPapers.map((p) => p.id));
    }
  };

  const toggleInsight = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandedInsightIds.includes(id)) {
      setExpandedInsightIds(expandedInsightIds.filter((item) => item !== id));
    } else {
      setExpandedInsightIds([...expandedInsightIds, id]);
    }
  };

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedPaperIds.includes(id)) {
      setSavedPaperIds(savedPaperIds.filter((item) => item !== id));
    } else {
      setSavedPaperIds([...savedPaperIds, id]);
    }
  };

  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      if (filterQuery) {
        const q = filterQuery.toLowerCase();
        const matchTitle = paper.title.toLowerCase().includes(q);
        const matchAbstract = paper.abstract.toLowerCase().includes(q);
        const matchMethod = paper.methodology.toLowerCase().includes(q);
        if (!matchTitle && !matchAbstract && !matchMethod) return false;
      }
      if (paper.relevanceScore < minRelevance) return false;
      if (selectedSource !== 'All' && paper.source !== selectedSource) return false;
      if (selectedYear !== 'All' && paper.year.toString() !== selectedYear) return false;
      if (openAccessOnly && !paper.isOpenAccess) return false;
      return true;
    });
  }, [papers, filterQuery, minRelevance, selectedSource, selectedYear, openAccessOnly]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative pb-28">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#FDE047] font-mono text-[11px] font-bold tracking-wider uppercase mb-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Globe className="w-3 h-3 text-[#F59E0B]" /> ONLINE SCHOLARLY SEARCH
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Research Literature Discovery
          </h2>
          <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-stone-300">
            <span className="text-[#F59E0B] font-semibold">Provider: Semantic Scholar</span>
            <span className="text-stone-500">•</span>
            <span className="text-stone-400">
              {backendTotal !== null ? `${backendTotal} scholarly papers found` : 'Online academic graph live'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleAnalyzeCollection}
            disabled={isAnalyzingCollection}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/[0.14] hover:border-[#F59E0B]/50 text-xs font-mono text-white transition-all shadow-sm disabled:opacity-50"
          >
            {isAnalyzingCollection ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F59E0B]" /> : <Cpu className="w-3.5 h-3.5 text-[#F59E0B]" />}
            <span>Analyze Research Collection</span>
          </button>

          <button
            onClick={handleRunAISynthesis}
            disabled={isSynthesizing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#B45309]/30 to-[#F59E0B]/30 border border-[#F59E0B]/40 hover:brightness-110 text-xs font-mono text-[#FDE047] transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)] disabled:opacity-50"
          >
            {isSynthesizing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F59E0B]" /> : <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />}
            <span>Generate Research Synthesis</span>
          </button>

          <button
            onClick={() => setFilterPanelOpen(!filterPanelOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.14] hover:border-[#F59E0B]/50 text-xs font-mono text-white transition-all shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Primary Search Box */}
      <div className="glass-card p-5 rounded-2xl border-[1.5px] border-white/[0.14] space-y-3 shadow-2xl">
        <div className="flex items-center justify-between">
          <label className="font-mono text-xs font-semibold text-white tracking-wide flex items-center gap-2">
            <Search className="w-4 h-4 text-[#F59E0B]" />
            <span>Research topic or question</span>
          </label>
          <span className="font-mono text-[11px] text-stone-400">
            Semantic Scholar Academic Graph
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeSearch(searchQuery);
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#F59E0B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. AI based computer vision for industrial waste sorting"
              className="w-full bg-white/[0.06] border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-stone-400 focus:outline-none focus:border-[#F59E0B] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] text-[#0C0B0A] font-mono text-xs font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_14px_rgba(245,158,11,0.4)] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Search Research Papers</span>
          </button>
        </form>

        {/* Quick Example Clickable Prompt */}
        <div className="flex flex-wrap items-center justify-between text-xs font-mono text-stone-400 pt-1 border-t border-white/10 gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-stone-400">Example:</span>
            <button
              type="button"
              onClick={() => {
                const ex = 'AI based computer vision for industrial waste sorting';
                setSearchQuery(ex);
                executeSearch(ex);
              }}
              className="text-[#FDE047] hover:underline cursor-pointer font-medium bg-white/[0.04] px-2 py-0.5 rounded border border-white/10"
            >
              AI based computer vision for industrial waste sorting
            </button>
          </div>
          {dbNote && <span className="text-[#FDE047] text-[11px]">{dbNote}</span>}
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs font-mono flex items-center justify-between animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-200'
              : feedback.type === 'error'
              ? 'bg-amber-500/15 border border-amber-500/30 text-amber-200'
              : 'bg-white/10 border border-white/20 text-stone-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => executeSearch(searchQuery)}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Literature Matrix Filters */}
      {filterPanelOpen && (
        <div className="glass-card p-4 sm:p-5 space-y-4 animate-in fade-in zoom-in-95 border-[1.5px] border-white/[0.14]">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-mono text-xs uppercase tracking-wider text-white font-bold flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#F59E0B]" /> Literature Filter Matrix
            </span>
            <button
              onClick={() => {
                setFilterQuery('');
                setMinRelevance(50);
                setSelectedSource('All');
                setSelectedYear('All');
                setOpenAccessOnly(false);
              }}
              className="text-[11px] font-mono text-[#F59E0B] hover:underline"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-stone-400">Filter Keywords</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="e.g. transformer, edge, polymer..."
                  className="w-full bg-white/[0.06] border border-white/10 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-stone-400">Min Relevance</span>
                <span className="text-[#F59E0B] font-bold">{minRelevance}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                value={minRelevance}
                onChange={(e) => setMinRelevance(Number(e.target.value))}
                className="w-full accent-[#F59E0B] bg-white/10 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-stone-400">Source Index</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full bg-[#0C0B0A] border border-white/15 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
              >
                <option value="All">All Sources</option>
                <option value="Semantic Scholar">Semantic Scholar</option>
                <option value="arXiv">arXiv</option>
                <option value="Crossref">Crossref</option>
                <option value="OpenAlex">OpenAlex</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-stone-400">Publication Year</label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="flex-1 bg-[#0C0B0A] border border-white/15 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
                >
                  <option value="All">All Years</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>

                <label className="flex items-center gap-1.5 text-xs font-mono text-stone-300 cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={openAccessOnly}
                    onChange={(e) => setOpenAccessOnly(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-[#F59E0B] accent-[#F59E0B]"
                  />
                  <span>Open Access</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Multi-selection Bar */}
      <div className="flex items-center justify-between px-1 text-xs font-mono text-stone-400">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="hover:text-white flex items-center gap-1.5 underline"
          >
            {selectedPaperIds.length === filteredPapers.length ? 'Deselect all' : 'Select all results'}
          </button>
          <span>•</span>
          <span>Showing {filteredPapers.length} papers</span>
        </div>

        {selectedPaperIds.length > 0 && (
          <button
            onClick={handleAddSelectedPapers}
            disabled={isAddingSelected}
            className="px-3.5 py-1.5 rounded-lg bg-[#F59E0B] text-[#0C0B0A] font-bold flex items-center gap-1.5 hover:brightness-110 shadow-[0_0_10px_#F59E0B]"
          >
            {isAddingSelected ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
            <span>Add Selected Papers ({selectedPaperIds.length})</span>
          </button>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading ? (
        <div className="glass-card p-12 text-center space-y-3 rounded-2xl border-[1.5px] border-white/[0.14]">
          <Loader2 className="w-8 h-8 text-[#F59E0B] animate-spin mx-auto" />
          <p className="font-mono text-sm text-stone-300">Searching Semantic Scholar Academic Graph...</p>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="glass-card p-12 text-center space-y-4 rounded-2xl border-[1.5px] border-white/[0.14]">
          <BookOpen className="w-12 h-12 text-stone-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No papers found</h3>
            <p className="font-mono text-xs text-stone-400 max-w-md mx-auto">
              No results returned for "{searchQuery}". Try modifying your query terms.
            </p>
          </div>
        </div>
      ) : (
        /* Papers Results List */
        <div className="space-y-4">
          {filteredPapers.map((paper) => {
            const isSelected = selectedPaperIds.includes(paper.id);
            const isInsightExpanded = expandedInsightIds.includes(paper.id);
            const isSaved = savedPaperIds.includes(paper.id);
            const isAttached = attachedPaperIds.has(paper.id);

            return (
              <article
                key={paper.id}
                onClick={() => onSelectPaper(paper.id)}
                className={`glass-card p-5 sm:p-6 flex flex-col gap-3.5 relative overflow-hidden group cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-[#F59E0B]/60 bg-white/[0.10] shadow-[0_0_24px_rgba(245,158,11,0.2)]'
                    : 'hover:border-white/30 hover:bg-white/[0.09]'
                }`}
              >
                {/* Card Header: Metadata + Selection Checkbox */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Add to Project action button */}
                    {isAttached ? (
                      <span className="font-mono text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-md font-semibold flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>In Project</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleAttachSinglePaper(paper.id, e)}
                        className="font-mono text-[11px] bg-[#F59E0B]/20 text-[#FDE047] hover:bg-[#F59E0B]/30 border border-[#F59E0B]/40 px-2.5 py-0.5 rounded-md font-semibold flex items-center gap-1 transition-all shadow-[0_0_8px_rgba(245,158,11,0.2)]"
                      >
                        <Plus className="w-3 h-3 text-[#F59E0B]" />
                        <span>Add to Project</span>
                      </button>
                    )}

                    <span className="font-mono text-xs text-stone-400">
                      {paper.year}
                    </span>
                    <span className="text-stone-600">•</span>
                    <span className="font-mono text-xs text-stone-300">
                      {paper.venue}
                    </span>
                    <span className="text-stone-600">•</span>
                    <span className="font-mono text-xs text-[#F59E0B]">
                      {paper.source}
                    </span>
                    {paper.isOpenAccess && (
                      <span className="font-mono text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Open Access PDF
                      </span>
                    )}
                  </div>

                  {/* Selection Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => toggleSelectPaper(paper.id, e)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-[#F59E0B] bg-[#F59E0B] text-[#0C0B0A] shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                        : 'border-white/30 bg-white/[0.06] hover:border-white/60'
                    }`}
                    aria-label="Select paper"
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                </div>

                {/* Paper Title */}
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#FDE047] transition-colors leading-snug pr-2">
                  {paper.title}
                </h3>

                {/* Authors */}
                <p className="font-mono text-xs text-stone-300 line-clamp-1">
                  {paper.authors.join(', ')}
                </p>

                {/* Metrics */}
                <div className="flex items-center gap-4">
                  <RelevanceGauge score={paper.relevanceScore} />
                  <span className="font-mono text-xs text-stone-400">
                    {paper.citations} citations
                  </span>
                  <span className="text-stone-600">•</span>
                  <span className="font-mono text-xs text-[#F59E0B] font-medium">
                    {paper.cluster}
                  </span>
                </div>

                {/* Abstract Preview */}
                <p className="font-sans text-xs sm:text-sm text-stone-300 leading-relaxed line-clamp-2">
                  {paper.abstract}
                </p>

                {/* Expandable Why Relevant */}
                <div>
                  <button
                    type="button"
                    onClick={(e) => toggleInsight(paper.id, e)}
                    className="flex items-center gap-1.5 text-[#F59E0B] hover:text-white transition-colors font-mono text-xs font-medium py-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Why relevant?</span>
                  </button>

                  {isInsightExpanded && (
                    <div className="mt-2 bg-white/[0.06] border-l-2 border-[#F59E0B] p-4 rounded-r-xl text-xs space-y-2 animate-in fade-in duration-200 backdrop-blur-md">
                      <p className="text-stone-200 font-sans leading-relaxed">
                        {paper.whyRelevant}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-2.5 border-t border-white/10 font-mono text-xs">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={(e) => toggleSave(paper.id, e)}
                      className={`flex items-center gap-1.5 hover:text-[#F59E0B] transition-colors ${
                        isSaved ? 'text-[#F59E0B] font-bold' : 'text-stone-400'
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#F59E0B]' : ''}`} />
                      <span>{isSaved ? 'Saved' : 'Save'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToCompare([paper.id]);
                      }}
                      className="flex items-center gap-1.5 text-stone-400 hover:text-white transition-colors"
                    >
                      <GitCompare className="w-3.5 h-3.5" />
                      <span>Compare</span>
                    </button>
                  </div>

                  <span className="text-[#F59E0B] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>Inspect Paper</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Floating Action Bar for Selected Papers */}
      {selectedPaperIds.length > 0 && (
        <div className="sticky bottom-4 z-30 max-w-lg mx-auto pt-2 pointer-events-auto">
          <div className="glass-card rounded-full p-2.5 sm:p-3 flex items-center justify-between shadow-[0_16px_48px_0_rgba(0,0,0,0.6)] border border-white/[0.22] backdrop-blur-[24px]">
            <div className="pl-4 font-mono text-xs text-white">
              <span className="font-bold text-[#F59E0B]">{selectedPaperIds.length}</span> papers selected
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddSelectedPapers}
                disabled={isAddingSelected}
                className="bg-[#F59E0B] hover:brightness-110 disabled:opacity-40 text-[#0C0B0A] font-mono text-xs font-bold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.5)] active:scale-95"
              >
                {isAddingSelected ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
                <span>Add Selected Papers</span>
              </button>

              <button
                onClick={() => onNavigateToCompare(selectedPaperIds)}
                disabled={selectedPaperIds.length < 2}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-mono text-xs font-bold px-3 py-2 rounded-full transition-all flex items-center gap-1"
              >
                <GitCompare className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Compare</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collection Analysis Modal */}
      {showCollectionModal && collectionReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 rounded-2xl border-[1.5px] border-white/20 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="text-lg font-bold text-white font-mono">
                  Collection Analysis Report
                </h3>
              </div>
              <button onClick={() => setShowCollectionModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-white/[0.04] p-3 rounded-xl border border-white/10 text-center">
                <span className="text-stone-400 block text-[11px]">Total Papers</span>
                <span className="text-lg font-bold text-white">{collectionReport.total}</span>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30 text-center">
                <span className="text-emerald-400 block text-[11px]">Analyzed / Ready</span>
                <span className="text-lg font-bold text-emerald-300">
                  {collectionReport.analyzed + collectionReport.skipped_already_analyzed}
                </span>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 text-center">
                <span className="text-amber-400 block text-[11px]">Errors / Skipped</span>
                <span className="text-lg font-bold text-amber-300">{collectionReport.failed}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="font-mono text-xs font-bold text-stone-300 uppercase tracking-wider block">
                Paper Processing Status
              </span>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {collectionReport.papers.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white/[0.03] p-2.5 rounded-lg border border-white/5 font-mono text-xs"
                  >
                    <span className="text-white truncate max-w-sm">{p.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status.includes('analyzed')
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-white/10 text-stone-400'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setShowCollectionModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F59E0B] text-[#0C0B0A] font-mono text-xs font-bold hover:brightness-110"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Synthesis Modal */}
      {showSynthesisModal && synthesisResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl border-[1.5px] border-white/20 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="text-lg font-bold text-white font-mono">
                  Cross-Paper AI Research Synthesis
                </h3>
              </div>
              <button onClick={() => setShowSynthesisModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="font-mono text-xs text-stone-300 flex items-center gap-4 bg-white/[0.04] p-3 rounded-xl border border-white/10">
              <div>Papers Synthesized: <span className="text-white font-bold">{synthesisResult.papers_analyzed}</span></div>
              <div>•</div>
              <div>Gaps Created: <span className="text-[#F59E0B] font-bold">{synthesisResult.insights_created}</span></div>
              <div>•</div>
              <div>Relationships: <span className="text-emerald-400 font-bold">{synthesisResult.relationships_created}</span></div>
            </div>

            {/* Common Methods & Datasets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10 space-y-2">
                <h4 className="font-mono text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
                  Common Methods
                </h4>
                <ul className="space-y-1 font-mono text-xs text-stone-200 list-disc list-inside">
                  {synthesisResult.synthesis.common_methods.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10 space-y-2">
                <h4 className="font-mono text-xs font-bold text-[#FDE047] uppercase tracking-wider">
                  Common Datasets
                </h4>
                <ul className="space-y-1 font-mono text-xs text-stone-200 list-disc list-inside">
                  {synthesisResult.synthesis.common_datasets.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Major Findings */}
            <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10 space-y-2">
              <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Major Findings
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-200 font-sans list-disc list-inside leading-relaxed">
                {synthesisResult.synthesis.major_findings.map((f, idx) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
            </div>

            {/* Contradictions & Trends */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {synthesisResult.synthesis.contradictions.length > 0 && (
                <div className="bg-[#C2410C]/10 p-4 rounded-xl border border-[#C2410C]/30 space-y-2">
                  <h4 className="font-mono text-xs font-bold text-[#FB923C] uppercase tracking-wider">
                    Contradictions
                  </h4>
                  <ul className="space-y-1 text-xs text-stone-200 list-disc list-inside">
                    {synthesisResult.synthesis.contradictions.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10 space-y-2">
                <h4 className="font-mono text-xs font-bold text-[#4edea3] uppercase tracking-wider">
                  Research Trends
                </h4>
                <ul className="space-y-1 text-xs text-stone-200 list-disc list-inside">
                  {synthesisResult.synthesis.research_trends.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Research Gaps & Future Directions */}
            <div className="space-y-3">
              <div className="bg-[#F87171]/10 p-4 rounded-xl border border-[#F87171]/30 space-y-2">
                <h4 className="font-mono text-xs font-bold text-[#F87171] uppercase tracking-wider">
                  Identified Research Gaps
                </h4>
                <ul className="space-y-1 text-xs text-stone-200 list-disc list-inside">
                  {synthesisResult.synthesis.research_gaps.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10 space-y-2">
                <h4 className="font-mono text-xs font-bold text-[#4cd7f6] uppercase tracking-wider">
                  Future Directions
                </h4>
                <ul className="space-y-1 text-xs text-stone-200 list-disc list-inside">
                  {synthesisResult.synthesis.future_directions.map((fd, idx) => (
                    <li key={idx}>{fd}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Paper Relationships */}
            {synthesisResult.synthesis.relationships.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Cross-Paper Relationships ({synthesisResult.synthesis.relationships.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {synthesisResult.synthesis.relationships.map((rel, idx) => (
                    <div
                      key={idx}
                      className="bg-white/[0.04] p-3 rounded-xl border border-white/10 space-y-1 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between text-[#F59E0B]">
                        <span className="font-bold">{rel.source_paper_title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-stone-300">
                          {rel.relationship_type} ({Math.round(rel.confidence * 100)}%)
                        </span>
                        <span className="font-bold">{rel.target_paper_title}</span>
                      </div>
                      {rel.evidence && (
                        <p className="text-stone-300 text-[11px] font-sans italic">{rel.evidence}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <span className="font-mono text-[11px] text-stone-400">
                Grounded via OpenRouter AI & saved to PostgreSQL
              </span>
              <button
                onClick={() => setShowSynthesisModal(false)}
                className="px-4 py-2 rounded-xl bg-[#F59E0B] text-[#0C0B0A] font-mono text-xs font-bold hover:brightness-110"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

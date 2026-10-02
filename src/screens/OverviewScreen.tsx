import React, { useState, useEffect } from 'react';
import {
  Search,
  Layers,
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen,
  Compass,
  FileText,
  Network,
  TrendingUp,
  Target,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  Database,
  Loader2,
  RefreshCw,
  AlertTriangle,
  GitFork,
  CheckCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import {
  ResearchProject,
  ResearchDepth,
  NavTab
} from '../types';
import { fetchProjectDashboard, fetchProjectInsights, BackendDashboardData, BackendInsight } from '../services/api';

interface OverviewScreenProps {
  onNavigate: (tab: NavTab) => void;
  onStartSearch: (query: string, depth?: ResearchDepth, sources?: string[], target?: number) => void;
  activeProject?: ResearchProject;
  projects?: ResearchProject[];
  onSelectProject?: (proj: ResearchProject) => void;
  onSelectPaper: (paperId: string) => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  onNavigate,
  onStartSearch,
  activeProject,
  projects = [],
  onSelectProject
}) => {
  const currentProject = activeProject || projects[0];
  const [viewMode, setViewMode] = useState<'command-center' | 'first-run'>('command-center');
  const [searchQuery, setSearchQuery] = useState('');
  const [depth, setDepth] = useState<ResearchDepth>('deep');
  const [targetType, setTargetType] = useState<'papers' | 'datasets'>('papers');

  // Backend Live Dashboard & Insights State
  const [dashboardData, setDashboardData] = useState<BackendDashboardData | null>(null);
  const [projectInsights, setProjectInsights] = useState<BackendInsight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dash, ins] = await Promise.all([
        fetchProjectDashboard(activeProject?.id),
        fetchProjectInsights(activeProject?.id).catch(() => [])
      ]);
      setDashboardData(dash);
      setProjectInsights(ins);
    } catch (err: any) {
      console.error('Error fetching dashboard statistics:', err);
      setError(err?.message || 'Failed to connect to backend database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [activeProject?.id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      onStartSearch(
        'AI-based industrial waste classification and autonomous sorting methodologies',
        depth,
        ['Semantic Scholar', 'arXiv', 'Crossref', 'OpenAlex'],
        50
      );
    } else {
      onStartSearch(
        searchQuery.trim(),
        depth,
        ['Semantic Scholar', 'arXiv', 'Crossref', 'OpenAlex'],
        50
      );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Mode Switcher & Database Status Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.04] p-3 rounded-2xl border border-white/[0.12] backdrop-blur-[30px] shadow-[0_8px_32px_0_rgba(0,0,0,0.65)]">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-2.5 w-2.5 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FCD34D] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FCD34D] shadow-[0_0_8px_#FCD34D]" />
          </div>
          <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
            Workspace Mode:
          </span>
          <span className="font-mono text-xs text-white font-bold">
            {viewMode === 'command-center' ? 'Active Dossier Analysis' : 'First-Run / Discovery Studio'}
          </span>
          {dashboardData && (
            <span className="hidden md:inline-flex items-center gap-1.5 ml-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px]">
              <Database className="w-3 h-3 text-emerald-400" /> PostgreSQL Live
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-white/[0.05] p-1 rounded-xl border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('command-center')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
              viewMode === 'command-center'
                ? 'bg-[#FCD34D] text-[#030508] font-bold shadow-[0_0_12px_rgba(252,211,77,0.6)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Command Center
          </button>
          <button
            onClick={() => setViewMode('first-run')}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all ${
              viewMode === 'first-run'
                ? 'bg-[#1E3A8A] text-white font-bold border border-[#60A5FA]/40 shadow-[0_0_12px_rgba(30,58,138,0.6)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            First-Run Search
          </button>
        </div>
      </div>

      {viewMode === 'first-run' ? (
        /* ================= FIRST-RUN / SEARCH COMPOSER VIEW ================= */
        <div className="max-w-4xl mx-auto space-y-10 py-4">
          {/* Main Hero Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCD34D]/15 border border-[#FCD34D]/30 text-[#FDE047] font-mono text-xs tracking-wider uppercase mb-2 shadow-[0_0_12px_rgba(252,211,77,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-[#FCD34D]" /> Research Intelligence Workspace
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              See what the research already knows.
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#FCD34D]">
              Find what it doesn't.
            </h2>
            <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto pt-2 font-sans leading-relaxed">
              Search across scholarly literature, understand the evidence, compare approaches, and uncover potential research opportunities from one unified cockpit.
            </p>
          </div>

          {/* Search Area Glass Panel with Deep Space ambient nebula */}
          <div className="relative group">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#0B1528] via-[#1E3A8A]/30 to-[#FCD34D]/25 blur-2xl opacity-75 pointer-events-none" />

            <div className="glass-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
              <form onSubmit={handleSearchSubmit} className="space-y-6 relative z-10">
                {/* Input box */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Describe your research idea (e.g. AI-based industrial waste classification)..."
                    className="w-full bg-white/[0.05] border border-white/[0.12] rounded-xl py-4 pl-12 pr-32 text-white placeholder:text-slate-400 focus:outline-none focus:border-[#FCD34D] focus:ring-2 focus:ring-[#FCD34D]/30 transition-all font-sans text-sm sm:text-base backdrop-blur-md"
                  />
                  <button
                    type="submit"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#1E3A8A] via-[#3B82F6] to-[#FCD34D] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_14px_rgba(252,211,77,0.4)] active:scale-95 border border-[#FCD34D]/40"
                  >
                    <span>Analyze</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FCD34D]" />
                  </button>
                </div>

                {/* Inline Controls (Depth & Target) */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
                  {/* Depth */}
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                      Depth
                    </span>
                    <div className="flex gap-1.5 bg-white/[0.04] p-1 rounded-lg border border-white/10">
                      <button
                        type="button"
                        onClick={() => setDepth('quick')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                          depth === 'quick'
                            ? 'bg-white/20 text-white font-semibold shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Quick Scan
                      </button>
                      <button
                        type="button"
                        onClick={() => setDepth('deep')}
                        className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                          depth === 'deep'
                            ? 'bg-[#FCD34D] text-[#030508] font-bold shadow-[0_0_10px_#FCD34D]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Deep Review
                      </button>
                    </div>
                  </div>

                  {/* Target */}
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                      Target
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTargetType('papers')}
                        className={`px-3 py-1.5 rounded-full border text-xs font-mono flex items-center gap-1.5 transition-all ${
                          targetType === 'papers'
                            ? 'bg-[#FCD34D]/20 border-[#FCD34D] text-[#FDE047] font-bold shadow-[0_0_10px_rgba(252,211,77,0.3)]'
                            : 'bg-white/[0.04] border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Papers
                      </button>
                      <button
                        type="button"
                        onClick={() => setTargetType('datasets')}
                        className={`px-3 py-1.5 rounded-full border text-xs font-mono flex items-center gap-1.5 transition-all ${
                          targetType === 'datasets'
                            ? 'bg-[#1E3A8A]/40 border-[#60A5FA]/50 text-white font-bold shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                            : 'bg-white/[0.04] border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" /> Datasets
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Three Core Insight Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-5 space-y-2 border-t-[1.5px] border-[#FCD34D]/40 hover:border-[#FCD34D]/60 transition-all">
              <div className="w-9 h-9 rounded-xl bg-[#FCD34D]/20 flex items-center justify-center text-[#FCD34D] border border-[#FCD34D]/30 shadow-[0_0_12px_rgba(252,211,77,0.25)] mb-2">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white font-sans tracking-wide">DISCOVER</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Map semantic literature spaces across 240M+ papers without needing exact boolean keywords.
              </p>
            </div>

            <div className="glass-card p-5 space-y-2 border-t-[1.5px] border-[#3B82F6]/50 hover:border-[#3B82F6]/70 transition-all">
              <div className="w-9 h-9 rounded-xl bg-[#1E3A8A]/30 flex items-center justify-center text-[#93C5FD] border border-[#3B82F6]/40 shadow-[0_0_12px_rgba(59,130,246,0.25)] mb-2">
                <Network className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white font-sans tracking-wide">COMPARE</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Understand how benchmarks, architectures, and empirical findings contrast across studies.
              </p>
            </div>

            <div className="glass-card p-5 space-y-2 border-t-[1.5px] border-[#E2E8F0]/30 hover:border-[#E2E8F0]/50 transition-all">
              <div className="w-9 h-9 rounded-xl bg-white/[0.08] flex items-center justify-center text-[#FDE047] border border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.15)] mb-2">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white font-sans tracking-wide">UNCOVER</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Triangulate underexplored research opportunities and contradictory evidence signals.
              </p>
            </div>
          </div>

          {/* Recent Research Landscape Projects */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Your research landscape</h3>
              <button
                onClick={() => onNavigate('reports')}
                className="font-mono text-xs text-[#FCD34D] uppercase hover:underline flex items-center gap-1"
              >
                View All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {(projects.length > 0 ? projects : []).map((proj) => (
                <div
                  key={proj.id}
                  className="glass-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/30 transition-all group relative overflow-hidden"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-[#FCD34D] font-semibold uppercase tracking-wider">
                        {proj.title.length > 20 ? proj.title.substring(0, 20) + '...' : proj.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-mono ${
                          proj.status === 'Active'
                            ? 'border border-[#FCD34D]/40 text-[#FDE047] bg-[#FCD34D]/10'
                            : 'border border-white/20 text-slate-400'
                        }`}
                      >
                        {proj.status}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm sm:text-base text-white group-hover:text-[#FDE047] transition-colors">
                      {proj.title}
                    </h4>

                    <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#FCD34D]" /> {proj.papersCount} sources
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {proj.lastActive}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectProject) onSelectProject(proj);
                      onNavigate('papers');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-[#FCD34D] hover:text-[#030508] text-white text-xs font-mono font-bold uppercase tracking-wider transition-all self-start sm:self-center active:scale-95 border border-white/[0.12] shadow-[0_0_12px_rgba(252,211,77,0.15)] hover:shadow-[0_0_16px_rgba(252,211,77,0.6)]"
                  >
                    Continue
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ================= POST-ANALYSIS / COMMAND CENTER VIEW ================= */
        <div className="space-y-6">
          {isLoading ? (
            /* Loading State */
            <div className="glass-card p-12 text-center flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-[#FCD34D] animate-spin" />
              <div className="space-y-1">
                <p className="font-mono text-sm text-white font-semibold">
                  Connecting to PostgreSQL Database...
                </p>
                <p className="font-mono text-xs text-slate-400">
                  Synthesizing project papers, relationships, and insight vectors
                </p>
              </div>
            </div>
          ) : error ? (
            /* Error State */
            <div className="glass-card p-6 border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Database Connection Notice</h4>
                  <p className="text-xs text-slate-400">{error}</p>
                </div>
              </div>
              <button
                onClick={loadDashboard}
                className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white font-mono text-xs flex items-center gap-2 border border-white/10 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#FCD34D]" /> Retry Sync
              </button>
            </div>
          ) : (
            <>
              {/* Dossier Header & Topic Banner */}
              <div className="glass-card p-6 sm:p-7 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="space-y-1.5 z-10">
                  <div className="flex items-center gap-2 font-mono text-xs text-[#FCD34D]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="uppercase tracking-wider font-bold">Literature Synthesis Active</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">
                      {dashboardData?.project_summary.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                      <Database className="w-3 h-3" /> Live Data
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {dashboardData?.project_summary.title || currentProject.query}
                  </h2>
                  {dashboardData?.project_summary.research_question && (
                    <p className="text-xs text-slate-400 font-sans max-w-2xl pt-0.5">
                      {dashboardData.project_summary.research_question}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 z-10">
                  <button
                    onClick={() => onNavigate('map')}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.12] hover:border-[#FCD34D]/50 text-white text-xs font-mono font-semibold flex items-center gap-2 transition-all shadow-sm"
                  >
                    <Network className="w-4 h-4 text-[#FCD34D]" /> Open Research Map ({dashboardData?.relationships.total_relationships || 0})
                  </button>
                  <button
                    onClick={() => onNavigate('literature-review')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E3A8A] via-[#3B82F6] to-[#FCD34D] hover:brightness-110 text-white font-bold text-xs font-mono flex items-center gap-2 transition-all shadow-[0_0_16px_rgba(252,211,77,0.35)] border border-[#FCD34D]/40"
                  >
                    <FileText className="w-4 h-4" /> Build Review
                  </button>
                </div>
              </div>

              {/* KPI Strip (Real PostgreSQL Data) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* 1. Papers in Project */}
                <div 
                  onClick={() => onNavigate('papers')}
                  className="glass-card p-4 space-y-1 cursor-pointer hover:border-white/30 transition-all"
                >
                  <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    Project Papers
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  </span>
                  <p className="text-2xl font-bold font-mono text-white">
                    {dashboardData?.paper_analysis.total_papers ?? 0}
                  </p>
                  <span className="text-[11px] font-mono text-slate-400">
                    {dashboardData?.global_overview.total_papers ?? 0} in database
                  </span>
                </div>

                {/* 2. Analyzed Papers */}
                <div 
                  onClick={() => onNavigate('papers')}
                  className="glass-card p-4 space-y-1 cursor-pointer hover:border-[#FCD34D]/40 transition-all"
                >
                  <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    Analyzed Papers
                    <CheckCircle className="w-3.5 h-3.5 text-[#FDE047]" />
                  </span>
                  <p className="text-2xl font-bold font-mono text-[#FDE047]">
                    {dashboardData?.paper_analysis.analyzed_papers ?? 0}
                  </p>
                  <span className="text-[11px] font-mono text-slate-400">
                    {dashboardData?.paper_analysis.coverage_percentage ?? 0}% coverage
                  </span>
                </div>

                {/* 3. Paper Relationships */}
                <div 
                  onClick={() => onNavigate('map')}
                  className="glass-card p-4 space-y-1 cursor-pointer hover:border-[#FCD34D]/40 transition-all"
                >
                  <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    Relationships
                    <GitFork className="w-3.5 h-3.5 text-[#FCD34D]" />
                  </span>
                  <p className="text-2xl font-bold font-mono text-[#FCD34D]">
                    {dashboardData?.relationships.total_relationships ?? 0}
                  </p>
                  <span className="text-[11px] font-mono text-[#FCD34D]/80">
                    {Math.round((dashboardData?.relationships.average_strength || 0) * 100)}% avg strength
                  </span>
                </div>

                {/* 4. Research Gaps */}
                <div 
                  onClick={() => onNavigate('gaps')}
                  className="glass-card p-4 space-y-1 cursor-pointer hover:border-[#60A5FA]/40 transition-all"
                >
                  <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    Research Gaps
                    <Target className="w-3.5 h-3.5 text-[#60A5FA]" />
                  </span>
                  <p className="text-2xl font-bold font-mono text-[#60A5FA]">
                    {String(dashboardData?.insights.gaps_count ?? 0).padStart(2, '0')}
                  </p>
                  <span className="text-[11px] font-mono text-[#60A5FA]/80">
                    {dashboardData?.insights.total_insights ?? 0} total insights
                  </span>
                </div>

                {/* 5. Innovations & Opportunities */}
                <div 
                  onClick={() => onNavigate('innovations')}
                  className="glass-card p-4 space-y-1 col-span-2 sm:col-span-1 cursor-pointer hover:border-white/30 transition-all"
                >
                  <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    Innovations
                    <Lightbulb className="w-3.5 h-3.5 text-[#E2E8F0]" />
                  </span>
                  <p className="text-2xl font-bold font-mono text-[#E2E8F0]">
                    {String(dashboardData?.insights.innovations_count ?? 0).padStart(2, '0')}
                  </p>
                  <span className="text-[11px] font-mono text-slate-400">
                    +{dashboardData?.insights.opportunities_count ?? 0} Opportunities
                  </span>
                </div>
              </div>

              {/* Central Intelligence Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 7 Columns: Analysis Coverage, Relationships & Evolution */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Paper Analysis & Coverage Card */}
                  <div className="glass-card p-6 space-y-4 border-t-[1.5px] border-[#FCD34D]/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#FCD34D]" />
                        <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
                          Paper Analysis Overview
                        </h3>
                      </div>
                      <span className="font-mono text-xs text-[#FDE047] font-bold">
                        {dashboardData?.paper_analysis.coverage_percentage}% Analyzed
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1.5">
                      <div className="w-full h-2.5 bg-white/[0.08] rounded-full overflow-hidden border border-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-[#1E3A8A] via-[#3B82F6] to-[#FCD34D] rounded-full transition-all duration-500"
                          style={{ width: `${dashboardData?.paper_analysis.coverage_percentage || 0}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>{dashboardData?.paper_analysis.analyzed_papers || 0} Fully Extracted</span>
                        <span>{dashboardData?.paper_analysis.unanalyzed_papers || 0} Pending Analysis</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-1">
                      <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10 text-center">
                        <span className="font-mono text-[10px] text-slate-400 uppercase">Attached</span>
                        <p className="text-base font-bold font-mono text-white mt-0.5">
                          {dashboardData?.paper_analysis.total_papers || 0}
                        </p>
                      </div>
                      <div className="bg-white/[0.03] p-3 rounded-xl border border-[#FCD34D]/20 text-center">
                        <span className="font-mono text-[10px] text-[#FCD34D] uppercase">Analyzed</span>
                        <p className="text-base font-bold font-mono text-[#FDE047] mt-0.5">
                          {dashboardData?.paper_analysis.analyzed_papers || 0}
                        </p>
                      </div>
                      <div className="bg-white/[0.03] p-3 rounded-xl border border-white/10 text-center">
                        <span className="font-mono text-[10px] text-slate-400 uppercase">Unanalyzed</span>
                        <p className="text-base font-bold font-mono text-slate-300 mt-0.5">
                          {dashboardData?.paper_analysis.unanalyzed_papers || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Research Relationships Overview */}
                  <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Network className="w-4 h-4 text-[#FCD34D]" />
                        <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
                          Research Relationships Breakdown
                        </h3>
                      </div>
                      <button
                        onClick={() => onNavigate('map')}
                        className="font-mono text-xs text-[#FCD34D] hover:underline flex items-center gap-1"
                      >
                        Explore Graph ({dashboardData?.relationships.total_relationships || 0}) →
                      </button>
                    </div>

                    {/* Relationship type tags */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {dashboardData?.relationships.by_type &&
                      Object.keys(dashboardData.relationships.by_type).length > 0 ? (
                        Object.entries(dashboardData.relationships.by_type).map(([typeKey, count]) => (
                          <div
                            key={typeKey}
                            className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2 font-mono text-xs"
                          >
                            <span className="capitalize text-slate-300 font-semibold">{typeKey}:</span>
                            <span className="px-1.5 py-0.5 rounded bg-[#FCD34D]/20 text-[#FDE047] font-bold text-[10px]">
                              {count}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs font-mono text-slate-400">
                          No direct relationships detected yet.
                        </p>
                      )}
                    </div>

                    {/* Simulated Mini Constellation Canvas */}
                    <div 
                      onClick={() => onNavigate('map')}
                      className="h-44 bg-[#030508]/80 rounded-xl border border-white/[0.12] relative overflow-hidden flex items-center justify-center cursor-pointer group shadow-inner"
                    >
                      <div className="absolute inset-0 grid-texture opacity-50" />
                      
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="w-5 h-5 rounded-full bg-[#FCD34D] node-glow-gold animate-pulse" />
                        <span className="font-mono text-[10px] text-white mt-1 font-bold">Deep Learning Core</span>
                      </div>

                      <div className="absolute top-1/4 left-1/4 flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-[#3B82F6] node-glow-blue" />
                        <span className="font-mono text-[9px] text-slate-300 mt-1">Computer Vision</span>
                      </div>

                      <div className="absolute bottom-1/4 left-1/3 flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-[#06B6D4] node-glow-cyan" />
                        <span className="font-mono text-[9px] text-[#A5F3FC] mt-1">TinyML Edge</span>
                      </div>

                      <div className="absolute top-1/4 right-1/4 flex flex-col items-center">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#E2E8F0]/80 node-glow-silver" />
                        <span className="font-mono text-[9px] text-slate-400 mt-1">Scaling Laws</span>
                      </div>

                      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                        <line x1="25%" y1="25%" x2="50%" y2="50%" stroke="#3B82F6" strokeWidth="1.5" />
                        <line x1="50%" y1="50%" x2="33%" y2="75%" stroke="#FCD34D" strokeWidth="1.5" />
                        <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="#06B6D4" strokeWidth="1.5" />
                      </svg>

                      <div className="absolute bottom-2.5 right-3 font-mono text-[10px] text-slate-300 bg-white/[0.06] backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                        Click to view {dashboardData?.relationships.total_relationships || 0} mapped edges
                      </div>
                    </div>
                  </div>

                  {/* Research Evolution Summary */}
                  <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#FCD34D]" />
                        <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
                          Domain Evolution Synthesis
                        </h3>
                      </div>
                      <button
                        onClick={() => onNavigate('trends')}
                        className="font-mono text-xs text-[#FCD34D] hover:underline"
                      >
                        Explore Trends →
                      </button>
                    </div>

                    <p className="text-sm text-slate-300 font-sans leading-relaxed">
                      Research activity has shifted decisively from conventional 2D CNN-based spatial classification toward <strong className="text-white">hyperspectral vision transformers (ViT)</strong> and <strong className="text-white">sub-50mW decentralized TinyML microcontrollers</strong>. Early rigid polymer sorting (PET/PP) is well established, whereas real-time black plastic sorting and multi-layer film packaging remain active frontiers.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="bg-white/[0.04] p-3.5 rounded-xl border border-white/10 space-y-1 backdrop-blur-sm">
                        <span className="font-mono text-[10px] text-[#FCD34D] uppercase font-bold">
                          Dominant Emerging Method
                        </span>
                        <p className="text-xs font-semibold text-white">Spatial-Spectral Self-Attention</p>
                        <p className="text-[11px] text-slate-400">98.7% purity at 4.2 m/s conveyor speed</p>
                      </div>

                      <div className="bg-white/[0.04] p-3.5 rounded-xl border border-white/10 space-y-1 backdrop-blur-sm">
                        <span className="font-mono text-[10px] text-[#60A5FA] uppercase font-bold">
                          Leading Hardware Trend
                        </span>
                        <p className="text-xs font-semibold text-white">Sub-50mW Solar TinyML</p>
                        <p className="text-[11px] text-slate-400">INT4/INT8 quantization on Cortex-M</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right 5 Columns: Gaps, Opportunities & Global Workspace */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Research Insights Summary */}
                  <div className="glass-card p-5 space-y-4 border-t-[1.5px] border-[#FCD34D]/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#FCD34D]" />
                        <h3 className="font-bold text-sm text-white font-mono uppercase">
                          Research Insights
                        </h3>
                      </div>
                      <span className="font-mono text-xs text-[#FDE047] font-bold">
                        {dashboardData?.insights.total_insights || 0} Total
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div 
                        onClick={() => onNavigate('gaps')}
                        className="bg-white/[0.04] hover:bg-white/[0.08] p-3 rounded-xl border border-white/10 cursor-pointer transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-[#60A5FA] uppercase font-bold">Gaps</span>
                          <Target className="w-3.5 h-3.5 text-[#60A5FA]" />
                        </div>
                        <p className="text-xl font-bold font-mono text-white">
                          {dashboardData?.insights.gaps_count || 0}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400">Underexplored</span>
                      </div>

                      <div 
                        onClick={() => onNavigate('innovations')}
                        className="bg-white/[0.04] hover:bg-white/[0.08] p-3 rounded-xl border border-white/10 cursor-pointer transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-[#FCD34D] uppercase font-bold">Innovations</span>
                          <Lightbulb className="w-3.5 h-3.5 text-[#FCD34D]" />
                        </div>
                        <p className="text-xl font-bold font-mono text-[#FDE047]">
                          {dashboardData?.insights.innovations_count || 0}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400">Breakthroughs</span>
                      </div>

                      <div 
                        onClick={() => onNavigate('contradictions')}
                        className="bg-white/[0.04] hover:bg-white/[0.08] p-3 rounded-xl border border-white/10 cursor-pointer transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-[#F87171] uppercase font-bold">Contradictions</span>
                          <AlertTriangle className="w-3.5 h-3.5 text-[#F87171]" />
                        </div>
                        <p className="text-xl font-bold font-mono text-white">
                          {dashboardData?.insights.contradictions_count || 0}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400">Conflicting findings</span>
                      </div>

                      <div 
                        onClick={() => onNavigate('opportunities')}
                        className="bg-white/[0.04] hover:bg-white/[0.08] p-3 rounded-xl border border-white/10 cursor-pointer transition-colors space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-[#34D399] uppercase font-bold">Opportunities</span>
                          <Compass className="w-3.5 h-3.5 text-[#34D399]" />
                        </div>
                        <p className="text-xl font-bold font-mono text-[#34D399]">
                          {dashboardData?.insights.opportunities_count || 0}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400">Directions</span>
                      </div>
                    </div>
                  </div>

                  {/* Potential Gaps Preview */}
                  <div className="glass-card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#FCD34D]" />
                        <h3 className="font-bold text-sm text-white font-mono uppercase">
                          Potential Research Gaps
                        </h3>
                      </div>
                      <button
                        onClick={() => onNavigate('gaps')}
                        className="font-mono text-xs text-[#FCD34D] hover:underline"
                      >
                        View All ({dashboardData?.insights.gaps_count || 3}) →
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {projectInsights.length > 0 ? (
                        projectInsights.slice(0, 2).map((item, idx) => (
                          <div
                            key={item.id}
                            onClick={() => onNavigate('gaps')}
                            className="bg-white/[0.04] hover:bg-white/[0.08] p-3.5 rounded-xl border border-white/10 cursor-pointer transition-colors space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] text-[#FCD34D] font-bold uppercase">
                                {item.type} #{idx + 1}
                              </span>
                              {item.confidence !== null && item.confidence !== undefined && (
                                <span className="px-2 py-0.5 rounded-full bg-[#FCD34D]/15 text-[#FDE047] text-[9px] font-mono border border-[#FCD34D]/30">
                                  {Math.round(item.confidence * 100)}% Conf
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-semibold text-white line-clamp-1">
                              {item.title}
                            </h4>
                            {item.evidence && (
                              <p className="text-[11px] text-slate-400 line-clamp-2">
                                {item.evidence}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs font-mono text-stone-400 bg-white/[0.02] rounded-xl border border-white/5">
                          No research gaps or insights generated yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Global Workspace Intelligence Overview */}
                  <div className="glass-card p-5 space-y-3 border-t-[1.5px] border-[#3B82F6]/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-[#3B82F6]" />
                        <h3 className="font-bold text-sm text-white font-mono uppercase">
                          Workspace Global Overview
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/10">
                        <span className="text-slate-400 text-[10px]">Total Projects</span>
                        <p className="text-sm font-bold text-white mt-0.5">
                          {dashboardData?.global_overview.total_projects || 1}
                        </p>
                      </div>
                      <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/10">
                        <span className="text-slate-400 text-[10px]">Total Papers</span>
                        <p className="text-sm font-bold text-white mt-0.5">
                          {dashboardData?.global_overview.total_papers || 0}
                        </p>
                      </div>
                      <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/10">
                        <span className="text-slate-400 text-[10px]">Total Analyses</span>
                        <p className="text-sm font-bold text-[#FDE047] mt-0.5">
                          {dashboardData?.global_overview.total_analyses || 0}
                        </p>
                      </div>
                      <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/10">
                        <span className="text-slate-400 text-[10px]">Total Insights</span>
                        <p className="text-sm font-bold text-[#60A5FA] mt-0.5">
                          {dashboardData?.global_overview.total_insights || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Jump into Test an Idea */}
                  <div className="glass-card p-5 rounded-2xl border border-[#FCD34D]/30 space-y-3 relative overflow-hidden">
                    <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase">
                      <Sparkles className="w-4 h-4 text-[#FCD34D]" /> Test a Novel Hypothesis
                    </div>
                    <p className="text-xs text-slate-400">
                      Evaluate your idea against this {dashboardData?.paper_analysis.total_papers || 5}-paper corpus for literature overlap and differentiation.
                    </p>
                    <button
                      onClick={() => onNavigate('test-idea')}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#1E3A8A] via-[#3B82F6] to-[#FCD34D] hover:brightness-110 text-white text-xs font-mono font-bold transition-all shadow-[0_0_14px_rgba(252,211,77,0.3)] border border-[#FCD34D]/30"
                    >
                      Launch Novelty Evaluator
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

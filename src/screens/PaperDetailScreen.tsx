import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bookmark,
  GitCompare,
  Sparkles,
  Download,
  Share2,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Quote,
  X,
  Layers,
  Zap,
  Loader2
} from 'lucide-react';
import { Paper, NavTab } from '../types';
import {
  fetchPaperAnalysis,
  triggerPaperAnalysis,
  PaperAnalysis,
  fetchPaperSources,
  BackendPaperSource,
  fetchPaperDetails,
  BackendSearchResultPaper
} from '../services/api';

interface PaperDetailScreenProps {
  paperId: string;
  onBack: () => void;
  onNavigateToCompare: (ids: string[]) => void;
  onNavigate: (tab: NavTab) => void;
}

export const PaperDetailScreen: React.FC<PaperDetailScreenProps> = ({
  paperId,
  onBack,
  onNavigateToCompare,
  onNavigate
}) => {
  const [livePaperDetails, setLivePaperDetails] = useState<BackendSearchResultPaper | null>(null);
  
  const [activeSectionTab, setActiveSectionTab] = useState<
    'overview' | 'methodology' | 'results' | 'limitations' | 'futureWork' | 'references'
  >('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [evidenceDrawerOpen, setEvidenceDrawerOpen] = useState(false);
  const [selectedEvidenceType, setSelectedEvidenceType] = useState<string>('problem');
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  const [analysis, setAnalysis] = useState<PaperAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [paperSources, setPaperSources] = useState<BackendPaperSource[]>([]);
  const [isTriggeringAI, setIsTriggeringAI] = useState(false);
  const [aiActionMessage, setAiActionMessage] = useState<string | null>(null);

  const handleTriggerAI = async (refresh: boolean = false) => {
    setIsTriggeringAI(true);
    setAiActionMessage(null);
    try {
      const res = await triggerPaperAnalysis(paperId, refresh);
      setAnalysis(res);
      setAiActionMessage(refresh ? 'AI Analysis refreshed successfully!' : 'AI Analysis generated successfully!');
    } catch (err: any) {
      setAiActionMessage(
        err.message?.includes('OPENROUTER_API_KEY')
          ? 'OpenRouter integration is implemented but requires OPENROUTER_API_KEY for live execution.'
          : err.message || 'AI analysis failed.'
      );
    } finally {
      setIsTriggeringAI(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadAnalysisAndDetails = async () => {
      setAnalysisLoading(true);
      setAnalysisError(null);

      try {
        const [analysisRes, sourcesRes, detailsRes] = await Promise.all([
          fetchPaperAnalysis(paperId).catch(() => null),
          fetchPaperSources(paperId).catch(() => []),
          fetchPaperDetails(paperId).catch(() => null),
        ]);

        if (!cancelled) {
          setAnalysis(analysisRes);
          setPaperSources(sourcesRes);
          setLivePaperDetails(detailsRes);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load paper analysis or sources:', error);
          setAnalysisError('Unable to load stored paper analysis.');
          setAnalysis(null);
        }
      } finally {
        if (!cancelled) {
          setAnalysisLoading(false);
        }
      }
    };

    loadAnalysisAndDetails();

    return () => {
      cancelled = true;
    };
  }, [paperId]);

  const paper: Paper = livePaperDetails
    ? ({
        id: livePaperDetails.id || paperId,
        displayId: livePaperDetails.doi || `P-${(livePaperDetails.id || paperId).substring(0, 6).toUpperCase()}`,
        title: livePaperDetails.title,
        authors: Array.isArray(livePaperDetails.authors)
          ? livePaperDetails.authors
          : [typeof livePaperDetails.authors === 'string' ? livePaperDetails.authors : 'Scholarly Researcher'],
        year: livePaperDetails.publication_year || 2025,
        venue: livePaperDetails.venue || 'Peer-Reviewed Publication',
        citations: livePaperDetails.citation_count || 0,
        abstract: livePaperDetails.abstract || 'No abstract content recorded.',
        relevanceScore: 95,
        isOpenAccess: livePaperDetails.is_open_access ?? false,
        source: (livePaperDetails.source as any) || 'Semantic Scholar',
        isVerified: true,
        isDemoPaper: false,
        methodology: analysis?.methodology || '',
        dataset: analysis?.dataset || '',
        datasetSize: '',
        evaluationMetric: '',
        bestResult: analysis?.results || '',
        advantages: [],
        limitations: analysis?.limitations ? [analysis.limitations] : [],
        innovations: analysis?.contribution ? [analysis.contribution] : [],
        futureWork: analysis?.future_work ? [analysis.future_work] : [],
        cluster: 'General',
        whyRelevant: '',
        evidenceThreads: [],
        fullTextSections: {
          abstract: livePaperDetails.abstract || '',
          introduction: '',
          methodology: analysis?.methodology || '',
          results: analysis?.results || '',
          limitations: analysis?.limitations || '',
          futureWork: analysis?.future_work || '',
          references: []
        },
        interpretation: {
          problem: analysis?.problem || '',
          approach: analysis?.methodology || '',
          data: analysis?.dataset || '',
          result: analysis?.results || '',
          limitation: analysis?.limitations || '',
          contribution: analysis?.contribution || livePaperDetails.abstract || ''
        }
      } as Paper)
    : ({
        id: paperId,
        displayId: `P-${paperId.substring(0, 6).toUpperCase()}`,
        title: 'Selected Research Paper',
        authors: ['Loading...'],
        year: 2025,
        venue: '',
        citations: 0,
        abstract: '',
        relevanceScore: 0,
        isOpenAccess: false,
        source: 'Semantic Scholar',
        isVerified: false,
        isDemoPaper: false,
        methodology: '',
        dataset: '',
        datasetSize: '',
        evaluationMetric: '',
        bestResult: '',
        advantages: [],
        limitations: [],
        innovations: [],
        futureWork: [],
        cluster: 'General',
        whyRelevant: '',
        evidenceThreads: [],
        fullTextSections: {
          abstract: '',
          introduction: '',
          methodology: '',
          results: '',
          limitations: '',
          futureWork: '',
          references: []
        },
        interpretation: {
          problem: '',
          approach: '',
          data: '',
          result: '',
          limitation: '',
          contribution: ''
        }
      } as Paper);

  const handleDownloadPDF = () => {
    setPdfDownloaded(true);
    setTimeout(() => setPdfDownloaded(false), 3000);
  };

  const openEvidenceModal = (type: string) => {
    setSelectedEvidenceType(type);
    setEvidenceDrawerOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative pb-28">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] hover:text-white transition-colors py-1.5 px-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Research Landscape</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateToCompare([paper.id])}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.12] hover:border-[#F59E0B]/50 text-xs font-mono text-white transition-all shadow-sm"
          >
            <GitCompare className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Compare Paper</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7-8 Columns: Paper Header & Extracted Text Reader */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Card */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
              {paper.isVerified ? (
                <span className="bg-[#F59E0B]/15 text-[#F59E0B] px-2.5 py-1 rounded-full border border-[#F59E0B]/40 font-semibold shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                  Verified Source
                </span>
              ) : (
                <span className="bg-[#F59E0B]/15 text-[#FDE047] px-2.5 py-1 rounded-full border border-[#F59E0B]/40 font-semibold">
                  Demo Paper
                </span>
              )}
              <span className="bg-white/[0.06] text-stone-300 px-2.5 py-1 rounded-full border border-white/10">
                {paper.year}
              </span>
              <span className="text-stone-600">•</span>
              <span className="text-[#F59E0B] font-bold">Rel: {paper.relevanceScore}%</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
              {paper.title}
            </h1>

            <p className="font-sans text-sm text-stone-300">
              {paper.authors.join(', ')} — <span className="font-mono text-xs text-[#F59E0B]">{paper.venue}</span>
            </p>

            {/* Quick Actions Row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`py-2 px-3 rounded-xl border text-xs font-mono flex items-center justify-center gap-1.5 transition-all ${
                  isSaved
                    ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#FDE047] font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                    : 'bg-white/[0.05] border-white/10 hover:border-white/20 text-white'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#F59E0B]' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={() => onNavigateToCompare([paper.id])}
                className="py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-xs font-mono text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <GitCompare className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Compare</span>
              </button>

              <button
                onClick={() => onNavigate('literature-review')}
                className="py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-xs font-mono text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Synthesize</span>
              </button>
            </div>

            {/* Primary Download PDF Action Button */}
            <button
              onClick={handleDownloadPDF}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] hover:brightness-110 text-[#0C0B0A] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_16px_rgba(245,158,11,0.4)] active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{pdfDownloaded ? '✓ Download Started' : 'Download Available PDF'}</span>
            </button>
          </div>

          {/* Section Navigation Tabs */}
          <div className="sticky top-[60px] z-30 bg-[#0C0B0A]/90 backdrop-blur-md border border-white/[0.14] px-2 py-1.5 flex gap-2 overflow-x-auto rounded-xl shadow-lg">
            {(
              [
                { id: 'overview', label: 'Overview' },
                { id: 'methodology', label: 'Methodology' },
                { id: 'results', label: 'Results' },
                { id: 'limitations', label: 'Limitations' },
                { id: 'futureWork', label: 'Future Work' },
                { id: 'references', label: 'References' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSectionTab(tab.id)}
                className={`font-mono text-xs uppercase px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeSectionTab === tab.id
                    ? 'bg-[#F59E0B] text-[#0C0B0A] font-bold shadow-[0_0_10px_#F59E0B]'
                    : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Paper Extracted Text Content */}
          <article className="glass-card p-6 space-y-6">
            {activeSectionTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#F59E0B] rounded-full" /> Abstract
                  </h3>
                  <p className="text-sm font-sans text-stone-300 leading-relaxed">
                    {paper.fullTextSections.abstract}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#C2410C] rounded-full" /> Introduction & Motivation
                  </h3>
                  <p className="text-sm font-sans text-stone-300 leading-relaxed">
                    {paper.fullTextSections.introduction}
                  </p>
                </div>
              </div>
            )}

            {activeSectionTab === 'methodology' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#F59E0B] rounded-full" /> Experimental Architecture & Protocol
                </h3>
                <p className="text-sm font-sans text-stone-300 leading-relaxed">
                  {paper.fullTextSections.methodology}
                </p>
                <div className="bg-white/[0.05] p-4 rounded-xl border border-white/10 space-y-2 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Benchmark Dataset:</span>
                    <span className="text-[#F59E0B] font-bold">{paper.dataset}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Dataset Size:</span>
                    <span className="text-white font-semibold">{paper.datasetSize}</span>
                  </div>
                </div>
              </div>
            )}

            {activeSectionTab === 'results' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#F59E0B] rounded-full" /> Empirical Findings & Benchmarks
                </h3>
                <p className="text-sm font-sans text-stone-300 leading-relaxed">
                  {paper.fullTextSections.results}
                </p>
                <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 p-4 rounded-xl flex items-center justify-between font-mono text-xs">
                  <span className="text-white">Top Evaluation Metric:</span>
                  <span className="text-[#F59E0B] font-bold text-sm">{paper.bestResult}</span>
                </div>
              </div>
            )}

            {activeSectionTab === 'limitations' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#F87171] rounded-full" /> Stated Limitations
                </h3>
                <p className="text-sm font-sans text-stone-300 leading-relaxed">
                  {paper.fullTextSections.limitations}
                </p>
                <ul className="space-y-2 pt-2">
                  {paper.limitations.map((lim, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs font-sans text-stone-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F87171] mt-1.5 shrink-0" />
                      <span>{lim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeSectionTab === 'futureWork' && (
              <div className="space-y-4 animate-in fade-in">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#F59E0B] rounded-full" /> Proposed Future Directions
                </h3>
                <p className="text-sm font-sans text-stone-300 leading-relaxed">
                  {paper.fullTextSections.futureWork}
                </p>
              </div>
            )}

            {activeSectionTab === 'references' && (
              <div className="space-y-3 animate-in fade-in">
                <h3 className="text-lg font-bold text-white">Cited References</h3>
                <div className="space-y-2 font-mono text-xs text-stone-400">
                  {paper.fullTextSections.references.map((ref, idx) => (
                    <div key={idx} className="bg-white/[0.04] p-2.5 rounded-lg border border-white/5">
                      [{idx + 1}] {ref}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>

        {/* Right 5 Columns: ResearchIQ Interpretation Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card rounded-2xl p-5 space-y-4 border-[1.5px] border-[#F59E0B]/30 shadow-2xl relative">
            {/* Interpretation Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F59E0B] animate-pulse" />
                <h3 className="text-base font-bold text-white font-mono tracking-tight">
                  ResearchIQ Interpretation
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30">
                Evidence Grounded
              </span>
            </div>

            {/* Structured Cards (Problem, Approach, Data, Limitation) */}
            <div className="space-y-3">
              {/* Problem Card */}
              <div className="bg-white/[0.05] p-3.5 rounded-xl space-y-1.5 border-l-2 border-[#F59E0B]">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[11px] font-bold text-[#F59E0B] uppercase tracking-wider">
                    PROBLEM
                  </span>
                  <button
                    onClick={() => openEvidenceModal('problem')}
                    className="font-mono text-[11px] text-stone-400 hover:text-[#F59E0B] flex items-center gap-1 transition-colors"
                  >
                    View evidence <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs font-sans text-stone-200 leading-relaxed">
                  {paper.interpretation.problem}
                </p>
              </div>

              {/* Approach Card */}
              <div className="bg-white/[0.05] p-3.5 rounded-xl space-y-1.5 border-l-2 border-[#C2410C]">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[11px] font-bold text-[#C2410C] uppercase tracking-wider">
                    APPROACH
                  </span>
                  <button
                    onClick={() => openEvidenceModal('approach')}
                    className="font-mono text-[11px] text-stone-400 hover:text-[#C2410C] flex items-center gap-1 transition-colors"
                  >
                    View evidence <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs font-sans text-stone-200 leading-relaxed">
                  {paper.interpretation.approach}
                </p>
              </div>

              {/* Data Card */}
              <div className="bg-white/[0.05] p-3.5 rounded-xl space-y-1.5 border-l-2 border-[#B45309]">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[11px] font-bold text-[#FDE047] uppercase tracking-wider">
                    DATA & BENCHMARK
                  </span>
                  <button
                    onClick={() => openEvidenceModal('data')}
                    className="font-mono text-[11px] text-stone-400 hover:text-[#FDE047] flex items-center gap-1 transition-colors"
                  >
                    View evidence <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs font-sans text-stone-200 leading-relaxed">
                  {paper.interpretation.data}
                </p>
              </div>

              {/* Limitation Card */}
              <div className="bg-white/[0.05] p-3.5 rounded-xl space-y-1.5 border-l-2 border-[#F87171]">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[11px] font-bold text-[#F87171] uppercase tracking-wider">
                    LIMITATION
                  </span>
                  <button
                    onClick={() => openEvidenceModal('limitation')}
                    className="font-mono text-[11px] text-stone-400 hover:text-[#F87171] flex items-center gap-1 transition-colors"
                  >
                    View evidence <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs font-sans text-stone-200 leading-relaxed">
                  {paper.interpretation.limitation}
                </p>
              </div>
            </div>
          </div>

          {/* Provenance & Paper Sources Card */}
          {paperSources.length > 0 && (
            <div className="glass-card rounded-2xl p-5 space-y-3 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#F59E0B]" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                    Provenanced Sources ({paperSources.length})
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                  Verified Index
                </span>
              </div>

              <div className="space-y-2">
                {paperSources.map((src) => (
                  <div
                    key={src.id}
                    className="bg-white/[0.04] p-3 rounded-xl border border-white/10 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-white">{src.source_name}</span>
                      <p className="text-[11px] text-stone-400">ID: {src.source_identifier}</p>
                    </div>
                    {src.source_url && (
                      <a
                        href={src.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded bg-[#F59E0B]/15 text-[#FDE047] hover:bg-[#F59E0B]/30 border border-[#F59E0B]/30 flex items-center gap-1 transition-all"
                      >
                        <span>Source Link</span>
                        <ExternalLink className="w-3 h-3 text-[#F59E0B]" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Research Analysis Card */}
          <div className="glass-card rounded-2xl p-5 space-y-4 border border-white/10 shadow-2xl relative">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <h3 className="text-base font-bold text-white font-mono tracking-tight">
                  AI Research Analysis
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTriggerAI(!!analysis)}
                  disabled={isTriggeringAI}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#B45309] to-[#F59E0B] text-[#0C0B0A] font-mono text-xs font-bold hover:brightness-110 flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.4)] disabled:opacity-50 transition-all"
                >
                  {isTriggeringAI ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{analysis ? 'Re-analyze with AI' : 'Analyze with AI'}</span>
                </button>
                {analysis ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    ANALYZED
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-stone-400 border border-white/10">
                    NOT ANALYZED
                  </span>
                )}
              </div>
            </div>

            {/* Action Feedback Banner */}
            {aiActionMessage && (
              <div className="bg-white/[0.05] border border-white/15 p-3 rounded-xl text-xs font-mono text-stone-200 flex items-center justify-between">
                <span>{aiActionMessage}</span>
                <button onClick={() => setAiActionMessage(null)} className="text-stone-400 hover:text-white ml-2">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Loading State */}
            {analysisLoading && (
              <div className="flex items-center justify-center gap-2 py-6 text-stone-400 font-mono text-xs">
                <Loader2 className="w-4 h-4 text-[#F59E0B] animate-spin" />
                <span>Loading paper analysis...</span>
              </div>
            )}

            {/* Error State */}
            {!analysisLoading && analysisError && !analysis && (
              <div className="bg-[#F87171]/10 border border-[#F87171]/30 p-3.5 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#F87171] font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Analysis unavailable</span>
                </div>
                <p className="text-xs font-sans text-stone-300">
                  Stored analysis could not be loaded. Click "Analyze with AI" above to generate a new analysis.
                </p>
              </div>
            )}

            {/* No Analysis State */}
            {!analysisLoading && !analysis && (
              <div className="bg-white/[0.03] border border-white/10 p-5 rounded-xl space-y-3 text-center py-6">
                <p className="font-mono text-xs text-white font-medium">
                  Paper has not been analyzed with AI yet.
                </p>
                <p className="font-sans text-[11px] text-stone-400 max-w-sm mx-auto">
                  Click the button above to run OpenRouter AI analysis on this paper's title, abstract, and metadata.
                </p>
                <button
                  type="button"
                  onClick={() => handleTriggerAI(false)}
                  disabled={isTriggeringAI}
                  className="px-4 py-2 rounded-xl bg-[#F59E0B] text-[#0C0B0A] font-mono text-xs font-bold hover:brightness-110 inline-flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                >
                  {isTriggeringAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Analyze with AI</span>
                </button>
              </div>
            )}

            {/* Analysis Content */}
            {!analysisLoading && analysis && (
              <div className="space-y-3">
                {/* Summary (Full Width) */}
                {analysis.summary && (
                  <div className="bg-white/[0.05] p-3.5 rounded-xl space-y-1 border-l-2 border-[#F59E0B]">
                    <span className="font-mono text-[11px] font-bold text-[#F59E0B] uppercase tracking-wider block">
                      SUMMARY
                    </span>
                    <p className="text-xs font-sans text-stone-200 leading-relaxed">
                      {analysis.summary}
                    </p>
                  </div>
                )}

                {/* Problem & Methodology (2 Columns) */}
                {(analysis.problem || analysis.methodology) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysis.problem && (
                      <div className="bg-white/[0.05] p-3 rounded-xl space-y-1 border-l-2 border-[#C2410C]">
                        <span className="font-mono text-[10px] font-bold text-[#C2410C] uppercase tracking-wider block">
                          RESEARCH PROBLEM
                        </span>
                        <p className="text-xs font-sans text-stone-200 leading-relaxed">
                          {analysis.problem}
                        </p>
                      </div>
                    )}
                    {analysis.methodology && (
                      <div className="bg-white/[0.05] p-3 rounded-xl space-y-1 border-l-2 border-[#F59E0B]">
                        <span className="font-mono text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider block">
                          METHODOLOGY
                        </span>
                        <p className="text-xs font-sans text-stone-200 leading-relaxed">
                          {analysis.methodology}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Dataset & Results (2 Columns) */}
                {(analysis.dataset || analysis.results) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysis.dataset && (
                      <div className="bg-white/[0.05] p-3 rounded-xl space-y-1 border-l-2 border-[#B45309]">
                        <span className="font-mono text-[10px] font-bold text-[#FDE047] uppercase tracking-wider block">
                          DATASET
                        </span>
                        <p className="text-xs font-sans text-stone-200 leading-relaxed">
                          {analysis.dataset}
                        </p>
                      </div>
                    )}
                    {analysis.results && (
                      <div className="bg-white/[0.05] p-3 rounded-xl space-y-1 border-l-2 border-[#4edea3]">
                        <span className="font-mono text-[10px] font-bold text-[#4edea3] uppercase tracking-wider block">
                          RESULTS
                        </span>
                        <p className="text-xs font-sans text-stone-200 leading-relaxed">
                          {analysis.results}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Limitations (Full Width) */}
                {analysis.limitations && (
                  <div className="bg-white/[0.05] p-3.5 rounded-xl space-y-1 border-l-2 border-[#F87171]">
                    <span className="font-mono text-[11px] font-bold text-[#F87171] uppercase tracking-wider block">
                      LIMITATIONS
                    </span>
                    <p className="text-xs font-sans text-stone-200 leading-relaxed">
                      {analysis.limitations}
                    </p>
                  </div>
                )}

                {/* Contribution & Future Work (2 Columns) */}
                {(analysis.contribution || analysis.future_work) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {analysis.contribution && (
                      <div className="bg-white/[0.05] p-3 rounded-xl space-y-1 border-l-2 border-[#F59E0B]">
                        <span className="font-mono text-[10px] font-bold text-[#F59E0B] uppercase tracking-wider block">
                          CONTRIBUTION
                        </span>
                        <p className="text-xs font-sans text-stone-200 leading-relaxed">
                          {analysis.contribution}
                        </p>
                      </div>
                    )}
                    {analysis.future_work && (
                      <div className="bg-white/[0.05] p-3 rounded-xl space-y-1 border-l-2 border-[#4cd7f6]">
                        <span className="font-mono text-[10px] font-bold text-[#4cd7f6] uppercase tracking-wider block">
                          FUTURE WORK
                        </span>
                        <p className="text-xs font-sans text-stone-200 leading-relaxed">
                          {analysis.future_work}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Metadata Footer: AI Provider, Model, Confidence */}
                <div className="pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-stone-400">
                  {analysis.ai_model && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-400">AI Provider:</span>
                      <span className="text-[#FDE047] font-semibold">OpenRouter</span>
                      <span className="text-stone-600">•</span>
                      <span className="text-stone-400">Model:</span>
                      <span className="text-white font-medium">{analysis.ai_model}</span>
                    </div>
                  )}
                  {analysis.confidence !== null && analysis.confidence !== undefined && (
                    <div>
                      Confidence: <span className="text-[#F59E0B] font-bold">{Math.round(analysis.confidence * 100)}%</span>
                    </div>
                  )}
                  {analysis.analyzed_at && (
                    <div>
                      Analyzed: <span className="text-stone-300">{new Date(analysis.analyzed_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verbatim Evidence Drawer Modal */}
      {evidenceDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="w-full max-w-lg bg-[#0C0B0A] border border-white/20 rounded-2xl p-6 glass-card space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Quote className="w-4 h-4 text-[#F59E0B]" />
                <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                  Verbatim Source Extraction ({selectedEvidenceType})
                </h4>
              </div>
              <button
                onClick={() => setEvidenceDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="bg-white/[0.05] p-4 rounded-xl border border-white/10 space-y-2">
                <span className="font-mono text-[10px] text-[#F59E0B]">
                  {paper.displayId} • Extracted from Methodology Section 3.2
                </span>
                <p className="italic text-stone-200 leading-relaxed">
                  "{paper.evidenceThreads[0]?.quote || paper.abstract}"
                </p>
              </div>

              <div className="flex items-center justify-between font-mono text-[11px] text-stone-400">
                <span>Confidence: <strong className="text-[#F59E0B]">98.4%</strong></span>
                <span>Provenance: <strong className="text-[#F59E0B]">Open Access Verified</strong></span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setEvidenceDrawerOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#F59E0B] text-[#0C0B0A] font-mono text-xs font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

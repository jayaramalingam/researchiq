import React, { useState, useEffect } from 'react';
import {
  Target,
  Sparkles,
  ChevronRight,
  Quote,
  Lightbulb,
  Loader2,
  AlertCircle,
  TrendingUp,
  Zap,
  Split,
  Compass,
  Database,
  CheckCircle2,
  X,
  Plus
} from 'lucide-react';
import { NavTab } from '../types';
import { fetchProjectInsights, triggerAISynthesis, BackendInsight } from '../services/api';

interface GapsScreenProps {
  onNavigate: (tab: NavTab) => void;
  onSelectPaper: (paperId: string) => void;
  projectId?: string;
}

export const GapsScreen: React.FC<GapsScreenProps> = ({
  onNavigate,
  onSelectPaper,
  projectId
}) => {
  const [insights, setInsights] = useState<BackendInsight[]>([]);
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisMessage, setSynthesisMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadInsights() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProjectInsights(projectId);
        if (isMounted) {
          setInsights(data);
          if (data.length > 0) {
            setSelectedInsightId(data[0].id);
          } else {
            setSelectedInsightId(null);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load project insights:', err);
          setError(err.message || 'Unable to load project insights.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadInsights();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const handleGenerateSynthesis = async () => {
    setIsSynthesizing(true);
    setSynthesisMessage(null);
    try {
      const res = await triggerAISynthesis(projectId);
      setSynthesisMessage(`AI Synthesis completed: ${res.insights_created} new insights and ${res.relationships_created} relationships created!`);
      const updated = await fetchProjectInsights(projectId);
      setInsights(updated);
      if (updated.length > 0) {
        setSelectedInsightId(updated[0].id);
      }
    } catch (err: any) {
      setSynthesisMessage(
        err.message?.includes('OPENROUTER_API_KEY')
          ? 'OpenRouter integration is implemented but requires OPENROUTER_API_KEY for live execution.'
          : err.message || 'AI Synthesis failed.'
      );
    } finally {
      setIsSynthesizing(false);
    }
  };

  const filterOptions = [
    { id: 'All', label: 'All Insights' },
    { id: 'ai-derived', label: 'AI-Derived' },
    { id: 'stored', label: 'System Stored' },
    { id: 'gap', label: 'Research Gaps' },
    { id: 'innovation', label: 'Innovations' },
    { id: 'contradiction', label: 'Contradictions' },
    { id: 'opportunity', label: 'Opportunities' }
  ];

  const filteredInsights = insights.filter((item) => {
    if (activeFilter === 'All') return true;
    const isAIDerived =
      item.evidence?.toLowerCase().includes('openrouter') ||
      item.evidence?.toLowerCase().includes('ai-generated');
    if (activeFilter === 'ai-derived') return isAIDerived;
    if (activeFilter === 'stored') return !isAIDerived;
    return item.type === activeFilter;
  });

  const selectedInsight = insights.find((i) => i.id === selectedInsightId) || filteredInsights[0] || null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'gap':
        return <Target className="w-3.5 h-3.5 text-[#F87171]" />;
      case 'innovation':
        return <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />;
      case 'contradiction':
        return <Split className="w-3.5 h-3.5 text-[#C2410C]" />;
      case 'opportunity':
        return <Compass className="w-3.5 h-3.5 text-[#4edea3]" />;
      default:
        return <TrendingUp className="w-3.5 h-3.5 text-[#F59E0B]" />;
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'gap':
        return 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/30';
      case 'innovation':
        return 'bg-[#F59E0B]/15 text-[#FDE047] border-[#F59E0B]/30';
      case 'contradiction':
        return 'bg-[#C2410C]/15 text-[#FB923C] border-[#C2410C]/30';
      case 'opportunity':
        return 'bg-[#4edea3]/15 text-[#4edea3] border-[#4edea3]/30';
      default:
        return 'bg-white/10 text-stone-300 border-white/20';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-[#F59E0B] uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>Research Gaps & Structured Insights</span>
            {insights.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 font-bold ml-1">
                INSIGHTS ({insights.length})
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Where the literature becomes quiet
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Methodological blind spots, paradigm contradictions, and high-impact opportunities extracted across project papers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleGenerateSynthesis}
            disabled={isSynthesizing}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] hover:brightness-110 text-[#0C0B0A] font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50"
          >
            {isSynthesizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Generate Research Synthesis</span>
          </button>
          <button
            onClick={() => onNavigate('opportunities')}
            className="px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 hover:border-white/20 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Lightbulb className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Opportunity Matrix</span>
          </button>
        </div>
      </div>

      {/* Synthesis Message Banner */}
      {synthesisMessage && (
        <div className="glass-card p-3 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-xs font-mono text-[#FDE047] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#F59E0B] shrink-0" />
            <span>{synthesisMessage}</span>
          </div>
          <button onClick={() => setSynthesisMessage(null)} className="text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Options & Loading Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {filterOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all ${
                activeFilter === f.id
                  ? 'bg-[#F59E0B] text-[#0C0B0A] font-bold shadow-[0_0_10px_#F59E0B]'
                  : 'bg-white/[0.05] hover:bg-white/10 text-stone-300 border border-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B]">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Fetching backend insights...</span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="glass-card p-3.5 rounded-xl border border-[#F87171]/40 flex items-center gap-2.5 text-xs text-[#F87171] bg-[#F87171]/10">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Disciplinary Notice Banner */}
      <div className="glass-card p-4 rounded-xl border border-[#F59E0B]/30 flex items-start gap-3 text-xs text-stone-300">
        <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
        <p className="font-sans leading-relaxed">
          <strong className="text-white">Empirical Provenance:</strong> Gaps and insights represent structured signals extracted from cross-paper comparative analyses and stated methodology limitations.
        </p>
      </div>

      {/* Main Grid: Left Gaps Cards List, Right Dynamic Evidence Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Cards List */}
        <div className="lg:col-span-7 space-y-4">
          {isLoading ? (
            <div className="glass-card p-12 text-center text-stone-400 font-mono text-xs flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 text-[#F59E0B] animate-spin" />
              <span>Loading structured insights and research gaps...</span>
            </div>
          ) : insights.length === 0 ? (
            <div className="glass-card p-12 text-center border border-white/10 rounded-2xl space-y-4">
              <Target className="w-12 h-12 text-[#F59E0B]/50 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Research Gaps Generated</h3>
              <p className="text-sm text-stone-400 max-w-md mx-auto">
                No research gaps have been generated for this project yet. Attach papers to your project and run AI Synthesis to detect gaps and insights.
              </p>
              <button
                onClick={handleGenerateSynthesis}
                disabled={isSynthesizing}
                className="px-5 py-2.5 rounded-xl bg-[#F59E0B] text-[#0C0B0A] font-bold text-xs font-mono inline-flex items-center gap-2 hover:brightness-110 shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all disabled:opacity-50"
              >
                {isSynthesizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Synthesis</span>
              </button>
            </div>
          ) : filteredInsights.length === 0 ? (
            <div className="glass-card p-8 text-center text-stone-400 font-mono text-xs space-y-2">
              <Target className="w-8 h-8 text-[#F59E0B] mx-auto opacity-50" />
              <p>No insights found matching filter "{activeFilter}".</p>
            </div>
          ) : (
            filteredInsights.map((item, idx) => {
              const isSelected = selectedInsight?.id === item.id;
              const isAIDerived =
                item.evidence?.toLowerCase().includes('openrouter') ||
                item.evidence?.toLowerCase().includes('ai-generated');

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedInsightId(item.id)}
                  className={`glass-card p-5 sm:p-6 rounded-2xl cursor-pointer transition-all duration-200 space-y-3 relative overflow-hidden group border-[1.5px] ${
                    isSelected
                      ? 'border-[#F59E0B] bg-white/[0.12] shadow-[0_0_24px_rgba(245,158,11,0.3)]'
                      : 'border-white/[0.15] hover:border-white/30'
                  }`}
                >
                  {/* Header: Type & Confidence */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono border flex items-center gap-1.5 uppercase font-bold ${getTypeBadgeClass(item.type)}`}>
                        {getTypeIcon(item.type)}
                        <span>{item.type} #{idx + 1}</span>
                      </span>
                      {isAIDerived ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F59E0B]/20 text-[#FDE047] border border-[#F59E0B]/30 flex items-center gap-1 font-semibold">
                          <Sparkles className="w-2.5 h-2.5 text-[#F59E0B]" /> AI-Derived Insight
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-stone-300 border border-white/15 flex items-center gap-1">
                          <Database className="w-2.5 h-2.5 text-stone-400" /> Stored Insight
                        </span>
                      )}
                    </div>

                    {item.confidence !== null && item.confidence !== undefined && (
                      <span className="font-mono text-xs text-[#F59E0B]">
                        Confidence: <strong>{Math.round(item.confidence * 100)}%</strong>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#F59E0B] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {/* Evidence Line */}
                  {item.evidence && (
                    <div className="bg-white/[0.04] p-2.5 rounded-lg border border-white/10 font-mono text-xs text-[#FDE047] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" />
                      <span className="line-clamp-2">{item.evidence}</span>
                    </div>
                  )}

                  {/* Description */}
                  {item.description && (
                    <p className="font-sans text-xs sm:text-sm text-stone-300 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Footer Trigger */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-mono">
                    <span className="text-stone-400 text-[11px]">
                      Extracted {new Date(item.created_at).toLocaleDateString()}
                    </span>

                    <span className="text-[#F59E0B] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-bold">
                      <span>Inspect Evidence</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Evidence Drawer */}
        <div className="lg:col-span-5">
          {selectedInsight ? (
            <div className="glass-card p-6 rounded-2xl border-[1.5px] border-[#F59E0B]/40 shadow-2xl space-y-5 sticky top-20 backdrop-blur-[28px]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Quote className="w-4 h-4 text-[#F59E0B]" />
                  <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    Evidence Drawer — {selectedInsight.type.toUpperCase()}
                  </h4>
                </div>
                <span className="font-mono text-[10px] text-[#F59E0B] font-bold bg-[#F59E0B]/15 px-2 py-0.5 rounded border border-[#F59E0B]/30">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase font-bold ${getTypeBadgeClass(selectedInsight.type)}`}>
                    {selectedInsight.type}
                  </span>
                  {selectedInsight.confidence !== null && selectedInsight.confidence !== undefined && (
                    <span className="font-mono text-xs text-[#F59E0B]">
                      Confidence: <strong>{Math.round(selectedInsight.confidence * 100)}%</strong>
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base text-white leading-snug">{selectedInsight.title}</h3>
              </div>

              {/* Description */}
              {selectedInsight.description && (
                <div className="space-y-1.5">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-stone-400 font-bold block">
                    Structured Analysis
                  </span>
                  <p className="font-sans text-xs text-stone-200 leading-relaxed bg-white/[0.03] p-3 rounded-xl border border-white/10">
                    {selectedInsight.description}
                  </p>
                </div>
              )}

              {/* Supporting Evidence */}
              {selectedInsight.evidence && (
                <div className="space-y-1.5">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-stone-400 font-bold block">
                    Literature Grounding & Evidence
                  </span>
                  <blockquote className="text-xs italic text-[#FDE047] bg-[#F59E0B]/10 p-3 rounded-xl border border-[#F59E0B]/30 font-sans leading-relaxed">
                    "{selectedInsight.evidence}"
                  </blockquote>
                </div>
              )}

              {/* Action */}
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('opportunities')}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] hover:brightness-110 text-[#0C0B0A] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_14px_rgba(245,158,11,0.4)] active:scale-95"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span>Formulate Research Opportunity</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center text-stone-400 font-mono text-xs border border-white/10 rounded-2xl">
              Select an insight or gap card to inspect extracted evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Sparkles,
  FlaskConical,
  Loader2,
  AlertCircle,
  RefreshCw,
  Target,
  ChevronRight
} from 'lucide-react';
import { NavTab } from '../types';
import { fetchProjectInsights, triggerAISynthesis, BackendInsight } from '../services/api';

interface OpportunitiesScreenProps {
  onNavigate: (tab: NavTab) => void;
  onSelectPaper: (paperId: string) => void;
  projectId?: string;
}

export const OpportunitiesScreen: React.FC<OpportunitiesScreenProps> = ({
  onNavigate,
  onSelectPaper,
  projectId
}) => {
  const [opportunities, setOpportunities] = useState<BackendInsight[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [synthMessage, setSynthMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchProjectInsights(projectId, 'opportunity');
        if (mounted) {
          setOpportunities(data);
          if (data.length > 0) setSelectedId(data[0].id);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load opportunities');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [projectId]);

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    setSynthMessage(null);
    try {
      const res = await triggerAISynthesis(projectId);
      setSynthMessage(`Synthesis complete: ${res.insights_created} new insights, ${res.relationships_created} relationships.`);
      const updated = await fetchProjectInsights(projectId, 'opportunity');
      setOpportunities(updated);
      if (updated.length > 0) setSelectedId(updated[0].id);
    } catch (err: any) {
      setSynthMessage(err.message || 'AI Synthesis failed.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const selectedOpp = opportunities.find(o => o.id === selectedId) || null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-[#F59E0B] uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" /> Frontier Discovery Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Research Opportunity Matrix
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            High-impact voids, unexplored intersections, and AI-identified research directions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] hover:brightness-110 text-[#0C0B0A] font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50"
          >
            {isSynthesizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Run AI Synthesis</span>
          </button>
          <button
            onClick={() => onNavigate('test-idea')}
            className="px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 hover:border-[#F59E0B] text-xs font-mono text-white flex items-center gap-1.5 transition-all"
          >
            <FlaskConical className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Test Hypothesis</span>
          </button>
        </div>
      </div>

      {/* Synth message */}
      {synthMessage && (
        <div className="glass-card p-3 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-xs font-mono text-[#FDE047] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span>{synthMessage}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-card p-3.5 rounded-xl border border-[#F87171]/40 flex items-center gap-2.5 text-xs text-[#F87171] bg-[#F87171]/10">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="glass-card p-12 text-center font-mono text-xs flex flex-col items-center gap-3 text-stone-400">
          <Loader2 className="w-6 h-6 text-[#F59E0B] animate-spin" />
          <span>Loading opportunities from database...</span>
        </div>
      ) : opportunities.length === 0 ? (
        /* Empty state */
        <div className="glass-card p-12 rounded-2xl border-[1.5px] border-white/[0.14] text-center space-y-4">
          <Target className="w-10 h-10 text-[#F59E0B] mx-auto opacity-40" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-mono">No opportunities identified yet</h3>
            <p className="text-xs text-stone-400 font-sans max-w-md mx-auto">
              Run <strong className="text-[#F59E0B]">AI Synthesis</strong> to automatically identify research
              opportunities from your project's papers. The AI will analyze gaps, methodological intersections,
              and high-impact voids across the corpus.
            </p>
          </div>
          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] hover:brightness-110 text-[#0C0B0A] font-mono text-xs font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all disabled:opacity-50"
          >
            {isSynthesizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>{isSynthesizing ? 'Synthesizing...' : 'Run AI Synthesis'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Opportunity List */}
          <div className="lg:col-span-5 space-y-3">
            {opportunities.map((opp, idx) => {
              const isSelected = selectedId === opp.id;
              return (
                <div
                  key={opp.id}
                  onClick={() => setSelectedId(opp.id)}
                  className={`glass-card p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-200 space-y-2 border-[1.5px] ${
                    isSelected
                      ? 'border-[#F59E0B] bg-white/[0.12] shadow-[0_0_24px_rgba(245,158,11,0.3)]'
                      : 'border-white/[0.15] hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
                      Opportunity #{idx + 1}
                    </span>
                    {opp.confidence !== null && opp.confidence !== undefined && (
                      <span className="font-mono text-[11px] text-stone-400">
                        {Math.round(opp.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white leading-snug">{opp.title}</h3>
                  {opp.description && (
                    <p className="text-xs text-stone-400 line-clamp-2">{opp.description}</p>
                  )}
                  <div className="flex items-center justify-end pt-1 text-xs font-mono text-[#F59E0B]">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Detail Panel */}
          <div className="lg:col-span-7">
            {selectedOpp ? (
              <div className="glass-card p-6 sm:p-7 rounded-2xl space-y-5 border-l-4 border-l-[#F59E0B] border-y border-r border-white/[0.14] shadow-2xl sticky top-20">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-mono text-sm font-bold text-[#F59E0B] uppercase tracking-wider">
                    Research Opportunity
                  </span>
                  {selectedOpp.confidence !== null && selectedOpp.confidence !== undefined && (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-[#F59E0B]/20 text-[#FDE047] border border-[#F59E0B]/30 font-bold">
                      {Math.round(selectedOpp.confidence * 100)}% confidence
                    </span>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {selectedOpp.title}
                </h3>

                {selectedOpp.description && (
                  <div className="space-y-1">
                    <span className="font-mono text-xs text-stone-400 uppercase tracking-wider font-bold">
                      Analysis
                    </span>
                    <p className="text-xs sm:text-sm font-sans text-stone-200 leading-relaxed">
                      {selectedOpp.description}
                    </p>
                  </div>
                )}

                {selectedOpp.evidence && (
                  <div className="bg-white/[0.04] p-4 rounded-xl border border-white/10 space-y-1.5 font-mono text-xs">
                    <span className="text-[#F59E0B] font-bold uppercase tracking-wider">
                      Evidence & Grounding:
                    </span>
                    <p className="text-stone-200 leading-relaxed font-sans">
                      {selectedOpp.evidence}
                    </p>
                  </div>
                )}

                <div className="text-xs font-mono text-stone-500 pt-1 border-t border-white/5">
                  Extracted {new Date(selectedOpp.created_at).toLocaleDateString()}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => onNavigate('test-idea')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] hover:brightness-110 text-[#0C0B0A] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_16px_rgba(245,158,11,0.4)] transition-all active:scale-95"
                  >
                    <FlaskConical className="w-4 h-4" />
                    <span>Test This Hypothesis</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="glass-card p-8 text-center text-stone-400 font-mono text-xs">
                Select an opportunity to inspect details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

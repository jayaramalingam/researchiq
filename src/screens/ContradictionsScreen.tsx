import React, { useEffect, useState } from 'react';
import {
  Scale,
  Sparkles,
  FileCheck,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { NavTab } from '../types';
import { fetchProjectInsights, triggerAISynthesis, BackendInsight } from '../services/api';

interface ContradictionsScreenProps {
  onNavigate: (tab: NavTab) => void;
  onSelectPaper: (paperId: string) => void;
  projectId?: string;
}

export const ContradictionsScreen: React.FC<ContradictionsScreenProps> = ({
  onNavigate,
  onSelectPaper,
  projectId
}) => {
  const [contradictions, setContradictions] = useState<BackendInsight[]>([]);
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
        const data = await fetchProjectInsights(projectId, 'contradiction');
        if (mounted) setContradictions(data);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load contradictions');
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
      const updated = await fetchProjectInsights(projectId, 'contradiction');
      setContradictions(updated);
    } catch (err: any) {
      setSynthMessage(err.message || 'AI Synthesis failed.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-[#F59E0B] uppercase tracking-wider">
            <Scale className="w-4 h-4" /> Literature Disagreements
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Where papers disagree
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Empirical divergences, conflicting benchmark findings, and contextual methodology reconciliations.
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
            onClick={() => onNavigate('literature-review')}
            className="px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 hover:border-[#F59E0B] text-xs font-mono text-white flex items-center gap-1.5 transition-all"
          >
            <FileCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Literature Review</span>
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

      {/* Loading */}
      {isLoading ? (
        <div className="glass-card p-12 text-center font-mono text-xs flex flex-col items-center gap-3 text-stone-400">
          <Loader2 className="w-6 h-6 text-[#F59E0B] animate-spin" />
          <span>Loading contradictions from database...</span>
        </div>
      ) : contradictions.length === 0 ? (
        /* Empty state — honest, no fake data */
        <div className="glass-card p-12 rounded-2xl border-[1.5px] border-white/[0.14] text-center space-y-4">
          <Scale className="w-10 h-10 text-[#F59E0B] mx-auto opacity-40" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-mono">No contradictions detected yet</h3>
            <p className="text-xs text-stone-400 font-sans max-w-md mx-auto">
              Run <strong className="text-[#F59E0B]">AI Synthesis</strong> to automatically extract contradictions
              from your project's papers. The AI will compare findings, methodologies, and conclusions across
              the corpus and surface empirical disagreements.
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
        /* Contradiction Cards */
        <div className="space-y-6">
          {contradictions.map((c, idx) => (
            <div
              key={c.id}
              className="glass-card p-6 sm:p-7 rounded-2xl space-y-5 border-[1.5px] border-white/[0.14] shadow-2xl relative overflow-hidden"
            >
              {/* Title & Meta */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="space-y-1">
                  <span className="font-mono text-xs text-[#F59E0B] uppercase tracking-wider font-bold">
                    Contradiction #{idx + 1}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {c.title}
                  </h3>
                </div>
                {c.confidence !== null && c.confidence !== undefined && (
                  <span className="px-3 py-1 rounded-full bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30 font-mono text-xs whitespace-nowrap">
                    {Math.round(c.confidence * 100)}% confidence
                  </span>
                )}
              </div>

              {/* Description */}
              {c.description && (
                <p className="font-sans text-xs sm:text-sm text-stone-200 leading-relaxed">
                  {c.description}
                </p>
              )}

              {/* Evidence / Reconciliation */}
              {c.evidence && (
                <div className="bg-white/[0.05] border border-[#F59E0B]/30 p-4 rounded-xl space-y-2 font-sans text-xs">
                  <div className="flex items-center gap-2 font-mono text-xs text-[#F59E0B] font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-[#F59E0B]" /> Evidence & Context
                  </div>
                  <p className="text-stone-200 leading-relaxed">
                    {c.evidence}
                  </p>
                </div>
              )}

              <div className="text-xs font-mono text-stone-500 pt-1 border-t border-white/5">
                Extracted {new Date(c.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

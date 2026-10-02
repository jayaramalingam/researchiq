import React, { useState, useEffect } from 'react';
import {
  Flame,
  Sparkles,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Zap,
  Filter
} from 'lucide-react';
import { NavTab } from '../types';
import { fetchProjectInsights, triggerAISynthesis, BackendInsight } from '../services/api';

interface InnovationsScreenProps {
  onNavigate: (tab: NavTab) => void;
  onSelectPaper: (paperId: string) => void;
  projectId?: string;
}

export const InnovationsScreen: React.FC<InnovationsScreenProps> = ({
  onNavigate,
  onSelectPaper,
  projectId
}) => {
  const [innovations, setInnovations] = useState<BackendInsight[]>([]);
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
        const data = await fetchProjectInsights(projectId, 'innovation');
        if (mounted) setInnovations(data);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load innovations');
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
      const updated = await fetchProjectInsights(projectId, 'innovation');
      setInnovations(updated);
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
            <Flame className="w-4 h-4" /> Methodological Breakthroughs
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            What is new in the literature?
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Novel approaches, paradigm shifts, and AI-identified innovations extracted across the research corpus.
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
          <span>Loading innovations from database...</span>
        </div>
      ) : innovations.length === 0 ? (
        /* Empty state */
        <div className="glass-card p-12 rounded-2xl border-[1.5px] border-white/[0.14] text-center space-y-4">
          <Zap className="w-10 h-10 text-[#F59E0B] mx-auto opacity-40" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-mono">No innovations detected yet</h3>
            <p className="text-xs text-stone-400 font-sans max-w-md mx-auto">
              Run <strong className="text-[#F59E0B]">AI Synthesis</strong> to automatically identify innovations
              from your project's papers. The AI will extract novel methods, architectures, and paradigm shifts
              across the analyzed corpus.
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
        /* Innovation Cards */
        <div className="space-y-4">
          {innovations.map((item, idx) => (
            <div
              key={item.id}
              className="glass-card p-5 sm:p-6 rounded-2xl space-y-3 relative overflow-hidden group hover:border-[#F59E0B]/40 border-[1.5px] border-white/[0.14] transition-all shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-[#F59E0B] uppercase tracking-wider">
                    Innovation #{idx + 1}
                  </span>
                  {item.confidence !== null && item.confidence !== undefined && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border bg-[#F59E0B]/20 text-[#FDE047] border-[#F59E0B]/40">
                      {Math.round(item.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs text-stone-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#F59E0B] transition-colors">
                {item.title}
              </h3>

              {item.description && (
                <p className="text-xs sm:text-sm font-sans text-stone-200 leading-relaxed">
                  {item.description}
                </p>
              )}

              {item.evidence && (
                <div className="bg-white/[0.04] p-3 rounded-xl border border-white/10 font-mono text-xs text-stone-300">
                  <span className="text-[#F59E0B] font-bold">Evidence: </span>{item.evidence}
                </div>
              )}

              <div className="flex items-center justify-end pt-2 border-t border-white/10 font-mono text-xs">
                <button
                  onClick={() => onNavigate('map')}
                  className="text-[#F59E0B] hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Locate in Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

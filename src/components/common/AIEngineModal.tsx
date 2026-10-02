import React from 'react';
import { Sparkles, X, Activity, ShieldCheck, Zap } from 'lucide-react';
import { DEMO_AI_PROVIDERS } from '../../data/demoData';

interface AIEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIEngineModal: React.FC<AIEngineModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030508]/85 backdrop-blur-[30px] animate-in fade-in duration-200">
      {/* Deep Space Nebula ambient glow behind modal */}
      <div className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-[#0B1528] via-[#1E3A8A]/25 to-[#FCD34D]/20 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-lg bg-white/[0.04] border border-white/[0.12] rounded-2xl shadow-[0_30px_70px_-10px_rgba(0,0,0,0.9),0_0_40px_rgba(252,211,77,0.15)] backdrop-blur-[30px] overflow-hidden flex flex-col relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.12] bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FCD34D]/20 flex items-center justify-center text-[#FCD34D] border border-[#FCD34D]/30 shadow-[0_0_12px_rgba(252,211,77,0.3)]">
              <Zap className="w-4 h-4 text-[#FCD34D]" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">AI Engine Status</h3>
              <p className="font-mono text-xs text-slate-400">
                Multi-model scholarly synthesis orchestrator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Current Active Task */}
          <div className="bg-white/[0.04] p-4 rounded-xl border border-white/[0.12] space-y-2 backdrop-blur-[30px]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#FCD34D] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <Activity className="w-3.5 h-3.5 animate-pulse" /> Active Pipeline
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FCD34D]/20 text-[#FDE047] text-[10px] font-mono border border-[#FCD34D]/40 shadow-[0_0_8px_rgba(252,211,77,0.3)]">
                Operational
              </span>
            </div>
            <p className="text-sm font-medium text-white">
              Cross-Paper Literature Synthesis & Gap Triangulation
            </p>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span>Avg Latency: <strong className="text-[#FCD34D]">140ms</strong></span>
              <span>•</span>
              <span>Fallback: <strong className="text-[#60A5FA]">Zero-Downtime Ring</strong></span>
            </div>
          </div>

          {/* Providers List */}
          <div className="space-y-2.5">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Orchestrated Models & Fallbacks
            </span>
            <div className="space-y-2">
              {DEMO_AI_PROVIDERS.map((provider, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.03] p-3 rounded-xl border border-white/10 flex items-center justify-between hover:bg-white/[0.07] hover:border-white/20 transition-all backdrop-blur-[30px]"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-sans font-medium text-xs text-white">
                        {provider.name}
                      </span>
                      {provider.isLocal && (
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-mono text-slate-400">
                          Local
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[11px] text-slate-400">
                      {provider.currentModel}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-slate-400">{provider.latencyMs}ms</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                        provider.status === 'Active'
                          ? 'bg-[#FCD34D]/20 text-[#FDE047] border border-[#FCD34D]/40 shadow-[0_0_8px_rgba(252,211,77,0.3)]'
                          : provider.status === 'Available'
                          ? 'bg-[#1E3A8A]/40 text-[#93C5FD] border border-[#3B82F6]/40'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {provider.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Grounding Note */}
          <div className="bg-white/[0.02] border border-white/10 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#FCD34D] shrink-0 mt-0.5" />
            <p className="font-sans leading-relaxed text-slate-400">
              All literature extractions are anchored by verbatim evidence threads with strict provenance checking. No proprietary or user search queries are used for model training.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-white/[0.02] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

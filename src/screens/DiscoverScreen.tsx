import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Eye,
  Trash2,
  Cpu,
  Layers,
  Search,
  School,
  FileText,
  Share2,
  Library
} from 'lucide-react';
import { DEMO_EXPANDED_CONCEPTS, DEMO_SOURCES } from '../data/demoData';
import { SourceStreamStatus } from '../types';

interface DiscoverScreenProps {
  query?: string;
  onComplete: () => void;
}

const STAGES = [
  { key: 'DISCOVERING', label: 'Searching scholarly sources across global indexes' },
  { key: 'UNDERSTANDING', label: 'Parsing semantic space and ontology expansions' },
  { key: 'CONNECTING', label: 'Tracing cross-citation and methodology relationships' },
  { key: 'SYNTHESIZING', label: 'Comparing experimental findings and performance metrics' },
  { key: 'IDENTIFYING', label: 'Triangulating underexplored gaps and opportunities' }
];

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  query = 'AI-based industrial waste classification and autonomous sorting methodologies',
  onComplete
}) => {
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [sources, setSources] = useState<SourceStreamStatus[]>(DEMO_SOURCES);
  const [visibleChipsCount, setVisibleChipsCount] = useState(4);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    // Progress interval simulating progressive scholarly discovery
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const next = prev + 5;
        if (next >= 35 && currentStageIdx === 0) setCurrentStageIdx(1);
        if (next >= 60 && currentStageIdx === 1) setCurrentStageIdx(2);
        if (next >= 80 && currentStageIdx === 2) setCurrentStageIdx(3);
        if (next >= 95 && currentStageIdx === 3) setCurrentStageIdx(4);
        return next;
      });
    }, 400);

    const chipTimer = setInterval(() => {
      setVisibleChipsCount((prev) => (prev < DEMO_EXPANDED_CONCEPTS.length ? prev + 1 : prev));
    }, 700);

    return () => {
      clearInterval(timer);
      clearInterval(chipTimer);
    };
  }, [currentStageIdx]);

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 py-2 sm:py-6 animate-in fade-in duration-300">
      {/* Staged Status Indicator Pill */}
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 shadow-[0_0_14px_rgba(245,158,11,0.4)]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-ping" />
          <span className="font-mono text-xs font-bold text-[#FDE047] uppercase tracking-widest">
            {STAGES[currentStageIdx]?.key || 'DISCOVERING'}
          </span>
        </div>
        <p className="font-mono text-xs text-stone-300 text-center animate-fade-in">
          {STAGES[currentStageIdx]?.label}
        </p>
      </div>

      {/* Progress Bar Gauge */}
      <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden border border-white/10">
        <div
          className="h-full bg-gradient-to-r from-[#4C1D95] via-[#C2410C] to-[#F59E0B] transition-all duration-500 ease-out shadow-[0_0_10px_rgba(245,158,11,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Primary Research Question Glass Container */}
      <div className="glass-card p-6 relative overflow-hidden shadow-2xl rounded-2xl border-[1.5px] border-white/[0.14]">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-stone-400 uppercase tracking-wider">
              Query Subject
            </span>
            <span className="font-mono text-[10px] text-[#FDE047] px-2.5 py-0.5 rounded-md bg-[#F59E0B]/15 border border-[#F59E0B]/30">
              Live Stream Active
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-white leading-snug">
            {query}
          </h2>
        </div>
      </div>

      {/* AI-Expanded Search Space (Semantic Space Chips) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-xs text-[#F59E0B] uppercase tracking-widest font-bold">
            UNDERSTANDING
          </span>
          <span className="font-mono text-xs text-stone-400">
            Semantic Space
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {DEMO_EXPANDED_CONCEPTS.slice(0, visibleChipsCount).map((chip, idx) => (
            <div
              key={idx}
              className="bg-white/[0.05] backdrop-blur-md rounded-xl px-3.5 py-2 flex items-center gap-2 border border-white/[0.14] shadow-sm animate-in zoom-in-95 duration-200"
            >
              <Eye className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="font-mono text-xs text-white font-medium">
                {chip.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Source Activity Panel (Connecting Data Streams) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="font-mono text-xs text-[#C2410C] uppercase tracking-widest font-bold">
            CONNECTING
          </span>
          <span className="font-mono text-xs text-stone-400">
            Data Streams
          </span>
        </div>

        <div className="glass-card p-5 divide-y divide-white/10 space-y-4 rounded-2xl border-[1.5px] border-white/[0.14] shadow-2xl">
          {/* Semantic Scholar */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center border border-white/[0.14] text-white">
                <School className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div>
                <span className="font-medium text-sm text-white">Semantic Scholar</span>
                <p className="font-mono text-[10px] text-stone-400">240M+ Academic Graph</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#F59E0B]">Searching</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>

          {/* arXiv */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center border border-white/[0.14] text-white">
                <FileText className="w-4 h-4 text-[#F59E0B]" />
              </div>
              <div>
                <span className="font-medium text-sm text-white">arXiv</span>
                <p className="font-mono text-[10px] text-stone-400">Preprint Corpus</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[#F59E0B] font-mono text-xs font-medium">
              <span>Complete</span>
              <CheckCircle2 className="w-4 h-4 fill-[#F59E0B] text-[#0C0B0A]" />
            </div>
          </div>

          {/* Crossref */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center border border-white/[0.14] text-white">
                <Share2 className="w-4 h-4 text-[#C2410C]" />
              </div>
              <div>
                <span className="font-medium text-sm text-white">Crossref</span>
                <p className="font-mono text-[10px] text-stone-400">DOI Registry & Citations</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-[#C2410C]">Searching</span>
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C] animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C] animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C] animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>

          {/* OpenAlex */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center border border-white/[0.14] text-white">
                <Library className="w-4 h-4 text-[#FDE047]" />
              </div>
              <div>
                <span className="font-medium text-sm text-white">OpenAlex</span>
                <p className="font-mono text-[10px] text-stone-400">Open Scholarly Index</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[#F59E0B] font-mono text-xs font-medium">
              <span>Complete</span>
              <CheckCircle2 className="w-4 h-4 fill-[#F59E0B] text-[#0C0B0A]" />
            </div>
          </div>
        </div>
      </div>

      {/* Action to Jump Directly to Search Results */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={onComplete}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] hover:brightness-110 text-[#0C0B0A] text-sm font-bold tracking-wide flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_16px_rgba(245,158,11,0.4)] font-mono"
        >
          <span>View Research Landscape (38 Papers)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  X,
  ArrowRight,
  SlidersHorizontal,
  Compass,
  Cpu,
  Layers,
  Database
} from 'lucide-react';
import { ResearchDepth } from '../../types';

interface SearchComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, depth: ResearchDepth, sources: string[], target: number) => void;
  initialQuery?: string;
}

const CATEGORIZED_SUGGESTIONS = [
  {
    category: 'Research Questions',
    icon: Compass,
    items: [
      'AI-based industrial waste classification and autonomous sorting methodologies',
      'Quantum coherence and spin entanglement in biological microtubules',
      'TinyML models for ultra-low-power agricultural sensor networks',
      'Self-supervised contrastive learning for electronic waste PCB disassembly'
    ]
  },
  {
    category: 'Technologies & Methods',
    icon: Cpu,
    items: [
      'Hyperspectral line-scan vision transformers',
      'Physics-informed neural networks for pneumatic actuators',
      'Post-training INT4/INT8 quantization on ARM Cortex-M4',
      'Transient absorption femtosecond spectroscopy'
    ]
  },
  {
    category: 'Datasets & Benchmarks',
    icon: Database,
    items: [
      'PolymerScan-100k Industrial Scrap Dataset',
      'PCB-Recycle 50k High-Res Multimodal Dataset',
      'WMT 2014 English-German Benchmark',
      'MuniSort-20k Municipal Waste Stream'
    ]
  }
];

export const SearchComposerModal: React.FC<SearchComposerModalProps> = ({
  isOpen,
  onClose,
  onSearch,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [depth, setDepth] = useState<ResearchDepth>('deep');
  const [selectedSources, setSelectedSources] = useState<string[]>([
    'Semantic Scholar',
    'arXiv',
    'Crossref',
    'OpenAlex'
  ]);
  const [targetCount, setTargetCount] = useState<number>(50);

  if (!isOpen) return null;

  const toggleSource = (source: string) => {
    if (selectedSources.includes(source)) {
      if (selectedSources.length > 1) {
        setSelectedSources(selectedSources.filter((s) => s !== source));
      }
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const handleExecute = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim(), depth, selectedSources, targetCount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030508]/85 backdrop-blur-[30px] animate-in fade-in duration-200">
      {/* Deep Space Nebula ambient glow behind modal */}
      <div className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-[#0B1528] via-[#1E3A8A]/25 to-[#FCD34D]/20 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-2xl bg-white/[0.04] border border-white/[0.12] rounded-2xl shadow-[0_30px_70px_-10px_rgba(0,0,0,0.9),0_0_40px_rgba(252,211,77,0.15)] backdrop-blur-[30px] overflow-hidden flex flex-col relative z-10">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.12] bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FCD34D]/20 text-[#FCD34D] border border-[#FCD34D]/30 shadow-[0_0_12px_rgba(252,211,77,0.3)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-white">Research Query Composer</h3>
              <p className="font-mono text-xs text-slate-400">
                AI semantic search across 240M+ scholarly sources
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

        {/* Input Area */}
        <form onSubmit={handleExecute} className="p-6 space-y-5">
          <div className="relative">
            <Search className="absolute left-4 top-4 w-5 h-5 text-[#FCD34D]" />
            <textarea
              rows={3}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your research idea, question, hypothesis, or technical domain..."
              className="w-full bg-white/[0.04] border border-white/[0.12] rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-400 focus:outline-none focus:border-[#FCD34D] focus:ring-1 focus:ring-[#FCD34D]/50 font-sans text-sm resize-none backdrop-blur-md"
              autoFocus
            />
          </div>

          {/* Configuration Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.03] p-4 rounded-xl border border-white/[0.12]">
            {/* Depth */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FCD34D]" /> Research Depth
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-white/[0.04] p-1 rounded-lg border border-white/10 text-xs">
                {(['quick', 'standard', 'deep'] as ResearchDepth[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDepth(d)}
                    className={`py-1.5 rounded-md capitalize font-medium transition-all ${
                      depth === d
                        ? 'bg-[#FCD34D] text-[#030508] font-bold shadow-[0_0_10px_#FCD34D]'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {d === 'quick' ? 'Quick' : d === 'standard' ? 'Standard' : 'Deep'}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Count */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#FDE047]" /> Target Literature
              </label>
              <div className="grid grid-cols-4 gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10 text-xs">
                {[15, 30, 50, 100].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setTargetCount(count)}
                    className={`py-1.5 rounded-md font-mono transition-all ${
                      targetCount === count
                        ? 'bg-[#1E3A8A] text-white font-bold border border-[#60A5FA]/40 shadow-[0_0_8px_rgba(30,58,138,0.5)]'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {count}+
                  </button>
                ))}
              </div>
            </div>

            {/* Sources Toggle */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#FCD34D]" /> Active Scholarly Streams
              </label>
              <div className="flex flex-wrap gap-2">
                {['Semantic Scholar', 'arXiv', 'Crossref', 'OpenAlex'].map((src) => {
                  const active = selectedSources.includes(src);
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => toggleSource(src)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
                        active
                          ? 'bg-[#FCD34D]/20 border-[#FCD34D] text-[#FDE047] font-medium shadow-[0_0_10px_rgba(252,211,77,0.3)]'
                          : 'bg-white/[0.04] border-white/10 text-slate-400 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {src}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Categorized Suggestions */}
          <div className="space-y-3 pt-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Explore Research Domains
            </span>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {CATEGORIZED_SUGGESTIONS.map((cat, idx) => {
                const Icon = cat.icon;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-[#FCD34D] font-mono">
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.category}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items.map((item, itemIdx) => (
                        <button
                          key={itemIdx}
                          type="button"
                          onClick={() => setQuery(item)}
                          className="text-left text-xs bg-white/[0.04] hover:bg-white/[0.10] border border-white/10 hover:border-[#FCD34D]/40 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg transition-all line-clamp-1"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              Press Enter or click Discover to initiate live synthesis
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-mono text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!query.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1E3A8A] via-[#3B82F6] to-[#FCD34D] hover:brightness-110 text-white font-bold text-xs tracking-wide flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_16px_rgba(252,211,77,0.35)] border border-[#FCD34D]/40"
              >
                <span>Initiate Discovery</span>
                <ArrowRight className="w-4 h-4 text-[#FCD34D]" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

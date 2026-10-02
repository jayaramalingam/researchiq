import React, { useState } from 'react';
import {
  FlaskConical,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Layers,
  FileCheck,
  Zap,
  Info
} from 'lucide-react';
import { NavTab } from '../types';

interface TestIdeaScreenProps {
  onNavigate: (tab: NavTab) => void;
  onSelectPaper: (paperId: string) => void;
}

export const TestIdeaScreen: React.FC<TestIdeaScreenProps> = ({
  onNavigate,
  onSelectPaper
}) => {
  const [ideaText, setIdeaText] = useState(
    'Integrating neuromorphic event cameras with spatial-spectral vision transformers for micro-sorting flexible composite packaging under chaotic aerodynamic trajectory conditions.'
  );
  const [proposedMethod, setProposedMethod] = useState('Physics-informed spiking neural network + SWIR line scan');
  const [evalMetric, setEvalMetric] = useState('Sorting accuracy under >2.5 m/s belt speeds with <4ms pneumatic latency');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluated, setEvaluated] = useState(true);

  const handleEvaluate = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setEvaluated(true);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-[#F59E0B] uppercase tracking-wider">
            <FlaskConical className="w-4 h-4" /> Hypothesis Testing & Prior Art Check
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Test a research idea
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Evaluate novelty, prior art overlap, and empirical feasibility against the 147 scanned papers.
          </p>
        </div>
      </div>

      {/* Input Form Box */}
      <div className="glass-card p-6 rounded-2xl space-y-4 shadow-2xl border-[1.5px] border-white/[0.14]">
        <div className="space-y-1.5">
          <label className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
            <span>Research Hypothesis / Idea Description</span>
            <span className="text-[#F59E0B] font-normal lowercase text-[11px]">Free-form scholarly prompt</span>
          </label>
          <textarea
            rows={3}
            value={ideaText}
            onChange={(e) => setIdeaText(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/15 rounded-xl p-3.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F59E0B] transition-colors"
            placeholder="Describe your core hypothesis, intended mechanism, and theoretical novelty..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-mono text-xs text-stone-300">Proposed Methodology / Architecture</label>
            <input
              type="text"
              value={proposedMethod}
              onChange={(e) => setProposedMethod(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-xs text-stone-300">Target Benchmark & Evaluation Metric</label>
            <input
              type="text"
              value={evalMetric}
              onChange={(e) => setEvalMetric(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#F59E0B]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] hover:brightness-110 text-[#0C0B0A] font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_16px_rgba(245,158,11,0.4)] active:scale-95"
          >
            {isEvaluating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Scholarly Prior Art Triangulation...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#0C0B0A]" />
                <span>Assess Novelty & Triangulate Prior Art</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Evaluation Results */}
      {evaluated && (
        <div className="space-y-6 animate-in fade-in zoom-in-95">
          {/* Top Score Banner */}
          <div className="glass-card p-6 rounded-2xl border-l-4 border-l-[#F59E0B] border-y border-r border-white/[0.14] space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs text-[#F59E0B] font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" /> Novelty Assessment: Strong Distinctiveness
              </div>
              <span className="font-mono text-xs px-3 py-1 rounded-full bg-[#F59E0B]/20 text-[#FDE047] border border-[#F59E0B]/30 font-bold">
                Novelty Index: 88 / 100
              </span>
            </div>

            <p className="font-sans text-sm text-stone-200 leading-relaxed">
              Your proposed hypothesis combines <strong className="text-white">neuromorphic event sensing</strong> with <strong className="text-white">aerodynamic flutter compensation</strong> for flexible packaging. This specific intersection does not appear in any of the 147 analyzed papers, making it an underexplored niche with high potential impact.
            </p>
          </div>

          {/* Two-Column Comparison: What is established vs What is distinctive */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Established */}
            <div className="glass-card p-5 rounded-2xl space-y-3 border border-white/10">
              <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C2410C]" /> Already Established in Corpus
              </h4>
              <ul className="space-y-2 text-xs font-sans text-stone-300">
                <li className="flex items-start gap-2">
                  <span className="text-[#C2410C] font-bold">•</span>
                  <span>Spatial-spectral vision transformers on static belt conveyors (P04: HyperSort-ViT).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C2410C] font-bold">•</span>
                  <span>Short-wave infrared (SWIR) reflectance profiles for rigid plastic resins (PolymerScan-100k).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C2410C] font-bold">•</span>
                  <span>Basic pneumatic air-jet timing algorithms.</span>
                </li>
              </ul>
            </div>

            {/* Distinctive */}
            <div className="glass-card p-5 rounded-2xl space-y-3 border border-[#F59E0B]/30">
              <h4 className="font-mono text-xs font-bold text-[#F59E0B] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" /> Distinctive Elements in Your Proposal
              </h4>
              <ul className="space-y-2 text-xs font-sans text-stone-200">
                <li className="flex items-start gap-2">
                  <span className="text-[#F59E0B] font-bold">✓</span>
                  <span>Sub-millisecond temporal resolution event camera tracking of tumbling flexible films.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F59E0B] font-bold">✓</span>
                  <span>Physics-informed fluid dynamic trajectory prediction during airborne freefall.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F59E0B] font-bold">✓</span>
                  <span>End-to-end integration into a sub-50mW spiking MCU.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Closest Prior Art Papers */}
          <div className="glass-card p-5 rounded-2xl space-y-3 border border-white/10">
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Closest Prior Art Matches
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => onSelectPaper('paper-04')}
                className="bg-white/[0.04] hover:bg-white/[0.08] p-3.5 rounded-xl border border-white/10 cursor-pointer transition-colors space-y-1"
              >
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-[#F59E0B] font-bold">P04 • HyperSort-ViT</span>
                  <span className="text-[#F59E0B]">68% Similarity</span>
                </div>
                <p className="text-xs font-bold text-white line-clamp-1">
                  High-Speed Hyperspectral Vision Transformers for Automated Scrap Sorting
                </p>
                <p className="text-[11px] text-stone-400">Shared: ViT architecture and conveyor sorting context.</p>
              </div>

              <div
                onClick={() => onSelectPaper('paper-06')}
                className="bg-white/[0.04] hover:bg-white/[0.08] p-3.5 rounded-xl border border-white/10 cursor-pointer transition-colors space-y-1"
              >
                <div className="flex justify-between font-mono text-[10px]">
                  <span className="text-[#F59E0B] font-bold">P06 • BinNet-Tiny</span>
                  <span className="text-[#F59E0B]">54% Similarity</span>
                </div>
                <p className="text-xs font-bold text-white line-clamp-1">
                  Sub-50mW Quantized Convolutional Neural Networks for Edge Microcontrollers
                </p>
                <p className="text-[11px] text-stone-400">Shared: Edge microcontroller power constraints.</p>
              </div>
            </div>
          </div>

          {/* Disciplinary Disclaimer */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-2.5 text-[11px] font-mono text-stone-400">
            <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <p>
              <strong>Disclaimer:</strong> AI-generated novelty assessments are indicative based on the analyzed literature corpus and do not constitute formal patent or peer-review novelty determinations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

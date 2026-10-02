import React, { useState } from 'react';
import { EvidenceThreadItem } from '../../types';
import { Link2, ChevronRight, X, Sparkles, BookOpen } from 'lucide-react';

interface EvidenceThreadProps {
  threads: EvidenceThreadItem[];
  label?: string;
  className?: string;
  defaultExpanded?: boolean;
}

export const EvidenceThread: React.FC<EvidenceThreadProps> = ({
  threads,
  label = 'Evidence Thread',
  className = '',
  defaultExpanded = false
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!threads || threads.length === 0) return null;

  return (
    <div className={`mt-2 flex flex-col gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors text-xs font-mono group py-1 px-2 rounded-md bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.14] w-fit backdrop-blur-md"
      >
        <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
        <span className="font-medium text-[11px] text-stone-300 group-hover:text-white">
          {label} ({threads.length})
        </span>
        <ChevronRight
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            expanded ? 'rotate-90 text-[#F59E0B]' : 'text-stone-400'
          }`}
        />
      </button>

      {expanded && (
        <div className="bg-white/[0.05] border-l-2 border-[#F59E0B] p-3 rounded-r-lg text-xs space-y-2.5 backdrop-blur-[26px] animate-in fade-in duration-200 border-y border-r border-white/10">
          <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono border-b border-white/10 pb-1.5">
            <span className="flex items-center gap-1">
              <Link2 className="w-3 h-3 text-[#F59E0B]" /> Grounded Citations
            </span>
            <span className="text-[#FDE047]">Verified in Dataset</span>
          </div>

          <div className="space-y-2">
            {threads.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/[0.04] p-2.5 rounded border border-white/5 space-y-1"
              >
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-[#F59E0B]/20 text-[#FDE047] font-bold">
                    {item.paperId}
                  </span>
                  <span className="text-stone-400">{item.section}</span>
                </div>
                <p className="text-[12px] text-white font-sans font-medium line-clamp-1">
                  {item.paperTitle}
                </p>
                <blockquote className="text-[11px] italic text-stone-300 border-l border-white/20 pl-2 py-0.5 font-sans">
                  "{item.quote}"
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

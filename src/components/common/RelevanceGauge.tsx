import React from 'react';

interface RelevanceGaugeProps {
  score: number; // 0-100
  showLabel?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RelevanceGauge: React.FC<RelevanceGaugeProps> = ({
  score,
  showLabel = true,
  className = '',
}) => {
  const getBarColor = (val: number) => {
    if (val >= 90) return 'bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.6)]';
    if (val >= 75) return 'bg-[#FBBF24] shadow-[0_0_8px_rgba(251,191,36,0.6)]';
    if (val >= 50) return 'bg-[#C2410C] shadow-[0_0_8px_rgba(194,65,12,0.6)]';
    return 'bg-[#F87171] shadow-[0_0_8px_rgba(248,113,113,0.6)]';
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {showLabel && (
        <span className="font-mono text-xs text-[#F59E0B] font-medium tracking-tight whitespace-nowrap">
          Rel: <span className="font-bold text-white">{score}%</span>
        </span>
      )}
      <div className="flex-1 min-w-[60px] max-w-[140px] h-2 bg-white/[0.08] rounded-full overflow-hidden border border-white/[0.14] p-[1px]">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(
            score
          )}`}
          style={{ width: `${Math.min(100, Math.max(5, score))}%` }}
        />
      </div>
    </div>
  );
};

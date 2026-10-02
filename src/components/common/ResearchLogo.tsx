import React from 'react';

interface ResearchLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const ResearchLogo: React.FC<ResearchLogoProps> = ({
  size = 28,
  showText = true,
  className = ''
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div 
        className="relative flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.16] p-1.5 shadow-[0_0_18px_rgba(252,211,77,0.3)] backdrop-blur-[30px]"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#FCD34D]"
        >
          {/* Document outline */}
          <path
            d="M8 10C8 7.79086 9.79086 6 12 6H30L40 16V38C40 40.2091 38.2091 42 36 42H12C9.79086 42 8 40.2091 8 38V10Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-40"
          />
          {/* Analytical aperture / lens circle */}
          <circle
            cx="24"
            cy="26"
            r="9"
            stroke="#FCD34D"
            strokeWidth="2.5"
            className="opacity-95"
          />
          {/* Aperture blades */}
          <path
            d="M19 20L29 20M29 20L26 31M26 31L18 29M18 29L22 18M24 23L27 28"
            stroke="#FDE047"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Interconnected celestial intelligence nodes */}
          <circle cx="36" cy="12" r="3" fill="#FCD34D" />
          <line x1="28" y1="18" x2="34" y2="13" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" />
          <circle cx="40" cy="22" r="2.5" fill="#60A5FA" />
          <line x1="33" y1="24" x2="38" y2="22.5" stroke="#60A5FA" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-bold tracking-tight text-[17px] leading-tight text-white flex items-center">
            Research<span className="text-[#FCD34D] ml-0.5">IQ</span>
          </span>
          <span className="font-mono text-[9px] text-slate-400 uppercase tracking-widest leading-none mt-0.5">
            Intelligence
          </span>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Settings,
  Sparkles,
  Database,
  Cpu,
  Shield,
  Check,
  Save,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { NavTab } from '../types';

interface SettingsScreenProps {
  onNavigate: (tab: NavTab) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
  const [model, setModel] = useState<'gemini-2.5-pro' | 'gemini-2.5-flash'>('gemini-2.5-pro');
  const [citationStyle, setCitationStyle] = useState<'IEEE' | 'APA' | 'Nature' | 'ACM'>('IEEE');
  const [minRelevance, setMinRelevance] = useState(75);
  const [includePreprints, setIncludePreprints] = useState(true);
  const [strictVerbatimCheck, setStrictVerbatimCheck] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-[#F59E0B] uppercase tracking-wider">
            <Settings className="w-4 h-4" /> Workspace Configuration
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Settings & Research Parameters
          </h2>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] hover:brightness-110 text-[#0C0B0A] font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all"
        >
          {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          <span>{savedSuccess ? 'Preferences Saved' : 'Save Changes'}</span>
        </button>
      </div>

      {/* AI Synthesis Engine Settings */}
      <div className="glass-card p-6 rounded-2xl space-y-4 border-[1.5px] border-white/[0.14] shadow-xl">
        <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#F59E0B]" /> Gemini Reasoning & Synthesis Engine
        </h3>

        <div className="space-y-3 font-mono text-xs">
          <div className="space-y-1.5">
            <label className="text-stone-300">Default Foundation Model</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModel('gemini-2.5-pro')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  model === 'gemini-2.5-pro'
                    ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#FDE047] font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'border-white/10 bg-white/[0.04] text-stone-400 hover:border-white/20'
                }`}
              >
                <div className="text-white font-bold">Gemini 2.5 Pro</div>
                <div className="text-[10px] opacity-75 font-normal text-stone-300">Complex academic reasoning & synthesis</div>
              </button>

              <button
                type="button"
                onClick={() => setModel('gemini-2.5-flash')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  model === 'gemini-2.5-flash'
                    ? 'border-[#F59E0B] bg-[#F59E0B]/15 text-[#FDE047] font-bold shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'border-white/10 bg-white/[0.04] text-stone-400 hover:border-white/20'
                }`}
              >
                <div className="text-white font-bold">Gemini 2.5 Flash</div>
                <div className="text-[10px] opacity-75 font-normal text-stone-300">High-speed real-time filtering & extraction</div>
              </button>
            </div>
          </div>

          <label className="flex items-center justify-between p-3.5 bg-white/[0.04] rounded-xl border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
            <div>
              <div className="text-white font-semibold">Strict Verbatim Evidence Enforcement</div>
              <div className="text-[11px] text-stone-400">All claims require exact quotes with coordinate provenance</div>
            </div>
            <input
              type="checkbox"
              checked={strictVerbatimCheck}
              onChange={(e) => setStrictVerbatimCheck(e.target.checked)}
              className="accent-[#F59E0B] w-4 h-4 rounded"
            />
          </label>
        </div>
      </div>

      {/* Scholarly Index Sources */}
      <div className="glass-card p-6 rounded-2xl space-y-4 border-[1.5px] border-white/[0.14] shadow-xl">
        <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-[#F59E0B]" /> Scholarly Indexes & Connectors
        </h3>

        <div className="space-y-3 font-mono text-xs">
          <label className="flex items-center justify-between p-3.5 bg-white/[0.04] rounded-xl border border-white/10 cursor-pointer hover:bg-white/[0.07] transition-all">
            <div>
              <div className="text-white font-semibold">Include arXiv & bioRxiv Preprints</div>
              <div className="text-[11px] text-stone-400">Ingest latest unreviewed manuscripts for emerging signals</div>
            </div>
            <input
              type="checkbox"
              checked={includePreprints}
              onChange={(e) => setIncludePreprints(e.target.checked)}
              className="accent-[#F59E0B] w-4 h-4 rounded"
            />
          </label>

          <div className="space-y-1.5 p-3.5 bg-white/[0.04] rounded-xl border border-white/10">
            <div className="flex justify-between">
              <span className="text-stone-300">Default Relevance Score Cutoff</span>
              <span className="text-[#F59E0B] font-bold">{minRelevance}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              value={minRelevance}
              onChange={(e) => setMinRelevance(Number(e.target.value))}
              className="w-full accent-[#F59E0B] bg-white/10 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Cache & Privacy */}
      <div className="glass-card p-6 rounded-2xl space-y-4 border-[1.5px] border-white/[0.14] shadow-xl">
        <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#F87171]" /> Local Storage & Privacy
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white/[0.04] rounded-xl border border-white/10 text-xs font-mono">
          <div>
            <div className="text-white font-semibold">Clear Local Scholarly Corpus Cache</div>
            <div className="text-[11px] text-stone-400">Current index size: 147 papers cached (34.2 MB)</div>
          </div>
          <button
            onClick={() => alert('Local cache cleared successfully.')}
            className="px-3.5 py-2 rounded-lg bg-[#F87171]/15 hover:bg-[#F87171]/25 text-[#F87171] border border-[#F87171]/30 transition-colors font-bold self-start sm:self-auto"
          >
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
};

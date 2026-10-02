import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  Download,
  Trash2,
  ExternalLink,
  Plus,
  Clock,
  CheckCircle2,
  Share2,
  FileText,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  FileCode,
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { NavTab } from '../types';
import {
  fetchProjectReports,
  generateProjectReport,
  BackendReport
} from '../services/api';

interface ReportsScreenProps {
  onNavigate: (tab: NavTab) => void;
  onOpenReport: (query: string) => void;
  projectId?: string;
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  onNavigate,
  onOpenReport,
  projectId
}) => {
  const [reports, setReports] = useState<BackendReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<BackendReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State for New Report Generation
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [reportTitleInput, setReportTitleInput] = useState('');

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProjectReports(projectId);
      setReports(data);
      if (data.length > 0 && !selectedReport) {
        setSelectedReport(data[0]);
      }
    } catch (err: any) {
      console.error('Failed to load reports:', err);
      setError(err.message || 'Unable to load project research dossiers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [projectId]);

  const handleGenerateReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const newReport = await generateProjectReport(projectId, reportTitleInput.trim() || undefined);
      setReports((prev) => [newReport, ...prev]);
      setSelectedReport(newReport);
      setGenerateModalOpen(false);
      setReportTitleInput('');
    } catch (err: any) {
      alert(err.message || 'Failed to generate research report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (report: BackendReport, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const blob = new Blob([report.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-[#F59E0B] uppercase tracking-wider">
            <FolderArchive className="w-4 h-4" /> Scholarly Dossiers & Syntheses
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Research Dossiers & Reports
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Structured syntheses grounded in PostgreSQL paper analyses, citation graphs, and evidence streams.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setGenerateModalOpen(true)}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] hover:brightness-110 text-[#0C0B0A] font-mono text-xs font-bold flex items-center gap-2 shadow-[0_0_14px_rgba(245,158,11,0.4)] transition-all active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Generate New Report</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="glass-card p-3.5 rounded-xl border border-amber-500/40 flex items-center justify-between text-xs text-amber-200 bg-amber-500/10 font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadReports}
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="glass-card p-12 text-center space-y-3 rounded-2xl border-[1.5px] border-white/[0.14]">
          <Loader2 className="w-8 h-8 text-[#F59E0B] animate-spin mx-auto" />
          <p className="font-mono text-sm text-stone-300">Retrieving PostgreSQL research report dossiers...</p>
        </div>
      ) : reports.length === 0 ? (
        /* Empty State */
        <div className="glass-card p-12 text-center space-y-4 rounded-2xl border-[1.5px] border-white/[0.14]">
          <FileText className="w-12 h-12 text-stone-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No research reports generated yet</h3>
            <p className="font-mono text-xs text-stone-400 max-w-md mx-auto">
              Generate a structured dossier to synthesize project papers, analyses, citation relationships, and evidence.
            </p>
          </div>
          <button
            onClick={() => setGenerateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#F59E0B] text-[#0C0B0A] font-mono text-xs font-bold hover:brightness-110 inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate First Research Report</span>
          </button>
        </div>
      ) : (
        /* Main Two-Column Layout: Reports List & Full Report Reader */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Dossier Cards */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="font-mono text-xs text-stone-400 uppercase tracking-wider font-bold">
              Generated Reports ({reports.length})
            </h3>

            <div className="space-y-3">
              {reports.map((report) => {
                const isSelected = selectedReport?.id === report.id;

                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`glass-card p-5 rounded-2xl cursor-pointer transition-all duration-200 space-y-3 relative overflow-hidden group border-[1.5px] ${
                      isSelected
                        ? 'border-[#F59E0B] bg-white/[0.12] shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                        : 'border-white/[0.14] hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#F59E0B] bg-[#F59E0B]/15 px-2 py-0.5 rounded border border-[#F59E0B]/30 font-bold uppercase">
                        {report.format} • {report.citation_style || 'IEEE'}
                      </span>
                      <span className="font-mono text-[11px] text-stone-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#F59E0B]" />
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#F59E0B] transition-colors leading-snug">
                      {report.title}
                    </h3>

                    <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-xs">
                      <span className="text-[#F59E0B] font-bold">PostgreSQL Verified Data</span>
                      <button
                        type="button"
                        onClick={(e) => handleDownloadReport(report, e)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 flex items-center gap-1 transition-all"
                      >
                        <Download className="w-3 h-3 text-[#F59E0B]" />
                        <span>Export .MD</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Structured Report Reader */}
          <div className="lg:col-span-7">
            {selectedReport ? (
              <div className="glass-card p-6 sm:p-8 rounded-2xl border-[1.5px] border-white/[0.16] shadow-2xl space-y-6 sticky top-20 backdrop-blur-[28px]">
                {/* Header Actions */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="font-mono text-[10px] text-[#FDE047] uppercase tracking-widest font-bold">
                      SYNTHESIZED DOSSIER
                    </span>
                    <h3 className="text-xl font-bold text-white leading-tight">
                      {selectedReport.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleDownloadReport(selectedReport)}
                    className="px-3.5 py-2 rounded-xl bg-[#F59E0B] hover:brightness-110 text-[#0C0B0A] font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Report</span>
                  </button>
                </div>

                {/* Report Content Reader Box */}
                <div className="bg-black/40 p-5 rounded-xl border border-white/10 font-mono text-xs text-stone-200 overflow-y-auto max-h-[600px] leading-relaxed whitespace-pre-wrap selection:bg-[#F59E0B]/30 select-text">
                  {selectedReport.content}
                </div>
              </div>
            ) : (
              <div className="glass-card p-12 text-center text-stone-400 font-mono text-xs">
                Select a report to view details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Generate New Report */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md p-6 space-y-4 rounded-2xl border-[1.5px] border-white/[0.2] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                Generate Research Report
              </h3>
              <button
                onClick={() => setGenerateModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateReportSubmit} className="space-y-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-stone-300">Report Dossier Title</label>
                <input
                  type="text"
                  value={reportTitleInput}
                  onChange={(e) => setReportTitleInput(e.target.value)}
                  placeholder="e.g. Industrial AI Waste Sorting Dossier"
                  className="w-full bg-white/[0.06] border border-white/15 rounded-xl py-2.5 px-3 text-white placeholder-stone-500 focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 space-y-1 text-stone-300 text-[11px] leading-relaxed">
                <p><strong className="text-[#F59E0B]">PostgreSQL Grounded Report:</strong></p>
                <p>The report will be compiled directly from active PostgreSQL project records (papers, analyses, relationships, insights, and evidence). No fabricated or hallucinated content.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] text-[#0C0B0A] font-bold flex items-center gap-2 shadow-[0_0_12px_rgba(245,158,11,0.4)] disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Generate Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

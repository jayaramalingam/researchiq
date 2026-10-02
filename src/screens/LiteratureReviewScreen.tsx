import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Sparkles,
  Search
} from 'lucide-react';
import { NavTab } from '../types';
import { fetchProjectPapers, fetchPaperAnalysis, BackendProjectPaper, PaperAnalysis } from '../services/api';

interface PaperWithAnalysis {
  projectPaper: BackendProjectPaper;
  analysis: PaperAnalysis | null;
}

interface LiteratureReviewScreenProps {
  projectId?: string;
  onNavigate: (tab: NavTab) => void;
  onSelectPaper: (paperId: string) => void;
}

export const LiteratureReviewScreen: React.FC<LiteratureReviewScreenProps> = ({
  projectId,
  onNavigate,
  onSelectPaper
}) => {
  const [citationStyle, setCitationStyle] = useState<'IEEE' | 'APA' | 'Nature' | 'ACM'>('IEEE');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [papersWithAnalysis, setPapersWithAnalysis] = useState<PaperWithAnalysis[]>([]);

  const loadData = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const pPapers = await fetchProjectPapers(projectId);
      const items: PaperWithAnalysis[] = await Promise.all(
        pPapers.map(async (pp) => {
          const paperId = pp.paper_id || pp.paper?.id;
          let analysis: PaperAnalysis | null = null;
          if (paperId) {
            try {
              analysis = await fetchPaperAnalysis(paperId);
            } catch (e) {
              analysis = null;
            }
          }
          return { projectPaper: pp, analysis };
        })
      );
      setPapersWithAnalysis(items);
    } catch (err: any) {
      setError(err.message || 'Failed to load literature review papers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleCopy = () => {
    setCopied(true);
    const fullText = papersWithAnalysis.map(({ projectPaper, analysis }, i) => {
      const p = projectPaper.paper;
      const title = p?.title || 'Untitled Paper';
      const authors = Array.isArray(p?.authors) ? p.authors.join(', ') : p?.authors || 'Unknown Authors';
      const year = p?.publication_year || 'n.d.';
      const venue = p?.venue || '';
      return `[P${i + 1}] ${authors} (${year}). "${title}". ${venue}\nSummary: ${analysis?.summary || p?.abstract || 'Not analyzed yet'}\nMethodology: ${analysis?.methodology || 'Not analyzed yet'}\nResults: ${analysis?.results || 'Not analyzed yet'}\nLimitations: ${analysis?.limitations || 'Not analyzed yet'}\n`;
    }).join('\n---\n\n');

    navigator.clipboard.writeText(fullText);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format: string) => {
    alert(`Exporting Synthesized Literature Review as ${format.toUpperCase()}...`);
  };

  const formatAuthors = (authors: any) => {
    if (Array.isArray(authors)) return authors.join(', ');
    if (typeof authors === 'string') return authors;
    return 'Unknown Authors';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-[#F59E0B] uppercase tracking-wider">
            <FileText className="w-4 h-4" /> Academic Literature Review
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Synthesized Literature Review
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Systematic academic review synthesized from {papersWithAnalysis.length} papers attached to this project.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-white/[0.06] rounded-xl p-1 border border-white/15 text-xs font-mono">
            {(['IEEE', 'APA', 'Nature', 'ACM'] as const).map((style) => (
              <button
                key={style}
                onClick={() => setCitationStyle(style)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  citationStyle === style
                    ? 'bg-[#F59E0B] text-[#0C0B0A] font-bold shadow-[0_0_8px_#F59E0B]'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {style}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            disabled={papersWithAnalysis.length === 0}
            className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 disabled:opacity-50 border border-white/15 text-xs font-mono text-white flex items-center gap-1.5 transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#F59E0B]" /> : <Copy className="w-3.5 h-3.5 text-stone-300" />}
            <span>{copied ? 'Copied' : 'Copy Review'}</span>
          </button>

          <button
            onClick={() => handleExport('pdf')}
            disabled={papersWithAnalysis.length === 0}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] disabled:opacity-50 hover:brightness-110 text-[#0C0B0A] font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4 glass-card rounded-2xl border border-white/10">
          <Loader2 className="w-8 h-8 text-[#F59E0B] animate-spin" />
          <p className="text-sm font-mono text-stone-400">Loading project papers and AI analyses...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center p-12 space-y-4 glass-card rounded-2xl border border-red-500/20 text-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-300 font-mono">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-white flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      ) : papersWithAnalysis.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-4 border border-white/10 max-w-2xl mx-auto">
          <BookOpen className="w-12 h-12 text-[#F59E0B]/50 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Papers in Project Literature Review</h3>
          <p className="text-sm text-stone-400">
            Attach papers to this project from Search to build your literature review.
          </p>
          <button
            onClick={() => onNavigate('search')}
            className="px-5 py-2.5 rounded-xl bg-[#F59E0B] text-[#0C0B0A] font-bold text-xs font-mono inline-flex items-center gap-2 hover:brightness-110 shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all"
          >
            <Search className="w-4 h-4" /> Search Papers
          </button>
        </div>
      ) : (
        <article className="glass-card p-6 sm:p-10 rounded-2xl space-y-8 leading-relaxed text-white shadow-2xl border-[1.5px] border-white/[0.14] max-w-5xl mx-auto backdrop-blur-[28px]">
          {/* Article Header */}
          <div className="border-b border-white/10 pb-6 space-y-2">
            <span className="font-mono text-xs text-[#F59E0B] uppercase tracking-widest font-bold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Project Literature Review Synthesis
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Systematic Literature Review Across Project Corpus
            </h1>
            <p className="text-xs text-stone-400 font-mono">
              Synthesized across {papersWithAnalysis.length} project paper{papersWithAnalysis.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Paper Sections */}
          <div className="space-y-8">
            {papersWithAnalysis.map(({ projectPaper, analysis }, idx) => {
              const paper = projectPaper.paper;
              const paperId = projectPaper.paper_id || paper?.id;
              const title = paper?.title || 'Untitled Paper';
              const authors = formatAuthors(paper?.authors);
              const year = paper?.publication_year || 'N/A';
              const venue = paper?.venue || paper?.source || '';
              const abstract = paper?.abstract;

              return (
                <section
                  key={projectPaper.id || idx}
                  className="p-5 rounded-xl bg-white/[0.03] border border-white/10 space-y-4 hover:border-white/20 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-white/10 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-[#F59E0B] font-bold">
                          [P{idx + 1}]
                        </span>
                        <h3
                          onClick={() => paperId && onSelectPaper(paperId)}
                          className="text-base font-bold text-white hover:text-[#F59E0B] cursor-pointer transition-colors"
                        >
                          {title}
                        </h3>
                      </div>
                      <p className="text-xs text-stone-400 font-mono mt-1">
                        {authors} ({year}) {venue ? `• ${venue}` : ''}
                      </p>
                    </div>

                    {!analysis && (
                      <span className="shrink-0 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono">
                        Not analyzed yet
                      </span>
                    )}
                  </div>

                  {/* Summary / Abstract */}
                  <div className="space-y-1">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-stone-400">Abstract / Summary</h4>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      {analysis?.summary || abstract || 'No abstract available.'}
                    </p>
                  </div>

                  {/* Structured Analysis Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-white/5">
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[11px] font-mono text-[#F59E0B] font-bold uppercase tracking-wider block">
                        Methodology
                      </span>
                      <p className="text-xs text-stone-300">
                        {analysis?.methodology || (
                          <span className="text-stone-500 italic">Not analyzed yet</span>
                        )}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                        Results
                      </span>
                      <p className="text-xs text-stone-300">
                        {analysis?.results || (
                          <span className="text-stone-500 italic">Not analyzed yet</span>
                        )}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-1">
                      <span className="text-[11px] font-mono text-rose-400 font-bold uppercase tracking-wider block">
                        Limitations
                      </span>
                      <p className="text-xs text-stone-300">
                        {analysis?.limitations || (
                          <span className="text-stone-500 italic">Not analyzed yet</span>
                        )}
                      </p>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          {/* References List */}
          <section className="space-y-3 border-t border-white/10 pt-6 font-sans">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-400 font-mono">
              Synthesized References ({citationStyle})
            </h3>
            <div className="space-y-2 text-xs font-mono text-stone-400">
              {papersWithAnalysis.map(({ projectPaper }, idx) => {
                const p = projectPaper.paper;
                const authors = formatAuthors(p?.authors);
                const year = p?.publication_year || 'n.d.';
                const title = p?.title || 'Untitled';
                const venue = p?.venue ? `. ${p.venue}` : '';

                if (citationStyle === 'APA') {
                  return (
                    <div key={idx}>
                      [{idx + 1}] {authors} ({year}). {title}{venue}.
                    </div>
                  );
                } else if (citationStyle === 'Nature') {
                  return (
                    <div key={idx}>
                      {idx + 1}. {authors} {title}. <i>{p?.venue || 'Journal'}</i> ({year}).
                    </div>
                  );
                } else if (citationStyle === 'ACM') {
                  return (
                    <div key={idx}>
                      [{idx + 1}] {authors}. {year}. {title}. In <i>{p?.venue || 'Proceedings'}</i>.
                    </div>
                  );
                } else {
                  // IEEE
                  return (
                    <div key={idx}>
                      [{idx + 1}] {authors}, "{title}," {p?.venue ? `in ${p.venue}, ` : ''}{year}.
                    </div>
                  );
                }
              })}
            </div>
          </section>
        </article>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Sparkles,
  CheckCircle2,
  Download,
  Plus,
  X,
  FileCheck,
  ArrowRight,
  Zap,
  Layers,
  ArrowLeft,
  Loader2,
  BookOpen,
  Search
} from 'lucide-react';
import { Paper, NavTab } from '../types';
import { fetchProjectPapers, fetchPaperAnalysis, BackendProjectPaper, PaperAnalysis } from '../services/api';

interface CompareScreenProps {
  initialSelectedIds?: string[];
  onNavigate: (tab: NavTab) => void;
  onSelectPaper: (paperId: string) => void;
  projectId?: string;
}

const COMPARISON_FIELDS = [
  { key: 'problem', label: 'Research Problem' },
  { key: 'methodology', label: 'Methodology' },
  { key: 'dataset', label: 'Dataset / Benchmark' },
  { key: 'bestResult', label: 'Best Result', highlight: true },
  { key: 'limitations', label: 'Stated Limitations', highlight: true },
  { key: 'innovations', label: 'Core Innovation' },
  { key: 'futureWork', label: 'Future Directions' },
  { key: 'year', label: 'Year & Venue' }
];

export const CompareScreen: React.FC<CompareScreenProps> = ({
  initialSelectedIds = [],
  onNavigate,
  onSelectPaper,
  projectId
}) => {
  const [livePapers, setLivePapers] = useState<Paper[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadProjectPapers() {
      setIsLoading(true);
      try {
        const rawPapers = await fetchProjectPapers(projectId || '');
        if (isMounted && rawPapers && rawPapers.length > 0) {
          const mapped: Paper[] = await Promise.all(
            rawPapers.map(async (pp: BackendProjectPaper, idx: number) => {
              const p = pp.paper;
              if (!p) return null as any;
              const analysis: PaperAnalysis | null = await fetchPaperAnalysis(p.id).catch(() => null);

              return {
                id: p.id,
                displayId: p.doi || `P-0${idx + 1}`,
                title: p.title,
                authors: Array.isArray(p.authors) ? p.authors : [typeof p.authors === 'string' ? p.authors : 'Author'],
                year: p.publication_year || 2025,
                venue: p.venue || 'Peer-Reviewed Journal',
                citations: p.citation_count || 0,
                abstract: p.abstract || 'No abstract available.',
                relevanceScore: Math.round(pp.relevance_score || 90),
                isOpenAccess: p.is_open_access ?? false,
                source: ((p.source as any) || 'Semantic Scholar'),
                isVerified: true,
                isDemoPaper: false,
                methodology: analysis?.methodology || '',
                dataset: analysis?.dataset || '',
                datasetSize: '',
                evaluationMetric: '',
                bestResult: analysis?.results || '',
                advantages: [],
                limitations: analysis?.limitations ? [analysis.limitations] : [],
                innovations: analysis?.contribution ? [analysis.contribution] : [],
                futureWork: analysis?.future_work ? [analysis.future_work] : [],
                cluster: 'General',
                whyRelevant: '',
                evidenceThreads: [],
                fullTextSections: {
                  abstract: p.abstract || '',
                  introduction: '',
                  methodology: analysis?.methodology || '',
                  results: analysis?.results || '',
                  limitations: analysis?.limitations || '',
                  futureWork: analysis?.future_work || '',
                  references: []
                },
                interpretation: {
                  problem: analysis?.problem || '',
                  approach: analysis?.methodology || '',
                  data: analysis?.dataset || '',
                  result: analysis?.results || '',
                  limitation: analysis?.limitations || '',
                  contribution: analysis?.contribution || p.abstract || ''
                }
              };
            })
          );
          const valid = mapped.filter(Boolean);
          setLivePapers(valid);
          if (initialSelectedIds.length === 0 && valid.length >= 2) {
            setSelectedIds([valid[0].id, valid[1].id]);
          } else if (initialSelectedIds.length === 0 && valid.length === 1) {
            setSelectedIds([valid[0].id]);
          }
        } else {
          setLivePapers([]);
        }
      } catch (err) {
        console.warn('Failed to load project papers for comparison:', err);
        setLivePapers([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProjectPapers();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const poolPapers = livePapers;
  const selectedPapers = poolPapers.filter((p) => selectedIds.includes(p.id));
  const displayPapers = selectedPapers.length > 0 ? selectedPapers : poolPapers.slice(0, 3);

  const removePaper = (id: string) => {
    if (selectedIds.length > 1) {
      setSelectedIds(selectedIds.filter((p) => p !== id));
    }
  };

  const addPaper = (id: string) => {
    if (!selectedIds.includes(id) && selectedIds.length < 6) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-[#F59E0B] uppercase tracking-wider">
            <GitCompare className="w-4 h-4" /> Multi-Paper Synthesis & Matrix Comparison
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Compare Project Research Papers
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Compare structural relationships, methodologies, datasets, and limitations between papers attached to this project.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('literature-review')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] hover:brightness-110 text-[#0C0B0A] font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_14px_rgba(245,158,11,0.4)] transition-all"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Generate Synthesis Review</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-4 glass-card rounded-2xl border border-white/10">
          <Loader2 className="w-8 h-8 text-[#F59E0B] animate-spin" />
          <p className="text-sm font-mono text-stone-400">Loading project papers for comparison...</p>
        </div>
      ) : livePapers.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center space-y-4 border border-white/10 max-w-2xl mx-auto">
          <BookOpen className="w-12 h-12 text-[#F59E0B]/50 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Papers to Compare</h3>
          <p className="text-sm text-stone-400">
            Attach papers to this project from Search to compare methodologies, results, and limitations side by side.
          </p>
          <button
            onClick={() => onNavigate('search')}
            className="px-5 py-2.5 rounded-xl bg-[#F59E0B] text-[#0C0B0A] font-bold text-xs font-mono inline-flex items-center gap-2 hover:brightness-110 shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all"
          >
            <Search className="w-4 h-4" /> Discover & Attach Papers
          </button>
        </div>
      ) : (
        <>
          {/* Top Synthesis Insight Panel */}
          <div className="glass-card p-5 sm:p-6 space-y-3 border-l-4 border-[#F59E0B] shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs text-[#F59E0B] font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" /> Cross-Paper Comparative Overview
              </div>
              <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#FDE047] border border-[#F59E0B]/30">
                Comparing {displayPapers.length} paper{displayPapers.length > 1 ? 's' : ''}
              </span>
            </div>

            <p className="font-sans text-sm text-stone-200 leading-relaxed">
              Comparing {displayPapers.map(p => `"${p.title}"`).join(' against ')}. Evaluating methodological approaches, empirical results, and stated limitations across the project corpus.
            </p>

            <div className="flex items-center gap-2 font-mono text-xs text-stone-400 pt-1 flex-wrap">
              <span className="text-[#F59E0B] font-bold">Referenced:</span>
              {displayPapers.map((p) => (
                <span key={p.id} className="px-2 py-0.5 rounded-lg bg-white/[0.06] text-white border border-white/10">
                  {p.displayId} ({p.year})
                </span>
              ))}
            </div>
          </div>

          {/* Selected Papers Selector Bar */}
          <div className="flex items-center gap-2 flex-wrap bg-white/[0.04] p-3.5 rounded-xl border border-white/10">
            <span className="font-mono text-xs text-stone-400">Comparing:</span>
            {displayPapers.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.08] border border-white/15 text-xs font-mono text-white"
              >
                <span className="font-bold text-[#F59E0B]">{p.displayId}:</span>
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{p.title}</span>
                {displayPapers.length > 1 && (
                  <button
                    onClick={() => removePaper(p.id)}
                    className="text-stone-400 hover:text-[#F87171] ml-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            {poolPapers.filter((p) => !selectedIds.includes(p.id)).length > 0 && (
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="font-mono text-xs text-stone-400">Add paper:</span>
                {poolPapers
                  .filter((p) => !selectedIds.includes(p.id))
                  .slice(0, 3)
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addPaper(p.id)}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#F59E0B] hover:border-[#F59E0B]/50 transition-all truncate max-w-[150px]"
                    >
                      + {p.title}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Comparative Matrix Table */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="p-4 sm:p-5 font-mono text-xs text-stone-400 uppercase tracking-wider w-48 shrink-0">
                      Dimensions
                    </th>
                    {displayPapers.map((paper) => (
                      <th key={paper.id} className="p-4 sm:p-5 min-w-[280px] max-w-[360px] align-top">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs text-[#F59E0B] font-bold">
                              {paper.displayId}
                            </span>
                            <span className="font-mono text-[10px] text-stone-400">
                              Citations: {paper.citations}
                            </span>
                          </div>
                          <h4
                            onClick={() => onSelectPaper(paper.id)}
                            className="font-bold text-sm text-white hover:text-[#F59E0B] cursor-pointer transition-colors leading-snug line-clamp-2"
                          >
                            {paper.title}
                          </h4>
                          <p className="font-mono text-xs text-stone-400 truncate">
                            {paper.authors.join(', ')} ({paper.year})
                          </p>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5 text-xs font-sans">
                  {COMPARISON_FIELDS.map((field) => (
                    <tr
                      key={field.key}
                      className={field.highlight ? 'bg-[#F59E0B]/[0.02]' : 'hover:bg-white/[0.01]'}
                    >
                      <td className="p-4 sm:p-5 font-mono text-xs text-stone-400 uppercase tracking-wider font-bold bg-white/[0.01] align-top border-r border-white/5">
                        <div className="flex items-center gap-1.5">
                          {field.highlight && <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />}
                          <span>{field.label}</span>
                        </div>
                      </td>

                      {displayPapers.map((paper) => {
                        let value: any = (paper as any)[field.key] || (paper.interpretation as any)[field.key];
                        if (field.key === 'year') {
                          value = `${paper.year} — ${paper.venue}`;
                        }

                        const isEmpty = !value || (Array.isArray(value) && value.length === 0);

                        return (
                          <td key={paper.id} className="p-4 sm:p-5 align-top border-r border-white/5 last:border-r-0">
                            {isEmpty ? (
                              <span className="text-stone-500 font-mono italic">Not analyzed yet</span>
                            ) : Array.isArray(value) ? (
                              <ul className="space-y-1.5 text-stone-300">
                                {value.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-[#F59E0B] font-bold">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className={`text-stone-200 leading-relaxed ${field.highlight ? 'font-medium text-white' : ''}`}>
                                {value}
                              </p>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

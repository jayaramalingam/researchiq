import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Sparkles,
  BarChart3,
  Calendar,
  Layers,
  Cpu,
  ArrowRight,
  Flame,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { NavTab } from '../types';
import { fetchProjectPapers, fetchProjectInsights, BackendProjectPaper, BackendInsight } from '../services/api';

interface TrendsScreenProps {
  onNavigate: (tab: NavTab) => void;
  onSelectPaper: (paperId: string) => void;
  projectId?: string;
}

interface YearData {
  year: number;
  count: number;
}

export const TrendsScreen: React.FC<TrendsScreenProps> = ({
  onNavigate,
  onSelectPaper,
  projectId
}) => {
  const [papers, setPapers] = useState<BackendProjectPaper[]>([]);
  const [trendInsights, setTrendInsights] = useState<BackendInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [papersData, insightsData] = await Promise.all([
          fetchProjectPapers(projectId),
          fetchProjectInsights(projectId, 'trend').catch(() => [] as BackendInsight[])
        ]);
        if (mounted) {
          setPapers(papersData);
          setTrendInsights(insightsData);
          // Default selected year to most recent
          const years = papersData
            .map(pp => pp.paper?.publication_year)
            .filter((y): y is number => !!y);
          if (years.length > 0) {
            setSelectedYear(Math.max(...years));
          }
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load trends data');
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [projectId]);

  // Derive year distribution from actual papers
  const yearCounts: YearData[] = React.useMemo(() => {
    const map = new Map<number, number>();
    papers.forEach(pp => {
      const y = pp.paper?.publication_year;
      if (y) map.set(y, (map.get(y) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year);
  }, [papers]);

  // Derive field/venue distribution
  const venueCounts: { venue: string; count: number }[] = React.useMemo(() => {
    const map = new Map<string, number>();
    papers.forEach(pp => {
      const v = pp.paper?.venue;
      if (v) map.set(v, (map.get(v) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([venue, count]) => ({ venue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [papers]);

  // Max count for bar scaling
  const maxCount = Math.max(...yearCounts.map(y => y.count), 1);

  // Papers for the selected year
  const papersForYear = selectedYear
    ? papers.filter(pp => pp.paper?.publication_year === selectedYear)
    : [];

  // Total citation count
  const totalCitations = papers.reduce((sum, pp) => sum + (pp.paper?.citation_count ?? 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-mono text-xs text-[#F59E0B] uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" /> Longitudinal Domain Dynamics
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            How the field is changing
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Publication trends, citation patterns, and field evolution derived from your project's actual papers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('innovations')}
            className="px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/15 hover:border-[#F59E0B] text-xs font-mono text-white transition-all flex items-center gap-1.5 hover:bg-white/[0.1]"
          >
            <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Innovations</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="glass-card p-3.5 rounded-xl border border-[#F87171]/40 flex items-center gap-2.5 text-xs text-[#F87171] bg-[#F87171]/10">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="glass-card p-12 text-center font-mono text-xs flex flex-col items-center gap-3 text-stone-400">
          <Loader2 className="w-6 h-6 text-[#F59E0B] animate-spin" />
          <span>Loading trends from project papers...</span>
        </div>
      ) : papers.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl border-[1.5px] border-white/[0.14] text-center space-y-4">
          <BarChart3 className="w-10 h-10 text-[#F59E0B] mx-auto opacity-40" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white font-mono">No papers in this project yet</h3>
            <p className="text-xs text-stone-400 font-sans max-w-md mx-auto">
              Search for and add papers to this project to see publication trends, citation patterns, and field evolution.
            </p>
          </div>
          <button
            onClick={() => onNavigate('papers')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B45309] to-[#F59E0B] hover:brightness-110 text-[#0C0B0A] font-mono text-xs font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)] transition-all"
          >
            <span>Search Papers</span>
          </button>
        </div>
      ) : (
        <>
          {/* Top Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl border-[1.5px] border-white/[0.14] text-center space-y-1">
              <span className="font-mono text-2xl font-bold text-[#F59E0B]">{papers.length}</span>
              <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Total Papers</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border-[1.5px] border-white/[0.14] text-center space-y-1">
              <span className="font-mono text-2xl font-bold text-[#F59E0B]">
                {yearCounts.length > 0 ? `${yearCounts[0].year}–${yearCounts[yearCounts.length - 1].year}` : '—'}
              </span>
              <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Year Range</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border-[1.5px] border-white/[0.14] text-center space-y-1">
              <span className="font-mono text-2xl font-bold text-[#F59E0B]">
                {totalCitations.toLocaleString()}
              </span>
              <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Total Citations</p>
            </div>
            <div className="glass-card p-4 rounded-2xl border-[1.5px] border-white/[0.14] text-center space-y-1">
              <span className="font-mono text-2xl font-bold text-[#F59E0B]">
                {papers.filter(pp => pp.paper?.publication_year && pp.paper.publication_year >= new Date().getFullYear() - 2).length}
              </span>
              <p className="font-mono text-[10px] uppercase tracking-wider text-stone-400">Recent (2yr)</p>
            </div>
          </div>

          {/* AI Trend Insights if available */}
          {trendInsights.length > 0 && (
            <div className="glass-card p-6 space-y-3 border-l-4 border-l-[#F59E0B] border-y border-r border-white/[0.14] shadow-2xl rounded-2xl">
              <div className="flex items-center gap-2 font-mono text-xs text-[#F59E0B] font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" /> AI Trajectory Analysis ({trendInsights.length} trends identified)
              </div>
              <div className="space-y-3">
                {trendInsights.slice(0, 3).map((t) => (
                  <div key={t.id}>
                    <p className="text-sm font-semibold text-white leading-snug">"{t.title}"</p>
                    {t.description && (
                      <p className="text-xs text-stone-300 leading-relaxed mt-1">{t.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publication Year Bar Chart */}
          {yearCounts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#F59E0B]" />
                  <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                    Publication Timeline
                  </h3>
                </div>
                <span className="font-mono text-xs text-stone-400">Click a year to inspect papers</span>
              </div>

              <div className="glass-card p-6 rounded-2xl border-[1.5px] border-white/[0.14] space-y-4">
                {/* Year bars */}
                <div className="flex items-end gap-2 h-32">
                  {yearCounts.map(({ year, count }) => {
                    const heightPct = (count / maxCount) * 100;
                    const isSelected = selectedYear === year;
                    return (
                      <div
                        key={year}
                        className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
                        onClick={() => setSelectedYear(isSelected ? null : year)}
                      >
                        <span className="font-mono text-[10px] text-[#F59E0B] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          {count}
                        </span>
                        <div
                          className={`w-full rounded-t-md transition-all ${
                            isSelected
                              ? 'bg-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                              : 'bg-[#F59E0B]/40 group-hover:bg-[#F59E0B]/70'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className={`font-mono text-[10px] rotate-[-45deg] origin-right mt-1 ${
                          isSelected ? 'text-[#F59E0B] font-bold' : 'text-stone-400'
                        }`}>
                          {year}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Selected year detail */}
                {selectedYear && papersForYear.length > 0 && (
                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <span className="font-mono text-xs text-[#F59E0B] font-bold uppercase tracking-wider">
                      {selectedYear} — {papersForYear.length} paper{papersForYear.length !== 1 ? 's' : ''}
                    </span>
                    <div className="space-y-1">
                      {papersForYear.slice(0, 5).map((pp) => (
                        <div
                          key={pp.paper_id}
                          className="text-xs text-stone-300 font-sans truncate cursor-pointer hover:text-[#F59E0B] transition-colors"
                          onClick={() => onSelectPaper(pp.paper_id)}
                        >
                          • {pp.paper?.title || pp.paper_id}
                        </div>
                      ))}
                      {papersForYear.length > 5 && (
                        <span className="text-[11px] font-mono text-stone-500">
                          +{papersForYear.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Multi-Chart Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Citation Distribution */}
            <div className="glass-card p-6 space-y-4 rounded-2xl border-[1.5px] border-white/[0.14]">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-xs uppercase tracking-wider text-white font-bold flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#F59E0B]" /> Citation Count Distribution
                </h4>
                <span className="font-mono text-[11px] text-[#F59E0B] font-bold">by paper</span>
              </div>

              <div className="space-y-3.5 font-mono text-xs">
                {papers
                  .filter(pp => pp.paper?.citation_count !== undefined)
                  .sort((a, b) => (b.paper?.citation_count ?? 0) - (a.paper?.citation_count ?? 0))
                  .slice(0, 5)
                  .map((pp) => {
                    const citations = pp.paper?.citation_count ?? 0;
                    const maxCitations = Math.max(
                      ...papers.map(p => p.paper?.citation_count ?? 0), 1
                    );
                    const barWidth = (citations / maxCitations) * 100;
                    return (
                      <div key={pp.paper_id} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-stone-300 font-medium truncate max-w-[70%]">
                            {pp.paper?.title?.slice(0, 40) || pp.paper_id}...
                          </span>
                          <span className="text-[#F59E0B] font-bold ml-2">{citations.toLocaleString()}</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#B45309] to-[#F59E0B] rounded-full"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                {papers.filter(pp => pp.paper?.citation_count !== undefined).length === 0 && (
                  <p className="text-stone-500 text-[11px]">No citation data available</p>
                )}
              </div>
            </div>

            {/* Venue Distribution */}
            <div className="glass-card p-6 space-y-4 rounded-2xl border-[1.5px] border-white/[0.14]">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-xs uppercase tracking-wider text-white font-bold flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#F59E0B]" /> Publication Venues
                </h4>
                <span className="font-mono text-[11px] text-stone-400">paper count</span>
              </div>

              <div className="space-y-3 font-sans text-xs">
                {venueCounts.length > 0 ? venueCounts.map(({ venue, count }, idx) => (
                  <div
                    key={venue}
                    className="p-3 bg-white/[0.04] rounded-xl border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-white truncate block max-w-[200px]">{venue}</span>
                    </div>
                    <span className={`font-mono font-bold text-sm ${idx === 0 ? 'text-[#F59E0B]' : 'text-[#C2410C]'}`}>
                      {count} paper{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                )) : (
                  <p className="text-stone-500 text-[11px] font-mono">No venue data available for current papers.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

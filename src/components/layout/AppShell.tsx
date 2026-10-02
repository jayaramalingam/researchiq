import React, { useState } from 'react';
import {
  NavTab,
  ResearchProject
} from '../../types';
import { DEMO_PROJECTS } from '../../data/demoData';
import { ResearchLogo } from '../common/ResearchLogo';
import {
  LayoutDashboard,
  Search,
  BookOpen,
  GitCompare,
  Network,
  TrendingUp,
  Target,
  Sparkles,
  Lightbulb,
  FileText,
  Settings,
  Zap,
  Menu,
  X,
  ChevronDown,
  Compass,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Flame,
  SplitSquareVertical
} from 'lucide-react';

interface AppShellProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeProject?: ResearchProject;
  projects?: ResearchProject[];
  onSelectProject?: (proj: ResearchProject) => void;
  onOpenSearchComposer?: () => void;
  onOpenAIEngine?: () => void;
  children: React.ReactNode;
}

interface NavItemConfig {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
  category?: 'core' | 'intelligence' | 'output';
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, category: 'core' },
  { id: 'discover', label: 'Discover', icon: Compass, category: 'core', badge: 'Live' },
  { id: 'papers', label: 'Papers', icon: BookOpen, category: 'core' },
  { id: 'compare', label: 'Compare', icon: GitCompare, category: 'intelligence' },
  { id: 'map', label: 'Research Map', icon: Network, category: 'intelligence', badge: 'Constellation' },
  { id: 'trends', label: 'Trends', icon: TrendingUp, category: 'intelligence' },
  { id: 'gaps', label: 'Gaps', icon: Target, category: 'intelligence' },
  { id: 'innovations', label: 'Innovations', icon: Flame, category: 'intelligence' },
  { id: 'contradictions', label: 'Contradictions', icon: SplitSquareVertical, category: 'intelligence' },
  { id: 'opportunities', label: 'Opportunities', icon: Lightbulb, category: 'intelligence' },
  { id: 'test-idea', label: 'Test an Idea', icon: Sparkles, category: 'intelligence' },
  { id: 'literature-review', label: 'Literature Review', icon: FileCheck, category: 'output' },
  { id: 'reports', label: 'Reports', icon: FileText, category: 'output' },
  { id: 'settings', label: 'Settings', icon: Settings, category: 'output' }
];

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onSelectTab,
  activeProject,
  projects,
  onSelectProject,
  onOpenSearchComposer,
  onOpenAIEngine,
  children
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);

  const currentProject = activeProject || (projects && projects[0]) || DEMO_PROJECTS[0];
  const projectList = (projects && projects.length > 0) ? projects : DEMO_PROJECTS;

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden flex flex-col bg-[#030508] text-white font-sans selection:bg-[#FCD34D]/30 selection:text-white">
      {/* Infinite Deep Space Canvas (z-index: 0): Realistic vast interstellar depth */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-Left Organic Dust Path: Void Indigo & Star-Cluster Blue */}
        <div className="absolute -top-[20vh] -left-[10vw] w-[65vw] h-[55vh] max-w-[1000px] max-h-[750px] rounded-[100%] bg-gradient-to-br from-[#0B1528] via-[#1E3A8A]/15 to-transparent blur-[140px] opacity-90 pointer-events-none -rotate-12 transform-gpu" />
        
        {/* Center-Right Swirling Dust Path: Star-Cluster Blue & Cosmic Silver Micro-Sparks */}
        <div className="absolute top-[18vh] -right-[12vw] w-[62vw] h-[58vh] max-w-[950px] max-h-[800px] rounded-[100%] bg-gradient-to-bl from-[#1E3A8A]/20 via-[#0B1528] to-[#E2E8F0]/[0.03] blur-[160px] opacity-85 pointer-events-none rotate-6 transform-gpu" />
        
        {/* Bottom Ambient Nebula Horizon: Deep Star-Cluster & Stellar Gold Glimmer */}
        <div className="absolute -bottom-[22vh] left-[15vw] w-[70vw] h-[52vh] max-w-[1100px] max-h-[700px] rounded-[100%] bg-gradient-to-tr from-[#0B1528] via-[#1E3A8A]/15 to-[#FCD34D]/[0.06] blur-[170px] opacity-80 pointer-events-none -rotate-6 transform-gpu" />

        {/* Micro-spark celestial accent in deep field */}
        <div className="absolute top-[45%] left-[28%] w-[35vw] h-[30vh] rounded-[100%] bg-gradient-to-r from-[#E2E8F0]/[0.04] to-transparent blur-[130px] opacity-70 pointer-events-none transform-gpu" />

        {/* Crisp subtle interstellar grid overlay */}
        <div className="absolute inset-0 grid-texture opacity-30 pointer-events-none" />
      </div>

      {/* Stellar Monolithic Glass Top App Bar (z-index: 30) */}
      <header className="shrink-0 h-14 z-30 w-full border-b border-white/[0.12] bg-white/[0.04] backdrop-blur-[30px] px-4 md:px-6 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.65)]">
        {/* Left: Mobile Menu Toggle & Brand / Project Switcher */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#FCD34D] hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => onSelectTab('overview')}
            className="cursor-pointer transition-opacity hover:opacity-90"
          >
            <ResearchLogo size={32} />
          </div>

          <div className="hidden sm:block h-5 w-px bg-white/15 mx-1" />

          {/* Project Switcher Dropdown */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setProjectMenuOpen(!projectMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.12] hover:border-[#FCD34D]/40 text-xs font-mono text-white hover:bg-white/[0.08] transition-all max-w-[280px] lg:max-w-md truncate backdrop-blur-[30px] shadow-[0_8px_32px_0_rgba(0,0,0,0.65)]"
            >
              <span className="w-2 h-2 rounded-full bg-[#FCD34D] shadow-[0_0_8px_#FCD34D] shrink-0" />
              <span className="truncate text-white font-medium">
                {currentProject.title}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>

            {projectMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 bg-[#0B1528]/95 border border-white/[0.12] rounded-2xl shadow-[0_16px_48px_0_rgba(0,0,0,0.85)] p-2 z-50 animate-in fade-in zoom-in-95 backdrop-blur-[30px]">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-white/10 mb-1">
                  Active Research Dossiers
                </div>
                {projectList.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onSelectProject?.(proj);
                      setProjectMenuOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs font-sans transition-all flex items-center justify-between group ${
                      proj.id === currentProject.id
                        ? 'bg-[#FCD34D]/15 text-[#FDE047] font-semibold border border-[#FCD34D]/30 shadow-[0_0_12px_rgba(252,211,77,0.25)]'
                        : 'hover:bg-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="truncate">{proj.title}</span>
                    <span className="font-mono text-[10px] opacity-70 text-slate-400">
                      {proj.papersCount}p
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Search Button & AI Engine Status & Quick Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenSearchComposer}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.12] hover:border-[#FCD34D]/50 text-xs text-slate-300 hover:text-white transition-all group shadow-[0_8px_32px_0_rgba(0,0,0,0.65)] backdrop-blur-[30px]"
          >
            <Search className="w-3.5 h-3.5 text-[#FCD34D] group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline font-sans text-xs text-slate-300">Search research idea...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-white/[0.08] border border-white/15 font-mono text-[10px] text-slate-400">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={onOpenAIEngine}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.10] border border-[#FCD34D]/40 text-xs font-mono text-white hover:border-[#FCD34D] transition-all shadow-[0_0_14px_rgba(252,211,77,0.20)] active:scale-95 backdrop-blur-[30px]"
            title="AI Engine Status"
          >
            <Zap className="w-3.5 h-3.5 text-[#FCD34D] animate-pulse" />
            <span className="hidden sm:inline text-[11px] font-bold text-[#FDE047]">AI Engine</span>
            <span className="w-2 h-2 rounded-full bg-[#FCD34D] animate-ping ml-0.5 shadow-[0_0_8px_#FCD34D]" />
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Foreground Layout Container (z-index: 10, strictly snaps to 100vh) */}
      <div className="flex-1 min-h-0 flex relative z-10 overflow-hidden">
        {/* Left Navigation Rail (Desktop) */}
        <aside
          className={`hidden md:flex flex-col shrink-0 border-r border-white/[0.12] bg-white/[0.04] backdrop-blur-[30px] shadow-[0_8px_32px_0_rgba(0,0,0,0.65)] transition-all duration-300 select-none ${
            collapsed ? 'w-16' : 'w-64'
          } h-full`}
        >
          {/* Rail Header with collapse toggle */}
          <div className="p-3 flex items-center justify-between border-b border-white/[0.10]">
            {!collapsed && (
              <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400 px-2">
                Workspace
              </span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors mx-auto"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Items List with internal localized scroll */}
          <nav className="flex-1 min-h-0 px-2.5 py-3 space-y-1 overflow-y-auto custom-scrollbar">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'text-white font-semibold bg-white/[0.08] backdrop-blur-[30px] border border-white/[0.20] shadow-[0_0_18px_rgba(252,211,77,0.20)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  {/* Active Indicator: Stellar Gold Accent (#FCD34D) */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-[#FCD34D] rounded-r-full shadow-[0_0_10px_#FCD34D]" />
                  )}

                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-[#FCD34D]' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />

                  {!collapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}

                  {!collapsed && item.badge && (
                    <span
                      className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-tight ${
                        isActive
                          ? 'bg-[#FCD34D]/20 text-[#FDE047] border border-[#FCD34D]/50 font-bold'
                          : 'bg-white/[0.08] text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom of Rail: AI Status Indicator */}
          <div className="p-3 border-t border-white/[0.10] space-y-2">
            {!collapsed ? (
              <div
                onClick={onOpenAIEngine}
                className="cursor-pointer bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.12] p-3 rounded-xl transition-all flex items-center justify-between backdrop-blur-[30px] shadow-[0_8px_32px_0_rgba(0,0,0,0.65)]"
              >
                <div className="flex items-center gap-2.5">
                  {/* Stellar Gold active pulse marker (#FCD34D) */}
                  <div className="relative flex h-2.5 w-2.5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FCD34D] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FCD34D] shadow-[0_0_8px_#FCD34D]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-white font-semibold">
                      AI Engine Online
                    </span>
                    <span className="font-mono text-[9px] text-slate-400">
                      4 Models Active
                    </span>
                  </div>
                </div>
                <Zap className="w-3.5 h-3.5 text-[#FCD34D]" />
              </div>
            ) : (
              <button
                onClick={onOpenAIEngine}
                className="w-full flex justify-center p-2 text-[#FCD34D] hover:bg-white/10 rounded-xl"
                title="AI Engine Online"
              >
                <Zap className="w-4 h-4" />
              </button>
            )}
          </div>
        </aside>

        {/* Mobile Slide-in Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-[#030508]/95 backdrop-blur-[30px] flex flex-col animate-in slide-in-from-left duration-200">
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <ResearchLogo size={28} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-3 border-b border-white/10">
              <span className="text-[10px] font-mono uppercase text-slate-400">Current Project</span>
              <p className="text-sm font-semibold text-white mt-1">{currentProject.title}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                      isActive
                        ? 'bg-[#FCD34D]/15 text-[#FDE047] font-bold border border-[#FCD34D]/30'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#FCD34D]' : 'text-slate-400'}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-400">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Content Workspace Canvas (Snaps to full available container with clean local scrolling) */}
        <main className="flex-1 min-h-0 flex flex-col w-full h-full overflow-y-auto custom-scrollbar p-3 sm:p-5 md:p-6 pb-20 md:pb-6 max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-3 bg-[#030508]/90 backdrop-blur-[30px] rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.7)] border-t border-white/12 md:hidden">
        <button
          onClick={() => onSelectTab('overview')}
          className={`flex flex-col items-center gap-1 transition-transform active:scale-90 ${
            currentTab === 'overview' ? 'text-[#FCD34D] scale-110' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Overview"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-mono">Overview</span>
        </button>

        <button
          onClick={() => onSelectTab('map')}
          className={`flex flex-col items-center gap-1 transition-transform active:scale-90 ${
            currentTab === 'map' ? 'text-[#FCD34D] scale-110' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Research Map"
        >
          <Network className="w-5 h-5" />
          <span className="text-[10px] font-mono">Map</span>
        </button>

        <button
          onClick={() => onSelectTab('papers')}
          className={`flex flex-col items-center gap-1 transition-transform active:scale-90 ${
            currentTab === 'papers' ? 'text-[#FCD34D] scale-110' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Papers"
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-mono">Papers</span>
        </button>

        <button
          onClick={() => onSelectTab('trends')}
          className={`flex flex-col items-center gap-1 transition-transform active:scale-90 ${
            currentTab === 'trends' ? 'text-[#FCD34D] scale-110' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Trends"
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-mono">Trends</span>
        </button>

        <button
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center gap-1 transition-transform active:scale-90 ${
            currentTab === 'settings' ? 'text-[#FCD34D] scale-110' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-mono">Settings</span>
        </button>
      </nav>
    </div>
  );
};

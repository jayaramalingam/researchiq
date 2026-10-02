import React, { useState } from 'react';
import { NavTab, ResearchProject } from './types';
import { DEMO_PROJECTS } from './data/demoData';
import { AppShell } from './components/layout/AppShell';
import { OverviewScreen } from './screens/OverviewScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { SearchResultsScreen } from './screens/SearchResultsScreen';
import { PaperDetailScreen } from './screens/PaperDetailScreen';
import { CompareScreen } from './screens/CompareScreen';
import { ResearchMapScreen } from './screens/ResearchMapScreen';
import { TrendsScreen } from './screens/TrendsScreen';
import { GapsScreen } from './screens/GapsScreen';
import { InnovationsScreen } from './screens/InnovationsScreen';
import { ContradictionsScreen } from './screens/ContradictionsScreen';
import { OpportunitiesScreen } from './screens/OpportunitiesScreen';
import { TestIdeaScreen } from './screens/TestIdeaScreen';
import { LiteratureReviewScreen } from './screens/LiteratureReviewScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { fetchProjects } from './services/api';
import { SearchComposerModal } from './components/common/SearchComposerModal';
import { AIEngineModal } from './components/common/AIEngineModal';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [activeProject, setActiveProject] = useState<ResearchProject>(DEMO_PROJECTS[0]);
  const [projects, setProjects] = useState<ResearchProject[]>(DEMO_PROJECTS);
  const [selectedPaperId, setSelectedPaperId] = useState<string>('paper-01');
  const [comparePaperIds, setComparePaperIds] = useState<string[]>([]);
  const [currentQuery, setCurrentQuery] = useState<string>(
    'AI-based industrial waste classification and autonomous sorting methodologies'
  );

  // Modals
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [aiEngineModalOpen, setAiEngineModalOpen] = useState(false);

  React.useEffect(() => {
    async function loadBackendProjects() {
      try {
        const backendProjs = await fetchProjects();
        if (backendProjs && Array.isArray(backendProjs) && backendProjs.length > 0) {
          const mapped: ResearchProject[] = backendProjs.map((bp: any) => ({
            id: bp.id,
            title: bp.title,
            query: bp.research_question || bp.title,
            depth: 'deep' as const,
            papersCount: bp.papers_count || 5,
            lastActive: bp.updated_at ? bp.updated_at.substring(0, 10) : '2026-09-30',
            sources: ['Semantic Scholar'],
            status: 'Active' as const,
          }));

          setProjects(mapped);
          // Default to the main populated project if found, else first project
          const mainProj = mapped.find(p => p.title.toLowerCase().includes('vision')) || mapped[0];
          setActiveProject(mainProj);
          if (mainProj.query) setCurrentQuery(mainProj.query);
        }
      } catch (err) {
        console.warn('Could not fetch backend projects:', err);
      }
    }

    loadBackendProjects();
  }, []);

  // Handler for starting a new search
  const handleStartSearch = (query: string) => {
    setCurrentQuery(query);
    setSearchModalOpen(false);
    setCurrentTab('discover');
  };

  // Handler for viewing a specific paper detail
  const handleSelectPaper = (paperId: string) => {
    setSelectedPaperId(paperId);
    setCurrentTab('paper-detail');
  };

  // Handler for navigating to comparison with selected papers
  const handleNavigateToCompare = (ids: string[]) => {
    if (ids.length > 0) {
      setComparePaperIds(ids);
    }
    setCurrentTab('compare');
  };

  const handleSelectProject = (proj: ResearchProject) => {
    setActiveProject(proj);
    setCurrentQuery(proj.query);
  };

  const handleOpenSavedReport = (query: string) => {
    setCurrentQuery(query);
    setCurrentTab('papers');
  };

  return (
    <AppShell
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      activeProject={activeProject}
      projects={projects}
      onSelectProject={handleSelectProject}
      onOpenSearchComposer={() => setSearchModalOpen(true)}
      onOpenAIEngine={() => setAiEngineModalOpen(true)}
    >
      {/* Dynamic Screen Routing */}
      {currentTab === 'overview' && (
        <OverviewScreen
          onStartSearch={handleStartSearch}
          onNavigate={setCurrentTab}
          onSelectPaper={handleSelectPaper}
          activeProject={activeProject}
          projects={projects}
          onSelectProject={handleSelectProject}
        />
      )}

      {currentTab === 'discover' && (
        <DiscoverScreen
          query={currentQuery}
          onComplete={() => setCurrentTab('papers')}
        />
      )}

      {currentTab === 'papers' && (
        <SearchResultsScreen
          onSelectPaper={handleSelectPaper}
          onNavigateToCompare={handleNavigateToCompare}
          onNavigate={setCurrentTab}
          projectId={activeProject?.id}
          initialQuery={currentQuery}
        />
      )}

      {currentTab === 'paper-detail' && (
        <PaperDetailScreen
          paperId={selectedPaperId}
          onBack={() => setCurrentTab('papers')}
          onNavigateToCompare={handleNavigateToCompare}
          onNavigate={setCurrentTab}
        />
      )}

      {currentTab === 'compare' && (
        <CompareScreen
          initialSelectedIds={comparePaperIds}
          onNavigate={setCurrentTab}
          onSelectPaper={handleSelectPaper}
          projectId={activeProject?.id}
        />
      )}

      {currentTab === 'map' && (
        <ResearchMapScreen
          onSelectPaper={handleSelectPaper}
          onNavigate={setCurrentTab}
          projectId={activeProject?.id}
        />
      )}

      {currentTab === 'trends' && (
        <TrendsScreen
          onNavigate={setCurrentTab}
          onSelectPaper={handleSelectPaper}
          projectId={activeProject?.id}
        />
      )}

      {currentTab === 'gaps' && (
        <GapsScreen
          onNavigate={setCurrentTab}
          onSelectPaper={handleSelectPaper}
          projectId={activeProject?.id}
        />
      )}

      {currentTab === 'innovations' && (
        <InnovationsScreen
          onNavigate={setCurrentTab}
          onSelectPaper={handleSelectPaper}
          projectId={activeProject?.id}
        />
      )}

      {currentTab === 'contradictions' && (
        <ContradictionsScreen
          onNavigate={setCurrentTab}
          onSelectPaper={handleSelectPaper}
          projectId={activeProject?.id}
        />
      )}

      {currentTab === 'opportunities' && (
        <OpportunitiesScreen
          onNavigate={setCurrentTab}
          onSelectPaper={handleSelectPaper}
          projectId={activeProject?.id}
        />
      )}

      {currentTab === 'test-idea' && (
        <TestIdeaScreen
          onNavigate={setCurrentTab}
          onSelectPaper={handleSelectPaper}
        />
      )}

      {currentTab === 'literature-review' && (
        <LiteratureReviewScreen
          onNavigate={setCurrentTab}
          onSelectPaper={handleSelectPaper}
          projectId={activeProject?.id}
        />
      )}

      {currentTab === 'reports' && (
        <ReportsScreen
          onNavigate={setCurrentTab}
          onOpenReport={handleOpenSavedReport}
          projectId={activeProject?.id}
        />
      )}

      {currentTab === 'settings' && (
        <SettingsScreen onNavigate={setCurrentTab} />
      )}

      {/* Global Modals */}
      <SearchComposerModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onExecuteSearch={handleStartSearch}
        initialQuery={currentQuery}
      />

      <AIEngineModal
        isOpen={aiEngineModalOpen}
        onClose={() => setAiEngineModalOpen(false)}
      />
    </AppShell>
  );
};

export default App;

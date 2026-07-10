import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppStateProvider } from './context/AppStateContext';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import SyllabusView from './components/SyllabusView';
import ImportPackageView from './components/ImportPackageView';
import PracticeView from './components/PracticeView';
import MockTestsView from './components/MockTestsView';
import ErrorBookView from './components/ErrorBookView';
import AnalyticsView from './components/AnalyticsView';

type ViewType = 'dashboard' | 'syllabus' | 'import' | 'practice' | 'mocks' | 'errorbook' | 'analytics';

function AppContent() {
  const { user, isGuest, loading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Concept ID selected from outside (e.g. syllabus screen) to pass into practice or search
  const [selectedConceptOverrideId, setSelectedConceptOverrideId] = useState<string | null>(null);

  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated and not in guest mode
  if (!user && !isGuest) {
    return <LoginScreen />;
  }

  const handleStartPracticeConcept = (conceptId: string) => {
    setSelectedConceptOverrideId(conceptId);
    setCurrentView('practice');
  };

  const handleClearConceptOverride = () => {
    setSelectedConceptOverrideId(null);
  };

  // Switch to specific tabs with clear custom actions
  const handleViewChange = (view: ViewType) => {
    // If navigating away from practice, clear any temporary syllabus override
    if (view !== 'practice') {
      setSelectedConceptOverrideId(null);
    }
    setCurrentView(view);
  };

  // Render the current view in main container
  const renderMainView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            onViewChange={handleViewChange}
            onSelectConceptPractice={handleStartPracticeConcept}
          />
        );
      case 'syllabus':
        return (
          <SyllabusView
            onStartPracticeConcept={handleStartPracticeConcept}
            selectedConceptIdFromOutside={selectedConceptOverrideId || undefined}
            onClearConceptOverride={handleClearConceptOverride}
          />
        );
      case 'import':
        return (
          <ImportPackageView
            onImportComplete={() => handleViewChange('syllabus')}
          />
        );
      case 'practice':
        return (
          <PracticeView
            initialConceptOverrideId={selectedConceptOverrideId}
            onViewChange={handleViewChange}
          />
        );
      case 'mocks':
        return <MockTestsView />;
      case 'errorbook':
        return <ErrorBookView />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <DashboardView onViewChange={handleViewChange} />;
    }
  };

  return (
    <AppStateProvider userId={user ? user.id : 'guest'}>
      <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col md:flex-row antialiased font-sans transition-colors duration-300">
        {/* Navigation Sidebar Drawer (Hidden during active Practice sessions) */}
        {currentView !== 'practice' && (
          <Sidebar
            currentView={currentView}
            onViewChange={handleViewChange}
            mobileOpen={mobileSidebarOpen}
            setMobileOpen={setMobileSidebarOpen}
          />
        )}

        {/* Flexible Viewport Content Pane */}
        <main className={`flex-1 ${currentView === 'practice' ? 'pl-0' : 'md:pl-[260px]'} min-w-0 transition-all`}>
          <div className={`${currentView === 'practice' ? 'max-w-5xl' : 'max-w-7xl'} mx-auto p-4 md:p-8 space-y-6`}>
            {renderMainView()}
          </div>
        </main>
      </div>
    </AppStateProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

import { useAppState } from '../context/AppStateContext';
import {
  LayoutDashboard,
  BookOpen,
  FileDown,
  BrainCircuit,
  GraduationCap,
  BookX,
  TrendingUp,
  Sun,
  Moon,
  Trash2,
  Download,
  Upload,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState, useRef, ChangeEvent } from 'react';

type ViewType = 'dashboard' | 'syllabus' | 'import' | 'practice' | 'mocks' | 'errorbook' | 'analytics';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({ currentView, onViewChange, mobileOpen, setMobileOpen }: SidebarProps) {
  const { theme, toggleTheme, resetAllData, topics, questions, mockTests, errorBook, practiceSessions } = useAppState();
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'syllabus', label: 'Syllabus Tracker', icon: BookOpen },
    { id: 'import', label: 'Import Package', icon: FileDown },
    { id: 'practice', label: 'Practice Engine', icon: BrainCircuit },
    { id: 'mocks', label: 'Mock Test Tracker', icon: GraduationCap },
    { id: 'errorbook', label: 'Error Book', icon: BookX },
    { id: 'analytics', label: 'Detailed Analytics', icon: TrendingUp },
  ] as const;

  // Export Local Backup
  const handleExport = () => {
    const saved = localStorage.getItem('anki_ssc_maths_state');
    if (!saved) {
      alert('No data found to export!');
      return;
    }
    const blob = new Blob([saved], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ssc_maths_anki_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import Local Backup
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.topics && parsed.questions) {
          localStorage.setItem('anki_ssc_maths_state', text);
          alert('Backup restored successfully! The page will now reload to apply changes.');
          window.location.reload();
        } else {
          alert('Invalid backup format. Make sure it is a valid Anki-Style SSC Maths Practice JSON file.');
        }
      } catch (err) {
        alert('Failed to parse backup file. Please ensure it is a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (confirm('Are you absolutely sure you want to reset all your learning logs, practice history, mock tests, and questions? This action cannot be undone.')) {
      resetAllData();
      alert('All data has been reset to defaults.');
      window.location.reload();
    }
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
            A
          </div>
          <span className="font-display font-semibold tracking-wide">Anki SSC Maths</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          id="mobile-menu-toggle"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-30 w-[260px] bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shadow-xl transition-transform duration-300 transform md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } pt-4 md:pt-6`}
      >
        {/* Logo Section */}
        <div className="px-6 pb-6 border-b border-slate-800 hidden md:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-display font-bold text-lg text-white shadow-lg shadow-indigo-600/30">
            A
          </div>
          <div>
            <h1 className="font-display font-bold text-base tracking-tight leading-none text-slate-100">Anki SSC Maths</h1>
            <span className="text-[10px] font-mono text-slate-400">SSC CGL Practice Tool</span>
          </div>
        </div>



        {/* Navigation Area */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onViewChange(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all ${
                  isActive
                    ? 'bg-slate-800 text-slate-100 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-400'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom Utility Panel */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 space-y-2">
          {/* Quick toggle settings view */}
          {showSettings && (
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2 mb-2 text-xs text-slate-300">
              <div className="font-semibold text-slate-100 mb-1">Backup Controls</div>
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 text-left text-slate-200 transition-colors"
              >
                <Download size={14} className="text-indigo-400" />
                Export Backup (JSON)
              </button>
              <button
                onClick={handleImportClick}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 text-left text-slate-200 transition-colors"
              >
                <Upload size={14} className="text-indigo-400" />
                Import Backup (JSON)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
              <div className="h-[1px] bg-slate-800 my-1"></div>
              <button
                onClick={handleReset}
                className="w-full flex items-center gap-2 p-2 rounded-lg text-rose-400 hover:bg-rose-950/30 text-left transition-colors font-medium"
              >
                <Trash2 size={14} className="text-rose-400" />
                Reset Database
              </button>
            </div>
          )}

          {/* Quick controls bar */}
          <div className="flex items-center justify-between gap-1">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-800 text-slate-400 hover:text-slate-100 transition-all flex-1 flex items-center justify-center gap-2 text-xs font-medium cursor-pointer"
              id="theme-toggle-btn"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={15} className="text-amber-400" />
                  <span className="hidden lg:inline text-slate-300">Light</span>
                </>
              ) : (
                <>
                  <Moon size={15} className="text-indigo-400" />
                  <span className="hidden lg:inline text-slate-300">Dark</span>
                </>
              )}
            </button>

            {/* Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-xl border transition-all flex-1 flex items-center justify-center gap-2 text-xs font-medium cursor-pointer ${
                showSettings
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10'
                  : 'bg-slate-800 hover:bg-slate-750 border border-slate-800 text-slate-400 hover:text-slate-100'
              }`}
              id="settings-toggle-btn"
              title="System Settings"
            >
              <Settings size={15} />
              <span className="hidden lg:inline text-slate-300">Settings</span>
            </button>
          </div>

          <div className="text-[10px] text-center text-slate-500 font-mono pt-1">
            v1.0.0 • Local Storage Auto-Saved
          </div>
        </div>
      </aside>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
        ></div>
      )}
    </>
  );
}

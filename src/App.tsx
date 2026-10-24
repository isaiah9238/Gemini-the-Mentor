import React, { useState, useEffect } from 'react';
import { PhysicalSiliconModule } from './components/modules/PhysicalSiliconModule.js';
import { HistoricalFoundationsModule } from './components/modules/HistoricalFoundationsModule.js';
import { EmergentSparksModule } from './components/modules/EmergentSparksModule.js';
import { ParadoxScaleModule } from './components/modules/ParadoxScaleModule.js';
import { NeuromorphicModule } from './components/modules/NeuromorphicModule.js';
import { GeminiLabModule } from './components/modules/GeminiLabModule.js';
import { ResearchNotebookModule } from './components/modules/ResearchNotebookModule.js';
import { FileExplorerModule } from './components/modules/FileExplorerModule.js';
import { CrossAppStudioModule } from './components/modules/CrossAppStudioModule.js';
import { CodeInspectorModule } from './components/modules/CodeInspectorModule.js';
import { ArchitectModule } from './components/modules/ArchitectModule.js';
import { InspectionReport } from './logic/codeInspector.js';
import { initAuth, googleSignIn, logout, testFirestoreConnection } from './services/firebase.js';
import {
  Cpu,
  BookOpen,
  Sparkles,
  Flame,
  Activity,
  Bot,
  FileText,
  Cloud,
  LogOut,
  Layers,
  ChevronRight,
  FolderTree,
  Network,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    | 'silicon'
    | 'historical'
    | 'sparks'
    | 'paradox'
    | 'neuromorphic'
    | 'gemini'
    | 'notebook'
    | 'explorer'
    | 'crossapp'
    | 'inspector'
    | 'architect'
  >('silicon');

  const [latestInspection, setLatestInspection] = useState<InspectionReport | null>(null);

  const [user, setUser] = useState<any>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    testFirestoreConnection();
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  const TABS = [
    { id: 'silicon', label: '1. Silicon & Logic', icon: Cpu },
    { id: 'historical', label: '2. Historical Foundations', icon: BookOpen },
    { id: 'sparks', label: '3. Emergent Sparks of AGI', icon: Sparkles },
    { id: 'paradox', label: '4. Paradox of Scale', icon: Flame },
    { id: 'neuromorphic', label: '5. Neuromorphic & Ionic', icon: Activity },
    { id: 'gemini', label: '6. Gemini Cognitive Lab', icon: Bot },
    { id: 'notebook', label: '7. Research Notebook', icon: FileText },
    { id: 'explorer', label: '8. File Explorer', icon: FolderTree },
    { id: 'crossapp', label: '9. Connected Apps & Skills', icon: Network },
    { id: 'inspector', label: '10. Code Inspector', icon: ShieldCheck },
    { id: 'architect', label: '11. The Architect', icon: Compass },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950 relative">
      {/* Background Subtle Noise Texture Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-sky-600/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                The Genesis of Machine Cognition
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-sky-950 border border-sky-800 text-sky-300 font-semibold">
                  Lab v2.4
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Physical Electrical Signals • Historical Foundations • Emergent AGI Sparks • Neuromorphic Biophysics
              </p>
            </div>
          </div>

          {/* Right Action Bar: Google Auth & Drive Status */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-sky-400"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-sky-700 text-white font-bold flex items-center justify-center text-xs">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-semibold text-white leading-tight">
                    {user.displayName || 'Authorized Scientist'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">
                    {user.email}
                  </div>
                </div>
                <div className="h-4 w-px bg-slate-800 mx-1" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Official Google Sign-in Button Style */
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="gsi-material-button inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-4 h-4 shrink-0"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                <span>{isSigningIn ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Global Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto mt-3 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-1 border-t border-slate-900 pt-2" aria-label="Modules">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {authError && (
          <div className="bg-rose-950/80 border border-rose-800 rounded-xl p-3 text-xs text-rose-300">
            {authError}
          </div>
        )}

        {activeTab === 'silicon' && <PhysicalSiliconModule />}
        {activeTab === 'historical' && <HistoricalFoundationsModule />}
        {activeTab === 'sparks' && <EmergentSparksModule />}
        {activeTab === 'paradox' && <ParadoxScaleModule />}
        {activeTab === 'neuromorphic' && <NeuromorphicModule />}
        {activeTab === 'gemini' && (
          <GeminiLabModule onNavigateToArchitect={() => setActiveTab('architect')} />
        )}
        {activeTab === 'notebook' && (
          <ResearchNotebookModule
            user={user}
            onRequireAuth={handleSignIn}
            onNavigateToSkillStudio={() => setActiveTab('crossapp')}
            onOpenFileInExplorer={() => setActiveTab('explorer')}
            onNavigateToInspector={() => setActiveTab('inspector')}
          />
        )}
        {activeTab === 'explorer' && (
          <FileExplorerModule
            user={user}
            onRequireAuth={handleSignIn}
            onNavigateToSkillStudio={() => setActiveTab('crossapp')}
          />
        )}
        {activeTab === 'crossapp' && (
          <CrossAppStudioModule
            user={user}
            onRequireAuth={handleSignIn}
            onOpenFileInExplorer={() => setActiveTab('explorer')}
          />
        )}
        {activeTab === 'inspector' && (
          <CodeInspectorModule
            user={user}
            onRequireAuth={handleSignIn}
            onNavigateToModule={(mod) => setActiveTab(mod as any)}
            onOpenFileInExplorer={() => setActiveTab('explorer')}
            onSendToNotebook={() => setActiveTab('notebook')}
            onSendToArchitect={(report) => {
              setLatestInspection(report);
              setActiveTab('architect');
            }}
          />
        )}
        {activeTab === 'architect' && (
          <ArchitectModule
            user={user}
            onRequireAuth={handleSignIn}
            latestInspection={latestInspection}
            onNavigateToModule={(mod) => setActiveTab(mod as any)}
            onInjectIntoExplorer={() => setActiveTab('explorer')}
            onInspectFileInInspector={() => setActiveTab('inspector')}
            onOpenGeminiLabWithArchitect={() => setActiveTab('gemini')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            <span>The Genesis of Machine Cognition Research Laboratory</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-3">
            <span>Silicon Logic</span>
            <span>•</span>
            <span>Lovelace Note G</span>
            <span>•</span>
            <span>Turing Imitation</span>
            <span>•</span>
            <span>McCulloch-Pitts 1943</span>
            <span>•</span>
            <span>AlphaFold PDB</span>
            <span>•</span>
            <span>Landauer Limit</span>
            <span>•</span>
            <span>STDP SNN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

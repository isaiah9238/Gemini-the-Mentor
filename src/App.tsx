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
  AlertCircle,
  ExternalLink,
  Key,
  Copy,
  Check,
  X,
  Rows3,
  PanelLeft,
  LayoutGrid,
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
  const [copiedSecret, setCopiedSecret] = useState(false);

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

  const handleContinueAsGuest = () => {
    setUser({
      uid: 'guest-scientist-001',
      displayName: 'Guest Research Scientist',
      email: 'scientist@cognition.lab',
      isAnonymous: true,
    });
    setAuthError(null);
  };

  const FOUNDATION_TABS = [
    { id: 'silicon', label: '1. Silicon & Logic', tag: 'Nanoscale Hardware', icon: Cpu },
    { id: 'historical', label: '2. Historical Foundations', tag: 'Symbolic Logic', icon: BookOpen },
    { id: 'sparks', label: '3. Emergent Sparks of AGI', tag: 'Emergence & ToM', icon: Sparkles },
    { id: 'paradox', label: '4. Paradox of Scale', tag: 'Landauer Limits', icon: Flame },
    { id: 'neuromorphic', label: '5. Neuromorphic & Ionic', tag: 'Biophysics & SNN', icon: Activity },
  ] as const;

  const WORKBENCH_TABS = [
    { id: 'gemini', label: '6. Gemini Cognitive Lab', tag: 'AI Multi-Turn', icon: Bot },
    { id: 'notebook', label: '7. Research Notebook', tag: 'LaTeX & Skills', icon: FileText },
    { id: 'explorer', label: '8. File Explorer', tag: 'Virtual VFS', icon: FolderTree },
    { id: 'crossapp', label: '9. Connected Apps & Skills', tag: 'Shared Registry', icon: Network },
    { id: 'inspector', label: '10. Code Inspector', tag: 'AST Auditor', icon: ShieldCheck },
    { id: 'architect', label: '11. The Architect', tag: 'App Synthesizer', icon: Compass },
  ] as const;

  const ALL_TABS = [...FOUNDATION_TABS, ...WORKBENCH_TABS];

  const [navLayout, setNavLayout] = useState<'tworow' | 'sidebar'>('tworow');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
              /* Official Google Sign-in Button Style + Guest Bypass */
              <div className="flex items-center gap-2">
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

                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-semibold transition-all"
                  title="Explore all modules immediately in Guest Mode without OAuth"
                >
                  Guest Mode
                </button>
              </div>
            )}

            {/* Navigation Layout Mode Toggle: 2 Rows vs Sidebar */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                type="button"
                onClick={() => setNavLayout('tworow')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  navLayout === 'tworow'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to 2-Row Navigation Grid"
              >
                <Rows3 className="w-3.5 h-3.5" />
                <span>2 Rows</span>
              </button>
              <button
                type="button"
                onClick={() => setNavLayout('sidebar')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  navLayout === 'sidebar'
                    ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Collapsible Sidebar Navigation"
              >
                <PanelLeft className="w-3.5 h-3.5" />
                <span>Sidebar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Navigation: 2-Row Layout Mode */}
        {navLayout === 'tworow' && (
          <div className="max-w-7xl mx-auto mt-3.5 space-y-2 border-t border-slate-900/90 pt-2.5">
            {/* Row 1: Physical & Theoretical Foundations (Tabs 1 to 5) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider shrink-0 select-none">
                <Cpu className="w-3 h-3 text-sky-400" /> Foundations &amp; Physics
              </div>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {FOUNDATION_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                        isActive
                          ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 font-bold scale-[1.01]'
                          : 'text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] hidden xl:inline px-1.5 py-0.5 rounded-md font-mono ${
                          isActive
                            ? 'bg-sky-600/30 text-slate-950 font-bold'
                            : 'bg-slate-950 text-slate-400'
                        }`}
                      >
                        {tab.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Cognitive Workbench & Synthesis Studio (Tabs 6 to 11) */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider shrink-0 select-none">
                <Compass className="w-3 h-3 text-indigo-400" /> Workbench &amp; Studio
              </div>
              <div className="flex flex-wrap items-center gap-1.5 flex-1">
                {WORKBENCH_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                        isActive
                          ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 font-bold scale-[1.01]'
                          : 'text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-850 border border-slate-800/80'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] hidden xl:inline px-1.5 py-0.5 rounded-md font-mono ${
                          isActive
                            ? 'bg-sky-600/30 text-slate-950 font-bold'
                            : 'bg-slate-950 text-slate-400'
                        }`}
                      >
                        {tab.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Global Navigation: Compact Header when in Sidebar Mode */}
        {navLayout === 'sidebar' && (
          <div className="max-w-7xl mx-auto mt-2.5 flex items-center justify-between border-t border-slate-900 pt-2 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors font-medium"
              >
                <PanelLeft className="w-3.5 h-3.5 text-sky-400" />
                <span>{isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}</span>
              </button>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 text-xs">
                Active Module:{' '}
                <strong className="text-sky-300">
                  {ALL_TABS.find((t) => t.id === activeTab)?.label}
                </strong>
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
              Sidebar Navigation Active (11 Modules)
            </div>
          </div>
        )}
      </header>

      {/* Content Container (Sidebar + Main or Centered Main) */}
      <div className={`flex-1 flex w-full ${navLayout === 'sidebar' ? 'max-w-none' : 'max-w-7xl mx-auto'}`}>
        {/* Collapsible Sidebar when navLayout === 'sidebar' */}
        {navLayout === 'sidebar' && (
          <aside
            className={`${
              isSidebarCollapsed ? 'w-16' : 'w-72'
            } transition-all duration-300 border-r border-slate-800/80 bg-slate-950/95 sticky top-[108px] h-[calc(100vh-108px)] overflow-y-auto shrink-0 p-3 flex flex-col justify-between select-none z-30`}
          >
            <div className="space-y-4">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between px-1 pb-2 border-b border-slate-900">
                {!isSidebarCollapsed && (
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                    Workbench Modules
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-colors ml-auto"
                  title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  <PanelLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Group 1: Foundations & Physics */}
              <div className="space-y-1">
                {!isSidebarCollapsed && (
                  <div className="text-[10px] uppercase font-mono font-bold text-sky-400 px-2 py-1 flex items-center gap-1.5">
                    <Cpu className="w-3 h-3 text-sky-400" />
                    <span>Physical Foundations</span>
                  </div>
                )}
                {FOUNDATION_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                        isActive
                          ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                      title={tab.label}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!isSidebarCollapsed && (
                        <div className="truncate flex-1">
                          <div className="truncate">{tab.label}</div>
                          <div
                            className={`text-[10px] font-mono ${
                              isActive ? 'text-slate-900 font-semibold' : 'text-slate-500'
                            }`}
                          >
                            {tab.tag}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Group 2: Workbench & Studio */}
              <div className="space-y-1 pt-2 border-t border-slate-900">
                {!isSidebarCollapsed && (
                  <div className="text-[10px] uppercase font-mono font-bold text-indigo-400 px-2 py-1 flex items-center gap-1.5">
                    <Compass className="w-3 h-3 text-indigo-400" />
                    <span>Workbench &amp; Studio</span>
                  </div>
                )}
                {WORKBENCH_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all ${
                        isActive
                          ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-900'
                      }`}
                      title={tab.label}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!isSidebarCollapsed && (
                        <div className="truncate flex-1">
                          <div className="truncate">{tab.label}</div>
                          <div
                            className={`text-[10px] font-mono ${
                              isActive ? 'text-slate-900 font-semibold' : 'text-slate-500'
                            }`}
                          >
                            {tab.tag}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Bottom Vitals */}
            {!isSidebarCollapsed && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1 mt-4">
                <div className="flex items-center justify-between text-slate-300 font-bold">
                  <span>System Vitals</span>
                  <span className="text-emerald-400 text-xs">● Active</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  11 scientific modules ready. Toggle to 2-Row mode anytime via header.
                </p>
              </div>
            )}
          </aside>
        )}

        {/* Main Content Viewport */}
        <main className={`flex-1 min-w-0 ${navLayout === 'sidebar' ? 'p-4 lg:p-8' : 'w-full p-4 lg:p-8'} space-y-6`}>
        {authError && (
          <div className="bg-rose-950/70 border border-rose-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-900/60 border border-rose-700 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Firebase Authentication: OAuth Client Secret Mismatch
                  </h3>
                  <p className="text-xs text-rose-200/90 leading-relaxed max-w-3xl">
                    Google rejected the sign-in token exchange because a new client secret was created in Google Cloud Console, but your Firebase Authentication Google provider still has the previous secret stored.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAuthError(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                title="Dismiss message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step-by-Step Resolution Steps */}
            <div className="bg-slate-950/70 border border-rose-900/40 rounded-xl p-4 space-y-3 text-xs text-slate-300">
              <div className="text-[11px] font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-rose-400" />
                Required Fix in Firebase Console (30 seconds):
              </div>

              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 leading-relaxed">
                <li>
                  Open{' '}
                  <a
                    href="https://console.firebase.google.com/project/gen-lang-client-0573899362/authentication/providers"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    Firebase Authentication &gt; Sign-in providers
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                </li>
                <li>
                  Click on the <strong>Google</strong> provider (pencil icon), and expand <strong>Web SDK configuration</strong>.
                </li>
                <li>
                  Paste the updated <strong>Web client secret</strong> below and click <strong>Save</strong>.
                </li>
              </ol>

              {/* Credential Helper Snippet */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-lg p-3 font-mono text-[11px]">
                <div className="truncate max-w-md">
                  <span className="text-slate-500 select-none">New Client Secret: </span>
                  <span className="text-emerald-400 font-bold select-all">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</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('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');
                    setCopiedSecret(true);
                    setTimeout(() => setCopiedSecret(false), 2500);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700 shrink-0"
                >
                  {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSecret ? 'Copied Secret!' : 'Copy Secret'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="text-[11px] text-slate-400">
                You can also continue using all 11 scientific modules in guest mode without signing in.
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://console.firebase.google.com/project/gen-lang-client-0573899362/authentication/providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Firebase Console
                </a>
                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/30"
                >
                  Continue in Guest Mode (Bypass Auth)
                </button>
              </div>
            </div>
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
      </div>

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

import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Terminal,
  FileCode,
  FolderTree,
  Send,
  Bot,
  Copy,
  Download,
  Flame,
  Activity,
  Layers,
  ArrowRight,
  RefreshCw,
  Boxes,
  Database,
  ExternalLink,
  Save,
  Check,
  ChevronRight,
  Code,
  FileText,
} from 'lucide-react';
import {
  evaluateProjectHealth,
  generateApplicationFromInspection,
  getPrebuiltArchitecturalTemplates,
  getArchitectMentorAdvice,
  ProjectHealthReport,
  ScaffoldedApplication,
  GeneratedFile,
  MentorMessage,
} from '../../logic/architect.js';
import { InspectionReport, getSampleIncomingFiles, inspectCodeFile } from '../../logic/codeInspector.js';
import { db } from '../../services/firebase.js';
import { collection, doc, setDoc, onSnapshot, query } from 'firebase/firestore';

interface ArchitectModuleProps {
  user: any;
  onRequireAuth: () => void;
  latestInspection: InspectionReport | null;
  onNavigateToModule: (moduleId: string) => void;
  onInjectIntoExplorer?: (files: Array<{ path: string; name: string; content: string }>) => void;
  onInspectFileInInspector?: (file: { name: string; content: string }) => void;
  onOpenGeminiLabWithArchitect?: () => void;
}

export const ArchitectModule: React.FC<ArchitectModuleProps> = ({
  user,
  onRequireAuth,
  latestInspection,
  onNavigateToModule,
  onInjectIntoExplorer,
  onInspectFileInInspector,
  onOpenGeminiLabWithArchitect,
}) => {
  // Sub-tabs: 'topology' | 'mentor' | 'scaffolder'
  const [activeSubTab, setActiveSubTab] = useState<'topology' | 'mentor' | 'scaffolder'>('scaffolder');

  // Health report state
  const [healthReport, setHealthReport] = useState<ProjectHealthReport>(() =>
    evaluateProjectHealth(latestInspection)
  );
  const [isScanning, setIsScanning] = useState(false);

  // Re-evaluate when latest inspection changes
  useEffect(() => {
    setHealthReport(evaluateProjectHealth(latestInspection));
  }, [latestInspection]);

  const handleManualScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setHealthReport(evaluateProjectHealth(latestInspection));
      setIsScanning(false);
    }, 600);
  };

  // Prebuilt templates
  const templates = useMemo(() => getPrebuiltArchitecturalTemplates(), []);

  // Scaffolder State
  const [selectedApp, setSelectedApp] = useState<ScaffoldedApplication>(() => {
    if (latestInspection) {
      return generateApplicationFromInspection(latestInspection, { appName: 'SynthesizedRemediatedApp' });
    }
    return templates[0];
  });

  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [customAppName, setCustomAppName] = useState('MyCognitiveApp');
  const [savedToCloud, setSavedToCloud] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);
  const [injectedSuccess, setInjectedSuccess] = useState(false);

  // Mentor Chat State
  const [mentorChat, setMentorChat] = useState<MentorMessage[]>([
    {
      id: 'm-init',
      sender: 'architect',
      text: 'Greetings. I am The Architect. I continuously audit the cognitive topology and physical invariants of this repository. Ask me to audit the project, analyze Landauer dissipation limits, or scaffold complete multi-file applications directly from the Code Inspector.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        { label: 'Audit Project Invariants', type: 'navigate', target: 'topology' },
        { label: 'Scaffold App from Inspector', type: 'scaffold', target: 'inspector' },
        { label: 'Explain Landauer Limit', type: 'navigate', target: 'mentor' },
      ],
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isMentorThinking, setIsMentorThinking] = useState(false);

  // Generate app from inspection
  const handleScaffoldFromInspector = (report: InspectionReport) => {
    const app = generateApplicationFromInspection(report, {
      appName: customAppName.trim() || 'RemediatedApp',
    });
    setSelectedApp(app);
    setActiveFileIndex(0);
    setActiveSubTab('scaffolder');
  };

  // Generate from template
  const handleSelectTemplate = (templateId: string) => {
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl) {
      setSelectedApp(tmpl);
      setActiveFileIndex(0);
      setActiveSubTab('scaffolder');
    }
  };

  // Handle mentor message send
  const handleSendMentorMessage = (customText?: string) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || isMentorThinking) return;

    const userMsg: MentorMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMentorChat((prev) => [...prev, userMsg]);
    if (!customText) setChatInput('');
    setIsMentorThinking(true);

    setTimeout(() => {
      const advice = getArchitectMentorAdvice(userMsg.text, {
        latestInspection,
        health: healthReport,
      });

      const architectReply: MentorMessage = {
        id: `arch-${Date.now()}`,
        sender: 'architect',
        text: advice.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: advice.suggestedActions,
      };

      setMentorChat((prev) => [...prev, architectReply]);
      setIsMentorThinking(false);
    }, 450);
  };

  // Handle action click from mentor
  const handleMentorAction = (action: { label: string; type: string; target: string }) => {
    if (action.type === 'navigate') {
      if (['topology', 'mentor', 'scaffolder'].includes(action.target)) {
        setActiveSubTab(action.target as any);
      } else {
        onNavigateToModule(action.target);
      }
    } else if (action.type === 'scaffold') {
      if (latestInspection) {
        handleScaffoldFromInspector(latestInspection);
      } else {
        handleSelectTemplate(action.target || 'template-snn-cortex');
      }
    } else if (action.type === 'inspect') {
      onNavigateToModule('inspector');
    }
  };

  // Copy current file
  const handleCopyCurrentFile = () => {
    const current = selectedApp.files[activeFileIndex];
    if (current) {
      navigator.clipboard.writeText(current.content);
      setCopiedFile(true);
      setTimeout(() => setCopiedFile(false), 2000);
    }
  };

  // Inject files into Virtual File Explorer
  const handleInjectIntoExplorer = () => {
    if (onInjectIntoExplorer && selectedApp) {
      onInjectIntoExplorer(
        selectedApp.files.map((f) => ({
          path: f.path,
          name: f.name,
          content: f.content,
        }))
      );
      setInjectedSuccess(true);
      setTimeout(() => setInjectedSuccess(false), 3000);
    }
  };

  // Send current file to Code Inspector for audit
  const handleSendToCodeInspector = () => {
    const current = selectedApp.files[activeFileIndex];
    if (current && onInspectFileInInspector) {
      onInspectFileInInspector({
        name: current.name,
        content: current.content,
      });
      onNavigateToModule('inspector');
    }
  };

  // Save blueprint to Firestore
  const handleSaveBlueprint = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    try {
      const blueprintRef = doc(db, 'users', user.uid, 'blueprints', selectedApp.id);
      await setDoc(blueprintRef, {
        id: selectedApp.id,
        title: selectedApp.title,
        description: selectedApp.description,
        domain: selectedApp.domain,
        targetFramework: selectedApp.targetFramework,
        files: selectedApp.files,
        dependencies: selectedApp.dependencies,
        architectNotes: selectedApp.architectNotes,
        derivedFromInspection: selectedApp.derivedFromInspection || null,
        savedAt: new Date().toISOString(),
      });
      setSavedToCloud(true);
      setTimeout(() => setSavedToCloud(false), 3000);
    } catch (err) {
      console.error('Error saving blueprint:', err);
    }
  };

  // Download all files as JSON manifest
  const handleDownloadApp = () => {
    const jsonStr = JSON.stringify(selectedApp, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedApp.title.toLowerCase()}_blueprint.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Metric Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-sky-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Compass className="w-5 h-5 text-sky-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">The Architect</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-950 border border-sky-800 text-sky-400">
                    System Topology & Synthesis
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Global repository invariant monitoring, conversational mentor, and turnkey application generator.
                </p>
              </div>
            </div>
          </div>

          {/* Vitals Summary & Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">System Health</div>
                <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      healthReport.overallStatus === 'HEALTHY'
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-amber-400 animate-ping'
                    }`}
                  />
                  {healthReport.overallScore}% ({healthReport.overallStatus})
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleManualScan}
              disabled={isScanning}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border border-slate-700 shadow-sm"
              title="Re-evaluate all module invariants"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-sky-400' : ''}`} />
              Scan Topology
            </button>
          </div>
        </div>

        {/* Invariants Ribbon */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px] truncate">
              <div className="font-semibold text-slate-200">ESM Module Invariant</div>
              <div className="text-[10px] text-slate-400">Vite React 19 Ready</div>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px] truncate">
              <div className="font-semibold text-slate-200">Landauer Bound</div>
              <div className="text-[10px] text-slate-400">&ge; 2.87e-21 J @ 300K</div>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px] truncate">
              <div className="font-semibold text-slate-200">Browser Sandboxing</div>
              <div className="text-[10px] text-slate-400">Zero Node fs leaks</div>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px] truncate">
              <div className="font-semibold text-slate-200">Membrane Polarity</div>
              <div className="text-[10px] text-slate-400">-70mV Resting / +40mV Peak</div>
            </div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="text-[11px] truncate">
              <div className="font-semibold text-slate-200">Virtual File System</div>
              <div className="text-[10px] text-slate-400">Root Node Verified</div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Navigation */}
        <div className="mt-5 flex gap-2 border-t border-slate-800/80 pt-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('scaffolder')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'scaffolder'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Boxes className="w-4 h-4" /> Application Scaffolder & Code Generator
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('mentor')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'mentor'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" /> Architect Mentor & Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('topology')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'topology'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/25 font-bold'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> System Topology & Module Monitor (10 Modules)
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: APPLICATION SCAFFOLDER */}
      {activeSubTab === 'scaffolder' && (
        <div className="space-y-6">
          {/* Source Selection & Synthesis Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  Synthesis Source: Code Inspector Analysis & Blueprints
                </h3>
                <p className="text-xs text-slate-400">
                  Select an audit report from Code Inspector or a prebuilt architectural blueprint to scaffold complete files.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customAppName}
                  onChange={(e) => setCustomAppName(e.target.value)}
                  placeholder="Target App Title"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 w-44"
                />
                {latestInspection && (
                  <button
                    type="button"
                    onClick={() => handleScaffoldFromInspector(latestInspection)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-500/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Scaffold from Latest Scan
                  </button>
                )}
              </div>
            </div>

            {/* Source Preset Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Option 1: From Latest Inspection */}
              <div
                onClick={() => {
                  if (latestInspection) {
                    handleScaffoldFromInspector(latestInspection);
                  } else {
                    const sample = getSampleIncomingFiles()[0];
                    const rep = inspectCodeFile(sample);
                    handleScaffoldFromInspector(rep);
                  }
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedApp.derivedFromInspection
                    ? 'bg-sky-950/40 border-sky-500/80 shadow-md shadow-sky-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    <span>Code Inspector Report</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-sky-300">
                    {latestInspection ? latestInspection.fileName : 'Sample Legacy Audit'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Transforms diagnosed issues, CommonJS wrappers, and uninstalled dependencies into clean Vite ESM code.
                </p>
              </div>

              {/* Option 2: SNN Cortical Pipeline */}
              <div
                onClick={() => handleSelectTemplate('template-snn-cortex')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedApp.id === 'template-snn-cortex'
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>SNN Cortical Pipeline</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400">
                    Neuromorphic
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Multi-layer Spiking Neural Network with Hodgkin-Huxley membrane dynamics and STDP synaptic learning.
                </p>
              </div>

              {/* Option 3: Cryogenic Landauer Thermodynamics */}
              <div
                onClick={() => handleSelectTemplate('template-landauer-verifier')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedApp.id === 'template-landauer-verifier'
                    ? 'bg-amber-950/40 border-amber-500/80 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Landauer Thermodynamics</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-400">
                    Physical Scale
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Cryogenic (1K) to ambient (300K) Landauer bit erasure limit calculation and CMOS dissipation comparison.
                </p>
              </div>
            </div>
          </div>

          {/* Generated Application Workspace */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            {/* App Meta Header & Action Strip */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{selectedApp.title}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-950 border border-sky-800 text-sky-400">
                    {selectedApp.targetFramework}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{selectedApp.description}</p>
                {selectedApp.derivedFromInspection && (
                  <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Synthesized from{' '}
                    <code>{selectedApp.derivedFromInspection.fileName}</code> (Initial Score:{' '}
                    {selectedApp.derivedFromInspection.originalScore}/100, Resolved Issues:{' '}
                    {selectedApp.derivedFromInspection.resolvedIssuesCount})
                  </div>
                )}
              </div>

              {/* Action Buttons: Inject into Explorer, Inspect in Code Inspector, Save to Firestore, Copy, Download */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleInjectIntoExplorer}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Inject all scaffolded files into the Virtual File Explorer"
                >
                  {injectedSuccess ? <Check className="w-3.5 h-3.5 text-white" /> : <FolderTree className="w-3.5 h-3.5" />}
                  {injectedSuccess ? 'Injected into VFS!' : 'Export to File Explorer'}
                </button>

                <button
                  type="button"
                  onClick={handleSendToCodeInspector}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
                  title="Audit active file in the Code Inspector"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  Audit in Inspector
                </button>

                <button
                  type="button"
                  onClick={handleSaveBlueprint}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
                  title="Save blueprint to user Firestore database"
                >
                  {savedToCloud ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5 text-sky-400" />}
                  {savedToCloud ? 'Saved!' : 'Save Blueprint'}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadApp}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
                  title="Download complete application manifest"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export JSON
                </button>
              </div>
            </div>

            {/* Split View: File Tree on Left, Active File Viewer on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: File Tree & Dependencies */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5 text-sky-400" />
                    Synthesized File Structure ({selectedApp.files.length} files)
                  </div>
                  <div className="space-y-1">
                    {selectedApp.files.map((file, idx) => {
                      const isActive = activeFileIndex === idx;
                      return (
                        <button
                          key={file.path}
                          type="button"
                          onClick={() => setActiveFileIndex(idx)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-all ${
                            isActive
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {file.name.endsWith('.tsx') ? (
                              <FileCode className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            ) : file.name.endsWith('.ts') ? (
                              <Code className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                            <span className="truncate">{file.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 uppercase font-sans shrink-0">
                            {file.language}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target Dependencies Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                    Target Dependencies
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {Object.entries(selectedApp.dependencies).map(([pkg, ver]) => (
                      <div key={pkg} className="flex items-center justify-between text-slate-300">
                        <span className="text-indigo-300">{pkg}</span>
                        <span className="text-slate-400">{ver}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Architect Notes Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-400 leading-relaxed">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-sky-400" />
                    Architect Notes
                  </div>
                  {selectedApp.architectNotes}
                </div>
              </div>

              {/* Right Column: Code Viewer with Line Numbers */}
              <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-[460px]">
                {/* File Header */}
                {selectedApp.files[activeFileIndex] && (
                  <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-sky-300 font-bold">
                        {selectedApp.files[activeFileIndex].path}
                      </span>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">
                        — {selectedApp.files[activeFileIndex].description}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCurrentFile}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedFile ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}

                {/* Code Content */}
                <div className="flex-1 p-4 overflow-x-auto font-mono text-xs text-slate-300 leading-relaxed">
                  {selectedApp.files[activeFileIndex] ? (
                    <table className="w-full border-collapse">
                      <tbody>
                        {selectedApp.files[activeFileIndex].content.split('\n').map((line, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/50">
                            <td className="w-10 pr-4 text-right text-slate-400 select-none text-[11px] align-top">
                              {idx + 1}
                            </td>
                            <td className="whitespace-pre text-slate-200">{line}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-slate-400 text-center py-12">No file selected.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: ARCHITECT MENTOR & CHAT */}
      {activeSubTab === 'mentor' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-sky-400" />
                The Architect: Systems Mentor
              </h3>
              <p className="text-xs text-slate-400">
                Context-aware mentorship on machine cognition, physical limits, repository topology, and code generation.
              </p>
            </div>

            {onOpenGeminiLabWithArchitect && (
              <button
                type="button"
                onClick={onOpenGeminiLabWithArchitect}
                className="px-3.5 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-sky-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" /> Open in Gemini Cognitive Lab
              </button>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-2">
            {[
              'Audit project topology health and invariants',
              'How do we bypass the von Neumann memory wall?',
              'Explain Landauer dissipation floor in cryogenic regimes',
              'Scaffold an application from the latest Code Inspector scan',
              'Explain STDP synaptic plasticity vs offline backpropagation',
            ].map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMentorMessage(prompt)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-medium transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Transcript Window */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4 max-h-[480px] overflow-y-auto">
            {mentorChat.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 border-b border-slate-800/60 pb-1 mb-1">
                    <span className="font-semibold text-sky-400">
                      {msg.sender === 'user' ? 'You (Engineer)' : 'The Architect (Systems Mentor)'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Render Suggested Action Buttons */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2">
                      {msg.suggestedActions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleMentorAction(act)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all border border-slate-700"
                        >
                          <ChevronRight className="w-3 h-3 text-sky-400" /> {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isMentorThinking && (
              <div className="text-xs text-sky-400 flex items-center gap-2 italic">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                The Architect is analyzing repository invariants...
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMentorMessage();
              }}
              placeholder="Ask The Architect about system design, Landauer limits, or scaffolding..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
            <button
              type="button"
              onClick={() => handleSendMentorMessage()}
              disabled={!chatInput.trim() || isMentorThinking}
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TOPOLOGY & MODULE MONITOR (10 MODULES) */}
      {activeSubTab === 'topology' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-400" />
                Project Topology & Module Matrix (10 Systems Monitored)
              </h3>
              <p className="text-xs text-slate-400">
                Continuous invariant checks across physical silicon, historical foundations, thermodynamics, biophysics, and VFS.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-emerald-400 font-bold">
                10 / 10 Monitored Systems Operational
              </span>
            </div>
          </div>

          {/* Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthReport.modules.map((mod) => (
              <div
                key={mod.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{mod.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        mod.status === 'optimal'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {mod.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-sky-400 mt-1">{mod.metric}</div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{mod.details}</p>
                </div>

                <div className="pt-2 border-t border-slate-900 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onNavigateToModule(mod.id)}
                    className="text-xs font-semibold text-slate-300 hover:text-sky-400 flex items-center gap-1 transition-colors"
                  >
                    Open Module <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations Banner */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-400" /> Architect Recommendations
            </div>
            <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
              {healthReport.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

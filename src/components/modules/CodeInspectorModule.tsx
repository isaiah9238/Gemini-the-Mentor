import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Upload,
  Copy,
  Save,
  Download,
  BookOpen,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  FileText,
  Clock,
  ExternalLink,
  Sigma,
  Compass,
  Check,
} from 'lucide-react';
import {
  inspectCodeFile,
  getCoreProjectFiles,
  getSampleIncomingFiles,
  getProjectContext,
  InspectableFile,
  InspectionReport,
  CodeIssue,
} from '../../logic/codeInspector.js';
import { db } from '../../services/firebase.js';
import { collection, doc, setDoc, onSnapshot, query } from 'firebase/firestore';

interface CodeInspectorModuleProps {
  user: any;
  onRequireAuth: () => void;
  onNavigateToModule?: (moduleId: string) => void;
  onOpenFileInExplorer?: (file: { name: string; content: string }) => void;
  onSendToNotebook?: (file: { name: string; content: string }) => void;
  onSendToArchitect?: (report: InspectionReport) => void;
}

export const CodeInspectorModule: React.FC<CodeInspectorModuleProps> = ({
  user,
  onRequireAuth,
  onNavigateToModule,
  onOpenFileInExplorer,
  onSendToNotebook,
  onSendToArchitect,
}) => {
  const projectFiles = useMemo(() => getCoreProjectFiles(), []);
  const sampleFiles = useMemo(() => getSampleIncomingFiles(), []);

  // Copy indicator state
  const [codeCopied, setCodeCopied] = useState(false);

  // Active Source Selection: 'project' | 'samples' | 'custom'
  const [sourceType, setSourceType] = useState<'project' | 'samples' | 'custom'>('samples');
  const [selectedFileId, setSelectedFileId] = useState<string>('sample-cjs-react');

  // Custom File / Scratchpad State
  const [customFileName, setCustomFileName] = useState('incoming_component.tsx');
  const [customLanguage, setCustomLanguage] = useState('typescript');
  const [customContent, setCustomContent] = useState(`// Paste or write any code to inspect compatibility
import React, { useState } from 'react';
import { calculateLandauerLimit } from '../logic/physics.js';

export function ThermalTracker() {
  const [temp, setTemp] = useState(300);
  const data = calculateLandauerLimit(temp);
  return <div>Dissipation: {data.joulesPerBit} J</div>;
}`);

  // Filter Issues State
  const [severityFilter, setSeverityFilter] = useState<'all' | 'error' | 'warning' | 'suggestion' | 'research'>('all');
  const [activeCodeView, setActiveCodeView] = useState<'original' | 'remediation'>('original');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Get active file object
  const activeFile: InspectableFile = useMemo(() => {
    if (sourceType === 'project') {
      return projectFiles.find((f) => f.id === selectedFileId) || projectFiles[0];
    }
    if (sourceType === 'samples') {
      return sampleFiles.find((f) => f.id === selectedFileId) || sampleFiles[0];
    }
    return {
      id: 'custom-file',
      name: customFileName,
      language: customLanguage,
      content: customContent,
      isProjectFile: false,
    };
  }, [sourceType, selectedFileId, customFileName, customLanguage, customContent, projectFiles, sampleFiles]);

  // Run Real-Time Inspection
  const report: InspectionReport = useMemo(() => {
    return inspectCodeFile(activeFile, getProjectContext());
  }, [activeFile]);

  // Handle Local File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCustomFileName(file.name);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'typescript';
      setCustomLanguage(ext);
      setCustomContent(content);
      setSourceType('custom');
    };
    reader.readAsText(file);
  };

  // Save Report to Cloud Firestore
  const handleSaveInspectionToFirestore = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }
    try {
      const reportRef = doc(db, 'users', user.uid, 'inspections', `insp-${Date.now()}`);
      await setDoc(reportRef, {
        fileName: report.fileName,
        status: report.status,
        score: report.score,
        summary: report.summary,
        issuesCount: report.metrics.issuesCount,
        errorsCount: report.metrics.errorsCount,
        timestamp: new Date().toISOString(),
      });
      setSaveStatus('Report logged to Firestore!');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      alert(`Firestore notice: ${err.message}`);
    }
  };

  // Filtered Issues
  const filteredIssues = report.issues.filter((issue) => {
    if (severityFilter === 'all') return true;
    return issue.severity === severityFilter;
  });

  return (
    <div className="space-y-6">
      {/* Module Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Project Code Inspector & Compatibility Engine
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Static Code & Dependency Compatibility Analyzer
            </h2>
            <p className="text-slate-300 text-sm mt-1 leading-relaxed">
              Examines existing repository files and newly imported modules. Verifies compatibility with React 19,
              Vite ESM, browser execution constraints, and physical thermodynamic principles.
              Produces automated remediation code and academic research directions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20">
              <Upload className="w-4 h-4" /> Import External File
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
            <button
              type="button"
              onClick={handleSaveInspectionToFirestore}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              title="Save report snapshot to Firestore"
            >
              <Save className="w-4 h-4" /> Save Audit
            </button>
          </div>
        </div>
      </div>

      {/* File Selection Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" /> Source File:
            </span>

            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSourceType('samples');
                  setSelectedFileId('sample-cjs-react');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  sourceType === 'samples'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Incompatible Samples ({sampleFiles.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceType('project');
                  setSelectedFileId('proj-physics');
                }}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  sourceType === 'project'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Project Files ({projectFiles.length})
              </button>
              <button
                type="button"
                onClick={() => setSourceType('custom')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  sourceType === 'custom'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Import / Scratchpad
              </button>
            </div>
          </div>

          {saveStatus && <span className="text-xs font-mono text-emerald-400">{saveStatus}</span>}
        </div>

        {/* Sub-selector for files */}
        {sourceType === 'samples' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {sampleFiles.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFileId(f.id)}
                className={`px-3 py-1.5 rounded-xl border font-mono transition-all flex items-center gap-1.5 ${
                  selectedFileId === f.id
                    ? 'bg-slate-950 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                {f.name}
              </button>
            ))}
          </div>
        )}

        {sourceType === 'project' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {projectFiles.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedFileId(f.id)}
                className={`px-3 py-1.5 rounded-xl border font-mono transition-all flex items-center gap-1.5 ${
                  selectedFileId === f.id
                    ? 'bg-slate-950 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {f.name}
              </button>
            ))}
          </div>
        )}

        {sourceType === 'custom' && (
          <div className="flex items-center gap-3 text-xs pt-1">
            <input
              type="text"
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-emerald-400"
              placeholder="file_name.tsx"
            />
            <span className="text-slate-500 font-mono text-[11px]">
              Target: React 19 + TypeScript (Vite ESM)
            </span>
          </div>
        )}
      </div>

      {/* Compatibility Verdict & Score Summary Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Score & Verdict (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Compatibility Grade</span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                  report.status === 'COMPATIBLE'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : report.status === 'ADAPTABLE'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {report.status === 'COMPATIBLE' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {report.status === 'ADAPTABLE' && <AlertTriangle className="w-3.5 h-3.5" />}
                {report.status === 'INCOMPATIBLE' && <XCircle className="w-3.5 h-3.5" />}
                {report.status}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span
                className={`text-5xl font-black font-mono tracking-tight ${
                  report.score >= 90
                    ? 'text-emerald-400'
                    : report.score >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {report.score}
              </span>
              <span className="text-slate-500 font-mono text-sm">/ 100</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-2.5 mt-3 border border-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  report.score >= 90
                    ? 'bg-emerald-500'
                    : report.score >= 60
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${report.score}%` }}
              />
            </div>

            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-400" /> Architectural Verdict
              </div>
              {report.architectureVerdict}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-800 pt-4 text-center font-mono">
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500">ERRORS</div>
              <div className="text-base font-bold text-rose-400">{report.metrics.errorsCount}</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500">WARNINGS</div>
              <div className="text-base font-bold text-amber-400">{report.metrics.warningsCount}</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-500">SUGGESTIONS</div>
              <div className="text-base font-bold text-sky-400">{report.metrics.suggestionsCount}</div>
            </div>
          </div>
        </div>

        {/* Right: Executive Summary & File Metrics (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" /> Executive Diagnostic Summary
              </h3>
              <div className="text-xs text-slate-400 mt-0.5">
                Inspecting: <span className="font-mono text-emerald-300">{report.fileName}</span> ({report.metrics.totalLines} lines)
              </div>
            </div>

            <div className="text-xs font-mono text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(report.timestamp).toLocaleTimeString()}
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">{report.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-sky-400" /> Module & Bundler Compatibility
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                Vite 6 + ES Modules. CommonJS require/exports are automatically converted to native ESM.
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Runtime Sandbox Safety
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                Enforces client-side browser safety: prevents unshimmed Node.js core modules (`fs`, `child_process`).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer & Remediation Solution Workspace */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-sky-400" /> Code Workspace:
            </span>

            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveCodeView('original')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  activeCodeView === 'original'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Original Source ({activeFile.name})
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeView('remediation')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                  activeCodeView === 'remediation'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Compatible Remediation Solution
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const codeToCopy =
                  activeCodeView === 'remediation' ? report.remediationCode : activeFile.content;
                navigator.clipboard.writeText(codeToCopy);
                setCodeCopied(true);
                setTimeout(() => setCodeCopied(false), 2000);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {codeCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {codeCopied ? 'Copied' : 'Copy Code'}
            </button>

            {onSendToArchitect && (
              <button
                type="button"
                onClick={() => onSendToArchitect(report)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20"
                title="Send report to The Architect to scaffold turnkey multi-file application"
              >
                <Compass className="w-3.5 h-3.5" /> Scaffold in The Architect
              </button>
            )}

            {onSendToNotebook && (
              <button
                type="button"
                onClick={() => {
                  const targetCode =
                    activeCodeView === 'remediation' ? report.remediationCode : activeFile.content;
                  onSendToNotebook({
                    name: `remediated_${activeFile.name.replace(/\.[^/.]+$/, '')}.tsx`,
                    content: targetCode,
                  });
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Send remediated code to Research Notebook editor"
              >
                <BookOpen className="w-3.5 h-3.5" /> Send to Notebook
              </button>
            )}

            {onOpenFileInExplorer && (
              <button
                type="button"
                onClick={() => {
                  const targetCode =
                    activeCodeView === 'remediation' ? report.remediationCode : activeFile.content;
                  onOpenFileInExplorer({
                    name: `remediated_${activeFile.name}`,
                    content: targetCode,
                  });
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Send to Virtual File Explorer"
              >
                <FolderOpen className="w-3.5 h-3.5" /> Save in Explorer
              </button>
            )}
          </div>
        </div>

        {/* Code Content Area */}
        {activeCodeView === 'original' ? (
          sourceType === 'custom' ? (
            <textarea
              rows={14}
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 focus:outline-none focus:border-emerald-400 leading-relaxed resize-none"
              placeholder="Paste custom code here..."
            />
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 overflow-x-auto max-h-[380px]">
              <pre>{activeFile.content}</pre>
            </div>
          )
        ) : (
          <div className="space-y-2">
            <div className="bg-emerald-950/30 border border-emerald-800/80 rounded-xl p-3 text-xs text-emerald-200 flex items-center justify-between">
              <span className="flex items-center gap-2 font-semibold">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Automated Solution Generated by Code Inspector
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">React 19 + TypeScript + ESM Compliant</span>
            </div>
            <div className="bg-slate-950 border border-emerald-900/60 rounded-xl p-4 font-mono text-xs text-emerald-300 overflow-x-auto max-h-[380px]">
              <pre>{report.remediationCode}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Diagnostic Findings / Issues Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Diagnostic Findings ({report.issues.length})
            </h3>
          </div>

          {/* Severity Filters */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['all', 'error', 'warning', 'suggestion', 'research'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                  severityFilter === sev
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="p-8 text-center bg-slate-950 border border-slate-800/80 rounded-xl text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            No issues found under the "{severityFilter}" filter category. File passes all standard checks!
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    {issue.severity === 'error' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    {issue.severity === 'warning' && (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    {issue.severity === 'suggestion' && (
                      <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                    )}
                    {issue.severity === 'research' && (
                      <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                    )}
                    <span>{issue.title}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                      issue.severity === 'error'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : issue.severity === 'warning'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : issue.severity === 'suggestion'
                        ? 'bg-sky-950 text-sky-400 border border-sky-800'
                        : 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                    }`}
                  >
                    {issue.severity}
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">{issue.description}</p>

                {issue.snippet && (
                  <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg font-mono text-[11px] text-amber-300 overflow-x-auto">
                    {issue.line && <span className="text-slate-500 mr-2">Line {issue.line}:</span>}
                    <code>{issue.snippet}</code>
                  </div>
                )}

                {issue.solution && (
                  <div className="bg-emerald-950/20 border border-emerald-900/60 p-2.5 rounded-lg text-emerald-300 text-[11px] flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-200">Recommended Solution:</strong> {issue.solution}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Direction for More Research */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" /> Direction for More Research
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Theoretical foundations, literature citations, and laboratory testbeds connected to this module.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.researchDirections.map((res, i) => (
            <div
              key={i}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-950 border border-indigo-800 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                  <Sigma className="w-3 h-3" /> {res.domain}
                </div>
                <h4 className="text-sm font-bold text-white leading-snug">{res.title}</h4>
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs italic text-sky-200">
                  "{res.question}"
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{res.background}</p>
              </div>

              <div className="border-t border-slate-900 pt-3 space-y-2">
                <div className="text-[11px] text-slate-400 font-mono">
                  <span className="text-slate-500">Citation: </span>
                  {res.academicCitation}
                </div>

                <div className="bg-indigo-950/20 border border-indigo-900/60 p-2 rounded-lg text-[11px] text-indigo-200 flex items-center justify-between gap-2">
                  <span>{res.suggestedAction}</span>
                  {onNavigateToModule && (
                    <button
                      type="button"
                      onClick={() => {
                        if (res.domain === 'thermodynamics') onNavigateToModule('paradox');
                        else if (res.domain === 'biophysics') onNavigateToModule('neuromorphic');
                        else if (res.domain === 'ai_sparks') onNavigateToModule('sparks');
                        else onNavigateToModule('historical');
                      }}
                      className="px-2 py-1 bg-indigo-700 hover:bg-indigo-600 text-white rounded-md text-[10px] font-semibold shrink-0 transition-colors"
                    >
                      Explore Module
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

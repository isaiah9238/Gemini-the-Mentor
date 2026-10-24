import React, { useState, useEffect, useRef } from 'react';
import { exportToGoogleDrive } from '../../services/googleDrive.js';
import {
  saveExperiment,
  deleteExperiment,
  UserExperiment,
  db,
} from '../../services/firebase.js';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
} from 'firebase/firestore';
import {
  BookOpen,
  Cloud,
  Download,
  Trash2,
  Plus,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileCode,
  Edit3,
  Eye,
  Columns,
  Search,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Terminal,
  Sigma,
  Table as TableIcon,
  Quote,
  List,
  CheckSquare,
  Sparkles,
  Share2,
  Copy,
  ChevronRight,
  FolderOpen,
  Send,
  RotateCcw,
  Clock,
  Layers,
  FileUp,
  ShieldCheck,
} from 'lucide-react';
import {
  NotebookFile,
  calculateFileStats,
  applyMarkdownFormat,
  extractHeadingsOutline,
  convertNoteToSkillMarkdown,
  getInitialNotebookFiles,
  HeadingItem,
} from '../../logic/notebook.js';

interface ResearchNotebookModuleProps {
  user: any;
  onRequireAuth: () => void;
  onNavigateToSkillStudio?: (draftSkill?: { name: string; content: string }) => void;
  onOpenFileInExplorer?: (file: { name: string; content: string }) => void;
  onNavigateToInspector?: () => void;
}

export const ResearchNotebookModule: React.FC<ResearchNotebookModuleProps> = ({
  user,
  onRequireAuth,
  onNavigateToSkillStudio,
  onOpenFileInExplorer,
  onNavigateToInspector,
}) => {
  // Files State
  const [files, setFiles] = useState<NotebookFile[]>(() => {
    try {
      const saved = localStorage.getItem('genesis_notebook_files_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore parse error
    }
    return getInitialNotebookFiles();
  });

  const [activeFileId, setActiveFileId] = useState<string>(() => {
    return files[0]?.id || 'file-genesis-synthesis';
  });

  const [openTabIds, setOpenTabIds] = useState<string[]>(() => {
    return files.slice(0, 3).map((f) => f.id);
  });

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  // Editor Draft State
  const [editorTitle, setEditorTitle] = useState(activeFile ? activeFile.name : '');
  const [editorContent, setEditorContent] = useState(activeFile ? activeFile.content : '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [viewMode, setViewMode] = useState<'editor' | 'split' | 'preview'>('split');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showOutline, setShowOutline] = useState(false);
  const [showExperimentsDrawer, setShowExperimentsDrawer] = useState(true);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // New File Modal State
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileCategory, setNewFileCategory] = useState<NotebookFile['category']>('synthesis');
  const [newFileExtension, setNewFileExtension] = useState<NotebookFile['extension']>('md');

  // Textarea Ref for cursor manipulation
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Google Drive export modal state
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    success?: boolean;
    link?: string;
    message?: string;
  } | null>(null);

  // Saved Experiments from Firestore
  const [experiments, setExperiments] = useState<UserExperiment[]>([
    {
      id: 'demo-1',
      userId: 'demo',
      module: 'silicon_logic',
      title: 'MOSFET Inversion Layer at 1.2V Gate Potential',
      parameters: '{"voltage": 1.2, "dopant": "phosphorus", "scale_nm": 14}',
      results: 'Electron conduction channel established; drain-source current saturation verified.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      userId: 'demo',
      module: 'mcculloch_pitts',
      title: 'Two-Layer XOR Synthesis with Absolute Inhibitory Synapse',
      parameters: '{"theta": 1, "layers": 2, "inhibition_active": true}',
      results: 'Separation hyperplane successfully constructed overcoming single-layer perceptron limits.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-3',
      userId: 'demo',
      module: 'landauer_thermo',
      title: 'Cryogenic Landauer Dissipation Verification at 1K',
      parameters: '{"temp_kelvin": 1.0, "boltzmann_j_k": 1.38e-23}',
      results: 'Minimum dissipation per erased bit verified at 9.57e-24 Joules (0.00006 eV).',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Sync draft state when active file changes
  useEffect(() => {
    if (activeFile) {
      setEditorTitle(activeFile.name);
      setEditorContent(activeFile.content);
      setHasUnsavedChanges(false);
      setSaveStatus(null);
    }
  }, [activeFileId]);

  // Save to localStorage whenever files list updates
  useEffect(() => {
    try {
      localStorage.setItem('genesis_notebook_files_v2', JSON.stringify(files));
    } catch {
      // Ignore quota error
    }
  }, [files]);

  // Firestore real-time synchronization for experiments
  useEffect(() => {
    if (!user) return;
    try {
      const q = query(collection(db, 'users', user.uid, 'experiments'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: UserExperiment[] = [];
          snapshot.forEach((doc) => {
            list.push(doc.data() as UserExperiment);
          });
          if (list.length > 0) {
            setExperiments(list);
          }
        },
        (error) => {
          console.warn('Firestore live listener notice:', error.message);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore listener setup notice:', err);
    }
  }, [user]);

  // Check if current draft differs from active file
  const handleContentChange = (val: string) => {
    setEditorContent(val);
    setHasUnsavedChanges(val !== activeFile.content || editorTitle !== activeFile.name);
    updateCursorInfo();
  };

  const handleTitleChange = (val: string) => {
    setEditorTitle(val);
    setHasUnsavedChanges(editorContent !== activeFile.content || val !== activeFile.name);
  };

  const updateCursorInfo = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart || 0;
    const textBefore = editorContent.slice(0, pos);
    const lines = textBefore.split('\n');
    const currentLine = lines.length;
    const currentCol = lines[lines.length - 1].length + 1;
    setCursorPos({ line: currentLine, col: currentCol });
  };

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveFile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorContent, editorTitle, activeFileId, user]);

  // Save current active file
  const handleSaveFile = async () => {
    const updated: NotebookFile = {
      ...activeFile,
      name: editorTitle.trim() || activeFile.name,
      content: editorContent,
      sizeBytes: new Blob([editorContent]).size,
      updatedAt: new Date().toISOString(),
    };

    setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    setHasUnsavedChanges(false);
    setSaveStatus('Saved locally');

    if (user) {
      try {
        const fileRef = doc(db, 'users', user.uid, 'notebook_files', updated.id);
        await setDoc(fileRef, updated, { merge: true });
        setSaveStatus('Saved to Cloud Firestore & Local Cache');
      } catch (err: any) {
        console.warn('Firestore file save notice:', err.message);
        setSaveStatus('Saved to Local Cache (Cloud sync error)');
      }
    }
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Switch active file
  const handleSelectFile = (file: NotebookFile) => {
    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm(
        'You have unsaved changes in the current file. Do you want to discard them and switch?'
      );
      if (!confirmSwitch) return;
    }
    setActiveFileId(file.id);
    if (!openTabIds.includes(file.id)) {
      setOpenTabIds((prev) => [...prev, file.id]);
    }
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = openTabIds.filter((tabId) => tabId !== id);
    setOpenTabIds(remaining);
    if (activeFileId === id && remaining.length > 0) {
      setActiveFileId(remaining[0]);
    }
  };

  // Create new file
  const handleCreateNewFile = () => {
    if (!newFileName.trim()) return;
    const finalName = newFileName.includes('.')
      ? newFileName
      : `${newFileName}.${newFileExtension}`;

    const newFile: NotebookFile = {
      id: `file-${Date.now()}`,
      name: finalName,
      extension: newFileExtension,
      category: newFileCategory,
      content: `# ${finalName}\n\n*Created on ${new Date().toLocaleDateString()}*\n\n## Overview\nDocument your laboratory observations and mathematical formulations here.\n`,
      sizeBytes: 120,
      tags: [newFileCategory, newFileExtension],
      updatedAt: new Date().toISOString(),
    };

    setFiles((prev) => [newFile, ...prev]);
    setOpenTabIds((prev) => [...prev, newFile.id]);
    setActiveFileId(newFile.id);
    setIsCreatingFile(false);
    setNewFileName('');
  };

  // Delete file
  const handleDeleteFile = async (file: NotebookFile) => {
    if (files.length <= 1) {
      alert('Cannot delete the last remaining notebook file.');
      return;
    }
    const confirmDelete = window.confirm(`Permanently delete "${file.name}"?`);
    if (!confirmDelete) return;

    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    setOpenTabIds((prev) => prev.filter((id) => id !== file.id));

    if (activeFileId === file.id) {
      const remaining = files.filter((f) => f.id !== file.id);
      setActiveFileId(remaining[0]?.id || '');
    }

    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'notebook_files', file.id));
      } catch (err: any) {
        console.warn('Firestore delete notice:', err.message);
      }
    }
  };

  // Duplicate file
  const handleDuplicateFile = (file: NotebookFile) => {
    const copy: NotebookFile = {
      ...file,
      id: `file-${Date.now()}`,
      name: file.name.replace(/(\.[^/.]+)$/, '_copy$1'),
      updatedAt: new Date().toISOString(),
    };
    setFiles((prev) => [copy, ...prev]);
    setOpenTabIds((prev) => [...prev, copy.id]);
    setActiveFileId(copy.id);
  };

  // Apply formatting toolbar action
  const handleFormatClick = (
    format: 'bold' | 'italic' | 'h1' | 'h2' | 'h3' | 'code' | 'codeblock' | 'math' | 'quote' | 'bullet' | 'task' | 'table'
  ) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart || 0;
    const end = textareaRef.current.selectionEnd || 0;
    const { newContent, newCursor } = applyMarkdownFormat(editorContent, start, end, format);
    handleContentChange(newContent);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursor, newCursor);
      }
    }, 10);
  };

  // Insert experiment snapshot into active note
  const handleInsertExperiment = (exp: UserExperiment) => {
    const expText = `\n\n### Experiment Snapshot: ${exp.title}
- **Module**: \`${exp.module}\`
- **Recorded**: ${new Date(exp.createdAt).toLocaleString()}
- **Parameters**: \`${exp.parameters}\`
- **Results**:
> ${exp.results}
\n`;
    if (!textareaRef.current) {
      handleContentChange(editorContent + expText);
      return;
    }
    const start = textareaRef.current.selectionStart || editorContent.length;
    const before = editorContent.slice(0, start);
    const after = editorContent.slice(start);
    handleContentChange(before + expText + after);
  };

  // Download active file
  const handleDownloadActiveFile = () => {
    const mime = activeFile.extension === 'json' ? 'application/json' : 'text/markdown';
    const blob = new Blob([editorContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = editorTitle || activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Send to Cross-App Skill Studio
  const handleSendToSkillStudio = () => {
    const skillMarkdown = convertNoteToSkillMarkdown(activeFile);
    if (onNavigateToSkillStudio) {
      onNavigateToSkillStudio({
        name: activeFile.name.replace(/\.[^/.]+$/, ''),
        content: skillMarkdown,
      });
    } else {
      alert('Converted to Agent Skill! Navigate to Tab 9 to test in the Skill Studio.');
    }
  };

  // Send to File Explorer
  const handleSendToFileExplorer = () => {
    if (onOpenFileInExplorer) {
      onOpenFileInExplorer({
        name: editorTitle,
        content: editorContent,
      });
    } else {
      alert('File ready for virtual filesystem. Navigate to Tab 8: File Explorer.');
    }
  };

  // Google Drive export modal state
  const handleExportToDrive = async () => {
    if (!user) {
      onRequireAuth();
      return;
    }

    const confirmed = window.confirm(
      `Export "${editorTitle}" to your Google Drive account (${user.email})?\n\nThis will create a new research document in your Google Drive.`
    );
    if (!confirmed) return;

    setIsExporting(true);
    setExportStatus(null);

    const result = await exportToGoogleDrive(editorTitle, editorContent);
    setIsExporting(false);

    if (result.success) {
      setExportStatus({
        success: true,
        link: result.webViewLink,
        message: `Successfully created "${result.fileName}" in your Google Drive!`,
      });
    } else {
      setExportStatus({
        success: false,
        message: result.error || 'Failed to export to Google Drive.',
      });
    }
  };

  // Calculate stats and outline
  const stats = calculateFileStats(editorContent);
  const headingsOutline = extractHeadingsOutline(editorContent);

  // Filtered files in sidebar
  const filteredFiles = files.filter((f) => {
    const matchesQuery =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  // Render markdown text parser helper
  const renderMarkdownPreview = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    lines.forEach((line, idx) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div key={`codeblock-${idx}`} className="my-3 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-400 overflow-x-auto relative">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 border-b border-slate-900 pb-1 flex justify-between">
                <span>Code Block</span>
                <span className="text-slate-400">Lines: {codeBuffer.length}</span>
              </div>
              <pre>{codeBuffer.join('\n')}</pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBuffer = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // LaTeX math equation block: $$ ... $$
      if (line.startsWith('$$') || line.includes('$$')) {
        const mathContent = line.replace(/\$\$/g, '').trim();
        elements.push(
          <div
            key={`math-${idx}`}
            className="my-3 p-3 bg-amber-950/20 border border-amber-800/60 rounded-xl font-mono text-xs text-amber-200 text-center shadow-inner flex items-center justify-center gap-2"
          >
            <Sigma className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold tracking-wide">{mathContent}</span>
          </div>
        );
        return;
      }

      // Table formatting: | col | col |
      if (line.startsWith('|') && line.endsWith('|')) {
        elements.push(
          <div key={`table-row-${idx}`} className="font-mono text-[11px] text-slate-300 bg-slate-950/40 px-2 py-1 border-b border-slate-800/80">
            {line}
          </div>
        );
        return;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${idx}`} className="text-xl font-extrabold text-white mt-5 mb-2 border-b border-slate-800 pb-1 flex items-center gap-2">
            <span className="text-emerald-400 text-sm">#</span> {line.replace('# ', '')}
          </h1>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${idx}`} className="text-base font-bold text-sky-300 mt-4 mb-2 flex items-center gap-2">
            <span className="text-sky-500 text-xs">##</span> {line.replace('## ', '')}
          </h2>
        );
        return;
      }
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${idx}`} className="text-sm font-semibold text-emerald-300 mt-3 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
        return;
      }

      // Blockquotes
      if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={`quote-${idx}`} className="border-l-2 border-emerald-500 pl-3 py-1 my-2 text-xs italic text-slate-300 bg-emerald-950/10 rounded-r-lg">
            {line.replace('> ', '')}
          </blockquote>
        );
        return;
      }

      // Task checkboxes
      if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
        const isChecked = line.startsWith('- [x] ');
        elements.push(
          <div key={`task-${idx}`} className="flex items-center gap-2 text-xs text-slate-300 my-1">
            <input type="checkbox" checked={isChecked} readOnly className="rounded border-slate-700 bg-slate-900 text-emerald-500" />
            <span className={isChecked ? 'line-through text-slate-500' : ''}>{line.slice(6)}</span>
          </div>
        );
        return;
      }

      // Bullet lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={`bullet-${idx}`} className="text-xs text-slate-300 ml-4 list-disc my-0.5">
            {line.replace(/^[-*]\s+/, '')}
          </li>
        );
        return;
      }

      // Empty line
      if (!line.trim()) {
        elements.push(<div key={`blank-${idx}`} className="h-2" />);
        return;
      }

      // Normal paragraph
      elements.push(
        <p key={`p-${idx}`} className="text-xs text-slate-300 leading-relaxed my-1">
          {line}
        </p>
      );
    });

    return elements;
  };

  return (
    <div className="space-y-6">
      {/* Module Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-semibold mb-3">
              <BookOpen className="w-3.5 h-3.5" /> AI Studio Research Notebook & Full File Editor
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Integrated Notebook File Editor & Laboratory Synchronizer
            </h2>
            <p className="text-slate-300 text-sm mt-1 leading-relaxed">
              Full-featured multi-file code and markdown workspace. Edit research blueprints, compute
              thermodynamic proofs, synthesize agent skills, and sync directly with Google Drive and Cloud Firestore.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingFile(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" /> New File
            </button>
            <button
              type="button"
              onClick={handleSendToSkillStudio}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-sky-600/20"
              title="Convert this notebook note into an Agent Skill and open in Cross-App Studio"
            >
              <Sparkles className="w-4 h-4" /> Open in Skill Studio
            </button>
          </div>
        </div>
      </div>

      {/* Main File Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Notebook Files Sidebar (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <FolderOpen className="w-4 h-4 text-emerald-400" /> Notebook Files
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
              {files.length}
            </span>
          </div>

          {/* Search & Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search notes or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
              {(['all', 'synthesis', 'physics', 'biophysics'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-1 rounded-lg capitalize whitespace-nowrap transition-colors ${
                    categoryFilter === cat
                      ? 'bg-emerald-950 border border-emerald-800 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Files List */}
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredFiles.map((f) => {
              const isSelected = f.id === activeFileId;
              return (
                <div
                  key={f.id}
                  onClick={() => handleSelectFile(f)}
                  className={`group p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/80 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    {f.extension === 'json' ? (
                      <FileCode className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold truncate text-xs leading-snug">{f.name}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{f.category}</span>
                        <span>•</span>
                        <span>{(f.sizeBytes / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateFile(f);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-200"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(f);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Outline Toggle */}
          <div className="border-t border-slate-800 pt-3">
            <button
              type="button"
              onClick={() => setShowOutline(!showOutline)}
              className="w-full py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-between transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" /> Table of Contents ({headingsOutline.length})
              </span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showOutline ? 'rotate-90' : ''}`} />
            </button>

            {showOutline && (
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto pl-1 pr-1 text-[11px] font-mono text-slate-400 border-l border-slate-800">
                {headingsOutline.map((h, i) => (
                  <div
                    key={i}
                    style={{ paddingLeft: `${(h.level - 1) * 8}px` }}
                    className="truncate hover:text-emerald-400 cursor-pointer py-0.5"
                  >
                    {h.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center & Right Columns: File Editor & Preview Workspace (9 Cols) */}
        <div className="lg:col-span-9 space-y-4">
          {/* Active File Tabs & Actions Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              {/* Tab pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full">
                {openTabIds.map((id) => {
                  const file = files.find((f) => f.id === id);
                  if (!file) return null;
                  const isActive = file.id === activeFileId;
                  return (
                    <div
                      key={id}
                      onClick={() => handleSelectFile(file)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
                        isActive
                          ? 'bg-slate-950 border border-emerald-500/80 text-white shadow-sm'
                          : 'bg-slate-950/40 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="truncate max-w-[140px]">{file.name}</span>
                      {hasUnsavedChanges && isActive && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
                      )}
                      {openTabIds.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => handleCloseTab(id, e)}
                          className="text-slate-500 hover:text-rose-400 ml-1"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* View Mode Buttons (Editor / Split / Preview) */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode('editor')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    viewMode === 'editor'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Editor view only"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    viewMode === 'split'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Side-by-side split screen"
                >
                  <Columns className="w-3.5 h-3.5" /> Split
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Rendered preview only"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              </div>
            </div>

            {/* Title Bar & Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <input
                  type="text"
                  value={editorTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm font-bold text-white w-full max-w-md focus:outline-none focus:border-emerald-400 transition-colors"
                  placeholder="Notebook file name..."
                />
                {hasUnsavedChanges ? (
                  <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Unsaved
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Synced
                  </span>
                )}
                {saveStatus && (
                  <span className="text-[11px] text-sky-400 font-mono">{saveStatus}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveFile}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-600/20"
                  title="Save changes (Ctrl+S / Cmd+S)"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>

                <button
                  type="button"
                  onClick={handleDownloadActiveFile}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Download to computer"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>

                <button
                  type="button"
                  onClick={handleSendToFileExplorer}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="Open in File Explorer"
                >
                  <FolderOpen className="w-3.5 h-3.5" /> Explorer
                </button>

                {onNavigateToInspector && (
                  <button
                    type="button"
                    onClick={onNavigateToInspector}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Inspect file in Code Inspector"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Inspect
                  </button>
                )}
              </div>
            </div>

            {/* Rich Markdown Formatting Bar */}
            <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-800/80 text-xs text-slate-300">
              <span className="text-[10px] text-slate-500 font-mono mr-1">FORMAT:</span>
              <button
                type="button"
                onClick={() => handleFormatClick('h1')}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white"
                title="Heading 1"
              >
                <Heading1 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleFormatClick('h2')}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white"
                title="Heading 2"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleFormatClick('h3')}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white"
                title="Heading 3"
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>

              <span className="text-slate-700 mx-1">|</span>

              <button
                type="button"
                onClick={() => handleFormatClick('bold')}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white font-bold"
                title="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleFormatClick('italic')}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white italic"
                title="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              <span className="text-slate-700 mx-1">|</span>

              <button
                type="button"
                onClick={() => handleFormatClick('code')}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white"
                title="Inline Code"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleFormatClick('codeblock')}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white"
                title="Code Block"
              >
                <Terminal className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleFormatClick('math')}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white text-amber-400 font-bold"
                title="LaTeX Math Formula ($$ \Delta Q = k_B T \ln 2 $$)"
              >
                <Sigma className="w-3.5 h-3.5" />
              </button>

              <span className="text-slate-700 mx-1">|</span>

              <button
                type="button"
                onClick={() => handleFormatClick('bullet')}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white"
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleFormatClick('task')}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white"
                title="Task Checkbox"
              >
                <CheckSquare className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleFormatClick('quote')}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white"
                title="Blockquote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleFormatClick('table')}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white"
                title="Markdown Table"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Editor & Preview Viewport */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left side: Code / Text Editor */}
            {(viewMode === 'editor' || viewMode === 'split') && (
              <div
                className={`${
                  viewMode === 'editor' ? 'md:col-span-2' : 'col-span-1'
                } bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Edit3 className="w-3.5 h-3.5" /> SOURCE EDITOR ({activeFile.extension.toUpperCase()})
                  </span>
                  <span>
                    Ln {cursorPos.line}, Col {cursorPos.col}
                  </span>
                </div>

                <textarea
                  ref={textareaRef}
                  rows={20}
                  value={editorContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onKeyUp={updateCursorInfo}
                  onClick={updateCursorInfo}
                  className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-400 leading-relaxed resize-none min-h-[460px]"
                  placeholder="Type research markdown or code here..."
                />

                {/* Editor Footer Metrics */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 mt-3 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    <span>{stats.words} words</span>
                    <span>•</span>
                    <span>{stats.characters} chars</span>
                    <span>•</span>
                    <span>{stats.lines} lines</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" /> ~{stats.readingTimeMinutes} min read
                  </div>
                </div>
              </div>
            )}

            {/* Right side: Live Rendered Preview */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div
                className={`${
                  viewMode === 'preview' ? 'md:col-span-2' : 'col-span-1'
                } bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <Eye className="w-3.5 h-3.5" /> LIVE RENDERED PREVIEW
                  </span>
                  <span className="text-slate-500 font-sans text-[10px]">Formatted View</span>
                </div>

                <div className="w-full flex-1 bg-slate-950/70 border border-slate-800 rounded-xl p-4 overflow-y-auto max-h-[460px] min-h-[460px]">
                  {renderMarkdownPreview(editorContent)}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
                  <span>Markdown + LaTeX math formatted</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(editorContent);
                      alert('Document content copied to clipboard!');
                    }}
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> Copy Raw
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Export to Google Drive Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-sky-400" /> Google Drive Cloud Synchronizer
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Uploads "{editorTitle}" directly into your Google Drive as an editable research document.
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportToDrive}
              disabled={isExporting}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-md shadow-sky-600/20"
            >
              <Cloud className="w-4 h-4" />
              {isExporting ? 'Syncing to Drive...' : 'Export to Google Drive'}
            </button>
          </div>

          {exportStatus && (
            <div
              className={`p-4 rounded-xl text-xs flex items-start gap-3 ${
                exportStatus.success
                  ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/80 border border-rose-800 text-rose-200'
              }`}
            >
              {exportStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div>{exportStatus.message}</div>
                {exportStatus.link && (
                  <a
                    href={exportStatus.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sky-400 hover:underline font-semibold"
                  >
                    Open in Google Drive <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Saved Experiments & Insert Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-emerald-400" /> Firestore Saved Laboratory Experiments
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Insert physical semiconductor, Landauer thermodynamic, or neural simulation snapshots directly into your active note.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExperimentsDrawer(!showExperimentsDrawer)}
                className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 hover:text-white"
              >
                {showExperimentsDrawer ? 'Hide' : 'Show'} ({experiments.length})
              </button>
            </div>

            {showExperimentsDrawer && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {experiments.map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs space-y-2 hover:border-slate-700 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-bold text-slate-200 leading-snug">{exp.title}</div>
                        {user && (
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteExperiment(user.uid, exp.id);
                              setExperiments((prev) => prev.filter((e) => e.id !== exp.id));
                            }}
                            className="text-slate-500 hover:text-rose-400"
                            title="Delete experiment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-sky-400 mt-1">{exp.module}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">{exp.results}</div>
                    </div>

                    <div className="border-t border-slate-900 pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        {new Date(exp.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleInsertExperiment(exp)}
                        className="px-2 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/60 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Plus className="w-3 h-3" /> Insert into Note
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New File Modal */}
      {isCreatingFile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Create New Notebook File
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-semibold">File Name</label>
                <input
                  type="text"
                  placeholder="e.g. neuromorphic_synapse_experiment"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Extension</label>
                  <select
                    value={newFileExtension}
                    onChange={(e) => setNewFileExtension(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="md">Markdown (.md)</option>
                    <option value="json">JSON (.json)</option>
                    <option value="ts">TypeScript (.ts)</option>
                    <option value="py">Python (.py)</option>
                    <option value="txt">Text (.txt)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-semibold">Category</label>
                  <select
                    value={newFileCategory}
                    onChange={(e) => setNewFileCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="synthesis">Synthesis</option>
                    <option value="physics">Physics</option>
                    <option value="biophysics">Biophysics</option>
                    <option value="agent_skill">Agent Skill</option>
                    <option value="history">History</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreatingFile(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewFile}
                disabled={!newFileName.trim()}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Create File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

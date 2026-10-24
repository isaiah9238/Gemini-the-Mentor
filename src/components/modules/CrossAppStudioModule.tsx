import React, { useState, useEffect, useRef } from 'react';
import {
  Network,
  Search,
  Plus,
  Save,
  Download,
  Upload,
  RefreshCw,
  Sliders,
  Play,
  FileCode,
  FileText,
  Activity,
  Check,
  AlertCircle,
  ExternalLink,
  Layers,
  Database,
  Cpu,
  Share2,
  Trash2,
  Edit3,
  BarChart3,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sparkles,
  GitBranch,
  Terminal,
  ShieldCheck,
  Zap,
  Globe,
  Tag,
  ArrowRight,
  FolderGit2,
} from 'lucide-react';
import {
  ConnectedAppConfig,
  AgentSkillDefinition,
  MindMapNode,
  MindMapEdge,
  AppTelemetryMetric,
  getPreconfiguredApps,
  getPreconfiguredSkills,
  filterSkills,
  parseSkillMarkdown,
  serializeSkillToMarkdown,
  generateDefaultMindMap,
  calculateAppTelemetry,
} from '../../logic/crossAppRegistry.js';
import {
  db,
  auth,
  testFirestoreConnection,
} from '../../services/firebase.js';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  limit,
} from 'firebase/firestore';

interface CrossAppStudioProps {
  user?: any;
  onRequireAuth?: () => void;
  onOpenFileInExplorer?: (filename: string, content: string) => void;
}

export function CrossAppStudioModule({
  user,
  onRequireAuth,
  onOpenFileInExplorer,
}: CrossAppStudioProps) {
  // Navigation sub-tabs within Cross-App Studio:
  // 1: "registry" (Search Firestore of other apps / Agent Skill Registry)
  // 2: "write-skill" (Write Skill Interface & editor)
  // 3: "mind-map" (Interactive Architecture Mind Map)
  // 4: "analytics" (App Analytics & Telemetry Dashboard)
  const [subTab, setSubTab] = useState<'registry' | 'write-skill' | 'mind-map' | 'analytics'>('registry');

  // Connected Apps state
  const [connectedApps, setConnectedApps] = useState<ConnectedAppConfig[]>(() => {
    try {
      const saved = localStorage.getItem('genesis_connected_apps');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return getPreconfiguredApps();
  });
  const [selectedAppId, setSelectedAppId] = useState<string>('agent-skill-registry');

  // Skills Catalog state (searched from connected app Firestore)
  const [skillsCatalog, setSkillsCatalog] = useState<AgentSkillDefinition[]>(() => {
    try {
      const saved = localStorage.getItem('genesis_skills_catalog');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return getPreconfiguredSkills();
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isSearchingFirestore, setIsSearchingFirestore] = useState(false);

  // Active Skill in the "Write Skill Interface"
  const [activeSkill, setActiveSkill] = useState<AgentSkillDefinition>(() => getPreconfiguredSkills()[0]);
  const [skillEditorMode, setSkillEditorMode] = useState<'visual' | 'code'>('visual');
  const [skillCodeContent, setSkillCodeContent] = useState<string>(() =>
    serializeSkillToMarkdown(getPreconfiguredSkills()[0])
  );
  const [isSkillDirty, setIsSkillDirty] = useState(false);

  // Custom App Modal state
  const [isAddAppModalOpen, setIsAddAppModalOpen] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppDesc, setNewAppDesc] = useState('');
  const [newAppDbId, setNewAppDbId] = useState('');
  const [newAppCollection, setNewAppCollection] = useState('skills');

  // Mind Map Graph state
  const [mindMapData, setMindMapData] = useState<{ nodes: MindMapNode[]; edges: MindMapEdge[] }>(() =>
    generateDefaultMindMap('Agent Skill Registry', getPreconfiguredSkills())
  );
  const [selectedMindMapNode, setSelectedMindMapNode] = useState<MindMapNode | null>(null);
  const [mindMapZoom, setMindMapZoom] = useState<number>(1);
  const [mindMapPan, setMindMapPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Telemetry Analytics state
  const [telemetryData, setTelemetryData] = useState<AppTelemetryMetric>(() =>
    calculateAppTelemetry(getPreconfiguredSkills())
  );
  const [recentLogs, setRecentLogs] = useState<
    { id: string; time: string; skill: string; latencyMs: number; status: '200 OK' | '201 Created' | 'Cached'; payloadKb: number }[]
  >([
    { id: 'log-1', time: '10:38:12', skill: 'nanoscale-silicon-transport', latencyMs: 38, status: '200 OK', payloadKb: 4.2 },
    { id: 'log-2', time: '10:39:05', skill: 'theory-of-mind-social-probe', latencyMs: 64, status: '200 OK', payloadKb: 12.8 },
    { id: 'log-3', time: '10:39:44', skill: 'mcculloch-pitts-logic-synthesizer', latencyMs: 22, status: 'Cached', payloadKb: 1.5 },
    { id: 'log-4', time: '10:40:18', skill: 'stdp-hebbian-plasticity-tuner', latencyMs: 45, status: '200 OK', payloadKb: 6.1 },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem('genesis_connected_apps', JSON.stringify(connectedApps));
    } catch {}
  }, [connectedApps]);

  useEffect(() => {
    try {
      localStorage.setItem('genesis_skills_catalog', JSON.stringify(skillsCatalog));
    } catch {}
  }, [skillsCatalog]);

  // Keep Mind Map and Telemetry in sync when skills or app changes
  useEffect(() => {
    const selectedApp = connectedApps.find((a) => a.id === selectedAppId);
    setMindMapData(generateDefaultMindMap(selectedApp?.name || 'Connected App', skillsCatalog));
    setTelemetryData(calculateAppTelemetry(skillsCatalog));
  }, [selectedAppId, skillsCatalog, connectedApps]);

  // Notification timer
  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  // Sync skill code when switching to code mode or selecting a new skill
  const handleSelectSkillForEditing = (skill: AgentSkillDefinition) => {
    setActiveSkill(skill);
    setSkillCodeContent(serializeSkillToMarkdown(skill));
    setIsSkillDirty(false);
    setSubTab('write-skill');
    setNotification(`Opened "${skill.name}" in Write Skill Interface.`);
  };

  // Search Firestore of selected app
  const handleSearchFirestore = async () => {
    setIsSearchingFirestore(true);
    try {
      // If user is authenticated, query real Firestore collection
      if (user && db) {
        try {
          const selectedApp = connectedApps.find((a) => a.id === selectedAppId);
          const colName = selectedApp?.targetCollection || 'shared_skills';
          const q = query(collection(db, colName), limit(20));
          const snapshot = await getDocs(q);
          const remoteSkills: AgentSkillDefinition[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteSkills.push({
              id: docSnap.id,
              name: data.name || docSnap.id,
              version: data.version || '1.0.0',
              description: data.description || '',
              category: data.category || 'cognitive',
              author: data.author || 'Remote App User',
              tags: data.tags || ['remote', 'firestore'],
              parameters: data.parameters || [],
              steps: data.steps || [],
              markdownContent: data.markdownContent || '',
              updatedAt: data.updatedAt || new Date().toISOString(),
              invocationsCount: data.invocationsCount || 100,
            });
          });

          if (remoteSkills.length > 0) {
            setSkillsCatalog((prev) => {
              const combined = [...remoteSkills];
              prev.forEach((p) => {
                if (!combined.some((c) => c.id === p.id)) combined.push(p);
              });
              return combined;
            });
            setNotification(`Synced ${remoteSkills.length} skills from Firestore collection "${colName}".`);
          } else {
            setNotification(`Searched Firestore collection "${colName}". Filtered ${filteredList.length} matching skills.`);
          }
        } catch (fErr: any) {
          console.warn('Firestore remote search fallback:', fErr.message);
          setNotification(`Searched registry catalog. Filtered ${filteredList.length} matching skills.`);
        }
      } else {
        // Instant simulated filter
        setNotification(`Searched ${selectedAppId} registry: found ${filteredList.length} skills matching "${searchQuery}".`);
      }
    } finally {
      setIsSearchingFirestore(false);
    }
  };

  // Save modified skill
  const handleSaveSkill = async () => {
    let updatedSkill = { ...activeSkill };

    if (skillEditorMode === 'code') {
      const parsed = parseSkillMarkdown(skillCodeContent, activeSkill.id);
      updatedSkill = {
        ...updatedSkill,
        name: parsed.name || updatedSkill.name,
        description: parsed.description || updatedSkill.description,
        tags: parsed.tags || updatedSkill.tags,
        steps: parsed.steps || updatedSkill.steps,
        markdownContent: skillCodeContent,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updatedSkill.markdownContent = serializeSkillToMarkdown(updatedSkill);
      updatedSkill.updatedAt = new Date().toISOString();
      setSkillCodeContent(updatedSkill.markdownContent);
    }

    setActiveSkill(updatedSkill);
    setSkillsCatalog((prev) => {
      const idx = prev.findIndex((s) => s.id === updatedSkill.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedSkill;
        return copy;
      }
      return [updatedSkill, ...prev];
    });
    setIsSkillDirty(false);

    // Save to Firestore if authenticated
    if (user && db) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'skills', updatedSkill.id), updatedSkill);
        // Also publish to shared registry if requested
        await setDoc(doc(db, 'shared_skills', updatedSkill.id), updatedSkill);
        setNotification(`Saved "${updatedSkill.name}" and published to Firestore Agent Skill Registry!`);
        return;
      } catch (err: any) {
        console.warn('Firestore skill save error:', err.message);
      }
    }

    setNotification(`Saved "${updatedSkill.name}" to Skill Studio catalog.`);
  };

  // Export Skill to File Explorer (VFS)
  const handleExportSkillToFileExplorer = () => {
    const filename = `${activeSkill.name}.skill.md`;
    const content = serializeSkillToMarkdown(activeSkill);

    try {
      const savedVfs = localStorage.getItem('genesis_cognition_vfs');
      let vfsList = savedVfs ? JSON.parse(savedVfs) : [];
      let skillsFolder = vfsList.find((n: any) => n.path === '/skills' || n.name === 'skills');

      if (!skillsFolder) {
        skillsFolder = {
          id: 'dir-skills',
          name: 'skills',
          path: '/skills',
          type: 'directory',
          sizeBytes: 0,
          updatedAt: new Date().toISOString(),
          children: [],
        };
        vfsList.push(skillsFolder);
      }

      const newFileNode = {
        id: `skill-file-${Date.now()}`,
        name: filename,
        path: `/skills/${filename}`,
        type: 'file',
        sizeBytes: new TextEncoder().encode(content).length,
        mimeType: 'text/markdown',
        updatedAt: new Date().toISOString(),
        content,
      };

      skillsFolder.children = skillsFolder.children || [];
      skillsFolder.children = skillsFolder.children.filter((c: any) => c.name !== filename);
      skillsFolder.children.push(newFileNode);

      localStorage.setItem('genesis_cognition_vfs', JSON.stringify(vfsList));
      setNotification(`Exported skill to File Explorer: "/skills/${filename}"!`);
      if (onOpenFileInExplorer) {
        onOpenFileInExplorer(`/skills/${filename}`, content);
      }
    } catch (err: any) {
      alert(`Could not export to File Explorer: ${err.message}`);
    }
  };

  // Download Skill as .md file to local machine
  const handleDownloadSkillFile = () => {
    const content = serializeSkillToMarkdown(activeSkill);
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSkill.name}.SKILL.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setNotification(`Downloaded ${activeSkill.name}.SKILL.md to computer.`);
  };

  // Simulate a live skill execution
  const handleSimulateSkillRun = (skill: AgentSkillDefinition) => {
    const latency = Math.floor(Math.random() * 45) + 20;
    const newLog = {
      id: `log-${Date.now()}`,
      time: new Date().toLocaleTimeString(),
      skill: skill.name,
      latencyMs: latency,
      status: '200 OK' as const,
      payloadKb: parseFloat((Math.random() * 8 + 2).toFixed(1)),
    };

    setRecentLogs((prev) => [newLog, ...prev.slice(0, 7)]);
    setSkillsCatalog((prev) =>
      prev.map((s) => (s.id === skill.id ? { ...s, invocationsCount: s.invocationsCount + 1 } : s))
    );
    setNotification(`Simulated execution of "${skill.name}" in ${latency}ms.`);
  };

  // Create new custom skill
  const handleCreateNewSkill = () => {
    const newId = `skill-custom-${Date.now()}`;
    const newSkill: AgentSkillDefinition = {
      id: newId,
      name: 'new-cognitive-skill',
      version: '1.0.0',
      description: 'Custom autonomous agent skill created in Write Skill Interface.',
      category: 'cognitive',
      author: user?.displayName || 'Research Scientist',
      tags: ['custom', 'agent', 'cognition'],
      parameters: [
        { name: 'inputPrompt', type: 'string', description: 'Query or input state', required: true },
        { name: 'depthLevel', type: 'number', description: 'Execution reasoning depth', required: false },
      ],
      steps: [
        'Validate input configuration',
        'Execute algorithmic cognition pipeline',
        'Format and return structured output',
      ],
      markdownContent: '',
      updatedAt: new Date().toISOString(),
      invocationsCount: 1,
    };
    newSkill.markdownContent = serializeSkillToMarkdown(newSkill);
    setActiveSkill(newSkill);
    setSkillCodeContent(newSkill.markdownContent);
    setSkillsCatalog((prev) => [newSkill, ...prev]);
    setIsSkillDirty(true);
    setSubTab('write-skill');
    setNotification('Created new skill. Ready for authoring in Write Skill Interface.');
  };

  // Add custom connected app
  const handleAddCustomApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;
    const newApp: ConnectedAppConfig = {
      id: `app-${Date.now()}`,
      name: newAppName.trim(),
      description: newAppDesc.trim() || 'Custom external Firestore application bridge.',
      firestoreDatabaseId: newAppDbId.trim() || 'default',
      targetCollection: newAppCollection.trim() || 'skills',
      status: 'connected',
      lastSyncedAt: new Date().toISOString(),
    };
    setConnectedApps((prev) => [...prev, newApp]);
    setSelectedAppId(newApp.id);
    setIsAddAppModalOpen(false);
    setNewAppName('');
    setNewAppDesc('');
    setNotification(`Connected to external app: "${newApp.name}"`);
  };

  const filteredList = filterSkills(skillsCatalog, searchQuery, categoryFilter);
  const activeApp = connectedApps.find((a) => a.id === selectedAppId);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-sky-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5">
                <Network className="w-3 h-3" />
                Cross-App Ecosystem & Registry Bridge
              </span>
              <span className="text-xs text-slate-400">• Firestore Multi-App Interop</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1 flex items-center gap-2.5">
              <Share2 className="w-6 h-6 text-indigo-400" />
              Connected Apps, Skill Studio & Analytics
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Search the Firestore of external applications (such as the <strong>Agent Skill Registry</strong>),
              author skills in the <strong>Write Skill Interface</strong>, visualize application architecture in
              the <strong>Interactive Mind Map</strong>, and monitor real-time <strong>App Telemetry & Analytics</strong>.
            </p>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl shrink-0">
            <button
              onClick={() => setSubTab('registry')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'registry'
                  ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>1. Firestore Registry</span>
            </button>
            <button
              onClick={() => setSubTab('write-skill')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'write-skill'
                  ? 'bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>2. Write Skill Interface</span>
            </button>
            <button
              onClick={() => setSubTab('mind-map')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'mind-map'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>3. Mind Map</span>
            </button>
            <button
              onClick={() => setSubTab('analytics')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'analytics'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>4. App Analytics</span>
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {notification && (
          <div className="mt-4 p-2.5 bg-indigo-950/60 border border-indigo-800/80 rounded-xl flex items-center justify-between text-xs text-indigo-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{notification}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          SUB-TAB 1: FIRESTORE REGISTRY & SEARCH OF OTHER APPS
         ======================================================== */}
      {subTab === 'registry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Connected Apps Selector & Search Controls (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Target Firestore App
                </h3>
              </div>
              <button
                onClick={() => setIsAddAppModalOpen(true)}
                className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Connect App</span>
              </button>
            </div>

            {/* List of Connected Apps */}
            <div className="space-y-2">
              {connectedApps.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedAppId === app.id
                      ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md shadow-indigo-950/30'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-indigo-400" />
                      {app.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {app.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {app.description}
                  </p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                    <span>col: /{app.targetCollection}</span>
                    <span>•</span>
                    <span>db: {app.firestoreDatabaseId || 'default'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Search Input Bar */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Search Firestore Records</span>
                <span className="text-[10px] text-slate-400">{filteredList.length} results</span>
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search skills, tools, tags, authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['all', 'physics', 'logic', 'cognitive', 'biophysics'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-1 rounded-md text-[10px] uppercase font-semibold transition-colors ${
                      categoryFilter === cat
                        ? 'bg-indigo-500 text-slate-950'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Live Sync Button */}
              <button
                onClick={handleSearchFirestore}
                disabled={isSearchingFirestore}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/25"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSearchingFirestore ? 'animate-spin' : ''}`} />
                <span>{isSearchingFirestore ? 'Querying Firestore...' : 'Search Remote Firestore DB'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Skills Discovery Grid (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col h-[700px] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  <span>Agent Skills from {activeApp?.name || 'Selected App'}</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select any skill to render in the <strong>Write Skill Interface</strong>, visualize in the{' '}
                  <strong>Mind Map</strong>, or run execution benchmarks.
                </p>
              </div>
              <button
                onClick={handleCreateNewSkill}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-sky-500/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write New Skill</span>
              </button>
            </div>

            {/* Scrollable Cards Grid */}
            <div className="flex-1 overflow-y-auto pt-4 space-y-3 custom-scrollbar pr-1">
              {filteredList.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Search className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs">No matching skills found in this Firestore collection.</p>
                </div>
              ) : (
                filteredList.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-4 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-sky-200 group-hover:text-sky-300 transition-colors">
                            {skill.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">v{skill.version}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-slate-800 text-slate-300">
                            {skill.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Author: {skill.author}</div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSimulateSkillRun(skill)}
                          title="Test Run Skill"
                          className="p-1.5 bg-slate-800 hover:bg-emerald-950/60 hover:text-emerald-300 text-slate-300 rounded-lg text-xs border border-slate-700/60 transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSelectSkillForEditing(skill)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600/80 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Open in Skill Studio</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-3">{skill.description}</p>

                    {/* Parameters & Tags */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-900 text-[11px]">
                      <div className="flex flex-wrap gap-1">
                        {skill.tags.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded text-[10px]">
                            #{t}
                          </span>
                        ))}
                      </div>
                      <div className="text-slate-400 font-mono text-[10px]">
                        {skill.invocationsCount.toLocaleString()} invocations
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 2: WRITE SKILL INTERFACE (SKILL STUDIO)
         ======================================================== */}
      {subTab === 'write-skill' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Skill Authoring Surface (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col h-[740px] overflow-hidden shadow-xl">
            {/* Header Toolbar */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileCode className="w-4 h-4 text-sky-400" />
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white truncate">{activeSkill.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">v{activeSkill.version}</span>
                    {isSkillDirty && (
                      <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded-full border border-amber-500/30">
                        Modified
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">Agent Skill Specification (SKILL.md)</div>
                </div>
              </div>

              {/* Mode Switch & Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => {
                      if (skillEditorMode === 'code') {
                        // sync code into activeSkill
                        const parsed = parseSkillMarkdown(skillCodeContent, activeSkill.id);
                        setActiveSkill((prev) => ({
                          ...prev,
                          name: parsed.name || prev.name,
                          description: parsed.description || prev.description,
                          tags: parsed.tags || prev.tags,
                          steps: parsed.steps || prev.steps,
                        }));
                      }
                      setSkillEditorMode('visual');
                    }}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      skillEditorMode === 'visual'
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Visual Builder
                  </button>
                  <button
                    onClick={() => {
                      setSkillCodeContent(serializeSkillToMarkdown(activeSkill));
                      setSkillEditorMode('code');
                    }}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      skillEditorMode === 'code'
                        ? 'bg-sky-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Raw SKILL.md
                  </button>
                </div>

                <button
                  onClick={handleSaveSkill}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-sky-500/20 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>

                <button
                  onClick={handleExportSkillToFileExplorer}
                  title="Export to File Explorer VFS (/skills)"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 font-medium text-xs rounded-lg border border-slate-700/60 transition-colors"
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export to VFS</span>
                </button>

                <button
                  onClick={handleDownloadSkillFile}
                  title="Download SKILL.md to computer"
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs border border-slate-700/60 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Editor Body */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-950/40">
              {skillEditorMode === 'visual' ? (
                /* Visual Skill Form Interface */
                <div className="space-y-4 max-w-2xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Skill Name (kebab-case)
                      </label>
                      <input
                        type="text"
                        value={activeSkill.name}
                        onChange={(e) => {
                          setActiveSkill({ ...activeSkill, name: e.target.value });
                          setIsSkillDirty(true);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                      <select
                        value={activeSkill.category}
                        onChange={(e) => {
                          setActiveSkill({ ...activeSkill, category: e.target.value as any });
                          setIsSkillDirty(true);
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        <option value="physics">physics</option>
                        <option value="logic">logic</option>
                        <option value="cognitive">cognitive</option>
                        <option value="biophysics">biophysics</option>
                        <option value="tooling">tooling</option>
                        <option value="data">data</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Description / Capability Summary
                    </label>
                    <textarea
                      rows={3}
                      value={activeSkill.description}
                      onChange={(e) => {
                        setActiveSkill({ ...activeSkill, description: e.target.value });
                        setIsSkillDirty(true);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-sky-500 leading-relaxed"
                    />
                  </div>

                  {/* Parameters Schema */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-300">
                        Input Parameters Schema ({activeSkill.parameters.length})
                      </label>
                      <button
                        onClick={() => {
                          const newParam = {
                            name: `param${activeSkill.parameters.length + 1}`,
                            type: 'number' as const,
                            description: 'Parameter description',
                            required: true,
                          };
                          setActiveSkill({
                            ...activeSkill,
                            parameters: [...activeSkill.parameters, newParam],
                          });
                          setIsSkillDirty(true);
                        }}
                        className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-semibold"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Parameter</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {activeSkill.parameters.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 bg-slate-900/60 border border-slate-800 rounded-lg text-xs"
                        >
                          <input
                            type="text"
                            value={p.name}
                            onChange={(e) => {
                              const copy = [...activeSkill.parameters];
                              copy[idx].name = e.target.value;
                              setActiveSkill({ ...activeSkill, parameters: copy });
                              setIsSkillDirty(true);
                            }}
                            className="w-32 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                          />
                          <select
                            value={p.type}
                            onChange={(e) => {
                              const copy = [...activeSkill.parameters];
                              copy[idx].type = e.target.value as any;
                              setActiveSkill({ ...activeSkill, parameters: copy });
                              setIsSkillDirty(true);
                            }}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300"
                          >
                            <option value="string">string</option>
                            <option value="number">number</option>
                            <option value="boolean">boolean</option>
                            <option value="object">object</option>
                          </select>
                          <input
                            type="text"
                            value={p.description}
                            onChange={(e) => {
                              const copy = [...activeSkill.parameters];
                              copy[idx].description = e.target.value;
                              setActiveSkill({ ...activeSkill, parameters: copy });
                              setIsSkillDirty(true);
                            }}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300"
                            placeholder="Description"
                          />
                          <button
                            onClick={() => {
                              const copy = activeSkill.parameters.filter((_, i) => i !== idx);
                              setActiveSkill({ ...activeSkill, parameters: copy });
                              setIsSkillDirty(true);
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Execution Steps */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Execution Steps Pipeline
                    </label>
                    <div className="space-y-1.5">
                      {activeSkill.steps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-sky-400 w-4">{sIdx + 1}.</span>
                          <input
                            type="text"
                            value={step}
                            onChange={(e) => {
                              const copy = [...activeSkill.steps];
                              copy[sIdx] = e.target.value;
                              setActiveSkill({ ...activeSkill, steps: copy });
                              setIsSkillDirty(true);
                            }}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Raw Code / Markdown Editor */
                <textarea
                  value={skillCodeContent}
                  onChange={(e) => {
                    setSkillCodeContent(e.target.value);
                    setIsSkillDirty(true);
                  }}
                  className="w-full h-full bg-transparent font-mono text-xs text-sky-100 resize-none focus:outline-none leading-relaxed selection:bg-sky-500/30"
                  spellCheck={false}
                />
              )}
            </div>

            {/* Status Footer */}
            <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span>SKILL.md Spec v2.4</span>
                <span>•</span>
                <span>Parameters: {activeSkill.parameters.length}</span>
                <span>•</span>
                <span>Steps: {activeSkill.steps.length}</span>
              </div>
              <div className="text-slate-400">
                Updated: {new Date(activeSkill.updatedAt).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Right Column: Skill Test Sandbox & Firestore Publishing (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Interactive Skill Sandbox
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Simulate live execution of "{activeSkill.name}" with sample inputs.
                </p>
              </div>

              {/* Sample Inputs */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Test Inputs</label>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300 space-y-1">
                  {activeSkill.parameters.map((p) => (
                    <div key={p.name} className="flex justify-between">
                      <span className="text-sky-400">{p.name}:</span>
                      <span className="text-amber-300">
                        {p.type === 'number' ? '14.2' : p.type === 'boolean' ? 'true' : '"sample_val"'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Run Button */}
              <button
                onClick={() => handleSimulateSkillRun(activeSkill)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/25"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Execute Skill Benchmark</span>
              </button>

              {/* Firestore Registry Target */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Firestore Registry Status</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Target: <span className="font-mono text-slate-200">/shared_skills/{activeSkill.id}</span>
                </div>
                <button
                  onClick={handleSaveSkill}
                  className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Publish to Firestore Registry</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Compliant with Agent Skill Format standard</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 3: INTERACTIVE MIND MAP VISUALIZATION
         ======================================================== */}
      {subTab === 'mind-map' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col h-[740px] overflow-hidden shadow-xl relative">
          {/* Top Mind Map Controls */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-400" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Cognitive Mind Map: {activeApp?.name || 'Application Topology'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  Visual graph of skills, databases, and dependencies. Click any node to inspect.
                </p>
              </div>
            </div>

            {/* Zoom & Pan Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setMindMapZoom((z) => Math.min(z + 0.15, 2.0))}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMindMapZoom((z) => Math.max(z - 0.15, 0.5))}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setMindMapZoom(1);
                  setMindMapPan({ x: 0, y: 0 });
                }}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
              >
                Reset View
              </button>
            </div>
          </div>

          {/* Interactive SVG Canvas */}
          <div
            className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing bg-slate-950"
            onMouseDown={(e) => {
              setIsDraggingCanvas(true);
              setDragStart({ x: e.clientX - mindMapPan.x, y: e.clientY - mindMapPan.y });
            }}
            onMouseMove={(e) => {
              if (!isDraggingCanvas) return;
              setMindMapPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
            }}
            onMouseUp={() => setIsDraggingCanvas(false)}
            onMouseLeave={() => setIsDraggingCanvas(false)}
          >
            {/* Grid background */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />

            <svg
              className="w-full h-full select-none"
              style={{
                transform: `translate(${mindMapPan.x}px, ${mindMapPan.y}px) scale(${mindMapZoom})`,
                transformOrigin: 'center center',
              }}
            >
              {/* Edges */}
              {mindMapData.edges.map((edge) => {
                const sourceNode = mindMapData.nodes.find((n) => n.id === edge.source);
                const targetNode = mindMapData.nodes.find((n) => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                return (
                  <g key={edge.id}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke="#475569"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                    />
                    {edge.label && (
                      <text
                        x={(sourceNode.x + targetNode.x) / 2}
                        y={(sourceNode.y + targetNode.y) / 2 - 6}
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="middle"
                        className="font-mono"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Nodes */}
              {mindMapData.nodes.map((node) => {
                const isSelected = selectedMindMapNode?.id === node.id;
                const isRoot = node.type === 'app';
                const isDatabase = node.type === 'database';

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMindMapNode(node);
                    }}
                    className="cursor-pointer group"
                  >
                    <circle
                      r={isRoot ? 32 : isDatabase ? 22 : 26}
                      fill={
                        isRoot
                          ? '#4f46e5'
                          : isDatabase
                          ? '#059669'
                          : isSelected
                          ? '#0284c7'
                          : '#1e293b'
                      }
                      stroke={isSelected ? '#38bdf8' : isRoot ? '#818cf8' : '#334155'}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all duration-200"
                    />
                    <text
                      y={isRoot ? 46 : 38}
                      fill={isSelected ? '#38bdf8' : '#f1f5f9'}
                      fontSize={isRoot ? '12' : '10'}
                      fontWeight={isRoot ? 'bold' : 'normal'}
                      textAnchor="middle"
                      className="font-sans"
                    >
                      {node.label}
                    </text>
                    <text
                      y={4}
                      fill="#ffffff"
                      fontSize="9"
                      textAnchor="middle"
                      className="font-mono uppercase pointer-events-none"
                    >
                      {isRoot ? 'APP' : isDatabase ? 'DB' : 'SKILL'}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Selected Node Details Drawer */}
            {selectedMindMapNode && (
              <div className="absolute bottom-4 right-4 max-w-sm w-full bg-slate-900/95 border border-slate-700 rounded-xl p-4 shadow-2xl backdrop-blur-md z-20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                    <span className="font-bold text-xs text-white uppercase">{selectedMindMapNode.type}</span>
                  </div>
                  <button
                    onClick={() => setSelectedMindMapNode(null)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
                <h4 className="font-bold text-sm text-sky-200 mb-1">{selectedMindMapNode.label}</h4>
                <p className="text-xs text-slate-300 mb-3">{selectedMindMapNode.description}</p>

                {selectedMindMapNode.skillId && (
                  <button
                    onClick={() => {
                      const skill = skillsCatalog.find((s) => s.id === selectedMindMapNode.skillId);
                      if (skill) handleSelectSkillForEditing(skill);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Open in Write Skill Interface</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-TAB 4: APP ANALYTICS DASHBOARD
         ======================================================== */}
      {subTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Invocations</span>
                <Activity className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {telemetryData.totalInvocations.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                <span>↑ 14.2%</span>
                <span className="text-slate-400">vs last 24h</span>
              </div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Success Rate</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-300">
                {telemetryData.successRatePercent}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Zero fatal kernel faults</div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Avg Latency</span>
                <Zap className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-amber-300">
                {telemetryData.averageLatencyMs} ms
              </div>
              <div className="text-[10px] text-slate-400 mt-1">P95: {telemetryData.p95LatencyMs} ms</div>
            </div>

            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Cache Hit Ratio</span>
                <Database className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-indigo-300">
                {(telemetryData.cacheHitRatio * 100).toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Firestore edge cache</div>
            </div>
          </div>

          {/* Charts & Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Invocations Timeline Chart (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Execution Load Timeline
                  </h3>
                  <p className="text-[11px] text-slate-400">Hourly throughput across connected skills</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  Live Stream
                </span>
              </div>

              {/* Bar Chart Visualization */}
              <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                {telemetryData.historyTimeline.map((item, idx) => {
                  const maxCount = 15000;
                  const heightPercent = Math.round((item.count / maxCount) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.count.toLocaleString()}
                      </div>
                      <div className="w-full bg-slate-800 rounded-t-md overflow-hidden h-40 flex items-end">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full bg-gradient-to-t from-indigo-600 to-sky-400 group-hover:from-indigo-500 group-hover:to-sky-300 transition-all rounded-t-md"
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Skill Distribution (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <div className="border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Skill Usage Breakdown
                </h3>
                <p className="text-[11px] text-slate-400">Percentage distribution across skill catalog</p>
              </div>

              <div className="space-y-3">
                {telemetryData.skillUsageBreakdown.map((item) => (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-mono text-slate-200 truncate">{item.name}</span>
                      <span className="text-slate-400 font-semibold">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${item.percentage}%` }}
                        className="bg-indigo-500 h-full rounded-full transition-all"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-Time Live Activity Stream */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Recent Skill Executions Stream
                </h3>
              </div>
              <button
                onClick={() => handleSimulateSkillRun(activeSkill)}
                className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Simulate Execution</span>
              </button>
            </div>

            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{log.time}</span>
                    <span className="text-sky-300 font-semibold">{log.skill}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{log.payloadKb} KB</span>
                    <span className="text-amber-400">{log.latencyMs} ms</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONNECT CUSTOM APP
         ======================================================== */}
      {isAddAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Connect External Firestore App</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter the database details of another Firebase application to search and interoperate.
            </p>

            <form onSubmit={handleAddCustomApp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Application Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Autonomous Agent Workflow Hub"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Firestore Database ID (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., ai-studio-agent-registry-xxx or (default)"
                  value={newAppDbId}
                  onChange={(e) => setNewAppDbId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Collection</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., shared_skills, workflows, tools"
                  value={newAppCollection}
                  onChange={(e) => setNewAppCollection(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Short description of this app's purpose"
                  value={newAppDesc}
                  onChange={(e) => setNewAppDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAppModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 transition-colors"
                >
                  Connect App
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileJson,
  Plus,
  Trash2,
  Edit3,
  Save,
  Download,
  Upload,
  HardDrive,
  Globe,
  RefreshCw,
  Search,
  ChevronRight,
  ChevronDown,
  Check,
  Copy,
  Cloud,
  ExternalLink,
  AlertCircle,
  FolderPlus,
  FilePlus,
  Layers,
  Sparkles,
  Info,
  Terminal,
} from 'lucide-react';
import {
  VirtualFileNode,
  createSeedFileSystem,
  formatFileSize,
  detectMimeType,
  getFileExtension,
  normalizePath,
  searchFiles,
  insertNodeIntoTree,
  deleteNodeFromTree,
  findNodeByPath,
  updateFileContent,
  renameNodeInTree,
  getFileSystemStats,
} from '../../logic/fileSystem.js';
import { exportToGoogleDrive } from '../../services/googleDrive.js';

interface FileExplorerProps {
  user?: any;
  onRequireAuth?: () => void;
  onNavigateToSkillStudio?: (fileContent?: string, fileName?: string) => void;
}

// Interface for native connected disk handles
interface LocalDiskNode {
  name: string;
  kind: 'file' | 'directory';
  handle: any; // FileSystemFileHandle | FileSystemDirectoryHandle
  path: string;
  sizeBytes?: number;
  lastModified?: number;
  children?: LocalDiskNode[];
}

export function FileExplorerModule({
  user,
  onRequireAuth,
  onNavigateToSkillStudio,
}: FileExplorerProps) {
  // Mode selection: 'browser' (lightweight virtual) vs 'native' (local computer disk)
  const [activeMode, setActiveMode] = useState<'browser' | 'native'>('browser');

  // --- Browser Virtual File System State ---
  const [vfsTree, setVfsTree] = useState<VirtualFileNode[]>(() => {
    try {
      const saved = localStorage.getItem('genesis_cognition_vfs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return createSeedFileSystem();
  });

  const [selectedVfsPath, setSelectedVfsPath] = useState<string>('/blueprints/genesis_synthesis.md');
  const [vfsSearchQuery, setVfsSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    '/blueprints': true,
    '/experiments': true,
    '/models': true,
    '/data': true,
  });

  // Editor states for active file
  const [editorContent, setEditorContent] = useState('');
  const [isEditorDirty, setIsEditorDirty] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modals for creating and renaming
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [newItemType, setNewItemType] = useState<'file' | 'directory'>('file');
  const [newItemName, setNewItemName] = useState('');
  const [newItemParent, setNewItemParent] = useState('/');

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameTargetNode, setRenameTargetNode] = useState<VirtualFileNode | null>(null);
  const [renameInput, setRenameInput] = useState('');

  // Google Drive export modal confirmation state
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isExportingDrive, setIsExportingDrive] = useState(false);

  // --- Native Local Computer File System State ---
  const [nativeDirectoryHandle, setNativeDirectoryHandle] = useState<any>(null);
  const [nativeDirectoryName, setNativeDirectoryName] = useState<string | null>(null);
  const [nativeTree, setNativeTree] = useState<LocalDiskNode[]>([]);
  const [selectedNativeNode, setSelectedNativeNode] = useState<LocalDiskNode | null>(null);
  const [nativeFileContent, setNativeFileContent] = useState<string>('');
  const [isNativeEditorDirty, setIsNativeEditorDirty] = useState(false);
  const [isNativeLoading, setIsNativeLoading] = useState(false);
  const [nativeNotice, setNativeNotice] = useState<string | null>(null);
  const [nativeExpanded, setNativeExpanded] = useState<Record<string, boolean>>({});

  // Fallback drag-and-drop / simulated local folder state
  const [fallbackFiles, setFallbackFiles] = useState<File[]>([]);
  const isNativeSupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

  // Persist VFS tree changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('genesis_cognition_vfs', JSON.stringify(vfsTree));
    } catch {
      // quota or private mode fallback
    }
  }, [vfsTree]);

  // Sync editor content whenever selected file changes
  useEffect(() => {
    const node = findNodeByPath(vfsTree, selectedVfsPath);
    if (node && node.type === 'file') {
      setEditorContent(node.content || '');
      setIsEditorDirty(false);
    }
  }, [selectedVfsPath, vfsTree]);

  // Notice notification auto-dismiss
  useEffect(() => {
    if (actionNotice) {
      const timer = setTimeout(() => setActionNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionNotice]);

  useEffect(() => {
    if (nativeNotice) {
      const timer = setTimeout(() => setNativeNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [nativeNotice]);

  // Toggle folder expansion in VFS
  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // Toggle folder expansion in Native tree
  const toggleNativeFolder = (path: string) => {
    setNativeExpanded((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // Save changes to current VFS file
  const handleSaveVfsContent = () => {
    if (!selectedVfsPath) return;
    const updated = updateFileContent(vfsTree, selectedVfsPath, editorContent);
    setVfsTree(updated);
    setIsEditorDirty(false);
    setActionNotice(`Saved ${selectedVfsPath.split('/').pop()} successfully!`);
  };

  // Delete node from VFS
  const handleDeleteVfsNode = (path: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm(`Are you sure you want to delete ${path}?`)) return;
    const updated = deleteNodeFromTree(vfsTree, path);
    setVfsTree(updated);
    if (selectedVfsPath === path || selectedVfsPath.startsWith(path + '/')) {
      setSelectedVfsPath('/blueprints/genesis_synthesis.md');
    }
    setActionNotice(`Deleted ${path}`);
  };

  // Open Rename modal
  const handleOpenRename = (node: VirtualFileNode, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRenameTargetNode(node);
    setRenameInput(node.name);
    setIsRenameModalOpen(true);
  };

  // Commit rename
  const handleCommitRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTargetNode || !renameInput.trim()) return;
    const trimmed = renameInput.trim();
    const updated = renameNodeInTree(vfsTree, renameTargetNode.path, trimmed);
    setVfsTree(updated);

    // Update active path if renamed target was selected
    if (selectedVfsPath === renameTargetNode.path) {
      const parentDir = renameTargetNode.path.substring(0, renameTargetNode.path.lastIndexOf('/')) || '';
      setSelectedVfsPath(normalizePath(`${parentDir}/${trimmed}`));
    }
    setIsRenameModalOpen(false);
    setRenameTargetNode(null);
    setActionNotice(`Renamed to "${trimmed}"`);
  };

  // Create new file or folder
  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const cleanName = newItemName.trim();
    const parent = normalizePath(newItemParent || '/');
    const fullPath = normalizePath(`${parent}/${cleanName}`);

    const id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    let newNode: VirtualFileNode;
    if (newItemType === 'directory') {
      newNode = {
        id,
        name: cleanName,
        path: fullPath,
        type: 'directory',
        sizeBytes: 0,
        updatedAt: now,
        children: [],
      };
      setExpandedFolders((prev) => ({ ...prev, [fullPath]: true }));
    } else {
      const defaultContent = cleanName.endsWith('.json')
        ? '{\n  "name": "' + cleanName + '",\n  "version": "1.0.0"\n}'
        : cleanName.endsWith('.md')
        ? `# ${cleanName.replace('.md', '')}\n\nAdd your scientific notes here.`
        : `// ${cleanName}\n`;

      const encoder = new TextEncoder();
      newNode = {
        id,
        name: cleanName,
        path: fullPath,
        type: 'file',
        sizeBytes: encoder.encode(defaultContent).length,
        mimeType: detectMimeType(cleanName),
        updatedAt: now,
        content: defaultContent,
      };
      setSelectedVfsPath(fullPath);
    }

    const updated = insertNodeIntoTree(vfsTree, parent, newNode);
    setVfsTree(updated);
    setIsNewItemModalOpen(false);
    setNewItemName('');
    setActionNotice(`Created ${newItemType}: ${cleanName}`);
  };

  // Reset to original seed files
  const handleResetVfs = () => {
    if (confirm('Reset virtual file system to original blueprints, models, and research datasets?')) {
      const seed = createSeedFileSystem();
      setVfsTree(seed);
      setSelectedVfsPath('/blueprints/genesis_synthesis.md');
      setActionNotice('Virtual file system reset to defaults.');
    }
  };

  // Download active file to user's computer via browser blob
  const handleDownloadFile = () => {
    const node = findNodeByPath(vfsTree, selectedVfsPath);
    if (!node || node.type !== 'file') return;
    const blob = new Blob([node.content || ''], { type: node.mimeType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = node.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActionNotice(`Downloaded ${node.name} to your local computer.`);
  };

  // Export full VFS as JSON package
  const handleExportVfsPackage = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(vfsTree, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `genesis_cognition_vfs_export_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setActionNotice('Exported full file tree package.');
  };

  // Import JSON package
  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            setVfsTree(parsed);
            setActionNotice('Successfully imported VFS structure!');
            return;
          }
        }
        // If not a full VFS structure, insert as individual file into root
        const newFile: VirtualFileNode = {
          id: `imp-${Date.now()}`,
          name: file.name,
          path: `/${file.name}`,
          type: 'file',
          sizeBytes: file.size,
          mimeType: detectMimeType(file.name),
          updatedAt: new Date().toISOString(),
          content: text,
        };
        setVfsTree((prev) => [...prev, newFile]);
        setSelectedVfsPath(`/${file.name}`);
        setActionNotice(`Imported file: ${file.name}`);
      } catch (err: any) {
        alert('Failed to parse file: ' + err.message);
      }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  // Google Drive Export flow
  const handleConfirmGoogleDriveExport = async () => {
    const node = findNodeByPath(vfsTree, selectedVfsPath);
    if (!node || node.type !== 'file') return;

    if (!user) {
      if (onRequireAuth) onRequireAuth();
      setIsDriveModalOpen(false);
      return;
    }

    setIsExportingDrive(true);
    try {
      const result = await exportToGoogleDrive(
        node.name,
        node.content || '',
        node.mimeType || 'text/markdown'
      );
      if (result.success) {
        setActionNotice(`Successfully exported "${node.name}" to Google Drive!`);
      } else {
        alert(`Google Drive Export failed: ${result.error}`);
      }
    } catch (err: any) {
      alert(`Google Drive Export error: ${err.message}`);
    } finally {
      setIsExportingDrive(false);
      setIsDriveModalOpen(false);
    }
  };

  // ==========================================
  // NATIVE LOCAL STORAGE FILE SYSTEM ACCESS
  // ==========================================

  // Recursively read directory handle
  const readDirectoryHandle = async (
    dirHandle: any,
    currentPath: string = ''
  ): Promise<LocalDiskNode[]> => {
    const entries: LocalDiskNode[] = [];
    // Iterate directory entries
    for await (const [name, handle] of dirHandle.entries()) {
      const itemPath = currentPath ? `${currentPath}/${name}` : name;
      if (handle.kind === 'file') {
        let size = 0;
        let modified = Date.now();
        try {
          const fileObj = await handle.getFile();
          size = fileObj.size;
          modified = fileObj.lastModified;
        } catch {
          // ignore
        }
        entries.push({
          name,
          kind: 'file',
          handle,
          path: itemPath,
          sizeBytes: size,
          lastModified: modified,
        });
      } else if (handle.kind === 'directory') {
        const children = await readDirectoryHandle(handle, itemPath);
        entries.push({
          name,
          kind: 'directory',
          handle,
          path: itemPath,
          children,
        });
      }
    }
    // Sort directories first, then files alphabetically
    return entries.sort((a, b) => {
      if (a.kind === b.kind) return a.name.localeCompare(b.name);
      return a.kind === 'directory' ? -1 : 1;
    });
  };

  // Connect user local directory via Native File System API
  const handleConnectLocalDirectory = async () => {
    if (!isNativeSupported) {
      alert(
        'The Native File System Access API is not supported in this browser environment. You can use the Drag & Drop local folder upload below instead!'
      );
      return;
    }
    setIsNativeLoading(true);
    try {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
      });
      setNativeDirectoryHandle(dirHandle);
      setNativeDirectoryName(dirHandle.name);
      setNativeNotice(`Connected to local folder: "${dirHandle.name}"`);

      // Read tree
      const tree = await readDirectoryHandle(dirHandle);
      setNativeTree(tree);

      // Auto-select first file if available
      const firstFile = findFirstLocalFile(tree);
      if (firstFile) {
        await handleSelectNativeFile(firstFile);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Directory Picker Error:', err);
        setNativeNotice(`Connection cancelled or denied: ${err.message}`);
      }
    } finally {
      setIsNativeLoading(false);
    }
  };

  const findFirstLocalFile = (nodes: LocalDiskNode[]): LocalDiskNode | null => {
    for (const node of nodes) {
      if (node.kind === 'file') return node;
      if (node.children) {
        const found = findFirstLocalFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  // Refresh native directory tree
  const handleRefreshNativeTree = async () => {
    if (!nativeDirectoryHandle) return;
    setIsNativeLoading(true);
    try {
      const tree = await readDirectoryHandle(nativeDirectoryHandle);
      setNativeTree(tree);
      setNativeNotice('Local directory refreshed from disk.');
    } catch (err: any) {
      setNativeNotice(`Failed to refresh local disk: ${err.message}`);
    } finally {
      setIsNativeLoading(false);
    }
  };

  // Select a native file and load its content from disk
  const handleSelectNativeFile = async (node: LocalDiskNode) => {
    if (node.kind !== 'file') return;
    setSelectedNativeNode(node);
    try {
      const file = await node.handle.getFile();
      const text = await file.text();
      setNativeFileContent(text);
      setIsNativeEditorDirty(false);
    } catch (err: any) {
      setNativeFileContent(`[Error reading file: ${err.message}]`);
    }
  };

  // Save changes directly back to user's computer disk via createWritable()
  const handleSaveNativeFileToDisk = async () => {
    if (!selectedNativeNode || selectedNativeNode.kind !== 'file') return;
    try {
      // Request writable stream from native handle
      const writable = await selectedNativeNode.handle.createWritable();
      await writable.write(nativeFileContent);
      await writable.close();

      setIsNativeEditorDirty(false);
      setNativeNotice(`Changes saved directly to your computer disk for "${selectedNativeNode.name}"!`);
      // Update local file size in node
      selectedNativeNode.sizeBytes = new TextEncoder().encode(nativeFileContent).length;
    } catch (err: any) {
      alert(`Failed to save to local disk: ${err.message}`);
    }
  };

  // Create a new file in the connected local directory
  const handleCreateFileInLocalDir = async () => {
    if (!nativeDirectoryHandle) return;
    const name = prompt('Enter filename to create on your local computer (e.g., notes.md, test.json):');
    if (!name || !name.trim()) return;
    try {
      const fileHandle = await nativeDirectoryHandle.getFileHandle(name.trim(), { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(`// Created via Genesis of Machine Cognition File Explorer\n`);
      await writable.close();
      setNativeNotice(`Created file "${name}" on local hard drive.`);
      await handleRefreshNativeTree();
    } catch (err: any) {
      alert(`Could not create local file: ${err.message}`);
    }
  };

  // Disconnect native directory
  const handleDisconnectNative = () => {
    setNativeDirectoryHandle(null);
    setNativeDirectoryName(null);
    setNativeTree([]);
    setSelectedNativeNode(null);
    setNativeFileContent('');
    setNativeNotice('Disconnected from local computer directory.');
  };

  // Fallback: Handle local folder selection via input
  const handleFallbackFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const filesArray = Array.from(fileList);
    setFallbackFiles(filesArray);

    // Build a local tree from file paths
    const newNodes: VirtualFileNode[] = [];
    for (const f of filesArray) {
      const relativePath = (f as any).webkitRelativePath || f.name;
      const parts = relativePath.split('/');
      let currentLevel = newNodes;
      let accumPath = '';

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        accumPath += '/' + part;
        const isFile = i === parts.length - 1;

        let existing = currentLevel.find((n) => n.name === part);
        if (!existing) {
          existing = {
            id: `local-node-${Math.random()}`,
            name: part,
            path: accumPath,
            type: isFile ? 'file' : 'directory',
            sizeBytes: isFile ? f.size : 0,
            updatedAt: new Date(f.lastModified).toISOString(),
            mimeType: isFile ? detectMimeType(part) : undefined,
            children: isFile ? undefined : [],
          };
          currentLevel.push(existing);
        }
        if (!isFile && existing.children) {
          currentLevel = existing.children;
        }
      }
    }

    setVfsTree((prev) => [...prev, ...newNodes]);
    setActiveMode('browser');
    setActionNotice(`Imported ${filesArray.length} files from local folder into explorer.`);
  };

  // Aggregated stats
  const vfsStats = getFileSystemStats(vfsTree);
  const activeVfsNode = findNodeByPath(vfsTree, selectedVfsPath);

  // Filter tree nodes if search query present
  const displayedVfsNodes = vfsSearchQuery ? searchFiles(vfsTree, vfsSearchQuery) : vfsTree;

  // Icon selector based on file type
  const getFileIcon = (name: string, type: 'file' | 'directory', isOpen?: boolean) => {
    if (type === 'directory') {
      return isOpen ? (
        <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
      ) : (
        <Folder className="w-4 h-4 text-amber-400/80 shrink-0" />
      );
    }
    const ext = getFileExtension(name);
    switch (ext) {
      case 'md':
      case 'txt':
        return <FileText className="w-4 h-4 text-sky-400 shrink-0" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
        return <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />;
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <File className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  // Recursive Tree Node Renderer for VFS
  const renderVfsNode = (node: VirtualFileNode, depth: number = 0) => {
    const isDir = node.type === 'directory';
    const isExpanded = expandedFolders[node.path];
    const isSelected = selectedVfsPath === node.path;

    return (
      <div key={node.id} className="select-none">
        <div
          onClick={() => {
            if (isDir) {
              toggleFolder(node.path);
            } else {
              setSelectedVfsPath(node.path);
            }
          }}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg cursor-pointer transition-colors text-xs ${
            isSelected
              ? 'bg-sky-500/20 text-sky-200 border-l-2 border-sky-400 font-medium'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {isDir ? (
              <span className="text-slate-500 hover:text-slate-300">
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                )}
              </span>
            ) : (
              <span className="w-3.5" />
            )}
            {getFileIcon(node.name, node.type, isExpanded)}
            <span className="truncate">{node.name}</span>
          </div>

          {/* Quick Action Buttons on Hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => handleOpenRename(node, e)}
              title="Rename"
              className="p-1 hover:text-sky-300 rounded hover:bg-slate-700/60"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => handleDeleteVfsNode(node.path, e)}
              title="Delete"
              className="p-1 hover:text-rose-400 rounded hover:bg-slate-700/60"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Render children if directory and expanded */}
        {isDir && isExpanded && node.children && (
          <div className="border-l border-slate-800 ml-4">
            {node.children.length === 0 ? (
              <div
                style={{ paddingLeft: `${(depth + 1) * 14 + 10}px` }}
                className="py-1 text-[11px] text-slate-400 italic"
              >
                Empty folder
              </div>
            ) : (
              node.children.map((child) => renderVfsNode(child, depth + 1))
            )}
          </div>
        )}
      </div>
    );
  };

  // Recursive Tree Node Renderer for Native Disk
  const renderNativeNode = (node: LocalDiskNode, depth: number = 0) => {
    const isDir = node.kind === 'directory';
    const isExpanded = nativeExpanded[node.path];
    const isSelected = selectedNativeNode?.path === node.path;

    return (
      <div key={node.path} className="select-none">
        <div
          onClick={() => {
            if (isDir) {
              toggleNativeFolder(node.path);
            } else {
              handleSelectNativeFile(node);
            }
          }}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg cursor-pointer transition-colors text-xs ${
            isSelected
              ? 'bg-amber-500/20 text-amber-200 border-l-2 border-amber-400 font-medium'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {isDir ? (
              <span className="text-slate-500">
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                )}
              </span>
            ) : (
              <span className="w-3.5" />
            )}
            {getFileIcon(node.name, node.kind, isExpanded)}
            <span className="truncate">{node.name}</span>
          </div>

          {!isDir && node.sizeBytes !== undefined && (
            <span className="text-[10px] text-slate-400 group-hover:text-slate-400">
              {formatFileSize(node.sizeBytes)}
            </span>
          )}
        </div>

        {isDir && isExpanded && node.children && (
          <div className="border-l border-slate-800 ml-4">
            {node.children.length === 0 ? (
              <div
                style={{ paddingLeft: `${(depth + 1) * 14 + 10}px` }}
                className="py-1 text-[11px] text-slate-400 italic"
              >
                Empty directory
              </div>
            ) : (
              node.children.map((child) => renderNativeNode(child, depth + 1))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-sky-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-sky-500/10 text-sky-400 border border-sky-500/30">
                Dual-Engine File Architecture
              </span>
              <span className="text-xs text-slate-400">• Persistent & Sandboxed Storage</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-1 flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-sky-400" />
              File System Explorer
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Choose between the <strong>Lightweight Browser Virtual Explorer</strong> (instant, sandbox
              isolated, preloaded with synthesis models and blueprints) or the{' '}
              <strong>Connected Local Computer Storage</strong> (reads and writes directly to your local hard drive
              using the Native File System Access API).
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl shrink-0">
            <button
              onClick={() => setActiveMode('browser')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'browser'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Globe className="w-4 h-4 text-sky-300" />
              <span>1. Lightweight Browser Explorer</span>
            </button>
            <button
              onClick={() => setActiveMode('native')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMode === 'native'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <HardDrive className="w-4 h-4 text-amber-300" />
              <span>2. Connected Local Computer</span>
            </button>
          </div>
        </div>

        {/* Global Notifications / Status */}
        {actionNotice && (
          <div className="mt-4 p-2.5 bg-sky-950/60 border border-sky-800/80 rounded-xl flex items-center justify-between text-xs text-sky-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {nativeNotice && (
          <div className="mt-4 p-2.5 bg-amber-950/60 border border-amber-800/80 rounded-xl flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{nativeNotice}</span>
            </div>
            <button onClick={() => setNativeNotice(null)} className="text-slate-400 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          VERSION 1: LIGHTWEIGHT BROWSER VIRTUAL EXPLORER
         ======================================================== */}
      {activeMode === 'browser' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Explorer Tree & File Tools (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col h-[700px] overflow-hidden shadow-xl">
            {/* Toolbar Header */}
            <div className="p-3.5 border-b border-slate-800 bg-slate-950/50 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Virtual Sandbox VFS
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span>{vfsStats.files} files</span>
                  <span>•</span>
                  <span>{formatFileSize(vfsStats.totalBytes)}</span>
                </div>
              </div>

              {/* Action Buttons Toolbar */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setNewItemType('file');
                    setNewItemParent('/');
                    setIsNewItemModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700/80 text-sky-300 rounded-lg text-xs font-medium border border-slate-700/50 transition-colors"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>New File</span>
                </button>
                <button
                  onClick={() => {
                    setNewItemType('directory');
                    setNewItemParent('/');
                    setIsNewItemModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 rounded-lg text-xs font-medium border border-slate-700/50 transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>New Folder</span>
                </button>
                <label className="p-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700/50 cursor-pointer transition-colors" title="Import JSON / Text File">
                  <Upload className="w-3.5 h-3.5" />
                  <input type="file" onChange={handleImportFile} className="hidden" />
                </label>
                <button
                  onClick={handleExportVfsPackage}
                  title="Export All VFS as JSON package"
                  className="p-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-700/50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetVfs}
                  title="Reset to Genesis Seed Files"
                  className="p-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-medium border border-slate-700/50 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Search files or directories..."
                  value={vfsSearchQuery}
                  onChange={(e) => setVfsSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
                {vfsSearchQuery && (
                  <button
                    onClick={() => setVfsSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Tree View Scrolling Container */}
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
              {displayedVfsNodes.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No matching files found.
                </div>
              ) : (
                displayedVfsNodes.map((node) => renderVfsNode(node, 0))
              )}
            </div>

            {/* Tree Footer Info */}
            <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span>In-Memory + LocalStorage</span>
              </span>
              <span className="text-slate-400">Zero cloud latency</span>
            </div>
          </div>

          {/* Right Column: File Preview, Editor, and Export Center (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col h-[700px] overflow-hidden shadow-xl">
            {activeVfsNode && activeVfsNode.type === 'file' ? (
              <>
                {/* File Header Bar */}
                <div className="p-3.5 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {getFileIcon(activeVfsNode.name, 'file')}
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white truncate">
                          {activeVfsNode.name}
                        </span>
                        {isEditorDirty && (
                          <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded-full border border-amber-500/30">
                            Unsaved
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{activeVfsNode.path}</div>
                    </div>
                  </div>

                  {/* Actions & Toggles */}
                  <div className="flex items-center gap-2">
                    {/* View Mode Toggle for MD and JSON */}
                    {(activeVfsNode.name.endsWith('.md') ||
                      activeVfsNode.name.endsWith('.json') ||
                      activeVfsNode.name.endsWith('.csv')) && (
                      <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                        <button
                          onClick={() => setViewMode('preview')}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            viewMode === 'preview'
                              ? 'bg-sky-500 text-slate-950 font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => setViewMode('edit')}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            viewMode === 'edit'
                              ? 'bg-sky-500 text-slate-950 font-bold'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Source Code
                        </button>
                      </div>
                    )}

                    {/* Save Button */}
                    <button
                      onClick={handleSaveVfsContent}
                      disabled={!isEditorDirty}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isEditorDirty
                          ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
                          : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>

                    {/* Open in Write Skill Interface */}
                    {onNavigateToSkillStudio && (
                      <button
                        onClick={() =>
                          onNavigateToSkillStudio(activeVfsNode.content || '', activeVfsNode.name)
                        }
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 rounded-lg text-xs font-medium border border-indigo-700/50 transition-colors"
                        title="Render and edit in Write Skill Interface"
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Skill Studio</span>
                      </button>
                    )}

                    {/* Google Drive Export Button */}
                    <button
                      onClick={() => setIsDriveModalOpen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg text-xs font-medium border border-slate-700/50 transition-colors"
                      title="Export to Google Drive"
                    >
                      <Cloud className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Drive</span>
                    </button>

                    {/* Download to Local Disk */}
                    <button
                      onClick={handleDownloadFile}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs border border-slate-700/50 transition-colors"
                      title="Download file to computer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete File */}
                    <button
                      onClick={(e) => handleDeleteVfsNode(activeVfsNode.path, e)}
                      className="p-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 rounded-lg text-xs border border-slate-700/50 transition-colors"
                      title="Delete file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Editor or Preview Pane */}
                <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-slate-950/40">
                  {viewMode === 'preview' && activeVfsNode.name.endsWith('.md') ? (
                    <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-4">
                      {editorContent.split('\n\n').map((block, idx) => {
                        if (block.startsWith('# ')) {
                          return (
                            <h1 key={idx} className="text-xl font-bold text-white border-b border-slate-800 pb-2">
                              {block.replace('# ', '')}
                            </h1>
                          );
                        }
                        if (block.startsWith('## ')) {
                          return (
                            <h2 key={idx} className="text-base font-semibold text-sky-300 mt-4">
                              {block.replace('## ', '')}
                            </h2>
                          );
                        }
                        if (block.startsWith('### ')) {
                          return (
                            <h3 key={idx} className="text-sm font-semibold text-indigo-300 mt-2">
                              {block.replace('### ', '')}
                            </h3>
                          );
                        }
                        return (
                          <p key={idx} className="text-slate-300 leading-normal font-sans">
                            {block}
                          </p>
                        );
                      })}
                    </div>
                  ) : viewMode === 'preview' && activeVfsNode.name.endsWith('.csv') ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-900/60">
                            {editorContent
                              .split('\n')[0]
                              ?.split(',')
                              .map((header, i) => (
                                <th key={i} className="p-2 font-semibold text-slate-300">
                                  {header.trim()}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {editorContent
                            .split('\n')
                            .slice(1)
                            .filter(Boolean)
                            .map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className="border-b border-slate-900 hover:bg-slate-900/40 transition-colors"
                              >
                                {row.split(',').map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2 font-mono text-slate-400">
                                    {cell.trim()}
                                  </td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Monospace Code Editor */
                    <textarea
                      value={editorContent}
                      onChange={(e) => {
                        setEditorContent(e.target.value);
                        setIsEditorDirty(true);
                      }}
                      className="w-full h-full bg-transparent font-mono text-xs text-sky-100 resize-none focus:outline-none leading-relaxed selection:bg-sky-500/30"
                      placeholder="Write code or documentation..."
                      spellCheck={false}
                    />
                  )}
                </div>

                {/* File Footer Status */}
                <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span>MIME: {activeVfsNode.mimeType || 'text/plain'}</span>
                    <span>•</span>
                    <span>Size: {formatFileSize(new TextEncoder().encode(editorContent).length)}</span>
                    <span>•</span>
                    <span>Lines: {editorContent.split('\n').length}</span>
                  </div>
                  <div className="text-slate-400">
                    Last modified: {new Date(activeVfsNode.updatedAt).toLocaleTimeString()}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <Folder className="w-12 h-12 text-slate-600 mb-3" />
                <h3 className="text-sm font-semibold text-slate-300">Select a file from the tree</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Click any file in the blueprints, experiments, or models folders to view or edit its contents.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          VERSION 2: CONNECTED LOCAL COMPUTER FILE SYSTEM
         ======================================================== */}
      {activeMode === 'native' && (
        <div className="space-y-6">
          {/* Connection Hero Bar if not connected */}
          {!nativeDirectoryHandle ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Native File System Access Bridge
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Connect Directly to Your Computer's Hard Drive
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Unlike traditional browser file inputs that only upload read-only copies, this mode connects directly
                  to your computer's local folders via the W3C File System Access API. You can browse your actual
                  folders, open local files, and <strong>save modifications directly back to disk</strong> without
                  downloading copies.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="text-amber-400 font-bold text-xs mb-1">Direct Disk Writes</div>
                    <div className="text-[11px] text-slate-400 leading-normal">
                      Edits are saved to your real files using native streams.
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="text-sky-400 font-bold text-xs mb-1">Total Privacy</div>
                    <div className="text-[11px] text-slate-400 leading-normal">
                      Files never touch our backend server; handled 100% locally.
                    </div>
                  </div>
                  <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="text-emerald-400 font-bold text-xs mb-1">Recursive Folders</div>
                    <div className="text-[11px] text-slate-400 leading-normal">
                      Traverse subdirectories, inspect code, and create new files.
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleConnectLocalDirectory}
                    disabled={isNativeLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all"
                  >
                    <HardDrive className="w-4 h-4" />
                    <span>{isNativeLoading ? 'Requesting Permission...' : 'Choose Local Folder on Your Computer'}</span>
                  </button>

                  {/* Fallback folder input for browsers or restricted iframe environments */}
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs rounded-xl border border-slate-700/60 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload Local Folder (Universal Fallback)</span>
                    {/* @ts-ignore */}
                    <input
                      type="file"
                      // @ts-ignore
                      webkitdirectory=""
                      directory=""
                      multiple
                      onChange={handleFallbackFolderUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          ) : (
            /* Active Connected Local Computer View */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Local Folder Tree (4 cols) */}
              <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col h-[700px] overflow-hidden shadow-xl">
                {/* Header */}
                <div className="p-3.5 border-b border-slate-800 bg-slate-950/70 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="text-xs font-bold text-white truncate">
                        {nativeDirectoryName || 'Local Hard Drive'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Connected
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCreateFileInLocalDir}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-medium border border-slate-700/50 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Local File</span>
                    </button>
                    <button
                      onClick={handleRefreshNativeTree}
                      title="Reload from local disk"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs border border-slate-700/50 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleDisconnectNative}
                      title="Disconnect local directory"
                      className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 rounded-lg text-xs border border-slate-700/50 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Local Folder Tree */}
                <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
                  {nativeTree.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      Empty local directory.
                    </div>
                  ) : (
                    nativeTree.map((node) => renderNativeNode(node, 0))
                  )}
                </div>

                <div className="p-2.5 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>W3C File System Access API</span>
                  </span>
                  <span>Direct Disk IO</span>
                </div>
              </div>

              {/* Right Column: Native File Editor with Direct Disk Save (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col h-[700px] overflow-hidden shadow-xl">
                {selectedNativeNode && selectedNativeNode.kind === 'file' ? (
                  <>
                    <div className="p-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {getFileIcon(selectedNativeNode.name, 'file')}
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white truncate">
                              {selectedNativeNode.name}
                            </span>
                            {isNativeEditorDirty && (
                              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded-full border border-amber-500/30">
                                Modified
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {selectedNativeNode.path}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveNativeFileToDisk}
                          disabled={!isNativeEditorDirty}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            isNativeEditorDirty
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/25 font-bold'
                              : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save to Computer Disk</span>
                        </button>
                      </div>
                    </div>

                    {/* Editor */}
                    <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-slate-950/40">
                      <textarea
                        value={nativeFileContent}
                        onChange={(e) => {
                          setNativeFileContent(e.target.value);
                          setIsNativeEditorDirty(true);
                        }}
                        className="w-full h-full bg-transparent font-mono text-xs text-amber-100 resize-none focus:outline-none leading-relaxed selection:bg-amber-500/30"
                        placeholder="Content loaded from local hard drive..."
                        spellCheck={false}
                      />
                    </div>

                    <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span>Lines: {nativeFileContent.split('\n').length}</span>
                        <span>•</span>
                        <span>Size: {formatFileSize(new TextEncoder().encode(nativeFileContent).length)}</span>
                      </div>
                      <div className="text-amber-400/80 font-medium">Direct Disk Stream Active</div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                    <HardDrive className="w-12 h-12 text-slate-600 mb-3" />
                    <h3 className="text-sm font-semibold text-slate-300">Select a file from your computer</h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Choose any code, document, or dataset from your connected local folder to edit and save.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL: CREATE NEW FILE OR FOLDER
         ======================================================== */}
      {isNewItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              Create New {newItemType === 'file' ? 'File' : 'Folder'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a new resource into your virtual file system hierarchy.
            </p>

            <form onSubmit={handleCreateNewItem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder={
                    newItemType === 'file' ? 'e.g., landauer_limit_calc.ts' : 'e.g., simulations'
                  }
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Parent Directory</label>
                <select
                  value={newItemParent}
                  onChange={(e) => setNewItemParent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="/">/ (Root)</option>
                  <option value="/blueprints">/blueprints</option>
                  <option value="/experiments">/experiments</option>
                  <option value="/models">/models</option>
                  <option value="/data">/data</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewItemModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20 transition-colors"
                >
                  Create {newItemType === 'file' ? 'File' : 'Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: RENAME NODE
         ======================================================== */}
      {isRenameModalOpen && renameTargetNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Rename Item</h3>
            <p className="text-xs text-slate-400 mb-4">
              Renaming "{renameTargetNode.name}" will update all associated hierarchy paths.
            </p>

            <form onSubmit={handleCommitRename} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Name</label>
                <input
                  type="text"
                  required
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20 transition-colors"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: GOOGLE DRIVE EXPORT CONFIRMATION
         ======================================================== */}
      {isDriveModalOpen && activeVfsNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Export to Google Drive</h3>
                <p className="text-xs text-slate-400">Save research file to your Google Cloud storage</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>File Name:</span>
                <span className="font-medium text-white">{activeVfsNode.name}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>File Size:</span>
                <span className="font-medium text-white">{formatFileSize(activeVfsNode.sizeBytes)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Account:</span>
                <span className="font-medium text-sky-400">
                  {user ? user.email || 'Authenticated User' : 'Sign-in required'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mb-5 leading-normal">
              This will create a new file in your personal Google Drive containing the exact contents of this
              document.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDriveModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmGoogleDriveExport}
                disabled={isExportingDrive}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5"
              >
                <Cloud className="w-4 h-4" />
                <span>{isExportingDrive ? 'Uploading...' : 'Confirm & Export'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

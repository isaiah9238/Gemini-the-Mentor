/**
 * Virtual and Local File System Utilities
 * Manages hierarchical nodes, path normalization, search, and MIME detection.
 */

export interface VirtualFileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  sizeBytes: number;
  updatedAt: string;
  content?: string;
  mimeType?: string;
  children?: VirtualFileNode[];
}

export function normalizePath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return '/' + parts.join('/');
}

export function getFileExtension(name: string): string {
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function detectMimeType(fileName: string): string {
  const ext = getFileExtension(fileName);
  switch (ext) {
    case 'md':
    case 'markdown':
      return 'text/markdown';
    case 'json':
      return 'application/json';
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return 'text/javascript';
    case 'csv':
      return 'text/csv';
    case 'txt':
    case 'log':
      return 'text/plain';
    case 'html':
      return 'text/html';
    default:
      return 'application/octet-stream';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Creates an empty initial file tree for the lightweight browser design
 */
export function createSeedFileSystem(): VirtualFileNode[] {
  return [
    {
      id: 'root-blueprints',
      name: 'blueprints',
      path: '/blueprints',
      type: 'directory',
      sizeBytes: 0,
      updatedAt: new Date().toISOString(),
      children: [
        {
          id: 'bp-genesis',
          name: 'genesis_synthesis.md',
          path: '/blueprints/genesis_synthesis.md',
          type: 'file',
          sizeBytes: 2450,
          mimeType: 'text/markdown',
          updatedAt: new Date().toISOString(),
          content: `# The Genesis of Machine Cognition: Complete Architecture
From nanoscale silicon current modulation to emergent Theory of Mind in LLMs and biophysical ion dynamics.`,
        },
        {
          id: 'bp-landauer',
          name: 'landauer_thermodynamics.md',
          path: '/blueprints/landauer_thermodynamics.md',
          type: 'file',
          sizeBytes: 1180,
          mimeType: 'text/markdown',
          updatedAt: new Date().toISOString(),
          content: `# Landauer Thermodynamic Limit Derivation
ΔQ = k_B * T * ln(2)
Minimum dissipation for irreversible erasure: ~0.018 eV at 300K.`,
        },
      ],
    },
    {
      id: 'root-experiments',
      name: 'experiments',
      path: '/experiments',
      type: 'directory',
      sizeBytes: 0,
      updatedAt: new Date().toISOString(),
      children: [
        {
          id: 'exp-mosfet',
          name: 'mosfet_sim_14nm.json',
          path: '/experiments/mosfet_sim_14nm.json',
          type: 'file',
          sizeBytes: 840,
          mimeType: 'application/json',
          updatedAt: new Date().toISOString(),
          content: JSON.stringify(
            {
              experiment: 'MOSFET Inversion Channel',
              gateVoltage: 1.2,
              thresholdVoltage: 0.7,
              transconductance: '2.4 mS/um',
              status: 'Conducting',
            },
            null,
            2
          ),
        },
        {
          id: 'exp-sparks',
          name: 'sparks_egg_stack_stability.json',
          path: '/experiments/sparks_egg_stack_stability.json',
          type: 'file',
          sizeBytes: 620,
          mimeType: 'application/json',
          updatedAt: new Date().toISOString(),
          content: JSON.stringify(
            {
              benchmark: 'Sparks of AGI 5-Object Vertical Stack',
              components: ['Hardcover Book', '9 Eggs 3x3', 'Laptop', 'Empty Bottle', 'Steel Nail'],
              stabilityEquilibrium: true,
              torqueOffset: 0.0,
            },
            null,
            2
          ),
        },
      ],
    },
    {
      id: 'root-models',
      name: 'models',
      path: '/models',
      type: 'directory',
      sizeBytes: 0,
      updatedAt: new Date().toISOString(),
      children: [
        {
          id: 'mod-mcp',
          name: 'mcculloch_pitts_xor.ts',
          path: '/models/mcculloch_pitts_xor.ts',
          type: 'file',
          sizeBytes: 1420,
          mimeType: 'text/javascript',
          updatedAt: new Date().toISOString(),
          content: `// McCulloch-Pitts (1943) 2-layer XOR logic
export function evaluateXor(a: number, b: number) {
  const n1 = (a === 1 && b === 0) ? 1 : 0;
  const n2 = (b === 1 && a === 0) ? 1 : 0;
  return (n1 + n2 >= 1) ? 1 : 0;
}`,
        },
      ],
    },
    {
      id: 'root-data',
      name: 'data',
      path: '/data',
      type: 'directory',
      sizeBytes: 0,
      updatedAt: new Date().toISOString(),
      children: [
        {
          id: 'dat-action-potential',
          name: 'action_potential_samples.csv',
          path: '/data/action_potential_samples.csv',
          type: 'file',
          sizeBytes: 450,
          mimeType: 'text/csv',
          updatedAt: new Date().toISOString(),
          content: `time_ms,potential_mv,na_gate,k_gate,phase
0.0,-70.0,0.05,0.10,resting
0.5,-55.0,0.30,0.10,threshold
1.2,35.0,1.00,0.30,depolarization
2.2,-80.0,0.05,0.80,repolarization
3.2,-70.0,0.05,0.10,recovery`,
        },
      ],
    },
  ];
}

/**
 * Searches a tree of nodes for files matching a keyword
 */
export function searchFiles(nodes: VirtualFileNode[], keyword: string): VirtualFileNode[] {
  const results: VirtualFileNode[] = [];
  const lower = keyword.toLowerCase().trim();
  if (!lower) return results;

  function traverse(list: VirtualFileNode[]) {
    for (const node of list) {
      if (node.name.toLowerCase().includes(lower) || node.path.toLowerCase().includes(lower)) {
        results.push(node);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  }

  traverse(nodes);
  return results;
}

/**
 * Adds a new file or directory into the hierarchical structure
 */
export function insertNodeIntoTree(
  tree: VirtualFileNode[],
  parentPath: string,
  newNode: VirtualFileNode
): VirtualFileNode[] {
  const normalizedParent = normalizePath(parentPath);
  if (normalizedParent === '/' || normalizedParent === '') {
    return [...tree, newNode];
  }

  return tree.map((node) => {
    if (node.path === normalizedParent && node.type === 'directory') {
      const existing = node.children || [];
      return {
        ...node,
        children: [...existing, newNode],
      };
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: insertNodeIntoTree(node.children, normalizedParent, newNode),
      };
    }
    return node;
  });
}

/**
 * Deletes a node by its path
 */
export function deleteNodeFromTree(tree: VirtualFileNode[], targetPath: string): VirtualFileNode[] {
  return tree
    .filter((node) => node.path !== targetPath)
    .map((node) => {
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: deleteNodeFromTree(node.children, targetPath),
        };
      }
      return node;
    });
}

/**
 * Finds a node by its path
 */
export function findNodeByPath(tree: VirtualFileNode[], targetPath: string): VirtualFileNode | null {
  const norm = normalizePath(targetPath);
  for (const node of tree) {
    if (normalizePath(node.path) === norm) return node;
    if (node.children && node.children.length > 0) {
      const found = findNodeByPath(node.children, norm);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Updates a file's content and recalculates its byte size and timestamp
 */
export function updateFileContent(
  tree: VirtualFileNode[],
  targetPath: string,
  newContent: string
): VirtualFileNode[] {
  const norm = normalizePath(targetPath);
  return tree.map((node) => {
    if (normalizePath(node.path) === norm && node.type === 'file') {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(newContent).length;
      return {
        ...node,
        content: newContent,
        sizeBytes: bytes,
        updatedAt: new Date().toISOString(),
      };
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: updateFileContent(node.children, norm, newContent),
      };
    }
    return node;
  });
}

/**
 * Renames a node in the tree and updates its path and children's paths
 */
export function renameNodeInTree(
  tree: VirtualFileNode[],
  targetPath: string,
  newName: string
): VirtualFileNode[] {
  const norm = normalizePath(targetPath);

  function updatePathsRecursively(node: VirtualFileNode, newParentPath: string): VirtualFileNode {
    const updatedPath = normalizePath(`${newParentPath}/${node.name}`);
    return {
      ...node,
      path: updatedPath,
      children: node.children ? node.children.map((c) => updatePathsRecursively(c, updatedPath)) : undefined,
    };
  }

  return tree.map((node) => {
    if (normalizePath(node.path) === norm) {
      const parentDir = norm.substring(0, norm.lastIndexOf('/')) || '';
      const newPath = normalizePath(`${parentDir}/${newName}`);
      const updatedMime = node.type === 'file' ? detectMimeType(newName) : undefined;
      return {
        ...node,
        name: newName,
        path: newPath,
        mimeType: updatedMime,
        updatedAt: new Date().toISOString(),
        children: node.children
          ? node.children.map((child) => updatePathsRecursively(child, newPath))
          : undefined,
      };
    }
    if (node.children && node.children.length > 0) {
      return {
        ...node,
        children: renameNodeInTree(node.children, norm, newName),
      };
    }
    return node;
  });
}

/**
 * Computes tree statistics: total files, folders, and total size
 */
export function getFileSystemStats(tree: VirtualFileNode[]): {
  files: number;
  folders: number;
  totalBytes: number;
} {
  let files = 0;
  let folders = 0;
  let totalBytes = 0;

  function walk(nodes: VirtualFileNode[]) {
    for (const node of nodes) {
      if (node.type === 'file') {
        files += 1;
        totalBytes += node.sizeBytes;
      } else {
        folders += 1;
      }
      if (node.children && node.children.length > 0) {
        walk(node.children);
      }
    }
  }

  walk(tree);
  return { files, folders, totalBytes };
}

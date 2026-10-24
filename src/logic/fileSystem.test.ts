import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePath,
  getFileExtension,
  detectMimeType,
  formatFileSize,
  createSeedFileSystem,
  searchFiles,
  insertNodeIntoTree,
  deleteNodeFromTree,
  findNodeByPath,
  updateFileContent,
  renameNodeInTree,
  getFileSystemStats,
  VirtualFileNode,
} from './fileSystem.js';

test('normalizePath trims multiple and trailing slashes correctly', () => {
  assert.equal(normalizePath('/blueprints//genesis/'), '/blueprints/genesis');
  assert.equal(normalizePath('experiments/data'), '/experiments/data');
  assert.equal(normalizePath('/'), '/');
});

test('getFileExtension extracts extension or returns empty', () => {
  assert.equal(getFileExtension('file.spec.ts'), 'ts');
  assert.equal(getFileExtension('README.MD'), 'md');
  assert.equal(getFileExtension('Makefile'), '');
});

test('detectMimeType maps standard extensions to correct MIME types', () => {
  assert.equal(detectMimeType('notes.md'), 'text/markdown');
  assert.equal(detectMimeType('data.json'), 'application/json');
  assert.equal(detectMimeType('script.ts'), 'text/javascript');
  assert.equal(detectMimeType('samples.csv'), 'text/csv');
  assert.equal(detectMimeType('unknown.xyz'), 'application/octet-stream');
});

test('formatFileSize formats B, KB, and MB appropriately', () => {
  assert.equal(formatFileSize(512), '512 B');
  assert.equal(formatFileSize(2048), '2.0 KB');
  assert.equal(formatFileSize(2 * 1024 * 1024), '2.0 MB');
});

test('createSeedFileSystem yields valid initial directory nodes', () => {
  const seed = createSeedFileSystem();
  assert.ok(seed.length >= 4);
  const blueprints = seed.find((n) => n.name === 'blueprints');
  assert.ok(blueprints);
  assert.equal(blueprints?.type, 'directory');
  assert.ok((blueprints?.children?.length || 0) >= 2);
});

test('searchFiles returns matching nodes across directory hierarchy', () => {
  const seed = createSeedFileSystem();
  const searchMosfet = searchFiles(seed, 'mosfet');
  assert.equal(searchMosfet.length, 1);
  assert.equal(searchMosfet[0].name, 'mosfet_sim_14nm.json');

  const searchMd = searchFiles(seed, '.md');
  assert.ok(searchMd.length >= 2);
});

test('insertNodeIntoTree adds node into target directory or root', () => {
  const seed = createSeedFileSystem();
  const newFile: VirtualFileNode = {
    id: 'test-new-file',
    name: 'test_experiment.json',
    path: '/experiments/test_experiment.json',
    type: 'file',
    sizeBytes: 120,
    updatedAt: new Date().toISOString(),
    content: '{"tested": true}',
  };

  const updatedTree = insertNodeIntoTree(seed, '/experiments', newFile);
  const found = findNodeByPath(updatedTree, '/experiments/test_experiment.json');
  assert.ok(found);
  assert.equal(found?.name, 'test_experiment.json');
  assert.equal(found?.content, '{"tested": true}');
});

test('deleteNodeFromTree removes targeted node cleanly', () => {
  const seed = createSeedFileSystem();
  const treeWithDeleted = deleteNodeFromTree(seed, '/blueprints/landauer_thermodynamics.md');
  const found = findNodeByPath(treeWithDeleted, '/blueprints/landauer_thermodynamics.md');
  assert.equal(found, null);
  // Ensure other files remain untouched
  const genesis = findNodeByPath(treeWithDeleted, '/blueprints/genesis_synthesis.md');
  assert.ok(genesis);
});

test('updateFileContent updates text content and recalculates byte length', () => {
  const seed = createSeedFileSystem();
  const modifiedContent = '# Updated Genesis Content with Ion dynamics';
  const updatedTree = updateFileContent(seed, '/blueprints/genesis_synthesis.md', modifiedContent);
  const node = findNodeByPath(updatedTree, '/blueprints/genesis_synthesis.md');
  assert.equal(node?.content, modifiedContent);
  assert.equal(node?.sizeBytes, new TextEncoder().encode(modifiedContent).length);
});

test('renameNodeInTree renames file and preserves hierarchy', () => {
  const seed = createSeedFileSystem();
  const renamed = renameNodeInTree(seed, '/blueprints/genesis_synthesis.md', 'genesis_v2.md');
  const oldNode = findNodeByPath(renamed, '/blueprints/genesis_synthesis.md');
  assert.equal(oldNode, null);
  const newNode = findNodeByPath(renamed, '/blueprints/genesis_v2.md');
  assert.ok(newNode);
  assert.equal(newNode?.name, 'genesis_v2.md');
  assert.equal(newNode?.mimeType, 'text/markdown');
});

test('getFileSystemStats aggregates file and directory counts and sizes', () => {
  const seed = createSeedFileSystem();
  const stats = getFileSystemStats(seed);
  assert.ok(stats.folders >= 4);
  assert.ok(stats.files >= 5);
  assert.ok(stats.totalBytes > 1000);
});

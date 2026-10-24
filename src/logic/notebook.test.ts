import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateFileStats,
  applyMarkdownFormat,
  extractHeadingsOutline,
  convertNoteToSkillMarkdown,
  getInitialNotebookFiles,
  NotebookFile,
} from './notebook.js';

test('calculateFileStats computes words, characters, lines, and reading time', () => {
  const content = 'Line one with some words.\nLine two with more detailed sentences.\nLine three.';
  const stats = calculateFileStats(content);

  assert.equal(stats.lines, 3);
  assert.equal(stats.words, 13);
  assert.equal(stats.characters, content.length);
  assert.equal(stats.readingTimeMinutes, 1);
});

test('applyMarkdownFormat wraps text with bold syntax', () => {
  const source = 'Physical silicon';
  const result = applyMarkdownFormat(source, 9, 16, 'bold');
  assert.equal(result.newContent, 'Physical **silicon**');
});

test('applyMarkdownFormat inserts markdown headings', () => {
  const source = 'Abstract section';
  const result = applyMarkdownFormat(source, 0, 8, 'h1');
  assert.match(result.newContent, /# Abstract/);
});

test('applyMarkdownFormat inserts Landauer LaTeX formula', () => {
  const source = 'Energy dissipation: ';
  const result = applyMarkdownFormat(source, source.length, source.length, 'math');
  assert.match(result.newContent, /k_B T \\ln 2/);
});

test('applyMarkdownFormat inserts markdown table template', () => {
  const source = 'Comparison:\n';
  const result = applyMarkdownFormat(source, source.length, source.length, 'table');
  assert.match(result.newContent, /\| Metric \| Silicon CMOS/);
});

test('extractHeadingsOutline identifies H1, H2, and H3 correctly with line numbers', () => {
  const markdown = `# Title\nSome text\n## Subheading 1\nMore text\n### Detail A\nFinal text`;
  const outline = extractHeadingsOutline(markdown);

  assert.equal(outline.length, 3);
  assert.equal(outline[0].text, 'Title');
  assert.equal(outline[0].level, 1);
  assert.equal(outline[0].line, 1);

  assert.equal(outline[1].text, 'Subheading 1');
  assert.equal(outline[1].level, 2);
  assert.equal(outline[1].line, 3);

  assert.equal(outline[2].text, 'Detail A');
  assert.equal(outline[2].level, 3);
  assert.equal(outline[2].line, 5);
});

test('convertNoteToSkillMarkdown generates valid YAML frontmatter and skill directives', () => {
  const note: NotebookFile = {
    id: 'test-note',
    name: 'landauer_thermo.md',
    extension: 'md',
    category: 'physics',
    content: 'Thermodynamic dissipation calculations.',
    sizeBytes: 100,
    tags: ['thermo', 'physics'],
    updatedAt: new Date().toISOString(),
  };

  const skillMd = convertNoteToSkillMarkdown(note);
  assert.match(skillMd, /^---/);
  assert.match(skillMd, /name: landauer-thermo/);
  assert.match(skillMd, /category: physics/);
  assert.match(skillMd, /## Extracted Research Blueprint/);
  assert.match(skillMd, /Thermodynamic dissipation calculations\./);
});

test('getInitialNotebookFiles returns pre-loaded research files', () => {
  const files = getInitialNotebookFiles();
  assert.ok(files.length >= 4);
  const synthesis = files.find((f) => f.name.includes('the_genesis'));
  assert.ok(synthesis);
  assert.equal(synthesis.category, 'synthesis');
  assert.match(synthesis.content, /Ada Lovelace/);
  assert.match(synthesis.content, /Landauer/);
});

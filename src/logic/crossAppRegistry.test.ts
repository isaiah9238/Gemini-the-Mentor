import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPreconfiguredApps,
  getPreconfiguredSkills,
  filterSkills,
  parseSkillMarkdown,
  serializeSkillToMarkdown,
  generateDefaultMindMap,
  calculateAppTelemetry,
} from './crossAppRegistry.js';

test('getPreconfiguredApps provides Agent Skill Registry with valid target collection', () => {
  const apps = getPreconfiguredApps();
  assert.ok(apps.length >= 3);
  const registry = apps.find((a) => a.id === 'agent-skill-registry');
  assert.ok(registry);
  assert.equal(registry?.name, 'Agent Skill Registry');
  assert.equal(registry?.targetCollection, 'shared_skills');
  assert.equal(registry?.status, 'connected');
});

test('getPreconfiguredSkills contains foundational AI and physics skills', () => {
  const skills = getPreconfiguredSkills();
  assert.ok(skills.length >= 5);
  const silicon = skills.find((s) => s.name === 'nanoscale-silicon-transport');
  assert.ok(silicon);
  assert.equal(silicon?.category, 'physics');

  const tom = skills.find((s) => s.name === 'theory-of-mind-social-probe');
  assert.ok(tom);
  assert.equal(tom?.category, 'cognitive');
});

test('filterSkills filters by search query and category correctly', () => {
  const skills = getPreconfiguredSkills();
  const physicsOnly = filterSkills(skills, '', 'physics');
  assert.ok(physicsOnly.length >= 2);
  physicsOnly.forEach((s) => assert.equal(s.category, 'physics'));

  const queryResult = filterSkills(skills, 'landauer');
  assert.equal(queryResult.length, 1);
  assert.equal(queryResult[0].name, 'landauer-irreversibility-verifier');
});

test('parseSkillMarkdown extracts name, description, and steps from markdown', () => {
  const md = `# Quantum Annealing Optimizer
Calculates ground state spin configuration of Ising spin glass.
tags: quantum, ising, optimization
- Initialize transverse field
- Adiabatically decrease tunneling amplitude
- Read classical magnetic states
`;
  const parsed = parseSkillMarkdown(md);
  assert.equal(parsed.name, 'quantum-annealing-optimizer');
  assert.ok(parsed.tags?.includes('quantum'));
  assert.equal(parsed.steps?.length, 3);
});

test('serializeSkillToMarkdown outputs valid yaml frontmatter and documentation', () => {
  const skill = getPreconfiguredSkills()[0];
  const serialized = serializeSkillToMarkdown(skill);
  assert.ok(serialized.includes('name: "nanoscale-silicon-transport"'));
  assert.ok(serialized.includes('## Parameters'));
  assert.ok(serialized.includes('## Execution Steps'));
  assert.ok(serialized.includes('export async function executeSkill'));
});

test('generateDefaultMindMap constructs balanced node-edge graph', () => {
  const skills = getPreconfiguredSkills();
  const graph = generateDefaultMindMap('Genesis Cognitive Core', skills);
  assert.ok(graph.nodes.length >= 6);
  assert.ok(graph.edges.length >= 5);
  const root = graph.nodes.find((n) => n.id === 'node-root-app');
  assert.ok(root);
  assert.equal(root?.label, 'Genesis Cognitive Core');
});

test('calculateAppTelemetry aggregates total invocations and computes distribution', () => {
  const skills = getPreconfiguredSkills();
  const telemetry = calculateAppTelemetry(skills);
  assert.ok(telemetry.totalInvocations > 50000);
  assert.ok(telemetry.successRatePercent > 99);
  assert.ok(telemetry.historyTimeline.length > 5);
  assert.equal(telemetry.skillUsageBreakdown.length, skills.length);
});

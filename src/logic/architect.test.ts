import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateProjectHealth,
  generateApplicationFromInspection,
  getPrebuiltArchitecturalTemplates,
  getArchitectMentorAdvice,
} from './architect.js';
import { inspectCodeFile, getSampleIncomingFiles } from './codeInspector.js';

test('evaluateProjectHealth: audits all 10 modules and reports optimal status when no degradation', () => {
  const health = evaluateProjectHealth(null);
  assert.equal(health.monitoredModulesCount, 10);
  assert.equal(health.overallStatus, 'HEALTHY');
  assert.ok(health.overallScore >= 90);
  assert.ok(health.invariants.esmCompliance);
  assert.ok(health.invariants.thermodynamicBoundRespected);
  assert.ok(health.invariants.clientBrowserSafety);
  assert.ok(health.invariants.neuromorphicPolarityCorrect);
  assert.ok(health.invariants.virtualFsHealthy);
  assert.ok(health.recommendations.length > 0);
});

test('evaluateProjectHealth: detects incompatible scan and shifts status to ACTION_REQUIRED', () => {
  const samples = getSampleIncomingFiles();
  const legacyFile = samples.find(s => s.name.includes('legacy_neural_widget')) || samples[0];
  const report = inspectCodeFile(legacyFile);

  const health = evaluateProjectHealth(report);
  assert.equal(health.overallStatus, 'ACTION_REQUIRED');
  assert.ok(health.overallScore < 90);
  assert.ok(health.recommendations.some(r => r.includes(legacyFile.name)));
});

test('generateApplicationFromInspection: synthesizes complete multi-file project from report', () => {
  const samples = getSampleIncomingFiles();
  const legacyFile = samples.find(s => s.name.includes('legacy_neural_widget')) || samples[0];
  const report = inspectCodeFile(legacyFile);

  const app = generateApplicationFromInspection(report, { appName: 'SynthesizedNeuralApp' });
  assert.equal(app.title, 'SynthesizedNeuralApp');
  assert.ok(app.files.length >= 4);

  const uiComponent = app.files.find(f => f.name.endsWith('.tsx'));
  const engineLogic = app.files.find(f => f.name.endsWith('_engine.ts'));
  const testFile = app.files.find(f => f.name.endsWith('.test.ts'));
  const docFile = app.files.find(f => f.name.endsWith('.md'));

  assert.ok(uiComponent, 'Should produce a React 19 .tsx component');
  assert.ok(engineLogic, 'Should produce decoupled functional logic');
  assert.ok(testFile, 'Should produce a node:test verification suite');
  assert.ok(docFile, 'Should produce an architectural README');

  assert.ok(uiComponent!.content.includes('import React'));
  assert.ok(engineLogic!.content.includes('export function executePortedLogic'));
  assert.ok(testFile!.content.includes("import test from 'node:test'"));
  assert.ok(docFile!.content.includes('## Architectural Summary'));

  assert.ok(app.dependencies['react']);
  assert.equal(app.derivedFromInspection?.fileName, legacyFile.name);
});

test('getPrebuiltArchitecturalTemplates: provides valid SNN Cortex and Landauer templates', () => {
  const templates = getPrebuiltArchitecturalTemplates();
  assert.ok(templates.length >= 2);

  const snnTemplate = templates.find(t => t.id === 'template-snn-cortex');
  assert.ok(snnTemplate);
  assert.equal(snnTemplate.domain, 'neuromorphic');
  assert.ok(snnTemplate.files.some(f => f.name.includes('snnEngine.ts')));

  const landauerTemplate = templates.find(t => t.id === 'template-landauer-verifier');
  assert.ok(landauerTemplate);
  assert.equal(landauerTemplate.domain, 'thermodynamics');
});

test('getArchitectMentorAdvice: responds with domain-accurate advice and actions for audits', () => {
  const advice = getArchitectMentorAdvice('Can you audit the health of our project?');
  assert.ok(advice.reply.includes('[The Architect]'));
  assert.ok(advice.suggestedActions.some(a => a.target === 'architect' || a.target === 'inspector'));
});

test('getArchitectMentorAdvice: provides thermodynamic guidance grounded in Landauer principle', () => {
  const advice = getArchitectMentorAdvice('Explain the Landauer thermodynamic limit and heat dissipation.');
  assert.ok(advice.reply.includes('Landauer'));
  assert.ok(advice.reply.includes('kB * T * ln(2)'));
  assert.ok(advice.suggestedActions.some(a => a.type === 'navigate' || a.type === 'inspect'));
});

test('getArchitectMentorAdvice: provides neuromorphic advice contrasting von Neumann bottleneck', () => {
  const advice = getArchitectMentorAdvice('Tell me about neuromorphic brain efficiency and STDP.');
  assert.ok(advice.reply.includes('brain'));
  assert.ok(advice.reply.includes('15–20 Watts'));
  assert.ok(advice.suggestedActions.some(a => a.type === 'scaffold' || a.type === 'navigate'));
});

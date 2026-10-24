import test from 'node:test';
import assert from 'node:assert/strict';
import {
  inspectCodeFile,
  generateRemediationCode,
  generateResearchDirections,
  getCoreProjectFiles,
  getSampleIncomingFiles,
  getProjectContext,
  InspectableFile,
} from './codeInspector.js';

test('inspectCodeFile: compliant TypeScript file evaluates to COMPATIBLE with score >= 90', () => {
  const file: InspectableFile = {
    id: 'test-1',
    name: 'useThermodynamics.ts',
    language: 'typescript',
    content: `import { useState, useEffect } from 'react';
export function useThermodynamics() {
  const [temp, setTemp] = useState(300);
  return { temp, setTemp };
}`,
  };

  const report = inspectCodeFile(file);
  assert.equal(report.status, 'COMPATIBLE');
  assert.ok(report.score >= 90, `Score should be >= 90, got ${report.score}`);
  assert.equal(report.metrics.errorsCount, 0);
  assert.match(report.summary, /fully compliant/i);
});

test('inspectCodeFile: CommonJS require and module.exports flags warnings and marks as ADAPTABLE', () => {
  const file: InspectableFile = {
    id: 'test-cjs',
    name: 'neural_helper.js',
    language: 'javascript',
    content: `const React = require('react');
function calculateWeights() { return [1, 0, 1]; }
module.exports = calculateWeights;`,
  };

  const report = inspectCodeFile(file);
  assert.equal(report.status, 'ADAPTABLE');
  assert.ok(report.metrics.warningsCount >= 2);
  const cjsIssue = report.issues.find((i) => i.category === 'syntax_esm');
  assert.ok(cjsIssue, 'Should find CommonJS syntax issue');
});

test('inspectCodeFile: Node.js fs module in client code triggers INCOMPATIBLE error', () => {
  const file: InspectableFile = {
    id: 'test-node-fs',
    name: 'fileReader.ts',
    language: 'typescript',
    content: `import fs from 'fs';
export function readConfig() {
  return fs.readFileSync('/data.json', 'utf-8');
}`,
  };

  const report = inspectCodeFile(file);
  assert.equal(report.status, 'INCOMPATIBLE');
  assert.ok(report.metrics.errorsCount >= 1);
  const fsIssue = report.issues.find((i) => i.id.includes('issue-node-fs'));
  assert.ok(fsIssue, 'Should flag node fs module issue');
});

test('inspectCodeFile: Python script triggers runtime environment warning', () => {
  const file: InspectableFile = {
    id: 'test-python',
    name: 'cortex_model.py',
    language: 'python',
    content: `import numpy as np
def run():
    print("Simulating SNN")`,
  };

  const report = inspectCodeFile(file);
  const pyIssue = report.issues.find((i) => i.id === 'issue-py-lang');
  assert.ok(pyIssue, 'Should flag python runtime issue');
  assert.ok(report.hasRemediation, 'Should generate TypeScript port remediation');
});

test('inspectCodeFile: Uninstalled external dependency flags dependency warning', () => {
  const file: InspectableFile = {
    id: 'test-dep',
    name: 'dataService.ts',
    language: 'typescript',
    content: `import axios from 'axios';
export const client = axios.create();`,
  };

  const report = inspectCodeFile(file);
  const depIssue = report.issues.find((i) => i.id.includes('issue-missing-dep-axios'));
  assert.ok(depIssue, 'Should flag missing axios dependency');
});

test('inspectCodeFile: Membrane potential sign inversion triggers biophysics domain warning', () => {
  const file: InspectableFile = {
    id: 'test-bio',
    name: 'synapseConfig.ts',
    language: 'typescript',
    content: `export const membrane_potential = {
  resting_potential: 70, // Inverted sign error
  threshold: -55
};`,
  };

  const report = inspectCodeFile(file);
  const bioIssue = report.issues.find((i) => i.id === 'issue-domain-resting-sign');
  assert.ok(bioIssue, 'Should flag positive resting membrane potential anomaly');
});

test('generateRemediationCode: transforms CommonJS syntax into ESM imports and exports', () => {
  const file: InspectableFile = {
    id: 'test-rem',
    name: 'calculator.js',
    language: 'javascript',
    content: `const react = require('react');
module.exports = function add(a, b) { return a + b; };`,
  };

  const remediation = generateRemediationCode(file, []);
  assert.match(remediation, /import react from 'react';/);
  assert.match(remediation, /export default function add/);
});

test('generateResearchDirections: provides academic citations for thermodynamics and biophysics', () => {
  const file: InspectableFile = {
    id: 'test-res',
    name: 'landauer_synapse.ts',
    language: 'typescript',
    content: `// Calculating landauer limits and synaptic transmission in spiking neurons`,
  };

  const directions = generateResearchDirections(file, []);
  assert.ok(directions.length >= 2);
  const thermo = directions.find((d) => d.domain === 'thermodynamics');
  assert.ok(thermo);
  assert.match(thermo.academicCitation, /Landauer, R\. \(1961\)/);

  const bio = directions.find((d) => d.domain === 'biophysics');
  assert.ok(bio);
  assert.match(bio.academicCitation, /McCulloch.*Pitts.*1943/);
});

test('getCoreProjectFiles and getSampleIncomingFiles return valid datasets', () => {
  const core = getCoreProjectFiles();
  const samples = getSampleIncomingFiles();

  assert.ok(core.length >= 4);
  assert.ok(samples.length >= 4);
  assert.ok(core.some((f) => f.name === 'physics.ts'));
  assert.ok(samples.some((f) => f.language === 'python' || f.name.endsWith('.py')));
});

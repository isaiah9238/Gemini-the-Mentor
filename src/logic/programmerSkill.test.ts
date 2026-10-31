import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPresetProgramSpecifications,
  synthesizeProgram,
  executeProgramSimulation,
  auditProgramSafety,
} from './programmerSkill.js';

test('getPresetProgramSpecifications returns core historical and modern programs', () => {
  const presets = getPresetProgramSpecifications();
  assert.ok(presets.length >= 5);

  const lovelace = presets.find((p) => p.paradigm === 'lovelace-analytical');
  assert.ok(lovelace);
  assert.equal(lovelace?.author.includes('Ada Lovelace'), true);
  assert.ok(lovelace?.code.includes('LOAD V1'));

  const turing = presets.find((p) => p.paradigm === 'turing-machine');
  assert.ok(turing);
  assert.ok(turing?.code.includes('q0'));

  const vonNeumann = presets.find((p) => p.paradigm === 'von-neumann-asm');
  assert.ok(vonNeumann);
  assert.ok(vonNeumann?.code.includes('MOV R0'));
});

test('synthesizeProgram generates valid code across different paradigms', () => {
  const lovelaceProg = synthesizeProgram('Matrix Multiply', 'lovelace-analytical', 'Weave linear algebra cards');
  assert.equal(lovelaceProg.paradigm, 'lovelace-analytical');
  assert.ok(lovelaceProg.code.includes('Operation Card'));

  const turingProg = synthesizeProgram('Invert Bits', 'turing-machine', 'Invert 0 to 1 on tape');
  assert.equal(turingProg.paradigm, 'turing-machine');
  assert.ok(turingProg.code.includes('q_scan'));

  const tsProg = synthesizeProgram('Vector Accumulator', 'typescript-esm', 'Accumulate vector elements');
  assert.equal(tsProg.paradigm, 'typescript-esm');
  assert.ok(tsProg.code.includes('export function executeTask'));
});

test('executeProgramSimulation runs Lovelace Bernoulli program correctly', () => {
  const presets = getPresetProgramSpecifications();
  const lovelace = presets.find((p) => p.paradigm === 'lovelace-analytical')!;
  const result = executeProgramSimulation(lovelace);

  assert.equal(result.success, true);
  assert.ok(result.trace.length > 0);
  assert.equal(result.output.fraction, '1/6');
  assert.ok(result.metrics.estimatedEnergyNanoJoules > 0);
});

test('executeProgramSimulation runs Turing parity machine correctly', () => {
  const presets = getPresetProgramSpecifications();
  const turing = presets.find((p) => p.paradigm === 'turing-machine')!;
  const result = executeProgramSimulation(turing);

  assert.equal(result.success, true);
  assert.ok(result.trace.length >= 3);
  assert.ok(result.finalState.parity === 'Even' || result.finalState.parity === 'Odd');
});

test('executeProgramSimulation runs Von Neumann Fibonacci program correctly', () => {
  const presets = getPresetProgramSpecifications();
  const asm = presets.find((p) => p.paradigm === 'von-neumann-asm')!;
  const result = executeProgramSimulation(asm, { n: 5 });

  assert.equal(result.success, true);
  assert.ok(result.output.fibonacciValue > 0);
  assert.ok(result.metrics.instructionsExecuted > 0);
});

test('auditProgramSafety detects unsafe patterns and extracts principles', () => {
  const safeAudit = auditProgramSafety('export function add(a: number, b: number) { return a + b; }', 'typescript-esm');
  assert.equal(safeAudit.safe, true);
  assert.equal(safeAudit.warnings.length, 0);
  assert.ok(safeAudit.principles.length > 0);

  const unsafeAudit = auditProgramSafety('const x = require("fs"); eval("bad");', 'typescript-esm');
  assert.equal(unsafeAudit.safe, false);
  assert.ok(unsafeAudit.warnings.some((w) => w.includes('CommonJS')));
  assert.ok(unsafeAudit.warnings.some((w) => w.includes('eval')));
});

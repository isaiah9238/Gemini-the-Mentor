import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLandauerLimit, calculateInterconnectEnergy, calculateThroughput } from './physics.js';
import { evaluateMCPNeuron, mcpAndGate, mcpOrGate, mcpNotGate, mcpXorGate } from './mccullochPitts.js';
import { calculateActionPotentialCurve, simulateSynapticTransmission } from './biophysics.js';
import { calculateBernoulliSequence } from './bernoulli.js';

test('Landauer Limit at 300K equates to ~0.018 eV (~2.9e-21 Joules)', () => {
  const result = calculateLandauerLimit(300);
  assert.ok(result.joules > 2.8e-21 && result.joules < 3.0e-21);
  assert.ok(result.electronVolts > 0.017 && result.electronVolts < 0.019);
});

test('Interconnect energy increases with wire length (Von Neumann bottleneck principle)', () => {
  const shortWire = calculateInterconnectEnergy(10); // 10 um
  const longWire = calculateInterconnectEnergy(1000); // 1 mm (off-chip bus)
  assert.ok(longWire.energyJoules > shortWire.energyJoules);
  assert.equal(longWire.relativeScale, 1000);
});

test('Throughput scales with clock frequency and IPC', () => {
  const result = calculateThroughput(4.0, 2.5); // 4 GHz, 2.5 IPC
  assert.equal(result.gigaOps, 10.0);
  assert.equal(result.cycleTimePicoseconds, 250);
});

test('McCulloch-Pitts AND gate fires only when both inputs are 1', () => {
  assert.equal(mcpAndGate(0, 0), 0);
  assert.equal(mcpAndGate(1, 0), 0);
  assert.equal(mcpAndGate(0, 1), 0);
  assert.equal(mcpAndGate(1, 1), 1);
});

test('McCulloch-Pitts OR gate fires when either input is 1', () => {
  assert.equal(mcpOrGate(0, 0), 0);
  assert.equal(mcpOrGate(1, 0), 1);
  assert.equal(mcpOrGate(0, 1), 1);
  assert.equal(mcpOrGate(1, 1), 1);
});

test('McCulloch-Pitts NOT gate inverts input using inhibitory input', () => {
  assert.equal(mcpNotGate(0), 1);
  assert.equal(mcpNotGate(1), 0);
});

test('McCulloch-Pitts 2-layer network synthesizes XOR', () => {
  assert.equal(mcpXorGate(0, 0), 0);
  assert.equal(mcpXorGate(1, 0), 1);
  assert.equal(mcpXorGate(0, 1), 1);
  assert.equal(mcpXorGate(1, 1), 0);
});

test('Inhibitory input completely suppresses McCulloch-Pitts neuron regardless of excitatory sum', () => {
  const suppressed = evaluateMCPNeuron({
    threshold: 1,
    excitatoryInputs: [1, 1, 1, 1],
    inhibitoryInputs: [1],
  });
  assert.equal(suppressed.fired, false);
  assert.equal(suppressed.isSuppressed, true);
});

test('Action potential curve achieves positive depolarization peak at ~1.2ms', () => {
  const resting = calculateActionPotentialCurve(0.0);
  assert.equal(resting.phase, 'resting');
  assert.equal(resting.membranePotentialMv, -70);

  const peak = calculateActionPotentialCurve(1.2);
  assert.equal(peak.phase, 'depolarization');
  assert.ok(peak.membranePotentialMv > 20);

  const hyper = calculateActionPotentialCurve(2.6);
  assert.equal(hyper.phase, 'hyperpolarization');
  assert.ok(hyper.membranePotentialMv < -70);
});

test('Probabilistic synaptic transmission respects base probability rate', () => {
  // Deterministic mock RNG
  let val = 0.1;
  const mockRng = () => {
    val = (val + 0.1) % 1.0;
    return val;
  };
  const result = simulateSynapticTransmission(100, 0.25, mockRng);
  assert.ok(result.successfulTransmissions > 0);
  assert.ok(result.transmissionRate <= 1.0);
});

test('Ada Lovelace Bernoulli calculation reproduces historical values', () => {
  const { values } = calculateBernoulliSequence(6);
  const b0 = values.find((v) => v.symbol === 'B_0');
  const b2 = values.find((v) => v.symbol === 'B_2');
  const b4 = values.find((v) => v.symbol === 'B_4');
  assert.equal(b0?.fraction, '1');
  assert.equal(b2?.fraction, '1/6');
  assert.equal(b4?.fraction, '-1/30');
});

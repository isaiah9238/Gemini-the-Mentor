/**
 * Biophysical Neuronal Action Potential & Synaptic Transmission Simulation
 */

export interface ActionPotentialState {
  timeMs: number;
  membranePotentialMv: number;
  phase: 'resting' | 'depolarization' | 'repolarization' | 'hyperpolarization';
  naGateOpenRatio: number;
  kGateOpenRatio: number;
}

/**
 * Computes the membrane potential (mV) along an idealized 4ms action potential wave
 */
export function calculateActionPotentialCurve(timeMs: number, stimulusCurrent: number = 10): ActionPotentialState {
  const restingPotential = -70; // mV
  const threshold = -55; // mV
  const peak = 35; // mV
  const undershoot = -80; // mV

  // Below stimulus threshold: slight subthreshold response then return
  if (stimulusCurrent < 5) {
    const sub = restingPotential + stimulusCurrent * 1.2 * Math.exp(-timeMs / 1.5);
    return {
      timeMs,
      membranePotentialMv: sub,
      phase: 'resting',
      naGateOpenRatio: 0.05,
      kGateOpenRatio: 0.1,
    };
  }

  // Action potential phases over 0 - 4 ms:
  // 0 - 0.5 ms: Stimulus to threshold
  // 0.5 - 1.2 ms: Depolarization (Na+ flood in)
  // 1.2 - 2.2 ms: Repolarization (K+ flood out)
  // 2.2 - 3.2 ms: Hyperpolarization (refractory period)
  // 3.2 - 4.0 ms: Recovery back to -70 mV via Na+/K+ pump

  let mv = restingPotential;
  let phase: ActionPotentialState['phase'] = 'resting';
  let naGate = 0.05;
  let kGate = 0.1;

  if (timeMs <= 0.5) {
    mv = restingPotential + ((threshold - restingPotential) * (timeMs / 0.5));
    phase = 'resting';
    naGate = 0.1 + (0.2 * (timeMs / 0.5));
    kGate = 0.1;
  } else if (timeMs <= 1.2) {
    const tNorm = (timeMs - 0.5) / 0.7;
    mv = threshold + ((peak - threshold) * Math.sin(tNorm * (Math.PI / 2)));
    phase = 'depolarization';
    naGate = 0.3 + 0.7 * tNorm;
    kGate = 0.1 + 0.2 * tNorm;
  } else if (timeMs <= 2.2) {
    const tNorm = (timeMs - 1.2) / 1.0;
    mv = peak - ((peak - undershoot) * tNorm);
    phase = 'repolarization';
    naGate = Math.max(0.05, 1.0 - tNorm * 1.1);
    kGate = 0.3 + 0.7 * (1.0 - Math.abs(tNorm - 0.5) * 0.5);
  } else if (timeMs <= 3.2) {
    const tNorm = (timeMs - 2.2) / 1.0;
    mv = undershoot + ((restingPotential - undershoot) * tNorm);
    phase = 'hyperpolarization';
    naGate = 0.05;
    kGate = 0.8 - 0.6 * tNorm;
  } else {
    mv = restingPotential;
    phase = 'resting';
    naGate = 0.05;
    kGate = 0.1;
  }

  return {
    timeMs,
    membranePotentialMv: Math.round(mv * 10) / 10,
    phase,
    naGateOpenRatio: Math.round(naGate * 100) / 100,
    kGateOpenRatio: Math.round(kGate * 100) / 100,
  };
}

/**
 * Simulates probabilistic synaptic vesicle release
 * Biological transmission probability in cortical synapses is typically ~25%
 */
export function simulateSynapticTransmission(
  spikeCount: number,
  baseProbability: number = 0.25,
  seedRng: () => number = Math.random
): { successfulTransmissions: number; transmissionRate: number } {
  let successfulTransmissions = 0;
  for (let i = 0; i < spikeCount; i++) {
    if (seedRng() < baseProbability) {
      successfulTransmissions++;
    }
  }
  const transmissionRate = spikeCount > 0 ? successfulTransmissions / spikeCount : 0;
  return { successfulTransmissions, transmissionRate };
}

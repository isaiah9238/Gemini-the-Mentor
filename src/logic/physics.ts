/**
 * Thermodynamic and Physical Computing Calculations
 */

// Boltzmann constant in Joules/Kelvin
export const BOLTZMANN_CONSTANT = 1.380649e-23;
// Electron volt in Joules
export const JOULE_PER_EV = 1.602176634e-19;

/**
 * Calculates Landauer's theoretical minimum heat dissipation per bit operation:
 * Q = k_B * T * ln(2)
 * @param temperatureKelvin Absolute temperature in Kelvin (defaults to 300K)
 * @returns Heat in Joules and electron-volts (eV)
 */
export function calculateLandauerLimit(temperatureKelvin: number = 300): {
  joules: number;
  electronVolts: number;
} {
  if (temperatureKelvin < 0) {
    throw new Error('Temperature cannot be below absolute zero');
  }
  const joules = BOLTZMANN_CONSTANT * temperatureKelvin * Math.LN2;
  const electronVolts = joules / JOULE_PER_EV;
  return { joules, electronVolts };
}

/**
 * Calculates interconnect copper wire energy dissipation:
 * Energy is proportional to wire capacitance, voltage squared, and physical length:
 * E ~ C_unit * L * V^2 * transfers
 * @param wireLengthMicrons Wire length in micrometers
 * @param voltage Operating voltage in Volts (e.g., 0.8V to 1.2V)
 * @param transfers Number of bit state toggles
 */
export function calculateInterconnectEnergy(
  wireLengthMicrons: number,
  voltage: number = 1.0,
  transfers: number = 1e9
): { energyJoules: number; relativeScale: number } {
  // Approximate unit capacitance of on-chip copper interconnect ~ 0.2 fF/um = 2e-16 F/um
  const capPerMicron = 2e-16;
  const totalCap = wireLengthMicrons * capPerMicron;
  const energyJoules = 0.5 * totalCap * Math.pow(voltage, 2) * transfers;
  // Normalized comparison against local register transfer (length = 1 um)
  const relativeScale = wireLengthMicrons / 1.0;
  return { energyJoules, relativeScale };
}

/**
 * Calculates Effective Throughput based on Clock Frequency (GHz) and IPC
 */
export function calculateThroughput(
  clockGigaHz: number,
  instructionsPerClock: number
): { gigaOps: number; cycleTimePicoseconds: number } {
  const gigaOps = Math.round(clockGigaHz * instructionsPerClock * 100) / 100;
  const cycleTimePicoseconds = Math.round(((1 / (clockGigaHz * 1e9)) * 1e12) * 1000) / 1000;
  return { gigaOps, cycleTimePicoseconds };
}

/**
 * Compares energy and carbon footprints between AI Supercomputers and Human Brain
 */
export function calculateFootprintComparison(
  documentCount: number
): {
  aiEnergyMWh: number;
  humanEnergyMWh: number;
  crossoverPoint: string;
} {
  // AI: ~3.5 MWh per million documents
  const aiEnergyMWh = (documentCount / 1_000_000) * 3.5;
  // Human: ~8.0 MWh per million documents (assuming typing & review metabolic load)
  const humanEnergyMWh = (documentCount / 1_000_000) * 8.0;

  let crossoverPoint = 'Human brain is more efficient for small creative tasks (< 500 documents)';
  if (documentCount > 100_000) {
    crossoverPoint = 'AI scales far more efficiently for massive parallel processing';
  }
  return { aiEnergyMWh, humanEnergyMWh, crossoverPoint };
}

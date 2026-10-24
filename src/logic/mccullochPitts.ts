/**
 * McCulloch-Pitts (1943) Artificial Neuron Model & Logic Gate Synthesizer
 * y = 1 if sum(excitatory) >= theta AND all(inhibitory == 0) else 0
 */

export interface MCPNeuronConfig {
  threshold: number;
  excitatoryInputs: number[];
  inhibitoryInputs: number[];
}

export function evaluateMCPNeuron(config: MCPNeuronConfig): {
  fired: boolean;
  output: number;
  excitatorySum: number;
  isSuppressed: boolean;
} {
  const isSuppressed = config.inhibitoryInputs.some((val) => val === 1);
  const excitatorySum = config.excitatoryInputs.reduce((acc, curr) => acc + curr, 0);

  if (isSuppressed) {
    return {
      fired: false,
      output: 0,
      excitatorySum,
      isSuppressed: true,
    };
  }

  const fired = excitatorySum >= config.threshold;
  return {
    fired,
    output: fired ? 1 : 0,
    excitatorySum,
    isSuppressed: false,
  };
}

/**
 * Pre-configured standard gates using McCulloch-Pitts neurons
 */
export function mcpAndGate(a: number, b: number): number {
  return evaluateMCPNeuron({
    threshold: 2,
    excitatoryInputs: [a, b],
    inhibitoryInputs: [],
  }).output;
}

export function mcpOrGate(a: number, b: number): number {
  return evaluateMCPNeuron({
    threshold: 1,
    excitatoryInputs: [a, b],
    inhibitoryInputs: [],
  }).output;
}

export function mcpNotGate(a: number): number {
  // Constant excitatory bias = 1, input 'a' is inhibitory
  return evaluateMCPNeuron({
    threshold: 1,
    excitatoryInputs: [1],
    inhibitoryInputs: [a],
  }).output;
}

export function mcpXorGate(a: number, b: number): number {
  // XOR requires a two-layer network:
  // Node 1: a AND NOT b (a excitatory, b inhibitory, theta = 1)
  // Node 2: b AND NOT a (b excitatory, a inhibitory, theta = 1)
  // Node 3: Node 1 OR Node 2 (theta = 1)
  const node1 = evaluateMCPNeuron({
    threshold: 1,
    excitatoryInputs: [a],
    inhibitoryInputs: [b],
  }).output;

  const node2 = evaluateMCPNeuron({
    threshold: 1,
    excitatoryInputs: [b],
    inhibitoryInputs: [a],
  }).output;

  return mcpOrGate(node1, node2);
}

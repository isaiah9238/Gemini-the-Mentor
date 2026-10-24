/**
 * Pure logic for Cross-App Firestore Connection, Agent Skill Schema parsing,
 * Mind Map graph topology, and Application Telemetry Analytics.
 */

export interface ConnectedAppConfig {
  id: string;
  name: string;
  description: string;
  firestoreProjectId?: string;
  firestoreDatabaseId?: string;
  targetCollection: string;
  status: 'connected' | 'idle' | 'syncing' | 'error';
  lastSyncedAt?: string;
  isPreconfigured?: boolean;
}

export interface AgentSkillDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  category: 'physics' | 'logic' | 'cognitive' | 'biophysics' | 'tooling' | 'data';
  author: string;
  tags: string[];
  parameters: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description: string;
    required: boolean;
  }[];
  steps: string[];
  markdownContent: string;
  updatedAt: string;
  invocationsCount: number;
}

export interface MindMapNode {
  id: string;
  label: string;
  type: 'app' | 'skill' | 'database' | 'file' | 'analytics' | 'agent';
  x: number;
  y: number;
  status?: 'active' | 'synced' | 'pending';
  description?: string;
  skillId?: string;
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface AppTelemetryMetric {
  totalInvocations: number;
  successRatePercent: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  tokenConsumption: number;
  cacheHitRatio: number;
  historyTimeline: { time: string; count: number; latency: number }[];
  skillUsageBreakdown: { name: string; count: number; percentage: number }[];
}

/**
 * Returns preconfigured ecosystem apps that can be connected
 */
export function getPreconfiguredApps(): ConnectedAppConfig[] {
  return [
    {
      id: 'agent-skill-registry',
      name: 'Agent Skill Registry',
      description: 'Decentralized Firestore catalog of autonomous cognitive skills, tools, and execution pipelines.',
      firestoreProjectId: 'gen-lang-client-0573899362',
      firestoreDatabaseId: 'ai-studio-thegenesisofmach-17928b4c-3ff8-4004-b2e1-52d0ee5c8a6a',
      targetCollection: 'shared_skills',
      status: 'connected',
      isPreconfigured: true,
      lastSyncedAt: new Date().toISOString(),
    },
    {
      id: 'cognitive-graph-engine',
      name: 'Cognitive Graph & Mind Map Engine',
      description: 'Knowledge graph database mapping theoretical frameworks, Lovelace symbols, and Turing machines.',
      firestoreProjectId: 'gen-lang-client-0573899362',
      firestoreDatabaseId: 'ai-studio-thegenesisofmach-17928b4c-3ff8-4004-b2e1-52d0ee5c8a6a',
      targetCollection: 'mindmaps',
      status: 'connected',
      isPreconfigured: true,
      lastSyncedAt: new Date().toISOString(),
    },
    {
      id: 'neural-telemetry-hub',
      name: 'Neural Telemetry & Analytics Hub',
      description: 'Distributed metrics stream tracking token dissipation, action potential rates, and STDP weight changes.',
      firestoreProjectId: 'gen-lang-client-0573899362',
      firestoreDatabaseId: 'ai-studio-thegenesisofmach-17928b4c-3ff8-4004-b2e1-52d0ee5c8a6a',
      targetCollection: 'analytics',
      status: 'connected',
      isPreconfigured: true,
      lastSyncedAt: new Date().toISOString(),
    },
  ];
}

/**
 * Pre-seeded ecosystem skills catalog available in the Agent Skill Registry
 */
export function getPreconfiguredSkills(): AgentSkillDefinition[] {
  return [
    {
      id: 'skill-silicon-transport',
      name: 'nanoscale-silicon-transport',
      version: '1.2.0',
      description: 'Calculates nanoscale MOSFET inversion layer charge carrier mobility and switching delay at 14nm to 3nm nodes.',
      category: 'physics',
      author: 'Materials Cognition Lab',
      tags: ['silicon', 'photolithography', 'mosfet', 'ipc'],
      parameters: [
        { name: 'gateVoltage', type: 'number', description: 'Applied gate voltage in Volts (e.g. 0.7 - 1.2V)', required: true },
        { name: 'channelLengthNm', type: 'number', description: 'Transistor physical gate length in nanometers', required: true },
        { name: 'dopingConcentration', type: 'number', description: 'Acceptor impurity concentration (cm^-3)', required: false },
      ],
      steps: [
        'Initialize semiconductor Fermi level and carrier velocity saturation',
        'Solve 1D Poisson-Schrodinger equation across gate oxide dielectric',
        'Compute drive current I_on and subthreshold leakage I_off',
        'Output switching latency and dynamic dissipation per cycle',
      ],
      markdownContent: `# nanoscale-silicon-transport

Skill for solving carrier transport equations in FinFET and Gate-All-Around (GAA) nanosheet architectures.

## Usage
\`\`\`typescript
const result = runSiliconSimulation({ gateVoltage: 1.1, channelLengthNm: 14 });
console.log(result.driveCurrentMicroamps);
\`\`\`
`,
      updatedAt: new Date().toISOString(),
      invocationsCount: 14820,
    },
    {
      id: 'skill-landauer-thermo',
      name: 'landauer-irreversibility-verifier',
      version: '2.0.1',
      description: 'Evaluates the thermodynamic lower bound of heat dissipation per erased bit across temperature regimes (1K to 300K).',
      category: 'physics',
      author: 'Thermodynamics Division',
      tags: ['landauer', 'entropy', 'boltzmann', 'cryogenic'],
      parameters: [
        { name: 'temperatureKelvin', type: 'number', description: 'Absolute temperature of processing substrate (K)', required: true },
        { name: 'bitsErased', type: 'number', description: 'Number of irreversible binary bit operations executed', required: true },
      ],
      steps: [
        'Determine Boltzmann constant k_B = 1.380649e-23 J/K',
        'Calculate theoretical limit Q_min = k_B * T * ln(2) * bits',
        'Convert energy from Joules to electron-volts (1 eV = 1.602e-19 J)',
        'Compare against modern CMOS baseline (10^9 times Landauer limit)',
      ],
      markdownContent: `# landauer-irreversibility-verifier

Calculates Rolf Landauer's 1961 fundamental physical limit for irreversible information erasure.
`,
      updatedAt: new Date().toISOString(),
      invocationsCount: 8940,
    },
    {
      id: 'skill-mcp-synthesis',
      name: 'mcculloch-pitts-logic-synthesizer',
      version: '1.0.4',
      description: 'Synthesizes arbitrary multi-layer boolean propositions using McCulloch-Pitts formal binary neurons with inhibitory gating.',
      category: 'logic',
      author: 'Dartmouth Connectionist Group',
      tags: ['mcculloch-pitts', 'binary', 'logic-gates', 'xor'],
      parameters: [
        { name: 'booleanFunction', type: 'string', description: 'Target logical expression (AND, OR, NOT, XOR, IMPLICATION)', required: true },
        { name: 'threshold', type: 'number', description: 'Activation firing threshold θ', required: true },
      ],
      steps: [
        'Decompose truth table into sum-of-products representation',
        'Assign excitatory synaptic weights w_i = +1 and inhibitory weights = -infinity',
        'Calculate threshold parameter θ for all-or-nothing thresholding',
        'Validate formal correctness against truth table',
      ],
      markdownContent: `# mcculloch-pitts-logic-synthesizer

Emulates Warren McCulloch and Walter Pitts' 1943 foundational connectionist neuron architecture.
`,
      updatedAt: new Date().toISOString(),
      invocationsCount: 23100,
    },
    {
      id: 'skill-theory-of-mind',
      name: 'theory-of-mind-social-probe',
      version: '1.4.0',
      description: 'Applies modified Sally-Anne false-belief and emotional attribution tests to evaluate high-order social reasoning.',
      category: 'cognitive',
      author: 'AGI Evaluation Foundation',
      tags: ['theory-of-mind', 'sally-anne', 'social-reasoning', 'gpt4-sparks'],
      parameters: [
        { name: 'scenarioType', type: 'string', description: 'Scenario template: dropbox_relocation, zurfin_emotion, or recursive_belief', required: true },
        { name: 'informationalAsymmetry', type: 'boolean', description: 'Whether the observer possesses hidden knowledge', required: true },
      ],
      steps: [
        'Formulate chronological timeline of character observations',
        'Track epistemic state matrices for Agent A and Agent B separately',
        'Identify perspective shift and compute expected belief divergence',
        'Score system attribution against empirical Theory of Mind benchmarks',
      ],
      markdownContent: `# theory-of-mind-social-probe

Recreates the false-belief tests featured in Microsoft Research's "Sparks of AGI" paper.
`,
      updatedAt: new Date().toISOString(),
      invocationsCount: 31250,
    },
    {
      id: 'skill-stdp-plasticity',
      name: 'stdp-hebbian-plasticity-tuner',
      version: '2.1.0',
      description: 'Simulates Spike-Timing-Dependent Plasticity (STDP) for neuromorphic SNN architectures and memristor arrays.',
      category: 'biophysics',
      author: 'Neuromorphic Engineering Lab',
      tags: ['stdp', 'hebbian', 'synapse', 'action-potential', 'neuromorphic'],
      parameters: [
        { name: 'preSpikeTimeMs', type: 'number', description: 'Timestamp of pre-synaptic action potential (ms)', required: true },
        { name: 'postSpikeTimeMs', type: 'number', description: 'Timestamp of post-synaptic action potential (ms)', required: true },
        { name: 'learningRate', type: 'number', description: 'Potentiation/depression amplitude factor', required: false },
      ],
      steps: [
        'Compute temporal difference Δt = t_post - t_pre',
        'If Δt > 0: Calculate Long-Term Potentiation (LTP) Δw = A+ * exp(-Δt / tau+)',
        'If Δt < 0: Calculate Long-Term Depression (LTD) Δw = -A- * exp(Δt / tau-)',
        'Update synaptic conductance weight in continuous or quantized scale',
      ],
      markdownContent: `# stdp-hebbian-plasticity-tuner

Implements biological synaptic plasticity: "cells that fire together, wire together".
`,
      updatedAt: new Date().toISOString(),
      invocationsCount: 19800,
    },
  ];
}

/**
 * Searches across skill definitions by text query, category, and tags
 */
export function filterSkills(
  skills: AgentSkillDefinition[],
  query: string,
  categoryFilter?: string
): AgentSkillDefinition[] {
  const q = query.toLowerCase().trim();
  return skills.filter((skill) => {
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || skill.category === categoryFilter;
    if (!matchesCategory) return false;
    if (!q) return true;

    return (
      skill.name.toLowerCase().includes(q) ||
      skill.description.toLowerCase().includes(q) ||
      skill.tags.some((t) => t.toLowerCase().includes(q)) ||
      skill.author.toLowerCase().includes(q)
    );
  });
}

/**
 * Parses markdown formatted skill definition into structured AgentSkillDefinition
 */
export function parseSkillMarkdown(rawMarkdown: string, fallbackId?: string): Partial<AgentSkillDefinition> {
  const lines = rawMarkdown.split('\n');
  let title = '';
  let description = '';
  const tags: string[] = [];
  const steps: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('# ') && !title) {
      title = line.replace('# ', '').trim();
    } else if (line.startsWith('tags:') || line.startsWith('Tags:')) {
      const parts = line.replace(/tags:/i, '').split(',');
      parts.forEach((p) => {
        if (p.trim()) tags.push(p.trim().toLowerCase());
      });
    } else if (line.startsWith('- ') && steps.length < 6) {
      steps.push(line.replace('- ', '').trim());
    } else if (line.length > 20 && !description && !line.startsWith('#')) {
      description = line;
    }
  }

  const cleanName = title.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-') || 'custom-agent-skill';

  return {
    id: fallbackId || `skill-${Date.now()}`,
    name: cleanName,
    description: description || 'Custom user agent skill definition.',
    tags: tags.length > 0 ? tags : ['custom', 'agent'],
    steps: steps.length > 0 ? steps : ['Initialize inputs', 'Execute processing logic', 'Return computed output'],
    markdownContent: rawMarkdown,
  };
}

/**
 * Serializes an AgentSkillDefinition into valid SKILL.md format
 */
export function serializeSkillToMarkdown(skill: AgentSkillDefinition): string {
  const paramsList = skill.parameters
    .map((p) => `* \`${p.name}\` (${p.type}${p.required ? ', required' : ''}): ${p.description}`)
    .join('\n');

  const stepsList = skill.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n');

  return `---
name: "${skill.name}"
version: "${skill.version}"
category: "${skill.category}"
author: "${skill.author}"
tags: [${skill.tags.map((t) => `"${t}"`).join(', ')}]
---

# ${skill.name}

${skill.description}

## Parameters
${paramsList || 'No parameters required.'}

## Execution Steps
${stepsList || 'Standard execution pipeline.'}

## Implementation
\`\`\`typescript
// Auto-generated runtime logic for ${skill.name}
export async function executeSkill(inputs: Record<string, any>) {
  console.log("Executing ${skill.name} with inputs:", inputs);
  return {
    success: true,
    timestamp: new Date().toISOString(),
    result: "Skill executed successfully."
  };
}
\`\`\`
`;
}

/**
 * Generates default topology for Mind Map based on connected app and its skills
 */
export function generateDefaultMindMap(appName: string, skills: AgentSkillDefinition[]): {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
} {
  const rootNode: MindMapNode = {
    id: 'node-root-app',
    label: appName || 'Ecosystem Core',
    type: 'app',
    x: 450,
    y: 220,
    status: 'active',
    description: 'Central Host Application Hub',
  };

  const nodes: MindMapNode[] = [rootNode];
  const edges: MindMapEdge[] = [];

  // Add 4-6 skill nodes in an orbit around root
  const count = Math.min(skills.length, 6);
  const radius = 220;

  skills.slice(0, count).forEach((skill, index) => {
    const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
    const x = Math.round(450 + radius * Math.cos(angle));
    const y = Math.round(220 + radius * Math.sin(angle));

    const skillNodeId = `node-skill-${skill.id}`;
    nodes.push({
      id: skillNodeId,
      label: skill.name,
      type: 'skill',
      x,
      y,
      status: 'synced',
      description: skill.description,
      skillId: skill.id,
    });

    edges.push({
      id: `edge-root-${skill.id}`,
      source: 'node-root-app',
      target: skillNodeId,
      label: 'orchestrates',
    });

    // Add sub-node for database or tool
    if (index % 2 === 0) {
      const subX = Math.round(x + 90 * Math.cos(angle));
      const subY = Math.round(y + 90 * Math.sin(angle));
      const subId = `sub-${skill.id}`;
      nodes.push({
        id: subId,
        label: `${skill.category}-db`,
        type: 'database',
        x: subX,
        y: subY,
        status: 'synced',
        description: `Persistent store for ${skill.name}`,
      });
      edges.push({
        id: `edge-sub-${subId}`,
        source: skillNodeId,
        target: subId,
        label: 'persists',
      });
    }
  });

  return { nodes, edges };
}

/**
 * Calculates synthetic telemetry metrics for an app's analytics dashboard
 */
export function calculateAppTelemetry(skills: AgentSkillDefinition[]): AppTelemetryMetric {
  const totalInvocations = skills.reduce((acc, s) => acc + s.invocationsCount, 0) || 98450;
  const successRatePercent = 99.42;
  const averageLatencyMs = 42.8;
  const p95LatencyMs = 118.5;
  const tokenConsumption = 1428500;
  const cacheHitRatio = 0.884;

  // Hourly timeline for chart
  const historyTimeline = [
    { time: '04:00', count: 1240, latency: 45 },
    { time: '06:00', count: 2410, latency: 41 },
    { time: '08:00', count: 5890, latency: 48 },
    { time: '10:00', count: 9420, latency: 42 },
    { time: '12:00', count: 12100, latency: 39 },
    { time: '14:00', count: 14500, latency: 43 },
    { time: '16:00', count: 11800, latency: 44 },
    { time: '18:00', count: 8700, latency: 40 },
  ];

  // Distribution breakdown
  const skillUsageBreakdown = skills.map((s) => ({
    name: s.name,
    count: s.invocationsCount,
    percentage: Math.round((s.invocationsCount / totalInvocations) * 100) || 20,
  }));

  return {
    totalInvocations,
    successRatePercent,
    averageLatencyMs,
    p95LatencyMs,
    tokenConsumption,
    cacheHitRatio,
    historyTimeline,
    skillUsageBreakdown,
  };
}

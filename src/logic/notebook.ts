/**
 * Research Notebook File Editor Pure Logic
 * Decoupled helper functions for formatting, file stats, outline parsing, and format conversions.
 */

export interface NotebookFile {
  id: string;
  name: string;
  extension: 'md' | 'json' | 'ts' | 'py' | 'txt';
  category: 'synthesis' | 'physics' | 'history' | 'biophysics' | 'agent_skill';
  content: string;
  updatedAt: string;
  sizeBytes: number;
  tags: string[];
}

export interface FileStats {
  words: number;
  characters: number;
  lines: number;
  readingTimeMinutes: number;
}

export interface HeadingItem {
  level: number;
  text: string;
  line: number;
}

/**
 * Calculates word count, character count, lines, and reading time.
 */
export function calculateFileStats(content: string): FileStats {
  const characters = content.length;
  const lines = content ? content.split('\n').length : 0;
  const words = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;
  // Average reading speed: 200 words per minute
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    words,
    characters,
    lines,
    readingTimeMinutes,
  };
}

/**
 * Inserts markdown formatting syntax at selection range or appends.
 */
export function applyMarkdownFormat(
  content: string,
  selectionStart: number,
  selectionEnd: number,
  format: 'bold' | 'italic' | 'h1' | 'h2' | 'h3' | 'code' | 'codeblock' | 'math' | 'quote' | 'bullet' | 'task' | 'table'
): { newContent: string; newCursor: number } {
  const before = content.slice(0, selectionStart);
  const selected = content.slice(selectionStart, selectionEnd);
  const after = content.slice(selectionEnd);

  let insertion = '';
  let cursorOffset = 0;

  switch (format) {
    case 'bold':
      insertion = `**${selected || 'bold text'}**`;
      cursorOffset = selected ? insertion.length : 2;
      break;
    case 'italic':
      insertion = `*${selected || 'italic text'}*`;
      cursorOffset = selected ? insertion.length : 1;
      break;
    case 'h1':
      insertion = `\n# ${selected || 'Heading 1'}\n`;
      cursorOffset = insertion.length;
      break;
    case 'h2':
      insertion = `\n## ${selected || 'Heading 2'}\n`;
      cursorOffset = insertion.length;
      break;
    case 'h3':
      insertion = `\n### ${selected || 'Heading 3'}\n`;
      cursorOffset = insertion.length;
      break;
    case 'code':
      insertion = `\`${selected || 'code'}\``;
      cursorOffset = selected ? insertion.length : 1;
      break;
    case 'codeblock':
      insertion = `\n\`\`\`typescript\n${selected || '// Insert code here\n'}\`\`\`\n`;
      cursorOffset = insertion.length;
      break;
    case 'math':
      insertion = `$$ ${selected || '\\Delta Q = k_B T \\ln 2'} $$`;
      cursorOffset = insertion.length;
      break;
    case 'quote':
      insertion = `\n> ${selected || 'Important physical observation or hypothesis'}\n`;
      cursorOffset = insertion.length;
      break;
    case 'bullet':
      insertion = `\n- ${selected || 'Observation point'}\n`;
      cursorOffset = insertion.length;
      break;
    case 'task':
      insertion = `\n- [ ] ${selected || 'Experimental verification pending'}\n`;
      cursorOffset = insertion.length;
      break;
    case 'table':
      insertion = `\n| Metric | Silicon CMOS | Neuromorphic / Biology |\n|---|---|---|\n| Energy per op | ~1 pJ | ~10 fJ (Landauer bound ~0.018 eV) |\n| Signaling | Clocked Synchronous | Event-Driven Spikes |\n`;
      cursorOffset = insertion.length;
      break;
    default:
      insertion = selected;
      cursorOffset = selected.length;
  }

  const newContent = before + insertion + after;
  const newCursor = selectionStart + cursorOffset;
  return { newContent, newCursor };
}

/**
 * Extracts Markdown headings for an interactive Table of Contents outline.
 */
export function extractHeadingsOutline(content: string): HeadingItem[] {
  if (!content) return [];
  const lines = content.split('\n');
  const headings: HeadingItem[] = [];

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        line: index + 1,
      });
    }
  });

  return headings;
}

/**
 * Converts a research notebook markdown file into standard SKILL.md format
 * suitable for the Cross-App Studio Agent Skill Registry.
 */
export function convertNoteToSkillMarkdown(note: NotebookFile): string {
  const cleanTitle = note.name.replace(/\.[^/.]+$/, '').replace(/[_\s]+/g, '-').toLowerCase();
  const summary = `Agent skill synthesized from research note "${note.name}". Provides automated guidance on ${note.category}.`;

  return `---
name: ${cleanTitle}
description: ${summary}
category: ${note.category}
tags: ${JSON.stringify(note.tags)}
version: 1.0.0
---

# ${note.name}

## Overview
${summary}

## Extracted Research Blueprint
${note.content}

## Execution Directives
1. Query relevant experimental telemetry.
2. Verify thermodynamic and biophysical constraints against Landauer limit.
3. Record outputs to Firestore notebook registry.
`;
}

/**
 * Creates the initial seed set of comprehensive research notebook files.
 */
export function getInitialNotebookFiles(): NotebookFile[] {
  return [
    {
      id: 'file-genesis-synthesis',
      name: 'the_genesis_of_machine_cognition.md',
      extension: 'md',
      category: 'synthesis',
      tags: ['silicon', 'agi', 'thermodynamics', 'history'],
      sizeBytes: 3820,
      updatedAt: new Date().toISOString(),
      content: `# The Genesis of Machine Cognition: Research Blueprint & Synthesis

## Abstract
This document traces the physical and theoretical convergence of artificial intelligence—from the physical manipulation of electrical currents through doped silicon crystal wafers to emergent cognitive behaviors in deep neural models and the thermodynamic imperatives of neuromorphic biophysics.

### 1. The Physical Medium: Silicon Fabrication & Logic Gates
- **Silicon Medium**: Unlike copper which conducts electrons too freely, single-crystal silicon provides slight native resistance, enabling dynamic modulation via phosphorus (n-type) or boron (p-type) ion doping.
- **Physical Scale**: Nanometer transistor gates (~10–30 nm) contrast with influenza virus (~100 nm), red blood cell (~7,000 nm), and 300 mm silicon ingots.
- **Clock & IPC**: Physical execution speed is strictly bounded by Instructions Per Clock (IPC) alongside clock frequency (GHz).

### 2. Historical Logical Foundations
- **Ada Lovelace (1840s, Note A & Note G)**: Decoupled mechanical calculation from universal symbol manipulation; calculated Bernoulli numbers.
- **Lady Lovelace's Objection**: Asserted that machines cannot originate anything unprompted—revisited via the Bringsjord Lovelace Test (2001).
- **Alan Turing (1950, Computing Machinery and Intelligence)**: Proposed the Imitation Game (Turing Test) and conceptualized the infant cortex as an "unorganized machine" trained into organization.
- **McCulloch & Pitts (1943)**: Formalized biological neurons as binary threshold units, demonstrating complete logical universality.

### 3. Emergent Sparks of Artificial General Intelligence
- **Theory of Mind**: GPT-4 successfully navigated the Sally-Anne false-belief test and complex multi-agent intention attribution (Dropbox file relocation).
- **Physical Commonsense**: Successfully derived stable vertical balancing arrangements (e.g. 9 eggs in 3x3 grid on a book, supporting a laptop, bottle, and nail) that earlier models failed.
- **Autoregressive Bottleneck**: Sequential next-token generation without internal backtracking or recursive self-verification limits deeper deliberative reasoning.

### 4. Thermodynamic & Physical Bottlenecks
- **Von Neumann Memory Wall**: Energy spent charging/discharging copper interconnects ($E \\propto L$) exceeds arithmetic computation energy.
- **Landauer Floor**: Discarding one bit requires minimum heat dissipation:
$$ \\Delta Q = k_B T \\ln 2 \\approx 0.018\\text{ eV} \\quad (2.9 \\times 10^{-21}\\text{ J at } 300\\text{ K}) $$
- **Biophysical Brain Efficiency**: The human brain computes with 15–20 Watts, sparse asynchronous action potentials, and ~25% probabilistic synaptic transmission.
`,
    },
    {
      id: 'file-thermodynamics',
      name: 'landauer_thermodynamics_analysis.md',
      extension: 'md',
      category: 'physics',
      tags: ['landauer', 'energy', 'joules', 'cryogenic'],
      sizeBytes: 1940,
      updatedAt: new Date().toISOString(),
      content: `# Thermodynamic Limits & Landauer Principle Formulation

## Principle Statement
Formulated by Rolf Landauer in 1961, any logically irreversible manipulation of information—such as bit erasure or convergent register merging—must dissipate a minimum quantity of heat into its surroundings.

## Governing Equation
$$ \\Delta Q = k_B T \\ln 2 $$

Where:
- $k_B = 1.380649 \\times 10^{-23} \\text{ J/K}$ (Boltzmann constant)
- $T$ = absolute temperature in Kelvin
- $\\ln 2 \\approx 0.693147$

## Temperature Regimes & Energy Dissipation
| Operating Regime | Temperature (K) | Minimum Energy per Bit (Joules) | Minimum Energy (eV) |
|---|---|---|---|
| Deep Space / Cryogenic | 1 K | $9.57 \\times 10^{-24} \\text{ J}$ | $0.00006 \\text{ eV}$ |
| Liquid Nitrogen | 77 K | $7.37 \\times 10^{-22} \\text{ J}$ | $0.0046 \\text{ eV}$ |
| Room Temperature | 300 K | $2.87 \\times 10^{-21} \\text{ J}$ | $0.0179 \\text{ eV}$ |
| High Performance GPU Die | 360 K (87°C) | $3.45 \\times 10^{-21} \\text{ J}$ | $0.0215 \\text{ eV}$ |

## Physical Implications for AI Hardware
1. Current CMOS transistors dissipate roughly $10^{-12} \\text{ J}$ (1 pJ) to $10^{-14} \\text{ J}$ per switch—nearly six orders of magnitude above Landauer's floor.
2. Non-reversible logic gates discard state, generating irreversible heat. Reversible computing (billiard ball computers, quantum circuits) offers theoretical zero-dissipation paths.
`,
    },
    {
      id: 'file-biophysics',
      name: 'action_potential_ionic_dynamics.md',
      extension: 'md',
      category: 'biophysics',
      tags: ['neurons', 'synapse', 'sodium', 'potassium', 'stdp'],
      sizeBytes: 2150,
      updatedAt: new Date().toISOString(),
      content: `# Biophysics of Action Potentials & Neuromorphic SNNs

## Ion Concentrations and Membrane Potential
The resting membrane potential ($\sim -70\\text{ mV}$) is sustained by active transport:
- **$Na^+/K^+$ ATPase Pump**: Expels $3\\text{ Na}^+$ ions outward for every $2\\text{ K}^+$ ions imported, using ATP cellular energy.

## Sequence of the Action Potential Spike
1. **Stimulus & Threshold**: Excitatory post-synaptic potentials summate at the axon hillock until reaching the $-55\\text{ mV}$ firing threshold.
2. **Rapid Depolarization**: Voltage-gated $Na^+$ channels snap open. Sodium cascades into the cytoplasm along its electrochemical gradient, driving the membrane to $+30\\text{ mV}$ in under $1\\text{ ms}$.
3. **Repolarization**: $Na^+$ channels inactivate. Voltage-gated $K^+$ channels open, allowing potassium efflux down its concentration gradient.
4. **Refractory Period**: Hyperpolarization dips to $-80\\text{ mV}$ before resting equilibrium is restored.

## Probabilistic Synaptic Transmission
- In cortical synapses, action potentials do not trigger vesicle release deterministically.
- Experimental neurotransmitter vesicle release occurs with an empirical probability of approximately **25%** ($p \\approx 0.25$).
- This stochastic sparsity prevents seizure-like runaway amplification and drastically lowers total energy expenditure to 15–20 W for the entire human cortex.
`,
    },
    {
      id: 'file-mcculloch-pitts-spec',
      name: 'mcculloch_pitts_network.json',
      extension: 'json',
      category: 'physics',
      tags: ['mcp', 'neural_network', 'xor', 'hyperplane'],
      sizeBytes: 1120,
      updatedAt: new Date().toISOString(),
      content: JSON.stringify(
        {
          model: 'McCulloch-Pitts Formal Neuron Network',
          year: 1943,
          authors: ['Warren S. McCulloch', 'Walter Pitts'],
          paper: 'A Logical Calculus of the Ideas Immanent in Nervous Activity',
          nodes: [
            { id: 'input_x1', type: 'input', role: 'excitatory' },
            { id: 'input_x2', type: 'input', role: 'excitatory' },
            { id: 'hidden_1', type: 'threshold', theta: 1, excitatoryInputs: ['x1', 'x2'], inhibitoryInputs: [] },
            { id: 'hidden_2', type: 'threshold', theta: 2, excitatoryInputs: ['x1', 'x2'], inhibitoryInputs: [] },
            { id: 'output_xor', type: 'threshold', theta: 1, excitatoryInputs: ['hidden_1'], inhibitoryInputs: ['hidden_2'] }
          ],
          logicGate: 'XOR',
          isLinearlySeparable: false,
          requiredLayers: 2
        },
        null,
        2
      ),
    },
  ];
}

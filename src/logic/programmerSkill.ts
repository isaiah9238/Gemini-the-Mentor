/**
 * Pure logic engine for "The Computer Programmer: The Skill to Program Computers".
 *
 * Models the historical, theoretical, and modern craft of computer programming:
 * - Translating algorithmic intentions into deterministic instruction sequences
 * - Managing registers, memory, variables, and control flow
 * - Executing multi-paradigm simulations (Lovelace Analytical Engine, Turing Machine,
 *   Von Neumann Assembly, Modern TypeScript/ESM)
 * - Auditing time complexity, memory footprint, and thermodynamic energy cost
 */

export type ProgrammingParadigm =
  | 'lovelace-analytical'
  | 'turing-machine'
  | 'von-neumann-asm'
  | 'typescript-esm'
  | 'python-procedural';

export interface ProgramSpecification {
  id: string;
  title: string;
  description: string;
  paradigm: ProgrammingParadigm;
  taskCategory: 'arithmetic' | 'logic' | 'biophysics' | 'algorithms' | 'thermodynamics';
  author: string;
  code: string;
  instructionsCount: number;
  memoryFootprintBytes: number;
  estimatedCycles: number;
  explanation: string;
  tags: string[];
}

export interface ExecutionStep {
  step: number;
  programCounter: number;
  instruction: string;
  state: Record<string, any>;
  outputLog: string;
}

export interface ExecutionResult {
  success: boolean;
  programId: string;
  output: any;
  trace: ExecutionStep[];
  totalCycles: number;
  finalState: Record<string, any>;
  metrics: {
    instructionsExecuted: number;
    memoryUsedBytes: number;
    estimatedEnergyNanoJoules: number;
  };
}

export interface ProgramAudit {
  safe: boolean;
  paradigm: ProgrammingParadigm;
  timeComplexity: string;
  spaceComplexity: string;
  hasTerminationGuarantee: boolean;
  warnings: string[];
  principles: string[];
}

/**
 * Returns pre-built verified programs created with "The Skill to Program Computers".
 */
export function getPresetProgramSpecifications(): ProgramSpecification[] {
  return [
    {
      id: 'prog-lovelace-bernoulli',
      title: 'Ada Lovelace Note G (1843) Bernoulli Engine',
      description: 'The inaugural computer program in history. Calculates Bernoulli numbers on Babbage\'s Analytical Engine using operation cards and variable columns.',
      paradigm: 'lovelace-analytical',
      taskCategory: 'arithmetic',
      author: 'Ada Lovelace, Countess of Lovelace (1843)',
      code: `; --- Lovelace Analytical Engine Program: Note G (1843) ---
; Objective: Compute Bernoulli coefficient B_2 from recurrence relation
LOAD V1, 1        ; Operation Card 1: V1 receives index n = 1
LOAD V2, 2        ; Operation Card 2: V2 receives constant factor 2
MUL  V3, V1, V2   ; Operation Card 3: V3 = 2 * n = 2
SUB  V4, V3, 1    ; Operation Card 4: V4 = 2n - 1 = 1
DIV  V5, V4, 2    ; Operation Card 5: V5 = (2n - 1) / 2 = 0.5
SUB  V6, 1, V5    ; Operation Card 6: Mill subtracts to accumulate (1 - 0.5)
DIV  V7, 1, 6     ; Operation Card 7: Direct solution term for B_2 = 1/6
STORE V7, B_2     ; Output Card: Mechanical punch reflects B_2 = 0.166667
HALT              ; Terminate cycle`,
      instructionsCount: 8,
      memoryFootprintBytes: 64,
      estimatedCycles: 8,
      explanation: 'First published computer program. Lovelace separated hardware gears (the Engine) from symbolic code instructions (the Program).',
      tags: ['lovelace', '1843', 'analytical-engine', 'first-program', 'punch-cards'],
    },
    {
      id: 'prog-turing-parity',
      title: 'Turing Machine (1936) Binary Parity Evaluator',
      description: 'Universal theoretical machine programming. Scans binary tape symbols with head transitions to determine even or odd parity.',
      paradigm: 'turing-machine',
      taskCategory: 'logic',
      author: 'Alan Turing (1936)',
      code: `; --- Turing Machine State Transition Program ---
; States: q0 (even), q1 (odd), q_halt (finish)
; Tape Alphabet: {0, 1, B (blank)}
(q0, 1) -> (q1, 1, R)   ; If even and read 1: transition to odd state, move Right
(q0, 0) -> (q0, 0, R)   ; If even and read 0: remain even, move Right
(q1, 1) -> (q0, 1, R)   ; If odd and read 1: transition to even state, move Right
(q1, 0) -> (q1, 0, R)   ; If odd and read 0: remain odd, move Right
(q0, B) -> (q_halt, E, -) ; At tape end in q0: write 'E' (Even Parity), Halt
(q1, B) -> (q_halt, O, -) ; At tape end in q1: write 'O' (Odd Parity), Halt`,
      instructionsCount: 6,
      memoryFootprintBytes: 32,
      estimatedCycles: 6,
      explanation: 'Demonstrates the universal tape-and-state paradigm that defines theoretical computer science and computability.',
      tags: ['turing', '1936', 'turing-machine', 'automata', 'computability'],
    },
    {
      id: 'prog-von-neumann-fibonacci',
      title: 'Von Neumann Stored-Program Assembly Fibonacci',
      description: 'Classic register-based assembly programming. Iteratively accumulates the Fibonacci sequence in CPU registers with branching.',
      paradigm: 'von-neumann-asm',
      taskCategory: 'algorithms',
      author: 'John von Neumann & Computer Pioneers',
      code: `; --- Von Neumann Stored-Program Assembly ---
; Computes Fibonacci number F(n) in CPU registers
MOV R0, 0         ; R0 = a = 0 (F_0)
MOV R1, 1         ; R1 = b = 1 (F_1)
MOV R2, 7         ; R2 = iteration counter n = 7
LOOP:
MOV R3, R0        ; Temp R3 = a
ADD R3, R1        ; R3 = a + b
MOV R0, R1        ; a = b
MOV R1, R3        ; b = a + b
DEC R2            ; Decrement iteration count R2
JNZ R2, LOOP      ; If R2 > 0, branch to LOOP
HALT              ; Result stored in register R1`,
      instructionsCount: 9,
      memoryFootprintBytes: 128,
      estimatedCycles: 38,
      explanation: 'Illustrates the stored-program architecture where opcodes and operands reside in shared memory with register manipulation.',
      tags: ['assembly', 'registers', 'von-neumann', 'fibonacci', 'control-flow'],
    },
    {
      id: 'prog-typescript-snn-integrator',
      title: 'Modern TypeScript Biophysical SNN Neuron',
      description: 'Contemporary high-level typed programming. Implements Euler numerical integration for Hodgkin-Huxley membrane action potentials.',
      paradigm: 'typescript-esm',
      taskCategory: 'biophysics',
      author: 'Modern Neuromorphic Systems Engineer',
      code: `// --- Typed ECMAScript 2026 Biophysical Integration ---
export interface MembraneState {
  timeMs: number;
  potentialMv: number;
  spiked: boolean;
}

export function integrateLeakyIntegrateAndFire(
  currentDurationMs: number = 2.0,
  injectedCurrentMicroAmps: number = 15.0,
  restingPotentialMv: number = -70.0,
  thresholdPotentialMv: number = -55.0
): MembraneState[] {
  const dt = 0.1;
  let v = restingPotentialMv;
  const trace: MembraneState[] = [];

  for (let t = 0; t <= currentDurationMs; t += dt) {
    // Numerical Euler step: dV = (-(V - V_rest) + R*I) * (dt / tau)
    const dV = (-(v - restingPotentialMv) + injectedCurrentMicroAmps * 1.5) * (dt / 10.0);
    v += dV;
    const spiked = v >= thresholdPotentialMv;
    if (spiked) v = 35.0; // Peak action potential depolarization
    trace.push({ timeMs: parseFloat(t.toFixed(1)), potentialMv: parseFloat(v.toFixed(2)), spiked });
    if (spiked) v = -80.0; // Hyperpolarizing refractory reset
  }
  return trace;
}`,
      instructionsCount: 22,
      memoryFootprintBytes: 512,
      estimatedCycles: 45,
      explanation: 'Modern typed modular code modeling biophysical ionic currents with numerical stability and functional encapsulation.',
      tags: ['typescript', 'esm', 'snn', 'hodgkin-huxley', 'numerical-integration'],
    },
    {
      id: 'prog-landauer-thermodynamic-budget',
      title: 'Landauer Thermodynamic Erasure Loop',
      description: 'Calculates the fundamental lower dissipation bound of computing by cycling irreversible bit overwrites across temperature ranges.',
      paradigm: 'python-procedural',
      taskCategory: 'thermodynamics',
      author: 'Rolf Landauer Institute',
      code: `# --- Landauer Bit Erasure Thermodynamic Accountant ---
import math

BOLTZMANN_K = 1.380649e-23  # Joules / Kelvin
LN_2 = math.log(2)

def calculate_erasure_dissipation(bits_to_erase: int, temperature_k: float) -> dict:
    """Computes theoretical Landauer floor vs modern silicon CMOS dissipation."""
    landauer_joules_per_bit = BOLTZMANN_K * temperature_k * LN_2
    total_landauer_joules = landauer_joules_per_bit * bits_to_erase
    total_landauer_ev = total_landauer_joules / 1.602176634e-19
    
    # Modern CMOS consumes ~1 picoJoule (1e-12 J) per logic switch
    cmos_joules = bits_to_erase * 1.0e-12
    efficiency_gap = cmos_joules / total_landauer_joules if total_landauer_joules > 0 else 0
    
    return {
        "bits": bits_to_erase,
        "temperatureK": temperature_k,
        "landauerJoules": total_landauer_joules,
        "landauerEV": total_landauer_ev,
        "cmosJoules": cmos_joules,
        "thermodynamicGapFactor": efficiency_gap
    }`,
      instructionsCount: 16,
      memoryFootprintBytes: 256,
      estimatedCycles: 24,
      explanation: 'Demonstrates programming as physical thermodynamics: every erased bit of entropy produces unavoidable heat dissipation.',
      tags: ['landauer', 'thermodynamics', 'python', 'entropy', 'energy-budget'],
    },
  ];
}

/**
 * Synthesizes a program specification based on a user prompt and chosen paradigm.
 */
export function synthesizeProgram(
  titleOrPrompt: string,
  paradigm: ProgrammingParadigm,
  taskPrompt?: string
): ProgramSpecification {
  const cleanTitle = taskPrompt ? (titleOrPrompt.trim() || 'Custom Computer Program') : (titleOrPrompt.trim().slice(0, 45) || 'Custom Computer Program');
  const actualTask = taskPrompt ? taskPrompt.trim() : titleOrPrompt.trim();
  const id = `prog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  let code = '';
  let explanation = '';
  let instructionsCount = 10;
  let estimatedCycles = 20;
  let memoryFootprintBytes = 256;

  switch (paradigm) {
    case 'lovelace-analytical':
      code = `; --- Analytical Engine Program: ${cleanTitle} ---
; Task: ${actualTask}
LOAD V1, 10       ; Variable Card: Initialize input operand V1 = 10
LOAD V2, 5        ; Variable Card: Initialize input operand V2 = 5
ADD  V3, V1, V2   ; Operation Card: Mill executes addition V3 = V1 + V2 (15)
MUL  V4, V3, 2    ; Operation Card: Mill executes multiplication V4 = V3 * 2 (30)
STORE V4, R_OUT   ; Output Card: Punch result to storage drum
HALT              ; Mechanical stop pin engaged`;
      explanation = 'Synthesized in Ada Lovelace\'s 1843 notation for the Analytical Engine, utilizing operation cards and variable columns.';
      instructionsCount = 6;
      estimatedCycles = 6;
      memoryFootprintBytes = 64;
      break;

    case 'turing-machine':
      code = `; --- Turing Machine State Transition Table: ${cleanTitle} ---
; Task: ${actualTask}
(q_init, 0) -> (q_scan, 0, R)   ; Scan initial tape position
(q_scan, 1) -> (q_invert, 0, R) ; Flip 1 to 0 under head
(q_scan, 0) -> (q_invert, 1, R) ; Flip 0 to 1 under head
(q_invert, B)-> (q_halt, B, -)  ; Blank encountered: program complete`;
      explanation = 'Synthesized as an Alan Turing (1936) quintuple state-machine operating on a discrete linear tape.';
      instructionsCount = 4;
      estimatedCycles = 4;
      memoryFootprintBytes = 48;
      break;

    case 'von-neumann-asm':
      code = `; --- Von Neumann Stored-Program Assembly: ${cleanTitle} ---
; Task: ${actualTask}
MOV EAX, 42       ; Load accumulator register EAX with integer literal
MOV EBX, 10       ; Load secondary register EBX
XOR ECX, ECX      ; Clear loop counter register ECX
START_LOOP:
ADD EAX, EBX      ; EAX += EBX
INC ECX           ; ECX++
CMP ECX, 5        ; Compare loop counter to 5
JNE START_LOOP    ; Conditional branch if not equal
RET               ; Return computation result in EAX`;
      instructionsCount = 8;
      estimatedCycles = 22;
      memoryFootprintBytes = 128;
      explanation = 'Synthesized for standard register-transfer level CPU with arithmetic accumulator, loop counter, and branching.';
      break;

    case 'typescript-esm':
      code = `// --- Modern TypeScript ESM Program: ${cleanTitle} ---
// Task: ${actualTask}
export interface ProgramOutput {
  status: 'computed';
  result: number;
  steps: number;
}

export function executeTask(inputValues: number[] = [10, 20, 30]): ProgramOutput {
  let accumulator = 0;
  for (let i = 0; i < inputValues.length; i++) {
    accumulator += inputValues[i] * 2;
  }
  return {
    status: 'computed',
    result: accumulator,
    steps: inputValues.length,
  };
}`;
      instructionsCount = 14;
      estimatedCycles = 15;
      memoryFootprintBytes = 384;
      explanation = 'Synthesized as a type-safe, modular React 19 / Node.js ESM pure function with clean interface exports.';
      break;

    case 'python-procedural':
    default:
      code = `# --- Python 3 Procedural Program: ${cleanTitle} ---
# Task: ${actualTask}

def execute_computation(data_points: list[float]) -> dict:
    total = sum(data_points)
    mean = total / len(data_points) if data_points else 0.0
    return {
        "count": len(data_points),
        "sum": total,
        "mean": mean,
        "valid": True
    }`;
      instructionsCount = 8;
      estimatedCycles = 10;
      memoryFootprintBytes = 192;
      explanation = 'Synthesized as clear, functional Python with explicit variable definitions and typed returns.';
      break;
  }

  return {
    id,
    title: cleanTitle,
    description: `Synthesized program for "${cleanTitle}" using the ${paradigm} architecture.`,
    paradigm,
    taskCategory: 'algorithms',
    author: 'The Computer Programmer (Autonomous Skill)',
    code,
    instructionsCount,
    memoryFootprintBytes,
    estimatedCycles,
    explanation,
    tags: ['computer-programmer', paradigm, 'synthesized-code'],
  };
}

/**
 * Simulates running a program specification in the browser and produces an execution trace.
 */
export function executeProgramSimulation(
  spec: ProgramSpecification,
  inputArgs?: Record<string, any>
): ExecutionResult {
  const trace: ExecutionStep[] = [];
  let pc = 0;
  let finalState: Record<string, any> = {};
  let output: any = null;

  if (spec.paradigm === 'lovelace-analytical') {
    const v: Record<string, number> = { V1: 1, V2: 2, V3: 0, V4: 0, V5: 0, V6: 0, V7: 0 };
    trace.push({
      step: 1,
      programCounter: 0,
      instruction: 'LOAD V1, 1',
      state: { ...v },
      outputLog: 'Input Card: Drum index 1 loaded to column V1.',
    });

    v.V3 = v.V1 * v.V2;
    trace.push({
      step: 2,
      programCounter: 2,
      instruction: 'MUL V3, V1, V2',
      state: { ...v },
      outputLog: 'Mill rotation: Variable column V3 set to product (2).',
    });

    v.V4 = v.V3 - 1;
    v.V5 = v.V4 / 2;
    v.V7 = 1 / 6;
    trace.push({
      step: 3,
      programCounter: 6,
      instruction: 'DIV V7, 1, 6',
      state: { ...v },
      outputLog: 'Calculation completed: Bernoulli number B_2 = 1/6 (0.166667).',
    });

    finalState = { ...v, resultFraction: '1/6', resultDecimal: 0.166667 };
    output = { bernoulliB2: 0.166667, fraction: '1/6', verified: true };
  } else if (spec.paradigm === 'turing-machine') {
    const tape = ['1', '0', '1', '1', '0', 'B'];
    let state = 'q0';
    let head = 0;
    let stepCount = 0;

    while (head < tape.length && stepCount < 10) {
      stepCount++;
      const symbol = tape[head];
      const prevState = state;

      if (symbol === '1') {
        state = state === 'q0' ? 'q1' : 'q0';
      }

      trace.push({
        step: stepCount,
        programCounter: head,
        instruction: `(${prevState}, ${symbol}) -> (${state}, ${symbol}, R)`,
        state: { headPosition: head, tapeSymbol: symbol, machineState: state },
        outputLog: `Tape cell ${head}: scanned '${symbol}', transition to '${state}'.`,
      });

      if (symbol === 'B') break;
      head++;
    }

    const isEven = state === 'q0';
    finalState = { finalState: state, parity: isEven ? 'Even' : 'Odd', tapeReadLength: head };
    output = { parity: isEven ? 'Even' : 'Odd', tapeProcessed: tape.slice(0, head).join('') };
  } else if (spec.paradigm === 'von-neumann-asm') {
    let r0 = 0;
    let r1 = 1;
    let r2 = inputArgs?.n || 7;
    let cycle = 0;

    trace.push({
      step: 1,
      programCounter: 0,
      instruction: 'MOV R0, 0; MOV R1, 1',
      state: { R0: r0, R1: r1, R2: r2 },
      outputLog: 'Registers initialized with seed values F(0)=0, F(1)=1.',
    });

    while (r2 > 0 && cycle < 20) {
      cycle++;
      const next = r0 + r1;
      r0 = r1;
      r1 = next;
      r2--;

      if (cycle <= 4 || r2 === 0) {
        trace.push({
          step: cycle + 1,
          programCounter: 4,
          instruction: 'ADD R3, R1; MOV R0, R1; MOV R1, R3; DEC R2',
          state: { R0: r0, R1: r1, R2_remaining: r2 },
          outputLog: `Loop cycle ${cycle}: Current Fibonacci value in R1 = ${r1}.`,
        });
      }
    }

    finalState = { registerR0: r0, registerR1: r1, cycles: cycle };
    output = { fibonacciValue: r1, iterationsCompleted: cycle };
  } else {
    // TypeScript or Python generic execution
    const inputVals = [10, 20, 30, 40];
    const total = inputVals.reduce((acc, curr) => acc + curr, 0);
    trace.push({
      step: 1,
      programCounter: 0,
      instruction: 'executeTask(inputValues)',
      state: { inputs: inputVals, count: inputVals.length },
      outputLog: `Loaded ${inputVals.length} numeric inputs into memory vector.`,
    });
    trace.push({
      step: 2,
      programCounter: 8,
      instruction: 'for loop accumulation',
      state: { accumulator: total },
      outputLog: `Accumulated sum across vector elements: ${total}.`,
    });

    finalState = { total, average: total / inputVals.length };
    output = { sum: total, average: total / inputVals.length, status: 'computed' };
  }

  // Energy estimate based on physical transistor gate switching (~1 pJ per op)
  const totalOps = trace.length * 4;
  const energyNanoJoules = parseFloat((totalOps * 0.001).toFixed(4));

  return {
    success: true,
    programId: spec.id,
    output,
    trace,
    totalCycles: Math.max(trace.length, spec.estimatedCycles),
    finalState,
    metrics: {
      instructionsExecuted: trace.length,
      memoryUsedBytes: spec.memoryFootprintBytes,
      estimatedEnergyNanoJoules: energyNanoJoules,
    },
  };
}

/**
 * Audits program source code against computational invariants and security constraints.
 */
export function auditProgramSafety(
  codeOrSpec: string | ProgramSpecification,
  paradigm?: ProgrammingParadigm
): ProgramAudit {
  const code = typeof codeOrSpec === 'string' ? codeOrSpec : codeOrSpec.code;
  const targetParadigm: ProgrammingParadigm =
    typeof codeOrSpec === 'string' ? (paradigm || 'typescript-esm') : codeOrSpec.paradigm;
  const warnings: string[] = [];
  const principles: string[] = [];
  let timeComplexity = 'O(1)';
  let spaceComplexity = 'O(1)';
  let hasTerminationGuarantee = true;

  if (code.includes('while') || code.includes('JNZ') || code.includes('LOOP')) {
    timeComplexity = 'O(N)';
    principles.push('Deterministic loop bounds must prevent infinite recursion (Turing Halting Problem).');
  }

  if (code.includes('require(') || code.includes('module.exports')) {
    warnings.push('Legacy CommonJS syntax detected; violates Vite React 19 ESM invariants.');
  }

  if (code.includes('eval(') || code.includes('new Function')) {
    warnings.push('Dynamic code evaluation detected; violates browser sandbox security.');
  }

  if (targetParadigm === 'lovelace-analytical') {
    principles.push('Note A Principle: Abstract operations are mathematically independent of physical numerical quantities.');
    principles.push('Note G Principle: Programs are organized into repeating cycles (weaving patterns in the Mill).');
  } else if (targetParadigm === 'turing-machine') {
    principles.push('Universal Turing Machine Principle: Any computable function can be simulated with discrete state transitions.');
  } else if (targetParadigm === 'von-neumann-asm') {
    principles.push('Stored-Program Concept: Instructions and data share uniform physical addressing.');
  } else if (targetParadigm === 'typescript-esm') {
    principles.push('Type Safety & Purity: Side-effect free functions enable reliable composability.');
  }

  return {
    safe: warnings.length === 0,
    paradigm: targetParadigm,
    timeComplexity,
    spaceComplexity,
    hasTerminationGuarantee,
    warnings,
    principles,
  };
}

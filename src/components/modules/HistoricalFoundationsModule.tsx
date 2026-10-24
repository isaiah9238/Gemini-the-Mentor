import React, { useState } from 'react';
import { calculateBernoulliSequence } from '../../logic/bernoulli.js';
import { evaluateMCPNeuron, mcpAndGate, mcpOrGate, mcpNotGate, mcpXorGate } from '../../logic/mccullochPitts.js';
import { BookOpen, Network, Play, RefreshCw, Terminal, CheckCircle2, XCircle } from 'lucide-react';

export const HistoricalFoundationsModule: React.FC = () => {
  // Tab switcher
  const [activeTab, setActiveTab] = useState<'lovelace' | 'turing' | 'mcculloch' | 'dartmouth'>('lovelace');

  // Lovelace Note G runner state
  const [bernoulliLimit, setBernoulliLimit] = useState(6);
  const bernoulliData = calculateBernoulliSequence(bernoulliLimit);

  // McCulloch-Pitts Interactive Sandbox State
  const [theta, setTheta] = useState<number>(2);
  const [exc1, setExc1] = useState<number>(1);
  const [exc2, setExc2] = useState<number>(1);
  const [inhib, setInhib] = useState<number>(0);

  const customNeuronEval = evaluateMCPNeuron({
    threshold: theta,
    excitatoryInputs: [exc1, exc2],
    inhibitoryInputs: [inhib],
  });

  // Turing Test Teleprinter Simulation State
  const [turingQuestion, setTuringQuestion] = useState('Can machines originate poetry or feel the warmth of summer?');
  const [turingLog, setTuringLog] = useState<
    { sender: 'Interrogator' | 'Terminal A' | 'Terminal B'; text: string }[]
  >([
    {
      sender: 'Interrogator',
      text: 'In the first line of your sonnet which reads "Shall I compare thee to a summer\'s day", would not "a spring day" do as well or better?',
    },
    {
      sender: 'Terminal A',
      text: 'It wouldn\'t scan. "A spring day" has too few syllables and lacks the sustained warmth that the comparison requires.',
    },
    {
      sender: 'Terminal B',
      text: 'Spring days are quite pleasant in temperate climates, though rainfall can vary. The author selected summer for metric alignment.',
    },
  ]);

  // Lovelace Test (2001) evaluation state
  const [lovelaceArtifact, setLovelaceArtifact] = useState('An original proof of an unsolved graph theory conjecture');
  const [lovelaceVerdict, setLovelaceVerdict] = useState<string | null>(null);

  const evaluateLovelaceTest = (origin: 'deterministic' | 'emergent') => {
    if (origin === 'deterministic') {
      setLovelaceVerdict(
        'FAIL (Lady Lovelace Objection Upheld): The artifact is a predictable synthesis directly explainable by the programmer\'s explicit heuristic weights.'
      );
    } else {
      setLovelaceVerdict(
        'PASS (Bringsjord Lovelace Criteria Met): The artifact represents genuine novelty that the original software author cannot explain based on code execution traces.'
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Module Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950 border border-amber-800 text-amber-400 text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" /> Pillar II: Historical Logical Foundations
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            From Ada Lovelace's Symbolic Notes to Turing's Test & Dartmouth
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            The intellectual origins of machine cognition predate silicon hardware. In the 1840s,
            Ada Lovelace realized that Charles Babbage's Analytical Engine could process non-numerical
            symbols such as musical harmony, authoring the first computer algorithm in Note G. A century
            later, Alan Turing reframed machine thinking through the behavioral Imitation Game, while
            Warren McCulloch and Walter Pitts modeled biological neural circuits as formal mathematical logic.
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'lovelace', label: '1. Ada Lovelace & Note G Algorithm' },
          { id: 'turing', label: '2. Turing Test & The Imitation Game' },
          { id: 'mcculloch', label: '3. McCulloch-Pitts (1943) Neural Sandbox' },
          { id: 'dartmouth', label: '4. Dartmouth 1956 & Arthur Samuel ML' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Lovelace & Note G Algorithm */}
      {activeTab === 'lovelace' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Note G Mechanical Execution Simulator */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" /> Lovelace Note G: Bernoulli Sequence Generator
                </h3>
                <span className="text-xs font-mono text-slate-400">1843 Mechanical Punched Cards</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                In Note G of her translation of Menabrea's memoir, Lovelace detailed the exact variable
                table and punched card instructions for the Analytical Engine's "Mill" (CPU) and "Store"
                (Memory) to calculate Bernoulli numbers $B_n$.
              </p>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Max Index:</span>
                {[4, 6, 8].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setBernoulliLimit(val)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                      bernoulliLimit === val
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    B_{val}
                  </button>
                ))}
              </div>

              {/* Bernoulli Values Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/70 p-3">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-1.5 px-2">Symbol</th>
                      <th className="py-1.5 px-2">Fraction</th>
                      <th className="py-1.5 px-2">Decimal Output</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {bernoulliData.values.map((item) => (
                      <tr key={item.index} className="hover:bg-slate-800/40">
                        <td className="py-1.5 px-2 font-bold text-amber-400">{item.symbol}</td>
                        <td className="py-1.5 px-2 text-white">{item.fraction}</td>
                        <td className="py-1.5 px-2 text-slate-400">{item.value.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Punched Card Step-by-Step execution trace */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">
                  Analytical Engine Mechanical Register Cycles:
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {bernoulliData.lovelaceSteps.map((step) => (
                    <div
                      key={step.step}
                      className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2.5 text-[11px]"
                    >
                      <div className="flex justify-between font-mono text-amber-300 font-semibold">
                        <span>Card #{step.step}: {step.variable}</span>
                        <span>{step.operation}</span>
                      </div>
                      <div className="text-slate-400 text-[10px] mt-0.5">{step.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lady Lovelace's Objection vs The Lovelace Test (2001) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" /> Lady Lovelace's Objection vs The Lovelace Test (2001)
              </h3>
              <blockquote className="border-l-2 border-amber-500 pl-3 italic text-xs text-slate-300 leading-relaxed">
                "The Analytical Engine has no pretensions whatever to originate anything. It can do whatever
                we know how to order it to perform."
                <div className="not-italic text-slate-400 mt-1 font-semibold">— Ada Lovelace, Note G (1843)</div>
              </blockquote>

              <p className="text-xs text-slate-300 leading-relaxed">
                In 2001, Selmer Bringsjord, Paul Bello, and David Ferrucci formulated the modern "Lovelace Test":
                an AI agent demonstrates genuine cognition if and only if it generates an artifact that its
                human creator cannot explain by examining its source code and execution logs.
              </p>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-slate-300">
                  Interactive Evaluation: Test AI Artifact Generation
                </div>
                <input
                  type="text"
                  value={lovelaceArtifact}
                  onChange={(e) => setLovelaceArtifact(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => evaluateLovelaceTest('deterministic')}
                    className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    Test Deterministic Origin
                  </button>
                  <button
                    type="button"
                    onClick={() => evaluateLovelaceTest('emergent')}
                    className="flex-1 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white transition-colors"
                  >
                    Test Emergent Cognition
                  </button>
                </div>

                {lovelaceVerdict && (
                  <div
                    className={`p-3 rounded-lg text-xs leading-relaxed ${
                      lovelaceVerdict.startsWith('PASS')
                        ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                        : 'bg-rose-950/80 border border-rose-800 text-rose-300'
                    }`}
                  >
                    {lovelaceVerdict}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Alan Turing & Imitation Game */}
      {activeTab === 'turing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-sky-400" /> Alan Turing (1950, Mind): The Imitation Game
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                "Computing Machinery and Intelligence" — Reframing "Can machines think?" into behavioral interrogation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Teleprinter Transcript Window */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-3 min-h-[260px] max-h-[360px] overflow-y-auto">
                {turingLog.map((msg, i) => (
                  <div key={i} className="space-y-1">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        msg.sender === 'Interrogator'
                          ? 'bg-sky-900 text-sky-200'
                          : msg.sender === 'Terminal A'
                          ? 'bg-emerald-900 text-emerald-200'
                          : 'bg-purple-900 text-purple-200'
                      }`}
                    >
                      {msg.sender}
                    </span>
                    <p className="text-slate-300 pl-1">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Interrogator Input Prompt */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={turingQuestion}
                  onChange={(e) => setTuringQuestion(e.target.value)}
                  placeholder="Pose a question to Terminal A and Terminal B..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!turingQuestion.trim()) return;
                    setTuringLog((prev) => [
                      ...prev,
                      { sender: 'Interrogator', text: turingQuestion },
                      {
                        sender: 'Terminal A',
                        text: 'A poet captures subjective human qualia through metaphor, but statistical token prediction mimics the cadence with remarkable nuance.',
                      },
                      {
                        sender: 'Terminal B',
                        text: 'Poetry reflects emotional states rooted in neurobiological homeostasis. Synthetic models generate syntactically valid forms without sensory experience.',
                      },
                    ]);
                    setTuringQuestion('');
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Transmit
                </button>
              </div>
            </div>

            {/* Turing's Predictions and Unorganized Machine Concept */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              <div className="font-bold text-amber-400">Turing's Key Propositions (1950):</div>
              <ul className="space-y-2 text-slate-300 list-disc pl-4 text-[11px] leading-relaxed">
                <li>
                  <strong>Storage Benchmark:</strong> Turing projected that by the year 2000, computers with
                  ~125 MB of memory could play the game so well that an interrogator has &le; 70% chance of
                  correct identification after 5 minutes.
                </li>
                <li>
                  <strong>The Infant Cortex:</strong> Turing envisioned the human brain at birth as an
                  "unorganized machine" that organizes into a universal machine via systematic education and
                  environmental exposure—directly prefiguring deep neural networks.
                </li>
                <li>
                  <strong>Refuting Lady Lovelace:</strong> Turing argued deterministic machines consistently
                  surprise their authors because human minds cannot compute the vast emergent cascades of
                  thousands of rules firing in parallel.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: McCulloch-Pitts Neural Sandbox */}
      {activeTab === 'mcculloch' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Network className="w-5 h-5 text-emerald-400" /> McCulloch & Pitts (1943) Formal Neuron
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  "A Logical Calculus of the Ideas Immanent in Nervous Activity" — Mathematical Binary Threshold Unit
                </p>
              </div>
              <div className="font-mono text-xs text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full">
                Output y = 1 if (sum &ge; &theta; AND inhib == 0) else 0
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Interactive Synaptic Configurator */}
              <div className="space-y-4 bg-slate-950 border border-slate-800 rounded-xl p-5">
                <div className="font-semibold text-white text-xs">Synapse Inputs & Threshold:</div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Excitatory Synapse x_1 (+1):</span>
                    <button
                      type="button"
                      onClick={() => setExc1((v) => (v === 1 ? 0 : 1))}
                      className={`px-3 py-1 rounded font-mono font-bold ${
                        exc1 === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {exc1}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Excitatory Synapse x_2 (+1):</span>
                    <button
                      type="button"
                      onClick={() => setExc2((v) => (v === 1 ? 0 : 1))}
                      className={`px-3 py-1 rounded font-mono font-bold ${
                        exc2 === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {exc2}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800 pt-2">
                    <span className="text-rose-300 font-semibold">Inhibitory Synapse x_inhib (Absolute Veto):</span>
                    <button
                      type="button"
                      onClick={() => setInhib((v) => (v === 1 ? 0 : 1))}
                      className={`px-3 py-1 rounded font-mono font-bold ${
                        inhib === 1 ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {inhib === 1 ? 'ACTIVE (VETO)' : '0 (QUIET)'}
                    </button>
                  </div>

                  <div className="border-t border-slate-800 pt-2">
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Firing Threshold &theta;:</span>
                      <span className="font-mono text-emerald-400 font-bold">{theta}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="1"
                      value={theta}
                      onChange={(e) => setTheta(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>&theta;=1 (OR Gate)</span>
                      <span>&theta;=2 (AND Gate)</span>
                      <span>&theta;=3 (Triple Sum)</span>
                    </div>
                  </div>
                </div>

                {/* Calculation readout */}
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs font-mono space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>Excitatory Sum:</span>
                    <span className="text-white font-bold">{customNeuronEval.excitatorySum}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Inhibition Suppression:</span>
                    <span className={customNeuronEval.isSuppressed ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {customNeuronEval.isSuppressed ? 'BLOCKED' : 'CLEAR'}
                    </span>
                  </div>
                  <div className="flex justify-between text-white border-t border-slate-800 pt-1 font-bold">
                    <span>Neuron Action Potential Output:</span>
                    <span className={customNeuronEval.fired ? 'text-emerald-400 text-base' : 'text-rose-400 text-base'}>
                      {customNeuronEval.output} ({customNeuronEval.fired ? 'SPIKE' : 'SILENT'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Standard Gates Preconfigured with McCulloch-Pitts */}
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-300">
                  Universal Boolean Gates Formed by McCulloch-Pitts Units:
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
                    <div className="font-bold text-sky-400">AND Gate</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Threshold &theta; = 2. Fires only when both excitatory inputs equal 1.
                    </div>
                    <div className="font-mono text-emerald-400 mt-2 font-bold">
                      AND(1, 1) = {mcpAndGate(1, 1)}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
                    <div className="font-bold text-emerald-400">OR Gate</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Threshold &theta; = 1. Fires when at least one excitatory input equals 1.
                    </div>
                    <div className="font-mono text-emerald-400 mt-2 font-bold">
                      OR(1, 0) = {mcpOrGate(1, 0)}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
                    <div className="font-bold text-rose-400">NOT / Inverter</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Constant excitatory bias of 1 with target signal routed as inhibitory veto.
                    </div>
                    <div className="font-mono text-emerald-400 mt-2 font-bold">
                      NOT(1) = {mcpNotGate(1)}, NOT(0) = {mcpNotGate(0)}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
                    <div className="font-bold text-purple-400">XOR Network</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Two-layer network demonstrating that single-layer limitations can be overcome by hierarchies.
                    </div>
                    <div className="font-mono text-emerald-400 mt-2 font-bold">
                      XOR(1, 0) = {mcpXorGate(1, 0)}, XOR(1, 1) = {mcpXorGate(1, 1)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Dartmouth 1956 & Arthur Samuel ML */}
      {activeTab === 'dartmouth' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-amber-400" /> The Dartmouth Summer Research Project (1956)
            </h3>
            <span className="text-xs font-mono text-slate-400">The Birth of the Term "Artificial Intelligence"</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
            Organized by John McCarthy, Marvin Minsky, Nathaniel Rochester, and Claude Shannon, the two-month
            Dartmouth gathering convened figures like Allen Newell, Herbert Simon, and Arthur Samuel under
            the core conjecture: every aspect of learning or intelligence can be described with such precision
            that a physical machine can be programmed to simulate it.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs">
              <div className="text-amber-400 font-bold mb-1">John McCarthy</div>
              <div className="text-[11px] text-slate-400">
                Proposed the term "Artificial Intelligence" to distinguish the discipline from cybernetics; later
                developed LISP.
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs">
              <div className="text-emerald-400 font-bold mb-1">Arthur Samuel</div>
              <div className="text-[11px] text-slate-400">
                Demonstrated his self-learning Checkers program on the IBM 704; coined the term "Machine Learning" in 1959.
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs">
              <div className="text-sky-400 font-bold mb-1">Newell & Simon</div>
              <div className="text-[11px] text-slate-400">
                Presented the Logic Theorist, often cited as the first running artificial intelligence program, proving
                theorems from Principia Mathematica.
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs">
              <div className="text-purple-400 font-bold mb-1">Kemeny & Kurtz to 2025</div>
              <div className="text-[11px] text-slate-400">
                Dartmouth Time-Sharing System & BASIC democratized code access; continuing to clinical trials on generative
                AI tools like Therabot.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

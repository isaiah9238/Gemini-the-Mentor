import React, { useState } from 'react';
import { SparksStackScene } from '../3d/SparksStackScene.js';
import { ProteinViewerScene } from '../3d/ProteinViewerScene.js';
import { Sparkles, Brain, Box, Palette, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export const EmergentSparksModule: React.FC = () => {
  const [activeSparksTab, setActiveSparksTab] = useState<'tom' | 'physics' | 'kandinsky' | 'autoregressive' | 'alphafold'>('physics');

  // Theory of Mind Sally-Anne / Dropbox state
  const [dropboxScenario, setDropboxScenario] = useState<'original' | 'moved'>('original');

  // Autoregressive token sequence simulation
  const [tokenStep, setTokenStep] = useState(2);
  const tokenSequence = [
    { token: 'The', prob: '98%', alt: ['A', 'This'] },
    { token: 'quick', prob: '84%', alt: ['brown', 'fast'] },
    { token: 'brown', prob: '91%', alt: ['fox', 'dog'] },
    { token: 'fox', prob: '96%', alt: ['rabbit', 'bear'] },
    { token: 'jumps', prob: '78%', alt: ['leaps', 'runs'] },
    { token: 'over', prob: '92%', alt: ['across', 'past'] },
    { token: 'the', prob: '99%', alt: ['a', 'that'] },
    { token: 'lazy', prob: '88%', alt: ['sleeping', 'old'] },
    { token: 'dog.', prob: '94%', alt: ['cat.', 'hound.'] },
  ];

  // Kandinsky procedural generator seed
  const [kandinskySeed, setKandinskySeed] = useState(42);

  return (
    <div className="space-y-8">
      {/* Module Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950 border border-purple-800 text-purple-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Pillar III: Metaphorical Sparks of Artificial General Intelligence
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Emergent Cognitive Capabilities & Autoregressive Bottlenecks
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            In March 2023, Microsoft Research documented early experiments with GPT-4 demonstrating
            emergent abilities across Theory of Mind, intuitive 3D spatial commonsense, geometric art
            synthesis, and automated empirical discovery via AlphaFold—while remaining fundamentally bounded
            by the linear, non-backtracking nature of autoregressive next-token prediction.
          </p>
        </div>
      </div>

      {/* Sparks Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'physics', label: '1. 3D Physical Commonsense: Egg Stack' },
          { id: 'tom', label: '2. Theory of Mind & Social Logic' },
          { id: 'alphafold', label: '3. AlphaFold & Levinthal Paradox' },
          { id: 'kandinsky', label: '4. Kandinsky Spatial Geometry' },
          { id: 'autoregressive', label: '5. Autoregressive Bottlenecks' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSparksTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSparksTab === tab.id
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Physical Commonsense 3D Stack */}
      {activeSparksTab === 'physics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-amber-400" /> The 5-Object Vertical Stack Challenge
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Physical commonsense benchmark: Book flat &rarr; 9 Eggs 3x3 &rarr; Laptop flat &rarr; Bottle upright &rarr; Nail balanced on cap.
              </p>
            </div>
          </div>
          <SparksStackScene />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="font-bold text-sky-400 mb-1">1. Wide Level Base</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Placing the book flat on a table establishes a high friction, broad footprint that prevents
                tipping moments from lower surface irregularities.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="font-bold text-emerald-400 mb-1">2. 3x3 Egg Weight Distribution</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                A single egg crushes under concentrated point loads. Arranging 9 eggs across a uniform grid
                distributes the laptop's mass (~1.5 kg) evenly across all shells in compression.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="font-bold text-purple-400 mb-1">3. Co-aligned Center of Gravity</div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Aligning the upright empty bottle and the balanced nail directly over the geometric centroid
                minimizes rotational torque and maintains static equilibrium.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Theory of Mind */}
      {activeSparksTab === 'tom' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test 1: Sally-Anne / Dropbox False Belief */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-sky-400" /> Sally-Anne False-Belief: The Dropbox Test
              </h3>
              <span className="text-xs font-mono text-slate-400">Cognitive Perspective Taking</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In the modern digital formulation: Alice uploads a file into the shared "Presentations" folder.
              Later, Bob quietly moves the file into "Archive" without notifying Alice. Where will Alice look
              when she needs the file tomorrow?
            </p>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-300">Model Reasoning Trace:</div>
              <div className="p-3 bg-slate-900/80 rounded-lg text-xs font-mono text-emerald-300 border border-emerald-900/50 leading-relaxed">
                Alice will look in the "Presentations" folder. Because Bob did not inform Alice of the file move,
                her epistemic mental state contains the belief that the file remains where she originally saved it.
                True Theory of Mind requires decoupling one's own omniscient knowledge from an agent's incomplete perspective.
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Demonstrates 1st-order mental state attribution without perceptual leakage.</span>
            </div>
          </div>

          {/* Test 2: The ZURFIN Emotional Attribution */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" /> Nonsense Token Control: The ZURFIN Task
              </h3>
              <span className="text-xs font-mono text-slate-400">Intention Tracking</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To guarantee that large language models are not simply retrieving memorized stories from web data,
              researchers substitute nonsense words like "ZURFIN" to isolate pure reasoning:
            </p>

            <blockquote className="border-l-2 border-purple-500 pl-3 italic text-xs text-slate-300 leading-relaxed">
              Tom lost his ZURFIN. When Adam later shows off his own ZURFIN, Tom looks down sadly.
              Adam assumes Tom is simply tired from work.
            </blockquote>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
              <div className="font-bold text-slate-200">Inferred Multi-Agent State:</div>
              <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc pl-4">
                <li>
                  <strong>Tom's internal state:</strong> Sad specifically because of the visual reminder of his lost possession.
                </li>
                <li>
                  <strong>Adam's internal state:</strong> Unaware of Tom's loss; incorrectly attributes sadness to fatigue.
                </li>
                <li>
                  <strong>Model resolution:</strong> Recommends that Adam gently ask Tom why he seems down, bridging the asymmetric knowledge gap.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AlphaFold & Levinthal's Paradox */}
      {activeSparksTab === 'alphafold' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-400" /> AlphaFold: Overcoming Levinthal's Paradox
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cyrus Levinthal (1969): A 100-residue peptide has $3^{100} \approx 5 \times 10^{47}$ conformations, yet folds in milliseconds.
              </p>
            </div>
          </div>
          <ProteinViewerScene />
        </div>
      )}

      {/* Tab 4: Kandinsky Vector Art Generator */}
      {activeSparksTab === 'kandinsky' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-400" /> Kandinsky Composition 8: Abstract Vector Translation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Translating textual descriptions of geometric harmony into precise coordinate vectors.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setKandinskySeed((s) => s + 1)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Palette className="w-3.5 h-3.5" /> Re-seed Harmony ({kandinskySeed})
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vector Canvas */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-center">
              <svg viewBox="0 0 500 350" className="w-full h-auto max-h-[340px] rounded-lg bg-amber-50/95 shadow-inner">
                {/* Kandinsky style geometric elements */}
                <circle cx="120" cy="140" r="70" fill="#dc2626" opacity="0.85" />
                <circle cx="120" cy="140" r="50" fill="#1e3a8a" opacity="0.9" />
                <circle cx="120" cy="140" r="25" fill="#f59e0b" />

                <line x1="30" y1="280" x2="420" y2="40" stroke="#0f172a" strokeWidth="4" />
                <line x1="50" y1="300" x2="440" y2="60" stroke="#0f172a" strokeWidth="2" />
                <line x1="70" y1="320" x2="460" y2="80" stroke="#0f172a" strokeWidth="1.5" />

                <polygon points="320,100 400,240 280,260" fill="#0284c7" opacity="0.75" />
                <rect x="220" y="80" width="80" height="140" fill="#10b981" opacity="0.6" transform="rotate(15 260 150)" />

                <circle cx="360" cy="160" r="35" fill="none" stroke="#dc2626" strokeWidth="3" />
                <circle cx="360" cy="160" r="20" fill="#facc15" />

                {/* Checkerboard accent patch */}
                <g opacity="0.8">
                  <rect x="180" y="240" width="16" height="16" fill="#0f172a" />
                  <rect x="196" y="240" width="16" height="16" fill="#e2e8f0" />
                  <rect x="180" y="256" width="16" height="16" fill="#e2e8f0" />
                  <rect x="196" y="256" width="16" height="16" fill="#0f172a" />
                </g>
              </svg>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="font-bold text-white text-sm">Spatial Reasoning in Vector Form:</div>
              <p>
                In the Sparks of AGI study, GPT-4 was prompted to produce drawings in JavaScript and SVG resembling
                Wassily Kandinsky’s famous 1923 masterpiece <em>Composition 8</em>.
              </p>
              <p>
                Unlike image diffusion models that generate pixel bitmaps directly, language models must translate
                complex notions of balance, concentric circles, intersecting lines, and contrasting geometric weights
                into explicit numerical coordinates and SVG primitives.
              </p>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400">
                Points: Circle(120, 140, r=70), Line(30, 280 &rarr; 420, 40), Triangle(320, 100), Matrix Transform(rotate 15deg)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Autoregressive Bottlenecks */}
      {activeSparksTab === 'autoregressive' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" /> The Autoregressive Bottleneck: Next-Token Commitment
            </h3>
            <span className="text-xs font-mono text-slate-400">No Internal Backtracking</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
            Despite their emergent capabilities, standard large language models operate on autoregressive next-token
            prediction: P(w_t | w_1, w_2, ... w_t-1). Once a token is sampled and output, it becomes an
            immutable part of the context window. The model cannot pause, evaluate whether the path is leading to a
            logical contradiction, or backtrack to branch alternatives.
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="text-xs font-semibold text-slate-300">
              Interactive Sequential Generation Trace: Step {tokenStep} of {tokenSequence.length}
            </div>

            {/* Token chain */}
            <div className="flex flex-wrap gap-2 items-center">
              {tokenSequence.slice(0, tokenStep).map((tok, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white flex items-center gap-2 shadow-sm"
                >
                  <span className="font-bold text-emerald-400">{tok.token}</span>
                  <span className="text-[10px] text-slate-400">({tok.prob})</span>
                </div>
              ))}
              {tokenStep < tokenSequence.length && (
                <div className="px-3 py-1.5 rounded-lg border border-dashed border-sky-500/60 text-xs font-mono text-sky-400">
                  predicting next token...
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setTokenStep((s) => Math.min(tokenSequence.length, s + 1))}
                disabled={tokenStep >= tokenSequence.length}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
              >
                Sample Next Token <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTokenStep(1)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Reset Sequence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

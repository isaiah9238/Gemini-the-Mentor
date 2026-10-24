import React, { useState } from 'react';
import { NeuronMembraneScene } from '../3d/NeuronMembraneScene.js';
import { simulateSynapticTransmission } from '../../logic/biophysics.js';
import { Activity, Zap, Cpu, Compass, Sliders } from 'lucide-react';

export const NeuromorphicModule: React.FC = () => {
  // STDP interactive time delta slider (ms)
  const [deltaTMs, setDeltaTMs] = useState<number>(8);

  // Probabilistic synaptic transmission trials count
  const [trials, setTrials] = useState(100);
  const [probRate, setProbRate] = useState(0.25);
  const simResult = simulateSynapticTransmission(trials, probRate);

  // Compute STDP weight change
  // LTP: A+ * exp(-dt / tau+) when dt > 0
  // LTD: -A- * exp(dt / tau-) when dt < 0
  const computeSTDP = (dt: number) => {
    const A_plus = 1.0;
    const A_minus = 1.05;
    const tau = 20.0; // ms

    if (dt >= 0) {
      return A_plus * Math.exp(-dt / tau);
    } else {
      return -A_minus * Math.exp(dt / tau);
    }
  };

  const deltaW = computeSTDP(deltaTMs);

  return (
    <div className="space-y-8">
      {/* Module Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-semibold mb-3">
            <Activity className="w-3.5 h-3.5" /> Pillar V: Neuromorphic & Ionic Alternatives
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            The Biophysics of Energy-Efficient Machine Cognition
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            While supercomputing clusters require roughly 2.7 billion watts of power (equivalent to
            three nuclear power stations) to simulate human brain operations in real time, the biological
            brain consumes merely 15 to 20 watts. Neuromorphic architectures resolve the von Neumann
            bottleneck by integrating memory and compute directly in the physical substrate and computing
            via sparse, event-driven voltage spikes.
          </p>
        </div>
      </div>

      {/* 3D Neuronal Membrane & Action Potential Simulation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" /> 3D Neuronal Membrane & Ion Channel Simulation
          </h3>
          <span className="text-xs text-slate-400">Hodgkin-Huxley $Na^+ / K^+$ Pores</span>
        </div>
        <NeuronMembraneScene />
      </div>

      {/* Biophysical Synaptic Transmission & 25% Probability Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" /> Probabilistic Synaptic Vesicle Release
            </h3>
            <span className="text-xs font-mono text-emerald-400">~25% Cortical Transmission Rate</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Unlike deterministic silicon gates that fire 100% of the time, biological synapses operate
            probabilistically: typically only <strong>25% of electrical action potentials</strong> trigger
            neurotransmitter vesicle release across the synaptic cleft, preserving extreme metabolic efficiency.
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Stimulus Spike Pulse Count:</span>
              <span className="font-mono text-sky-400 font-bold">{trials} Spikes</span>
            </div>
            <input
              type="range"
              min="20"
              max="500"
              step="10"
              value={trials}
              onChange={(e) => setTrials(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                <div className="text-[11px] text-slate-400">Transmitted Synaptic Events:</div>
                <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                  {simResult.successfulTransmissions} / {trials}
                </div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                <div className="text-[11px] text-slate-400">Observed Transmission Efficiency:</div>
                <div className="text-xl font-mono font-bold text-sky-400 mt-1">
                  {(simResult.transmissionRate * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spike-Timing-Dependent Plasticity (STDP) Bench */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" /> Spike-Timing-Dependent Plasticity (STDP)
            </h3>
            <span className="text-xs font-mono text-purple-400">&Delta;w = f(&Delta;t)</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Hebbian learning ("cells that fire together, wire together") is mediated by the precise
            relative spike timing Δt = t_post - t_pre. Pre-synaptic arrival before
            post-synaptic firing triggers Long-Term Potentiation (LTP).
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Spike Interval Δt = t_post - t_pre:</span>
              <span className={`font-mono font-bold ${deltaTMs >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {deltaTMs > 0 ? `+${deltaTMs}` : deltaTMs} ms
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="40"
              step="1"
              value={deltaTMs}
              onChange={(e) => setDeltaTMs(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>-40 ms (LTD Depression)</span>
              <span>0 ms</span>
              <span>+40 ms (LTP Potentiation)</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400">Synaptic Weight Change &Delta;w:</div>
                <div
                  className={`text-xl font-mono font-bold mt-1 ${
                    deltaW >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {deltaW >= 0 ? `+${deltaW.toFixed(3)}` : deltaW.toFixed(3)}
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  deltaW >= 0
                    ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                    : 'bg-rose-950 border border-rose-800 text-rose-300'
                }`}
              >
                {deltaW >= 0 ? 'Long-Term Potentiation (LTP)' : 'Long-Term Depression (LTD)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Commercial Neuromorphic & Ionic Frontier Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" /> Commercial Frontier: Neuromorphic & Ionic Computing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="font-bold text-sky-400 mb-1">SpinCloud Systems</div>
            <div className="text-[10px] font-mono text-slate-500 mb-2">Dresden, Germany</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Commercializing digital spike processing architectures with packet-based sparse asynchronous
              communication for ultra-low latency event models.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="font-bold text-emerald-400 mb-1">Super-Turing AI</div>
            <div className="text-[10px] font-mono text-slate-500 mb-2">Texas A&M University</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Autonomous drone navigation powered by online Hebbian STDP plasticity without offline pre-training
              datasets, consuming a fraction of GPU power.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="font-bold text-purple-400 mb-1">NbO2 ECRAM Devices</div>
            <div className="text-[10px] font-mono text-slate-500 mb-2">Electrochemical Synaptic Memory</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Coupling niobium oxide spiking units with electrochemical memory to mimic the fast-slow dynamics
              of biological synapses on physical silicon.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
            <div className="font-bold text-amber-400 mb-1">Ionic Fluidic Computing</div>
            <div className="text-[10px] font-mono text-slate-500 mb-2">Lawrence Livermore (LLNL)</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Computing with physical ions ($Na^+, K^+$) through nanofluidic channels, emulating aqueous brain
              pathways for bio-compatible neural interfaces.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

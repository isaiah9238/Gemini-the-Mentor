import React, { useState } from 'react';
import { SiliconScene } from '../3d/SiliconScene.js';
import { calculateThroughput } from '../../logic/physics.js';
import { Cpu, Zap, Layers, Activity, Sliders, CheckCircle2 } from 'lucide-react';

export const PhysicalSiliconModule: React.FC = () => {
  const [selectedGate, setSelectedGate] = useState<'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND'>('AND');
  const [inputA, setInputA] = useState<number>(1);
  const [inputB, setInputB] = useState<number>(0);

  // IPC vs Clock Speed calculator state
  const [clockGhz, setClockGhz] = useState<number>(4.2);
  const [ipc, setIpc] = useState<number>(2.4);

  // Signal type oscilloscope state
  const [signalType, setSignalType] = useState<'digital' | 'analog' | 'mixed'>('digital');

  // Compute logic gate output
  const computeGateOutput = () => {
    switch (selectedGate) {
      case 'AND':
        return inputA && inputB ? 1 : 0;
      case 'OR':
        return inputA || inputB ? 1 : 0;
      case 'NOT':
        return inputA ? 0 : 1;
      case 'XOR':
        return inputA ^ inputB ? 1 : 0;
      case 'NAND':
        return !(inputA && inputB) ? 1 : 0;
    }
  };

  const gateOutput = computeGateOutput();
  const throughput = calculateThroughput(clockGhz, ipc);

  return (
    <div className="space-y-8">
      {/* Module Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950 border border-sky-800 text-sky-400 text-xs font-semibold mb-3">
            <Cpu className="w-3.5 h-3.5" /> Pillar I: The Physical Medium of the Switch
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Silicon Fabrication, Nanoscale Logic & Physical Current Modulation
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            At the foundation of machine intelligence lies the mechanical and thermodynamic control
            of electrical currents through doped silicon semiconductors. Unlike copper, which allows
            electrons to flow without gate control, silicon's native resistance enables dynamic switching
            through chemical ion implantation, forming billions of microscopic transistors synchronized
            by a high-speed system clock.
          </p>
        </div>
      </div>

      {/* 3D Silicon & Transistor Gate Simulation */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" /> 3D Photolithography & Transistor Gate Inspector
          </h3>
          <span className="text-xs text-slate-400">Interactive Orbit & Exploded Assembly</span>
        </div>
        <SiliconScene explodedRatio={0} gateVoltage={gateOutput ? 1.2 : 0.0} />
      </div>

      {/* Photolithography Manufacturing Journey */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> Photolithography: Sand to 300mm Ingot to Nanoscale Device
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            {
              step: '1. Sand & Ingot',
              detail: 'Melted silica sand refined into a 30cm single-crystal ingot cylinder.',
            },
            {
              step: '2. Substrate Wafer',
              detail: 'Diamond-sliced into thin wafers, polished and oxidized with dielectric SiO2.',
            },
            {
              step: '3. EUV Exposure',
              detail: 'Photoresist coating exposed to Extreme Ultraviolet (13.5nm) through circuit masks.',
            },
            {
              step: '4. Chemical Etch',
              detail: 'Reactive ion plasma etches microscopic channels and implants boron/phosphorus dopants.',
            },
            {
              step: '5. Vias & Packaging',
              detail: 'Conductive tungsten vias deposited, interconnects layered, and die packaged.',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5">
              <div className="text-xs font-bold text-sky-400 mb-1">{item.step}</div>
              <div className="text-[11px] text-slate-400 leading-snug">{item.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Logic Gate Bench & Physical Current Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" /> Nanoscale Logic Gate Synthesizer
            </h3>
            <span className="text-xs font-mono text-slate-400">0.0V (0) ⟷ 1.2V (1)</span>
          </div>

          {/* Gate Selector */}
          <div className="flex flex-wrap gap-2">
            {(['AND', 'OR', 'NOT', 'NAND', 'XOR'] as const).map((gate) => (
              <button
                key={gate}
                type="button"
                onClick={() => setSelectedGate(gate)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedGate === gate
                    ? 'bg-sky-500 text-slate-950 shadow-lg shadow-sky-500/25'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {gate} Gate
              </button>
            ))}
          </div>

          {/* Gate Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center">
              <div className="text-xs text-slate-400 mb-2">Input A Voltage</div>
              <button
                type="button"
                onClick={() => setInputA((v) => (v === 1 ? 0 : 1))}
                className={`w-full py-2 rounded-lg text-sm font-mono font-bold transition-colors ${
                  inputA === 1
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {inputA === 1 ? '1 (1.2V HIGH)' : '0 (0.0V LOW)'}
              </button>
            </div>

            {selectedGate !== 'NOT' ? (
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-center">
                <div className="text-xs text-slate-400 mb-2">Input B Voltage</div>
                <button
                  type="button"
                  onClick={() => setInputB((v) => (v === 1 ? 0 : 1))}
                  className={`w-full py-2 rounded-lg text-sm font-mono font-bold transition-colors ${
                    inputB === 1
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                  }`}
                >
                  {inputB === 1 ? '1 (1.2V HIGH)' : '0 (0.0V LOW)'}
                </button>
              </div>
            ) : (
              <div className="bg-slate-950/40 border border-slate-800/50 rounded-xl p-4 text-center flex items-center justify-center text-xs text-slate-500">
                Single-input Inverter
              </div>
            )}
          </div>

          {/* Logic Output Result */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Gate Output State:</div>
              <div className="text-xl font-mono font-bold text-white mt-0.5">
                {selectedGate}({inputA}
                {selectedGate !== 'NOT' ? `, ${inputB}` : ''}) ={' '}
                <span className={gateOutput ? 'text-emerald-400' : 'text-rose-400'}>{gateOutput}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Physical Channel:</div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-1 ${
                  gateOutput
                    ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                    : 'bg-rose-950 border border-rose-800 text-rose-300'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                {gateOutput ? 'Conducting (1.2V)' : 'Pinched Off (0.0V)'}
              </span>
            </div>
          </div>
        </div>

        {/* Silicon Lottery, IPC & Clock Frequency Calculator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" /> Instructions Per Clock (IPC) & Silicon Lottery
            </h3>
            <span className="text-xs text-slate-400">Dynamic Binning Model</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Due to microscopic manufacturing variations across the wafer, no two dies are identical.
            While clock frequency (GHz) is marketed heavily, compute work is governed by Instructions
            Per Clock (IPC).
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Clock Frequency:</span>
                <span className="font-mono text-sky-400">{clockGhz.toFixed(1)} GHz</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="6.0"
                step="0.1"
                value={clockGhz}
                onChange={(e) => setClockGhz(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Instructions Per Clock (IPC):</span>
                <span className="font-mono text-sky-400">{ipc.toFixed(2)} IPC</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.05"
                value={ipc}
                onChange={(e) => setIpc(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
              <div className="text-[11px] text-slate-400">Effective Compute Output</div>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                {throughput.gigaOps.toFixed(1)}{' '}
                <span className="text-xs font-normal text-slate-400">Billion Ops/s</span>
              </div>
            </div>
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
              <div className="text-[11px] text-slate-400">Clock Cycle Duration</div>
              <div className="text-xl font-mono font-bold text-sky-400 mt-1">
                {throughput.cycleTimePicoseconds.toFixed(1)}{' '}
                <span className="text-xs font-normal text-slate-400">ps</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Physical & Biological Scale Metrics Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4">
          Physical Scale Continuum: From Silicon Rods to Biological benchmark
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-2.5 px-3">Entity Benchmark</th>
                <th className="py-2.5 px-3">Physical Dimension (Nanometers)</th>
                <th className="py-2.5 px-3">Functional Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-white font-sans">
                  Advanced Transistor Gate
                </td>
                <td className="py-2.5 px-3 text-sky-400">~ 10 to 30 nm</td>
                <td className="py-2.5 px-3 font-sans text-slate-300">
                  Minimum dimension of modern high-performance microchip gates.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-white font-sans">Influenza Virus</td>
                <td className="py-2.5 px-3 text-emerald-400">~ 100 nm</td>
                <td className="py-2.5 px-3 font-sans text-slate-300">
                  Sub-micron biological benchmark illustrating precision scale.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-white font-sans">
                  Human Red Blood Cell
                </td>
                <td className="py-2.5 px-3 text-amber-400">~ 7,000 nm</td>
                <td className="py-2.5 px-3 font-sans text-slate-300">
                  Standard cellular benchmark highlighting microchip density.
                </td>
              </tr>
              <tr className="hover:bg-slate-800/30">
                <td className="py-2.5 px-3 font-semibold text-white font-sans">
                  Silicon Ingot Diameter
                </td>
                <td className="py-2.5 px-3 text-purple-400">300,000,000 nm (30 cm)</td>
                <td className="py-2.5 px-3 font-sans text-slate-300">
                  Maximum macroscopic manufacturing dimension for single-crystal wafers.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

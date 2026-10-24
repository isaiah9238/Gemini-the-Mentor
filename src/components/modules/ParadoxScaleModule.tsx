import React, { useState } from 'react';
import { calculateLandauerLimit, calculateInterconnectEnergy, calculateFootprintComparison } from '../../logic/physics.js';
import { Flame, Database, Droplets, Thermometer, ShieldAlert, Cpu } from 'lucide-react';

export const ParadoxScaleModule: React.FC = () => {
  // Landauer Temperature Slider state (Kelvin)
  const [temperatureK, setTemperatureK] = useState(300);

  // Wire length slider state (Microns)
  const [wireLengthMicrons, setWireLengthMicrons] = useState(2500); // 2.5 mm off-chip bus

  // Document processing volume slider
  const [docCount, setDocCount] = useState(500000); // 500k documents

  const landauerResult = calculateLandauerLimit(temperatureK);
  const wireEnergy = calculateInterconnectEnergy(wireLengthMicrons);
  const footprint = calculateFootprintComparison(docCount);

  return (
    <div className="space-y-8">
      {/* Module Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950 border border-rose-800 text-rose-400 text-xs font-semibold mb-3">
            <Flame className="w-3.5 h-3.5" /> Pillar IV: The Physical Paradox of Scale
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Hardware Bottlenecks, the Von Neumann Wall & Thermodynamics
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed">
            As artificial intelligence architectures have expanded to trillions of parameters, they
            have collided with physical and thermodynamic limits. In the traditional von Neumann
            architecture, shuttling weights between physically separated memory and compute units
            dissipates energy proportional to wire length (E ∝ L). Meanwhile, Landauer's Principle
            establishes a fundamental lower bound on heat dissipation per irreversible bit operation.
          </p>
        </div>
      </div>

      {/* Von Neumann Bottleneck vs IBM NorthPole */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-rose-400" /> The Memory Wall & Wire Charging (E ∝ L)
            </h3>
            <span className="text-xs font-mono text-slate-400">Off-Chip Copper Interconnect</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Sending a binary 1 requires charging copper interconnects with voltage; sending a 0 requires
            discharging. The energy dissipated is directly proportional to wire length $L$. In GPUs, moving
            weights across memory channels consumes far more power than the matrix multiply itself.
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Interconnect Wire Length:</span>
                <span className="font-mono text-rose-400 font-bold">
                  {wireLengthMicrons >= 1000
                    ? `${(wireLengthMicrons / 1000).toFixed(2)} mm (Off-Chip DRAM Bus)`
                    : `${wireLengthMicrons} µm (On-Die Local Register)`}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="10000"
                step="10"
                value={wireLengthMicrons}
                onChange={(e) => setWireLengthMicrons(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                <div className="text-[11px] text-slate-400">Dissipated Energy per 1B Transfers:</div>
                <div className="text-lg font-mono font-bold text-rose-400 mt-1">
                  {(wireEnergy.energyJoules * 1e6).toFixed(2)} µJ
                </div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                <div className="text-[11px] text-slate-400">Relative Penalty vs Local Core:</div>
                <div className="text-lg font-mono font-bold text-amber-400 mt-1">
                  {wireEnergy.relativeScale.toFixed(0)}x Higher
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* IBM NorthPole Architectural Comparison */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" /> Co-located Memory: The IBM NorthPole Paradigm
            </h3>
            <span className="text-xs font-mono text-emerald-400">Non-von Neumann</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            IBM’s NorthPole eliminates the von Neumann bus by co-locating compute cores with local on-chip
            SRAM memory. It demonstrates up to <strong>73x higher energy efficiency</strong> than low-latency
            GPUs during inference tests, avoiding high-energy memory transfers completely.
          </p>

          <div className="space-y-3 pt-1">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-white">Traditional Von Neumann (GPU / HBM3e)</div>
                <div className="text-slate-400 text-[11px]">Separate Silicon Dies connected through silicon interposers</div>
              </div>
              <span className="text-rose-400 font-bold font-mono">1.0x Baseline</span>
            </div>

            <div className="bg-slate-950 border border-emerald-900/60 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-emerald-300">IBM NorthPole (Compute-in-Memory)</div>
                <div className="text-slate-400 text-[11px]">Zero off-chip DRAM round-trips; integrated 256MB SRAM</div>
              </div>
              <span className="text-emerald-400 font-bold font-mono">73.0x Efficiency</span>
            </div>
          </div>
        </div>
      </div>

      {/* Landauer's Principle Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-amber-400" /> Landauer's Principle Thermodynamic Calculator
          </h3>
          <span className="font-mono text-xs text-amber-400">&Delta;Q = k_B &bull; T &bull; ln(2)</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          Formulated by Rolf Landauer in 1961: any logically irreversible manipulation of information
          (such as erasing a bit) must dissipate a minimum heat ΔQ to its surroundings. Reversible
          computing seeks to circumvent this by ensuring operations can run backward without information loss.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>System Absolute Temperature:</span>
                <span className="font-mono text-amber-400 font-bold">
                  {temperatureK} K ({temperatureK - 273}&deg;C)
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="600"
                step="1"
                value={temperatureK}
                onChange={(e) => setTemperatureK(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1 K (Cryogenic experimental limit)</span>
                <span>300 K (Room temp: ~0.018 eV)</span>
                <span>600 K (Extreme operating thermal limit)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] text-slate-400">Landauer Lower Bound (Joules):</div>
                <div className="text-xl font-mono font-bold text-amber-400 mt-1">
                  {landauerResult.joules.toExponential(4)} J
                </div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <div className="text-[11px] text-slate-400">Landauer Lower Bound (eV):</div>
                <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                  {landauerResult.electronVolts.toFixed(5)} eV
                </div>
              </div>
            </div>
          </div>

          {/* Experimental Milestones */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <div className="font-bold text-sky-400">Experimental Milestones:</div>
            <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
              <div className="border-b border-slate-800 pb-2">
                <strong className="text-white">2016 Nanomagnetic Bit Probe:</strong> Measured 0.026 eV at 300K,
                just 44% above the Landauer theoretical floor.
              </div>
              <div>
                <strong className="text-white">2018 Cryogenic Arrays:</strong> Demonstrated Landauer erasure at 1 Kelvin
                using quantum molecular magnets.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Energy, Carbon & Water Footprint Crossover Analysis */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-400" /> Resource Footprint & The Scale Crossover Point
          </h3>
          <span className="text-xs text-slate-400">IEA 2026 Projections</span>
        </div>

        {/* Interactive Document Processing Slider */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex justify-between text-xs text-slate-300">
            <span>Massive Document Processing Volume:</span>
            <span className="font-mono text-sky-400 font-bold">{docCount.toLocaleString()} Documents</span>
          </div>
          <input
            type="range"
            min="10000"
            max="5000000"
            step="10000"
            value={docCount}
            onChange={(e) => setDocCount(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
              <div className="text-[11px] text-slate-400">AI Compute Energy:</div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                {footprint.aiEnergyMWh.toFixed(2)} MWh
              </div>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
              <div className="text-[11px] text-slate-400">Human Cognitive Metabolic Load:</div>
              <div className="text-lg font-mono font-bold text-amber-400 mt-1">
                {footprint.humanEnergyMWh.toFixed(2)} MWh
              </div>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
              <div className="text-[11px] text-slate-400">Crossover Insight:</div>
              <div className="text-[11px] text-slate-200 mt-1 leading-snug">{footprint.crossoverPoint}</div>
            </div>
          </div>
        </div>

        {/* Macro Resource Metrics Table */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="text-amber-400 font-bold mb-1">IEA 2026 Power Parity</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Global electricity demand for AI, data centers, and crypto is projected to match the total national
              consumption of Japan by 2026 (~1,000 TWh).
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="text-sky-400 font-bold mb-1">Global Water Withdrawal</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              AI water demand is projected to reach 4.2 to 6.6 billion $m^3$ by 2027—exceeding the total annual
              water withdrawal of Denmark.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="text-emerald-400 font-bold mb-1">DLC Liquid Cooling</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Server rack densities scaling from 20 kW to 100 kW require Direct Liquid Cooling (DLC) loops
              directly circulating chilled liquid over silicon bare dies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

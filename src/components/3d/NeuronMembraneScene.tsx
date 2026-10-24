import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { calculateActionPotentialCurve } from '../../logic/biophysics.js';

export const NeuronMembraneScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [stimulusCurrent, setStimulusCurrent] = useState(12);
  const [isControlsOpen, setIsControlsOpen] = useState(true);

  const timeRef = useRef(0);
  const playingRef = useRef(isPlaying);
  const stimulusRef = useRef(stimulusCurrent);

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    stimulusRef.current = stimulusCurrent;
  }, [stimulusCurrent]);

  const state = calculateActionPotentialCurve(currentTimeMs, stimulusCurrent);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    scene.fog = new THREE.Fog(0x0f172a, 10, 28);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.5, 3.5, 5.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(5, 7, 4);
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x7dd3fc, 0x1e293b, 1.2);
    scene.add(fillLight);

    const membraneGroup = new THREE.Group();
    scene.add(membraneGroup);

    // Phospholipid Bilayer Lipid Heads & Tails (Upper & Lower Leaflet)
    const lipidHeadGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const upperHeadMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Extracellular hydrophilic heads (cyan)
      metalness: 0.1,
      roughness: 0.35,
    });
    const lowerHeadMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8, // Intracellular hydrophilic heads (indigo)
      metalness: 0.1,
      roughness: 0.35,
    });

    const gridX = 14;
    const gridZ = 10;
    const spacing = 0.28;

    for (let x = -gridX / 2; x < gridX / 2; x++) {
      for (let z = -gridZ / 2; z < gridZ / 2; z++) {
        // Skip channel locations
        if (Math.abs(x) < 2 && Math.abs(z) < 2) continue;
        if (Math.abs(x - 3.5) < 1.5 && Math.abs(z) < 1.5) continue;
        if (Math.abs(x + 3.5) < 1.5 && Math.abs(z) < 1.5) continue;

        // Upper leaflet head
        const uh = new THREE.Mesh(lipidHeadGeo, upperHeadMat);
        uh.position.set(x * spacing, 0.5, z * spacing);
        membraneGroup.add(uh);

        // Lower leaflet head
        const lh = new THREE.Mesh(lipidHeadGeo, lowerHeadMat);
        lh.position.set(x * spacing, -0.5, z * spacing);
        membraneGroup.add(lh);
      }
    }

    // Protein Channel 1: Voltage-Gated Na+ Channel (Center, Green/Teal Barrel)
    const naBarrelGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.4, 20);
    const naChannelMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.4,
      roughness: 0.3,
    });
    const naChannel = new THREE.Mesh(naBarrelGeo, naChannelMat);
    naChannel.position.set(0, 0, 0);
    membraneGroup.add(naChannel);

    // Na+ Gate Pore (Cylinder hole)
    const naPoreGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.45, 16);
    const naPoreMat = new THREE.MeshBasicMaterial({ color: 0x064e3b });
    const naPore = new THREE.Mesh(naPoreGeo, naPoreMat);
    membraneGroup.add(naPore);

    // Protein Channel 2: Voltage-Gated K+ Channel (+3.5 X, Violet Barrel)
    const kBarrelGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.4, 20);
    const kChannelMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      metalness: 0.4,
      roughness: 0.3,
    });
    const kChannel = new THREE.Mesh(kBarrelGeo, kChannelMat);
    kChannel.position.set(2.2, 0, 0);
    membraneGroup.add(kChannel);

    const kPoreGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.45, 16);
    const kPoreMat = new THREE.MeshBasicMaterial({ color: 0x581c87 });
    const kPore = new THREE.Mesh(kPoreGeo, kPoreMat);
    kPore.position.set(2.2, 0, 0);
    membraneGroup.add(kPore);

    // Protein Channel 3: Na+/K+ ATP Pump (-3.5 X, Amber Barrel)
    const pumpBarrelGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.4, 20);
    const pumpMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.5,
      roughness: 0.25,
    });
    const pumpMesh = new THREE.Mesh(pumpBarrelGeo, pumpMat);
    pumpMesh.position.set(-2.2, 0, 0);
    membraneGroup.add(pumpMesh);

    // Ion Particles:
    // Na+ ions (Golden Spheres: Extracellular high concentration y > 0.6)
    const naIonGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const naIonMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
    const naIonsGroup = new THREE.Group();
    for (let i = 0; i < 40; i++) {
      const ion = new THREE.Mesh(naIonGeo, naIonMat);
      ion.position.set((Math.random() - 0.5) * 4.5, 0.8 + Math.random() * 1.5, (Math.random() - 0.5) * 3);
      naIonsGroup.add(ion);
    }
    membraneGroup.add(naIonsGroup);

    // K+ ions (Cyan Spheres: Intracellular high concentration y < -0.6)
    const kIonGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const kIonMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const kIonsGroup = new THREE.Group();
    for (let i = 0; i < 40; i++) {
      const ion = new THREE.Mesh(kIonGeo, kIonMat);
      ion.position.set((Math.random() - 0.5) * 4.5, -0.8 - Math.random() * 1.5, (Math.random() - 0.5) * 3);
      kIonsGroup.add(ion);
    }
    membraneGroup.add(kIonsGroup);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.5;
    controls.maxDistance = 14;

    let frameId = 0;
    const clock = new THREE.Clock();

    function tick() {
      const dt = clock.getDelta();

      if (playingRef.current) {
        timeRef.current += dt * 0.8;
        if (timeRef.current > 4.0) {
          timeRef.current = 0;
        }
        setCurrentTimeMs(timeRef.current);
      }

      const currentPoint = calculateActionPotentialCurve(timeRef.current, stimulusRef.current);

      // Animate Na+ influx when Na gate open ratio is high
      if (currentPoint.phase === 'depolarization') {
        naIonsGroup.children.forEach((ion) => {
          if (Math.abs(ion.position.x) < 0.6 && ion.position.y > -0.6) {
            ion.position.y -= 1.8 * dt;
          }
        });
      }

      // Animate K+ efflux when K gate is open
      if (currentPoint.phase === 'repolarization') {
        kIonsGroup.children.forEach((ion) => {
          if (Math.abs(ion.position.x - 2.2) < 0.6 && ion.position.y < 0.6) {
            ion.position.y += 1.8 * dt;
          }
        });
      }

      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    }

    tick();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      pmremGenerator.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Badge */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200">
        <div className="font-semibold text-emerald-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          Neuronal Membrane Biophysics & Action Potential
        </div>
        <div className="text-slate-400 text-[11px] mt-0.5">
          Hodgkin-Huxley Voltage-Gated $Na^+ / K^+$ Ion Channels & $Na^+/K^+$ ATP Pump
        </div>
      </div>

      {/* Real-time Action Potential Voltage Gauge (Top-Right) */}
      <div className="absolute top-4 right-4 z-10 bg-slate-950/85 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 shadow-xl min-w-[190px]">
        <div className="text-[11px] text-slate-400 mb-1">Membrane Potential $V_m$</div>
        <div className="text-2xl font-mono font-bold text-sky-400 flex items-baseline gap-1">
          {state.membranePotentialMv.toFixed(1)} <span className="text-xs font-normal text-slate-400">mV</span>
        </div>
        <div className="text-[11px] mt-1 capitalize font-medium text-amber-300">
          Phase: {state.phase}
        </div>
        <div className="mt-2 space-y-1 text-[10px] text-slate-400 border-t border-slate-800 pt-1.5">
          <div className="flex justify-between">
            <span>$Na^+$ Gate Open:</span>
            <span className="font-mono text-emerald-400">{Math.round(state.naGateOpenRatio * 100)}%</span>
          </div>
          <div className="flex justify-between">
            <span>$K^+$ Gate Open:</span>
            <span className="font-mono text-purple-400">{Math.round(state.kGateOpenRatio * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Collapsible Bottom Dock */}
      <div
        className="absolute z-10 left-1/2 -translate-x-1/2 transition-all duration-300"
        style={{
          bottom: '16px',
          maxWidth: 'min(780px, 94%)',
          width: '100%',
        }}
      >
        <div className="flex justify-center mb-1">
          <button
            type="button"
            onClick={() => setIsControlsOpen((prev) => !prev)}
            className="px-3 py-1 text-[11px] font-medium bg-slate-800 text-slate-300 hover:text-white rounded-t-md border border-slate-700 border-b-0 transition-colors"
          >
            {isControlsOpen ? '▾ Hide Biophysics Dock' : '▴ Expand Biophysics Dock'}
          </button>
        </div>

        {isControlsOpen && (
          <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 shadow-2xl text-slate-200 text-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isPlaying ? 'Pause Spike Cycle' : 'Play Spike Cycle'}
              </button>

              <button
                type="button"
                onClick={() => {
                  timeRef.current = 0;
                  setCurrentTimeMs(0);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Reset Stimulus
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-300">
              <span>Stimulus:</span>
              <button
                type="button"
                onClick={() => setStimulusCurrent(15)}
                className={`px-2.5 py-1 rounded text-xs font-mono ${
                  stimulusCurrent >= 10 ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Supra-threshold (15 µA)
              </button>
              <button
                type="button"
                onClick={() => setStimulusCurrent(3)}
                className={`px-2.5 py-1 rounded text-xs font-mono ${
                  stimulusCurrent < 10 ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Sub-threshold (3 µA)
              </button>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span> $Na^+$ ions
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span> $K^+$ ions
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> $Na^+$ Channel
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block"></span> $K^+$ Channel
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

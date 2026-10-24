import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface ProteinExample {
  id: string;
  name: string;
  uniprot: string;
  residues: number;
  meanPLDDT: number;
  description: string;
}

const EXAMPLES: ProteinExample[] = [
  {
    id: 'ubiquitin',
    name: 'Ubiquitin (Human)',
    uniprot: 'P0CG48',
    residues: 76,
    meanPLDDT: 94.2,
    description: 'Highly conserved regulatory protein; key model in protein folding thermodynamics.',
  },
  {
    id: 'tp53',
    name: 'p53 Core DNA-Binding Domain',
    uniprot: 'P04637',
    residues: 198,
    meanPLDDT: 88.6,
    description: 'Tumor suppressor protein; dynamic beta-sandwich and alpha-helix architecture.',
  },
  {
    id: 'egfr',
    name: 'EGFR Tyrosine Kinase Domain',
    uniprot: 'P00533',
    residues: 284,
    meanPLDDT: 91.5,
    description: 'Catalytic cleft with ATP-binding pocket and regulatory activation loop.',
  },
];

export const ProteinViewerScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedExample, setSelectedExample] = useState<ProteinExample>(EXAMPLES[0]);
  const [foldRatio, setFoldRatio] = useState(1.0); // 0 (unfolded coil) to 1.0 (folded native structure)
  const [isControlsOpen, setIsControlsOpen] = useState(true);

  const foldRatioRef = useRef(foldRatio);
  useEffect(() => {
    foldRatioRef.current = foldRatio;
  }, [foldRatio]);

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
    scene.fog = new THREE.Fog(0x0f172a, 12, 34);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

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

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.4);
    keyLight.position.set(6, 8, 6);
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 1.3);
    scene.add(fillLight);

    const proteinGroup = new THREE.Group();
    scene.add(proteinGroup);

    // Procedural Backbone Curve with 4-band pLDDT confidence coloring:
    // Very High (>90): #0053D6
    // Confident (70-90): #65CBF3
    // Low (50-70): #FFDB13
    // Very Low (<50): #FF7D45
    const residueCount = 90;
    const nativePoints: THREE.Vector3[] = [];
    const unfoldedPoints: THREE.Vector3[] = [];
    const plddtScores: number[] = [];

    for (let i = 0; i < residueCount; i++) {
      const t = i / residueCount;

      // Folded native conformation: composite of alpha helices & beta turns
      let nx = 0, ny = 0, nz = 0;
      if (i < 30) {
        // Alpha Helix 1
        const theta = i * 0.7;
        nx = Math.cos(theta) * 1.1 - 1.2;
        ny = (i - 15) * 0.12;
        nz = Math.sin(theta) * 1.1;
      } else if (i < 55) {
        // Beta Strand & Hairpin
        const s = (i - 30);
        nx = (s % 2 === 0 ? 0.3 : -0.3) + (s * 0.08);
        ny = -1.2 + Math.sin(s * 0.4) * 0.8;
        nz = (s * 0.12) - 0.8;
      } else {
        // Alpha Helix 2 & C-term loop
        const theta = (i - 55) * 0.65;
        nx = Math.cos(theta) * 1.2 + 1.2;
        ny = (i - 72) * 0.14;
        nz = Math.sin(theta) * 1.2;
      }
      nativePoints.push(new THREE.Vector3(nx, ny, nz));

      // Unfolded random coil configuration (elongated chain)
      const ux = (t - 0.5) * 12.0;
      const uy = Math.sin(t * 12.0) * 0.6;
      const uz = Math.cos(t * 8.0) * 0.6;
      unfoldedPoints.push(new THREE.Vector3(ux, uy, uz));

      // Realistic pLDDT distribution (core high, loops moderate)
      if (i > 35 && i < 45) {
        plddtScores.push(62); // Low / Loop
      } else if (i > 85) {
        plddtScores.push(42); // Very low / flexible tail
      } else if (i < 10) {
        plddtScores.push(78); // Confident
      } else {
        plddtScores.push(95); // Very high core
      }
    }

    // Create segments for the ribbon/tube
    const segmentMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < residueCount - 1; i++) {
      const score = plddtScores[i];
      let colorHex = 0x0053d6; // > 90
      if (score < 50) colorHex = 0xff7d45;
      else if (score < 70) colorHex = 0xffdb13;
      else if (score < 90) colorHex = 0x65cbf3;

      const segGeo = new THREE.CylinderGeometry(0.12, 0.12, 1, 12);
      const segMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        metalness: 0.2,
        roughness: 0.3,
      });
      const segMesh = new THREE.Mesh(segGeo, segMat);
      proteinGroup.add(segMesh);
      segmentMeshes.push(segMesh);
    }

    // Alpha Carbon residue spheres (C_alpha atoms)
    const atomGeo = new THREE.SphereGeometry(0.16, 12, 12);
    const atomMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < residueCount; i += 3) {
      const score = plddtScores[i];
      let colorHex = 0x0053d6;
      if (score < 50) colorHex = 0xff7d45;
      else if (score < 70) colorHex = 0xffdb13;
      else if (score < 90) colorHex = 0x65cbf3;

      const aMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        metalness: 0.3,
        roughness: 0.2,
      });
      const atom = new THREE.Mesh(atomGeo, aMat);
      proteinGroup.add(atom);
      atomMeshes.push(atom);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;

    let frameId = 0;
    const clock = new THREE.Clock();
    let currentFold = 1.0;

    const _v1 = new THREE.Vector3();
    const _v2 = new THREE.Vector3();
    const _dir = new THREE.Vector3();
    const _mid = new THREE.Vector3();

    function tick() {
      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth exponential damping of folding transition
      currentFold = THREE.MathUtils.damp(currentFold, foldRatioRef.current, 4, dt);

      // Interpolate points between unfolded and native
      const interpPoints: THREE.Vector3[] = [];
      for (let i = 0; i < residueCount; i++) {
        _v1.lerpVectors(unfoldedPoints[i], nativePoints[i], currentFold);
        interpPoints.push(_v1.clone());
      }

      // Update cylinder segments
      for (let i = 0; i < residueCount - 1; i++) {
        const pA = interpPoints[i];
        const pB = interpPoints[i + 1];
        _dir.subVectors(pB, pA);
        const len = _dir.length();
        _mid.addVectors(pA, pB).multiplyScalar(0.5);

        const seg = segmentMeshes[i];
        seg.position.copy(_mid);
        seg.scale.set(1, len, 1);
        seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), _dir.clone().normalize());
      }

      // Update C_alpha atom spheres
      let atomIdx = 0;
      for (let i = 0; i < residueCount; i += 3) {
        if (atomMeshes[atomIdx]) {
          atomMeshes[atomIdx].position.copy(interpPoints[i]);
          atomIdx++;
        }
      }

      // Gentle auto-rotation
      proteinGroup.rotation.y = elapsed * 0.15;

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
        <div className="font-semibold text-sky-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          AlphaFold 3D Structural Workbench
        </div>
        <div className="text-slate-400 text-[11px] mt-0.5">
          {selectedExample.name} • UniProt: {selectedExample.uniprot} • Mean pLDDT: {selectedExample.meanPLDDT}
        </div>
      </div>

      {/* Canonical 4-Band AlphaFold pLDDT Legend (Top-Right) */}
      <div className="absolute top-4 right-4 z-10 bg-slate-950/85 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 shadow-xl min-w-[210px]">
        <div className="font-semibold text-slate-300 text-[11px] mb-2">AlphaFold Confidence (pLDDT)</div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[#0053D6]"></span>
            <span>Very High (&gt; 90)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[#65CBF3]"></span>
            <span>Confident (70 - 90)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[#FFDB13]"></span>
            <span>Low (50 - 70)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[#FF7D45]"></span>
            <span>Very Low (&lt; 50)</span>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 border-t border-slate-800 pt-1.5">
          Levinthal States: ~3<sup>76</sup> ≈ 10<sup>36</sup>
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
            {isControlsOpen ? '▾ Hide Folding Dock' : '▴ Expand Folding Dock'}
          </button>
        </div>

        {isControlsOpen && (
          <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 shadow-2xl text-slate-200 text-xs flex flex-wrap items-center justify-between gap-4">
            {/* Folding Progression Slider */}
            <div className="flex-1 min-w-[220px]">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Folding Energy State</span>
                <span className="font-mono text-sky-400">
                  {foldRatio === 1.0
                    ? 'Native Folded (Global Energy Minimum)'
                    : foldRatio === 0.0
                    ? 'Unfolded Polypeptide Coil'
                    : `Intermediate Molten Globule (${Math.round(foldRatio * 100)}%)`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={foldRatio}
                onChange={(e) => setFoldRatio(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* Protein Example Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Target:</span>
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setSelectedExample(ex)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    selectedExample.id === ex.id
                      ? 'bg-sky-600 text-white font-semibold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {ex.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

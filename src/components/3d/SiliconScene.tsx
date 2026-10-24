import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface SiliconSceneProps {
  explodedRatio?: number; // 0 (assembled) to 1 (fully exploded)
  gateVoltage?: number; // 0V (off, blocked) vs 1.2V (on, conducting channel)
  showVias?: boolean;
}

export const SiliconScene: React.FC<SiliconSceneProps> = ({
  explodedRatio = 0,
  gateVoltage = 0,
  showVias = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const explodedRef = useRef(explodedRatio);
  const gateVoltageRef = useRef(gateVoltage);
  const showViasRef = useRef(showVias);

  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [internalExplode, setInternalExplode] = useState(explodedRatio);
  const [internalVoltage, setInternalVoltage] = useState(gateVoltage);

  // Sync props to refs
  useEffect(() => {
    explodedRef.current = internalExplode;
  }, [internalExplode]);

  useEffect(() => {
    gateVoltageRef.current = internalVoltage;
  }, [internalVoltage]);

  useEffect(() => {
    showViasRef.current = showVias;
  }, [showVias]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL
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
    scene.fog = new THREE.Fog(0x0f172a, 10, 30);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.5, 4.2, 6.0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff3e0, 2.2);
    keyLight.position.set(6, 9, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x90caf9, 0x1e293b, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x64b5f6, 1.5);
    rimLight.position.set(-6, 4, -5);
    scene.add(rimLight);

    // Root Assembly Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Soft Contact Shadow Plane Grounding
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0,0,0,0.7)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    const shadowTex = new THREE.CanvasTexture(canvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -0.01;
    scene.add(shadowMesh);

    // Layer 1: Silicon Substrate (p-type single-crystal wafer base)
    const substrateGroup = new THREE.Group();
    const substrateGeo = new THREE.BoxGeometry(4.0, 0.6, 3.0);
    const substrateMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.25,
    });
    const substrateMesh = new THREE.Mesh(substrateGeo, substrateMat);
    substrateMesh.position.y = 0.3;
    substrateMesh.castShadow = !isSoftwareGl;
    substrateMesh.receiveShadow = !isSoftwareGl;
    substrateGroup.add(substrateMesh);

    // Doped n+ Source and Drain Wells
    const wellGeo = new THREE.BoxGeometry(0.8, 0.22, 1.8);
    const sourceMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // n+ doped source
      metalness: 0.6,
      roughness: 0.3,
    });
    const sourceMesh = new THREE.Mesh(wellGeo, sourceMat);
    sourceMesh.position.set(-1.1, 0.52, 0);
    substrateGroup.add(sourceMesh);

    const drainMat = new THREE.MeshStandardMaterial({
      color: 0x0ea5e9, // n+ doped drain
      metalness: 0.6,
      roughness: 0.3,
    });
    const drainMesh = new THREE.Mesh(wellGeo, drainMat);
    drainMesh.position.set(1.1, 0.52, 0);
    substrateGroup.add(drainMesh);

    // Inversion Channel (Glows when gate voltage > 0.6V)
    const channelGeo = new THREE.BoxGeometry(1.4, 0.08, 1.8);
    const channelMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.0,
      metalness: 0.2,
      roughness: 0.4,
    });
    const channelMesh = new THREE.Mesh(channelGeo, channelMat);
    channelMesh.position.set(0, 0.57, 0);
    substrateGroup.add(channelMesh);

    rootGroup.add(substrateGroup);

    // Layer 2: Silicon Dioxide (SiO2) High-k Dielectric Insulation
    const oxideGroup = new THREE.Group();
    const oxideGeo = new THREE.BoxGeometry(1.6, 0.12, 2.0);
    const oxideMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      metalness: 0.1,
      roughness: 0.15,
      transparent: true,
      opacity: 0.75,
      clearcoat: 1.0,
    });
    const oxideMesh = new THREE.Mesh(oxideGeo, oxideMat);
    oxideMesh.position.y = 0.68;
    oxideMesh.castShadow = !isSoftwareGl;
    oxideGroup.add(oxideMesh);
    rootGroup.add(oxideGroup);

    // Layer 3: Polysilicon / Metal Gate Electrode
    const gateGroup = new THREE.Group();
    const gateGeo = new THREE.BoxGeometry(1.2, 0.4, 1.9);
    const gateMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.12,
    });
    const gateMesh = new THREE.Mesh(gateGeo, gateMat);
    gateMesh.position.y = 0.94;
    gateMesh.castShadow = !isSoftwareGl;
    gateGroup.add(gateMesh);
    rootGroup.add(gateGroup);

    // Layer 4: Cylindrical Conducting Contact Vias (Tungsten)
    const viasGroup = new THREE.Group();
    const viaGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.9, 16);
    const viaMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24, // Gold / Tungsten
      metalness: 0.95,
      roughness: 0.18,
    });

    const sourceVia = new THREE.Mesh(viaGeo, viaMat);
    sourceVia.position.set(-1.1, 1.1, 0);
    viasGroup.add(sourceVia);

    const gateVia = new THREE.Mesh(viaGeo, viaMat);
    gateVia.position.set(0, 1.45, 0);
    viasGroup.add(gateVia);

    const drainVia = new THREE.Mesh(viaGeo, viaMat);
    drainVia.position.set(1.1, 1.1, 0);
    viasGroup.add(drainVia);

    rootGroup.add(viasGroup);

    // Layer 5: Top Metallization Interconnect Layer (Copper Bus)
    const interconnectGroup = new THREE.Group();
    const busGeo = new THREE.BoxGeometry(0.4, 0.18, 2.6);
    const cuMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Copper
      metalness: 0.9,
      roughness: 0.22,
    });

    const sourceBus = new THREE.Mesh(busGeo, cuMat);
    sourceBus.position.set(-1.1, 1.6, 0);
    interconnectGroup.add(sourceBus);

    const gateBus = new THREE.Mesh(busGeo, cuMat);
    gateBus.position.set(0, 1.95, 0);
    interconnectGroup.add(gateBus);

    const drainBus = new THREE.Mesh(busGeo, cuMat);
    drainBus.position.set(1.1, 1.6, 0);
    interconnectGroup.add(drainBus);

    rootGroup.add(interconnectGroup);

    // Floating Current Carriers (Electron particles streaming when voltage > 0.6V)
    const particleCount = 28;
    const carrierGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const carrierMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const carrierGroup = new THREE.Group();
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(carrierGeo, carrierMat);
      p.position.set(-1.1 + Math.random() * 2.2, 0.58, (Math.random() - 0.5) * 1.4);
      carrierGroup.add(p);
    }
    rootGroup.add(carrierGroup);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 3.5;
    controls.maxDistance = 14;

    let frameId = 0;
    let currentExplode = 0;

    const clock = new THREE.Clock();

    function tick() {
      const dt = clock.getDelta();

      // Exponential smooth damping for exploded layers
      const targetExplode = explodedRef.current;
      currentExplode = THREE.MathUtils.damp(currentExplode, targetExplode, 4, dt);

      // Separate layers along Y axis based on explosion ratio
      oxideGroup.position.y = currentExplode * 0.8;
      gateGroup.position.y = currentExplode * 1.6;
      viasGroup.position.y = currentExplode * 2.5;
      interconnectGroup.position.y = currentExplode * 3.4;

      viasGroup.visible = showViasRef.current;
      interconnectGroup.visible = showViasRef.current;

      // Gate voltage modulation: when Vg >= 0.7V, channel forms and conduct electrons
      const isConducting = gateVoltageRef.current >= 0.7;
      channelMat.emissiveIntensity = isConducting ? 1.5 : 0.0;
      carrierGroup.visible = isConducting;

      if (isConducting) {
        carrierGroup.children.forEach((p, idx) => {
          p.position.x += 1.8 * dt;
          if (p.position.x > 1.1) {
            p.position.x = -1.1;
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
      {/* 3D WebGL Canvas Host */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Minimal Top-Left Spec Badge */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-200">
        <div className="font-semibold text-sky-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          MOSFET Transistor & Photolithography 3D Lab
        </div>
        <div className="text-slate-400 text-[11px] mt-0.5">
          Gate Scale: 14nm FinFET / Planar Cross-Section
        </div>
      </div>

      {/* Sleek Collapsible Bottom Dock (Zero Center Viewport Occlusion) */}
      <div
        className="absolute z-10 left-1/2 -translate-x-1/2 transition-all duration-300"
        style={{
          bottom: '16px',
          maxWidth: 'min(780px, 94%)',
          width: '100%',
        }}
      >
        {/* Toggle Bar */}
        <div className="flex justify-center mb-1">
          <button
            type="button"
            onClick={() => setIsControlsOpen((prev) => !prev)}
            className="px-3 py-1 text-[11px] font-medium bg-slate-800 text-slate-300 hover:text-white rounded-t-md border border-slate-700 border-b-0 transition-colors"
          >
            {isControlsOpen ? '▾ Hide Inspector Dock' : '▴ Expand Inspector Dock'}
          </button>
        </div>

        {isControlsOpen && (
          <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 shadow-2xl text-slate-200 text-xs flex flex-wrap items-center justify-between gap-4">
            {/* Exploded Layers Slider */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Fabrication Layers</span>
                <span className="font-mono text-sky-400">
                  {internalExplode > 0.05 ? `${Math.round(internalExplode * 100)}% Exploded` : 'Assembled'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={internalExplode}
                onChange={(e) => setInternalExplode(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
              />
            </div>

            {/* Gate Voltage Toggle */}
            <div className="flex items-center gap-3">
              <div className="text-[11px] text-slate-400">
                Gate Voltage $V_g$:
                <span
                  className={`ml-1.5 font-mono font-bold ${
                    internalVoltage >= 0.7 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {internalVoltage.toFixed(1)}V ({internalVoltage >= 0.7 ? 'ON / Conducting' : 'OFF / Blocked'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInternalVoltage((prev) => (prev >= 0.7 ? 0.0 : 1.2))}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                  internalVoltage >= 0.7
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Toggle {internalVoltage >= 0.7 ? '0V' : '1.2V'}
              </button>
            </div>

            {/* Layer Legend */}
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="inline-block w-2.5 h-2.5 rounded bg-slate-600"></span> Substrate
              <span className="inline-block w-2.5 h-2.5 rounded bg-amber-500"></span> Oxide
              <span className="inline-block w-2.5 h-2.5 rounded bg-slate-300"></span> Gate
              <span className="inline-block w-2.5 h-2.5 rounded bg-amber-700"></span> Cu Vias
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

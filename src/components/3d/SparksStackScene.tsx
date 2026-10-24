import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export const SparksStackScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showStressVectors, setShowStressVectors] = useState(true);
  const [isControlsOpen, setIsControlsOpen] = useState(true);
  const [isNailWobbling, setIsNailWobbling] = useState(false);

  const showStressRef = useRef(showStressVectors);
  const wobbleRef = useRef(isNailWobbling);

  useEffect(() => {
    showStressRef.current = showStressVectors;
  }, [showStressVectors]);

  useEffect(() => {
    wobbleRef.current = isNailWobbling;
  }, [isNailWobbling]);

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
    scene.fog = new THREE.Fog(0x0f172a, 12, 32);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4.8, 3.8, 5.8);

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

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio lighting
    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.4);
    keyLight.position.set(5, 8, 4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x94a3b8, 0x1e293b, 1.2);
    scene.add(fillLight);

    const stackGroup = new THREE.Group();
    scene.add(stackGroup);

    // 1. Soft Contact Shadow Plane Grounding
    const shadowGeo = new THREE.PlaneGeometry(7, 7);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0,0,0,0.65)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.25)');
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

    // Assembly Object 1: Hardcover Book Base (Level, Wide Platform)
    const bookGroup = new THREE.Group();
    const coverGeo = new THREE.BoxGeometry(3.2, 0.28, 2.4);
    const coverMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // Deep blue leather cover
      metalness: 0.1,
      roughness: 0.45,
    });
    const coverMesh = new THREE.Mesh(coverGeo, coverMat);
    coverMesh.position.y = 0.14;
    coverMesh.castShadow = !isSoftwareGl;
    coverMesh.receiveShadow = !isSoftwareGl;
    bookGroup.add(coverMesh);

    // Book Paper Pages insert
    const pagesGeo = new THREE.BoxGeometry(3.05, 0.22, 2.25);
    const pagesMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7, // Ivory paper edge
      metalness: 0.05,
      roughness: 0.9,
    });
    const pagesMesh = new THREE.Mesh(pagesGeo, pagesMat);
    pagesMesh.position.set(0.04, 0.14, 0);
    bookGroup.add(pagesMesh);
    stackGroup.add(bookGroup);

    // Assembly Object 2: Nine Eggs in 3x3 Grid
    const eggsGroup = new THREE.Group();
    const eggGeo = new THREE.SphereGeometry(0.24, 24, 24);
    // Deform into realistic ovoid shape (taper top)
    const pos = eggGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y > 0) {
        pos.setX(i, pos.getX(i) * (1 - 0.25 * (y / 0.24)));
        pos.setZ(i, pos.getZ(i) * (1 - 0.25 * (y / 0.24)));
      }
    }
    eggGeo.computeVertexNormals();

    const eggMat = new THREE.MeshStandardMaterial({
      color: 0xfde047, // Organic eggshell cream
      roughness: 0.38,
      metalness: 0.05,
    });

    const eggSpacingX = 0.9;
    const eggSpacingZ = 0.75;
    const eggY = 0.28 + 0.26;

    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        const eggMesh = new THREE.Mesh(eggGeo, eggMat);
        eggMesh.position.set(c * eggSpacingX, eggY, r * eggSpacingZ);
        eggMesh.castShadow = !isSoftwareGl;
        eggsGroup.add(eggMesh);
      }
    }
    stackGroup.add(eggsGroup);

    // Assembly Object 3: Laptop Placed Flat on the 9 Eggs
    const laptopGroup = new THREE.Group();
    const laptopBaseGeo = new THREE.BoxGeometry(2.7, 0.08, 1.9);
    const laptopMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Anodized aluminum silver
      metalness: 0.92,
      roughness: 0.18,
    });
    const laptopY = eggY + 0.28;
    const laptopBase = new THREE.Mesh(laptopBaseGeo, laptopMat);
    laptopBase.position.y = laptopY;
    laptopBase.castShadow = !isSoftwareGl;
    laptopBase.receiveShadow = !isSoftwareGl;
    laptopGroup.add(laptopBase);

    // Laptop Lid (slightly opened at 20 degrees)
    const lidGeo = new THREE.BoxGeometry(2.7, 0.04, 1.8);
    const lidMesh = new THREE.Mesh(lidGeo, laptopMat);
    lidMesh.position.set(0, laptopY + 0.12, -0.05);
    lidMesh.rotation.x = -0.15;
    laptopGroup.add(lidMesh);
    stackGroup.add(laptopGroup);

    // Assembly Object 4: Empty Glass Bottle Upright on Laptop
    const bottleGroup = new THREE.Group();
    const bottleBodyGeo = new THREE.CylinderGeometry(0.32, 0.35, 1.4, 24);
    const bottleMat = new THREE.MeshPhysicalMaterial({
      color: 0xe0f2fe,
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.7,
      transmission: isSoftwareGl ? 0 : 0.85,
      ior: 1.52,
    });
    const bottleY = laptopY + 0.08 + 0.7;
    const bottleBody = new THREE.Mesh(bottleBodyGeo, bottleMat);
    bottleBody.position.y = bottleY;
    bottleBody.castShadow = !isSoftwareGl;
    bottleGroup.add(bottleBody);

    // Bottle Neck & Cap
    const neckGeo = new THREE.CylinderGeometry(0.14, 0.22, 0.5, 20);
    const neckMesh = new THREE.Mesh(neckGeo, bottleMat);
    neckMesh.position.y = bottleY + 0.7 + 0.22;
    bottleGroup.add(neckMesh);

    // Metal Cap (Flat surface for the nail)
    const capGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.1, 20);
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Metallic blue cap
      metalness: 0.9,
      roughness: 0.25,
    });
    const capY = bottleY + 0.7 + 0.45;
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.position.y = capY;
    bottleGroup.add(capMesh);
    stackGroup.add(bottleGroup);

    // Assembly Object 5: Steel Nail Balanced on the Flat Cap Surface
    const nailGroup = new THREE.Group();
    nailGroup.position.set(0, capY + 0.05, 0);

    const nailHeadGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16);
    const nailShaftGeo = new THREE.CylinderGeometry(0.025, 0.005, 0.65, 12);
    const nailMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.96,
      roughness: 0.15,
    });

    // Nail shaft points upward, head sits flat on bottle cap
    const nailHead = new THREE.Mesh(nailHeadGeo, nailMat);
    nailHead.position.y = 0.015;
    nailGroup.add(nailHead);

    const nailShaft = new THREE.Mesh(nailShaftGeo, nailMat);
    nailShaft.position.y = 0.03 + 0.32;
    nailGroup.add(nailShaft);

    stackGroup.add(nailGroup);

    // Force Vectors / Center of Gravity Line
    const vectorsGroup = new THREE.Group();
    const cogLineGeo = new THREE.CylinderGeometry(0.015, 0.015, 4.2, 8);
    const cogMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.7,
    });
    const cogLine = new THREE.Mesh(cogLineGeo, cogMat);
    cogLine.position.set(0, 2.1, 0);
    vectorsGroup.add(cogLine);

    // Egg pressure cones
    for (let r = -1; r <= 1; r++) {
      for (let c = -1; c <= 1; c++) {
        const arrowGeo = new THREE.ConeGeometry(0.06, 0.2, 12);
        const arrowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const arrow = new THREE.Mesh(arrowGeo, arrowMat);
        arrow.rotation.x = Math.PI;
        arrow.position.set(c * eggSpacingX, eggY + 0.35, r * eggSpacingZ);
        vectorsGroup.add(arrow);
      }
    }
    stackGroup.add(vectorsGroup);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2.5;
    controls.maxDistance = 12;

    let frameId = 0;
    const clock = new THREE.Clock();

    function tick() {
      const dt = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      vectorsGroup.visible = showStressRef.current;

      // Subtle nail balancing micro-wobble
      if (wobbleRef.current) {
        nailGroup.rotation.z = Math.sin(elapsed * 5.0) * 0.06;
        nailGroup.rotation.x = Math.cos(elapsed * 4.2) * 0.06;
      } else {
        nailGroup.rotation.z = THREE.MathUtils.damp(nailGroup.rotation.z, 0, 4, dt);
        nailGroup.rotation.x = THREE.MathUtils.damp(nailGroup.rotation.x, 0, 4, dt);
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
        <div className="font-semibold text-amber-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          Sparks of AGI: Physical Commonsense Assembly Stack
        </div>
        <div className="text-slate-400 text-[11px] mt-0.5">
          Microsoft Research (Bubeck et al. 2023) 5-Object Benchmark
        </div>
      </div>

      {/* Sleek Bottom Dock */}
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
            {isControlsOpen ? '▾ Hide Physics Dock' : '▴ Expand Physics Dock'}
          </button>
        </div>

        {isControlsOpen && (
          <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 shadow-2xl text-slate-200 text-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowStressVectors((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  showStressVectors
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {showStressVectors ? '✓ Force Vectors Active' : 'Show Force Vectors'}
              </button>

              <button
                type="button"
                onClick={() => setIsNailWobbling((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isNailWobbling
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {isNailWobbling ? 'Perturbing Equilibrium' : 'Test Dynamic Perturbation'}
              </button>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              <span>Center of Mass Coaligned (9 eggs 3x3 uniform load distribution)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

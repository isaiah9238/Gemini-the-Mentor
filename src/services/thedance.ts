/**
 * TheDanceService — Original Kinetic & Scientific Video Synthesis Service
 *
 * Connects to the Gemini Omni Flash Interactions API (`/api/gemini/video`)
 * using `gemini-omni-1.1-flash` and provides a real-time HTML5 Canvas +
 * Web Audio procedural choreography engine with `.webm` video recording.
 */

export type VideoAspectRatio = '16:9' | '9:16';

export interface DanceScenePreset {
  id: string;
  title: string;
  subtitle: string;
  prompt: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  tempoBpm: number;
  harmonicFrequenciesHz: number[];
}

export interface VideoGenerationRequest {
  prompt: string;
  aspectRatio?: VideoAspectRatio;
  previousInteractionId?: string;
}

export interface VideoGenerationResult {
  interactionId: string;
  videoDataUrl?: string;
  mimeType: string;
  outputText?: string;
  modelUsed: string;
}

export const DANCE_SCENE_PRESETS: DanceScenePreset[] = [
  {
    id: 'synaptic-waltz',
    title: 'The Dance of Synaptic Sparks',
    subtitle: 'Stochastic Vesicle Release & Action Potential Choreography',
    prompt:
      'A cinematic macro visualization of bioluminescent cortical neurons firing in a synchronized waltz, golden sodium ion waves cascading along axons in slow motion, deep sapphire depth of field, continuous smooth camera orbit.',
    primaryColor: '#38bdf8',
    secondaryColor: '#a855f7',
    accentColor: '#f59e0b',
    tempoBpm: 96,
    harmonicFrequenciesHz: [220.0, 277.18, 329.63, 440.0],
  },
  {
    id: 'lovelace-loom',
    title: 'Analytical Engine Jacquard Waltz',
    subtitle: 'Ada Lovelace (1843) Weaving Algebraic & Harmonic Patterns',
    prompt:
      'Victorian brass gears and Jacquard punched cards weaving glowing streams of algebraic symbols and musical notes in mid-air, warm candlelight reflecting off polished bronze, sweeping cinematic crane shot.',
    primaryColor: '#f59e0b',
    secondaryColor: '#ec4899',
    accentColor: '#38bdf8',
    tempoBpm: 108,
    harmonicFrequenciesHz: [261.63, 329.63, 392.0, 523.25],
  },
  {
    id: 'landauer-cascade',
    title: 'Cryogenic Landauer Equilibrium',
    subtitle: 'Reversible Logic Gates & Zero-Entropy Bit Transitions',
    prompt:
      'Photonic quantum wavepackets gliding smoothly through a crystalline silicon lattice at 1 Kelvin without thermal dissipation, emerald and cyan interference fringes dancing in harmonic resonance, macro lens.',
    primaryColor: '#10b981',
    secondaryColor: '#06b6d4',
    accentColor: '#6366f1',
    tempoBpm: 84,
    harmonicFrequenciesHz: [196.0, 246.94, 293.66, 392.0],
  },
];

export class TheDanceService {
  /**
   * Calls the backend `/api/gemini/video` endpoint powered by `gemini-omni-1.1-flash`
   * to generate or conversationally edit an AI video.
   */
  static async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
    const response = await fetch('/api/gemini/video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: request.prompt,
        aspectRatio: request.aspectRatio || '16:9',
        previousInteractionId: request.previousInteractionId,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate video with Gemini Omni Flash');
    }

    const mimeType = data.mimeType || 'video/mp4';
    const videoDataUrl = data.videoBase64
      ? `data:${mimeType};base64,${data.videoBase64}`
      : undefined;

    return {
      interactionId: data.interactionId || `local-${Date.now()}`,
      videoDataUrl,
      mimeType,
      outputText: data.text,
      modelUsed: data.modelUsed || 'gemini-omni-1.1-flash',
    };
  }

  /**
   * Renders a single frame of the procedural "Dance of Cognition" choreography
   * onto an HTML5 Canvas 2D context.
   */
  static renderChoreographyFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    elapsedSeconds: number,
    preset: DanceScenePreset,
    customCaption?: string
  ): void {
    // Deep cosmic background fade
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#020617');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const beatFreq = preset.tempoBpm / 60;
    const pulse = 0.5 + 0.5 * Math.sin(elapsedSeconds * beatFreq * Math.PI * 2);
    const cx = width / 2;
    const cy = height / 2;
    const baseRadius = Math.min(width, height) * 0.26;

    // Ambient radial glow
    const glowGrad = ctx.createRadialGradient(
      cx,
      cy,
      baseRadius * 0.1,
      cx,
      cy,
      baseRadius * (1.5 + pulse * 0.35)
    );
    glowGrad.addColorStop(0, `${preset.primaryColor}44`);
    glowGrad.addColorStop(0.5, `${preset.secondaryColor}22`);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, width, height);

    // Interlocking harmonic ribbons ("The Dance" trajectories)
    const ribbonCount = 3;
    for (let r = 0; r < ribbonCount; r++) {
      ctx.beginPath();
      const color =
        r === 0 ? preset.primaryColor : r === 1 ? preset.secondaryColor : preset.accentColor;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.2 - r * 0.4;

      for (let i = 0; i <= 160; i++) {
        const t = (i / 160) * Math.PI * 2;
        const phase = elapsedSeconds * (0.9 + r * 0.25) + r * ((Math.PI * 2) / 3);
        const rx =
          cx +
          Math.cos(t * 2 + phase) * baseRadius * (1.1 + 0.2 * Math.sin(t * 3 + elapsedSeconds)) +
          Math.sin(t * 5 - phase) * (baseRadius * 0.22);
        const ry =
          cy +
          Math.sin(t * 3 + phase * 0.8) * baseRadius * (0.78 + 0.15 * pulse) +
          Math.cos(t * 4 + elapsedSeconds) * (baseRadius * 0.15);

        if (i === 0) {
          ctx.moveTo(rx, ry);
        } else {
          ctx.lineTo(rx, ry);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Orbiting synaptic dancers (nodes + entanglement filaments)
    const nodeCount = 28;
    const nodes: { x: number; y: number; color: string; size: number }[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2 + elapsedSeconds * 0.65;
      const orbitWave = Math.sin(angle * 3 - elapsedSeconds * 1.8) * (baseRadius * 0.35);
      const dist = baseRadius * 0.85 + orbitWave;
      const x = cx + Math.cos(angle) * dist * 1.25;
      const y = cy + Math.sin(angle * 2) * (dist * 0.68);
      const color =
        i % 3 === 0
          ? preset.primaryColor
          : i % 3 === 1
            ? preset.secondaryColor
            : preset.accentColor;
      const size = 2.8 + (i % 4) * 1.1 + pulse * 1.8;
      nodes.push({ x, y, color, size });
    }

    // Connect proximate dancers
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d = Math.hypot(dx, dy);
        if (d < baseRadius * 0.65) {
          const alpha = Math.max(0.05, (1 - d / (baseRadius * 0.65)) * 0.45);
          ctx.strokeStyle = `rgba(148, 163, 184, ${alpha.toFixed(2)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw each dancer particle
    for (const node of nodes) {
      ctx.beginPath();
      ctx.fillStyle = node.color;
      ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // HUD Telemetry Overlay
    ctx.fillStyle = 'rgba(226, 232, 240, 0.9)';
    ctx.font = 'bold 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.fillText(preset.title.toUpperCase(), 20, 30);

    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    ctx.fillText(
      `${preset.subtitle}  |  ${preset.tempoBpm} BPM  |  t=${elapsedSeconds.toFixed(1)}s`,
      20,
      48
    );

    if (customCaption) {
      const truncated =
        customCaption.length > 84 ? `${customCaption.slice(0, 81)}...` : customCaption;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
      ctx.fillText(`Prompt: "${truncated}"`, 20, height - 18);
    }
  }
}

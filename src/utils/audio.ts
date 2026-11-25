import { RoomId } from '../types/game';

// Procedural Web Audio synthesizer for gentle, classroom-friendly tactile sound effects.

export interface ParticleTouchSoundOptions {
  isAccent?: boolean;
  /** Horizontal position in [0, 1] for subtle stereo panning */
  normalizedX?: number;
  /** Vertical position in [0, 1] for subtle pitch modulation */
  normalizedY?: number;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private muted = false;
  private lastParticleSoundMs = 0;

  setMuted(muted: boolean) {
    this.muted = muted;
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer;
    }
    const length = Math.floor(ctx.sampleRate * 0.35);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  private createOutputNode(ctx: AudioContext, normalizedX = 0.5): AudioNode {
    if (typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner();
      const clamped = Math.max(0, Math.min(1, normalizedX));
      panner.pan.setValueAtTime((clamped - 0.5) * 0.9, ctx.currentTime);
      panner.connect(ctx.destination);
      return panner;
    }
    return ctx.destination;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.08,
    delay = 0
  ) {
    const ctx = this.getContext();
    if (!ctx) return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  /**
   * Subtle contextual environmental sound triggered when touching or brushing
   * floating atmospheric particles in RoomStage. Throttled to stay calm in class.
   */
  playParticleTouch(
    roomId: RoomId,
    options: ParticleTouchSoundOptions = {}
  ) {
    const nowMs = performance.now();
    if (nowMs - this.lastParticleSoundMs < 130) return;

    const ctx = this.getContext();
    if (!ctx) return;
    this.lastParticleSoundMs = nowMs;

    const { isAccent = false, normalizedX = 0.5, normalizedY = 0.5 } = options;
    const t = ctx.currentTime;
    const out = this.createOutputNode(ctx, normalizedX);
    // Higher screen position -> subtly brighter pitch
    const heightPitch = 1.12 - Math.max(0, Math.min(1, normalizedY)) * 0.24;

    if (roomId === 'aborigenes') {
      if (isAccent) {
        // Warm volcanic hearth ember pop + soft clay resonance
        const noise = ctx.createBufferSource();
        noise.buffer = this.getNoiseBuffer(ctx);
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(1600 * heightPitch, t);
        bp.Q.setValueAtTime(3.2, t);
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.0001, t);
        nGain.gain.linearRampToValueAtTime(0.032, t + 0.008);
        nGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);
        noise.connect(bp);
        bp.connect(nGain);
        nGain.connect(out);
        noise.start(t);
        noise.stop(t + 0.09);

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(340 * heightPitch, t);
        osc.frequency.exponentialRampToValueAtTime(240 * heightPitch, t + 0.14);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.024, t + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t);
        osc.stop(t + 0.18);
      } else {
        // Delicate echoing cave droplet / sunlit volcanic dust chime
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const base = (860 + Math.random() * 190) * heightPitch;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(base, t);
        osc.frequency.exponentialRampToValueAtTime(base * 1.32, t + 0.095);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.028, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t);
        osc.stop(t + 0.19);
      }
      return;
    }

    if (roomId === 'conquista') {
      // Soft parchment dust rustle in the Royal Archive
      const noise = ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime((isAccent ? 2300 : 1850) * heightPitch, t);
      filter.Q.setValueAtTime(2.0, t);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.0001, t);
      nGain.gain.linearRampToValueAtTime(0.022, t + 0.025);
      nGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(out);
      noise.start(t);
      noise.stop(t + 0.16);

      // Faint Vegueta bronze / golden sunbeam overtone
      const pentatonic = [587.33, 659.25, 783.99, 880];
      const base =
        pentatonic[Math.floor(Math.random() * pentatonic.length)] * heightPitch;
      const ratios = isAccent ? [1, 2.4] : [1];
      ratios.forEach((ratio, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(base * ratio, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(idx === 0 ? 0.02 : 0.01, t + 0.014);
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          t + (isAccent ? 0.34 : 0.2)
        );
        osc.connect(gain);
        gain.connect(out);
        osc.start(t);
        osc.stop(t + 0.36);
      });
      return;
    }

    if (roomId === 'pirateria') {
      // Swept Atlantic trade-wind & sea-spray mist burst
      const noise = ctx.createBufferSource();
      noise.buffer = this.getNoiseBuffer(ctx);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(680 * heightPitch, t);
      filter.frequency.exponentialRampToValueAtTime(
        (isAccent ? 1900 : 1380) * heightPitch,
        t + 0.15
      );
      filter.Q.setValueAtTime(1.8, t);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.0001, t);
      nGain.gain.linearRampToValueAtTime(0.028, t + 0.03);
      nGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(out);
      noise.start(t);
      noise.stop(t + 0.22);

      if (isAccent) {
        // Distant brass watchtower bell / brazier spark shimmer
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(740 * heightPitch, t);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.022, t + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t);
        osc.stop(t + 0.3);
      }
      return;
    }

    // sigloXX: Gentle Puerto de La Luz water ripple & warm golden-hour shimmer
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const base = (isAccent ? 523.25 : 620 + Math.random() * 140) * heightPitch;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base * 0.94, t);
    osc.frequency.exponentialRampToValueAtTime(base * 1.08, t + 0.14);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.024, t + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    osc.connect(gain);
    gain.connect(out);
    osc.start(t);
    osc.stop(t + 0.26);

    if (isAccent) {
      // Warm fifth harmonic glint over the harbour
      const fifth = ctx.createOscillator();
      const fifthGain = ctx.createGain();
      fifth.type = 'sine';
      fifth.frequency.setValueAtTime(base * 1.5, t + 0.025);
      fifthGain.gain.setValueAtTime(0.0001, t + 0.025);
      fifthGain.gain.linearRampToValueAtTime(0.014, t + 0.05);
      fifthGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
      fifth.connect(fifthGain);
      fifthGain.connect(out);
      fifth.start(t + 0.025);
      fifth.stop(t + 0.34);
    }
  }

  playClick() {
    this.playTone(420, 0.06, 'triangle', 0.05);
  }

  playDiscover() {
    this.playTone(523.25, 0.14, 'sine', 0.07, 0);
    this.playTone(659.25, 0.2, 'sine', 0.07, 0.08);
  }

  playStep() {
    this.playTone(493.88, 0.09, 'triangle', 0.055);
  }

  playGentleError() {
    this.playTone(230, 0.16, 'triangle', 0.06, 0);
    this.playTone(196, 0.2, 'triangle', 0.05, 0.1);
  }

  playSuccess() {
    this.playTone(523.25, 0.18, 'sine', 0.075, 0);
    this.playTone(659.25, 0.18, 'sine', 0.075, 0.09);
    this.playTone(783.99, 0.34, 'sine', 0.08, 0.18);
  }

  playLockTick() {
    this.playTone(620, 0.045, 'triangle', 0.06, 0);
    this.playTone(340, 0.04, 'sine', 0.04, 0.025);
  }

  playLockOpen() {
    this.playTone(330, 0.09, 'triangle', 0.07, 0);
    this.playTone(440, 0.11, 'triangle', 0.075, 0.07);
    this.playTone(587.33, 0.16, 'sine', 0.08, 0.15);
    this.playTone(880, 0.36, 'sine', 0.085, 0.24);
  }

  playDoorOpen() {
    this.playTone(392.0, 0.2, 'triangle', 0.07, 0);
    this.playTone(493.88, 0.2, 'triangle', 0.07, 0.11);
    this.playTone(587.33, 0.24, 'sine', 0.075, 0.22);
    this.playTone(783.99, 0.45, 'sine', 0.085, 0.34);
  }

  playPowerUp() {
    this.playTone(587.33, 0.12, 'triangle', 0.07, 0);
    this.playTone(880.0, 0.22, 'sine', 0.08, 0.08);
  }

  playBadgeUnlock() {
    const notes = [587.33, 739.99, 880.0, 1174.66];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.22, 'sine', 0.075, idx * 0.08);
    });
  }

  playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, idx === notes.length - 1 ? 0.55 : 0.22, 'sine', 0.08, idx * 0.11);
    });
  }
}

export const soundEngine = new SoundEngine();

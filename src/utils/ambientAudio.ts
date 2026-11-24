import { RoomId } from '../types/game';

export type AmbientVolumeLevel = 0.28 | 0.55 | 0.85;

export interface AmbientSoundscapeMeta {
  label: string;
  elements: string;
  iconKey: 'wind' | 'bell' | 'waves' | 'ship';
}

export const AMBIENT_SOUNDSCAPE_META: Record<RoomId, AmbientSoundscapeMeta> = {
  aborigenes: {
    label: 'Viento de barranco y cueva',
    elements: 'Brisa volcánica, ecos de gotas y pájaros de cumbre',
    iconKey: 'wind',
  },
  conquista: {
    label: 'Murmullo de plaza y campanas',
    elements: 'Voces lejanas de mercado, acequia y campanas de Vegueta',
    iconKey: 'bell',
  },
  pirateria: {
    label: 'Oleaje atlántico y costa',
    elements: 'Olas rompiendo, brisa marina y gaviotas en la atalaya',
    iconKey: 'waves',
  },
  sigloXX: {
    label: 'Motores del puerto y sirena',
    elements: 'Ronroneo de barcos de vapor, agua del muelle y sirenas',
    iconKey: 'ship',
  },
};

interface ActiveSceneHandle {
  roomId: RoomId;
  bus: GainNode;
  stopSources: () => void;
  timers: number[];
}

/**
 * Procedural Web Audio environmental soundscape synthesizer tailored to each
 * historical epoch of Gran Canaria. Zero external audio dependencies, smooth
 * crossfades, classroom-safe gentle levels, and automatic ducking during speech.
 */
class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private brownBuffer: AudioBuffer | null = null;

  private activeScene: ActiveSceneHandle | null = null;
  private desiredRoom: RoomId | null = null;
  private enabled = true;
  private muted = false;
  private volume: AmbientVolumeLevel = 0.55;
  private ducked = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.computeMasterTarget(), this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.buildNoiseBuffers(this.ctx);
    }
    return this.ctx;
  }

  private buildNoiseBuffers(ctx: AudioContext) {
    const length = ctx.sampleRate * 4;

    // Pink-ish noise for wind, market voices, air
    const pink = ctx.createBuffer(1, length, ctx.sampleRate);
    const pData = pink.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      pData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }
    this.noiseBuffer = pink;

    // Deep brown noise for ocean surf & harbor rumble
    const brown = ctx.createBuffer(1, length, ctx.sampleRate);
    const brData = brown.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      brData[i] = lastOut * 2.4;
    }
    this.brownBuffer = brown;
  }

  private computeMasterTarget(): number {
    if (this.muted || !this.enabled || !this.desiredRoom) return 0.0001;
    // Overall gentle classroom cap (0.28 -> ~0.07, 0.55 -> ~0.14, 0.85 -> ~0.22)
    const base = this.volume * 0.26;
    return this.ducked ? base * 0.28 : base;
  }

  private rampMasterGain(durationSec = 0.45) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const target = this.computeMasterTarget();
    try {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(
        Math.max(0.0001, this.masterGain.gain.value),
        now
      );
      this.masterGain.gain.linearRampToValueAtTime(target, now + durationSec);
    } catch {
      // Ignore scheduling errors on closed context
    }
  }

  unlock() {
    const ctx = this.ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      void ctx.resume().then(() => {
        this.syncPlayback();
      });
    } else {
      this.syncPlayback();
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.syncPlayback();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.syncPlayback();
  }

  setVolume(volume: AmbientVolumeLevel) {
    this.volume = volume;
    this.rampMasterGain(0.25);
  }

  setDucked(ducked: boolean) {
    if (this.ducked === ducked) return;
    this.ducked = ducked;
    this.rampMasterGain(ducked ? 0.22 : 0.65);
  }

  setRoom(roomId: RoomId | null) {
    this.desiredRoom = roomId;
    this.syncPlayback();
  }

  private syncPlayback() {
    const shouldPlay =
      this.enabled && !this.muted && this.desiredRoom !== null;

    if (!shouldPlay) {
      if (this.activeScene) {
        this.fadeOutAndDispose(this.activeScene, 0.55);
        this.activeScene = null;
      }
      this.rampMasterGain(0.4);
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const targetRoom = this.desiredRoom!;
    if (this.activeScene && this.activeScene.roomId === targetRoom) {
      this.rampMasterGain(0.4);
      return;
    }

    // Crossfade out previous room soundscape
    if (this.activeScene) {
      this.fadeOutAndDispose(this.activeScene, 0.75);
      this.activeScene = null;
    }

    this.rampMasterGain(0.45);
    this.activeScene = this.startRoomSoundscape(ctx, this.masterGain, targetRoom);
  }

  private fadeOutAndDispose(handle: ActiveSceneHandle, fadeSec: number) {
    handle.timers.forEach((id) => window.clearTimeout(id));
    handle.timers.length = 0;

    if (!this.ctx) {
      handle.stopSources();
      return;
    }
    const now = this.ctx.currentTime;
    try {
      handle.bus.gain.cancelScheduledValues(now);
      handle.bus.gain.setValueAtTime(
        Math.max(0.0001, handle.bus.gain.value),
        now
      );
      handle.bus.gain.linearRampToValueAtTime(0.0001, now + fadeSec);
    } catch {
      // Ignore
    }

    window.setTimeout(() => {
      handle.stopSources();
      try {
        handle.bus.disconnect();
      } catch {
        // Ignore
      }
    }, Math.round((fadeSec + 0.12) * 1000));
  }

  private createLoopedNoise(
    ctx: AudioContext,
    buffer: AudioBuffer
  ): AudioBufferSourceNode {
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    return src;
  }

  private startRoomSoundscape(
    ctx: AudioContext,
    destination: GainNode,
    roomId: RoomId
  ): ActiveSceneHandle {
    const bus = ctx.createGain();
    const now = ctx.currentTime;
    bus.gain.setValueAtTime(0.0001, now);
    bus.gain.linearRampToValueAtTime(1.0, now + 0.95);
    bus.connect(destination);

    const stopCallbacks: Array<() => void> = [];
    const timers: number[] = [];
    let disposed = false;

    const scheduleRecurring = (
      fn: () => void,
      minMs: number,
      maxMs: number,
      initialDelayMs: number
    ) => {
      const queueNext = (delay: number) => {
        const id = window.setTimeout(() => {
          if (disposed || !this.ctx || this.ctx.state !== 'running') return;
          fn();
          const nextDelay = minMs + Math.random() * (maxMs - minMs);
          queueNext(nextDelay);
        }, delay);
        timers.push(id);
      };
      queueNext(initialDelayMs);
    };

    const pink = this.noiseBuffer!;
    const brown = this.brownBuffer!;

    if (roomId === 'aborigenes') {
      // 1. Ravine & Cave Wind (LFO-swept bandpass pink noise)
      const windSrc = this.createLoopedNoise(ctx, pink);
      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(300, now);
      windFilter.Q.setValueAtTime(2.6, now);

      const windLfo = ctx.createOscillator();
      windLfo.type = 'sine';
      windLfo.frequency.setValueAtTime(0.11, now);
      const windLfoDepth = ctx.createGain();
      windLfoDepth.gain.setValueAtTime(135, now);
      windLfo.connect(windLfoDepth);
      windLfoDepth.connect(windFilter.frequency);

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.68, now);
      windSrc.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(bus);

      // 2. Soft volcanic cavern air resonance
      const caveSrc = this.createLoopedNoise(ctx, brown);
      const caveFilter = ctx.createBiquadFilter();
      caveFilter.type = 'lowpass';
      caveFilter.frequency.setValueAtTime(160, now);
      const caveGain = ctx.createGain();
      caveGain.gain.setValueAtTime(0.28, now);
      caveSrc.connect(caveFilter);
      caveFilter.connect(caveGain);
      caveGain.connect(bus);

      windSrc.start(now);
      windLfo.start(now);
      caveSrc.start(now);

      stopCallbacks.push(() => {
        [windSrc, windLfo, caveSrc].forEach((n) => {
          try {
            n.stop();
            n.disconnect();
          } catch {
            // Ignore
          }
        });
      });

      // 3. Delicate echoing cave water drops
      scheduleRecurring(
        () => this.triggerCaveDrop(ctx, bus),
        3800,
        7800,
        2200
      );

      // 4. Soft distant highland canary chirp
      scheduleRecurring(
        () => this.triggerCanaryBird(ctx, bus),
        6800,
        13000,
        4600
      );
    } else if (roomId === 'conquista') {
      // 1. Historic Plaza & Market Murmur (dual formant modulated noise)
      const crowdSrc = this.createLoopedNoise(ctx, pink);

      const formantLow = ctx.createBiquadFilter();
      formantLow.type = 'bandpass';
      formantLow.frequency.setValueAtTime(420, now);
      formantLow.Q.setValueAtTime(2.2, now);

      const formantMid = ctx.createBiquadFilter();
      formantMid.type = 'bandpass';
      formantMid.frequency.setValueAtTime(920, now);
      formantMid.Q.setValueAtTime(3.0, now);

      const murmurGainLow = ctx.createGain();
      murmurGainLow.gain.setValueAtTime(0.42, now);
      const murmurGainMid = ctx.createGain();
      murmurGainMid.gain.setValueAtTime(0.26, now);

      const lfoA = ctx.createOscillator();
      lfoA.frequency.setValueAtTime(0.37, now);
      const lfoAGain = ctx.createGain();
      lfoAGain.gain.setValueAtTime(0.14, now);
      lfoA.connect(lfoAGain);
      lfoAGain.connect(murmurGainLow.gain);

      const lfoB = ctx.createOscillator();
      lfoB.frequency.setValueAtTime(0.61, now);
      const lfoBGain = ctx.createGain();
      lfoBGain.gain.setValueAtTime(0.11, now);
      lfoB.connect(lfoBGain);
      lfoBGain.connect(murmurGainMid.gain);

      crowdSrc.connect(formantLow);
      crowdSrc.connect(formantMid);
      formantLow.connect(murmurGainLow);
      formantMid.connect(murmurGainMid);
      murmurGainLow.connect(bus);
      murmurGainMid.connect(bus);

      // 2. Soft Guiniguada stream / courtyard air
      const streamSrc = this.createLoopedNoise(ctx, pink);
      const streamFilter = ctx.createBiquadFilter();
      streamFilter.type = 'highpass';
      streamFilter.frequency.setValueAtTime(1400, now);
      const streamGain = ctx.createGain();
      streamGain.gain.setValueAtTime(0.12, now);
      streamSrc.connect(streamFilter);
      streamFilter.connect(streamGain);
      streamGain.connect(bus);

      crowdSrc.start(now);
      lfoA.start(now);
      lfoB.start(now);
      streamSrc.start(now);

      stopCallbacks.push(() => {
        [crowdSrc, lfoA, lfoB, streamSrc].forEach((n) => {
          try {
            n.stop();
            n.disconnect();
          } catch {
            // Ignore
          }
        });
      });

      // 3. Distant Vegueta bronze church bell chimes
      scheduleRecurring(
        () => this.triggerChurchBell(ctx, bus),
        8500,
        15000,
        3200
      );
    } else if (roomId === 'pirateria') {
      // 1. Rhythmic Atlantic Ocean Waves (LFO sweeping filter + amplitude)
      const waveSrc = this.createLoopedNoise(ctx, brown);
      const waveFilter = ctx.createBiquadFilter();
      waveFilter.type = 'lowpass';
      waveFilter.frequency.setValueAtTime(340, now);

      const waveGain = ctx.createGain();
      waveGain.gain.setValueAtTime(0.55, now);

      const tideLfo = ctx.createOscillator();
      tideLfo.type = 'sine';
      tideLfo.frequency.setValueAtTime(0.13, now); // ~7.7s wave cycle

      const tideFilterDepth = ctx.createGain();
      tideFilterDepth.gain.setValueAtTime(220, now);
      tideLfo.connect(tideFilterDepth);
      tideFilterDepth.connect(waveFilter.frequency);

      const tideAmpDepth = ctx.createGain();
      tideAmpDepth.gain.setValueAtTime(0.26, now);
      tideLfo.connect(tideAmpDepth);
      tideAmpDepth.connect(waveGain.gain);

      waveSrc.connect(waveFilter);
      waveFilter.connect(waveGain);
      waveGain.connect(bus);

      // 2. Crisp coastal trade wind (alisios)
      const breezeSrc = this.createLoopedNoise(ctx, pink);
      const breezeFilter = ctx.createBiquadFilter();
      breezeFilter.type = 'bandpass';
      breezeFilter.frequency.setValueAtTime(780, now);
      breezeFilter.Q.setValueAtTime(1.4, now);
      const breezeGain = ctx.createGain();
      breezeGain.gain.setValueAtTime(0.24, now);
      breezeSrc.connect(breezeFilter);
      breezeFilter.connect(breezeGain);
      breezeGain.connect(bus);

      waveSrc.start(now);
      tideLfo.start(now);
      breezeSrc.start(now);

      stopCallbacks.push(() => {
        [waveSrc, tideLfo, breezeSrc].forEach((n) => {
          try {
            n.stop();
            n.disconnect();
          } catch {
            // Ignore
          }
        });
      });

      // 3. Distant Atlantic seagulls
      scheduleRecurring(
        () => this.triggerSeagull(ctx, bus),
        6500,
        12500,
        2900
      );

      // 4. Distant coastal watch bell
      scheduleRecurring(
        () => this.triggerHarborBell(ctx, bus),
        11000,
        18000,
        7400
      );
    } else if (roomId === 'sigloXX') {
      // 1. Warm harbor vessel engine hum (low mellow saw + triangle with gentle rhythmic chug)
      const engineOsc1 = ctx.createOscillator();
      engineOsc1.type = 'sawtooth';
      engineOsc1.frequency.setValueAtTime(56, now);

      const engineOsc2 = ctx.createOscillator();
      engineOsc2.type = 'triangle';
      engineOsc2.frequency.setValueAtTime(112, now);

      const engineFilter = ctx.createBiquadFilter();
      engineFilter.type = 'lowpass';
      engineFilter.frequency.setValueAtTime(155, now);
      engineFilter.Q.setValueAtTime(1.2, now);

      const engineGain = ctx.createGain();
      engineGain.gain.setValueAtTime(0.24, now);

      const chugLfo = ctx.createOscillator();
      chugLfo.type = 'sine';
      chugLfo.frequency.setValueAtTime(3.1, now);
      const chugDepth = ctx.createGain();
      chugDepth.gain.setValueAtTime(0.055, now);
      chugLfo.connect(chugDepth);
      chugDepth.connect(engineGain.gain);

      engineOsc1.connect(engineFilter);
      engineOsc2.connect(engineFilter);
      engineFilter.connect(engineGain);
      engineGain.connect(bus);

      // 2. Calm harbor water lapping
      const harborSrc = this.createLoopedNoise(ctx, brown);
      const harborFilter = ctx.createBiquadFilter();
      harborFilter.type = 'lowpass';
      harborFilter.frequency.setValueAtTime(240, now);
      const harborGain = ctx.createGain();
      harborGain.gain.setValueAtTime(0.36, now);
      harborSrc.connect(harborFilter);
      harborFilter.connect(harborGain);
      harborGain.connect(bus);

      engineOsc1.start(now);
      engineOsc2.start(now);
      chugLfo.start(now);
      harborSrc.start(now);

      stopCallbacks.push(() => {
        [engineOsc1, engineOsc2, chugLfo, harborSrc].forEach((n) => {
          try {
            n.stop();
            n.disconnect();
          } catch {
            // Ignore
          }
        });
      });

      // 3. Nostalgic Puerto de La Luz steamship foghorn
      scheduleRecurring(
        () => this.triggerShipHorn(ctx, bus),
        9500,
        16500,
        3600
      );

      // 4. Distant seagull at the dock
      scheduleRecurring(
        () => this.triggerSeagull(ctx, bus),
        9000,
        15000,
        6800
      );
    }

    return {
      roomId,
      bus,
      timers,
      stopSources: () => {
        disposed = true;
        stopCallbacks.forEach((cb) => cb());
      },
    };
  }

  private triggerCaveDrop(ctx: AudioContext, bus: GainNode) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const base = 980 + Math.random() * 420;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(base, t);
    osc.frequency.exponentialRampToValueAtTime(base * 1.48, t + 0.09);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.14, t + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

    osc.connect(gain);
    gain.connect(bus);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  private triggerCanaryBird(ctx: AudioContext, bus: GainNode) {
    const t = ctx.currentTime;
    const notes = [2450, 2950, 2650];
    notes.forEach((freq, i) => {
      const start = t + i * 0.13;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.12, start + 0.09);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.055, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.11);
      osc.connect(gain);
      gain.connect(bus);
      osc.start(start);
      osc.stop(start + 0.13);
    });
  }

  private triggerChurchBell(ctx: AudioContext, bus: GainNode) {
    const t = ctx.currentTime;
    // Bronze bell inharmonic partial ratios
    const fundamental = Math.random() > 0.5 ? 293.66 : 329.63; // D4 or E4
    const partials = [
      { ratio: 1.0, vol: 0.16, dur: 2.6 },
      { ratio: 2.0, vol: 0.08, dur: 1.9 },
      { ratio: 2.4, vol: 0.055, dur: 1.4 },
      { ratio: 3.0, vol: 0.035, dur: 1.0 },
    ];
    partials.forEach(({ ratio, vol, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * ratio, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(bus);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    });
  }

  private triggerHarborBell(ctx: AudioContext, bus: GainNode) {
    const t = ctx.currentTime;
    [0, 0.36].forEach((offset) => {
      const start = t + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(740, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.07, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.85);
      osc.connect(gain);
      gain.connect(bus);
      osc.start(start);
      osc.stop(start + 0.9);
    });
  }

  private triggerSeagull(ctx: AudioContext, bus: GainNode) {
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const peak = 1480 + Math.random() * 240;
    osc.frequency.setValueAtTime(peak * 0.82, t);
    osc.frequency.exponentialRampToValueAtTime(peak, t + 0.14);
    osc.frequency.exponentialRampToValueAtTime(peak * 0.62, t + 0.56);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(2.4, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.085, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(bus);
    osc.start(t);
    osc.stop(t + 0.66);
  }

  private triggerShipHorn(ctx: AudioContext, bus: GainNode) {
    const t = ctx.currentTime;
    const freqs = [138.59, 207.65]; // Nostalgic warm fifth (C#3 + G#3)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, t);
    filter.connect(bus);

    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(idx === 0 ? 0.14 : 0.085, t + 0.45);
      gain.gain.setValueAtTime(idx === 0 ? 0.13 : 0.08, t + 1.45);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.45);

      osc.connect(gain);
      gain.connect(filter);
      osc.start(t);
      osc.stop(t + 2.55);
    });
  }
}

export const ambientAudio = new AmbientAudioEngine();

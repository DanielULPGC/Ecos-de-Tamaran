// Procedural Web Audio synthesizer for gentle, classroom-friendly tactile sound effects.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

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

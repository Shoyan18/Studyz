// Web Audio API based sound synthesizer for Focus Mode and Notifications

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Pleasant gentle chime when starting focus
   */
  playStart() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    
    // Arpeggio note 1: E5 (659Hz) -> A5 (880Hz)
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2); // G5

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  }

  /**
   * Soft tick sound
   */
  playTick() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);

    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  /**
   * Celebratory triumph chord when focus session finishes or level up
   */
  playComplete() {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C Major arpeggio / chord
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + i * 0.12 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 1.3);
    });
  }

  /**
   * iPhone Tri-Tone bell ring sound for notifications
   */
  playNotification() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const tones = [
      { freq: 783.99, delay: 0.0, duration: 0.4 },   // G5
      { freq: 1046.50, delay: 0.13, duration: 0.4 },  // C6
      { freq: 1318.51, delay: 0.26, duration: 0.65 }, // E6
    ];

    tones.forEach(({ freq, delay, duration }) => {
      const startTime = now + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2.4, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.28, startTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      overtoneGain.gain.setValueAtTime(0.001, startTime);
      overtoneGain.gain.linearRampToValueAtTime(0.07, startTime + 0.005);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.4);

      osc.connect(gain);
      overtone.connect(overtoneGain);
      gain.connect(ctx.destination);
      overtoneGain.connect(ctx.destination);

      osc.start(startTime);
      overtone.start(startTime);
      osc.stop(startTime + duration + 0.05);
      overtone.stop(startTime + duration + 0.05);
    });
  }

  /**
   * Ambient sound generator: Rain, White Noise, Ocean Waves, Lo-Fi Warmth
   */
  startAmbient(type: 'rain' | 'whitenoise' | 'waves' | 'lofi' = 'rain', volume = 0.2) {
    this.stopAmbient();
    const ctx = this.getContext();
    if (!ctx) return;

    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    if (type === 'whitenoise') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'rain') {
      // Pink / brown noise filter for rain effect
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }
    } else {
      // Low pass soothing waves
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = type === 'whitenoise' ? 'allpass' : 'lowpass';
    filter.frequency.setValueAtTime(type === 'rain' ? 800 : 400, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start();
    this.ambientSource = whiteNoise;
    this.ambientGain = gain;
    this.isAmbientPlaying = true;
  }

  setAmbientVolume(vol: number) {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
  }

  stopAmbient() {
    if (this.ambientSource) {
      try {
        (this.ambientSource as AudioBufferSourceNode).stop();
        this.ambientSource.disconnect();
      } catch {}
      this.ambientSource = null;
    }
    this.isAmbientPlaying = false;
  }

  getIsAmbientPlaying() {
    return this.isAmbientPlaying;
  }
}

export const soundManager = new SoundEngine();

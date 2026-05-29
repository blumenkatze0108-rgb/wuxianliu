// Real-time atmospheric horror sound generator using the Web Audio API.
// This is 100% self-contained and operates without loading remote audio files.

class AudioManager {
  private ctx: AudioContext | null = null;
  private ambientHum: OscillatorNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private ambientGain: GainNode | null = null;
  private heartbeatInterval: any = null;
  private tensionValue: number = 0; // 0 (calm) to 1 (pure panic)
  private isMuted: boolean = false;

  constructor() {
    // Lazy loaded on User Interaction
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.startAmbientDrone();
      this.startHeartbeatLoop();
    } catch (e) {
      console.warn("Web Audio API not supported:", e);
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx) {
      if (muted) {
        this.ctx.suspend();
      } else {
        this.ctx.resume();
      }
    }
  }

  public setTension(tension: number) {
    this.tensionValue = Math.max(0, Math.min(1, tension));
    if (!this.ctx || this.isMuted) return;

    // Adjust ambient hum pitch and intensity
    if (this.ambientHum && this.ctx) {
      // Calmer = deep low rumble (~55Hz), Panicked = slightly higher & unstable (~65Hz)
      const targetFreq = 50 + this.tensionValue * 18;
      this.ambientHum.frequency.setValueAtTime(targetFreq, this.ctx.currentTime);
    }

    if (this.ambientFilter && this.ctx) {
      // Adjust filter resonance & cutoff
      const cutoff = 120 + this.tensionValue * 150;
      this.ambientFilter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);
      this.ambientFilter.Q.setValueAtTime(1 + this.tensionValue * 5, this.ctx.currentTime);
    }

    // Adapt heartbeat rate
    this.startHeartbeatLoop();
  }

  private startAmbientDrone() {
    if (!this.ctx) return;
    try {
      // 1. Core rumble oscillator (Sub-bass)
      const osc1 = this.ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(50, this.ctx.currentTime);

      const osc2 = this.ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(51.5, this.ctx.currentTime); // Beat frequency for deep acoustic thumping

      // Filter to cut out high end, leaving deep sub-bass physical vibration
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(120, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();

      this.ambientHum = osc1;
      this.ambientFilter = filter;
      this.ambientGain = gain;
    } catch (err) {
      console.error("Failed to start ambient drone:", err);
    }
  }

  private startHeartbeatLoop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.isMuted) return;

    // Heart rate goes from 50 BPM (tension=0) to 140 BPM (tension=1)
    const bpm = 48 + this.tensionValue * 92;
    const intervalMs = (60 / bpm) * 1000;

    this.heartbeatInterval = setInterval(() => {
      this.playHeartbeatStroke();
    }, intervalMs);
  }

  private playHeartbeatStroke() {
    if (!this.ctx || this.isMuted || this.ctx.state === "suspended") return;
    try {
      const now = this.ctx.currentTime;
      
      // Heartbeat has two beats: lub-dub
      this.playThumpNode(now, 1.0, 52); // lub
      this.playThumpNode(now + 0.28, 0.72, 48); // dub
    } catch (e) {
      // ignores AudioContext exceptions
    }
  }

  private playThumpNode(startTime: number, volumeFactor: number, baseFrequency: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lowpass = this.ctx.createBiquadFilter();

    osc.type = "sine";
    // Pitch drops quickly for an impactful thump
    osc.frequency.setValueAtTime(baseFrequency, startTime);
    osc.frequency.setValueAtTime(baseFrequency, startTime + 0.05);
    osc.frequency.exponentialRampToValueAtTime(10, startTime + 0.2);

    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(80, startTime);

    // Deep chest volume based on overall tension (calmer is quieter, panicked is terrifyingly loud)
    const baseGain = 0.22 + this.tensionValue * 0.45;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(baseGain * volumeFactor, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

    osc.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.3);
  }

  // Trigger high frequency glitch noise with a random left/right channel balance!
  public triggerGlitchNoise() {
    if (!this.ctx || this.isMuted || this.ctx.state === "suspended") return;
    try {
      const now = this.ctx.currentTime;
      const duration = 0.08 + Math.random() * 0.15;

      // 1. White Noise Buffer
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // High frequency digital crackle
        data[i] = Math.sin(i * 0.4) * (Math.random() * 2 - 1) * (i < bufferSize * 0.1 ? 1 : 0.82);
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = Math.random() > 0.5 ? "bandpass" : "highpass";
      filter.frequency.setValueAtTime(1000 + Math.random() * 6000, now);
      filter.Q.setValueAtTime(2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08 + Math.random() * 0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      // Random left-right spatial panning for disorientation!
      const panner = this.ctx.createStereoPanner();
      const panValue = Math.random() * 2 - 1; // -1 (left) to 1 (right)
      panner.pan.setValueAtTime(panValue, now);

      noiseNode.connect(filter);
      filter.connect(panner);
      panner.connect(gain);
      gain.connect(this.ctx.destination);

      noiseNode.start(now);
      noiseNode.stop(now + duration + 0.05);
    } catch (e) {
      // Safe guard
    }
  }

  // Creepy environmental knocks
  public triggerKnock() {
    if (!this.ctx || this.isMuted || this.ctx.state === "suspended") return;
    try {
      const now = this.ctx.currentTime;
      
      const playSingleKnock = (delay: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        const panner = this.ctx.createStereoPanner();

        osc.type = "sine";
        osc.frequency.setValueAtTime(140, now + delay);
        osc.frequency.exponentialRampToValueAtTime(40, now + delay + 0.08);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(250, now + delay);

        gain.gain.setValueAtTime(0, now + delay);
        gain.gain.linearRampToValueAtTime(0.35, now + delay + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

        // Pan to opposite sides or random
        const panVal = Math.random() > 0.5 ? -0.85 : 0.85;
        panner.pan.setValueAtTime(panVal, now + delay);

        osc.connect(filter);
        filter.connect(panner);
        panner.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.15);
      };

      playSingleKnock(0);
      playSingleKnock(0.18 + Math.random() * 0.05); // Double knock
    } catch (e) {
      // ignores Failures
    }
  }

  // Synthesizes a strange background hum/whisper voice or triggers HTML5 TTS whispers
  public triggerWhisper(text: string) {
    if (this.isMuted) return;
    try {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        
        // Find a creepy sounding voice if possible (usually lower pitch)
        const voices = window.speechSynthesis.getVoices();
        const localizedChineseVoices = voices.filter(v => v.lang.includes('zh') || v.lang.includes('CN'));
        if (localizedChineseVoices.length > 0) {
          u.voice = localizedChineseVoices[Math.floor(Math.random() * localizedChineseVoices.length)];
        }
        
        u.pitch = 0.3 + (1 - this.tensionValue) * 0.3; // Deep whisper
        u.rate = 0.65; // Slow and creepy
        u.volume = 0.4 + this.tensionValue * 0.4;
        
        window.speechSynthesis.speak(u);
      }
    } catch (e) {
      console.warn("Speech synthesis suppressed:", e);
    }
  }

  // Create an eerie metallic scratch sound using frequency modulated nodes
  public triggerScratch() {
    if (!this.ctx || this.isMuted || this.ctx.state === "suspended") return;
    try {
      const now = this.ctx.currentTime;
      const duration = 0.4 + Math.random() * 0.4;

      const carrier = this.ctx.createOscillator();
      const modulator = this.ctx.createOscillator();
      const modGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      const panner = this.ctx.createStereoPanner();

      carrier.type = "sawtooth";
      carrier.frequency.setValueAtTime(100, now);
      carrier.frequency.exponentialRampToValueAtTime(800 + Math.random() * 400, now + duration);

      modulator.type = "triangle";
      modulator.frequency.setValueAtTime(35, now);
      modulator.frequency.exponentialRampToValueAtTime(150, now + duration);

      modGain.gain.setValueAtTime(180, now);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, now);
      filter.Q.setValueAtTime(3, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      panner.pan.setValueAtTime(Math.random() * 1.6 - 0.8, now);

      modulator.connect(modGain);
      modGain.connect(carrier.frequency);

      carrier.connect(filter);
      filter.connect(panner);
      panner.connect(gain);
      gain.connect(this.ctx.destination);

      carrier.start(now);
      modulator.start(now);

      carrier.stop(now + duration + 0.05);
      modulator.stop(now + duration + 0.05);
    } catch (e) {
      // Safe guard
    }
  }
}

export const audio = new AudioManager();

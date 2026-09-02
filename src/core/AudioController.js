/**
 * Web Audio API Synthesizer for Lunar Base Soundscape & Aerospace UI SFX
 * 100% Procedural - No external audio files required
 */

import { store } from '../state/store.js';

class AudioController {
  constructor() {
    this.ctx = null;
    this.ambientNode = null;
    this.droneGain = null;
    this.isInitialized = false;
    this.enabled = true;

    store.on('audioEnabled', (val) => {
      this.enabled = val;
      if (this.droneGain && this.ctx) {
        this.droneGain.gain.setTargetAtTime(val ? 0.08 : 0, this.ctx.currentTime, 0.5);
      }
    });
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.setupAmbientDrone();
      this.isInitialized = true;
    } catch (e) {
      console.warn("AudioContext could not be initialized:", e);
    }
  }

  resume() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setupAmbientDrone() {
    if (!this.ctx) return;

    // Sub-bass drone for lunar pressurized habitat environment
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    this.droneGain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.value = 55; // A1 low hum

    osc2.type = 'triangle';
    osc2.frequency.value = 110.2; // A2 with slight detuning for analog warmth

    filter.type = 'lowpass';
    filter.frequency.value = 180;
    filter.Q.value = 2;

    this.droneGain.gain.value = this.enabled ? 0.08 : 0;

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(this.droneGain);
    this.droneGain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
  }

  playUIBeep(frequency = 880, duration = 0.08, type = 'sine') {
    if (!this.enabled || !this.ctx) return;
    try {
      this.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  playSubsystemSelect() {
    if (!this.enabled || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;

      // Two-tone aerospace confirmation chime
      [587.33, 880].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0.05, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.12);
      });
    } catch (e) {}
  }

  playFlyToWhoosh() {
    if (!this.enabled || !this.ctx) return;
    try {
      this.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.3);
      filter.frequency.exponentialRampToValueAtTime(100, now + 0.8);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.04, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {}
  }
}

export const audio = new AudioController();

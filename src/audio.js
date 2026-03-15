// synthesized-audio.js
// A zero-dependency audio engine for Scoundrel-online using Web Audio API

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }

  createOscillator(freq, type = 'sine', duration = 0.1, volume = 0.1) {
    if (!this.ctx || !this.enabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Card Flip - short, percussive click
  playFlip() {
    this.init();
    this.createOscillator(400, 'square', 0.05, 0.05);
  }

  // Damage - low thud followed by noise
  playDamage() {
    this.init();
    this.createOscillator(150, 'sawtooth', 0.2, 0.1);
  }

  // Coin - high bright ting
  playCoin() {
    this.init();
    this.createOscillator(880, 'sine', 0.15, 0.1);
    setTimeout(() => this.createOscillator(1320, 'sine', 0.1, 0.05), 50);
  }

  // Win - rising melody
  playWin() {
    this.init();
    const notes = [440, 554, 659, 880];
    notes.forEach((note, i) => {
      setTimeout(() => this.createOscillator(note, 'sine', 0.2, 0.1), i * 100);
    });
  }

  // Lose - falling melody
  playLose() {
    this.init();
    const notes = [300, 250, 200, 150];
    notes.forEach((note, i) => {
      setTimeout(() => this.createOscillator(note, 'sawtooth', 0.3, 0.1), i * 150);
    });
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

export const audio = new AudioEngine();

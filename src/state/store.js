/**
 * Central Reactive State Store for ISRO Lunar Mission Digital Twin
 */

class MissionStore {
  constructor() {
    this.state = {
      activeSubsystem: "overview",
      cameraMode: "orbit", // 'orbit' | 'tour' | 'topdown' | 'rover' | 'flyTo'
      solarAngle: 124,     // Degrees (0 to 360)
      xrayMode: false,     // Diagnostic pipeline/grid visualization
      markersVisible: true,
      audioEnabled: true,
      roverActive: true,
      tourIndex: 0,
      isFullscreen: false,
      hudVisible: true,    // Toggle clean view / immersive mode
    };

    this.listeners = new Map();
  }

  getState() {
    return this.state;
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    if (this.state[key] === value) return;
    const prev = this.state[key];
    this.state[key] = value;
    this.emit(key, value, prev);
    this.emit('*', this.state);
  }

  update(partialState) {
    const changes = {};
    for (const [key, value] of Object.entries(partialState)) {
      if (this.state[key] !== value) {
        changes[key] = { prev: this.state[key], next: value };
        this.state[key] = value;
        this.emit(key, value, changes[key].prev);
      }
    }
    if (Object.keys(changes).length > 0) {
      this.emit('*', this.state);
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, ...args) {
    if (this.listeners.has(event)) {
      for (const cb of this.listeners.get(event)) {
        try {
          cb(...args);
        } catch (err) {
          console.error(`Error in store listener for "${event}":`, err);
        }
      }
    }
  }
}

export const store = new MissionStore();

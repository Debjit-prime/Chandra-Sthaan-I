/**
 * Telemetry Stream Simulation Engine
 * Generates continuous live metrics and fluctuations for all lunar base subsystems
 */

import { store } from './store.js';

class TelemetryEngine {
  constructor() {
    this.metrics = {
      // Base Core & Energy
      powerTotal: 2.84,           // MW
      solarEfficiency: 96.4,      // %
      batteryStateOfCharge: 98.2, // %
      reactorTemp: 924,           // K
      
      // Life Support & Habitat
      basePressure: 101.32,       // kPa
      internalTemp: 21.4,         // °C
      eclssO2: 99.4,              // %
      co2Level: 0.22,             // kPa
      crewHealthIndex: 99.1,      // %
      bioDomeHumidity: 62.4,      // %
      plantHealthIndex: 97.8,     // %
      nutrientFlowRate: 3.42,     // L/min

      // ISRU & Propellant Production
      waterReserves: 14280,       // Liters
      isruExtractionRate: 42.8,   // L/hr
      cryoLOXPressure: 480,       // kPa
      drillBitTemp: -42.0,        // °C

      // Lander & Surface
      landerFuel: 88.5,           // %
      landerO2: 94.2,             // %
      landerCoreTemp: 18.2,       // °C
      landingPadStatus: "LOCKED",

      // Comms & Relay
      commsBandwidth: 9.84,       // Gbps
      commsLatency: 1.28,         // s
      signalToNoise: 48.2,        // dB
      dishAzimuth: 142.6,         // °

      // Surface Operations & Rover Fleet
      roverBattery: 94.5,         // %
      roverTraverseSpeed: 4.8,    // km/h
      roverPayloadMass: 310,      // kg
      roverDistanceTraveled: 18.4 // km
    };

    this.timer = null;
    this.metSeconds = 142 * 86400 + 8 * 3600 + 24 * 60 + 19;
    this.history = {}; // Metric history for sparkline charts
    this.subscribers = new Set();
  }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), 1000);
    this.tick();
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  tick() {
    this.metSeconds += 1;
    const solarAngle = store.get('solarAngle') || 124;
    
    // Dynamic calculation: solar power varies slightly with solar angle & efficiency
    const solarFactor = Math.max(0.4, Math.sin((solarAngle * Math.PI) / 180) * 0.5 + 0.5);
    const targetPower = (2.4 * solarFactor + 0.8).toFixed(2); // Solar + nuclear baseline
    
    // Subtle realistic random fluctuations
    this.metrics.powerTotal = parseFloat((parseFloat(targetPower) + (Math.random() - 0.5) * 0.04).toFixed(2));
    this.metrics.solarEfficiency = parseFloat((95.5 + Math.random() * 1.8).toFixed(1));
    this.metrics.batteryStateOfCharge = parseFloat((97.8 + Math.random() * 0.8).toFixed(1));
    this.metrics.reactorTemp = Math.round(920 + Math.random() * 8);

    this.metrics.basePressure = parseFloat((101.30 + (Math.random() - 0.5) * 0.08).toFixed(2));
    this.metrics.internalTemp = parseFloat((21.4 + (Math.random() - 0.5) * 0.2).toFixed(1));
    this.metrics.eclssO2 = parseFloat((99.3 + Math.random() * 0.3).toFixed(1));
    this.metrics.co2Level = parseFloat((0.21 + Math.random() * 0.02).toFixed(2));
    this.metrics.bioDomeHumidity = parseFloat((62.0 + (Math.random() - 0.5) * 1.2).toFixed(1));

    this.metrics.waterReserves = Math.round(this.metrics.waterReserves + Math.random() * 0.5);
    this.metrics.isruExtractionRate = parseFloat((42.4 + (Math.random() - 0.5) * 1.5).toFixed(1));
    this.metrics.cryoLOXPressure = Math.round(480 + (Math.random() - 0.5) * 4);

    this.metrics.commsBandwidth = parseFloat((9.8 + (Math.random() - 0.5) * 0.2).toFixed(2));
    this.metrics.signalToNoise = parseFloat((48.0 + (Math.random() - 0.5) * 0.6).toFixed(1));
    this.metrics.dishAzimuth = parseFloat((142.5 + (Math.random() - 0.5) * 0.3).toFixed(1));

    this.metrics.roverTraverseSpeed = parseFloat((4.5 + Math.sin(Date.now() / 3000) * 1.2).toFixed(1));
    this.metrics.roverDistanceTraveled = parseFloat((18.4 + (this.metSeconds % 1000) * 0.002).toFixed(2));

    // Record history for sparkline charts
    for (const [key, val] of Object.entries(this.metrics)) {
      if (!this.history[key]) this.history[key] = [];
      this.history[key].push(typeof val === 'number' ? val : 0);
      if (this.history[key].length > 20) {
        this.history[key].shift();
      }
    }

    this.notify();
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getMetric(key) {
    return this.metrics[key];
  }

  getHistory(key) {
    return this.history[key] || [];
  }

  getFormattedMET() {
    const days = Math.floor(this.metSeconds / 86400);
    const hrs = Math.floor((this.metSeconds % 86400) / 3600);
    const mins = Math.floor((this.metSeconds % 3600) / 60);
    const secs = this.metSeconds % 60;
    return `T+${days}d ${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  getFormattedIST() {
    const now = new Date();
    // Indian Standard Time (UTC+5:30)
    const istOffset = 5.5 * 3600 * 1000;
    const istTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + istOffset);
    return istTime.toTimeString().split(' ')[0];
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    for (const cb of this.subscribers) {
      try {
        cb(this.metrics, this);
      } catch (err) {
        console.error("Telemetry notify error:", err);
      }
    }
  }
}

export const telemetry = new TelemetryEngine();

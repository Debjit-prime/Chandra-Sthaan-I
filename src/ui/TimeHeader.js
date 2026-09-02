/**
 * Time Header & Global Mission Stats Component
 * Manages live MET clock, IST clock, lunar phase indicators, and header status readouts.
 */

import { telemetry } from '../state/telemetry.js';
import { store } from '../state/store.js';

export class TimeHeader {
  constructor() {
    this.metEl = document.getElementById('met-clock');
    this.istEl = document.getElementById('ist-clock');
    this.phaseEl = document.getElementById('lunar-phase');
    this.powerEl = document.getElementById('header-power-val');
    this.o2El = document.getElementById('header-o2-val');
    this.isruFooterEl = document.getElementById('footer-isru-val');

    this.init();
  }

  init() {
    this.updateClocks();
    this.bindEvents();
  }

  updateClocks() {
    if (this.metEl) this.metEl.textContent = telemetry.getFormattedMET();
    if (this.istEl) this.istEl.textContent = telemetry.getFormattedIST();
  }

  updatePhase(solarAngle) {
    if (!this.phaseEl) return;
    const norm = (solarAngle % 360);
    let phaseText = "PEAK LIGHT (88%)";
    if (norm > 300 || norm < 60) {
      phaseText = "TERMINATOR SHADOW";
    } else if (norm >= 60 && norm <= 180) {
      phaseText = "SOLAR NOON (94%)";
    } else {
      phaseText = "OBLIQUE GRAZING";
    }
    this.phaseEl.textContent = `${phaseText} [${norm}°]`;
  }

  bindEvents() {
    telemetry.subscribe((metrics) => {
      this.updateClocks();
      if (this.powerEl) this.powerEl.textContent = `${metrics.powerTotal} MW`;
      if (this.o2El) this.o2El.textContent = `${metrics.eclssO2}%`;
      if (this.isruFooterEl) this.isruFooterEl.textContent = `${metrics.isruExtractionRate} L/hr H₂O`;
    });

    store.on('solarAngle', (angle) => {
      this.updatePhase(angle);
    });

    this.updatePhase(store.get('solarAngle') || 124);
  }
}

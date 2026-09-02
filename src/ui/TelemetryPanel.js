/**
 * Telemetry & Diagnostics Inspector (Right Panel)
 * Renders live sensor metrics, dynamic sparkline charts, specifications, and action buttons.
 * Includes defensive data lookups and null guards (DEF-04).
 */

import { SUBSYSTEMS, MISSION_INFO } from '../data/missionData.js';
import { store } from '../state/store.js';
import { telemetry } from '../state/telemetry.js';
import { audio } from '../core/AudioController.js';
import { notify } from './NotificationHUD.js';

export class TelemetryPanel {
  constructor(containerEl) {
    this.container = containerEl;
    this.currentSubsystem = 'overview';
    this.metricElements = {};

    this.init();
    this.bindEvents();
  }

  init() {
    this.render(store.get('activeSubsystem') || 'overview');
  }

  render(subsystemId) {
    if (!this.container) return;

    // DEF-04: Defensive fallback lookup
    this.currentSubsystem = subsystemId;
    const data = SUBSYSTEMS[subsystemId] || SUBSYSTEMS.overview || {
      id: "unknown",
      name: "Subsystem Telemetry",
      hindiName: "उपप्रणाली",
      category: "GENERAL",
      status: "NOMINAL",
      statusClass: "status-nominal",
      icon: "⬡",
      summary: "Telemetry data is currently syncing with the lunar communications relay.",
      specs: [],
      telemetryKeys: ["powerTotal", "eclssO2"],
      logs: []
    };

    this.metricElements = {};

    // Metric labels and units dictionary
    const metricMeta = {
      powerTotal: { label: "GRID POWER", unit: "MW" },
      solarEfficiency: { label: "SOLAR EFF", unit: "%" },
      batteryStateOfCharge: { label: "BATTERY SOC", unit: "%" },
      reactorTemp: { label: "CORE TEMP", unit: "K" },
      basePressure: { label: "CABIN PRESS", unit: "kPa" },
      internalTemp: { label: "CABIN TEMP", unit: "°C" },
      eclssO2: { label: "O₂ PURITY", unit: "%" },
      co2Level: { label: "CO₂ LEVEL", unit: "kPa" },
      crewHealthIndex: { label: "CREW HEALTH", unit: "%" },
      bioDomeHumidity: { label: "HUMIDITY", unit: "%" },
      waterReserves: { label: "H₂O RESERVES", unit: "L" },
      isruExtractionRate: { label: "ISRU RATE", unit: "L/hr" },
      cryoLOXPressure: { label: "CRYO PRESS", unit: "kPa" },
      drillBitTemp: { label: "DRILL TEMP", unit: "°C" },
      landerFuel: { label: "PROPELLANT", unit: "%" },
      landerO2: { label: "LOX LEVEL", unit: "%" },
      landerCoreTemp: { label: "AVIONICS TEMP", unit: "°C" },
      commsBandwidth: { label: "BANDWIDTH", unit: "Gbps" },
      commsLatency: { label: "RTT LATENCY", unit: "s" },
      signalToNoise: { label: "SNR RATIO", unit: "dB" },
      roverBattery: { label: "ROVER BATT", unit: "%" },
      roverTraverseSpeed: { label: "VELOCITY", unit: "km/h" },
      roverDistanceTraveled: { label: "DISTANCE", unit: "km" }
    };

    // Build Metric Cards HTML with null guards
    const metricCardsHtml = (data.telemetryKeys || ['powerTotal', 'eclssO2'])
      .map((key) => {
        const meta = metricMeta[key] || { label: key.toUpperCase(), unit: "" };
        return `
          <div class="metric-card" data-metric="${key}">
            <div class="metric-card-header">
              <span class="metric-name">${meta.label}</span>
              <span class="pulse-dot" style="width:5px;height:5px;"></span>
            </div>
            <div class="metric-value-wrap">
              <span class="metric-value" id="val-${key}">--</span>
              <span class="metric-unit">${meta.unit}</span>
            </div>
            <div class="metric-sparkline" id="spark-${key}">
              ${Array(12).fill('<div class="spark-bar" style="height:50%;"></div>').join('')}
            </div>
          </div>
        `;
      })
      .join('');

    // Build Specs Table HTML with null guards
    const specsHtml = (data.specs || [])
      .map(
        (s) => `
        <tr>
          <td class="spec-lbl">${s.label || ''}</td>
          <td class="spec-val">${s.value || '--'} ${s.unit || ''}</td>
        </tr>
      `
      )
      .join('');

    // Build Logs HTML with null guards
    const logsHtml = (data.logs || [])
      .map(
        (log) => `
        <div class="log-entry">
          <span class="log-time">[${log.time || 'T-00:00'}]</span>
          <span class="log-msg">${log.text || ''}</span>
        </div>
      `
      )
      .join('');

    this.container.innerHTML = `
      <div class="detail-header">
        <div class="detail-title-group">
          <span class="detail-category">${data.category || 'ISRO SUBSYSTEM'}</span>
          <h1 class="detail-title">${(data.name || 'SUBSYSTEM').toUpperCase()}</h1>
          <span class="detail-hindi">${data.hindiName || ''}</span>
        </div>
        <span class="nav-item-status ${data.statusClass || 'status-nominal'}">${data.status || 'NOMINAL'}</span>
      </div>

      <div class="detail-content">
        <p class="detail-summary">${data.summary || 'Operational telemetry active.'}</p>

        <div class="metrics-section">
          <div class="metrics-section-title">
            <span>⬡</span> LIVE TELEMETRY STREAM
          </div>
          <div class="metrics-grid">
            ${metricCardsHtml}
          </div>
        </div>

        <div class="subsystem-actions">
          <button class="action-btn" id="btn-inspect-focus">
            <span>◎</span> FOCUS CAMERA
          </button>
          <button class="action-btn saffron" id="btn-run-diag">
            <span>⚡</span> RUN DIAGNOSTIC
          </button>
        </div>

        <div class="specs-section">
          <div class="metrics-section-title">
            <span>⬡</span> TECHNICAL SPECIFICATIONS
          </div>
          <table class="specs-table">
            <tbody>
              ${specsHtml || '<tr><td colspan="2" style="color:var(--white-subtle);">No technical parameters found.</td></tr>'}
            </tbody>
          </table>
        </div>

        <div class="logs-section">
          <div class="metrics-section-title">
            <span>⬡</span> SUBSYSTEM LOG STREAM
          </div>
          <div class="log-stream">
            ${logsHtml || '<div class="log-entry"><span class="log-msg">Log stream active.</span></div>'}
          </div>
        </div>

      </div>
    `;

    // Cache metric element references
    (data.telemetryKeys || []).forEach((key) => {
      this.metricElements[key] = {
        valEl: this.container.querySelector(`#val-${key}`),
        sparkEl: this.container.querySelector(`#spark-${key}`),
      };
    });

    // Action button listeners
    const focusBtn = this.container.querySelector('#btn-inspect-focus');
    if (focusBtn) {
      focusBtn.addEventListener('click', () => {
        audio.playFlyToWhoosh();
        store.set('activeSubsystem', this.currentSubsystem);
      });
    }

    const diagBtn = this.container.querySelector('#btn-run-diag');
    if (diagBtn) {
      diagBtn.addEventListener('click', () => {
        audio.playUIBeep(1200, 0.15, 'square');
        notify(`Diagnostic sweep complete for ${data.name}: All systems 100% nominal.`);
      });
    }

    // Initial update with latest telemetry values
    this.updateTelemetryValues(telemetry.getMetrics());
  }

  updateTelemetryValues(metrics) {
    if (!metrics) return;
    for (const [key, refs] of Object.entries(this.metricElements)) {
      if (!refs || !refs.valEl) continue;
      const val = metrics[key];
      if (val !== undefined) {
        refs.valEl.textContent = typeof val === 'number' ? (val % 1 !== 0 ? val.toFixed(1) : val.toLocaleString()) : val;
      }

      // Update sparklines
      if (refs.sparkEl) {
        const history = telemetry.getHistory(key);
        if (history && history.length > 0) {
          const min = Math.min(...history);
          const max = Math.max(...history);
          const range = max - min || 1;
          const bars = refs.sparkEl.querySelectorAll('.spark-bar');
          
          history.slice(-bars.length).forEach((hVal, idx) => {
            if (bars[idx]) {
              const pct = Math.max(15, Math.min(100, ((hVal - min) / range) * 100));
              bars[idx].style.height = `${pct}%`;
            }
          });
        }
      }
    }
  }

  bindEvents() {
    store.on('activeSubsystem', (subId) => {
      this.render(subId);
    });

    telemetry.subscribe((metrics) => {
      this.updateTelemetryValues(metrics);
    });
  }
}

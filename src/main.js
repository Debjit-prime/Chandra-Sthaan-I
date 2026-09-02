/**
 * Main Application Bootstrap & Coordinator
 * ISRO Chandra Sthaan-I — Lunar Base 3D Digital Twin
 */

import { SceneManager } from './core/SceneManager.js';
import { audio } from './core/AudioController.js';
import { NavigationHUD } from './ui/NavigationHUD.js';
import { TelemetryPanel } from './ui/TelemetryPanel.js';
import { TimeHeader } from './ui/TimeHeader.js';
import { ControlBar } from './ui/ControlBar.js';
import { notify } from './ui/NotificationHUD.js';
import { telemetry } from './state/telemetry.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('🇮🇳 Initializing ISRO Chandra Sthaan-I Digital Twin...');

  const webglContainer = document.getElementById('webgl-container');
  const markerContainer = document.getElementById('marker-container');
  const navContainer = document.getElementById('subsystem-nav');
  const telemetryContainer = document.getElementById('telemetry-panel');

  // 1. Initialize 3D Engine & Scene
  const sceneManager = new SceneManager(webglContainer, markerContainer);

  // 2. Initialize UI Components
  const navHUD = new NavigationHUD(navContainer);
  const telemetryHUD = new TelemetryPanel(telemetryContainer);
  const timeHeader = new TimeHeader();
  const controlBar = new ControlBar();

  // 3. DEF-08: Isolate Touch & Pointer Events on HUD Panels to prevent OrbitControls hijacking
  document.querySelectorAll('.glass-panel, .floating-pin').forEach((panel) => {
    panel.addEventListener('pointerdown', (e) => e.stopPropagation());
    panel.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    panel.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true });
  });

  // 4. Start Telemetry Engine
  telemetry.start();

  // 5. Initialize Web Audio API on first user interaction
  const initAudio = () => {
    audio.init();
    window.removeEventListener('click', initAudio);
    window.removeEventListener('keydown', initAudio);
    window.removeEventListener('touchstart', initAudio);
  };
  window.addEventListener('click', initAudio, { once: true });
  window.addEventListener('keydown', initAudio, { once: true });
  window.addEventListener('touchstart', initAudio, { once: true });

  // 6. DEF-09: Re-sync clocks and metrics immediately on tab visibility restore
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      timeHeader.updateClocks();
      telemetry.tick();
    }
  });

  // 7. Welcome Toast Notifications
  setTimeout(() => {
    notify('Telemetry Link Established with ISTRAC Deep Space Network.');
  }, 1200);

  setTimeout(() => {
    notify('Chandra Sthaan-I Polar Base Status: NOMINAL (Phase 3).');
  }, 3500);
});

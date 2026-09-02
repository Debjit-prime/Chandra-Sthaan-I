/**
 * Bottom Aerospace Control Deck Component
 * Manages camera view modes, solar terminator slider, X-ray mode, 3D pins, audio toggles,
 * and Clean View (Hide/Show HUD).
 */

import { store } from '../state/store.js';
import { audio } from '../core/AudioController.js';
import { notify } from './NotificationHUD.js';

export class ControlBar {
  constructor() {
    this.btnOrbit = document.getElementById('btn-cam-orbit');
    this.btnTour = document.getElementById('btn-cam-tour');
    this.btnTopDown = document.getElementById('btn-cam-topdown');
    this.btnRover = document.getElementById('btn-cam-rover');
    this.btnReset = document.getElementById('btn-cam-reset');

    this.solarSlider = document.getElementById('solar-slider');
    this.solarValEl = document.getElementById('solar-angle-val');

    this.btnToggleHud = document.getElementById('btn-toggle-hud');
    this.floatingHudBtn = document.getElementById('floating-hud-toggle');
    this.hudOverlay = document.getElementById('hud-overlay');

    this.btnXray = document.getElementById('btn-xray');
    this.btnMarkers = document.getElementById('btn-markers');
    this.btnAudio = document.getElementById('btn-audio');
    this.audioIcon = document.getElementById('audio-icon');
    this.btnFullscreen = document.getElementById('btn-fullscreen');

    this.init();
    this.bindEvents();
  }

  init() {
    // 1. Camera Mode Buttons
    if (this.btnOrbit) {
      this.btnOrbit.addEventListener('click', () => {
        audio.playUIBeep();
        store.set('cameraMode', 'orbit');
      });
    }

    if (this.btnTour) {
      this.btnTour.addEventListener('click', () => {
        audio.playUIBeep();
        store.set('cameraMode', 'tour');
        notify('Cinematic Aerial FPV Drone Tour Engaged.');
      });
    }

    if (this.btnTopDown) {
      this.btnTopDown.addEventListener('click', () => {
        audio.playUIBeep();
        store.set('cameraMode', 'topdown');
        notify('Tactical Top-Down Nadir Drone Survey Activated.');
      });
    }

    if (this.btnRover) {
      this.btnRover.addEventListener('click', () => {
        audio.playUIBeep();
        store.set('cameraMode', 'rover');
        store.set('activeSubsystem', 'rovers');
        notify('Pragyan-II Rover POV Chase Cam Activated.');
      });
    }

    if (this.btnReset) {
      this.btnReset.addEventListener('click', () => {
        audio.playUIBeep();
        store.set('cameraMode', 'orbit');
        store.set('activeSubsystem', 'overview');
      });
    }

    // 2. Solar Terminator Slider
    if (this.solarSlider) {
      this.solarSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        store.set('solarAngle', val);
        if (this.solarValEl) {
          this.solarValEl.textContent = `${val}° (AZIMUTH)`;
        }
      });
    }

    // 3. Clean View / Hide All UI Elements
    if (this.btnToggleHud) {
      this.btnToggleHud.addEventListener('click', () => {
        this.toggleHUD();
      });
    }

    if (this.floatingHudBtn) {
      this.floatingHudBtn.addEventListener('click', () => {
        this.toggleHUD();
      });
    }

    // Global 'H' Keyboard Shortcut for Clean View
    window.addEventListener('keydown', (e) => {
      // Ignore if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'h' || e.key === 'H') {
        this.toggleHUD();
      } else if (e.key === 'Escape' && !store.get('hudVisible')) {
        this.toggleHUD();
      }
    });

    // 4. X-Ray Diagnostics Mode
    if (this.btnXray) {
      this.btnXray.addEventListener('click', () => {
        audio.playUIBeep(980, 0.1, 'square');
        const next = !store.get('xrayMode');
        store.set('xrayMode', next);
        this.btnXray.classList.toggle('active', next);
        notify(next ? 'Subsystem Infrastructure X-Ray Grid Visible.' : 'X-Ray Grid Deactivated.');
      });
    }

    // 5. 3D Floating Pins Toggle
    if (this.btnMarkers) {
      this.btnMarkers.addEventListener('click', () => {
        audio.playUIBeep();
        const next = !store.get('markersVisible');
        store.set('markersVisible', next);
        this.btnMarkers.classList.toggle('active', next);
      });
    }

    // 6. Audio Synthesizer Toggle
    if (this.btnAudio) {
      this.btnAudio.addEventListener('click', () => {
        const next = !store.get('audioEnabled');
        store.set('audioEnabled', next);
        if (next) {
          audio.resume();
          if (this.audioIcon) this.audioIcon.textContent = '🔊';
          this.btnAudio.innerHTML = `<span class="btn-icon">🔊</span> SFX: ON`;
          this.btnAudio.classList.remove('active');
        } else {
          if (this.audioIcon) this.audioIcon.textContent = '🔇';
          this.btnAudio.innerHTML = `<span class="btn-icon">🔇</span> SFX: OFF`;
          this.btnAudio.classList.add('active');
        }
      });
    }

    // 7. Fullscreen Toggle
    if (this.btnFullscreen) {
      this.btnFullscreen.addEventListener('click', () => {
        audio.playUIBeep();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }
  }

  toggleHUD() {
    audio.playUIBeep(880, 0.08, 'sine');
    const next = !store.get('hudVisible');
    store.set('hudVisible', next);
    
    if (next) {
      notify('HUD Interface Restored.');
    } else {
      notify("Clean View Active — Press 'H' to Restore HUD.");
    }
  }

  updateHUDVisibility(visible) {
    if (this.hudOverlay) {
      if (visible) {
        this.hudOverlay.classList.remove('hidden');
      } else {
        this.hudOverlay.classList.add('hidden');
      }
    }

    if (this.floatingHudBtn) {
      if (visible) {
        this.floatingHudBtn.classList.add('hidden');
      } else {
        this.floatingHudBtn.classList.remove('hidden');
      }
    }
  }

  updateCameraButtons(activeMode) {
    [this.btnOrbit, this.btnTour, this.btnTopDown, this.btnRover].forEach((btn) => {
      if (btn) btn.classList.remove('active');
    });

    if (activeMode === 'orbit' && this.btnOrbit) this.btnOrbit.classList.add('active');
    else if (activeMode === 'tour' && this.btnTour) this.btnTour.classList.add('active');
    else if (activeMode === 'topdown' && this.btnTopDown) this.btnTopDown.classList.add('active');
    else if (activeMode === 'rover' && this.btnRover) this.btnRover.classList.add('active');
  }

  bindEvents() {
    store.on('cameraMode', (mode) => {
      this.updateCameraButtons(mode);
    });

    store.on('hudVisible', (visible) => {
      this.updateHUDVisibility(visible);
    });
  }
}

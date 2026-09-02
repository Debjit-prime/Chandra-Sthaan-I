/**
 * Subsystem Navigation HUD (Left Panel) & Mobile Operations Drawer
 * Renders interactive subsystem items, status badges, and manages mobile slide-up drawer tabs.
 */

import { SUBSYSTEMS } from '../data/missionData.js';
import { store } from '../state/store.js';
import { audio } from '../core/AudioController.js';

export class NavigationHUD {
  constructor(containerEl) {
    this.container = containerEl;
    this.drawer = document.getElementById('hud-body-drawer');
    this.btnMobileToggle = document.getElementById('btn-mobile-drawer');
    this.btnMobileClose = document.getElementById('btn-drawer-close');
    this.tabNavBtn = document.getElementById('tab-btn-nav');
    this.tabTelemetryBtn = document.getElementById('tab-btn-telemetry');
    this.leftNavPanel = document.getElementById('left-nav-panel');
    this.telemetryPanel = document.getElementById('telemetry-panel');

    this.init();
    this.initMobileDrawer();
    this.bindEvents();
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = '';

    for (const [id, data] of Object.entries(SUBSYSTEMS)) {
      const item = document.createElement('div');
      item.className = `nav-item ${id === store.get('activeSubsystem') ? 'active' : ''}`;
      item.dataset.id = id;

      item.innerHTML = `
        <div class="nav-item-left">
          <span class="nav-item-icon">${data.icon}</span>
          <div class="nav-item-meta">
            <span class="nav-item-title">${data.name.toUpperCase()}</span>
            <span class="nav-item-sub">${data.hindiName}</span>
          </div>
        </div>
        <span class="nav-item-status ${data.statusClass}">${data.status}</span>
      `;

      item.addEventListener('click', () => {
        audio.playSubsystemSelect();
        if (store.get('cameraMode') !== 'orbit') {
          store.set('cameraMode', 'orbit');
        }
        store.set('activeSubsystem', id);

        // On mobile screens, auto-collapse the drawer after selection so the 3D scene is visible
        if (window.innerWidth <= 768 && this.drawer) {
          this.closeMobileDrawer();
        }
      });

      this.container.appendChild(item);
    }
  }

  initMobileDrawer() {
    if (this.btnMobileToggle) {
      this.btnMobileToggle.addEventListener('click', () => {
        audio.playUIBeep(780, 0.06, 'sine');
        this.toggleMobileDrawer();
      });
    }

    if (this.btnMobileClose) {
      this.btnMobileClose.addEventListener('click', () => {
        audio.playUIBeep(520, 0.05, 'sine');
        this.closeMobileDrawer();
      });
    }

    if (this.tabNavBtn) {
      this.tabNavBtn.addEventListener('click', () => {
        audio.playUIBeep(880, 0.04, 'sine');
        this.switchMobileTab('nav');
      });
    }

    if (this.tabTelemetryBtn) {
      this.tabTelemetryBtn.addEventListener('click', () => {
        audio.playUIBeep(880, 0.04, 'sine');
        this.switchMobileTab('telemetry');
      });
    }
  }

  toggleMobileDrawer() {
    if (!this.drawer) return;
    const isOpen = this.drawer.classList.contains('drawer-open');
    if (isOpen) {
      this.closeMobileDrawer();
    } else {
      this.openMobileDrawer();
    }
  }

  openMobileDrawer() {
    if (!this.drawer) return;
    this.drawer.classList.add('drawer-open');
    this.switchMobileTab('nav'); // Default to subsystems tab
  }

  closeMobileDrawer() {
    if (!this.drawer) return;
    this.drawer.classList.remove('drawer-open');
  }

  switchMobileTab(tab) {
    if (!this.leftNavPanel || !this.telemetryPanel) return;

    if (tab === 'nav') {
      this.tabNavBtn?.classList.add('active');
      this.tabTelemetryBtn?.classList.remove('active');
      this.leftNavPanel.classList.remove('mobile-tab-hidden');
      this.telemetryPanel.classList.add('mobile-tab-hidden');
    } else {
      this.tabTelemetryBtn?.classList.add('active');
      this.tabNavBtn?.classList.remove('active');
      this.telemetryPanel.classList.remove('mobile-tab-hidden');
      this.leftNavPanel.classList.add('mobile-tab-hidden');
    }
  }

  updateActive(activeId) {
    const items = this.container.querySelectorAll('.nav-item');
    items.forEach((item) => {
      if (item.dataset.id === activeId) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  bindEvents() {
    store.on('activeSubsystem', (activeId) => {
      this.updateActive(activeId);
    });
  }
}

/**
 * Subsystem Navigation HUD (Left Panel)
 * Renders interactive subsystem items, status badges, and category tabs.
 */

import { SUBSYSTEMS } from '../data/missionData.js';
import { store } from '../state/store.js';
import { audio } from '../core/AudioController.js';

export class NavigationHUD {
  constructor(containerEl) {
    this.container = containerEl;
    this.init();
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
      });

      this.container.appendChild(item);
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

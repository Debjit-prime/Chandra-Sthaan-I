/**
 * 3D Holographic Marker Overlay Factory
 * Projects interactive 3D world coordinate pins to 2D DOM elements with click-to-focus triggers.
 */

import * as THREE from 'three';
import { store } from '../state/store.js';
import { SUBSYSTEMS } from '../data/missionData.js';
import { audio } from '../core/AudioController.js';

export class MarkerFactory {
  constructor(camera, container) {
    this.camera = camera;
    this.container = container;
    this.markers = [];
    this.visible = true;

    this.init();
    this.bindEvents();
  }

  init() {
    if (!this.container) return;
    this.container.innerHTML = '';

    for (const [id, data] of Object.entries(SUBSYSTEMS)) {
      if (!data.pinPosition) continue;

      const el = document.createElement('div');
      el.className = 'floating-pin';
      el.dataset.id = id;

      el.innerHTML = `
        <div class="pin-badge">
          <span class="pin-icon">${data.icon}</span>
          <span class="pin-name">${data.name.toUpperCase()}</span>
        </div>
        <div class="pin-needle"></div>
        <div class="pin-ring"></div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.playSubsystemSelect();
        if (store.get('cameraMode') !== 'orbit') {
          store.set('cameraMode', 'orbit');
        }
        store.set('activeSubsystem', id);
      });

      this.container.appendChild(el);

      this.markers.push({
        id,
        el,
        worldPos: new THREE.Vector3(...data.pinPosition),
        projPos: new THREE.Vector3()
      });
    }
  }

  update(delta, time) {
    if (!this.visible || !this.container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    for (const marker of this.markers) {
      marker.projPos.copy(marker.worldPos);
      marker.projPos.project(this.camera);

      // Check if marker is behind the camera or out of bounds
      const isBehind = marker.projPos.z > 1.0;
      if (isBehind) {
        marker.el.style.opacity = '0';
        marker.el.style.pointerEvents = 'none';
        continue;
      }

      const x = (marker.projPos.x * halfWidth) + halfWidth;
      const y = -(marker.projPos.y * halfHeight) + halfHeight;

      // Distance scaling and visibility
      const dist = this.camera.position.distanceTo(marker.worldPos);
      const scale = THREE.MathUtils.clamp(1.0 - (dist - 40) / 320, 0.75, 1.05);
      const opacity = THREE.MathUtils.clamp(1.0 - (dist - 240) / 180, 0.85, 1.0);

      marker.el.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px) scale(${scale})`;
      marker.el.style.opacity = `${opacity}`;
      marker.el.style.pointerEvents = 'auto';
    }
  }

  bindEvents() {
    store.on('markersVisible', (val) => {
      this.visible = val;
      if (this.container) {
        this.container.style.display = val ? 'block' : 'none';
      }
    });
  }
}

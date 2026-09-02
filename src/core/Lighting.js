/**
 * Harsh Lunar Lighting & Earthshine Environment Setup
 * Shackleton Crater South Pole polar sunlight characteristics
 * Includes shadow acne elimination (bias & normalBias) and adaptive shadow maps (DEF-05, DEF-06)
 */

import * as THREE from 'three';
import { store } from '../state/store.js';

export class LightingManager {
  constructor(scene) {
    this.scene = scene;
    this.sunLight = null;
    this.earthshineLight = null;
    this.ambientLight = null;
    this.beaconLights = [];
    this.xrayHelpers = [];

    this.init();
    this.bindEvents();
  }

  init() {
    const isMobile = window.innerWidth < 768;
    const shadowSize = isMobile ? 1024 : 2048; // DEF-05: Capped shadow map size

    // 1. Harsh Direct Polar Sunlight (Low incidence angle typical of South Pole)
    this.sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = shadowSize;
    this.sunLight.shadow.mapSize.height = shadowSize;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 400;
    
    // DEF-06: Precise shadow frustum bounds & bias tuning to eliminate shadow acne & peter-panning
    const d = 140;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.02;

    this.scene.add(this.sunLight);

    // 2. Earthshine Light (Soft blue-white secondary bounce)
    this.earthshineLight = new THREE.DirectionalLight(0x88bbee, 0.35);
    this.earthshineLight.position.set(60, 100, 80);
    this.scene.add(this.earthshineLight);

    // 3. Faint Deep Space Ambient Light (Very low ambient in vacuum)
    this.ambientLight = new THREE.AmbientLight(0x111622, 0.25);
    this.scene.add(this.ambientLight);

    // 4. Update initial sun position from store
    this.updateSunPosition(store.get('solarAngle') || 124);
  }

  updateSunPosition(angleDegrees) {
    const rad = (angleDegrees * Math.PI) / 180;
    const distance = 220;
    // Low polar elevation angle (7° to 14° above horizontal rim)
    const elevation = 0.18 + Math.sin(rad * 2) * 0.05; 
    
    const x = Math.cos(rad) * distance;
    const z = Math.sin(rad) * distance;
    const y = elevation * distance;

    this.sunLight.position.set(x, y, z);
    this.sunLight.target.position.set(0, 0, 0);
    this.sunLight.target.updateMatrixWorld();
  }

  addBeacon(position, color = 0x00e5ff, intensity = 1.5, distance = 25) {
    const light = new THREE.PointLight(color, intensity, distance);
    light.position.copy(position);
    this.scene.add(light);
    this.beaconLights.push({ light, baseIntensity: intensity, phase: Math.random() * Math.PI * 2 });
    return light;
  }

  update(delta, time) {
    // Frame-rate independent pulsing of hazard beacons (DEF-03)
    for (const b of this.beaconLights) {
      b.light.intensity = b.baseIntensity * (0.8 + 0.3 * Math.sin(time * 3 + b.phase));
    }
  }

  bindEvents() {
    store.on('solarAngle', (angle) => {
      this.updateSunPosition(angle);
    });
  }
}

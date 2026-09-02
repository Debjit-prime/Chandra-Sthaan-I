/**
 * Harsh Lunar Lighting & Earthshine Environment Setup
 * Shackleton Crater South Pole polar sunlight characteristics
 * Optimized for high-definition visibility across all sun angles and shadow orientations.
 */

import * as THREE from 'three';
import { store } from '../state/store.js';

export class LightingManager {
  constructor(scene) {
    this.scene = scene;
    this.sunLight = null;
    this.earthshineLight = null;
    this.ambientLight = null;
    this.hemiLight = null;
    this.beaconLights = [];

    this.init();
    this.bindEvents();
  }

  init() {
    const isMobile = window.innerWidth < 768;
    const shadowSize = isMobile ? 1024 : 2048;

    // 1. Direct Polar Sunlight (High dynamic range)
    this.sunLight = new THREE.DirectionalLight(0xfffaea, 2.6);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = shadowSize;
    this.sunLight.shadow.mapSize.height = shadowSize;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 450;
    
    const d = 160;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0004;
    this.sunLight.shadow.normalBias = 0.025;

    this.scene.add(this.sunLight);

    // 2. Earthshine Secondary Directional Light (Soft blue fill from Earth)
    this.earthshineLight = new THREE.DirectionalLight(0x88ccee, 0.85);
    this.earthshineLight.position.set(70, 110, 85);
    this.scene.add(this.earthshineLight);

    // 3. Planetary Ambient Hemisphere Light (Sky & Regolith bounce)
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x223348, 0.75);
    this.scene.add(this.hemiLight);

    // 4. Space Ambient Light (Ensures shaded sides remain crisp and detailed)
    this.ambientLight = new THREE.AmbientLight(0x384860, 0.8);
    this.scene.add(this.ambientLight);

    // 5. Update initial sun position
    this.updateSunPosition(store.get('solarAngle') || 124);
  }

  updateSunPosition(angleDegrees) {
    const rad = (angleDegrees * Math.PI) / 180;
    const distance = 220;
    // Polar sun angle (10° to 18° above rim)
    const elevation = 0.22 + Math.sin(rad * 2) * 0.06; 
    
    const x = Math.cos(rad) * distance;
    const z = Math.sin(rad) * distance;
    const y = elevation * distance;

    this.sunLight.position.set(x, y, z);
    this.sunLight.target.position.set(0, 0, 0);
    this.sunLight.target.updateMatrixWorld();
  }

  addBeacon(position, color = 0x00e5ff, intensity = 2.0, distance = 30) {
    const light = new THREE.PointLight(color, intensity, distance);
    light.position.copy(position);
    this.scene.add(light);
    this.beaconLights.push({ light, baseIntensity: intensity, phase: Math.random() * Math.PI * 2 });
    return light;
  }

  update(delta, time) {
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

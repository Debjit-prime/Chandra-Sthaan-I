/**
 * Celestial Environment Factory
 * Features photorealistic Earth with atmosphere and multi-temperature twinkling starfield.
 */

import * as THREE from 'three';

export class CelestialFactory {
  constructor(scene) {
    this.scene = scene;
    this.earthGroup = new THREE.Group();
    this.cloudMesh = null;
    this.stars = null;
    this.starColors = null;
    this.starBaseColors = null;

    this.init();
  }

  init() {
    this.createEarth();
    this.createStarfield();
  }

  createEarth() {
    this.earthGroup.position.set(70, 110, 90);
    this.earthGroup.rotation.z = 23.5 * (Math.PI / 180); // Earth axial tilt

    const earthRadius = 14;

    // 1. Earth Globe with procedural oceanic & continent canvas texture
    const earthTexture = this.generateEarthTexture();
    const earthGeom = new THREE.SphereGeometry(earthRadius, 48, 32);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.7,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    this.earthGroup.add(earthMesh);

    // 2. Swirling Cloud Atmosphere Layer
    const cloudTexture = this.generateCloudTexture();
    const cloudGeom = new THREE.SphereGeometry(earthRadius + 0.3, 48, 32);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    this.cloudMesh = new THREE.Mesh(cloudGeom, cloudMat);
    this.earthGroup.add(this.cloudMesh);

    // 3. Blue Atmospheric Glow Halo
    const haloGeom = new THREE.SphereGeometry(earthRadius + 0.8, 32, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x4da6ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide
    });
    const haloMesh = new THREE.Mesh(haloGeom, haloMat);
    this.earthGroup.add(haloMesh);

    this.scene.add(this.earthGroup);
  }

  generateEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Deep Ocean Blue Base
    ctx.fillStyle = '#0a2342';
    ctx.fillRect(0, 0, 1024, 512);

    // Continents & Landmasses (stylized representation of Afro-Eurasia & Indian Subcontinent)
    ctx.fillStyle = '#2d5a27'; // Forest green
    
    // Indian Subcontinent & Asia
    ctx.beginPath();
    ctx.moveTo(680, 240);
    ctx.lineTo(720, 290);
    ctx.lineTo(705, 340); // Indian Peninsula tip
    ctx.lineTo(660, 280);
    ctx.closePath();
    ctx.fill();

    // Broader Asia / Himalayas
    ctx.fillRect(600, 180, 240, 100);
    // Africa
    ctx.fillRect(480, 220, 120, 180);
    // Europe
    ctx.fillRect(490, 150, 110, 60);
    // Australia
    ctx.fillRect(800, 340, 90, 70);
    // Americas
    ctx.fillRect(200, 160, 140, 120);
    ctx.fillRect(260, 280, 90, 160);

    // Polar Ice Caps
    ctx.fillStyle = '#e8f4f8';
    ctx.fillRect(0, 0, 1024, 40);
    ctx.fillRect(0, 472, 1024, 40);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  generateCloudTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 1024, 512);

    // Swirling white cloud bands
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let i = 0; i < 40; i++) {
      const cx = Math.random() * 1024;
      const cy = 80 + Math.random() * 350;
      const rx = 40 + Math.random() * 120;
      const ry = 15 + Math.random() * 35;

      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, Math.random() * 0.4 - 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  createStarfield() {
    const count = 3500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    this.starBaseColors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Celestial sphere distribution
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 380;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Star Spectral Classification Colors
      const type = Math.random();
      let starR = 1.0, starG = 1.0, starB = 1.0;

      if (type < 0.2) {
        // O/B Blue Giants
        starR = 0.7; starG = 0.85; starB = 1.0;
      } else if (type < 0.6) {
        // A/F White Stars
        starR = 0.95; starG = 0.98; starB = 1.0;
      } else if (type < 0.85) {
        // G/K Yellow-Orange (Sun-like)
        starR = 1.0; starG = 0.9; starB = 0.65;
      } else {
        // M Red Dwarfs
        starR = 1.0; starG = 0.55; starB = 0.45;
      }

      colors[i * 3] = starR;
      colors[i * 3 + 1] = starG;
      colors[i * 3 + 2] = starB;

      this.starBaseColors[i * 3] = starR;
      this.starBaseColors[i * 3 + 1] = starG;
      this.starBaseColors[i * 3 + 2] = starB;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.starColors = geometry.attributes.color;

    const material = new THREE.PointsMaterial({
      size: 1.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
    });

    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }

  update(delta, time) {
    // Earth slow axial rotation
    if (this.earthGroup) {
      this.earthGroup.rotation.y += delta * 0.02;
    }

    // Cloud layer differential rotation
    if (this.cloudMesh) {
      this.cloudMesh.rotation.y += delta * 0.035;
    }

    // Scintillating starfield twinkle
    if (this.starColors) {
      const arr = this.starColors.array;
      for (let i = 0; i < 400; i++) {
        const idx = Math.floor(Math.random() * (arr.length / 3)) * 3;
        const factor = 0.6 + Math.random() * 0.7;
        arr[idx] = this.starBaseColors[idx] * factor;
        arr[idx + 1] = this.starBaseColors[idx + 1] * factor;
        arr[idx + 2] = this.starBaseColors[idx + 2] * factor;
      }
      this.starColors.needsUpdate = true;
    }
  }
}

/**
 * Solar Rim Tower & Stirling Nuclear Power Subsystem Factory
 * Features sun-tracking vertical photovoltaic towers and nuclear Stirling reactor with thermal radiators.
 */

import * as THREE from 'three';
import { store } from '../state/store.js';

export class PowerFactory {
  constructor(scene) {
    this.scene = scene;
    this.powerGroup = new THREE.Group();
    this.solarTowers = [];
    this.radiatorPanels = [];

    this.init();
  }

  init() {
    this.powerGroup.position.set(-45, 0, -35);

    // 1. Four High-Mast Solar Towers along the ridge
    const towerOffsets = [
      [0, 0],
      [14, -8],
      [-12, 10],
      [8, 16]
    ];

    towerOffsets.forEach(([tx, tz], i) => {
      this.createSolarTower(tx, tz, 24 + i * 2);
    });

    // 2. Compact Kilopower Stirling Nuclear Reactor Core
    this.createStirlingReactor(-6, -16);

    // 3. Superconducting Battery Storage Bank
    this.createBatteryBank(12, 4);

    this.scene.add(this.powerGroup);
  }

  createSolarTower(x, z, height) {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(x, 0, z);

    // Mast Base & Sintered Foundation
    const baseGeom = new THREE.CylinderGeometry(2.2, 3.0, 2.0, 8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x3a3f4d, metalness: 0.8, roughness: 0.4 });
    const baseMesh = new THREE.Mesh(baseGeom, baseMat);
    baseMesh.position.y = 1.0;
    towerGroup.add(baseMesh);

    // Lattice / Tubular Mast
    const mastGeom = new THREE.CylinderGeometry(0.5, 0.7, height, 12);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x8892a0, metalness: 0.9, roughness: 0.2 });
    const mastMesh = new THREE.Mesh(mastGeom, mastMat);
    mastMesh.position.y = height / 2 + 1;
    mastMesh.castShadow = true;
    towerGroup.add(mastMesh);

    // Rotating Sun-Tracking Solar Panel Array
    const panelHead = new THREE.Group();
    panelHead.position.set(0, height + 1, 0);

    const panelGeom = new THREE.BoxGeometry(14, 8, 0.2);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x0a1c3d, // Deep space photovoltaic blue
      metalness: 0.85,
      roughness: 0.15,
      emissive: 0x001133,
      emissiveIntensity: 0.4
    });

    const panelMesh = new THREE.Mesh(panelGeom, panelMat);
    panelMesh.castShadow = true;
    panelHead.add(panelMesh);

    // Panel Gold Trim / Bus Bar
    const trimGeom = new THREE.BoxGeometry(14.2, 0.3, 0.25);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xffb300, metalness: 0.9, roughness: 0.3 });
    const trim1 = new THREE.Mesh(trimGeom, trimMat);
    trim1.position.y = 4.1;
    const trim2 = new THREE.Mesh(trimGeom, trimMat);
    trim2.position.y = -4.1;
    panelHead.add(trim1);
    panelHead.add(trim2);

    // Top Beacon Light
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff9933 })
    );
    beacon.position.y = 5.2;
    panelHead.add(beacon);

    towerGroup.add(panelHead);
    this.powerGroup.add(towerGroup);

    this.solarTowers.push(panelHead);
  }

  createStirlingReactor(x, z) {
    const reactorGroup = new THREE.Group();
    reactorGroup.position.set(x, 0, z);

    // Central Heavy Radiation Containment Vessel
    const vesselGeom = new THREE.CylinderGeometry(3.5, 4.0, 7, 16);
    const vesselMat = new THREE.MeshStandardMaterial({
      color: 0x2b2e38,
      metalness: 0.85,
      roughness: 0.35
    });
    const vesselMesh = new THREE.Mesh(vesselGeom, vesselMat);
    vesselMesh.position.y = 3.5;
    vesselMesh.castShadow = true;
    reactorGroup.add(vesselMesh);

    // Radial Thermal Radiator Fins (Glowing dark orange/cherry red heat dissipation)
    const finCount = 6;
    for (let i = 0; i < finCount; i++) {
      const angle = (i / finCount) * Math.PI * 2;
      const finGeom = new THREE.BoxGeometry(0.15, 6.5, 5.0);
      const finMat = new THREE.MeshStandardMaterial({
        color: 0x5a180a,
        emissive: 0xff3d00,
        emissiveIntensity: 0.45,
        roughness: 0.6,
        metalness: 0.4
      });
      const finMesh = new THREE.Mesh(finGeom, finMat);
      finMesh.position.set(Math.cos(angle) * 4.5, 4.2, Math.sin(angle) * 4.5);
      finMesh.rotation.y = angle;
      reactorGroup.add(finMesh);
      this.radiatorPanels.push(finMesh);
    }

    // Stirling Power Conversion Unit Dome
    const topCap = new THREE.Mesh(
      new THREE.SphereGeometry(2.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x1f232b, metalness: 0.9 })
    );
    topCap.position.y = 7.0;
    reactorGroup.add(topCap);

    // Thermal Core Point Light
    const thermalLight = new THREE.PointLight(0xff4500, 1.2, 18);
    thermalLight.position.set(0, 4.5, 0);
    reactorGroup.add(thermalLight);

    this.powerGroup.add(reactorGroup);
  }

  createBatteryBank(x, z) {
    const bankGroup = new THREE.Group();
    bankGroup.position.set(x, 0, z);

    // Modular Containerized Battery Racks
    for (let i = 0; i < 3; i++) {
      const rackGeom = new THREE.BoxGeometry(3.5, 2.8, 6.0);
      const rackMat = new THREE.MeshStandardMaterial({
        color: 0x374151,
        metalness: 0.7,
        roughness: 0.4
      });
      const rack = new THREE.Mesh(rackGeom, rackMat);
      rack.position.set(i * 4.5, 1.4, 0);
      rack.castShadow = true;

      // Status LED Bar
      const ledBar = new THREE.Mesh(
        new THREE.PlaneGeometry(0.2, 5.0),
        new THREE.MeshBasicMaterial({ color: 0x00e676, side: THREE.DoubleSide })
      );
      ledBar.rotateY(Math.PI / 2);
      ledBar.position.set(i * 4.5 + 1.76, 1.4, 0);
      bankGroup.add(ledBar);

      bankGroup.add(rack);
    }

    this.powerGroup.add(bankGroup);
  }

  update(delta, time) {
    // Rotate solar towers to align perpendicularly to the sun
    const sunAngle = (store.get('solarAngle') || 124) * (Math.PI / 180);
    for (const head of this.solarTowers) {
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, sunAngle + Math.PI / 2, 0.05);
    }

    // Thermal radiator breathing heat pulse
    for (const fin of this.radiatorPanels) {
      fin.material.emissiveIntensity = 0.45 + Math.sin(time * 1.5) * 0.1;
    }
  }
}

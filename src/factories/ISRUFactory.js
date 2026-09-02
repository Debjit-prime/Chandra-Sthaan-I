/**
 * ISRU Water Ice Extraction & Propellant Liquefaction Plant Factory
 * Features thermal core drill derrick, microwave sublimators, cryogenic storage spheroids,
 * and illuminated propellant pipeline network.
 */

import * as THREE from 'three';

export class ISRUFactory {
  constructor(scene) {
    this.scene = scene;
    this.isruGroup = new THREE.Group();
    this.drillHead = null;
    this.frostVents = [];

    this.init();
  }

  init() {
    this.isruGroup.position.set(25, 0, -25);

    // 1. Heavy Rotary Sublimation Drill Derrick
    this.createDrillDerrick(-8, 0);

    // 2. Microwave Volatilization Extraction Chamber
    this.createExtractionChamber(0, 0);

    // 3. Two Vacuum-Jacketed Cryogenic Propellant Spheres (LOX & LH2)
    this.createCryoSpheroid(8, -6, 4.5, "LOX LIQUID OXYGEN");
    this.createCryoSpheroid(14, 4, 3.8, "LH2 LIQUID HYDROGEN");

    // 4. Heavy Cryo Pipelines
    this.createPipelines();

    this.scene.add(this.isruGroup);
  }

  createDrillDerrick(x, z) {
    const derrickGroup = new THREE.Group();
    derrickGroup.position.set(x, 0, z);

    // Derrick Truss Legs
    const trussMat = new THREE.MeshStandardMaterial({ color: 0xff9933, metalness: 0.8, roughness: 0.3 });
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 14, 8), trussMat);
    leg1.position.set(-2, 7, -2);
    leg1.rotation.z = -0.15;
    leg1.rotation.x = 0.15;

    const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 14, 8), trussMat);
    leg2.position.set(2, 7, -2);
    leg2.rotation.z = 0.15;
    leg2.rotation.x = 0.15;

    const leg3 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 14, 8), trussMat);
    leg3.position.set(0, 7, 2.5);
    leg3.rotation.x = -0.2;

    derrickGroup.add(leg1);
    derrickGroup.add(leg2);
    derrickGroup.add(leg3);

    // Drill Mast & Rotating Augur
    const mastGeom = new THREE.CylinderGeometry(0.4, 0.4, 15, 12);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9, roughness: 0.2 });
    const mast = new THREE.Mesh(mastGeom, mastMat);
    mast.position.y = 7.5;
    derrickGroup.add(mast);

    const drillBitGeom = new THREE.CylinderGeometry(0.6, 0.1, 3.5, 12);
    const drillBitMat = new THREE.MeshStandardMaterial({ color: 0x00e5ff, metalness: 0.9, roughness: 0.2 });
    this.drillHead = new THREE.Mesh(drillBitGeom, drillBitMat);
    this.drillHead.position.y = 1.8;
    derrickGroup.add(this.drillHead);

    // Worklight
    const light = new THREE.SpotLight(0xffffff, 2.5, 20, Math.PI / 4, 0.3);
    light.position.set(0, 12, 0);
    light.target.position.set(0, 0, 0);
    derrickGroup.add(light);
    derrickGroup.add(light.target);

    this.isruGroup.add(derrickGroup);
  }

  createExtractionChamber(x, z) {
    const chamberGroup = new THREE.Group();
    chamberGroup.position.set(x, 0, z);

    // Heavy Industrial Processing Block
    const blockGeom = new THREE.BoxGeometry(7, 4.5, 9);
    const blockMat = new THREE.MeshStandardMaterial({ color: 0x2e3440, metalness: 0.75, roughness: 0.35 });
    const block = new THREE.Mesh(blockGeom, blockMat);
    block.position.y = 2.25;
    block.castShadow = true;
    chamberGroup.add(block);

    // Microwave Emitter Domes on Top
    for (let i = 0; i < 3; i++) {
      const emitter = new THREE.Mesh(
        new THREE.SphereGeometry(1.0, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x5e81ac, metalness: 0.9 })
      );
      emitter.position.set(-2 + i * 2, 4.5, 0);
      chamberGroup.add(emitter);
    }

    // High Purity Water Filter Manifold
    const filterCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 4.0, 16),
      new THREE.MeshStandardMaterial({ color: 0x00e5ff, metalness: 0.8, roughness: 0.2 })
    );
    filterCyl.rotation.z = Math.PI / 2;
    filterCyl.position.set(0, 3.2, 4.6);
    chamberGroup.add(filterCyl);

    this.isruGroup.add(chamberGroup);
  }

  createCryoSpheroid(x, z, radius, label) {
    const cryoGroup = new THREE.Group();
    cryoGroup.position.set(x, 0, z);

    // Tripod Support Legs
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, radius + 1, 8),
        new THREE.MeshStandardMaterial({ color: 0x4c566a, metalness: 0.8 })
      );
      leg.position.set(Math.cos(angle) * (radius * 0.7), (radius + 1) / 2, Math.sin(angle) * (radius * 0.7));
      leg.rotation.z = Math.cos(angle) * 0.2;
      leg.rotation.x = Math.sin(angle) * 0.2;
      cryoGroup.add(leg);
    }

    // High-Gloss White Thermal Insulation Sphere
    const sphereGeom = new THREE.SphereGeometry(radius, 32, 24);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xf8f9fa,
      metalness: 0.4,
      roughness: 0.2,
      clearcoat: 0.8,
    });
    const sphere = new THREE.Mesh(sphereGeom, sphereMat);
    sphere.position.y = radius + 1.2;
    sphere.castShadow = true;
    cryoGroup.add(sphere);

    // Equator Reinforcement Ring with Tiranga Accent
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius + 0.1, 0.15, 8, 32),
      new THREE.MeshBasicMaterial({ color: 0xff9933 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = radius + 1.2;
    cryoGroup.add(ring);

    // Pressure Relief Vent Cap
    const vent = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.8, 12),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    vent.position.y = radius * 2 + 1.4;
    cryoGroup.add(vent);

    this.isruGroup.add(cryoGroup);
  }

  createPipelines() {
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0xd8dee9, metalness: 0.9, roughness: 0.15 });

    // Connecting pipes between extraction unit and cryo tanks
    const p1 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 12, 12), pipeMat);
    p1.rotation.z = Math.PI / 2;
    p1.position.set(4, 2.5, -3);
    this.isruGroup.add(p1);

    const p2 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 10, 12), pipeMat);
    p2.rotation.x = Math.PI / 2;
    p2.position.set(8, 2.5, -1);
    this.isruGroup.add(p2);
  }

  update(delta, time) {
    if (this.drillHead) {
      this.drillHead.rotation.y += delta * 6.0;
      this.drillHead.position.y = 1.8 + Math.sin(time * 3) * 0.4;
    }
  }
}

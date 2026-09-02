/**
 * Pragyan-II Autonomous Heavy Exploration Rover Fleet Factory
 * Features 6-wheel rocker-bogie suspension, steerable sensor mast, LED headlights,
 * and automated patrol path traversal around Shackleton base.
 */

import * as THREE from 'three';

export class RoverFactory {
  constructor(scene) {
    this.scene = scene;
    this.roverGroup = new THREE.Group();
    this.wheels = [];
    this.mast = null;
    this.headlights = [];
    
    // Patrol Path Waypoints (smooth looping closed curve)
    this.pathPoints = [
      new THREE.Vector3(-25, 0.4, -15),
      new THREE.Vector3(-15, 0.4, -30),
      new THREE.Vector3(15, 0.4, -28),
      new THREE.Vector3(30, 0.4, 0),
      new THREE.Vector3(20, 0.4, 25),
      new THREE.Vector3(-10, 0.4, 28),
      new THREE.Vector3(-35, 0.4, 10),
    ];
    this.curve = new THREE.CatmullRomCurve3(this.pathPoints, true);
    this.progress = 0;
    this.speed = 0.015;

    this.init();
  }

  init() {
    // 1. Rover Main Body Chassis
    const bodyGeom = new THREE.BoxGeometry(3.2, 1.4, 4.4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xdedede, // ISRO White / Gold foil composite
      metalness: 0.65,
      roughness: 0.35,
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 1.6;
    body.castShadow = true;
    this.roverGroup.add(body);

    // 2. Gold Kapton Solar Deck Top
    const solarDeckGeom = new THREE.BoxGeometry(3.0, 0.1, 4.0);
    const solarDeckMat = new THREE.MeshStandardMaterial({
      color: 0x1b2838,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x051329
    });
    const solarDeck = new THREE.Mesh(solarDeckGeom, solarDeckMat);
    solarDeck.position.y = 2.35;
    this.roverGroup.add(solarDeck);

    // 3. Indian Tiranga Decal on Body Side
    const flagPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.6),
      new THREE.MeshBasicMaterial({
        color: 0xff9933,
        side: THREE.DoubleSide
      })
    );
    flagPlane.position.set(1.61, 1.6, 0);
    flagPlane.rotation.y = Math.PI / 2;
    this.roverGroup.add(flagPlane);

    // 4. Six Cleated Metallic Wheels (Rocker-Bogie configuration)
    const wheelGeom = new THREE.CylinderGeometry(0.7, 0.7, 0.6, 16);
    wheelGeom.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x2b303c,
      metalness: 0.85,
      roughness: 0.3
    });

    const wheelPositions = [
      [-1.9, 0.7, 1.6],   // Front Left
      [1.9, 0.7, 1.6],    // Front Right
      [-2.1, 0.7, 0],     // Mid Left
      [2.1, 0.7, 0],      // Mid Right
      [-1.9, 0.7, -1.6],  // Rear Left
      [1.9, 0.7, -1.6],   // Rear Right
    ];

    wheelPositions.forEach((pos) => {
      const wheel = new THREE.Mesh(wheelGeom, wheelMat);
      wheel.position.set(...pos);
      wheel.castShadow = true;
      this.roverGroup.add(wheel);
      this.wheels.push(wheel);

      // Articulated Bogie Arm
      const armGeom = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 8);
      const armMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.9 });
      const arm = new THREE.Mesh(armGeom, armMat);
      arm.position.set(pos[0] * 0.7, 1.2, pos[2]);
      arm.rotation.z = pos[0] > 0 ? -0.4 : 0.4;
      this.roverGroup.add(arm);
    });

    // 5. Sensor Mast & Stereoscopic Panoramic Navcam Turret
    const mastMastGeom = new THREE.CylinderGeometry(0.12, 0.12, 2.0, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.9 });
    const mastPillar = new THREE.Mesh(mastMastGeom, mastMat);
    mastPillar.position.set(0.8, 3.2, 1.5);
    this.roverGroup.add(mastPillar);

    const turretGeom = new THREE.BoxGeometry(0.8, 0.5, 0.6);
    const turretMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9 });
    this.mast = new THREE.Mesh(turretGeom, turretMat);
    this.mast.position.set(0.8, 4.3, 1.5);

    // Navcam Lenses
    const lens1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 8), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    lens1.rotation.x = Math.PI / 2;
    lens1.position.set(-0.2, 0, 0.35);
    const lens2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.2, 8), new THREE.MeshBasicMaterial({ color: 0x00f0ff }));
    lens2.rotation.x = Math.PI / 2;
    lens2.position.set(0.2, 0, 0.35);
    this.mast.add(lens1);
    this.mast.add(lens2);

    this.roverGroup.add(this.mast);

    // 6. Dual Forward High-Intensity LED Headlights
    [-0.9, 0.9].forEach((x) => {
      const headlight = new THREE.SpotLight(0xffffff, 3.0, 35, Math.PI / 6, 0.4);
      headlight.position.set(x, 1.8, 2.3);
      
      const targetObj = new THREE.Object3D();
      targetObj.position.set(x, 0, 15);
      this.roverGroup.add(targetObj);
      headlight.target = targetObj;

      this.roverGroup.add(headlight);
      this.headlights.push(headlight);

      // Light lens mesh
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      bulb.position.set(x, 1.8, 2.25);
      this.roverGroup.add(bulb);
    });

    this.scene.add(this.roverGroup);
  }

  getGroup() {
    return this.roverGroup;
  }

  update(delta, time) {
    // Traverse along closed loop patrol curve
    this.progress = (this.progress + delta * this.speed) % 1;
    const currentPos = this.curve.getPointAt(this.progress);
    const nextPos = this.curve.getPointAt((this.progress + 0.005) % 1);

    this.roverGroup.position.copy(currentPos);

    // Orient rover towards forward travel direction
    const forward = new THREE.Vector3().subVectors(nextPos, currentPos).normalize();
    const targetAngle = Math.atan2(forward.x, forward.z);
    this.roverGroup.rotation.y = targetAngle;

    // Rotate wheels
    for (const wheel of this.wheels) {
      wheel.rotation.x += delta * 4;
    }

    // Panoramic mast scanning sweep
    if (this.mast) {
      this.mast.rotation.y = Math.sin(time * 0.8) * 0.5;
    }
  }
}

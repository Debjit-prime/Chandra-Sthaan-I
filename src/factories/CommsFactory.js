/**
 * Deep Space Communications & Optical Earth Laser Relay Factory
 * Features 12m steerable parabolic antenna with seamless zero-gap dish shield and gold rim integration,
 * tripod feed assembly, motorized tracking gantry, and dynamic laser beam anchoring.
 */

import * as THREE from 'three';

export class CommsFactory {
  constructor(scene) {
    this.scene = scene;
    this.commsGroup = new THREE.Group();
    this.azimuthFork = null;
    this.dishHead = null;
    this.dish = null;
    this.hornTip = null;
    this.emitterRing = null;
    
    this.laserGroup = new THREE.Group();
    this.laserCore = null;
    this.laserAura = null;
    this.dataPackets = [];
    this.statusLeds = [];
    
    this.earthPos = new THREE.Vector3(70, 110, 90);
    this.currentHornPos = new THREE.Vector3();

    this.init();
  }

  init() {
    this.commsGroup.position.set(0, 0, 45);

    // 1. Sintered Regolith Hexagonal Foundation Base
    const baseGeom = new THREE.CylinderGeometry(4.8, 6.0, 2.5, 6);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x242834,
      metalness: 0.85,
      roughness: 0.35,
    });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.position.y = 1.25;
    base.castShadow = true;
    base.receiveShadow = true;
    this.commsGroup.add(base);

    // Foundation Cyan Telemetry Beacon Ring
    const ringGeom = new THREE.RingGeometry(4.9, 5.3, 6);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.y = 2.52;
    this.commsGroup.add(ring);

    // Base Cable & Waveguide Junction Housing
    const juncGeom = new THREE.BoxGeometry(2.0, 1.4, 2.0);
    const juncMat = new THREE.MeshStandardMaterial({ color: 0x3b4252, metalness: 0.9, roughness: 0.3 });
    const junc = new THREE.Mesh(juncGeom, juncMat);
    junc.position.set(0, 3.2, -2.4);
    this.commsGroup.add(junc);

    // 2. Motorized Azimuth Tracking Gantry (Rotates 360°)
    this.azimuthFork = new THREE.Group();
    this.azimuthFork.position.set(0, 2.5, 0);

    // Central Rotation Hub Turret
    const turretGeom = new THREE.CylinderGeometry(2.2, 2.6, 3.2, 16);
    const turretMat = new THREE.MeshStandardMaterial({
      color: 0x2e3440,
      metalness: 0.9,
      roughness: 0.25,
    });
    const turret = new THREE.Mesh(turretGeom, turretMat);
    turret.position.y = 1.6;
    turret.castShadow = true;
    this.azimuthFork.add(turret);

    // Twin Elevation Support Arms
    const armGeom = new THREE.BoxGeometry(1.0, 6.0, 1.6);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x434c5e, metalness: 0.9, roughness: 0.2 });

    const armLeft = new THREE.Mesh(armGeom, armMat);
    armLeft.position.set(-2.4, 4.8, 0);
    armLeft.castShadow = true;
    this.azimuthFork.add(armLeft);

    const armRight = new THREE.Mesh(armGeom, armMat);
    armRight.position.set(2.4, 4.8, 0);
    armRight.castShadow = true;
    this.azimuthFork.add(armRight);

    // Heavy Bearing Collars
    const collarGeom = new THREE.CylinderGeometry(1.1, 1.1, 0.6, 16);
    collarGeom.rotateZ(Math.PI / 2);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xd8dee9, metalness: 0.95, roughness: 0.1 });
    
    const collarL = new THREE.Mesh(collarGeom, collarMat);
    collarL.position.set(-2.4, 6.4, 0);
    this.azimuthFork.add(collarL);

    const collarR = new THREE.Mesh(collarGeom, collarMat);
    collarR.position.set(2.4, 6.4, 0);
    this.azimuthFork.add(collarR);

    // Telemetry Status LEDs
    for (let i = 0; i < 4; i++) {
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 8),
        new THREE.MeshBasicMaterial({ color: i === 0 ? 0x00e676 : 0x00f0ff })
      );
      led.position.set(-1.8 + i * 1.2, 2.6, 1.15);
      this.azimuthFork.add(led);
      this.statusLeds.push(led);
    }

    // 3. Steerable Parabolic Reflector Assembly
    this.dishHead = new THREE.Group();
    this.dishHead.position.set(0, 6.4, 0); // Aligned with gantry bearings

    // Horizontal Pivot Axle Shaft
    const axleGeom = new THREE.CylinderGeometry(0.65, 0.65, 5.2, 16);
    axleGeom.rotateZ(Math.PI / 2);
    const axleMat = new THREE.MeshStandardMaterial({ color: 0x4c566a, metalness: 0.95, roughness: 0.15 });
    const axle = new THREE.Mesh(axleGeom, axleMat);
    this.dishHead.add(axle);

    // Rear Gimbal Hub & Counterweight Box
    const hubGeom = new THREE.BoxGeometry(2.6, 2.2, 2.6);
    const hubMat = new THREE.MeshStandardMaterial({ color: 0x2e3440, metalness: 0.85, roughness: 0.3 });
    const hub = new THREE.Mesh(hubGeom, hubMat);
    hub.position.set(0, 0, -0.6);
    this.dishHead.add(hub);

    // 4. Parabolic Reflector Dish Shield (Master Dish Object)
    this.dish = new THREE.Group();
    this.dish.position.set(0, 0, 0.4);
    this.dish.rotation.x = -Math.PI / 3.3; // Aimed up towards Earth orbit

    const dishRadius = 6.8;
    const thetaLen = Math.PI / 3.0; // 60 deg opening
    const rimY = dishRadius * Math.cos(thetaLen); // 3.4
    const rimRadius = dishRadius * Math.sin(thetaLen); // 5.88897

    // Main Parabolic Dish Sphere Shield
    const dishGeom = new THREE.SphereGeometry(dishRadius, 36, 20, 0, Math.PI * 2, 0, thetaLen);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.92,
      roughness: 0.12,
      side: THREE.DoubleSide,
    });
    const dishMesh = new THREE.Mesh(dishGeom, dishMat);
    dishMesh.castShadow = true;
    dishMesh.receiveShadow = true;
    this.dish.add(dishMesh);

    // Gold Perimeter Ring Trim (ATTACHED DIRECTLY TO THE DISH SHIELD EDGE - ZERO GAP)
    const dishRimGeom = new THREE.TorusGeometry(rimRadius, 0.18, 16, 48);
    dishRimGeom.rotateX(Math.PI / 2);
    const dishRimMat = new THREE.MeshStandardMaterial({
      color: 0xffb300,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0x664400,
      emissiveIntensity: 0.2
    });
    const dishRim = new THREE.Mesh(dishRimGeom, dishRimMat);
    dishRim.position.set(0, rimY, 0); // Exactly at y = 3.4 on the rim circumference!
    this.dish.add(dishRim);

    // Feed Horn Tripod Support Struts (Anchored from the perimeter ring to the focal feed horn)
    const focalHeight = 8.2;
    const strutMat = new THREE.MeshStandardMaterial({ color: 0x2e3440, metalness: 0.9, roughness: 0.3 });
    
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const rimPoint = new THREE.Vector3(Math.cos(angle) * rimRadius, rimY, Math.sin(angle) * rimRadius);
      const focalPoint = new THREE.Vector3(0, focalHeight, 0);
      
      const strutLength = rimPoint.distanceTo(focalPoint);
      const strutGeom = new THREE.CylinderGeometry(0.08, 0.08, strutLength, 8);
      strutGeom.translate(0, strutLength / 2, 0);
      
      const strut = new THREE.Mesh(strutGeom, strutMat);
      strut.position.copy(rimPoint);
      
      const strutDir = new THREE.Vector3().subVectors(focalPoint, rimPoint).normalize();
      strut.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), strutDir);
      this.dish.add(strut);
    }

    // Focal Feed Horn & Optical Transceiver Assembly (At center focal point)
    const hornGroup = new THREE.Group();
    hornGroup.position.set(0, focalHeight, 0);

    const hornGeom = new THREE.CylinderGeometry(0.35, 0.75, 1.8, 16);
    const hornMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0x007799,
      emissiveIntensity: 0.6,
    });
    const horn = new THREE.Mesh(hornGeom, hornMat);
    horn.rotation.x = Math.PI; // Pointing back towards dish reflector
    hornGroup.add(horn);

    // Emitter Lens Flare Ring
    const lensGeom = new THREE.RingGeometry(0.2, 0.8, 16);
    const lensMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    this.emitterRing = new THREE.Mesh(lensGeom, lensMat);
    this.emitterRing.position.y = 0.95;
    this.emitterRing.rotation.x = -Math.PI / 2;
    hornGroup.add(this.emitterRing);

    // Virtual Horn Tip marker for laser tracking
    this.hornTip = new THREE.Object3D();
    this.hornTip.position.set(0, 0.95, 0);
    hornGroup.add(this.hornTip);

    this.dish.add(hornGroup);
    this.dishHead.add(this.dish);
    this.azimuthFork.add(this.dishHead);
    this.commsGroup.add(this.azimuthFork);

    this.scene.add(this.commsGroup);

    // 5. Zero-Gap Dynamic Optical Laser Beam & Photon Packets
    this.createLaserBeam();
  }

  createLaserBeam() {
    // Laser Beam Core
    const coreGeom = new THREE.CylinderGeometry(0.06, 0.06, 1, 8);
    coreGeom.translate(0, 0.5, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
    });
    this.laserCore = new THREE.Mesh(coreGeom, coreMat);
    this.laserGroup.add(this.laserCore);

    // Laser Beam Glowing Emerald Aura Sheath
    const auraGeom = new THREE.CylinderGeometry(0.25, 0.25, 1, 8);
    auraGeom.translate(0, 0.5, 0);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x00e676,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });
    this.laserAura = new THREE.Mesh(auraGeom, auraMat);
    this.laserGroup.add(this.laserAura);

    this.scene.add(this.laserGroup);

    // Animated Photon Data Packet Spheres
    const packetCount = 8;
    const packetGeom = new THREE.SphereGeometry(0.35, 8, 8);
    const packetMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.9,
    });

    for (let i = 0; i < packetCount; i++) {
      const packet = new THREE.Mesh(packetGeom, packetMat);
      this.scene.add(packet);
      this.dataPackets.push({
        mesh: packet,
        offset: i / packetCount,
        speed: 0.45,
      });
    }
  }

  update(delta, time) {
    // 1. Robotic Tracking Servos
    if (this.azimuthFork) {
      this.azimuthFork.rotation.y = Math.sin(time * 0.25) * 0.08 + 0.15;
    }

    if (this.dishHead) {
      this.dishHead.rotation.x = Math.sin(time * 0.35) * 0.03;
    }

    // 2. Optical Emitter Flare Pulse
    if (this.emitterRing) {
      const scale = 1.0 + Math.sin(time * 14.0) * 0.35;
      this.emitterRing.scale.set(scale, scale, scale);
      this.emitterRing.material.opacity = 0.65 + Math.sin(time * 18.0) * 0.35;
    }

    // 3. ZERO-GAP LASER BEAM DYNAMIC ANCHORING
    if (this.hornTip) {
      this.hornTip.getWorldPosition(this.currentHornPos);

      const rayVec = new THREE.Vector3().subVectors(this.earthPos, this.currentHornPos);
      const beamLength = rayVec.length();
      const rayDir = rayVec.clone().normalize();

      this.laserGroup.position.copy(this.currentHornPos);
      this.laserGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), rayDir);

      this.laserCore.scale.set(1, beamLength, 1);
      this.laserAura.scale.set(1, beamLength, 1);

      this.laserCore.material.opacity = 0.85 + Math.sin(time * 20.0) * 0.15;
      this.laserAura.material.opacity = 0.45 + Math.sin(time * 12.0) * 0.25;

      // 4. Stream High-Speed Photon Data Packets
      for (const p of this.dataPackets) {
        p.offset = (p.offset + delta * p.speed) % 1.0;
        const packetPos = new THREE.Vector3().lerpVectors(this.currentHornPos, this.earthPos, p.offset);
        p.mesh.position.copy(packetPos);
        p.mesh.material.opacity = Math.sin(p.offset * Math.PI) * 0.95;
      }
    }

    // 5. Gantry Status LEDs Flash
    for (let i = 0; i < this.statusLeds.length; i++) {
      const flash = Math.sin(time * 8.0 + i * 1.5) > 0.2;
      this.statusLeds[i].material.opacity = flash ? 1.0 : 0.3;
    }
  }
}

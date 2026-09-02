/**
 * Pressurized Habitat Complex & Geodesic Biodomes Factory
 * Features multi-dome architecture, translucent hexagonal cupolas, interior biolab illumination,
 * and interconnected transit tunnels with Tiranga LED guidance strips.
 */

import * as THREE from 'three';

export class HabitatFactory {
  constructor(scene) {
    this.scene = scene;
    this.habitatGroup = new THREE.Group();
    this.ledStrips = [];
    this.interiorLights = [];

    this.init();
  }

  init() {
    this.habitatGroup.position.set(-20, 0, 10);

    // 1. Central Command Dome (Large Geodesic Dome)
    this.createDome(0, 0, 14, 0x00f0ff, "COMMAND & CONTROL HUB");

    // 2. Crew Living Quarters Dome
    this.createDome(-18, -12, 10, 0xff9933, "CREW QUARTERS & MEDICAL");

    // 3. Bio-Dome Greenhouse Dome (Warm photosynthetic green/purple glow)
    this.createDome(-14, 16, 11, 0x00e676, "HYDROPONIC BIO-DOME", true);

    // 4. EVA Logistics & Science Airlock Dome
    this.createDome(16, -10, 9, 0x00e5ff, "EVA AIRLOCK & SAMPLE LAB");

    // 5. Interconnecting Pressurized Transit Tunnels
    this.createTunnel([0, 0], [-18, -12]);
    this.createTunnel([0, 0], [-14, 16]);
    this.createTunnel([0, 0], [16, -10]);
    this.createTunnel([-18, -12], [-14, 16]);

    // 6. Primary Base Airlock Entry Port
    this.createAirlockPort(0, 15);

    this.scene.add(this.habitatGroup);
  }

  createDome(x, z, radius, glowColor, label, isGreenhouse = false) {
    const domeGroup = new THREE.Group();
    domeGroup.position.set(x, 0, z);

    // Sintered Regolith Foundation Berm
    const bermGeom = new THREE.CylinderGeometry(radius + 2.5, radius + 4.5, 2.5, 32);
    const bermMat = new THREE.MeshStandardMaterial({
      color: 0x333842,
      roughness: 0.9,
      metalness: 0.1
    });
    const bermMesh = new THREE.Mesh(bermGeom, bermMat);
    bermMesh.position.y = 1.25;
    bermMesh.receiveShadow = true;
    domeGroup.add(bermMesh);

    // Geodesic Icosahedron Outer Shell
    const domeGeom = new THREE.IcosahedronGeometry(radius, 3);
    // Clip lower half
    const pos = domeGeom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) < 0) {
        pos.setY(i, 0);
      }
    }
    domeGeom.computeVertexNormals();

    const domeMat = new THREE.MeshStandardMaterial({
      color: isGreenhouse ? 0x22332a : 0xdedede,
      roughness: 0.35,
      metalness: 0.65,
      wireframe: false,
    });
    const domeMesh = new THREE.Mesh(domeGeom, domeMat);
    domeMesh.castShadow = true;
    domeMesh.receiveShadow = true;
    domeGroup.add(domeMesh);

    // Translucent Hexagonal Viewing Cupola / Skylight
    const skylightGeom = new THREE.SphereGeometry(radius * 0.45, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3);
    const skylightMat = new THREE.MeshPhysicalMaterial({
      color: glowColor,
      transparent: true,
      opacity: 0.65,
      transmission: 0.7,
      roughness: 0.1,
      metalness: 0.1,
      emissive: glowColor,
      emissiveIntensity: 0.25,
    });
    const skylightMesh = new THREE.Mesh(skylightGeom, skylightMat);
    skylightMesh.position.y = radius * 0.75;
    domeGroup.add(skylightMesh);

    // Interior Warm Lighting
    const intLight = new THREE.PointLight(glowColor, 1.8, radius * 2.5);
    intLight.position.set(0, radius * 0.5, 0);
    domeGroup.add(intLight);
    this.interiorLights.push({ light: intLight, baseIntensity: 1.8, color: glowColor });

    // Dome Perimeter Warning Beacon Ring
    const ringGeom = new THREE.TorusGeometry(radius + 0.2, 0.15, 8, 32);
    ringGeom.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: glowColor });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.position.y = 2.6;
    domeGroup.add(ringMesh);

    this.habitatGroup.add(domeGroup);
  }

  createTunnel(start, end) {
    const dx = end[0] - start[0];
    const dz = end[1] - start[1];
    const length = Math.hypot(dx, dz);
    const angle = Math.atan2(dx, dz);

    const midX = (start[0] + end[0]) / 2;
    const midZ = (start[1] + end[1]) / 2;

    const tunnelGroup = new THREE.Group();
    tunnelGroup.position.set(midX, 2, midZ);
    tunnelGroup.rotation.y = angle;

    // Tube Body
    const tubeGeom = new THREE.CylinderGeometry(2.0, 2.0, length, 16);
    tubeGeom.rotateX(Math.PI / 2);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.4,
      metalness: 0.6
    });
    const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
    tubeMesh.castShadow = true;
    tubeMesh.receiveShadow = true;
    tunnelGroup.add(tubeMesh);

    // Tiranga Glowing LED Guidance Line along top of the tunnel
    const ledGeom = new THREE.PlaneGeometry(0.35, length);
    ledGeom.rotateX(-Math.PI / 2);

    // Create canvas texture for Tiranga gradient LED strip
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, '#FF9933'); // Saffron
    grad.addColorStop(0.5, '#FFFFFF'); // White
    grad.addColorStop(1, '#00E676'); // Green
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 128);

    const ledTexture = new THREE.CanvasTexture(canvas);
    ledTexture.wrapT = THREE.RepeatWrapping;
    ledTexture.repeat.set(1, 4);

    const ledMat = new THREE.MeshBasicMaterial({
      map: ledTexture,
      side: THREE.DoubleSide
    });

    const ledMesh = new THREE.Mesh(ledGeom, ledMat);
    ledMesh.position.y = 2.05;
    tunnelGroup.add(ledMesh);
    this.ledStrips.push(ledTexture);

    this.habitatGroup.add(tunnelGroup);
  }

  createAirlockPort(x, z) {
    const portGroup = new THREE.Group();
    portGroup.position.set(x, 1.8, z);

    // Octagonal Airlock Chamber
    const airlockGeom = new THREE.BoxGeometry(4.5, 3.6, 5);
    const airlockMat = new THREE.MeshStandardMaterial({ color: 0x3d4450, metalness: 0.8, roughness: 0.3 });
    const airlockMesh = new THREE.Mesh(airlockGeom, airlockMat);
    airlockMesh.castShadow = true;
    portGroup.add(airlockMesh);

    // Outer Pressure Hatch with Hazard Stripes
    const doorGeom = new THREE.BoxGeometry(2.4, 2.6, 0.2);
    const doorMat = new THREE.MeshBasicMaterial({ color: 0xff9933 });
    const doorMesh = new THREE.Mesh(doorGeom, doorMat);
    doorMesh.position.set(0, 0, 2.55);
    portGroup.add(doorMesh);

    // Status Indicator Light
    const statusLight = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x00e676 })
    );
    statusLight.position.set(0, 2.2, 2.55);
    portGroup.add(statusLight);

    this.habitatGroup.add(portGroup);
  }

  update(delta, time) {
    // Animate Tiranga LED guidance pulses along the corridors
    for (const tex of this.ledStrips) {
      tex.offset.y -= delta * 0.6;
    }

    // Gentle breathing luminescence for biodome interior lights
    for (const item of this.interiorLights) {
      item.light.intensity = item.baseIntensity * (0.9 + Math.sin(time * 2) * 0.1);
    }
  }
}

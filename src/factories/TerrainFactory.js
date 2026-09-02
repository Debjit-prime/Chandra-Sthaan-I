/**
 * Shackleton Crater Procedural Terrain & Landing Pad Alpha Factory
 * Generates stabilized settlement basin floor plateau, elevated outer crater rim ridges,
 * sintered blast pad Alpha, approach guidance lighting, and rock debris clusters.
 */

import * as THREE from 'three';

export class TerrainFactory {
  constructor(scene) {
    this.scene = scene;
    this.terrainMesh = null;
    this.landingPad = null;
    this.xrayPipelines = null;
    this.beaconLights = [];

    this.init();
  }

  init() {
    this.generateCraterTerrain();
    this.createLandingPad();
    this.createInfrastructureXRayGrid();
    this.scatterRocks();
  }

  generateCraterTerrain() {
    const size = 320;
    const segments = 120;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const pos = geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    // Multi-octave procedural height generation with dedicated settlement basin plateau
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Distance from center of Shackleton settlement
      const baseDist = Math.hypot(x, z);

      // 1. Settlement Basin Plateau Mask:
      // Inner radius < 52m is smoothly stabilized (y ≈ 0) so ALL base elements sit 100% visible above ground.
      // Between 52m and 92m, terrain ascends smoothly into the high crater rim ridge.
      const basinMask = THREE.MathUtils.smoothstep(baseDist, 52, 96);

      // 2. Outer Crater Rim Topography (Peak of Eternal Light at NW, low shadow basin at SE)
      const rimAngle = Math.atan2(z, x);
      const rimPeakFactor = Math.sin(rimAngle + 0.8) * 0.5 + 0.5; // High ridge for solar towers
      const craterWall = Math.sin(THREE.MathUtils.clamp((baseDist - 50) / (size * 0.45), 0, 1) * Math.PI) * 22 * (0.5 + rimPeakFactor * 0.9);

      // 3. Lunar rolling undulations (subtle within base floor, pronounced on outer slopes)
      const hills =
        Math.sin(x * 0.035) * Math.cos(z * 0.035) * 2.8 +
        Math.sin(x * 0.08 + 1.2) * Math.cos(z * 0.08) * 1.2 +
        Math.sin(x * 0.2) * Math.cos(z * 0.2) * 0.3;

      let y = (craterWall * basinMask) + (hills * (0.05 + 0.95 * basinMask));

      // 4. Procedural Impact Micro-craters (Situated safely outside the base perimeter)
      const microCraters = [
        { x: -75, z: 55, r: 16, depth: 4.5 },
        { x: 80, z: -65, r: 22, depth: 6.0 },
        { x: -85, z: -55, r: 14, depth: 3.8 },
        { x: 25, z: -85, r: 18, depth: 5.2 },
        { x: 95, z: 35, r: 12, depth: 3.0 }
      ];

      for (const mc of microCraters) {
        const d = Math.hypot(x - mc.x, z - mc.z);
        if (d < mc.r) {
          const factor = (1 - (d / mc.r) ** 2);
          y -= factor * mc.depth;
          // Crater raised lip
          if (d > mc.r * 0.75) {
            y += factor * (mc.depth * 0.35);
          }
        }
      }

      pos.setY(i, y);

      // Procedural lunar regolith vertex coloring
      const heightFactor = THREE.MathUtils.clamp((y + 5) / 25, 0, 1);
      const noiseColor = (Math.sin(x * 0.2) + Math.cos(z * 0.2)) * 0.04;
      
      const r = 0.28 + heightFactor * 0.15 + noiseColor;
      const g = 0.29 + heightFactor * 0.15 + noiseColor;
      const b = 0.32 + heightFactor * 0.16 + noiseColor;

      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.08,
      flatShading: false,
    });

    this.terrainMesh = new THREE.Mesh(geometry, material);
    this.terrainMesh.receiveShadow = true;
    this.scene.add(this.terrainMesh);
  }

  createLandingPad() {
    const padGroup = new THREE.Group();
    padGroup.position.set(40, 0, 30);

    // 1. Lower Sloped Regolith Blast Berm (Deflects supersonic ejecta)
    const bermGeom = new THREE.CylinderGeometry(23.5, 27.0, 1.2, 8);
    const bermMat = new THREE.MeshStandardMaterial({
      color: 0x1e222d,
      roughness: 0.9,
      metalness: 0.15,
    });
    const bermMesh = new THREE.Mesh(bermGeom, bermMat);
    bermMesh.position.y = 0.6;
    bermMesh.receiveShadow = true;
    padGroup.add(bermMesh);

    // 2. High-Strength Sintered Basalt Octagonal Landing Platform Deck
    const padGeom = new THREE.CylinderGeometry(22.0, 23.5, 0.8, 8);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x282f3d,
      roughness: 0.65,
      metalness: 0.35,
    });
    const padMesh = new THREE.Mesh(padGeom, padMat);
    padMesh.position.y = 1.4;
    padMesh.receiveShadow = true;
    padGroup.add(padMesh);

    // 3. High-Temperature Refractory Blast Ring
    const ringGeom = new THREE.RingGeometry(18.5, 21.0, 32);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xff9933, // Saffron hazard perimeter
      side: THREE.DoubleSide
    });
    const ringMesh = new THREE.Mesh(ringGeom, ringMat);
    ringMesh.position.y = 1.82;
    padGroup.add(ringMesh);

    // 4. Center ISRO Landing Target Crosshair Ring & Markings
    const targetRingGeom = new THREE.RingGeometry(11.0, 11.8, 32);
    targetRingGeom.rotateX(-Math.PI / 2);
    const targetRingMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide });
    const targetRing = new THREE.Mesh(targetRingGeom, targetRingMat);
    targetRing.position.y = 1.83;
    padGroup.add(targetRing);

    const crossMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const bar1 = new THREE.Mesh(new THREE.PlaneGeometry(16, 0.8), crossMat);
    bar1.rotateX(-Math.PI / 2);
    bar1.position.y = 1.83;
    const bar2 = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 16), crossMat);
    bar2.rotateX(-Math.PI / 2);
    bar2.position.y = 1.83;
    padGroup.add(bar1);
    padGroup.add(bar2);

    // 5. Perimeter Guidance Strobe Beacons (8 Outer Dual-Color Strobe Towers)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = Math.cos(angle) * 22.5;
      const z = Math.sin(angle) * 22.5;

      const beaconPillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.35, 1.8, 8),
        new THREE.MeshStandardMaterial({ color: 0x3b4252, metalness: 0.85, roughness: 0.25 })
      );
      beaconPillar.position.set(x, 1.8 + 0.9, z);
      beaconPillar.castShadow = true;

      // Dual-Color Strobe Lens
      const beaconLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 8, 8),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x00e676 : 0xffb300 })
      );
      beaconLight.position.set(x, 1.8 + 1.9, z);

      padGroup.add(beaconPillar);
      padGroup.add(beaconLight);
      this.beaconLights.push(beaconLight);
    }

    this.landingPad = padGroup;
    this.scene.add(padGroup);
  }

  scatterRocks() {
    const rockGeom = new THREE.DodecahedronGeometry(1, 1);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x4a4d55,
      roughness: 0.95,
      metalness: 0.05
    });

    const rockCount = 65;
    for (let i = 0; i < rockCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 35 + Math.random() * 115;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;

      // Avoid placing rocks on landing pad or central settlement hub
      if (Math.hypot(x - 40, z - 30) < 30 || Math.hypot(x + 20, z - 10) < 28) continue;

      const rock = new THREE.Mesh(rockGeom, rockMat);
      const scale = 0.5 + Math.random() * 2.2;
      rock.scale.set(scale, scale * (0.6 + Math.random() * 0.6), scale);
      rock.position.set(x, 0.5, z);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      rock.castShadow = true;
      rock.receiveShadow = true;
      this.scene.add(rock);
    }
  }

  createInfrastructureXRayGrid() {
    this.xrayPipelines = new THREE.Group();

    // 1. Power DC Superconducting Bus (Solar array to Hub & Lander)
    const powerPoints = [
      new THREE.Vector3(-45, 0.8, -35),
      new THREE.Vector3(-30, 0.8, -10),
      new THREE.Vector3(-20, 0.8, 10),
      new THREE.Vector3(0, 0.8, 15),
      new THREE.Vector3(40, 1.8, 30) // To Landing Pad Alpha
    ];
    const powerCurve = new THREE.CatmullRomCurve3(powerPoints);
    const powerGeom = new THREE.TubeGeometry(powerCurve, 32, 0.25, 8, false);
    const powerMat = new THREE.MeshBasicMaterial({ color: 0xffb300, wireframe: true });
    const powerLine = new THREE.Mesh(powerGeom, powerMat);
    this.xrayPipelines.add(powerLine);

    // 2. Cryogenic LOX/LH2 Propellant Transfer Pipeline (ISRU plant to Pad Alpha)
    const fuelPoints = [
      new THREE.Vector3(25, 0.8, -25),
      new THREE.Vector3(32, 0.8, 0),
      new THREE.Vector3(40, 1.8, 30)
    ];
    const fuelCurve = new THREE.CatmullRomCurve3(fuelPoints);
    const fuelGeom = new THREE.TubeGeometry(fuelCurve, 24, 0.35, 8, false);
    const fuelMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true });
    const fuelLine = new THREE.Mesh(fuelGeom, fuelMat);
    this.xrayPipelines.add(fuelLine);

    // 3. Life Support Water & ECLSS Conduit
    const waterPoints = [
      new THREE.Vector3(25, 0.8, -25),
      new THREE.Vector3(0, 0.8, 0),
      new THREE.Vector3(-20, 0.8, 10),
      new THREE.Vector3(-30, 0.8, 5)
    ];
    const waterCurve = new THREE.CatmullRomCurve3(waterPoints);
    const waterGeom = new THREE.TubeGeometry(waterCurve, 24, 0.28, 8, false);
    const waterMat = new THREE.MeshBasicMaterial({ color: 0x00e676, wireframe: true });
    const waterLine = new THREE.Mesh(waterGeom, waterMat);
    this.xrayPipelines.add(waterLine);

    this.xrayPipelines.visible = false;
    this.scene.add(this.xrayPipelines);
  }

  update(delta, time) {
    // Pulse perimeter approach beacon lights
    for (let i = 0; i < this.beaconLights.length; i++) {
      const flash = Math.sin(time * 6.0 + i * 0.8) > 0.1;
      this.beaconLights[i].material.opacity = flash ? 1.0 : 0.25;
    }
  }
}

/**
 * Chandra Sthaan-I Super Heavy Reusable Lunar Lander Factory
 * Features NASA/ISRO Grade Launch Mount Infrastructure:
 * Elevated Steel Launch Table, Inverted Flame Deflector Cone, 4x Hydraulic Hold-Down Clamps,
 * Titanium Strut Landing Shoes, 34m Cryogenic Launch Umbilical Tower (LUT), and Quick-Disconnect Propellant Arms.
 */

import * as THREE from 'three';

export class LanderFactory {
  constructor(scene) {
    this.scene = scene;
    this.landerGroup = new THREE.Group();
    this.plumeGroup = new THREE.Group();
    this.plumeLight = null;
    this.gridFins = [];
    this.towerStrobes = [];
    this.holdDownStatusLeds = [];
    
    this.init();
  }

  init() {
    this.landerGroup.position.set(40, 0, 30);

    const tileTexture = this.generateHeatShieldTexture();
    const isroLogoTexture = this.generateISROLiveryTexture();

    // =========================================================================
    // 1. ELEVATED INDUSTRIAL LAUNCH TABLE (LAUNCH MOUNT STAND)
    // =========================================================================
    const launchTableGroup = new THREE.Group();
    launchTableGroup.position.set(0, 1.8, 0); // Sits on top of Pad Alpha deck

    // Heavy Structural Octagonal Steel Launch Ring
    const tableGeom = new THREE.CylinderGeometry(7.2, 7.8, 2.6, 8);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x2b303c,
      metalness: 0.9,
      roughness: 0.22,
    });
    const tableMesh = new THREE.Mesh(tableGeom, tableMat);
    tableMesh.position.y = 1.3;
    tableMesh.castShadow = true;
    tableMesh.receiveShadow = true;
    launchTableGroup.add(tableMesh);

    // Launch Mount Steel Deck Grating (Hollow exhaust ring)
    const gratingGeom = new THREE.RingGeometry(4.2, 7.2, 8);
    gratingGeom.rotateX(-Math.PI / 2);
    const gratingMat = new THREE.MeshStandardMaterial({
      color: 0xffb300,
      metalness: 0.85,
      roughness: 0.3,
      side: THREE.DoubleSide
    });
    const grating = new THREE.Mesh(gratingGeom, gratingMat);
    grating.position.y = 2.62;
    launchTableGroup.add(grating);

    // 8x Heavy Foundation Support Pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1f232b, metalness: 0.9, roughness: 0.3 });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = Math.cos(angle) * 6.5;
      const pz = Math.sin(angle) * 6.5;

      const col = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.6, 1.2), pillarMat);
      col.position.set(px, 1.3, pz);
      col.castShadow = true;
      launchTableGroup.add(col);
    }

    // =========================================================================
    // 2. INVERTED REFRACTORY FLAME DEFLECTOR CONE
    // =========================================================================
    // Splits the 7,800 kN rocket exhaust plume outward safely into flame channels
    const deflectorGeom = new THREE.ConeGeometry(3.8, 2.4, 16);
    const deflectorMat = new THREE.MeshStandardMaterial({
      color: 0x181a20,
      metalness: 0.95,
      roughness: 0.15,
    });
    const deflector = new THREE.Mesh(deflectorGeom, deflectorMat);
    deflector.position.set(0, 1.2, 0); // Pointed upward directly under engine cluster
    deflector.castShadow = true;
    launchTableGroup.add(deflector);

    // =========================================================================
    // 3. 4x HYDRAULIC HOLD-DOWN CLAMP ASSEMBLIES
    // =========================================================================
    const clampMat = new THREE.MeshStandardMaterial({ color: 0xff9933, metalness: 0.8, roughness: 0.25 });
    const pistonMat = new THREE.MeshStandardMaterial({ color: 0xd8dee9, metalness: 0.95, roughness: 0.1 });

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const clampGroup = new THREE.Group();
      clampGroup.position.set(Math.cos(angle) * 5.0, 2.6, Math.sin(angle) * 5.0);
      clampGroup.rotation.y = -angle;

      // Base Housing
      const baseHousing = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 1.4), clampMat);
      baseHousing.position.y = 0.9;
      baseHousing.castShadow = true;
      clampGroup.add(baseHousing);

      // Hydraulic Piston
      const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.6, 12), pistonMat);
      piston.position.set(-0.35, 1.2, 0);
      piston.rotation.z = -Math.PI / 6;
      clampGroup.add(piston);

      // Locking Jaw (Extending over rocket thrust ring)
      const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.4, 0.8), pillarMat);
      jaw.position.set(-0.7, 1.6, 0);
      clampGroup.add(jaw);

      // Status LED (Green: Locked, Amber: Armed)
      const led = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00e676 })
      );
      led.position.set(0.4, 1.4, 0);
      clampGroup.add(led);
      this.holdDownStatusLeds.push(led);

      launchTableGroup.add(clampGroup);
    }

    // =========================================================================
    // 4. 4x TITANIUM STRUT ANCHOR LOCKING SHOES (PAD RECEIVER SOCKETS)
    // =========================================================================
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x3b4252, metalness: 0.9, roughness: 0.2 });
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const sx = Math.cos(angle) * 6.8;
      const sz = Math.sin(angle) * 6.8;

      const shoe = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 0.45, 6), shoeMat);
      shoe.position.set(sx, 0.22, sz);
      shoe.receiveShadow = true;
      launchTableGroup.add(shoe);
    }

    this.landerGroup.add(launchTableGroup);

    // =========================================================================
    // 5. 34m CRYOGENIC LAUNCH UMBILICAL TOWER (LUT & GANTRY)
    // =========================================================================
    const lutGroup = new THREE.Group();
    lutGroup.position.set(13.5, 1.8, -7.5);

    // Main 4-Pillar Steel Lattice Tower (34m height)
    const towerHeight = 34;
    const towerWidth = 3.6;
    const trussMat = new THREE.MeshStandardMaterial({
      color: 0x343d46,
      metalness: 0.85,
      roughness: 0.35,
    });

    // 4 Main Vertical Gantry Pillars
    for (let x = -1; x <= 1; x += 2) {
      for (let z = -1; z <= 1; z += 2) {
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.22, 0.28, towerHeight, 8),
          trussMat
        );
        pillar.position.set((x * towerWidth) / 2, towerHeight / 2, (z * towerWidth) / 2);
        pillar.castShadow = true;
        lutGroup.add(pillar);
      }
    }

    // Horizontal & Diagonal Lattice Cross-Braces
    for (let y = 3; y <= towerHeight - 2; y += 4) {
      // Horizontal frame deck ring
      const frameGeom = new THREE.RingGeometry(1.8, 2.2, 4);
      frameGeom.rotateX(-Math.PI / 2);
      const frame = new THREE.Mesh(frameGeom, trussMat);
      frame.position.y = y;
      lutGroup.add(frame);

      // Walkway Platform with Safety Railings at Y = 14, 22, 30
      if (y === 14 || y === 22 || y === 30) {
        const platform = new THREE.Mesh(
          new THREE.BoxGeometry(towerWidth + 1.2, 0.3, towerWidth + 1.2),
          new THREE.MeshStandardMaterial({ color: 0xff9933, metalness: 0.8, roughness: 0.3 })
        );
        platform.position.y = y;
        platform.castShadow = true;
        lutGroup.add(platform);
      }
    }

    // Cryogenic Umbilical Fueling Boom 1 (Liquid Methane CH4 at Y = 14m)
    const boom1 = this.createUmbilicalArm(14, -13.5, 7.5, 0x00f0ff, "CH₄ REFUEL");
    lutGroup.add(boom1);

    // Cryogenic Umbilical Fueling Boom 2 (Liquid Oxygen LOX at Y = 22m)
    const boom2 = this.createUmbilicalArm(22, -13.5, 7.5, 0x00e676, "LOX CRYOGENIC");
    lutGroup.add(boom2);

    // Crew Access / Maintenance Gangway Arm (at Y = 30m to Nosecone)
    const gangwayGeom = new THREE.BoxGeometry(11.0, 1.2, 1.4);
    const gangwayMat = new THREE.MeshStandardMaterial({ color: 0x4f5b66, metalness: 0.85, roughness: 0.3 });
    const gangway = new THREE.Mesh(gangwayGeom, gangwayMat);
    gangway.position.set(-5.5, 30, 3.2);
    gangway.rotation.y = -Math.PI / 6.5;
    gangway.castShadow = true;
    lutGroup.add(gangway);

    // Tower Top Strobe Warning Beacon (Aviation Red/White)
    const topStrobe = new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff3366 })
    );
    topStrobe.position.set(0, towerHeight + 0.6, 0);
    lutGroup.add(topStrobe);
    this.towerStrobes.push(topStrobe);

    this.landerGroup.add(lutGroup);

    // =========================================================================
    // 6. CHANDRA STHAAN-I SUPER HEAVY LANDER FUSELAGE
    // =========================================================================
    // Fuselage sits securely on top of the Launch Mount (Base Y = 4.4m)
    const fuselageY = 17 + 2.4;

    // Main Fuselage Cylinder (Lower Stage)
    const bodyGeom = new THREE.CylinderGeometry(4.5, 4.5, 26, 32);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xe8ecf2,
      roughness: 0.25,
      metalness: 0.85,
      map: isroLogoTexture
    });
    const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    bodyMesh.position.y = fuselageY;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    this.landerGroup.add(bodyMesh);

    // Heat Shield Tile Section (Leeward half of the cylinder)
    const heatShieldGeom = new THREE.CylinderGeometry(4.55, 4.55, 26, 32, 1, false, 0, Math.PI);
    const heatShieldMat = new THREE.MeshStandardMaterial({
      map: tileTexture,
      roughness: 0.88,
      metalness: 0.1,
      color: 0x111317
    });
    const heatShieldMesh = new THREE.Mesh(heatShieldGeom, heatShieldMat);
    heatShieldMesh.position.y = fuselageY;
    heatShieldMesh.rotation.y = -Math.PI / 2;
    heatShieldMesh.castShadow = true;
    this.landerGroup.add(heatShieldMesh);

    // Nosecone (Upper Crew / Cargo Fairing)
    const noseGeom = new THREE.ConeGeometry(4.5, 12, 32);
    const noseMat = new THREE.MeshStandardMaterial({
      color: 0xe8ecf2,
      roughness: 0.25,
      metalness: 0.85
    });
    const noseMesh = new THREE.Mesh(noseGeom, noseMat);
    noseMesh.position.y = fuselageY + 19;
    noseMesh.castShadow = true;
    this.landerGroup.add(noseMesh);

    // Crew Observation Windows Ring
    const windowRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.6, 0.2, 16, 32),
      new THREE.MeshBasicMaterial({ color: 0x00f0ff })
    );
    windowRing.rotation.x = Math.PI / 2;
    windowRing.position.y = fuselageY + 14;
    this.landerGroup.add(windowRing);

    // Steerable Grid Fins
    const finGeom = new THREE.BoxGeometry(2.4, 1.8, 0.2);
    const finMat = new THREE.MeshStandardMaterial({ color: 0x333742, metalness: 0.9, roughness: 0.4 });

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const finGroup = new THREE.Group();
      finGroup.position.set(Math.cos(angle) * 4.6, fuselageY + 11, Math.sin(angle) * 4.6);
      finGroup.rotation.y = -angle;

      const finMesh = new THREE.Mesh(finGeom, finMat);
      finMesh.position.x = 1.2;
      finGroup.add(finMesh);
      this.landerGroup.add(finGroup);
      this.gridFins.push(finGroup);
    }

    // Articulated Landing Struts & Footpads (Seated securely into titanium shoes)
    const legCount = 4;
    for (let i = 0; i < legCount; i++) {
      const angle = (i / legCount) * Math.PI * 2 + Math.PI / 4;
      const legGroup = new THREE.Group();
      legGroup.position.set(0, fuselageY - 13, 0);
      legGroup.rotation.y = angle;

      // Primary strut
      const strutGeom = new THREE.CylinderGeometry(0.3, 0.25, 10, 12);
      const strutMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.8, roughness: 0.3 });
      const strut = new THREE.Mesh(strutGeom, strutMat);
      strut.position.set(3.8, 0, 0);
      strut.rotation.z = -0.55;
      strut.castShadow = true;
      legGroup.add(strut);

      // Footpad resting on pad anchor shoe
      const padGeom = new THREE.CylinderGeometry(1.6, 1.8, 0.4, 16);
      const padMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.6, roughness: 0.6 });
      const pad = new THREE.Mesh(padGeom, padMat);
      pad.position.set(6.8, -4.1, 0);
      legGroup.add(pad);

      this.landerGroup.add(legGroup);
    }

    // Methalox Rocket Engine Cluster (6 outer + 3 center vacuum bells)
    const engineMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.9, roughness: 0.2 });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const bell = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.8, 16, 1, true), engineMat);
      bell.position.set(Math.cos(angle) * 2.6, fuselageY - 14.2, Math.sin(angle) * 2.6);
      bell.rotation.x = Math.PI;
      this.landerGroup.add(bell);
    }

    const centerBell = new THREE.Mesh(new THREE.ConeGeometry(1.4, 3.2, 16, 1, true), engineMat);
    centerBell.position.set(0, fuselageY - 14.4, 0);
    centerBell.rotation.x = Math.PI;
    this.landerGroup.add(centerBell);

    // Dynamic Engine Flame & Particle Glow
    this.createEnginePlume(fuselageY - 16);

    this.scene.add(this.landerGroup);
  }

  createUmbilicalArm(yPos, targetX, targetZ, colorHex, labelText) {
    const armGroup = new THREE.Group();
    armGroup.position.set(0, yPos, 0);

    // Articulated Steel Truss Boom
    const boomGeom = new THREE.BoxGeometry(10.5, 0.8, 0.8);
    const boomMat = new THREE.MeshStandardMaterial({ color: 0x5e81ac, metalness: 0.85, roughness: 0.25 });
    const boom = new THREE.Mesh(boomGeom, boomMat);
    boom.position.set(-5.0, 0, 2.5);
    boom.rotation.y = -Math.PI / 7.2;
    armGroup.add(boom);

    // Flexible Cryogenic Umbilical Line
    const pipeGeom = new THREE.CylinderGeometry(0.18, 0.18, 10.2, 8);
    pipeGeom.rotateZ(Math.PI / 2);
    const pipeMat = new THREE.MeshBasicMaterial({ color: colorHex });
    const pipe = new THREE.Mesh(pipeGeom, pipeMat);
    pipe.position.set(-5.0, -0.4, 2.5);
    pipe.rotation.y = -Math.PI / 7.2;
    armGroup.add(pipe);

    // Quick-Disconnect Coupler Box
    const coupler = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.2, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xffb300, metalness: 0.9 })
    );
    coupler.position.set(-9.8, 0, 4.8);
    armGroup.add(coupler);

    return armGroup;
  }

  createEnginePlume(baseY) {
    // Engine Exhaust Cone
    const plumeGeom = new THREE.ConeGeometry(1.8, 7.5, 16, 1, true);
    const plumeMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const plumeMesh = new THREE.Mesh(plumeGeom, plumeMat);
    plumeMesh.position.y = baseY - 2.5;
    this.plumeGroup.add(plumeMesh);

    // Core Flame (Saffron-White Methalox Core)
    const coreGeom = new THREE.ConeGeometry(0.9, 5.0, 16, 1, true);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xff9933,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    coreMesh.position.y = baseY - 1.5;
    this.plumeGroup.add(coreMesh);

    // Engine Ground Reflection Light
    this.plumeLight = new THREE.PointLight(0x00f0ff, 1.8, 25);
    this.plumeLight.position.set(0, baseY, 0);
    this.plumeGroup.add(this.plumeLight);

    this.landerGroup.add(this.plumeGroup);
  }

  generateHeatShieldTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#14171d';
    ctx.fillRect(0, 0, 512, 512);

    // Hexagonal Heat Shield Tiles
    ctx.strokeStyle = '#222834';
    ctx.lineWidth = 1.5;

    const r = 16;
    const h = r * Math.sqrt(3);

    for (let y = 0; y < 512 + h; y += h) {
      for (let x = 0; x < 512 + r * 3; x += r * 3) {
        this.drawHexagon(ctx, x, y, r);
        this.drawHexagon(ctx, x + r * 1.5, y + h / 2, r);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 8);
    return texture;
  }

  drawHexagon(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hx = x + r * Math.cos(angle);
      const hy = y + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
  }

  generateISROLiveryTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Fuselage White background
    ctx.fillStyle = '#eef2f7';
    ctx.fillRect(0, 0, 1024, 1024);

    // Indian National Flag (Tiranga) Stripe
    ctx.fillStyle = '#FF9933';
    ctx.fillRect(100, 200, 300, 30);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(100, 230, 300, 30);
    ctx.fillStyle = '#138808';
    ctx.fillRect(100, 260, 300, 30);

    // Ashoka Chakra
    ctx.strokeStyle = '#000080';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(250, 245, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Text: ISRO / इसरो
    ctx.fillStyle = '#FF671F';
    ctx.font = 'bold 54px Orbitron, sans-serif';
    ctx.fillText('ISRO', 100, 380);

    ctx.fillStyle = '#0B132B';
    ctx.font = 'bold 36px Rajdhani, sans-serif';
    ctx.fillText('इसरो • CHANDRA STHAAN - I', 100, 440);

    ctx.fillStyle = '#4c566a';
    ctx.font = '28px JetBrains Mono, monospace';
    ctx.fillText('SUPER HEAVY REUSABLE LANDER', 100, 480);
    ctx.fillText('STAGE-1 METHALOX PROPULSION', 100, 520);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  update(delta, time) {
    // Subtle engine plume flicker
    if (this.plumeGroup) {
      const scale = 0.95 + Math.sin(time * 25) * 0.08;
      this.plumeGroup.scale.set(scale, scale * 1.1, scale);
    }

    if (this.plumeLight) {
      this.plumeLight.intensity = 1.6 + Math.sin(time * 30) * 0.4;
    }

    // Grid fins subtle aerodynamic micro-actuation
    this.gridFins.forEach((fin, i) => {
      fin.rotation.z = Math.sin(time * 2 + i) * 0.08;
    });

    // Tower aviation strobe warning beacon pulse
    this.towerStrobes.forEach((strobe) => {
      const flash = Math.sin(time * 4.0) > 0.3;
      strobe.material.opacity = flash ? 1.0 : 0.15;
    });

    // Hold-down clamp status LED pulse
    this.holdDownStatusLeds.forEach((led, i) => {
      const pulse = Math.sin(time * 3.0 + i) > 0.0;
      led.material.color.setHex(pulse ? 0x00e676 : 0xffb300);
    });
  }
}

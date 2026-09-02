/**
 * Indian National Flag (Tiranga) Factory
 * Features high-res canvas Ashoka Chakra, Apollo-style rigid mast,
 * and vertex displacement shader simulating solar wind ripple.
 */

import * as THREE from 'three';

export class FlagFactory {
  constructor(scene) {
    this.scene = scene;
    this.flagGroup = new THREE.Group();
    this.flagMesh = null;
    this.flagGeometry = null;

    this.init();
  }

  init() {
    this.flagGroup.position.set(-6, 0, 8);

    // 1. Vertical Flagpole Mast
    const mastGeom = new THREE.CylinderGeometry(0.08, 0.08, 6.5, 12);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0xd0d0d0, metalness: 0.9, roughness: 0.1 });
    const mast = new THREE.Mesh(mastGeom, mastMat);
    mast.position.y = 3.25;
    mast.castShadow = true;
    this.flagGroup.add(mast);

    // 2. Horizontal Gantry Arm (Apollo-style top crossbar to keep flag unfurled in vacuum)
    const armGeom = new THREE.CylinderGeometry(0.05, 0.05, 4.2, 8);
    armGeom.rotateZ(-Math.PI / 2);
    const arm = new THREE.Mesh(armGeom, mastMat);
    arm.position.set(2.1, 6.4, 0);
    this.flagGroup.add(arm);

    // 3. Golden Finial Cap on top of Mast
    const finial = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xffb300, metalness: 0.9, roughness: 0.2 })
    );
    finial.position.y = 6.5;
    this.flagGroup.add(finial);

    // 4. Cloth Flag with Ashoka Chakra Canvas Texture
    const flagTexture = this.generateTirangaTexture();
    
    const width = 4.0;
    const height = 2.6;
    this.flagGeometry = new THREE.PlaneGeometry(width, height, 24, 16);
    this.flagGeometry.translate(width / 2, -height / 2, 0); // Origin at top-left corner on mast

    const flagMaterial = new THREE.MeshStandardMaterial({
      map: flagTexture,
      side: THREE.DoubleSide,
      roughness: 0.6,
      metalness: 0.1,
    });

    this.flagMesh = new THREE.Mesh(this.flagGeometry, flagMaterial);
    this.flagMesh.position.set(0, 6.4, 0);
    this.flagMesh.castShadow = true;
    this.flagGroup.add(this.flagMesh);

    this.scene.add(this.flagGroup);
  }

  generateTirangaTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    // Saffron Band (Top)
    ctx.fillStyle = '#FF9933';
    ctx.fillRect(0, 0, 900, 200);

    // White Band (Middle)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 200, 900, 200);

    // Green Band (Bottom)
    ctx.fillStyle = '#138808';
    ctx.fillRect(0, 400, 900, 200);

    // Ashoka Chakra (24 Spokes in Navy Blue)
    const cx = 450;
    const cy = 300;
    const radius = 75;

    ctx.strokeStyle = '#000080';
    ctx.lineWidth = 5;

    // Outer Circle
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Hub
    ctx.fillStyle = '#000080';
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();

    // 24 Spokes
    for (let i = 0; i < 24; i++) {
      const angle = (i * Math.PI) / 12;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  update(delta, time) {
    // Microgravity / Solar Wind Cloth Wave Simulation
    if (this.flagGeometry) {
      const pos = this.flagGeometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        // Fixed along top horizontal edge and mast, waving outward
        const waveX = (x / 4.0);
        const z = Math.sin(time * 3.5 + x * 2.0) * 0.18 * waveX + Math.cos(time * 2.0 + y * 1.5) * 0.08 * waveX;
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
      this.flagGeometry.computeVertexNormals();
    }
  }
}

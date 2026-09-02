/**
 * Central Three.js Scene Manager
 * Coordinates rendering pipeline, lighting, object factories, camera controller, and markers.
 * Includes WebGL feature detection, context-loss handling, and frame-rate independent updates.
 */

import * as THREE from 'three';
import { LightingManager } from './Lighting.js';
import { CameraController } from './CameraController.js';
import { TerrainFactory } from '../factories/TerrainFactory.js';
import { LanderFactory } from '../factories/LanderFactory.js';
import { HabitatFactory } from '../factories/HabitatFactory.js';
import { PowerFactory } from '../factories/PowerFactory.js';
import { ISRUFactory } from '../factories/ISRUFactory.js';
import { RoverFactory } from '../factories/RoverFactory.js';
import { CommsFactory } from '../factories/CommsFactory.js';
import { FlagFactory } from '../factories/FlagFactory.js';
import { CelestialFactory } from '../factories/CelestialFactory.js';
import { MarkerFactory } from '../factories/MarkerFactory.js';
import { store } from '../state/store.js';
import { notify } from '../ui/NotificationHUD.js';

export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

export class SceneManager {
  constructor(containerEl, markerContainerEl) {
    this.container = containerEl;
    this.markerContainer = markerContainerEl;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();
    this.animationFrameId = null;
    this.isContextLost = false;

    this.lighting = null;
    this.cameraController = null;
    this.markerFactory = null;

    this.factories = [];
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.init();
  }

  init() {
    // 1. WebGL Feature Detection (DEF-01)
    if (!isWebGLAvailable()) {
      if (this.container) {
        this.container.innerHTML = `
          <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                      background:rgba(10,18,32,0.92);border:1px solid #ff9933;padding:24px 32px;
                      border-radius:8px;text-align:center;color:#ffffff;font-family:sans-serif;
                      box-shadow:0 0 24px rgba(255,153,51,0.3);z-index:999;">
            <h2 style="color:#ff9933;margin-bottom:12px;">WebGL Acceleration Required</h2>
            <p style="font-size:14px;color:#cbd5e1;line-height:1.5;">
              Hardware acceleration is disabled or unavailable in your browser.<br>
              Please enable WebGL in your browser settings to run the 3D Digital Twin.
            </p>
          </div>
        `;
      }
      console.error('Fatal: WebGL is not available on this platform.');
      return;
    }

    // 2. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x03070d);
    this.scene.fog = new THREE.FogExp2(0x03070d, 0.0003); // Ultra-light space depth fog

    // 3. Camera
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1200);
    this.camera.position.set(25, 60, 135);

    // 4. WebGL Renderer with performance limits (DEF-05)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio to 2
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // 5. Context Loss / Restored Handlers (DEF-01)
    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.isContextLost = true;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      notify('GPU WebGL Context Lost. Pausing 3D render loop.');
      console.warn('WebGL context lost.');
    }, false);

    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      this.isContextLost = false;
      notify('WebGL Context Restored. Re-initiating scene.');
      console.log('WebGL context restored.');
      this.init();
    }, false);

    // 6. Lighting & Camera Controller
    this.lighting = new LightingManager(this.scene);
    this.cameraController = new CameraController(this.camera, this.renderer.domElement, this.scene);

    // 7. Object Factories
    const terrain = new TerrainFactory(this.scene);
    const lander = new LanderFactory(this.scene);
    const habitat = new HabitatFactory(this.scene);
    const power = new PowerFactory(this.scene);
    const isru = new ISRUFactory(this.scene);
    const rovers = new RoverFactory(this.scene);
    const comms = new CommsFactory(this.scene);
    const flag = new FlagFactory(this.scene);
    const celestial = new CelestialFactory(this.scene);

    this.factories = [
      terrain,
      lander,
      habitat,
      power,
      isru,
      rovers,
      comms,
      flag,
      celestial
    ];

    // Connect rover group to camera controller for POV mode
    this.cameraController.setRoverTarget(rovers.getGroup());

    // 8. 3D World Markers
    this.markerFactory = new MarkerFactory(this.camera, this.markerContainer);

    // 9. Event Listeners with Debounced Resize (DEF-11)
    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.onWindowResize(), 100);
    });
    this.renderer.domElement.addEventListener('click', (e) => this.onCanvasClick(e));

    // 10. Start Animation Loop (DEF-03, DEF-13)
    this.startAnimation();
  }

  onCanvasClick(e) {
    if (!this.renderer || !this.camera) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      let hit = intersects[0].object;
      while (hit.parent && hit.parent !== this.scene) {
        if (hit.parent === this.factories[1]?.landerGroup) {
          store.set('activeSubsystem', 'lander');
          break;
        } else if (hit.parent === this.factories[2]?.habitatGroup) {
          store.set('activeSubsystem', 'habitat');
          break;
        } else if (hit.parent === this.factories[3]?.powerGroup) {
          store.set('activeSubsystem', 'power');
          break;
        } else if (hit.parent === this.factories[4]?.isruGroup) {
          store.set('activeSubsystem', 'isru');
          break;
        } else if (hit.parent === this.factories[5]?.roverGroup) {
          store.set('activeSubsystem', 'rovers');
          break;
        } else if (hit.parent === this.factories[6]?.commsGroup) {
          store.set('activeSubsystem', 'comms');
          break;
        }
        hit = hit.parent;
      }
    }
  }

  onWindowResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Adapt shadow map resolution to screen size (DEF-05)
    if (this.lighting && this.lighting.sunLight) {
      const shadowRes = width < 768 ? 1024 : 2048;
      if (this.lighting.sunLight.shadow.mapSize.width !== shadowRes) {
        this.lighting.sunLight.shadow.mapSize.width = shadowRes;
        this.lighting.sunLight.shadow.mapSize.height = shadowRes;
        if (this.lighting.sunLight.shadow.map) {
          this.lighting.sunLight.shadow.map.dispose();
          this.lighting.sunLight.shadow.map = null;
        }
      }
    }
  }

  startAnimation() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const loop = () => {
      this.animationFrameId = requestAnimationFrame(loop);
      this.renderFrame();
    };
    loop();
  }

  renderFrame() {
    if (this.isContextLost || !this.renderer || !this.scene || !this.camera) return;

    // Delta time calculation (DEF-03)
    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // 1. Update Camera
    if (this.cameraController) {
      this.cameraController.update(delta, time);
    }

    // 2. Update Lighting
    if (this.lighting) {
      this.lighting.update(delta, time);
    }

    // 3. Update All 3D Object Factories
    for (const factory of this.factories) {
      if (factory && typeof factory.update === 'function') {
        factory.update(delta, time);
      }
    }

    // 4. Update 3D Markers
    if (this.markerFactory) {
      this.markerFactory.update(delta, time);
    }

    // 5. Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}

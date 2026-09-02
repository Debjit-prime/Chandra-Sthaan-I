/**
 * Dynamic Camera Controller
 * Supports Smooth Parabolic Arc Fly-To Transitions, OrbitControls,
 * Cinematic Aerial FPV Drone Tour, Tactical Top-Down Nadir Drone Survey, and Rover Chase Cam.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as TWEEN from '@tweenjs/tween.js';
import { store } from '../state/store.js';
import { SUBSYSTEMS } from '../data/missionData.js';
import { audio } from './AudioController.js';

export class CameraController {
  constructor(camera, domElement, scene) {
    this.camera = camera;
    this.domElement = domElement;
    this.scene = scene;
    
    this.controls = null;
    this.currentTween = null;
    this.isTransitioning = false;

    // Cinematic FPV Drone Tour Engine
    this.tourActive = false;
    this.droneProgress = 0;
    this.droneSpeed = 0.013;
    this.droneFlightPath = null;
    this.droneTargetPath = null;
    this.droneSegments = [];
    this.currentSegmentId = null;

    // Tactical Top-Down Nadir Drone Engine
    this.topDownActive = false;
    this.topDownProgress = 0;
    this.topDownSpeed = 0.010;
    this.topDownFlightPath = null;
    this.topDownSegments = [];

    // Tactical Drone Viewfinder HUD Elements
    this.droneHudEl = document.getElementById('drone-hud-overlay');
    this.altValEl = document.getElementById('drone-alt-val');
    this.spdValEl = document.getElementById('drone-spd-val');
    this.gimbalValEl = document.getElementById('drone-gimbal-val');
    this.hdgValEl = document.getElementById('drone-hdg-val');
    this.horizonEl = document.getElementById('drone-horizon');

    this.roverObject = null;

    this.init();
    this.initDroneFlightCurves();
    this.bindEvents();
  }

  init() {
    this.controls = new OrbitControls(this.camera, this.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.screenSpacePanning = false;
    
    // DEF-12: Constrain camera to prevent clipping below lunar surface or into hulls
    this.controls.minDistance = 12;
    this.controls.maxDistance = 350;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.03;
    this.controls.target.set(0, 6, 8);

    // Initial camera placement
    this.camera.position.set(0, 92, 180);
    this.controls.update();

    // User manual interaction switches mode back to orbit
    this.controls.addEventListener('start', () => {
      const mode = store.get('cameraMode');
      if (mode === 'tour' || mode === 'topdown') {
        this.stopDroneTour();
        this.stopTopDownDrone();
        store.set('cameraMode', 'orbit');
      }
    });
  }

  initDroneFlightCurves() {
    // 1. Cinematic FPV Drone Flight Spline
    this.droneFlightPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 68, 145),     // 0: High orbital entry & polar base overview
      new THREE.Vector3(32, 42, 105),    // 1: Descending approach towards landing pad
      new THREE.Vector3(56, 26, 52),     // 2: Low-altitude banking sweep around Chandra Sthaan-I Lander
      new THREE.Vector3(45, 18, 18),     // 3: Skimming past landing pad tarmac & blast ring
      new THREE.Vector3(18, 18, 52),     // 4: Swoop past Comms dish & Earth laser transceiver
      new THREE.Vector3(-10, 16, 32),    // 5: Low flyover across Tiranga LED corridor & Main Hab Dome
      new THREE.Vector3(-36, 14, 16),    // 6: Close-up inspection of Hydroponic Green Dome
      new THREE.Vector3(-55, 34, -18),   // 7: Climbing up crater rim ridge towards Solar Towers
      new THREE.Vector3(-46, 40, -48),   // 8: Cresting high above Eternal Light ridge & Stirling Nuclear Core
      new THREE.Vector3(8, 26, -46),     // 9: Gliding down across cold-trap basin towards ISRU plant
      new THREE.Vector3(38, 18, -30),    // 10: Banking around cryogenic LOX/LH2 spheroids & drill derrick
      new THREE.Vector3(10, 12, -8),     // 11: Low chase along Pragyan-II rover patrol route
      new THREE.Vector3(-18, 30, 72),    // 12: Climbing back up into wide panoramic orbit
    ], true, 'catmullrom', 0.5);

    // 2. FPV LookAt Target Spline
    this.droneTargetPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 5, 0),        // 0: Base center
      new THREE.Vector3(25, 10, 20),     // 1: Tracking towards lander sector
      new THREE.Vector3(40, 16, 30),     // 2: Chandra Sthaan-I Lander hull & engines
      new THREE.Vector3(38, 10, 28),     // 3: Landing pad Alpha
      new THREE.Vector3(0, 12, 45),      // 4: Deep Space Comms Dish & Earth beam
      new THREE.Vector3(-20, 8, 10),     // 5: Habitation Complex & Tiranga Tunnel
      new THREE.Vector3(-30, 8, 5),      // 6: Hydroponic Agricultural Dome
      new THREE.Vector3(-45, 20, -35),   // 7: Rim Solar Array Towers
      new THREE.Vector3(-45, 12, -35),   // 8: Stirling Nuclear Reactor
      new THREE.Vector3(25, 8, -25),     // 9: ISRU Plant & Sublimation Drill
      new THREE.Vector3(28, 8, -20),     // 10: Cryogenic Propellant Tanks
      new THREE.Vector3(-25, 4, -15),    // 11: Pragyan-II Surface Rover
      new THREE.Vector3(0, 5, 0),        // 12: Base central hub
    ], true, 'catmullrom', 0.5);

    this.droneSegments = [
      { start: 0.00, end: 0.12, id: 'overview', title: 'SHACKLETON CRATER OVERVIEW', desc: 'Autonomous high-altitude survey of permanent lunar infrastructure.' },
      { start: 0.12, end: 0.28, id: 'lander', title: 'CHANDRA STHAAN-I HEAVY LANDER', desc: 'Scanning thermal protection tiles, methalox engine cluster, and Pad Alpha.' },
      { start: 0.28, end: 0.40, id: 'comms', title: 'DEEP SPACE LASER RELAY', desc: 'Tracking 12m parabolic dish and active optical laser link to Bengaluru.' },
      { start: 0.40, end: 0.56, id: 'habitat', title: 'PRESSURIZED HABITAT BIODOMES', desc: 'Inspecting geodesic cupolas and Tiranga-illuminated life support tunnels.' },
      { start: 0.56, end: 0.72, id: 'power', title: 'SOLAR RIM TOWERS & NUCLEAR CORE', desc: 'Surveying sun-tracking vertical arrays and Kilopower Stirling reactor.' },
      { start: 0.72, end: 0.86, id: 'isru', title: 'ISRU WATER ICE & CRYOGENIC PLANT', desc: 'Monitoring deep core sublimation drill and LOX/LH2 propellant spheres.' },
      { start: 0.86, end: 1.00, id: 'rovers', title: 'PRAGYAN-II ROVER PATROL', desc: 'Chasing autonomous 6-wheel rover executing cold-trap regolith sampling.' },
    ];

    // 3. Tactical Top-Down Nadir Drone Flight Spline
    this.topDownFlightPath = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 105, 0),       // 0: Central base nadir overview
      new THREE.Vector3(38, 98, 28),      // 1: Direct vertical overhead of Pad Alpha & Lander
      new THREE.Vector3(12, 95, 42),      // 2: Overhead Comms Relay Array
      new THREE.Vector3(-18, 96, 12),     // 3: Overhead Geodesic Biodomes & Hub
      new THREE.Vector3(-34, 94, 8),      // 4: Overhead Hydroponic Agriculture
      new THREE.Vector3(-46, 115, -36),   // 5: High Apex over Solar Towers & Stirling Reactor
      new THREE.Vector3(-5, 98, -32),     // 6: Overhead Crater Floor Transition
      new THREE.Vector3(26, 95, -24),     // 7: Overhead ISRU Ice Extraction Plant
      new THREE.Vector3(-15, 92, -12),    // 8: Overhead Pragyan-II Rover Patrol Path
    ], true, 'catmullrom', 0.5);

    this.topDownSegments = [
      { start: 0.00, end: 0.15, id: 'overview', title: 'TOP-DOWN NADIR RECONNAISSANCE', desc: 'High-altitude tactical overhead scan of Shackleton settlement grid.' },
      { start: 0.15, end: 0.30, id: 'lander', title: 'VERTICAL LANDER PAD ALPHA INSPECTION', desc: 'Overhead telemetry calibration of landing pad blast ring and lander hull.' },
      { start: 0.30, end: 0.42, id: 'comms', title: 'OVERHEAD LASER OPTICAL RELAY', desc: 'Vertical alignment check for deep space tracking antenna gantry.' },
      { start: 0.42, end: 0.58, id: 'habitat', title: 'HABITAT BIODOME NETWORK SCAN', desc: 'Top-down pressure integrity check of geodesic domes & transit tunnels.' },
      { start: 0.58, end: 0.74, id: 'power', title: 'PEAK OF ETERNAL LIGHT SOLAR GRID', desc: 'High elevation nadir thermal scan of solar arrays and Stirling radiators.' },
      { start: 0.74, end: 0.88, id: 'isru', title: 'ISRU CRYOGENIC PROPULSION DEPOT', desc: 'Overhead optical inspection of vacuum-jacketed LOX/LH2 spheroids.' },
      { start: 0.88, end: 1.00, id: 'rovers', title: 'SURFACE ROVER FLEET TRACKING', desc: 'Satellite-grade top-down tracking of autonomous exploration rovers.' },
    ];
  }

  /**
   * Cinematic Parabolic Arc Fly-To Transition
   */
  flyTo(targetPosArr, targetLookAtArr, duration = 1600, onComplete = null) {
    if (!targetPosArr || !targetLookAtArr) return;

    if (this.currentTween) {
      this.currentTween.stop();
      this.currentTween = null;
    }

    this.isTransitioning = true;
    this.controls.enabled = false;
    audio.playFlyToWhoosh();

    const startPos = this.camera.position.clone();
    const targetPos = new THREE.Vector3(...targetPosArr);

    const startTarget = this.controls.target.clone();
    const targetTarget = new THREE.Vector3(...targetLookAtArr);

    const startRoll = this.camera.rotation.z;

    const travelDist = startPos.distanceTo(targetPos);
    const arcLift = Math.min(32, Math.max(4, travelDist * 0.22));
    const finalDuration = Math.min(1900, Math.max(1200, travelDist * 8 + 600));

    const anim = { t: 0 };

    this.currentTween = new TWEEN.Tween(anim)
      .to({ t: 1 }, finalDuration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        const progress = anim.t;

        const currentX = THREE.MathUtils.lerp(startPos.x, targetPos.x, progress);
        const currentZ = THREE.MathUtils.lerp(startPos.z, targetPos.z, progress);
        const baseHeight = THREE.MathUtils.lerp(startPos.y, targetPos.y, progress);
        const arcHeight = Math.sin(progress * Math.PI) * arcLift;
        this.camera.position.set(currentX, baseHeight + arcHeight, currentZ);

        const currentTgtX = THREE.MathUtils.lerp(startTarget.x, targetTarget.x, progress);
        const currentTgtY = THREE.MathUtils.lerp(startTarget.y, targetTarget.y, progress);
        const currentTgtZ = THREE.MathUtils.lerp(startTarget.z, targetTarget.z, progress);
        this.controls.target.set(currentTgtX, currentTgtY, currentTgtZ);

        this.camera.lookAt(this.controls.target);
        this.camera.rotation.z = THREE.MathUtils.lerp(startRoll, 0, progress);
      })
      .onComplete(() => {
        this.camera.position.copy(targetPos);
        this.controls.target.copy(targetTarget);
        this.camera.lookAt(this.controls.target);
        this.camera.rotation.z = 0;

        this.controls.enabled = true;
        this.controls.update();
        this.isTransitioning = false;
        this.currentTween = null;

        if (onComplete) onComplete();
      });

    this.currentTween.start();
  }

  focusSubsystem(subsystemId) {
    const data = SUBSYSTEMS[subsystemId] || SUBSYSTEMS.overview;
    if (!data || !data.camera) return;
    this.flyTo(data.camera.position, data.camera.target, data.camera.duration || 1600);
  }

  // -------------------------------------------------------------
  // FPV Drone Tour (Panoramic with banking)
  // -------------------------------------------------------------
  startDroneTour() {
    this.stopTopDownDrone();
    this.tourActive = true;
    this.controls.enabled = false;

    if (this.droneHudEl) this.droneHudEl.classList.remove('hidden');
    const banner = document.getElementById('tour-banner');
    if (banner) banner.classList.remove('hidden');

    const currentCamPos = this.camera.position;
    let closestT = 0;
    let minDist = Infinity;
    for (let t = 0; t <= 1; t += 0.05) {
      const pt = this.droneFlightPath.getPointAt(t);
      const d = currentCamPos.distanceTo(pt);
      if (d < minDist) {
        minDist = d;
        closestT = t;
      }
    }

    this.droneProgress = closestT;
    const startPt = this.droneFlightPath.getPointAt(this.droneProgress);
    const startTgt = this.droneTargetPath.getPointAt(this.droneProgress);

    this.flyTo([startPt.x, startPt.y, startPt.z], [startTgt.x, startTgt.y, startTgt.z], 1800, () => {
      this.isTransitioning = false;
      this.controls.enabled = false;
    });
  }

  stopDroneTour() {
    this.tourActive = false;
    this.controls.enabled = true;
    this.camera.rotation.z = 0;

    if (!this.topDownActive && this.droneHudEl) {
      this.droneHudEl.classList.add('hidden');
    }
    const banner = document.getElementById('tour-banner');
    if (banner) banner.classList.add('hidden');
  }

  // -------------------------------------------------------------
  // Top-Down Nadir Drone Mode (High-Altitude Vertical Survey)
  // -------------------------------------------------------------
  startTopDownDrone() {
    this.stopDroneTour();
    this.topDownActive = true;
    this.controls.enabled = false;

    if (this.droneHudEl) this.droneHudEl.classList.remove('hidden');
    const banner = document.getElementById('tour-banner');
    if (banner) banner.classList.remove('hidden');

    const currentCamPos = this.camera.position;
    let closestT = 0;
    let minDist = Infinity;
    for (let t = 0; t <= 1; t += 0.05) {
      const pt = this.topDownFlightPath.getPointAt(t);
      const d = currentCamPos.distanceTo(pt);
      if (d < minDist) {
        minDist = d;
        closestT = t;
      }
    }

    this.topDownProgress = closestT;
    const startPt = this.topDownFlightPath.getPointAt(this.topDownProgress);
    const startLook = [startPt.x, 0, startPt.z - 0.01];

    this.flyTo([startPt.x, startPt.y, startPt.z], startLook, 1800, () => {
      this.isTransitioning = false;
      this.controls.enabled = false;
    });
  }

  stopTopDownDrone() {
    this.topDownActive = false;
    this.controls.enabled = true;
    this.camera.rotation.z = 0;

    if (!this.tourActive && this.droneHudEl) {
      this.droneHudEl.classList.add('hidden');
    }
    const banner = document.getElementById('tour-banner');
    if (banner) banner.classList.add('hidden');
  }

  updateDroneFlight(delta, time) {
    if (!this.tourActive || this.isTransitioning || !this.droneFlightPath || !this.droneTargetPath) return;

    this.droneProgress = (this.droneProgress + delta * this.droneSpeed) % 1;

    const camPos = this.droneFlightPath.getPointAt(this.droneProgress);
    const lookTarget = this.droneTargetPath.getPointAt(this.droneProgress);

    // Micro-thruster hover bobbing
    camPos.y += Math.sin(time * 1.6) * 0.35;

    this.camera.position.lerp(camPos, 0.12);
    this.controls.target.lerp(lookTarget, 0.12);
    this.camera.lookAt(this.controls.target);

    // Dynamic banking
    const tangent = this.droneFlightPath.getTangentAt(this.droneProgress);
    const nextTangent = this.droneFlightPath.getTangentAt((this.droneProgress + 0.01) % 1);
    const turnCurvature = (nextTangent.x * tangent.z - nextTangent.z * tangent.x);
    const targetRoll = THREE.MathUtils.clamp(turnCurvature * -8.0, -0.12, 0.12);
    this.camera.rotation.z = THREE.MathUtils.lerp(this.camera.rotation.z, targetRoll, 0.08);

    // Update Tactical Telemetry UI
    this.updateTacticalHUD(camPos.y, 42.8 + Math.sin(time) * 3, -18.5, tangent);

    // Update Banner
    const segment = this.droneSegments.find(s => this.droneProgress >= s.start && this.droneProgress < s.end) || this.droneSegments[0];
    if (segment && segment.id !== this.currentSegmentId) {
      this.currentSegmentId = segment.id;
      const titleEl = document.getElementById('tour-title');
      const descEl = document.getElementById('tour-desc');
      if (titleEl) titleEl.textContent = segment.title;
      if (descEl) descEl.textContent = segment.desc;

      if (store.get('activeSubsystem') !== segment.id) {
        store.set('activeSubsystem', segment.id);
      }
    }
  }

  updateTopDownFlight(delta, time) {
    if (!this.topDownActive || this.isTransitioning || !this.topDownFlightPath) return;

    this.topDownProgress = (this.topDownProgress + delta * this.topDownSpeed) % 1;

    const camPos = this.topDownFlightPath.getPointAt(this.topDownProgress);
    
    // Slight altitude breathing
    camPos.y += Math.sin(time * 1.2) * 0.4;

    // Look straight downward (nadir angle: -88° to -90°)
    const lookTarget = new THREE.Vector3(camPos.x, 0, camPos.z - 0.01);

    this.camera.position.lerp(camPos, 0.10);
    this.controls.target.lerp(lookTarget, 0.10);
    this.camera.lookAt(this.controls.target);

    const tangent = this.topDownFlightPath.getTangentAt(this.topDownProgress);
    
    // Update Tactical Telemetry UI
    this.updateTacticalHUD(camPos.y, 34.0 + Math.sin(time) * 2, -88.5, tangent);

    // Update Banner
    const segment = this.topDownSegments.find(s => this.topDownProgress >= s.start && this.topDownProgress < s.end) || this.topDownSegments[0];
    if (segment && segment.id !== this.currentSegmentId) {
      this.currentSegmentId = segment.id;
      const titleEl = document.getElementById('tour-title');
      const descEl = document.getElementById('tour-desc');
      if (titleEl) titleEl.textContent = segment.title;
      if (descEl) descEl.textContent = segment.desc;

      if (store.get('activeSubsystem') !== segment.id) {
        store.set('activeSubsystem', segment.id);
      }
    }
  }

  updateTacticalHUD(altitude, speed, pitchDeg, tangent) {
    if (this.altValEl) this.altValEl.textContent = `${altitude.toFixed(1)} M`;
    if (this.spdValEl) this.spdValEl.textContent = `${speed.toFixed(1)} KM/H`;
    if (this.gimbalValEl) this.gimbalValEl.textContent = `${pitchDeg.toFixed(1)}° NADIR`;

    if (this.hdgValEl && tangent) {
      let deg = Math.round((Math.atan2(tangent.x, tangent.z) * 180 / Math.PI + 360) % 360);
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const dirStr = dirs[Math.floor((deg + 22.5) / 45) % 8];
      this.hdgValEl.textContent = `${deg}° ${dirStr}`;
    }
  }

  setRoverTarget(roverGroup) {
    this.roverObject = roverGroup;
  }

  update(delta, time) {
    TWEEN.update();

    const mode = store.get('cameraMode');
    if (mode === 'tour') {
      this.updateDroneFlight(delta, time);
    } else if (mode === 'topdown') {
      this.updateTopDownFlight(delta, time);
    } else if (mode === 'rover' && this.roverObject) {
      const roverPos = this.roverObject.position;
      const targetPos = new THREE.Vector3(
        roverPos.x - Math.sin(this.roverObject.rotation.y) * 14,
        roverPos.y + 6,
        roverPos.z - Math.cos(this.roverObject.rotation.y) * 14
      );

      this.camera.position.lerp(targetPos, 0.05);
      this.controls.target.lerp(new THREE.Vector3(roverPos.x, roverPos.y + 2, roverPos.z), 0.08);
      this.controls.update();
    } else if (this.controls.enabled && !this.isTransitioning) {
      this.controls.update();
    }
  }

  bindEvents() {
    store.on('activeSubsystem', (subId) => {
      const mode = store.get('cameraMode');
      if (mode !== 'tour' && mode !== 'topdown') {
        this.focusSubsystem(subId);
      }
    });

    store.on('cameraMode', (mode) => {
      if (mode === 'tour') {
        this.startDroneTour();
      } else if (mode === 'topdown') {
        this.startTopDownDrone();
      } else {
        this.stopDroneTour();
        this.stopTopDownDrone();
      }

      if (mode === 'orbit') {
        this.controls.enabled = true;
      }
    });
  }
}

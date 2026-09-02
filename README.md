# 🇮🇳 ISRO Chandra Sthaan-I — Lunar Base 3D Digital Twin

A modular, high-fidelity 3D WebGL Digital Twin and Mission Control HUD of ISRO's permanent lunar settlement at **Shackleton Crater, Lunar South Pole (89.9° S, 0.0° E)**.

Built with **Three.js (ES Modules)**, **Vite**, **@tweenjs/tween.js**, and procedural Web Audio API synthesis.

---

## 🛰 Features & Architecture

### 1. Modular Subsystems & 3D Factories
- **Procedural Shackleton Crater (`TerrainFactory.js`)**: Multi-octave displaced topography, micro-craters, sintered regolith landing pad Alpha, perimeter beacons, and rock scatter.
- **Chandra Sthaan-I Heavy Lander (`LanderFactory.js`)**: Reusable methalox lander with procedural hexagonal thermal protection tiles (PICA-X), high-res canvas ISRO livery, actuated steerable grid fins, shock-absorbing landing struts, and dynamic throttled engine exhaust plumes.
- **Pressurized Habitat Complex (`HabitatFactory.js`)**: Multi-dome geodesic biodomes with translucent hexagonal cupolas, glowing internal biolabs, and interconnecting corridors with animated Tiranga (Saffron-White-Green) LED guidance conduits.
- **Solar Rim Towers & Nuclear Stirling Core (`PowerFactory.js`)**: Sun-tracking vertical photovoltaic towers on the crater peaks of eternal light, coupled with a Stirling reactor with glowing thermal radiator fins.
- **ISRU Water & Propellant Plant (`ISRUFactory.js`)**: Sublimation drill rig, microwave volatilization chamber, vacuum-jacketed LOX/LH2 cryogenic spheroids, and propellant pipelines.
- **Pragyan-II Heavy Rover Fleet (`RoverFactory.js`)**: Autonomous 6-wheel rocker-bogie rovers with mast-mounted navcams, forward LED searchlights, and real-time looped patrol navigation.
- **Deep Space Comms & Earth Laser Relay (`CommsFactory.js`)**: 12-meter steerable parabolic antenna and optical laser beam linking to ISRO ISTRAC Bengaluru.
- **Indian National Flag (`FlagFactory.js`)**: High-definition Ashoka Chakra on an Apollo-style mast with a vertex wave shader simulating solar wind oscillations.
- **Celestial Sphere (`CelestialFactory.js`)**: Photorealistic rotating Earth with atmospheric glow and multi-magnitude twinkling starfield.

### 2. Interactive Mission Control HUD & Bidirectional Sync
- **Bidirectional 3D Interaction**: Click any subsystem in the left HUD or click any 3D structure/holographic pin in the viewport to initiate a smooth cubic camera fly-to transition and display deep-dive telemetry.
- **Real-Time Telemetry Engine (`telemetry.js`)**: Live-simulated metrics for power generation (MW), ECLSS O₂ purity (%), water reserves (L), comms latency (s), and dynamic sparkline graphs.
- **Camera Protocols**: Orbit Mode, Guided Drone Inspection Tour, and Rover POV Chase Cam.
- **Solar Terminator Slider**: Scrub lunar sun azimuth from 0° to 360° to observe polar rim shadow casting.
- **Diagnostic X-Ray Mode**: Emissive wireframe view of underground cryogenic pipelines and superconducting power grid.
- **Procedural Audio Synthesizer (`AudioController.js`)**: Ambient lunar habitat drone, UI confirmation chirps, and fly-to swoosh effects using standard Web Audio API (zero external sound files needed).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation & Development Server
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Directory Structure
```
├── index.html                   # HTML entrypoint & aerospace HUD layout
├── vite.config.js               # Vite build & chunking configuration
├── package.json                 # Dependencies (Three.js, Tween.js, Vite)
└── src/
    ├── main.js                  # Application bootstrap & coordinator
    ├── data/
    │   └── missionData.js       # Subsystem specifications, cameras, logs
    ├── state/
    │   ├── store.js             # Reactive event store
    │   └── telemetry.js         # Real-time sensor & telemetry simulator
    ├── core/
    │   ├── SceneManager.js      # Three.js render pipeline & animation loop
    │   ├── CameraController.js  # Tween fly-to, OrbitControls, Drone Tour, Rover POV
    │   ├── Lighting.js          # Polar sunlight, Earthshine, and beacons
    │   └── AudioController.js   # Procedural Web Audio API sound generator
    ├── factories/
    │   ├── TerrainFactory.js    # Procedural terrain & landing pad
    │   ├── LanderFactory.js     # Chandra Sthaan-I heavy lander
    │   ├── HabitatFactory.js    # Pressurized biodomes & Tiranga tunnels
    │   ├── PowerFactory.js      # Sun-tracking solar towers & Stirling reactor
    │   ├── ISRUFactory.js       # Ice sublimation drill & cryogenic tanks
    │   ├── RoverFactory.js      # Pragyan-II rovers & patrol path
    │   ├── CommsFactory.js      # Deep space dish & Earth laser link
    │   ├── FlagFactory.js       # Tiranga flag with Ashoka Chakra & wave shader
    │   ├── CelestialFactory.js  # Earth globe & twinkling starfield
    │   └── MarkerFactory.js     # 3D interactive holographic pins
    ├── ui/
    │   ├── NavigationHUD.js     # Left subsystem navigation menu
    │   ├── TelemetryPanel.js    # Right telemetry inspector & sparklines
    │   ├── TimeHeader.js        # Mission clock, IST clock, lunar phase
    │   ├── ControlBar.js        # Bottom toolbar & solar slider
    │   └── NotificationHUD.js   # Toast alert deck
    └── styles/
        ├── main.css             # Tiranga color variables & resets
        ├── hud.css              # Glassmorphic aerospace styling
        └── animations.css       # Glows, pulses, and transitions
```

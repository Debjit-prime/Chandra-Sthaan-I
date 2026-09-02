/**
 * Mission Data & Subsystem Specifications for ISRO Chandra Sthaan-I
 * Shackleton Crater Lunar Settlement (South Pole)
 * High-precision cinematic camera framing and world coordinates for all subsystems.
 */

export const MISSION_INFO = {
  name: "CHANDRA STHAAN - I",
  hindiName: "चंद्र स्थान - १",
  agency: "ISRO / भारतीय अंतरिक्ष अनुसंधान संगठन",
  site: "Shackleton Crater Rim, Lunar South Pole",
  coordinates: "89.9° S, 0.0° E",
  elevation: "-4,200 m (Basin) / +1,100 m (Rim Peak)",
  currentPhase: "Phase 3: Autonomous Base Expansion & In-Situ Life Support",
  crewComplement: 8,
  missionStart: "2028-11-14",
  relayTarget: "ISTRAC Deep Space Network, Bengaluru, India"
};

export const SUBSYSTEMS = {
  overview: {
    id: "overview",
    name: "Base Overview",
    hindiName: "आधार अवलोकन",
    category: "COMMAND & TELEMETRY",
    status: "NOMINAL",
    statusClass: "status-nominal",
    icon: "⬡",
    camera: {
      position: [0, 92, 180],
      target: [0, 6, 8],
      duration: 1800
    },
    pinPosition: [0, 24, 0],
    summary: `Chandra Sthaan-I is ISRO's first permanent crewed lunar surface settlement situated along the high rim of Shackleton Crater at the Lunar South Pole. This strategic location exploits the 'Peaks of Eternal Light' for near-constant solar energy while accessing vast water-ice reservoirs in the permanently shadowed craters.`,
    specs: [
      { label: "Total Settlement Area", value: "14,800", unit: "m²" },
      { label: "Primary Grid Generation", value: "3.20", unit: "MW" },
      { label: "ECLSS Closed-Loop Index", value: "98.7", unit: "%" },
      { label: "Water Ice Harvest Yield", value: "1,028", unit: "L / day" },
      { label: "Active Surface Rovers", value: "4 Units", unit: "Pragyan-II" },
      { label: "Telemetry Latency to ISTRAC", value: "1.28", unit: "seconds" }
    ],
    telemetryKeys: ["powerTotal", "eclssO2", "waterReserves", "basePressure", "internalTemp"],
    logs: [
      { time: "T-00:04:12", text: "Autonomous diurnal solar array calibration complete." },
      { time: "T-00:18:45", text: "Cryogenic LOX liquefaction reached 99.8% purity." },
      { time: "T-01:02:10", text: "Pragyan-II Rover Alpha returned from Rim Sector 4 sample run." }
    ]
  },

  lander: {
    id: "lander",
    name: "Chandra Sthaan-I Lander",
    hindiName: "चंद्र यान भारी लैंडर",
    category: "TRANSPORT & LOGISTICS",
    status: "STANDBY",
    statusClass: "status-standby",
    icon: "🚀",
    camera: {
      position: [72, 36, 68],
      target: [40, 22, 30],
      duration: 1600
    },
    pinPosition: [40, 46, 30],
    summary: `The Chandra Sthaan-I Super Heavy Reusable Lander serves as the primary cargo and crew transit vehicle between lunar orbit and the base landing pad. Powered by throttleable methalox rocket engines, it features robotic cargo winches, aerodynamic grid fins for atmospheric return, and hexagonal thermal protection shield tiles.`,
    specs: [
      { label: "Vehicle Height", value: "48.5", unit: "m" },
      { label: "Dry Mass / Payload", value: "85 / 100", unit: "tonnes" },
      { label: "Propellant Configuration", value: "CH₄ / Liquid O₂", unit: "Methalox" },
      { label: "Engine Thrust (Cluster)", value: "7,800", unit: "kN Total" },
      { label: "Landing Pad Designation", value: "Pad Alpha", unit: "Regolith-Sintered" },
      { label: "Refueling Connector", value: "Cryo Quick-Disconnect", unit: "Automated" }
    ],
    telemetryKeys: ["landerFuel", "landerO2", "landerCoreTemp", "landingPadStatus"],
    logs: [
      { time: "T-00:11:00", text: "Pad Alpha grounding telemetry verified." },
      { time: "T-00:45:20", text: "RCS thruster manifold pressure test: 24.8 MPa [PASS]." },
      { time: "T-02:14:00", text: "Pre-cooling LOX umbilical lines for propellant transfer." }
    ]
  },

  habitat: {
    id: "habitat",
    name: "Pressurized Hab Domes",
    hindiName: "पर्यावास और कमांड डोम",
    category: "HABITATION & COMMAND",
    status: "NOMINAL",
    statusClass: "status-nominal",
    icon: "🏛",
    camera: {
      position: [-22, 30, 52],
      target: [-20, 8, 10],
      duration: 1600
    },
    pinPosition: [-20, 22, 10],
    summary: `The central habitation complex consists of interconnected geodesic icosahedron biodomes covered in multi-layered regolith radiation shielding and transparent composite cupolas. Internal modules house crew quarters, command consoles, medical bays, exercise facilities, and EVA airlock hubs connected by Tiranga-illuminated transit corridors.`,
    specs: [
      { label: "Internal Atmosphere", value: "101.3", unit: "kPa (78% N₂ / 21% O₂)" },
      { label: "Habitable Volume", value: "3,850", unit: "m³" },
      { label: "Radiation Shielding", value: "1.8 m Sintered Regolith", unit: "Passive" },
      { label: "Crew Capacity", value: "8 Permanent / 12 Max", unit: "Astronauts" },
      { label: "Emergency Airlocks", value: "4 Independent", unit: "Multi-Zone" },
      { label: "Acoustic Noise Floor", value: "38", unit: "dBA" }
    ],
    telemetryKeys: ["basePressure", "internalTemp", "co2Level", "crewHealthIndex"],
    logs: [
      { time: "T-00:08:30", text: "Airlock Bravo pressure cycle completed successfully." },
      { time: "T-00:33:12", text: "Crew environmental monitoring: all biometrics within green zone." },
      { time: "T-01:40:00", text: "Automated particulate HEPA filtration cycle activated." }
    ]
  },

  power: {
    id: "power",
    name: "Energy & Solar Rim Grid",
    hindiName: "सौर टावर और ऊर्जा ग्रिड",
    category: "ENERGY & POWER",
    status: "OPERATIONAL",
    statusClass: "status-nominal",
    icon: "⚡",
    camera: {
      position: [-74, 46, -14],
      target: [-45, 22, -35],
      duration: 1600
    },
    pinPosition: [-45, 42, -35],
    summary: `Perched on the 1,100 m elevated crater rim ridge ('Peak of Eternal Light'), ultra-tall vertical bifacial solar towers capture low-angle horizontal sunlight continuously for ~92% of the lunar year. Power is coupled with a compact Kilopower-class nuclear Stirling reactor and supercapacitor storage banks for uninterrupted baseload power.`,
    specs: [
      { label: "Solar Towers Active", value: "4 Vertical Arrays", unit: "Sun-Tracking" },
      { label: "Tower Array Height", value: "42", unit: "m" },
      { label: "Solar Generation Output", value: "2.40", unit: "MW" },
      { label: "Stirling Nuclear Backup", value: "800", unit: "kW Baseload" },
      { label: "Flywheel / Battery Bank", value: "12,000", unit: "kWh Buffer" },
      { label: "High-Voltage DC Line", value: "10", unit: "kV Superconducting" }
    ],
    telemetryKeys: ["powerTotal", "solarEfficiency", "batteryStateOfCharge", "reactorTemp"],
    logs: [
      { time: "T-00:05:00", text: "Solar Tower Alpha sun-tracking azimuth adjusted by +1.4°." },
      { time: "T-00:52:18", text: "Stirling Core coolant loop differential: 14.2 K [Optimal]." },
      { time: "T-02:30:00", text: "Superconducting DC power bus efficiency measured at 99.4%." }
    ]
  },

  isru: {
    id: "isru",
    name: "ISRU Water & Fuel Plant",
    hindiName: "जल एवं ईंधन उत्पादन संयंत्र",
    category: "RESOURCE PRODUCTION",
    status: "ACTIVE",
    statusClass: "status-active",
    icon: "⛏",
    camera: {
      position: [14, 24, -2],
      target: [26, 9, -25],
      duration: 1600
    },
    pinPosition: [25, 20, -25],
    summary: `The In-Situ Resource Utilization (ISRU) facility extracts water-ice buried in permanently shadowed cold traps (-230°C) inside Shackleton Crater. Deep-core thermal drills and microwave sublimators vaporize ice, which is condensed, purified, and electrolyzed into liquid oxygen (LOX) and liquid hydrogen (LH₂) propellant stored in vacuum-jacketed cryogenic spheroids.`,
    specs: [
      { label: "Sublimation Drill Depth", value: "12.5", unit: "m" },
      { label: "Ice Purity Extracted", value: "94.2", unit: "% H₂O equivalent" },
      { label: "Water Production Rate", value: "42.8", unit: "L / hour" },
      { label: "Electrolysis Capacity", value: "350", unit: "kg O₂ / day" },
      { label: "Cryo LOX Storage Capacity", value: "45,000", unit: "Liters" },
      { label: "Microwave Array Output", value: "120", unit: "kW" }
    ],
    telemetryKeys: ["waterReserves", "isruExtractionRate", "cryoLOXPressure", "drillBitTemp"],
    logs: [
      { time: "T-00:02:15", text: "Sublimation Chamber 2 vacuum seal pressure locked." },
      { time: "T-00:27:40", text: "Cryo condenser transfer completed: 180L pure H₂O routed to storage." },
      { time: "T-01:15:00", text: "Regolith core mineralogy scan detected 8.2% Ilmenite content." }
    ]
  },

  eclss: {
    id: "eclss",
    name: "Life Support (ECLSS)",
    hindiName: "जीवन रक्षक प्रणाली",
    category: "ENVIRONMENTAL CONTROL",
    status: "NOMINAL",
    statusClass: "status-nominal",
    icon: "🫧",
    camera: {
      position: [-10, 20, 50],
      target: [-15, 6, 20],
      duration: 1600
    },
    pinPosition: [-15, 18, 20],
    summary: `The Environmental Control and Life Support System (ECLSS) ensures continuous survivability for the 8-astronaut crew. It incorporates solid-state Sabatier reactors for CO₂ reduction, catalytic water purification with urine reclamation, trace contaminant catalytic scrubbers, and active nitrogen-oxygen balancing.`,
    specs: [
      { label: "Atmospheric O₂ Fraction", value: "21.2", unit: "%" },
      { label: "CO₂ Partial Pressure", value: "0.22", unit: "kPa (1.6 mmHg)" },
      { label: "Water Recovery Index", value: "98.7", unit: "%" },
      { label: "Cabin Temperature", value: "21.5", unit: "°C (70.7°F)" },
      { label: "Relative Humidity", value: "44.0", unit: "%" },
      { label: "Sabatier Methane Output", value: "18.5", unit: "kg / day" }
    ],
    telemetryKeys: ["eclssO2", "co2Level", "waterReserves", "basePressure"],
    logs: [
      { time: "T-00:14:00", text: "Solid amine CO₂ scrubber regenerative desorption complete." },
      { time: "T-00:48:10", text: "Potable water mineral enrichment calibrated to ISRO specs." },
      { time: "T-02:05:30", text: "Cabin air circulation fan manifold B rotated for scheduled maintenance." }
    ]
  },

  agriculture: {
    id: "agriculture",
    name: "Hydroponic Bio-Dome",
    hindiName: "हाइड्रोपोनिक बायो-डोम",
    category: "FOOD SECURITY & BIOLOGY",
    status: "OPERATIONAL",
    statusClass: "status-nominal",
    icon: "🌱",
    camera: {
      position: [-32, 20, 36],
      target: [-14, 7, 16],
      duration: 1600
    },
    pinPosition: [-14, 18, 16],
    summary: `The agricultural dome houses multi-tiered aeroponic vertical farming racks and closed-loop spirulina algae photobioreactors. Plants are bathed in tuned wavelength LED lighting (hyper-red 660nm / deep-blue 450nm) to optimize photosynthesis, providing fresh nutrient-dense dietary supplements and supplemental biological oxygen generation.`,
    specs: [
      { label: "Cultivated Area", value: "450", unit: "m² Effective" },
      { label: "Primary Crops", value: "Dwarf Wheat, Soybeans, Spirulina, Microgreens", unit: "" },
      { label: "Biomass Yield", value: "48.5", unit: "kg / month" },
      { label: "LED Photosynthetic PAR", value: "650", unit: "µmol/m²/s" },
      { label: "Nutrient Solution pH / EC", value: "5.8 / 1.6", unit: "mS/cm" },
      { label: "Biological O₂ Contribution", value: "12.4", unit: "% Base Total" }
    ],
    telemetryKeys: ["bioDomeHumidity", "plantHealthIndex", "nutrientFlowRate", "internalTemp"],
    logs: [
      { time: "T-00:19:00", text: "Nutrient solution EC balanced to 1.62 mS/cm." },
      { time: "T-01:05:00", text: "Microgreens rack 3 harvest completed: 3.4 kg fresh yield." },
      { time: "T-02:45:12", text: "Spirulina bioreactor turbidostat optical density at peak growth rate." }
    ]
  },

  comms: {
    id: "comms",
    name: "Deep Space Laser Comms",
    hindiName: "गहरे अंतरिक्ष लेजर संचार",
    category: "TELECOMMUNICATIONS",
    status: "ACTIVE",
    statusClass: "status-active",
    icon: "📡",
    camera: {
      position: [-18, 18, 72],
      target: [0, 12, 45],
      duration: 1600
    },
    pinPosition: [0, 26, 45],
    summary: `The primary communications terminal features a 12-meter steerable high-gain parabolic antenna paired with a high-bandwidth infrared optical laser transceiver. It maintains continuous high-throughput data uplink with ISRO ISTRAC Bengaluru and the Chandrayaan Polar Relay Satellite constellation.`,
    specs: [
      { label: "Parabolic Antenna Diameter", value: "12.0", unit: "m" },
      { label: "Optical Laser Link", value: "1550 nm (Near-IR)", unit: "10 Gbps" },
      { label: "Ka-Band RF Backup", value: "32 GHz", unit: "250 Mbps" },
      { label: "Tracking Precision", value: "0.002", unit: "degrees" },
      { label: "Earth Line-of-Sight", value: "Continuous", unit: "Direct View" },
      { label: "Round-Trip Latency", value: "2.56", unit: "seconds" }
    ],
    telemetryKeys: ["commsBandwidth", "commsLatency", "signalToNoise", "dishAzimuth"],
    logs: [
      { time: "T-00:01:00", text: "Optical laser terminal locked onto ISTRAC Deep Space ground station." },
      { time: "T-00:22:15", text: "High-definition 4K 3D digital-twin telemetry stream broadcasting." },
      { time: "T-01:35:40", text: "Orbital relay handoff to Chandrayaan-LRO verified." }
    ]
  },

  rovers: {
    id: "rovers",
    name: "Pragyan-II Rover Fleet",
    hindiName: "प्रज्ञान-२ रोवर बेड़ा",
    category: "SURFACE OPERATIONS",
    status: "ACTIVE",
    statusClass: "status-active",
    icon: "🚜",
    camera: {
      position: [-12, 16, -2],
      target: [-25, 4, -15],
      duration: 1600
    },
    pinPosition: [-25, 12, -15],
    summary: `Building on the heritage of Chandrayaan-3's Pragyan, the Pragyan-II fleet comprises autonomous heavy-duty lunar exploration and regolith hauling rovers. Equipped with flexible rocker-bogie 6-wheel drivetrains, APXS spectrometer arms, LIDAR navigation, and high-intensity LED searchlights, they patrol the crater floor and extract cold-trap ice core samples.`,
    specs: [
      { label: "Fleet Count", value: "4 Heavy Rovers", unit: "Autonomous" },
      { label: "Mobility Drivetrain", value: "6-Wheel Rocker-Bogie", unit: "Brushless Hubs" },
      { label: "Top Traverse Speed", value: "12.0", unit: "km / h" },
      { label: "Payload Capacity", value: "450", unit: "kg / Rover" },
      { label: "Scientific Suite", value: "LIBS, APXS, Ground-Penetrating Radar", unit: "" },
      { label: "Autonomous AI Navigation", value: "Real-time SLAM + Lidar", unit: "ISRO-Nav" }
    ],
    telemetryKeys: ["roverBattery", "roverTraverseSpeed", "roverPayloadMass", "roverDistanceTraveled"],
    logs: [
      { time: "T-00:07:00", text: "Pragyan-II Alpha engaged autonomous pathing to PSR Trench 7." },
      { time: "T-00:41:30", text: "LIBS spectral analysis identified high concentrations of titanium & silicon." },
      { time: "T-02:10:00", text: "Battery recharge cycle at inductive pad Gamma: 96%." }
    ]
  }
};

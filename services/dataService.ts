import { Intersection, SignalState, TrafficStats, ChartDataPoint, IoTDevice, LogEntry, ZoneMode } from '../types';

// Global Configuration with Expanded Details
const INTERSECTION_CONFIG = [
  // --- USA ---
  { name: "Market St & Van Ness", lat: 37.7749, lng: -122.4194, loc: "San Francisco, USA" },
  { name: "Mission St & 16th", lat: 37.7651, lng: -122.4196, loc: "San Francisco, USA" },
  { name: "Geary Blvd & Divisadero", lat: 37.7858, lng: -122.4398, loc: "San Francisco, USA" },
  { name: "Times Square", lat: 40.7580, lng: -73.9855, loc: "New York, USA" },
  
  // --- UK ---
  { name: "Oxford Circus", lat: 51.5152, lng: -0.1419, loc: "London, UK" },
  { name: "Piccadilly Circus", lat: 51.5101, lng: -0.1340, loc: "London, UK" },
  { name: "Trafalgar Square", lat: 51.5080, lng: -0.1281, loc: "London, UK" },
  { name: "Elephant & Castle", lat: 51.4952, lng: -0.1008, loc: "London, UK" },
  { name: "King's Cross St Pancras", lat: 51.5314, lng: -0.1261, loc: "London, UK" },

  // --- JAPAN ---
  { name: "Shibuya Crossing", lat: 35.6595, lng: 139.7004, loc: "Tokyo, JP" },
  { name: "Shinjuku Station West", lat: 35.6915, lng: 139.6969, loc: "Tokyo, JP" },
  { name: "Ginza 4-Chome", lat: 35.6716, lng: 139.7649, loc: "Tokyo, JP" },
  { name: "Akihabara Chuo-Dori", lat: 35.6984, lng: 139.7731, loc: "Tokyo, JP" },
  { name: "Omotesando", lat: 35.6652, lng: 139.7123, loc: "Tokyo, JP" },

  // --- INDIA (Expanded) ---
  // Delhi
  { name: "Connaught Place (Outer)", lat: 28.6315, lng: 77.2167, loc: "New Delhi, IN" },
  { name: "ITO Crossing", lat: 28.6272, lng: 77.2405, loc: "New Delhi, IN" },
  { name: "AIIMS Flyover", lat: 28.5686, lng: 77.2089, loc: "New Delhi, IN" },
  { name: "Dhaula Kuan", lat: 28.5921, lng: 77.1613, loc: "New Delhi, IN" },
  
  // Mumbai
  { name: "Bandra-Worli Sea Link", lat: 19.0368, lng: 72.8172, loc: "Mumbai, IN" },
  { name: "CSMT Junction", lat: 18.9401, lng: 72.8347, loc: "Mumbai, IN" },
  { name: "Juhu Circle", lat: 19.1128, lng: 72.8277, loc: "Mumbai, IN" },
  { name: "Dadar TT Circle", lat: 19.0178, lng: 72.8478, loc: "Mumbai, IN" },

  // Bangalore
  { name: "Silk Board Junction", lat: 12.9175, lng: 77.6235, loc: "Bangalore, IN" },
  { name: "MG Road Junction", lat: 12.9754, lng: 77.6074, loc: "Bangalore, IN" },
  { name: "Tin Factory", lat: 12.9938, lng: 77.6601, loc: "Bangalore, IN" },

  // Other Major Cities
  { name: "Kathipara Junction", lat: 13.0067, lng: 80.2206, loc: "Chennai, IN" },
  { name: "Park Street", lat: 22.5550, lng: 88.3510, loc: "Kolkata, IN" },
  { name: "Hitech City Main Rd", lat: 17.4474, lng: 78.3762, loc: "Hyderabad, IN" },
];

const MOCK_IMAGES = [
  "https://picsum.photos/400/300?random=1",
  "https://picsum.photos/400/300?random=2",
  "https://picsum.photos/400/300?random=3",
  "https://picsum.photos/400/300?random=4",
  "https://picsum.photos/400/300?random=5",
  "https://picsum.photos/400/300?random=6",
  "https://picsum.photos/400/300?random=7",
];

// Generate Initial Intersections with IoT Data
export const generateInitialIntersections = (): Intersection[] => {
  return INTERSECTION_CONFIG.map((config, index) => ({
    id: `INT-${index + 1}`,
    name: config.name,
    location: config.loc,
    coordinates: { lat: config.lat, lng: config.lng },
    currentFlow: Math.floor(Math.random() * 50) + 10,
    capacity: 100,
    signalState: index % 2 === 0 ? SignalState.GREEN : SignalState.RED,
    signalTimer: Math.floor(Math.random() * 30) + 10,
    congestionLevel: 'LOW',
    isEmergencyOverride: false,
    cameraUrl: MOCK_IMAGES[index % MOCK_IMAGES.length],
    connectedSensors: 4,
    environment: {
      co2Level: 400 + Math.random() * 50,
      temperature: config.loc.includes('UK') ? 12 : config.loc.includes('IN') ? 32 : 18,
      weather: config.loc.includes('UK') ? 'RAIN' : 'CLEAR'
    }
  }));
};

// Generate Mock IoT Devices
export const generateIoTDevices = (intersections: Intersection[]): IoTDevice[] => {
  const devices: IoTDevice[] = [];
  intersections.forEach(i => {
    // 1 Controller per intersection
    devices.push({
      id: `DEV-CTL-${i.id}`,
      type: 'CONTROLLER',
      status: 'ONLINE',
      intersectionId: i.id,
      latency: Math.floor(Math.random() * 50) + 10,
      lastPing: new Date().toISOString()
    });
    // 1 Camera
    devices.push({
      id: `DEV-CAM-${i.id}`,
      type: 'CAMERA',
      status: 'ONLINE',
      intersectionId: i.id,
      latency: Math.floor(Math.random() * 100) + 20,
      lastPing: new Date().toISOString()
    });
    // 2 Sensors
    devices.push({
      id: `DEV-SENS-A-${i.id}`,
      type: 'INDUCTIVE_LOOP',
      status: 'ONLINE',
      intersectionId: i.id,
      batteryLevel: Math.floor(Math.random() * 40) + 60,
      latency: Math.floor(Math.random() * 20) + 5,
      lastPing: new Date().toISOString()
    });
    devices.push({
      id: `DEV-ENV-${i.id}`,
      type: 'ENV_SENSOR',
      status: Math.random() > 0.95 ? 'OFFLINE' : 'ONLINE', // Random offline status
      intersectionId: i.id,
      batteryLevel: Math.floor(Math.random() * 100),
      latency: Math.floor(Math.random() * 30) + 5,
      lastPing: new Date().toISOString()
    });
  });
  return devices;
};

export const updateSimulation = (
  intersections: Intersection[], 
  devices: IoTDevice[],
  zoneMode: ZoneMode
): { intersections: Intersection[], devices: IoTDevice[], logs: LogEntry[] } => {
  
  const logs: LogEntry[] = [];

  // Update Devices
  const updatedDevices = devices.map((d): IoTDevice => {
    const isOnline = d.status === 'ONLINE';
    let newStatus = d.status;
    if (Math.random() > 0.999) newStatus = isOnline ? 'OFFLINE' : 'ONLINE';
    let newBattery = d.batteryLevel;
    if (d.batteryLevel && isOnline && Math.random() > 0.9) newBattery = Math.max(0, d.batteryLevel - 1);

    if (newStatus !== d.status) {
        logs.push({
            id: Date.now().toString() + Math.random(),
            timestamp: new Date().toLocaleTimeString(),
            source: 'IOT_NETWORK',
            message: `Device ${d.id} state changed to ${newStatus}`,
            type: newStatus === 'ONLINE' ? 'SUCCESS' : 'ERROR'
        });
    }
    return { ...d, status: newStatus, batteryLevel: newBattery, lastPing: new Date().toISOString() };
  });

  // Update Intersections
  const updatedIntersections = intersections.map((i): Intersection => {
    
    // --- ZONE PROTOCOL LOGIC ---
    if (zoneMode === 'LOCKDOWN') {
        return {
            ...i,
            signalState: SignalState.RED,
            signalTimer: 999,
            congestionLevel: 'LOW', // Traffic stops implies no flow eventually
            currentFlow: Math.max(0, i.currentFlow - 5)
        };
    }

    if (zoneMode === 'VIP') {
        // Simple logic: If it's a major hub (by name), set to Green
        const isVipNode = i.name.includes("Square") || i.name.includes("Crossing") || i.name.includes("Junction");
        if (isVipNode) {
            return {
                ...i,
                signalState: SignalState.GREEN,
                signalTimer: 60,
                currentFlow: Math.max(0, i.currentFlow - 10), // Clearing out
                isEmergencyOverride: true
            };
        }
    }
    // ---------------------------

    const intersectionDevices = updatedDevices.filter(d => d.intersectionId === i.id);
    const controller = intersectionDevices.find(d => d.type === 'CONTROLLER');
    
    if (i.isEmergencyOverride) {
       const isGreen = i.signalState === SignalState.GREEN;
       return {
         ...i,
         signalState: SignalState.GREEN,
         signalTimer: isGreen ? 99 : 5, 
         currentFlow: Math.max(0, i.currentFlow - 15), 
         congestionLevel: i.currentFlow > 20 ? 'MODERATE' : 'LOW'
       };
    }

    if (controller?.status === 'OFFLINE') {
        if (Math.random() > 0.98) logs.push({
            id: Date.now().toString() + Math.random(),
            timestamp: new Date().toLocaleTimeString(),
            source: 'AI_CORE',
            message: `Lost contact with ${i.name}. Switching to local fallback.`,
            type: 'WARN'
        });
        return { ...i, signalState: SignalState.YELLOW, congestionLevel: 'HIGH' };
    }

    const flowChange = Math.floor(Math.random() * 15) - 6; 
    let newFlow = Math.max(0, Math.min(i.capacity * 1.3, i.currentFlow + flowChange));
    let newCo2 = i.environment.co2Level + (newFlow > 80 ? 2 : -1);
    newCo2 = Math.max(300, Math.min(800, newCo2));

    let congestion: Intersection['congestionLevel'] = 'LOW';
    const usage = newFlow / i.capacity;
    if (usage > 0.9) congestion = 'CRITICAL';
    else if (usage > 0.75) congestion = 'HIGH';
    else if (usage > 0.5) congestion = 'MODERATE';

    let newTimer = i.signalTimer - 1;
    let newState = i.signalState;

    if (newTimer <= 0) {
      if (newState === SignalState.GREEN) {
        newState = SignalState.YELLOW;
        newTimer = 4;
      } else if (newState === SignalState.YELLOW) {
        newState = SignalState.RED;
        newTimer = usage > 0.8 ? 20 : 45; 
      } else {
        newState = SignalState.GREEN;
        newTimer = usage > 0.7 ? 55 : 25;
      }
    }

    return {
      ...i,
      currentFlow: newFlow,
      congestionLevel: congestion,
      signalState: newState,
      signalTimer: newTimer,
      environment: { ...i.environment, co2Level: Math.floor(newCo2) }
    };
  });

  return { intersections: updatedIntersections, devices: updatedDevices, logs };
};

export const calculateStats = (intersections: Intersection[], zoneMode: ZoneMode): TrafficStats => {
  const totalCars = intersections.reduce((acc, curr) => acc + curr.currentFlow, 0);
  const avgUsage = intersections.reduce((acc, curr) => acc + (curr.currentFlow / curr.capacity), 0) / intersections.length;
  const avgCo2 = intersections.reduce((acc, curr) => acc + curr.environment.co2Level, 0) / intersections.length;
  
  return {
    totalCars: Math.floor(totalCars * 10),
    averageCongestion: Math.floor(avgUsage * 100),
    activeAlerts: intersections.filter(i => i.congestionLevel === 'CRITICAL').length,
    systemHealth: 98.5,
    avgCo2: Math.floor(avgCo2),
    zoneMode: zoneMode
  };
};

export const generateChartData = (): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = 10; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      congestion: Math.floor(Math.random() * 40) + 30,
      prediction: Math.floor(Math.random() * 40) + 32,
    });
  }
  return data;
};
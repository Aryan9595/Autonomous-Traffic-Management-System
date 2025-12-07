export enum SignalState {
  RED = 'RED',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN'
}

export type WeatherCondition = 'CLEAR' | 'RAIN' | 'FOG' | 'SNOW';
export type UserRole = 'ADMIN' | 'COMMUTER';
export type ZoneMode = 'NORMAL' | 'VIP' | 'LOCKDOWN';

export interface EnvironmentalData {
  co2Level: number; // ppm
  temperature: number; // Celsius
  weather: WeatherCondition;
}

export interface Intersection {
  id: string;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number }; // Real world coordinates
  currentFlow: number; // Cars per minute
  capacity: number;
  signalState: SignalState;
  signalTimer: number; // Seconds remaining
  congestionLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  isEmergencyOverride: boolean;
  cameraUrl: string;
  environment: EnvironmentalData;
  connectedSensors: number;
}

export interface IoTDevice {
  id: string;
  type: 'CAMERA' | 'INDUCTIVE_LOOP' | 'ENV_SENSOR' | 'CONTROLLER';
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  intersectionId: string;
  batteryLevel?: number; // percentage
  latency: number; // ms
  lastPing: string;
}

export interface TrafficStats {
  totalCars: number;
  averageCongestion: number;
  activeAlerts: number;
  systemHealth: number;
  avgCo2: number;
  zoneMode: ZoneMode;
}

export interface ChartDataPoint {
  time: string;
  congestion: number;
  prediction: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  type: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Incident {
  id: string;
  type: 'ACCIDENT' | 'MEDICAL' | 'FIRE' | 'HAZARD';
  location: string;
  intersectionId: string;
  timestamp: string;
  status: 'ACTIVE' | 'RESOLVED' | 'DISPATCHED';
  unitsResponding: number;
  eta: number; // minutes
}

export enum Page {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  LIVE_MAP = 'LIVE_MAP',
  ANALYTICS = 'ANALYTICS',
  EMERGENCY = 'EMERGENCY',
  IOT_NETWORK = 'IOT_NETWORK',
  SUBSCRIPTION = 'SUBSCRIPTION'
}
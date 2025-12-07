import React, { useEffect, useRef, useState } from 'react';
import { Intersection, SignalState } from '../types';
import { MapPin, Globe } from 'lucide-react';

interface WorldMapProps {
  intersections: Intersection[];
  onSelect: (intersection: Intersection) => void;
  selectedId: string | null;
  predictionMode?: boolean;
  predictionOffset?: number;
}

declare global {
  interface Window {
    L: any;
  }
}

// Region Configuration Data
const REGIONS = {
    INDIA: {
        label: "India",
        color: "from-orange-500 to-green-500",
        defaultView: { lat: 20.5937, lng: 78.9629, zoom: 5 },
        cities: [
            { label: 'Delhi', lat: 28.6139, lng: 77.2090, zoom: 12 },
            { label: 'Mumbai', lat: 19.0760, lng: 72.8777, zoom: 12 },
            { label: 'Bangalore', lat: 12.9716, lng: 77.5946, zoom: 12 },
            { label: 'Chennai', lat: 13.0827, lng: 80.2707, zoom: 12 },
            { label: 'Hyderabad', lat: 17.3850, lng: 78.4867, zoom: 12 },
        ]
    },
    USA: {
        label: "USA",
        color: "from-blue-600 to-red-600",
        defaultView: { lat: 37.0902, lng: -95.7129, zoom: 4 },
        cities: [
            { label: 'San Francisco', lat: 37.7749, lng: -122.4194, zoom: 13 },
            { label: 'New York', lat: 40.7580, lng: -73.9855, zoom: 14 },
        ]
    },
    UK: {
        label: "UK",
        color: "from-blue-700 to-red-600",
        defaultView: { lat: 51.5074, lng: -0.1278, zoom: 10 },
        cities: [
            { label: 'London (West)', lat: 51.5152, lng: -0.1419, zoom: 14 },
            { label: 'London (East)', lat: 51.5033, lng: -0.0195, zoom: 14 },
            { label: 'Westminster', lat: 51.5014, lng: -0.1250, zoom: 15 },
        ]
    },
    JAPAN: {
        label: "Japan",
        color: "from-red-500 to-white",
        defaultView: { lat: 35.6762, lng: 139.6503, zoom: 11 },
        cities: [
            { label: 'Shibuya', lat: 35.6595, lng: 139.7004, zoom: 15 },
            { label: 'Shinjuku', lat: 35.6915, lng: 139.6969, zoom: 15 },
            { label: 'Ginza', lat: 35.6716, lng: 139.7649, zoom: 15 },
            { label: 'Akihabara', lat: 35.6984, lng: 139.7731, zoom: 15 },
        ]
    }
};

type RegionKey = keyof typeof REGIONS;

const WorldMap: React.FC<WorldMapProps> = ({ intersections, onSelect, selectedId, predictionMode = false, predictionOffset = 0 }) => {
  const mapRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeRegion, setActiveRegion] = useState<RegionKey>('INDIA');

  useEffect(() => {
    if (typeof window.L === 'undefined' || !containerRef.current) return;

    if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
    }

    const map = window.L.map(containerRef.current, {
        zoomControl: false // We will add it manually or rely on scroll
    }).setView([20.5937, 78.9629], 5); // Default to India

    mapRef.current = map;

    // Dark Mode Tiles
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    setTimeout(() => { map.invalidateSize(); }, 100);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Listen to selectedId changes to fly to location
  useEffect(() => {
      if (selectedId && mapRef.current) {
          const target = intersections.find(i => i.id === selectedId);
          if (target) {
              mapRef.current.flyTo([target.coordinates.lat, target.coordinates.lng], 15, { duration: 1.5 });
          }
      }
  }, [selectedId, intersections]);

  const handleRegionChange = (region: RegionKey) => {
      setActiveRegion(region);
      const view = REGIONS[region].defaultView;
      // Also jump to the first city of that region to make it more useful immediately
      const firstCity = REGIONS[region].cities[0];
      if (firstCity) {
          mapRef.current?.flyTo([firstCity.lat, firstCity.lng], firstCity.zoom, { duration: 2 });
      } else {
          mapRef.current?.flyTo([view.lat, view.lng], view.zoom, { duration: 2 });
      }
  };

  const jumpToCity = (city: { lat: number, lng: number, zoom: number }) => {
      mapRef.current?.flyTo([city.lat, city.lng], city.zoom, { duration: 1.5 });
  };

  useEffect(() => {
    if (!mapRef.current || typeof window.L === 'undefined') return;

    intersections.forEach(int => {
      let displayLevel = int.congestionLevel;
      if (predictionMode && predictionOffset > 0) {
          const val = (int.name.length + predictionOffset) % 10;
          if (val > 7) displayLevel = 'CRITICAL';
          else if (val > 5) displayLevel = 'HIGH';
          else displayLevel = 'LOW';
      }

      const color = displayLevel === 'CRITICAL' ? '#ef4444' : 
                    displayLevel === 'HIGH' ? '#f97316' : 
                    displayLevel === 'MODERATE' ? '#eab308' : '#3b82f6';
      
      const radius = selectedId === int.id ? 14 : 8;

      if (!markersRef.current[int.id]) {
        const marker = window.L.circleMarker([int.coordinates.lat, int.coordinates.lng], {
          radius: radius,
          fillColor: color,
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(mapRef.current);

        marker.on('click', () => {
             onSelect(int);
        });

        marker.bindPopup(`
            <div style="font-family: sans-serif; color: #1e293b;">
                <strong>${int.name}</strong><br/>
                Status: <span style="color:${color}; font-weight:bold;">${displayLevel}</span><br/>
                ${int.isEmergencyOverride ? '<b style="color:red">EMERGENCY ACTIVE</b>' : ''}
            </div>
        `);

        markersRef.current[int.id] = marker;
      } else {
        const marker = markersRef.current[int.id];
        marker.setStyle({
            fillColor: color,
            radius: radius,
            color: int.isEmergencyOverride ? '#ef4444' : '#fff',
            weight: int.isEmergencyOverride ? 3 : 1
        });
        
        marker.setPopupContent(`
            <div style="font-family: sans-serif; color: #1e293b;">
                <strong>${int.name}</strong><br/>
                Status: <span style="color:${color}; font-weight:bold;">${displayLevel}</span><br/>
                ${predictionMode ? `<i>Forecast +${predictionOffset}m</i>` : `Signal: ${int.signalState} (${int.signalTimer}s)`}<br/>
                ${int.isEmergencyOverride ? '<b style="color:red">EMERGENCY ACTIVE</b>' : ''}
            </div>
        `);
      }
    });

  }, [intersections, selectedId, onSelect, predictionMode, predictionOffset]);

  return (
    <div className="w-full h-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative isolate">
        <div ref={containerRef} className="w-full h-full absolute inset-0 z-0 bg-slate-900" style={{ minHeight: '400px' }} />
        
        {/* Dynamic Controls Container */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] flex flex-col items-center gap-2 max-w-[95%]">
            
            {/* 1. Country/Region Selector */}
            <div className="flex gap-2 p-1 bg-slate-900/80 backdrop-blur rounded-xl border border-slate-700 shadow-lg">
                {(Object.keys(REGIONS) as RegionKey[]).map((regionKey) => (
                    <button
                        key={regionKey}
                        onClick={() => handleRegionChange(regionKey)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            activeRegion === regionKey 
                            ? `bg-gradient-to-r ${REGIONS[regionKey].color} text-white shadow-md` 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <Globe size={12} />
                        {REGIONS[regionKey].label}
                    </button>
                ))}
            </div>

            {/* 2. Sub-City Selectors (Dependent on Active Region) */}
            <div className="flex gap-2 overflow-x-auto max-w-full pb-2 no-scrollbar px-4">
                {REGIONS[activeRegion].cities.map((city) => (
                    <button
                        key={city.label}
                        onClick={() => jumpToCity(city)}
                        className="bg-slate-800/90 hover:bg-slate-700 text-white px-3 py-1 text-xs rounded-lg border border-slate-600 font-medium whitespace-nowrap shadow-sm backdrop-blur transition-colors flex items-center gap-1"
                    >
                        <MapPin size={10} className="text-slate-400" />
                        {city.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Map Legend/Key - BOTTOM LEFT */}
        <div className="absolute bottom-6 left-6 z-[400] bg-slate-900/90 backdrop-blur p-4 rounded-xl border border-slate-700 shadow-lg pointer-events-none">
             <h4 className="text-white font-bold text-sm mb-2">{predictionMode ? `Forecast (+${predictionOffset}m)` : 'Live Traffic'}</h4>
             <div className="space-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Low Traffic</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Moderate</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Heavy/Critical</div>
             </div>
        </div>
    </div>
  );
};

export default WorldMap;
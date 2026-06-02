import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TrackingMapProps {
  originCoords: [number, number] | null;
  destCoords: [number, number] | null;
  currentCoords: [number, number] | null;
  route?: [number, number][];
  transportMode?: 'road' | 'sea' | 'air' | 'rail';
  className?: string;
}

const TrackingMap: React.FC<TrackingMapProps> = ({ originCoords, destCoords, currentCoords, route, transportMode = 'road', className }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (mapInstance.current) {
      mapInstance.current.remove();
    }

    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true });
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const bounds: L.LatLngExpression[] = [];

    const originIcon = L.divIcon({
      html: '<div style="width:16px;height:16px;border-radius:50%;background:#22c55e;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    const destIcon = L.divIcon({
      html: '<div style="width:16px;height:16px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    const currentIcon = L.divIcon({
      html: '<div style="width:20px;height:20px;border-radius:50%;background:#f97316;border:3px solid white;box-shadow:0 2px 12px rgba(249,115,22,0.5);animation:pulse 2s infinite"></div><style>@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(249,115,22,0.4)}50%{box-shadow:0 0 0 12px rgba(249,115,22,0)}}</style>',
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    if (originCoords) {
      L.marker(originCoords, { icon: originIcon }).addTo(map).bindPopup('📦 Origin');
      bounds.push(originCoords);
    }

    if (destCoords) {
      L.marker(destCoords, { icon: destIcon }).addTo(map).bindPopup('📍 Destination');
      bounds.push(destCoords);
    }

    if (currentCoords) {
      L.marker(currentCoords, { icon: currentIcon }).addTo(map).bindPopup('🚚 Current Location');
      bounds.push(currentCoords);
    }

    // Color & style per transport mode
    const modeColor: Record<string, string> = { road: '#1e3a5f', sea: '#0ea5e9', air: '#8b5cf6', rail: '#16a34a' };
    const baseColor = modeColor[transportMode] || '#1e3a5f';
    // Air & sea travel in straight (great-circle style) lines; road & rail follow land routes
    const usesRoadRouting = transportMode === 'road' || transportMode === 'rail';

    // Draw straight line immediately for instant visual feedback
    if (originCoords && destCoords) {
      L.polyline([originCoords, destCoords], { color: baseColor, weight: 3, opacity: usesRoadRouting ? 0.3 : 0.7, dashArray: '10, 5' }).addTo(map);
      if (currentCoords) {
        L.polyline([originCoords, currentCoords], { color: '#f97316', weight: 4, opacity: 0.8 }).addTo(map);
      }
    }

    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds as L.LatLngExpression[]), { padding: [50, 50], maxZoom: 12 });
    } else {
      map.setView([20, 0], 2);
    }

    // Fetch real road/rail route from OSRM in background (non-blocking).
    // Air & sea keep the direct line drawn above (no land routing).
    if (originCoords && destCoords && usesRoadRouting) {
      const controller = new AbortController();
      const url = `https://router.project-osrm.org/route/v1/driving/${originCoords[1]},${originCoords[0]};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`;
      fetch(url, { signal: controller.signal })
        .then(r => r.json())
        .then(data => {
          if (data.routes && data.routes[0]) {
            const coords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
            map.eachLayer(layer => {
              if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
                map.removeLayer(layer);
              }
            });
            L.polyline(coords, { color: baseColor, weight: 3, opacity: 0.6, dashArray: '8, 4' }).addTo(map);
            if (currentCoords) {
              L.polyline([originCoords, currentCoords], { color: '#f97316', weight: 4, opacity: 0.9 }).addTo(map);
            }
          }
        })
        .catch(() => {});

      return () => {
        controller.abort();
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
      };
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [originCoords, destCoords, currentCoords, route, transportMode]);

  return <div ref={mapRef} className={`w-full rounded-lg overflow-hidden ${className || 'h-[400px]'}`} />;
};

export default TrackingMap;

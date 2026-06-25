import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Coords = [number, number];

interface TrackingMapProps {
  /** Coordinates if already known (lat, lng). */
  originCoords?: Coords | null;
  destCoords?: Coords | null;
  /** Or location names — geocoded automatically when coords are absent. */
  origin?: string;
  destination?: string;
  /** Explicit current position (overrides progress-based position). */
  currentCoords?: Coords | null;
  /** 0-100. Places the moving package along the route at this fraction. */
  progress?: number;
  transportMode?: 'road' | 'sea' | 'air' | 'rail';
  className?: string;
}

const modeColor: Record<string, string> = { road: '#1e3a5f', sea: '#0ea5e9', air: '#8b5cf6', rail: '#16a34a' };
const modeEmoji: Record<string, string> = { road: '🚚', sea: '🚢', air: '✈️', rail: '🚆' };

// Simple in-memory geocode cache to avoid repeat Nominatim calls.
const geocodeCache = new Map<string, Coords | null>();

async function geocode(query: string): Promise<Coords | null> {
  const key = query.trim().toLowerCase();
  if (!key) return null;
  if (geocodeCache.has(key)) return geocodeCache.get(key)!;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    const result: Coords | null = data?.[0] ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
    geocodeCache.set(key, result);
    return result;
  } catch {
    return null;
  }
}

// Distance helper (haversine, metres) for interpolation.
function dist(a: Coords, b: Coords): number {
  const R = 6371000;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const lat1 = a[0] * Math.PI / 180;
  const lat2 = b[0] * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Find the point at `fraction` (0-1) of total length along a polyline.
function pointAlong(line: Coords[], fraction: number): { point: Coords; traveled: Coords[] } {
  if (line.length === 0) return { point: [0, 0], traveled: [] };
  if (line.length === 1 || fraction <= 0) return { point: line[0], traveled: [line[0]] };
  const segLen: number[] = [];
  let total = 0;
  for (let i = 0; i < line.length - 1; i++) {
    const d = dist(line[i], line[i + 1]);
    segLen.push(d);
    total += d;
  }
  if (total === 0) return { point: line[0], traveled: [line[0]] };
  const target = Math.min(1, Math.max(0, fraction)) * total;
  let acc = 0;
  const traveled: Coords[] = [line[0]];
  for (let i = 0; i < segLen.length; i++) {
    if (acc + segLen[i] >= target) {
      const r = segLen[i] === 0 ? 0 : (target - acc) / segLen[i];
      const lat = line[i][0] + (line[i + 1][0] - line[i][0]) * r;
      const lng = line[i][1] + (line[i + 1][1] - line[i][1]) * r;
      traveled.push([lat, lng]);
      return { point: [lat, lng], traveled };
    }
    acc += segLen[i];
    traveled.push(line[i + 1]);
  }
  return { point: line[line.length - 1], traveled: line.slice() };
}

const TrackingMap: React.FC<TrackingMapProps> = ({
  originCoords, destCoords, origin, destination, currentCoords, progress, transportMode = 'road', className,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [resolvedOrigin, setResolvedOrigin] = useState<Coords | null>(originCoords ?? null);
  const [resolvedDest, setResolvedDest] = useState<Coords | null>(destCoords ?? null);

  // Geocode names when coordinates are not supplied.
  useEffect(() => {
    let active = true;
    (async () => {
      if (!originCoords && origin) {
        const c = await geocode(origin);
        if (active) setResolvedOrigin(c);
      } else setResolvedOrigin(originCoords ?? null);
      if (!destCoords && destination) {
        const c = await geocode(destination);
        if (active) setResolvedDest(c);
      } else setResolvedDest(destCoords ?? null);
    })();
    return () => { active = false; };
  }, [origin, destination, originCoords, destCoords]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstance.current) mapInstance.current.remove();

    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true });
    mapInstance.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const originIcon = L.divIcon({
      html: '<div style="width:16px;height:16px;border-radius:50%;background:#22c55e;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
      className: '', iconSize: [16, 16], iconAnchor: [8, 8],
    });
    const destIcon = L.divIcon({
      html: '<div style="width:16px;height:16px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>',
      className: '', iconSize: [16, 16], iconAnchor: [8, 8],
    });
    const vehicleIcon = L.divIcon({
      html: `<div style="font-size:26px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4));animation:bob 1.6s ease-in-out infinite">${modeEmoji[transportMode] || '🚚'}</div><style>@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}</style>`,
      className: '', iconSize: [30, 30], iconAnchor: [15, 15],
    });

    const o = resolvedOrigin;
    const d = resolvedDest;
    const bounds: L.LatLngExpression[] = [];
    if (o) { L.marker(o, { icon: originIcon }).addTo(map).bindPopup('📦 Origin'); bounds.push(o); }
    if (d) { L.marker(d, { icon: destIcon }).addTo(map).bindPopup('📍 Destination'); bounds.push(d); }

    const baseColor = modeColor[transportMode] || '#1e3a5f';
    const usesRoadRouting = transportMode === 'road' || transportMode === 'rail';

    const fraction = typeof progress === 'number' ? Math.min(1, Math.max(0, progress / 100)) : null;

    // Draw route + moving package given a line.
    const drawWithLine = (line: Coords[]) => {
      // clear old polylines/markers (keep tiles)
      map.eachLayer((layer) => {
        if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) map.removeLayer(layer);
      });
      // full planned route (dashed)
      L.polyline(line, { color: baseColor, weight: 3, opacity: 0.45, dashArray: '8, 6' }).addTo(map);

      // moving package position
      let movePoint: Coords | null = null;
      let traveled: Coords[] = [];
      if (currentCoords) {
        movePoint = currentCoords;
        traveled = [line[0], currentCoords];
      } else if (fraction !== null) {
        const res = pointAlong(line, fraction);
        movePoint = res.point;
        traveled = res.traveled;
      }
      if (traveled.length > 1) {
        L.polyline(traveled, { color: '#f97316', weight: 5, opacity: 0.9 }).addTo(map);
      }
      if (movePoint && fraction !== 0) {
        L.marker(movePoint, { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(map).bindPopup('🚚 Package location');
        bounds.push(movePoint);
      }
      if (bounds.length > 0) {
        map.fitBounds(L.latLngBounds(bounds as L.LatLngExpression[]), { padding: [50, 50], maxZoom: 12 });
      }
    };

    if (o && d) {
      // immediate straight line
      drawWithLine([o, d]);
      if (usesRoadRouting) {
        const controller = new AbortController();
        const url = `https://router.project-osrm.org/route/v1/driving/${o[1]},${o[0]};${d[1]},${d[0]}?overview=full&geometries=geojson`;
        fetch(url, { signal: controller.signal })
          .then(r => r.json())
          .then(data => {
            if (data.routes?.[0]) {
              const coords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]] as Coords);
              drawWithLine(coords);
            }
          })
          .catch(() => {});
        return () => {
          controller.abort();
          if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
        };
      }
    } else if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds as L.LatLngExpression[]), { padding: [50, 50], maxZoom: 12 });
    } else {
      map.setView([20, 0], 2);
    }

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, [resolvedOrigin, resolvedDest, currentCoords, progress, transportMode]);

  return <div ref={mapRef} className={`w-full rounded-lg overflow-hidden ${className || 'h-[400px]'}`} />;
};

export default TrackingMap;

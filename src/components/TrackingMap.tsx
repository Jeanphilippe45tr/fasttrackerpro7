import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLang } from '@/i18n/LanguageContext';

type Coords = [number, number];

interface TrackingMapProps {
  originCoords?: Coords | null;
  destCoords?: Coords | null;
  origin?: string;
  destination?: string;
  currentCoords?: Coords | null;
  /** 0-100 */
  progress?: number;
  transportMode?: 'road' | 'sea' | 'air' | 'rail';
  className?: string;
}

const modeColor: Record<string, string> = { road: '#1e3a5f', sea: '#0ea5e9', air: '#8b5cf6', rail: '#16a34a' };
const modeEmoji: Record<string, string> = { road: '🚚', sea: '🚢', air: '✈️', rail: '🚆' };
/** average km/h used when no routing engine duration is available */
const modeSpeed: Record<string, number> = { road: 65, sea: 35, air: 780, rail: 90 };

const geocodeCache = new Map<string, Coords | null>();
const reverseCache = new Map<string, string>();

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

async function reverseGeocode(p: Coords): Promise<string> {
  const key = `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
  if (reverseCache.has(key)) return reverseCache.get(key)!;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&lat=${p[0]}&lon=${p[1]}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
    const data = await res.json();
    const a = data?.address || {};
    const name = [a.city || a.town || a.village || a.county || a.state, a.country].filter(Boolean).join(', ')
      || data?.display_name?.split(',').slice(0, 2).join(',') || '';
    reverseCache.set(key, name);
    return name;
  } catch {
    return '';
  }
}

const toRad = (v: number) => (v * Math.PI) / 180;
const toDeg = (v: number) => (v * 180) / Math.PI;

function dist(a: Coords, b: Coords): number {
  const R = 6371000;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function bearing(a: Coords, b: Coords): number {
  const φ1 = toRad(a[0]); const φ2 = toRad(b[0]); const Δλ = toRad(b[1] - a[1]);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Great-circle interpolation — realistic air/sea corridors instead of a flat straight line. */
function greatCircle(a: Coords, b: Coords, steps = 96): Coords[] {
  const φ1 = toRad(a[0]); const λ1 = toRad(a[1]);
  const φ2 = toRad(b[0]); const λ2 = toRad(b[1]);
  const d = 2 * Math.asin(Math.sqrt(Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2));
  if (!d || !isFinite(d)) return [a, b];
  const out: Coords[] = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    out.push([toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), toDeg(Math.atan2(y, x))]);
  }
  return out;
}

function pointAlong(line: Coords[], fraction: number) {
  if (line.length === 0) return { point: [0, 0] as Coords, traveled: [] as Coords[], remaining: [] as Coords[], heading: 0, total: 0 };
  if (line.length === 1) return { point: line[0], traveled: [line[0]], remaining: [line[0]], heading: 0, total: 0 };
  const segLen: number[] = [];
  let total = 0;
  for (let i = 0; i < line.length - 1; i++) { const d = dist(line[i], line[i + 1]); segLen.push(d); total += d; }
  const f = Math.min(1, Math.max(0, fraction));
  if (total === 0) return { point: line[0], traveled: [line[0]], remaining: line.slice(), heading: 0, total: 0 };
  const target = f * total;
  let acc = 0;
  const traveled: Coords[] = [line[0]];
  for (let i = 0; i < segLen.length; i++) {
    if (acc + segLen[i] >= target) {
      const r = segLen[i] === 0 ? 0 : (target - acc) / segLen[i];
      const pt: Coords = [
        line[i][0] + (line[i + 1][0] - line[i][0]) * r,
        line[i][1] + (line[i + 1][1] - line[i][1]) * r,
      ];
      traveled.push(pt);
      return { point: pt, traveled, remaining: [pt, ...line.slice(i + 1)], heading: bearing(line[i], line[i + 1]), total };
    }
    acc += segLen[i];
    traveled.push(line[i + 1]);
  }
  return { point: line[line.length - 1], traveled: line.slice(), remaining: [line[line.length - 1]], heading: bearing(line[line.length - 2], line[line.length - 1]), total };
}

const basemaps = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
    labels: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
  },
  streets: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '© OpenStreetMap contributors © CARTO',
    maxZoom: 20,
    labels: null as string | null,
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '© OpenTopoMap (CC-BY-SA)',
    maxZoom: 17,
    labels: null as string | null,
  },
};
type Basemap = keyof typeof basemaps;

const TrackingMap: React.FC<TrackingMapProps> = ({
  originCoords, destCoords, origin, destination, currentCoords, progress, transportMode = 'road', className,
}) => {
  const { t } = useLang();
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const labelRef = useRef<L.TileLayer | null>(null);
  const overlayRef = useRef<L.LayerGroup | null>(null);
  const fittedKey = useRef<string>('');

  const [basemap, setBasemap] = useState<Basemap>('satellite');
  const [o, setO] = useState<Coords | null>(originCoords ?? null);
  const [d, setD] = useState<Coords | null>(destCoords ?? null);
  const [line, setLine] = useState<Coords[]>([]);
  const [routeDuration, setRouteDuration] = useState<number | null>(null); // seconds
  const [nearby, setNearby] = useState<string>('');

  const color = modeColor[transportMode] || '#1e3a5f';
  const fraction = typeof progress === 'number' ? Math.min(1, Math.max(0, progress / 100)) : 0;

  // ---- resolve coordinates -------------------------------------------------
  useEffect(() => {
    let active = true;
    (async () => {
      if (originCoords) setO(originCoords);
      else if (origin) { const c = await geocode(origin); if (active) setO(c); }
      else setO(null);
      if (destCoords) setD(destCoords);
      else if (destination) { const c = await geocode(destination); if (active) setD(c); }
      else setD(null);
    })();
    return () => { active = false; };
  }, [origin, destination, originCoords, destCoords]);

  // ---- build the route ----------------------------------------------------
  useEffect(() => {
    if (!o || !d) { setLine([]); setRouteDuration(null); return; }
    const usesRoads = transportMode === 'road' || transportMode === 'rail';
    if (!usesRoads) {
      setLine(greatCircle(o, d));
      setRouteDuration(null);
      return;
    }
    setLine([o, d]);
    const controller = new AbortController();
    const url = `https://router.project-osrm.org/route/v1/driving/${o[1]},${o[0]};${d[1]},${d[0]}?overview=full&geometries=geojson`;
    fetch(url, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => {
        const route = data?.routes?.[0];
        if (route) {
          setLine(route.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as Coords));
          setRouteDuration(typeof route.duration === 'number' ? route.duration : null);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, [o, d, transportMode]);

  const along = useMemo(() => (line.length ? pointAlong(line, fraction) : null), [line, fraction]);
  const vehiclePoint = currentCoords || along?.point || null;

  const totalKm = along ? along.total / 1000 : 0;
  const remainingKm = totalKm * (1 - fraction);
  const remainingMin = useMemo(() => {
    if (routeDuration) return (routeDuration * (1 - fraction)) / 60;
    const speed = modeSpeed[transportMode] || 65;
    return (remainingKm / speed) * 60;
  }, [routeDuration, fraction, remainingKm, transportMode]);

  const eta = useMemo(() => {
    if (!totalKm || fraction >= 1) return null;
    return new Date(Date.now() + remainingMin * 60000);
  }, [remainingMin, totalKm, fraction]);

  // ---- nearby place of the moving package --------------------------------
  useEffect(() => {
    if (!vehiclePoint) { setNearby(''); return; }
    let active = true;
    const id = setTimeout(async () => {
      const name = await reverseGeocode(vehiclePoint);
      if (active) setNearby(name);
    }, 400);
    return () => { active = false; clearTimeout(id); };
  }, [vehiclePoint?.[0], vehiclePoint?.[1]]);

  // ---- map init ----------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: true, worldCopyJump: true });
    map.setView([48.5, 6], 4);
    mapRef.current = map;
    overlayRef.current = L.layerGroup().addTo(map);
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
    return () => { map.remove(); mapRef.current = null; overlayRef.current = null; tileRef.current = null; labelRef.current = null; };
  }, []);

  // ---- basemap swap ------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const cfg = basemaps[basemap];
    if (tileRef.current) map.removeLayer(tileRef.current);
    if (labelRef.current) { map.removeLayer(labelRef.current); labelRef.current = null; }
    tileRef.current = L.tileLayer(cfg.url, { attribution: cfg.attribution, maxZoom: cfg.maxZoom, detectRetina: true }).addTo(map);
    tileRef.current.setZIndex(1);
    if (cfg.labels) {
      labelRef.current = L.tileLayer(cfg.labels, { maxZoom: cfg.maxZoom, opacity: 0.9, pane: 'overlayPane' }).addTo(map);
    }
  }, [basemap]);

  // ---- draw everything ---------------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    const group = overlayRef.current;
    if (!map || !group) return;
    group.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    const pin = (bg: string, label: string) => L.divIcon({
      html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center">
        <div style="width:14px;height:14px;border-radius:50%;background:${bg};border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.45)"></div>
        <span style="margin-top:4px;white-space:nowrap;font:600 11px/1.2 system-ui;color:#fff;background:rgba(15,23,42,.82);padding:2px 6px;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,.35)">${label}</span>
      </div>`,
      className: '', iconSize: [14, 14], iconAnchor: [7, 7],
    });

    if (line.length > 1) {
      // casing + planned route + travelled portion
      L.polyline(line, { color: '#0f172a', weight: 10, opacity: 0.35, lineCap: 'round' }).addTo(group);
      L.polyline(line, { color, weight: 5, opacity: 0.95, dashArray: '1, 0', lineCap: 'round' }).addTo(group);
      if (along) {
        L.polyline(along.remaining, { color: '#ffffff', weight: 3, opacity: 0.75, dashArray: '6, 10' }).addTo(group);
        if (along.traveled.length > 1) {
          L.polyline(along.traveled, { color: '#f97316', weight: 6, opacity: 0.98, lineCap: 'round' }).addTo(group);
        }
      }
      line.forEach((p) => bounds.push(p));
    }

    if (o) {
      L.circle(o, { radius: 12000, color: '#22c55e', weight: 1, fillOpacity: 0.12 }).addTo(group);
      L.marker(o, { icon: pin('#22c55e', origin || t('nc.origin')) }).addTo(group)
        .bindPopup(`<b>📦 ${t('nc.origin')}</b><br/>${origin || ''}<br/><span style="opacity:.7">${o[0].toFixed(4)}, ${o[1].toFixed(4)}</span>`);
      bounds.push(o);
    }
    if (d) {
      L.circle(d, { radius: 12000, color: '#ef4444', weight: 1, fillOpacity: 0.12 }).addTo(group);
      L.marker(d, { icon: pin('#ef4444', destination || t('nc.destination')) }).addTo(group)
        .bindPopup(`<b>📍 ${t('nc.destination')}</b><br/>${destination || ''}<br/><span style="opacity:.7">${d[0].toFixed(4)}, ${d[1].toFixed(4)}</span>`);
      bounds.push(d);
    }

    if (vehiclePoint) {
      const heading = along?.heading ?? 0;
      const spin = transportMode === 'air' ? heading - 45 : 0;
      const vehicleIcon = L.divIcon({
        html: `<div style="position:relative;width:46px;height:46px">
          <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:.28;animation:etPulse 2s ease-out infinite"></div>
          <div style="position:absolute;inset:6px;border-radius:50%;background:rgba(255,255,255,.92);box-shadow:0 3px 12px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center">
            <span style="font-size:20px;display:block;transform:rotate(${spin}deg);animation:etBob 1.8s ease-in-out infinite">${modeEmoji[transportMode] || '🚚'}</span>
          </div>
        </div>
        <style>@keyframes etBob{0%,100%{transform:rotate(${spin}deg) translateY(0)}50%{transform:rotate(${spin}deg) translateY(-3px)}}
        @keyframes etPulse{0%{transform:scale(.7);opacity:.45}100%{transform:scale(1.4);opacity:0}}</style>`,
        className: '', iconSize: [46, 46], iconAnchor: [23, 23],
      });
      L.marker(vehiclePoint, { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(group)
        .bindPopup(`<b>${modeEmoji[transportMode]} ${Math.round(fraction * 100)}%</b>${nearby ? `<br/>${nearby}` : ''}<br/><span style="opacity:.7">${vehiclePoint[0].toFixed(4)}, ${vehiclePoint[1].toFixed(4)}</span>`);
      bounds.push(vehiclePoint);
    }

    const key = `${o?.join()}|${d?.join()}|${line.length}`;
    if (bounds.length > 0 && fittedKey.current !== key) {
      fittedKey.current = key;
      map.fitBounds(L.latLngBounds(bounds), { padding: [60, 60], maxZoom: 13 });
    }
  }, [line, along, o, d, vehiclePoint?.[0], vehiclePoint?.[1], transportMode, nearby, origin, destination, t, color, fraction]);

  const recenter = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const pts = [o, d, vehiclePoint].filter(Boolean) as Coords[];
    if (pts.length) map.fitBounds(L.latLngBounds(pts), { padding: [60, 60], maxZoom: 13 });
  }, [o, d, vehiclePoint]);

  const followPackage = useCallback(() => {
    if (mapRef.current && vehiclePoint) mapRef.current.flyTo(vehiclePoint, 11, { duration: 1.1 });
  }, [vehiclePoint]);

  const toggleFullscreen = useCallback(() => {
    const el = wrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
    setTimeout(() => mapRef.current?.invalidateSize(), 350);
  }, []);

  const fmtDur = (min: number) => {
    if (!isFinite(min) || min <= 0) return '—';
    const dd = Math.floor(min / 1440); const hh = Math.floor((min % 1440) / 60); const mm = Math.round(min % 60);
    return [dd ? `${dd}d` : '', hh ? `${hh}h` : '', !dd ? `${mm}min` : ''].filter(Boolean).join(' ');
  };

  const btn = 'px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors border border-white/20';

  return (
    <div ref={wrapperRef} className="relative w-full bg-muted rounded-lg overflow-hidden">
      <div ref={containerRef} className={`w-full ${className || 'h-[400px]'}`} />

      {/* basemap + controls */}
      <div className="absolute top-2 right-2 z-[500] flex flex-col gap-1.5 items-end">
        <div className="flex gap-1 p-1 rounded-lg bg-slate-900/80 backdrop-blur-sm">
          {(Object.keys(basemaps) as Basemap[]).map((k) => (
            <button key={k} onClick={() => setBasemap(k)}
              className={`${btn} ${basemap === k ? 'bg-secondary text-secondary-foreground' : 'text-white/80 hover:bg-white/10'}`}>
              {k === 'satellite' ? '🛰️' : k === 'streets' ? '🗺️' : '⛰️'}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-slate-900/80 backdrop-blur-sm">
          <button onClick={followPackage} className={`${btn} text-white/85 hover:bg-white/10`}>{modeEmoji[transportMode]}</button>
          <button onClick={recenter} className={`${btn} text-white/85 hover:bg-white/10`}>⤢</button>
          <button onClick={toggleFullscreen} className={`${btn} text-white/85 hover:bg-white/10`}>⛶</button>
        </div>
      </div>

      {/* live info panel */}
      <div className="absolute bottom-2 left-2 right-2 z-[500] sm:right-auto sm:max-w-[300px] rounded-lg bg-slate-900/85 backdrop-blur-md text-white p-3 shadow-lg">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-white/70">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          {t('track.map')}
        </div>
        <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
          <div><span className="text-white/60">{t('cd.progress')}:</span> <b>{Math.round(fraction * 100)}%</b></div>
          <div><span className="text-white/60">{t('nc.transportMode')}:</span> <b>{modeEmoji[transportMode]} {t(`mode.${transportMode}` as any)}</b></div>
          <div><span className="text-white/60">Total:</span> <b>{totalKm ? `${totalKm.toFixed(0)} km` : '—'}</b></div>
          <div><span className="text-white/60">Reste:</span> <b>{totalKm ? `${remainingKm.toFixed(0)} km` : '—'}</b></div>
          <div className="col-span-2"><span className="text-white/60">ETA:</span>{' '}
            <b>{eta ? `${eta.toLocaleString()} (${fmtDur(remainingMin)})` : fraction >= 1 ? '✅' : '—'}</b>
          </div>
          {nearby && <div className="col-span-2 truncate"><span className="text-white/60">📍</span> <b>{nearby}</b></div>}
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
          <div className="h-full rounded-full bg-orange-500 transition-all duration-700" style={{ width: `${fraction * 100}%` }} />
        </div>
      </div>
    </div>
  );
};

export default TrackingMap;

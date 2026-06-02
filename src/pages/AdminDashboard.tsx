import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Pause, Play, MapPin, Package, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApp, generateTrackingNumber } from '@/context/AppContext';
import type { Shipment } from '@/context/AppContext';
import TrackingMap from '@/components/TrackingMap';
import TicketsManager from '@/components/TicketsManager';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<string, string> = {
  pending: 'bg-warning text-warning-foreground',
  in_transit: 'bg-info text-info-foreground',
  paused: 'bg-destructive text-destructive-foreground',
  delivered: 'bg-success text-success-foreground',
  cancelled: 'bg-muted text-muted-foreground',
};

const modeLabels: Record<string, string> = {
  road: '🚚 Road Freight',
  sea: '🚢 Sea Freight',
  air: '✈️ Air Freight',
  rail: '🚆 Rail Freight',
};

const geocode = async (place: string): Promise<[number, number] | null> => {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`);
    const data = await r.json();
    if (data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {}
  return null;
};

// Great-circle distance in km
const haversineKm = (a: [number, number], b: [number, number]): number => {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLon = (b[1] - a[1]) * Math.PI / 180;
  const lat1 = a[0] * Math.PI / 180;
  const lat2 = b[0] * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

// Estimate ETA date based on transport mode. Road/rail use OSRM; air/sea use distance/speed.
const computeEta = async (
  origin: [number, number],
  dest: [number, number],
  mode: Shipment['transportMode'],
): Promise<string> => {
  let hours = 0;
  if (mode === 'road' || mode === 'rail') {
    try {
      const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${dest[1]},${dest[0]}?overview=false`);
      const data = await r.json();
      if (data.routes?.[0]) hours = data.routes[0].duration / 3600;
    } catch {}
    if (mode === 'rail' && hours) hours = hours * 0.8;
  }
  if (!hours) {
    const km = haversineKm(origin, dest);
    const speed = mode === 'air' ? 800 : mode === 'sea' ? 40 : mode === 'rail' ? 80 : 70; // km/h
    hours = km / speed;
  }
  const arr = new Date();
  arr.setHours(arr.getHours() + Math.ceil(hours));
  return arr.toISOString().split('T')[0];
};

const AdminDashboard: React.FC = () => {
  const { isAdminLoggedIn, shipments, addShipment, updateShipment, deleteShipment } = useApp();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [pauseId, setPauseId] = useState<string | null>(null);
  const [pauseReason, setPauseReason] = useState('');
  const [viewId, setViewId] = useState<string | null>(null);
  const [form, setForm] = useState({
    clientName: '', clientEmail: '', origin: '', destination: '',
    weight: '', dimensions: '', packageType: 'Standard Box',
    status: 'pending' as Shipment['status'], progress: 0,
    transportMode: 'road' as Shipment['transportMode'],
  });

  if (!isAdminLoggedIn) return <Navigate to="/admin/login" />;

  const resetForm = () => setForm({
    clientName: '', clientEmail: '', origin: '', destination: '',
    weight: '', dimensions: '', packageType: 'Standard Box', status: 'pending', progress: 0,
    transportMode: 'road',
  });

  const handleCreate = async () => {
    const originCoords = await geocode(form.origin);
    const destCoords = await geocode(form.destination);

    // Get ETA based on selected transport mode
    let eta = 'Calculating...';
    if (originCoords && destCoords) {
      eta = await computeEta(originCoords, destCoords, form.transportMode);
    }

    const newShipment: Shipment = {
      id: crypto.randomUUID(),
      trackingNumber: generateTrackingNumber(),
      clientName: form.clientName,
      clientEmail: form.clientEmail,
      origin: form.origin,
      destination: form.destination,
      originCoords,
      destCoords,
      currentCoords: originCoords,
      status: 'pending',
      progress: 0,
      transportMode: form.transportMode,
      estimatedArrival: eta,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      weight: form.weight,
      dimensions: form.dimensions,
      packageType: form.packageType,
      route: [],
      history: [{ id: '1', timestamp: new Date().toLocaleString(), status: 'Order Created', location: form.origin, description: 'Shipment order has been created' }],
    };

    addShipment(newShipment);
    toast({ title: 'Shipment Created', description: `Tracking: ${newShipment.trackingNumber}` });
    setCreateOpen(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (!editId) return;
    const updates: Partial<Shipment> = {
      clientName: form.clientName, clientEmail: form.clientEmail,
      origin: form.origin, destination: form.destination,
      weight: form.weight, dimensions: form.dimensions,
      packageType: form.packageType, status: form.status, progress: form.progress,
      transportMode: form.transportMode,
    };

    const existing = shipments.find(s => s.id === editId);
    const routeChanged = existing && (existing.destination !== form.destination || existing.origin !== form.origin);
    const modeChanged = existing && existing.transportMode !== form.transportMode;
    if (routeChanged) {
      // Destination changed - generate new tracking number
      updates.trackingNumber = generateTrackingNumber();
      updates.originCoords = await geocode(form.origin);
      updates.destCoords = await geocode(form.destination);
      updates.currentCoords = updates.originCoords;
      
      if (updates.originCoords && updates.destCoords) {
        updates.estimatedArrival = await computeEta(updates.originCoords, updates.destCoords, form.transportMode);
      }

      updates.history = [...(existing.history || []), {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleString(),
        status: 'Route Changed',
        location: form.origin,
        description: `New tracking number: ${updates.trackingNumber}. Route changed to ${form.destination}`,
      }];

      toast({ title: 'Route Changed', description: `New tracking number: ${updates.trackingNumber}` });
    } else if (modeChanged && existing?.originCoords && existing?.destCoords) {
      // Recalculate ETA when only the transport mode changes
      updates.estimatedArrival = await computeEta(existing.originCoords, existing.destCoords, form.transportMode);
    }

    updateShipment(editId, updates);
    toast({ title: 'Shipment Updated' });
    setEditId(null);
    resetForm();
  };

  const handlePause = () => {
    if (!pauseId || !pauseReason.trim()) return;
    const existing = shipments.find(s => s.id === pauseId);
    updateShipment(pauseId, {
      status: 'paused',
      pauseReason: pauseReason,
      history: [...(existing?.history || []), {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleString(),
        status: 'Paused',
        location: existing?.origin || '',
        description: `Shipment paused: ${pauseReason}`,
      }],
    });
    toast({ title: 'Shipment Paused', description: 'Client has been notified with the reason.' });
    setPauseId(null);
    setPauseReason('');
  };

  const handleResume = (id: string) => {
    const existing = shipments.find(s => s.id === id);
    updateShipment(id, {
      status: 'in_transit',
      pauseReason: undefined,
      history: [...(existing?.history || []), {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleString(),
        status: 'Resumed',
        location: '',
        description: 'Shipment resumed',
      }],
    });
    toast({ title: 'Shipment Resumed' });
  };

  const handleSimulate = (id: string) => {
    const s = shipments.find(sh => sh.id === id);
    if (!s || !s.originCoords || !s.destCoords) return;
    const newProgress = Math.min(s.progress + 15, 100);
    const lat = s.originCoords[0] + (s.destCoords[0] - s.originCoords[0]) * (newProgress / 100);
    const lng = s.originCoords[1] + (s.destCoords[1] - s.originCoords[1]) * (newProgress / 100);
    updateShipment(id, {
      progress: newProgress,
      currentCoords: [lat, lng],
      status: newProgress >= 100 ? 'delivered' : 'in_transit',
      history: [...(s.history || []), {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleString(),
        status: newProgress >= 100 ? 'Delivered' : 'In Transit',
        location: `${lat.toFixed(2)}, ${lng.toFixed(2)}`,
        description: newProgress >= 100 ? 'Package delivered' : `Package progress: ${newProgress}%`,
      }],
    });
  };

  const openEdit = (s: Shipment) => {
    setForm({
      clientName: s.clientName, clientEmail: s.clientEmail,
      origin: s.origin, destination: s.destination,
      weight: s.weight, dimensions: s.dimensions,
      packageType: s.packageType, status: s.status, progress: s.progress,
      transportMode: s.transportMode,
    });
    setEditId(s.id);
  };

  const viewShipment = shipments.find(s => s.id === viewId);

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage shipments and track deliveries</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Plus className="w-4 h-4" /> New Shipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create New Shipment</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-sm font-medium">Client Name</label><Input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} /></div>
                  <div><label className="text-sm font-medium">Client Email</label><Input value={form.clientEmail} onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))} /></div>
                </div>
                <div><label className="text-sm font-medium">Origin Location</label><Input value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} placeholder="e.g. New York, USA" /></div>
                <div><label className="text-sm font-medium">Destination Location</label><Input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} placeholder="e.g. London, UK" /></div>
                <div>
                  <label className="text-sm font-medium">Transport Mode</label>
                  <Select value={form.transportMode} onValueChange={v => setForm(f => ({ ...f, transportMode: v as Shipment['transportMode'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="road">🚚 Road Freight</SelectItem>
                      <SelectItem value="sea">🚢 Sea Freight</SelectItem>
                      <SelectItem value="air">✈️ Air Freight</SelectItem>
                      <SelectItem value="rail">🚆 Rail Freight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="text-sm font-medium">Weight</label><Input value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} placeholder="12 kg" /></div>
                  <div><label className="text-sm font-medium">Dimensions</label><Input value={form.dimensions} onChange={e => setForm(f => ({ ...f, dimensions: e.target.value }))} placeholder="40x30x20" /></div>
                  <div><label className="text-sm font-medium">Type</label><Input value={form.packageType} onChange={e => setForm(f => ({ ...f, packageType: e.target.value }))} /></div>
                </div>
                <Button onClick={handleCreate} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">Create Shipment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {(['pending', 'in_transit', 'paused', 'delivered', 'cancelled'] as const).map(status => (
            <Card key={status}>
              <CardContent className="py-4 text-center">
                <div className="text-2xl font-bold text-foreground">{shipments.filter(s => s.status === status).length}</div>
                <div className="text-xs text-muted-foreground capitalize">{status.replace('_', ' ')}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Shipment Table */}
        <Card>
          <CardHeader><CardTitle>All Shipments</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Tracking</th>
                    <th className="pb-3 font-medium text-muted-foreground">Client</th>
                    <th className="pb-3 font-medium text-muted-foreground">Route</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 font-medium text-muted-foreground">Progress</th>
                    <th className="pb-3 font-medium text-muted-foreground">ETA</th>
                    <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map(s => (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 font-mono text-xs">{s.trackingNumber}</td>
                      <td className="py-3">{s.clientName}</td>
                      <td className="py-3 text-xs">{s.origin} → {s.destination}<div className="text-muted-foreground">{modeLabels[s.transportMode]}</div></td>
                      <td className="py-3"><Badge className={statusColors[s.status] + ' text-xs'}>{s.status.replace('_', ' ')}</Badge></td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full"><div className="h-full bg-secondary rounded-full" style={{ width: `${s.progress}%` }} /></div>
                          <span className="text-xs">{s.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 text-xs">{s.estimatedArrival}</td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewId(s.id)}><Eye className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(s)}><Edit className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleSimulate(s.id)}><RefreshCw className="w-3.5 h-3.5" /></Button>
                          {s.status !== 'paused' ? (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPauseId(s.id)}><Pause className="w-3.5 h-3.5" /></Button>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleResume(s.id)}><Play className="w-3.5 h-3.5" /></Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { deleteShipment(s.id); toast({ title: 'Shipment deleted' }); }}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editId} onOpenChange={open => { if (!open) setEditId(null); }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Shipment</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium">Client Name</label><Input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} /></div>
                <div><label className="text-sm font-medium">Client Email</label><Input value={form.clientEmail} onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))} /></div>
              </div>
              <div><label className="text-sm font-medium">Origin</label><Input value={form.origin} onChange={e => setForm(f => ({ ...f, origin: e.target.value }))} /></div>
              <div><label className="text-sm font-medium">Destination (changing generates new tracking#)</label><Input value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} /></div>
              <div>
                <label className="text-sm font-medium">Transport Mode</label>
                <Select value={form.transportMode} onValueChange={v => setForm(f => ({ ...f, transportMode: v as Shipment['transportMode'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="road">🚚 Road Freight</SelectItem>
                    <SelectItem value="sea">🚢 Sea Freight</SelectItem>
                    <SelectItem value="air">✈️ Air Freight</SelectItem>
                    <SelectItem value="rail">🚆 Rail Freight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Shipment['status'] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><label className="text-sm font-medium">Progress (%)</label><Input type="number" min={0} max={100} value={form.progress} onChange={e => setForm(f => ({ ...f, progress: Number(e.target.value) }))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-sm font-medium">Weight</label><Input value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} /></div>
                <div><label className="text-sm font-medium">Dimensions</label><Input value={form.dimensions} onChange={e => setForm(f => ({ ...f, dimensions: e.target.value }))} /></div>
                <div><label className="text-sm font-medium">Type</label><Input value={form.packageType} onChange={e => setForm(f => ({ ...f, packageType: e.target.value }))} /></div>
              </div>
              <Button onClick={handleEdit} className="w-full bg-primary text-primary-foreground">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Pause Dialog */}
        <Dialog open={!!pauseId} onOpenChange={open => { if (!open) setPauseId(null); }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Pause Shipment</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">Please provide a reason for pausing. This will be visible to the client.</p>
            <Textarea value={pauseReason} onChange={e => setPauseReason(e.target.value)} placeholder="Enter reason for pausing..." rows={3} />
            <Button onClick={handlePause} className="w-full bg-destructive text-destructive-foreground">Pause & Notify Client</Button>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={!!viewId} onOpenChange={open => { if (!open) setViewId(null); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Shipment Details</DialogTitle></DialogHeader>
            {viewShipment && (
              <div className="space-y-4">
                <TrackingMap originCoords={viewShipment.originCoords} destCoords={viewShipment.destCoords} currentCoords={viewShipment.currentCoords} transportMode={viewShipment.transportMode} className="h-[300px]" />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Tracking:</span> <span className="font-mono">{viewShipment.trackingNumber}</span></div>
                  <div><span className="text-muted-foreground">Client:</span> {viewShipment.clientName}</div>
                  <div><span className="text-muted-foreground">Origin:</span> {viewShipment.origin}</div>
                  <div><span className="text-muted-foreground">Destination:</span> {viewShipment.destination}</div>
                  <div><span className="text-muted-foreground">Transport:</span> <span className="capitalize">{modeLabels[viewShipment.transportMode]}</span></div>
                  <div><span className="text-muted-foreground">ETA:</span> {viewShipment.estimatedArrival}</div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge className={statusColors[viewShipment.status]}>{viewShipment.status}</Badge></div>
                </div>
                <TicketsManager shipment={viewShipment} />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;

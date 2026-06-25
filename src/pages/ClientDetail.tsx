import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Trash2, Save, Plus, MapPin, Clock } from 'lucide-react';
import ClientTicketsManager from '@/components/ClientTicketsManager';

const ClientDetail: React.FC = () => {
  const { id } = useParams();
  const { adminInvoke } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({ eventDescription: '', location: '' });

  const load = useCallback(async () => {
    try {
      const res = await adminInvoke('getClient', { id });
      setClient(res.client);
      setEvents(res.events ?? []);
      setTickets(res.tickets ?? []);
    } catch {
      toast({ title: 'Failed to load client', variant: 'destructive' });
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  }, [adminInvoke, id, navigate, toast]);

  useEffect(() => { load(); }, [load]);

  const setField = (k: string) => (e: any) => setClient({ ...client, [k]: e.target ? e.target.value : e });

  const save = async () => {
    setSaving(true);
    try {
      await adminInvoke('updateClient', {
        id,
        clientName: client.client_name,
        phone: client.phone,
        email: client.email,
        shipmentDescription: client.shipment_description,
        origin: client.origin,
        destination: client.destination,
        status: client.status,
      });
      toast({ title: 'Saved' });
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const addEvent = async () => {
    if (!newEvent.eventDescription.trim()) return;
    await adminInvoke('addEvent', { clientId: id, ...newEvent });
    setNewEvent({ eventDescription: '', location: '' });
    load();
  };

  const remove = async () => {
    await adminInvoke('deleteClient', { id });
    toast({ title: 'Client deleted' });
    navigate('/admin/dashboard');
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  if (!client) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/admin/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{client.client_name}</h1>
          <Badge variant="secondary" className="font-mono mt-1">{client.tracking_code}</Badge>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this client?</AlertDialogTitle>
              <AlertDialogDescription>The tracking code will never be reused. This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>Shipment details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Client name</Label><Input value={client.client_name || ''} onChange={setField('client_name')} /></div>
            <div className="space-y-2"><Label>Status</Label>
              <Select value={client.status} onValueChange={setField('status')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_transit">In transit</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Phone</Label><Input value={client.phone || ''} onChange={setField('phone')} /></div>
            <div className="space-y-2"><Label>Email</Label><Input value={client.email || ''} onChange={setField('email')} /></div>
            <div className="space-y-2"><Label>Origin</Label><Input value={client.origin || ''} onChange={setField('origin')} /></div>
            <div className="space-y-2"><Label>Destination</Label><Input value={client.destination || ''} onChange={setField('destination')} /></div>
          </div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={client.shipment_description || ''} onChange={setField('shipment_description')} rows={3} /></div>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save changes</>}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tracking timeline</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-[1fr,1fr,auto] gap-2 items-end">
            <div className="space-y-2"><Label>Event</Label><Input value={newEvent.eventDescription} onChange={(e) => setNewEvent({ ...newEvent, eventDescription: e.target.value })} placeholder="e.g. Arrived at hub" /></div>
            <div className="space-y-2"><Label>Location</Label><Input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="e.g. Lyon" /></div>
            <Button onClick={addEvent}><Plus className="w-4 h-4 mr-2" /> Add</Button>
          </div>
          <div className="space-y-3 pt-2">
            {events.length === 0 ? (
              <p className="text-muted-foreground text-sm">No events yet.</p>
            ) : events.map((ev) => (
              <div key={ev.id} className="flex gap-3 border-l-2 border-primary/40 pl-4 py-1">
                <div>
                  <p className="font-medium">{ev.event_description}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-3">
                    {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {ev.location}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ev.event_time).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <ClientTicketsManager
          clientId={client.id}
          clientName={client.client_name}
          trackingCode={client.tracking_code}
          origin={client.origin || ''}
          destination={client.destination || ''}
          initialTickets={tickets}
        />
      </div>
    </div>
  );
};

export default ClientDetail;
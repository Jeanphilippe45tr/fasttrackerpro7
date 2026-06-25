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
import { Slider } from '@/components/ui/slider';
import { useLang } from '@/i18n/LanguageContext';
import TrackingMap from '@/components/TrackingMap';
import ChatWidget from '@/components/ChatWidget';
import type { ChatMessage } from '@/context/AppContext';

const ClientDetail: React.FC = () => {
  const { id } = useParams();
  const { adminInvoke } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLang();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [client, setClient] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [newEvent, setNewEvent] = useState({ eventDescription: '', location: '' });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const mapRows = (rows: any[]): ChatMessage[] => (rows ?? []).map((m) => ({
    id: m.id,
    shipmentId: m.shipment_id,
    sender: m.sender,
    message: m.message,
    timestamp: new Date(m.created_at).toLocaleString(),
    readByAdmin: m.read_by_admin,
    readByClient: m.read_by_client,
  }));

  const loadMessages = useCallback(async () => {
    if (!id) return;
    try {
      const res = await adminInvoke('listMessages', { clientId: id });
      setChatMessages(mapRows(res.messages));
    } catch { /* ignore */ }
  }, [adminInvoke, id]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  const handleAdminSend = async (text: string) => {
    await adminInvoke('sendMessage', { clientId: id, message: text });
    loadMessages();
  };
  const handleAdminRead = async () => {
    await adminInvoke('markRead', { clientId: id });
    setChatMessages((prev) => prev.map((m) => ({ ...m, readByAdmin: true })));
  };

  const load = useCallback(async () => {
    try {
      const res = await adminInvoke('getClient', { id });
      setClient(res.client);
      setEvents(res.events ?? []);
      setTickets(res.tickets ?? []);
    } catch {
      toast({ title: t('cd.loadFailed'), variant: 'destructive' });
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  }, [adminInvoke, id, navigate, toast, t]);

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
        progress: client.progress ?? 0,
        transportMode: client.transport_mode ?? 'road',
      });
      toast({ title: t('cd.saved') });
    } catch {
      toast({ title: t('cd.saveFailed'), variant: 'destructive' });
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
    toast({ title: t('cd.deleted') });
    navigate('/admin/dashboard');
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  if (!client) return null;

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/admin/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{client.client_name}</h1>
          <Badge variant="secondary" className="font-mono mt-1">{client.tracking_code}</Badge>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> {t('cd.delete')}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('cd.deleteTitle')}</AlertDialogTitle>
              <AlertDialogDescription>{t('cd.deleteDesc')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={remove}>{t('cd.delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="mb-6">
        <CardHeader><CardTitle>{t('cd.shipmentDetails')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>{t('nc.clientName')}</Label><Input value={client.client_name || ''} onChange={setField('client_name')} /></div>
            <div className="space-y-2"><Label>{t('nc.status')}</Label>
              <Select value={client.status} onValueChange={setField('status')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t('opt.pending')}</SelectItem>
                  <SelectItem value="in_transit">{t('opt.in_transit')}</SelectItem>
                  <SelectItem value="delivered">{t('opt.delivered')}</SelectItem>
                  <SelectItem value="failed">{t('opt.failed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{t('nc.phone')}</Label><Input value={client.phone || ''} onChange={setField('phone')} /></div>
            <div className="space-y-2"><Label>{t('nc.email')}</Label><Input value={client.email || ''} onChange={setField('email')} /></div>
            <div className="space-y-2"><Label>{t('nc.origin')}</Label><Input value={client.origin || ''} onChange={setField('origin')} /></div>
            <div className="space-y-2"><Label>{t('nc.destination')}</Label><Input value={client.destination || ''} onChange={setField('destination')} /></div>
            <div className="space-y-2">
              <Label>{t('nc.transportMode')}</Label>
              <Select value={client.transport_mode || 'road'} onValueChange={setField('transport_mode')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="road">🚚 {t('mode.road')}</SelectItem>
                  <SelectItem value="sea">🚢 {t('mode.sea')}</SelectItem>
                  <SelectItem value="air">✈️ {t('mode.air')}</SelectItem>
                  <SelectItem value="rail">🚆 {t('mode.rail')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>{t('nc.description')}</Label><Textarea value={client.shipment_description || ''} onChange={setField('shipment_description')} rows={3} /></div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('cd.progress')}</Label>
              <span className="text-sm font-semibold text-secondary">{client.progress ?? 0}%</span>
            </div>
            <Slider value={[client.progress ?? 0]} min={0} max={100} step={1}
              onValueChange={(v) => setClient({ ...client, progress: v[0] })} />
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${client.progress ?? 0}%` }} />
            </div>
            <p className="text-xs text-muted-foreground">{t('cd.progressHint')}</p>
          </div>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> {t('cd.save')}</>}
          </Button>
        </CardContent>
      </Card>

      {(client.origin || client.destination) && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="w-5 h-5 text-secondary" /> {t('track.map')}</CardTitle></CardHeader>
          <CardContent>
            <TrackingMap
              origin={client.origin || ''}
              destination={client.destination || ''}
              progress={client.progress ?? 0}
              className="h-[320px] md:h-[420px]"
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>{t('cd.timeline')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-[1fr,1fr,auto] gap-2 items-end">
            <div className="space-y-2"><Label>{t('cd.event')}</Label><Input value={newEvent.eventDescription} onChange={(e) => setNewEvent({ ...newEvent, eventDescription: e.target.value })} placeholder="e.g. Arrived at hub" /></div>
            <div className="space-y-2"><Label>{t('cd.location')}</Label><Input value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} placeholder="e.g. Lyon" /></div>
            <Button onClick={addEvent}><Plus className="w-4 h-4 mr-2" /> {t('cd.add')}</Button>
          </div>
          <div className="space-y-3 pt-2">
            {events.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('cd.noEvents')}</p>
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

      <div className="mt-6">
        <ChatWidget
          shipmentId={client.id}
          senderRole="admin"
          externalMessages={chatMessages}
          onSend={handleAdminSend}
          onRead={handleAdminRead}
        />
      </div>
    </div>
  );
};

export default ClientDetail;
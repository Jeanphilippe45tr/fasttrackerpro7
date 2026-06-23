import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Package, MapPin, Clock, AlertCircle, CheckCircle, Pause, MessageSquare, Download, FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TrackingMap from '@/components/TrackingMap';
import { useApp } from '@/context/AppContext';
import type { Shipment, Ticket } from '@/context/AppContext';
import ChatWidget from '@/components/ChatWidget';
import { generateTicketPdf } from '@/lib/ticketPdf';
import TicketPreview from '@/components/TicketPreview';
import { Badge as Bdg } from '@/components/ui/badge';

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  pending: { color: 'bg-warning text-warning-foreground', icon: Clock, label: 'Pending' },
  in_transit: { color: 'bg-info text-info-foreground', icon: Package, label: 'In Transit' },
  paused: { color: 'bg-destructive text-destructive-foreground', icon: Pause, label: 'On Hold' },
  delivered: { color: 'bg-success text-success-foreground', icon: CheckCircle, label: 'Delivered' },
  cancelled: { color: 'bg-muted text-muted-foreground', icon: AlertCircle, label: 'Cancelled' },
};

const TrackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [trackingInput, setTrackingInput] = useState(searchParams.get('id') || '');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [previewTicket, setPreviewTicket] = useState<Ticket | null>(null);
  const { trackShipment, sendClientMessage, getClientMessages, markClientRead } = useApp();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [clientMessages, setClientMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTracking, setActiveTracking] = useState<string>('');

  const clientUnread = shipment
    ? clientMessages.filter(m => m.shipmentId === shipment.id && m.sender === 'admin' && !m.readByClient).length
    : 0;

  const runSearch = useCallback(async (tracking: string) => {
    const t = tracking.trim();
    if (!t) return;
    setLoading(true);
    setNotFound(false);
    const result = await trackShipment(t);
    setLoading(false);
    if (!result) {
      setShipment(null);
      setTickets([]);
      setClientMessages([]);
      setActiveTracking('');
      setNotFound(true);
      return;
    }
    setShipment(result.shipment);
    setTickets(result.tickets);
    setClientMessages(result.messages);
    setActiveTracking(result.shipment.trackingNumber);
  }, [trackShipment]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setTrackingInput(id);
      runSearch(id);
    }
  }, [searchParams, runSearch]);

  // Poll client chat messages while a shipment is loaded.
  useEffect(() => {
    if (!activeTracking) return;
    const interval = setInterval(async () => {
      const msgs = await getClientMessages(activeTracking);
      setClientMessages(msgs);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeTracking, getClientMessages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(trackingInput);
  };

  const handleClientSend = async (text: string) => {
    if (!activeTracking) return;
    await sendClientMessage(activeTracking, text);
    const msgs = await getClientMessages(activeTracking);
    setClientMessages(msgs);
  };

  const handleClientRead = async () => {
    if (!activeTracking) return;
    await markClientRead(activeTracking);
    setClientMessages(prev => prev.map(m => ({ ...m, readByClient: true })));
  };

  const sc = shipment ? statusConfig[shipment.status] : null;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Track Your Package</h1>
            <p className="text-muted-foreground">Enter your tracking number to see real-time updates</p>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 mb-8 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input value={trackingInput} onChange={e => setTrackingInput(e.target.value)} placeholder="Enter tracking number..." className="pl-10 h-12" />
            </div>
            <Button type="submit" className="h-12 px-6 bg-secondary text-secondary-foreground hover:bg-secondary/90">Track</Button>
          </form>

          {loading && trackingInput && (
            <div className="text-center py-8 text-muted-foreground">Loading shipment data...</div>
          )}

          {notFound && !loading && (
            <Card className="mb-8 border-destructive/30">
              <CardContent className="py-8 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                <h3 className="font-semibold text-lg text-foreground mb-1">Package Not Found</h3>
                <p className="text-muted-foreground text-sm">Please check your tracking number and try again.</p>
              </CardContent>
            </Card>
          )}

          {shipment && sc && (
            <div className="space-y-6">
              {/* Status Banner */}
              <Card>
                <CardContent className="py-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={sc.color}><sc.icon className="w-3 h-3 mr-1" />{sc.label}</Badge>
                        <span className="text-sm text-muted-foreground font-mono">{shipment.trackingNumber}</span>
                      </div>
                      <h2 className="text-xl font-bold text-foreground">{shipment.origin} → {shipment.destination}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Estimated Arrival</div>
                      <div className="font-semibold text-foreground">{shipment.estimatedArrival}</div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{shipment.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full transition-all duration-500" style={{ width: `${shipment.progress}%` }} />
                    </div>
                  </div>
                  {/* Only show pause reason, no header */}
                  {shipment.status === 'paused' && shipment.pauseReason && (
                    <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-muted-foreground">{shipment.pauseReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Map */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-secondary" />Live Tracking Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <TrackingMap
                    originCoords={shipment.originCoords}
                    destCoords={shipment.destCoords}
                    currentCoords={shipment.currentCoords}
                    route={shipment.route}
                    transportMode={shipment.transportMode}
                    className="h-[350px] md:h-[450px]"
                  />
                </CardContent>
              </Card>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Package Details</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Client</span><span className="font-medium text-foreground">{shipment.clientName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Weight</span><span className="font-medium text-foreground">{shipment.weight}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Dimensions</span><span className="font-medium text-foreground">{shipment.dimensions}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium text-foreground">{shipment.packageType}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Transport</span><span className="font-medium text-foreground capitalize">{shipment.transportMode === 'sea' ? '🚢 Sea Freight' : shipment.transportMode === 'air' ? '✈️ Air Freight' : shipment.transportMode === 'rail' ? '🚆 Rail Freight' : '🚚 Road Freight'}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span className="font-medium text-foreground">{shipment.createdAt}</span></div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-lg">Shipment History</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {shipment.history.map((event, i) => (
                        <div key={event.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-secondary' : 'bg-border'}`} />
                            {i < shipment.history.length - 1 && <div className="w-px h-full bg-border" />}
                          </div>
                          <div className="pb-4">
                            <div className="font-medium text-foreground text-sm">{event.status}</div>
                            <div className="text-xs text-muted-foreground">{event.location} · {event.timestamp}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{event.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat Button */}
              <div className="text-center">
                <Button onClick={() => setChatOpen(!chatOpen)} className="gap-2 bg-primary text-primary-foreground relative">
                  <MessageSquare className="w-4 h-4" /> Chat with Support
                  {clientUnread > 0 && !chatOpen && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                      {clientUnread}
                    </span>
                  )}
                </Button>
              </div>

              {/* Tickets */}
              {tickets.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-secondary" /> Payment Tickets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {tickets.map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{t.title}</span>
                            <Bdg className={t.ticketType === 'paid' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                              {t.ticketType === 'paid' ? 'PAID' : 'TO PAY'}
                            </Bdg>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">{t.ticketNumber} · {t.currency} {t.amount.toFixed(2)}</div>
                          {t.notes && <div className="text-xs text-muted-foreground mt-1">{t.notes}</div>}
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="gap-1"
                            onClick={() => setPreviewTicket(t)}>
                            <Eye className="w-4 h-4" /> View
                          </Button>
                          <Button size="sm" className="gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                            onClick={() => generateTicketPdf(t, { trackingNumber: shipment.trackingNumber, origin: shipment.origin, destination: shipment.destination, clientName: shipment.clientName }).catch(console.error)}>
                            <Download className="w-4 h-4" /> PDF
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {chatOpen && <ChatWidget shipmentId={shipment.id} senderRole="client" />}
              <TicketPreview ticket={previewTicket}
                shipmentInfo={{ trackingNumber: shipment.trackingNumber, origin: shipment.origin, destination: shipment.destination, clientName: shipment.clientName }}
                open={!!previewTicket} onClose={() => setPreviewTicket(null)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackPage;

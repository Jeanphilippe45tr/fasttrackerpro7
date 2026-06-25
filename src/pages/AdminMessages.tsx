import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, MessageSquare, Search } from 'lucide-react';
import ChatWidget from '@/components/ChatWidget';
import PushToggle from '@/components/PushToggle';
import type { ChatMessage } from '@/context/AppContext';
import { useLang } from '@/i18n/LanguageContext';
import { notifyOnNewIncoming } from '@/lib/notify';

const mapRows = (rows: any[]): ChatMessage[] => (rows ?? []).map((m) => ({
  id: m.id,
  shipmentId: m.shipment_id,
  sender: m.sender,
  message: m.message,
  timestamp: new Date(m.created_at).toLocaleString(),
  readByAdmin: m.read_by_admin,
  readByClient: m.read_by_client,
}));

const AdminMessages: React.FC = () => {
  const { adminInvoke, token } = useAuth();
  const navigate = useNavigate();
  const { t } = useLang();
  const [clients, setClients] = useState<any[]>([]);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [active, setActive] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const prevTotalUnread = useRef<number>(-1);

  const loadClients = useCallback(async () => {
    try {
      const res = await adminInvoke('listClients');
      const list = res.clients ?? [];
      setClients(list);
      // compute unread counts
      const counts: Record<string, number> = {};
      await Promise.all(list.map(async (c: any) => {
        try {
          const m = await adminInvoke('listMessages', { clientId: c.id });
          counts[c.id] = (m.messages ?? []).filter((x: any) => x.sender === 'client' && !x.read_by_admin).length;
        } catch { counts[c.id] = 0; }
      }));
      setUnread(counts);
      const totalUnread = Object.values(counts).reduce((a, b) => a + b, 0);
      prevTotalUnread.current = notifyOnNewIncoming(prevTotalUnread.current, totalUnread);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [adminInvoke]);

  useEffect(() => { loadClients(); }, [loadClients]);

  // Poll all clients for new incoming messages so the sound plays even when no
  // conversation is open.
  useEffect(() => {
    const interval = setInterval(loadClients, 8000);
    return () => clearInterval(interval);
  }, [loadClients]);

  const loadMessages = useCallback(async (clientId: string) => {
    try {
      const res = await adminInvoke('listMessages', { clientId });
      setChatMessages(mapRows(res.messages));
    } catch { /* ignore */ }
  }, [adminInvoke]);

  useEffect(() => {
    if (!active) return;
    loadMessages(active.id);
    const interval = setInterval(() => loadMessages(active.id), 5000);
    return () => clearInterval(interval);
  }, [active, loadMessages]);

  const handleSend = async (text: string) => {
    if (!active) return;
    await adminInvoke('sendMessage', { clientId: active.id, message: text });
    loadMessages(active.id);
  };
  const handleRead = async () => {
    if (!active) return;
    await adminInvoke('markRead', { clientId: active.id });
    setChatMessages((prev) => prev.map((m) => ({ ...m, readByAdmin: true })));
    setUnread((prev) => ({ ...prev, [active.id]: 0 }));
  };

  const filtered = clients.filter((c) =>
    `${c.client_name} ${c.tracking_code}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" className="mb-4" onClick={() => navigate('/admin/dashboard')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}
      </Button>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-secondary" />
          <h1 className="text-2xl font-bold">{t('chat.title')}</h1>
        </div>
        <PushToggle subscriberType="admin" token={token ?? undefined} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[320px,1fr] gap-6">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('adm.dash.search')} className="pl-8" />
            </div>
          </CardHeader>
          <CardContent className="p-2">
            {loading ? (
              <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">{t('adm.dash.noClients')}</p>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto space-y-1">
                {filtered.map((c) => (
                  <button key={c.id} onClick={() => setActive(c)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between gap-2 transition-colors ${active?.id === c.id ? 'bg-primary/10' : 'hover:bg-muted'}`}>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{c.client_name}</p>
                      <p className="text-xs text-muted-foreground font-mono truncate">{c.tracking_code}</p>
                    </div>
                    {unread[c.id] > 0 && (
                      <Badge className="bg-destructive text-destructive-foreground">{unread[c.id]}</Badge>
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          {active ? (
            <ChatWidget
              shipmentId={active.id}
              senderRole="admin"
              externalMessages={chatMessages}
              onSend={handleSend}
              onRead={handleRead}
            />
          ) : (
            <Card><CardContent className="py-20 text-center text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">{t('chat.empty')}</p>
            </CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
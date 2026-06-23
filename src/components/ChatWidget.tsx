import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import type { ChatMessage } from '@/context/AppContext';
import { useLang } from '@/i18n/LanguageContext';

interface ChatWidgetProps {
  shipmentId: string;
  senderRole: 'admin' | 'client';
  /** Controlled (client) mode — when provided, the widget uses these instead of admin context. */
  externalMessages?: ChatMessage[];
  onSend?: (text: string) => void;
  onRead?: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ shipmentId, senderRole, externalMessages, onSend, onRead }) => {
  const [msg, setMsg] = useState('');
  const { messages, addMessage, markMessagesRead } = useApp();
  const { t } = useLang();
  const bottomRef = useRef<HTMLDivElement>(null);

  const controlled = externalMessages !== undefined;
  const sourceMessages = controlled ? externalMessages! : messages;

  const chatMessages = sourceMessages.filter(m => m.shipmentId === shipmentId);
  const unread = chatMessages.filter(m => m.sender !== senderRole && !(senderRole === 'admin' ? m.readByAdmin : m.readByClient)).length;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  useEffect(() => {
    if (unread > 0) {
      if (controlled) onRead?.();
      else markMessagesRead(shipmentId, senderRole);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId, senderRole, unread]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    if (controlled) {
      onSend?.(msg.trim());
    } else {
      addMessage({
        id: crypto.randomUUID(),
        shipmentId,
        sender: senderRole,
        message: msg.trim(),
        timestamp: new Date().toLocaleString(),
      });
    }
    setMsg('');
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base flex items-center gap-2">
          {t('chat.title')}
          {unread > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
              {unread}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-64 overflow-y-auto px-4 py-2 space-y-3">
          {chatMessages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">{t('chat.empty')}</p>
          )}
          {chatMessages.map(m => (
            <div key={m.id} className={`flex ${m.sender === senderRole ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                m.sender === senderRole
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}>
                <div className="text-xs opacity-70 mb-0.5">{m.sender === 'admin' ? t('chat.support') : t('chat.client')}</div>
                {m.message}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-border">
          <Input value={msg} onChange={e => setMsg(e.target.value)} placeholder={t('chat.placeholder')} className="flex-1" />
          <Button type="submit" size="icon" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatWidget;

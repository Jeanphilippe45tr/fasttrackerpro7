import React, { useState } from 'react';
import { Plus, Trash2, Download, FileText, Receipt, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import type { Ticket, TicketItem } from '@/context/AppContext';
import { generateTicketPdf } from '@/lib/ticketPdf';
import TicketPreview from './TicketPreview';
import { useToast } from '@/hooks/use-toast';
import { useLang } from '@/i18n/LanguageContext';

interface Props {
  clientId: string;
  clientName: string;
  trackingCode: string;
  origin: string;
  destination: string;
  initialTickets: any[];
}

const rowToTicket = (t: any): Ticket => ({
  id: t.id,
  shipmentId: t.shipment_id,
  ticketNumber: t.ticket_number,
  ticketType: t.ticket_type,
  title: t.title,
  amount: Number(t.amount) || 0,
  currency: t.currency || 'EUR',
  items: (t.items as TicketItem[]) || [],
  notes: t.notes || '',
  issuedTo: t.issued_to || '',
  issuedBy: t.issued_by || 'EuroTransit Admin',
  createdAt: t.created_at,
  dueDate: t.due_date || undefined,
  paymentMethod: t.payment_method || '',
  taxRate: Number(t.tax_rate) || 0,
  discount: Number(t.discount) || 0,
});

const newTicketNumber = (type: 'paid' | 'pending') =>
  `${type === 'paid' ? 'RCT' : 'INV'}-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 999)}`;

const ClientTicketsManager: React.FC<Props> = ({ clientId, clientName, trackingCode, origin, destination, initialTickets }) => {
  const { adminInvoke } = useAuth();
  const { toast } = useToast();
  const { t } = useLang();
  const [tickets, setTickets] = useState<Ticket[]>((initialTickets || []).map(rowToTicket));
  const [open, setOpen] = useState(false);
  const [previewTicket, setPreviewTicket] = useState<Ticket | null>(null);

  const [type, setType] = useState<'paid' | 'pending'>('paid');
  const [title, setTitle] = useState(t('tk.defaultTitle'));
  const [currency, setCurrency] = useState('EUR');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<TicketItem[]>([{ description: t('tk.defaultItem'), amount: 0 }]);
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const taxAmt = Math.max(0, subtotal - discount) * (taxRate / 100);
  const total = Math.max(0, subtotal - discount) + taxAmt;

  const shipmentInfo = { trackingNumber: trackingCode, origin, destination, clientName };

  const reset = () => {
    setType('paid'); setTitle(t('tk.defaultTitle')); setCurrency('EUR'); setNotes('');
    setItems([{ description: t('tk.defaultItem'), amount: 0 }]);
    setDueDate(''); setPaymentMethod(''); setTaxRate(0); setDiscount(0);
  };

  const handleCreate = async () => {
    const ticket: Ticket = {
      id: crypto.randomUUID(),
      shipmentId: clientId,
      ticketNumber: newTicketNumber(type),
      ticketType: type,
      title: title || (type === 'paid' ? t('tk.paymentReceipt') : t('tk.pendingPayment')),
      amount: Number(total.toFixed(2)),
      currency,
      items: items.filter(i => i.description.trim()),
      notes,
      issuedTo: clientName,
      issuedBy: t('tk.adminName'),
      createdAt: new Date().toISOString(),
      dueDate: dueDate || undefined,
      paymentMethod,
      taxRate,
      discount,
    };
    try {
      const res = await adminInvoke('addTicket', {
        clientId,
        ticketNumber: ticket.ticketNumber,
        ticketType: ticket.ticketType,
        title: ticket.title,
        amount: ticket.amount,
        currency: ticket.currency,
        items: ticket.items,
        notes: ticket.notes,
        issuedTo: ticket.issuedTo,
        issuedBy: ticket.issuedBy,
        dueDate: ticket.dueDate || null,
        paymentMethod: ticket.paymentMethod,
        taxRate: ticket.taxRate,
        discount: ticket.discount,
      });
      const saved = res?.ticket ? rowToTicket(res.ticket) : ticket;
      setTickets(prev => [saved, ...prev]);
      toast({ title: t('tk.created'), description: saved.ticketNumber });
      setOpen(false); reset();
      setPreviewTicket(saved);
    } catch (e) {
      toast({ title: 'Failed to create ticket', description: String(e), variant: 'destructive' });
    }
  };

  const remove = async (tk: Ticket) => {
    try {
      await adminInvoke('deleteTicket', { id: tk.id });
      setTickets(prev => prev.filter(x => x.id !== tk.id));
    } catch {
      toast({ title: 'Failed to delete ticket', variant: 'destructive' });
    }
  };

  const download = async (tk: Ticket) => {
    try { await generateTicketPdf(tk, shipmentInfo); }
    catch (e) { console.error(e); toast({ title: 'PDF error', description: String(e), variant: 'destructive' }); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2"><Receipt className="w-4 h-4" /> {t('tk.section')}</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Plus className="w-3 h-3" /> {t('tk.new')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{t('tk.dlgTitle')}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">{t('tk.type')}</label>
                  <Select value={type} onValueChange={v => setType(v as 'paid' | 'pending')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">{t('tk.optReceipt')}</SelectItem>
                      <SelectItem value="pending">{t('tk.optInvoice')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('tk.currency')}</label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['EUR','GBP','USD','CHF','SEK','NOK','DKK','PLN','CAD','JPY'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">{t('tk.title')}</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('tk.titlePh')} />
              </div>

              {type === 'pending' && (
                <div>
                  <label className="text-sm font-medium">{t('tk.dueDate')}</label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">{t('tk.items')}</label>
                <div className="space-y-2 mt-1">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input className="flex-1" placeholder={t('tk.descPh')} value={it.description}
                        onChange={e => setItems(arr => arr.map((x, i) => i === idx ? { ...x, description: e.target.value } : x))} />
                      <Input type="number" className="w-28" placeholder={t('tk.amountPh')} value={it.amount}
                        onChange={e => setItems(arr => arr.map((x, i) => i === idx ? { ...x, amount: Number(e.target.value) } : x))} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => setItems(arr => arr.filter((_, i) => i !== idx))}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setItems(arr => [...arr, { description: '', amount: 0 }])}>
                    <Plus className="w-3 h-3 mr-1" /> {t('tk.addLine')}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">{t('tk.discount')}</label>
                  <Input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="text-sm font-medium">{t('tk.taxPct')}</label>
                  <Input type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value) || 0)} />
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span>{t('tk.subtotal')}</span><span>{currency} {subtotal.toFixed(2)}</span></div>
                {discount > 0 && <div className="flex justify-between text-destructive"><span>{t('tk.discount')}</span><span>- {currency} {discount.toFixed(2)}</span></div>}
                {taxRate > 0 && <div className="flex justify-between"><span>{t('tk.tax')} ({taxRate}%)</span><span>{currency} {taxAmt.toFixed(2)}</span></div>}
                <div className="flex justify-between font-bold text-base pt-1 border-t"><span>{t('tk.total')}</span><span className="text-secondary">{currency} {total.toFixed(2)}</span></div>
              </div>

              <div>
                <label className="text-sm font-medium">{type === 'paid' ? t('tk.pmPaid') : t('tk.pmDue')}</label>
                <Textarea value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                  placeholder={type === 'paid' ? t('tk.pmPhPaid') : t('tk.pmPhDue')} rows={2} />
              </div>

              <div>
                <label className="text-sm font-medium">{t('tk.notes')}</label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={t('tk.notesPh')} rows={2} />
              </div>

              <Button onClick={handleCreate} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                {t('tk.create')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{t('tk.none')}</p>
        ) : (
          <div className="space-y-2">
            {tickets.map(tk => (
              <div key={tk.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-secondary flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{tk.title}</span>
                      <Badge className={tk.ticketType === 'paid' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                        {tk.ticketType === 'paid' ? t('tk.badgePaid') : t('tk.badgeDue')}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{tk.ticketNumber} · {tk.currency} {tk.amount.toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title={t('tk.preview')} onClick={() => setPreviewTicket(tk)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title={t('tk.download')} onClick={() => download(tk)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title={t('tk.delete')} onClick={() => remove(tk)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <TicketPreview ticket={previewTicket} shipmentInfo={shipmentInfo}
        open={!!previewTicket} onClose={() => setPreviewTicket(null)} />
    </Card>
  );
};

export default ClientTicketsManager;
import React, { useState } from 'react';
import { Plus, Trash2, Download, FileText, Receipt, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/context/AppContext';
import type { Ticket, TicketItem, Shipment } from '@/context/AppContext';
import { generateTicketPdf } from '@/lib/ticketPdf';
import TicketPreview from './TicketPreview';
import { useToast } from '@/hooks/use-toast';

interface Props {
  shipment: Shipment;
}

const newTicketNumber = (type: 'paid' | 'pending') =>
  `${type === 'paid' ? 'RCT' : 'INV'}-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 999)}`;

const TicketsManager: React.FC<Props> = ({ shipment }) => {
  const { tickets, addTicket, deleteTicket } = useApp();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [previewTicket, setPreviewTicket] = useState<Ticket | null>(null);

  const [type, setType] = useState<'paid' | 'pending'>('paid');
  const [title, setTitle] = useState('Transit Fee');
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<TicketItem[]>([{ description: 'Transit fee', amount: 0 }]);
  const [dueDate, setDueDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);

  const shipmentTickets = tickets.filter(t => t.shipmentId === shipment.id);
  const subtotal = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const taxAmt = Math.max(0, subtotal - discount) * (taxRate / 100);
  const total = Math.max(0, subtotal - discount) + taxAmt;

  const reset = () => {
    setType('paid'); setTitle('Transit Fee'); setCurrency('USD'); setNotes('');
    setItems([{ description: 'Transit fee', amount: 0 }]);
    setDueDate(''); setPaymentMethod(''); setTaxRate(0); setDiscount(0);
  };

  const handleCreate = () => {
    const ticket: Ticket = {
      id: crypto.randomUUID(),
      shipmentId: shipment.id,
      ticketNumber: newTicketNumber(type),
      ticketType: type,
      title: title || (type === 'paid' ? 'Payment Receipt' : 'Pending Payment'),
      amount: Number(total.toFixed(2)),
      currency,
      items: items.filter(i => i.description.trim()),
      notes,
      issuedTo: shipment.clientName,
      issuedBy: 'FastTrackerPro Admin',
      createdAt: new Date().toISOString(),
      dueDate: dueDate || undefined,
      paymentMethod,
      taxRate,
      discount,
    };
    addTicket(ticket);
    toast({ title: 'Ticket created', description: ticket.ticketNumber });
    setOpen(false); reset();
    setPreviewTicket(ticket);
  };

  const shipmentInfo = {
    trackingNumber: shipment.trackingNumber,
    origin: shipment.origin,
    destination: shipment.destination,
    clientName: shipment.clientName,
  };

  const download = async (t: Ticket) => {
    try { await generateTicketPdf(t, shipmentInfo); }
    catch (e) { console.error(e); toast({ title: 'PDF error', description: String(e), variant: 'destructive' }); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2"><Receipt className="w-4 h-4" /> Tickets & Invoices</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Plus className="w-3 h-3" /> New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Create Professional Ticket</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={type} onValueChange={v => setType(v as 'paid' | 'pending')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Payment Receipt (Paid)</SelectItem>
                      <SelectItem value="pending">Invoice (Due)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Currency</label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['USD','EUR','GBP','XAF','XOF','CAD','AUD','JPY','CNY','BRL'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Transit Fee Receipt" />
              </div>

              {type === 'pending' && (
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Items</label>
                <div className="space-y-2 mt-1">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input className="flex-1" placeholder="Description" value={it.description}
                        onChange={e => setItems(arr => arr.map((x, i) => i === idx ? { ...x, description: e.target.value } : x))} />
                      <Input type="number" className="w-28" placeholder="Amount" value={it.amount}
                        onChange={e => setItems(arr => arr.map((x, i) => i === idx ? { ...x, amount: Number(e.target.value) } : x))} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => setItems(arr => arr.filter((_, i) => i !== idx))}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => setItems(arr => [...arr, { description: '', amount: 0 }])}>
                    <Plus className="w-3 h-3 mr-1" /> Add line
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Discount</label>
                  <Input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Tax %</label>
                  <Input type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value) || 0)} />
                </div>
              </div>

              <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{currency} {subtotal.toFixed(2)}</span></div>
                {discount > 0 && <div className="flex justify-between text-destructive"><span>Discount</span><span>- {currency} {discount.toFixed(2)}</span></div>}
                {taxRate > 0 && <div className="flex justify-between"><span>Tax ({taxRate}%)</span><span>{currency} {taxAmt.toFixed(2)}</span></div>}
                <div className="flex justify-between font-bold text-base pt-1 border-t"><span>Total</span><span className="text-secondary">{currency} {total.toFixed(2)}</span></div>
              </div>

              <div>
                <label className="text-sm font-medium">{type === 'paid' ? 'Payment Method' : 'Payment Instructions'}</label>
                <Textarea value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                  placeholder={type === 'paid' ? 'e.g. Bank Transfer, Card ending 4242' : 'e.g. Bank: ABC Bank · IBAN: ...'} rows={2} />
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} />
              </div>

              <Button onClick={handleCreate} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Create Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {shipmentTickets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No tickets yet. Create a payment receipt or pending invoice.</p>
        ) : (
          <div className="space-y-2">
            {shipmentTickets.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-secondary flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{t.title}</span>
                      <Badge className={t.ticketType === 'paid' ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}>
                        {t.ticketType === 'paid' ? 'PAID' : 'DUE'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{t.ticketNumber} · {t.currency} {t.amount.toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Preview" onClick={() => setPreviewTicket(t)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" title="Download PDF" onClick={() => download(t)}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Delete" onClick={() => deleteTicket(t.id)}>
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

export default TicketsManager;

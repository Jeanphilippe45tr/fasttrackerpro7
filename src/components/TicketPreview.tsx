import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, X, Printer } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Ticket } from '@/context/AppContext';
import { generateTicketPdf, computeTotals, type ShipmentInfo } from '@/lib/ticketPdf';
import { useLang } from '@/i18n/LanguageContext';

interface Props {
  ticket: Ticket | null;
  shipmentInfo?: ShipmentInfo;
  open: boolean;
  onClose: () => void;
}

const TicketPreview: React.FC<Props> = ({ ticket, shipmentInfo, open, onClose }) => {
  const [qr, setQr] = useState<string>('');
  const { t } = useLang();

  useEffect(() => {
    if (!ticket) return;
    const payload = shipmentInfo?.trackingNumber || ticket.ticketNumber;
    QRCode.toDataURL(payload, { margin: 0, width: 220 }).then(setQr).catch(() => setQr(''));
  }, [ticket, shipmentInfo]);

  if (!ticket) return null;
  const isPaid = ticket.ticketType === 'paid';
  const { subtotal, discount, tax, total, taxRate } = computeTotals(ticket);
  const accent = isPaid ? '#22c55e' : '#f97316';

  const handleDownload = async () => {
    try { await generateTicketPdf(ticket, shipmentInfo); }
    catch (e) { console.error(e); alert('Failed to generate PDF'); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 bg-background">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 border-b bg-background">
          <div className="text-sm font-semibold text-foreground">{t('tk.previewTitle')}</div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-1" /> {t('tk.print')}
            </Button>
            <Button size="sm" onClick={handleDownload} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
              <Download className="w-4 h-4 mr-1" /> {t('tk.download')}
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
        </div>

        {/* PDF-like preview */}
        <div className="p-6 bg-muted/30 print:p-0 print:bg-white">
          <div className="mx-auto bg-white text-slate-900 shadow-lg" style={{ width: '100%', maxWidth: 720 }}>
            {/* Header */}
            <div style={{ background: '#1e3a5f', color: '#fff', padding: '20px 24px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>FT</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>EuroTransit</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>{t('tk.tagline')}</div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>support@fasttrackerpro.com · www.fasttrackerpro.com</div>
                </div>
              </div>
              <div style={{ position: 'absolute', top: 20, right: 24, background: accent, padding: '8px 14px', borderRadius: 4, fontWeight: 700, fontSize: 12 }}>
                {isPaid ? t('tk.receiptHeader') : t('tk.invoiceHeader')}
              </div>
              <div style={{ height: 3, background: accent, position: 'absolute', left: 0, right: 0, bottom: 0 }} />
            </div>

            {/* Title + meta + QR */}
            <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1e3a5f' }}>
                  {ticket.title || (isPaid ? t('tk.paymentReceipt') : t('tk.pendingPayment'))}
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>{t('tk.ticketNum')}: <strong>{ticket.ticketNumber}</strong></div>
                <div style={{ fontSize: 12, color: '#666' }}>{t('tk.issued')}: {new Date(ticket.createdAt).toLocaleDateString()}</div>
                {ticket.dueDate && <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600 }}>{t('tk.due')}: {new Date(ticket.dueDate).toLocaleDateString()}</div>}
              </div>
              {qr && (
                <div style={{ textAlign: 'center' }}>
                  <img src={qr} alt="QR" style={{ width: 90, height: 90 }} />
                  <div style={{ fontSize: 9, color: '#888', marginTop: 2 }}>{t('tk.scan')}</div>
                </div>
              )}
            </div>

            {/* Bill to / Issued by */}
            <div style={{ padding: '0 24px' }}>
              <hr style={{ border: 0, borderTop: '1px solid #e5e7eb' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: '14px 0' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#1e3a5f', letterSpacing: 1 }}>{t('tk.billTo')}</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>{ticket.issuedTo || shipmentInfo?.clientName || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#1e3a5f', letterSpacing: 1 }}>{t('tk.issuedBy')}</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>{ticket.issuedBy || t('tk.adminName')}</div>
                </div>
              </div>

              {shipmentInfo && (
                <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', padding: 12, borderRadius: 6, marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#1e3a5f', letterSpacing: 1, marginBottom: 4 }}>{t('tk.shipmentDetails')}</div>
                  <div style={{ fontSize: 12 }}>{t('tk.tracking')}: <strong>{shipmentInfo.trackingNumber}</strong></div>
                  <div style={{ fontSize: 12 }}>{t('tk.route')}: {shipmentInfo.origin} → {shipmentInfo.destination}</div>
                </div>
              )}
            </div>

            {/* Items table */}
            <div style={{ padding: '0 24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                <thead>
                  <tr style={{ background: '#1e3a5f', color: '#fff' }}>
                    <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11 }}>{t('tk.descriptionCol')}</th>
                    <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: 11 }}>{t('tk.amountCol')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ticket.items.map((it, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#f8f9fb' : '#fff' }}>
                      <td style={{ padding: '8px 12px', fontSize: 12 }}>{it.description || '-'}</td>
                      <td style={{ padding: '8px 12px', fontSize: 12, textAlign: 'right' }}>{ticket.currency} {Number(it.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <table style={{ minWidth: 260 }}>
                  <tbody>
                    <tr><td style={{ fontSize: 12, color: '#555', padding: '3px 8px' }}>{t('tk.subtotal')}</td><td style={{ fontSize: 12, textAlign: 'right', padding: '3px 0' }}>{ticket.currency} {subtotal.toFixed(2)}</td></tr>
                    {discount > 0 && <tr><td style={{ fontSize: 12, color: '#555', padding: '3px 8px' }}>{t('tk.discount')}</td><td style={{ fontSize: 12, textAlign: 'right', padding: '3px 0', color: '#dc2626' }}>- {ticket.currency} {discount.toFixed(2)}</td></tr>}
                    {taxRate > 0 && <tr><td style={{ fontSize: 12, color: '#555', padding: '3px 8px' }}>{t('tk.tax')} ({taxRate}%)</td><td style={{ fontSize: 12, textAlign: 'right', padding: '3px 0' }}>{ticket.currency} {tax.toFixed(2)}</td></tr>}
                    <tr style={{ borderTop: '2px solid #1e3a5f' }}>
                      <td style={{ fontSize: 14, fontWeight: 700, color: '#1e3a5f', padding: '6px 8px' }}>{t('tk.total').toUpperCase()}</td>
                      <td style={{ fontSize: 14, fontWeight: 700, color: accent, textAlign: 'right', padding: '6px 0' }}>{ticket.currency} {total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {ticket.paymentMethod && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#1e3a5f', letterSpacing: 1 }}>{isPaid ? t('tk.pmPaid').toUpperCase() : t('tk.pmDue').toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: '#444', marginTop: 4, whiteSpace: 'pre-wrap' }}>{ticket.paymentMethod}</div>
                </div>
              )}

              {ticket.notes && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#1e3a5f', letterSpacing: 1 }}>{t('tk.notes').toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: '#444', marginTop: 4, whiteSpace: 'pre-wrap' }}>{ticket.notes}</div>
                </div>
              )}

              {/* Stamp */}
              <div style={{ position: 'relative', height: 60 }}>
                <div style={{ position: 'absolute', right: 30, top: 5, transform: 'rotate(-15deg)', border: `3px solid ${accent}`, color: accent, padding: '4px 18px', fontWeight: 800, fontSize: 22, opacity: 0.7, borderRadius: 4 }}>
                  {isPaid ? t('tk.paidStamp') : t('tk.unpaidStamp')}
                </div>
              </div>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 8, paddingBottom: 16 }}>
                <div>
                  <div style={{ borderTop: '1px solid #ccc', paddingTop: 4, fontSize: 10, color: '#888' }}>{t('tk.authSig')}</div>
                </div>
                <div>
                  <div style={{ borderTop: '1px solid #ccc', paddingTop: 4, fontSize: 10, color: '#888' }}>{t('tk.clientAck')}</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ background: '#1e3a5f', color: '#fff', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', fontSize: 10 }}>
              <span><strong>EuroTransit</strong> — {t('tk.footerDoc')}</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketPreview;

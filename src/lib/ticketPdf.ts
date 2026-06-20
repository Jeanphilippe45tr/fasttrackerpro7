import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import type { Ticket } from '@/context/AppContext';

export interface ShipmentInfo {
  trackingNumber: string;
  origin: string;
  destination: string;
  clientName: string;
}

export const computeTotals = (t: Ticket) => {
  const subtotal = t.items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const discount = Number(t.discount || 0);
  const taxBase = Math.max(0, subtotal - discount);
  const taxRate = Number(t.taxRate || 0);
  const tax = +(taxBase * taxRate / 100).toFixed(2);
  const total = +(taxBase + tax).toFixed(2);
  return { subtotal, discount, tax, total, taxRate };
};

export const generateTicketPdf = async (ticket: Ticket, shipmentInfo?: ShipmentInfo) => {
  const doc = new jsPDF();
  const W = 210;
  const isPaid = ticket.ticketType === 'paid';
  const NAVY: [number, number, number] = [30, 58, 95];
  const ORANGE: [number, number, number] = [249, 115, 22];
  const GREEN: [number, number, number] = [34, 197, 94];
  const accent = isPaid ? GREEN : ORANGE;

  // === HEADER BAND ===
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 38, 'F');
  doc.setFillColor(...accent);
  doc.rect(0, 38, W, 2, 'F');

  // Logo circle
  doc.setFillColor(...accent);
  doc.circle(20, 19, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FT', 20, 22, { align: 'center' });

  doc.setFontSize(20);
  doc.text('EuroTransit', 32, 17);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Global Logistics & Tracking Solutions', 32, 24);
  doc.setFontSize(8);
  doc.text('support@fasttrackerpro.com  |  www.fasttrackerpro.com', 32, 30);

  // Type badge
  doc.setFillColor(...accent);
  doc.roundedRect(150, 9, 50, 14, 2, 2, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(isPaid ? 'PAYMENT RECEIPT' : 'INVOICE — DUE', 175, 18, { align: 'center' });

  // === TITLE & META ===
  doc.setTextColor(...NAVY);
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.text(ticket.title || (isPaid ? 'Payment Receipt' : 'Pending Payment'), 14, 52);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(90, 90, 90);
  doc.text(`Ticket #: ${ticket.ticketNumber}`, 14, 59);
  doc.text(`Issued: ${new Date(ticket.createdAt).toLocaleDateString()}`, 14, 64);
  if (ticket.dueDate) doc.text(`Due: ${new Date(ticket.dueDate).toLocaleDateString()}`, 14, 69);

  // QR code (top-right)
  try {
    const qrPayload = shipmentInfo?.trackingNumber || ticket.ticketNumber;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 0, width: 200 });
    doc.addImage(qrDataUrl, 'PNG', 165, 46, 30, 30);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text('Scan to track', 180, 79, { align: 'center' });
  } catch { /* ignore qr errors */ }

  // === BILL TO / SHIPMENT ===
  let y = 86;
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(14, y, W - 14, y);
  y += 7;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text('BILL TO', 14, y);
  doc.text('ISSUED BY', 110, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.text(ticket.issuedTo || shipmentInfo?.clientName || '-', 14, y + 6);
  doc.text(ticket.issuedBy || 'EuroTransit Admin', 110, y + 6);

  if (shipmentInfo) {
    y += 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text('SHIPMENT DETAILS', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    y += 6;
    doc.text(`Tracking #: ${shipmentInfo.trackingNumber}`, 14, y);
    y += 5;
    doc.text(`Route: ${shipmentInfo.origin}  ->  ${shipmentInfo.destination}`, 14, y);
  }

  // === ITEMS TABLE ===
  y += 12;
  doc.setFillColor(...NAVY);
  doc.rect(14, y, W - 28, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DESCRIPTION', 18, y + 6);
  doc.text('AMOUNT', W - 18, y + 6, { align: 'right' });
  y += 12;

  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'normal');
  ticket.items.forEach((item, i) => {
    if (i % 2 === 0) {
      doc.setFillColor(248, 249, 251);
      doc.rect(14, y - 5, W - 28, 8, 'F');
    }
    doc.text(item.description || '-', 18, y);
    doc.text(`${ticket.currency} ${Number(item.amount || 0).toFixed(2)}`, W - 18, y, { align: 'right' });
    y += 8;
  });

  // === TOTALS ===
  const { subtotal, discount, tax, total, taxRate } = computeTotals(ticket);
  y += 4;
  doc.setDrawColor(220, 220, 220);
  doc.line(W - 90, y, W - 14, y);
  y += 6;

  const row = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(bold ? 12 : 10);
    doc.setTextColor(bold ? NAVY[0] : 80, bold ? NAVY[1] : 80, bold ? NAVY[2] : 80);
    doc.text(label, W - 90, y);
    if (bold) {
      doc.setTextColor(...accent);
    }
    doc.text(value, W - 18, y, { align: 'right' });
    y += bold ? 8 : 6;
  };

  row('Subtotal', `${ticket.currency} ${subtotal.toFixed(2)}`);
  if (discount > 0) row('Discount', `- ${ticket.currency} ${discount.toFixed(2)}`);
  if (taxRate > 0) row(`Tax (${taxRate}%)`, `${ticket.currency} ${tax.toFixed(2)}`);
  doc.setDrawColor(...NAVY);
  doc.setLineWidth(0.5);
  doc.line(W - 90, y - 2, W - 14, y - 2);
  y += 2;
  row('TOTAL', `${ticket.currency} ${total.toFixed(2)}`, true);

  // === PAYMENT METHOD ===
  if (ticket.paymentMethod) {
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text(isPaid ? 'PAYMENT METHOD' : 'PAYMENT INSTRUCTIONS', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(ticket.paymentMethod, W - 28);
    doc.text(lines, 14, y + 6);
    y += 6 + lines.length * 5;
  }

  // === NOTES ===
  if (ticket.notes) {
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text('NOTES', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(ticket.notes, W - 28);
    doc.text(lines, 14, y + 6);
    y += 6 + lines.length * 5;
  }

  // === STATUS STAMP ===
  doc.setFontSize(46);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accent);
  doc.text(isPaid ? 'PAID' : 'UNPAID', 150, 180, { align: 'center', angle: -18 });

  // === SIGNATURE ===
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(14, 260, 80, 260);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signature', 14, 265);

  doc.line(W - 80, 260, W - 14, 260);
  doc.text('Client Acknowledgement', W - 80, 265);

  // === FOOTER ===
  doc.setFillColor(...NAVY);
  doc.rect(0, 282, W, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('EuroTransit', 14, 289);
  doc.setFont('helvetica', 'normal');
  doc.text('Officially issued document — keep for your records.', 14, 294);
  doc.text(`Page 1 of 1  |  ${new Date().toLocaleDateString()}`, W - 14, 294, { align: 'right' });

  doc.save(`Ticket-${ticket.ticketNumber}.pdf`);
};

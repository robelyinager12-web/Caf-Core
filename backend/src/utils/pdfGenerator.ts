import PDFDocument from 'pdfkit';
import { Response } from 'express';

interface ReceiptData {
  orderNumber: string;
  createdAt: Date;
  orderType: string;
  tableOrToken: string | null;
  items: { name: string; quantity: number; unitPrice: number }[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  processedByName: string;
}

export function streamReceiptPdf(res: Response, receipt: ReceiptData): void {
  const doc = new PDFDocument({ size: [226, 400], margin: 10 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename=receipt-${receipt.orderNumber}.pdf`);

  doc.pipe(res);

  doc.fontSize(14).text('Cafeteria Receipt', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(9).text(`Order: ${receipt.orderNumber}`);
  doc.text(`Date: ${receipt.createdAt.toLocaleString()}`);
  doc.text(`Type: ${receipt.orderType}${receipt.tableOrToken ? ` (${receipt.tableOrToken})` : ''}`);
  doc.text(`Served by: ${receipt.processedByName}`);
  doc.moveDown(0.5);
  doc.text('----------------------------------------');

  receipt.items.forEach((item) => {
    const lineTotal = (item.unitPrice * item.quantity).toFixed(2);
    doc.text(`${item.quantity}x ${item.name}`);
    doc.text(`   @ ${item.unitPrice.toFixed(2)} = ${lineTotal}`, { align: 'right' });
  });

  doc.text('----------------------------------------');
  doc.fontSize(10).text(`Subtotal: ${receipt.subtotal.toFixed(2)}`, { align: 'right' });
  doc.fontSize(12).text(`Total: ${receipt.total.toFixed(2)}`, { align: 'right' });
  doc.moveDown(0.5);
  doc.fontSize(9).text(`Payment: ${receipt.paymentMethod}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(8).text('Thank you!', { align: 'center' });

  doc.end();
}
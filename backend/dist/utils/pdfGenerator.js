"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamReceiptPdf = streamReceiptPdf;
const pdfkit_1 = __importDefault(require("pdfkit"));
function streamReceiptPdf(res, receipt) {
    const doc = new pdfkit_1.default({ size: [226, 400], margin: 10 });
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

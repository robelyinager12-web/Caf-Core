import { api } from './api';
import { Payment, PaymentMethod } from '../types/order.types';

interface CreatePaymentPayload {
  orderId: string;
  method: PaymentMethod;
  amount: number;
}

export async function createPayment(payload: CreatePaymentPayload): Promise<Payment> {
  const { data } = await api.post('/payments', payload);
  return data.data;
}

export async function getPaymentByOrder(orderId: string): Promise<Payment> {
  const { data } = await api.get(`/payments/${orderId}`);
  return data.data;
}

export async function refundPayment(orderId: string, reason: string): Promise<Payment> {
  const { data } = await api.post(`/payments/${orderId}/refund`, { reason });
  return data.data;
}

export async function fetchReceiptBlob(orderId: string): Promise<Blob> {
  const response = await api.get(`/payments/${orderId}/receipt`, {
    responseType: 'blob',
  });
  return response.data;
}

export function openReceiptBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Loads the receipt PDF into a hidden iframe and triggers the browser's
 * native print dialog directly on it, rather than opening it in a new tab
 * first. The iframe is removed once printing is dismissed — 'afterprint'
 * fires whether the person actually printed or cancelled.
 */
export function printReceiptBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = url;

  function cleanup() {
    window.removeEventListener('afterprint', cleanup);
    document.body.removeChild(iframe);
    URL.revokeObjectURL(url);
  }

  iframe.onload = () => {
    window.addEventListener('afterprint', cleanup);
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  };

  document.body.appendChild(iframe);
}
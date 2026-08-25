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

/**
 * Fetches the receipt PDF as a blob (rather than a plain <a href>) because the
 * endpoint requires a Bearer token — the shared `api` instance's request
 * interceptor (Phase 7 Step 1) attaches it automatically, which a raw link
 * click cannot do.
 */
export async function fetchReceiptBlob(orderId: string): Promise<Blob> {
  const response = await api.get(`/payments/${orderId}/receipt`, {
    responseType: 'blob',
  });
  return response.data;
}

export function openReceiptBlob(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  // Revoke after a delay rather than immediately, so the new tab has time to load it
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
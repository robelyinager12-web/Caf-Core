import { api } from './api';
import { Order, CreateOrderPayload, OrderStatus } from '../types/order.types';

interface OrdersQuery {
  status?: OrderStatus;
  orderType?: string;
  page?: number;
  limit?: number;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const { data } = await api.post('/orders', payload);
  return data.data;
}

export async function getOrders(query: OrdersQuery = {}): Promise<Order[]> {
  const { data } = await api.get('/orders', { params: query });
  return data.data;
}

export async function getOrder(id: string): Promise<Order> {
  const { data } = await api.get(`/orders/${id}`);
  return data.data;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const { data } = await api.patch(`/orders/${id}/status`, { status });
  return data.data;
}

export async function getOrderHistory(query: OrdersQuery = {}): Promise<Order[]> {
  const { data } = await api.get('/orders/history', { params: query });
  return data.data;
}
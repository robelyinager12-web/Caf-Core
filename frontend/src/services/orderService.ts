import { api } from './api';
import { Order, CreateOrderPayload, OrderStatus } from '../types/order.types';
import { getAllPages, PaginatedResponse } from './paginated';

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
  const fetchPage = async (page: number, limit: number) => {
    const { data } = await api.get<PaginatedResponse<Order>>('/orders', {
      params: { ...query, page, limit },
    });
    return data;
  };

  if (query.page !== undefined || query.limit !== undefined) {
    const response = await fetchPage(query.page ?? 1, query.limit ?? 20);
    return response.data;
  }

  return getAllPages(fetchPage);
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
  const fetchPage = async (page: number, limit: number) => {
    const { data } = await api.get<PaginatedResponse<Order>>('/orders/history', {
      params: { ...query, page, limit },
    });
    return data;
  };

  if (query.page !== undefined || query.limit !== undefined) {
    const response = await fetchPage(query.page ?? 1, query.limit ?? 20);
    return response.data;
  }

  return getAllPages(fetchPage);
}
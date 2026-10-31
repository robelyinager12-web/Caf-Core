import { api } from './api';
import { MenuItem } from '../types/menu.types';
import { GuestPickupOrderPayload, Order } from '../types/order.types';
import { getAllPages, PaginatedResponse } from './paginated';

export async function getPublicMenu(): Promise<MenuItem[]> {
  return getAllPages(async (page, limit) => {
    const { data } = await api.get<PaginatedResponse<MenuItem>>('/public/menu', {
      params: { page, limit },
    });
    return data;
  });
}

export async function createGuestPickupOrder(payload: GuestPickupOrderPayload): Promise<Order> {
  const { data } = await api.post('/public/orders', payload);
  return data.data;
}

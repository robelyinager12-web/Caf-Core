import { api } from './api';
import { Ingredient, AdjustStockPayload, CreateIngredientPayload, Notification } from '../types/inventory.types';
import { getAllPages, PaginatedResponse } from './paginated';

interface IngredientsQuery {
  lowStockOnly?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getIngredients(query: IngredientsQuery = {}): Promise<Ingredient[]> {
  const fetchPage = async (page: number, limit: number) => {
    const { data } = await api.get<PaginatedResponse<Ingredient>>('/inventory', {
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

export async function createIngredient(payload: CreateIngredientPayload): Promise<Ingredient> {
  const { data } = await api.post('/inventory', payload);
  return data.data;
}

export async function adjustStock(
  ingredientId: string,
  payload: AdjustStockPayload
): Promise<Ingredient['inventory']> {
  const { data } = await api.post(`/inventory/${ingredientId}/adjust`, payload);
  return data.data;
}

export async function updateThreshold(
  ingredientId: string,
  lowStockThreshold: number
): Promise<Ingredient['inventory']> {
  const { data } = await api.patch(`/inventory/${ingredientId}/threshold`, { lowStockThreshold });
  return data.data;
}

export async function getNotifications(unreadOnly = false): Promise<Notification[]> {
  const { data } = await api.get('/notifications', { params: { unreadOnly } });
  return data.data;
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data.data;
}
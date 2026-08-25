import { api } from './api';
import { Ingredient, AdjustStockPayload, CreateIngredientPayload, Notification } from '../types/inventory.types';

interface IngredientsQuery {
  lowStockOnly?: boolean;
  search?: string;
}

export async function getIngredients(query: IngredientsQuery = {}): Promise<Ingredient[]> {
  const { data } = await api.get('/inventory', { params: query });
  return data.data;
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
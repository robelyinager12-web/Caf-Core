import { api } from './api';
import { Category, MenuItem, CreateMenuItemPayload } from '../types/menu.types';

export async function getCategories(): Promise<Category[]> {
  const { data } = await api.get('/categories');
  return data.data;
}

export async function createCategory(payload: { name: string; displayOrder?: number }) {
  const { data } = await api.post('/categories', payload);
  return data.data as Category;
}

interface MenuItemsQuery {
  categoryId?: string;
  search?: string;
  isAvailable?: boolean;
}

export async function getMenuItems(query: MenuItemsQuery = {}): Promise<MenuItem[]> {
  const { data } = await api.get('/menu', { params: query });
  return data.data;
}

function buildFormData(payload: CreateMenuItemPayload): FormData {
  const formData = new FormData();
  formData.append('categoryId', payload.categoryId);
  formData.append('name', payload.name);
  if (payload.description) formData.append('description', payload.description);
  formData.append('price', String(payload.price));
  if (payload.isAvailable !== undefined) {
    formData.append('isAvailable', String(payload.isAvailable));
  }
  if (payload.image) formData.append('image', payload.image);
  return formData;
}

export async function createMenuItem(payload: CreateMenuItemPayload): Promise<MenuItem> {
  const formData = buildFormData(payload);
  const { data } = await api.post('/menu', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function updateMenuItem(
  id: string,
  payload: Partial<CreateMenuItemPayload>
): Promise<MenuItem> {
  const formData = new FormData();
  if (payload.categoryId) formData.append('categoryId', payload.categoryId);
  if (payload.name) formData.append('name', payload.name);
  if (payload.description !== undefined) formData.append('description', payload.description);
  if (payload.price !== undefined) formData.append('price', String(payload.price));
  if (payload.isAvailable !== undefined) formData.append('isAvailable', String(payload.isAvailable));
  if (payload.image) formData.append('image', payload.image);

  const { data } = await api.patch(`/menu/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function deleteMenuItem(id: string): Promise<void> {
  await api.delete(`/menu/${id}`);
}

export async function toggleAvailability(id: string, isAvailable: boolean): Promise<MenuItem> {
  const { data } = await api.patch(`/menu/${id}`, { isAvailable });
  return data.data;
}
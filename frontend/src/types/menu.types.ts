export interface Category {
  id: string;
  name: string;
  displayOrder: number;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  category?: { id: string; name: string };
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemPayload {
  categoryId: string;
  name: string;
  description?: string;
  price: number;
  isAvailable?: boolean;
  image?: File;
}
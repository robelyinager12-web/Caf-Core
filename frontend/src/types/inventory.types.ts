export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  createdAt: string;
  inventory: {
    id: string;
    ingredientId: string;
    quantityInStock: number;
    lowStockThreshold: number;
    updatedAt: string;
  } | null;
}

export interface AdjustStockPayload {
  quantityChange: number;
  reason: string;
}

export interface CreateIngredientPayload {
  name: string;
  unit: string;
  initialQuantity?: number;
  lowStockThreshold?: number;
}

export interface Notification {
  id: string;
  type: 'LOW_STOCK' | 'NEW_ORDER' | 'SYSTEM';
  message: string;
  isRead: boolean;
  targetRole: string | null;
  createdAt: string;
}
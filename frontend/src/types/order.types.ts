export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type OrderType = 'DINE_IN' | 'TAKEAWAY';
export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: { id: string; name: string; imageUrl?: string };
  quantity: number;
  unitPrice: number;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  processedBy: { id: string; fullName: string };
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdById: string;
  createdBy: { id: string; fullName: string };
  status: OrderStatus;
  orderType: OrderType;
  tableOrToken?: string;
  subtotal: number;
  total: number;
  items: OrderItem[];
  payment?: Payment | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  orderType: OrderType;
  tableOrToken?: string;
  items: { menuItemId: string; quantity: number }[];
}

export interface CartLine {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}
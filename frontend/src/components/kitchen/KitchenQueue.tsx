import { KitchenOrderCard } from './KitchenOrderCard';
import { Order } from '../../types/order.types';

interface KitchenQueueProps {
  title: string;
  orders: Order[];
  onAdvance: (order: Order) => void;
  onCancel: (order: Order) => void;
  updatingOrderId?: string;
}

export function KitchenQueue({ title, orders, onAdvance, onCancel, updatingOrderId }: KitchenQueueProps) {
  return (
    <div className="flex min-w-[280px] flex-1 flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
          {orders.length}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {orders.length === 0 ? (
          <p className="rounded-lg bg-white/50 py-8 text-center text-xs text-gray-400 ring-1 ring-dashed ring-gray-200">
            No orders
          </p>
        ) : (
          orders.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              onAdvance={onAdvance}
              onCancel={onCancel}
              isUpdating={updatingOrderId === order.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
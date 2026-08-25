import { Clock, ArrowRight, XCircle } from 'lucide-react';
import { Order, OrderStatus } from '../../types/order.types';
import { formatDate } from '../../utils/formatDate';

interface KitchenOrderCardProps {
  order: Order;
  onAdvance: (order: Order) => void;
  onCancel: (order: Order) => void;
  isUpdating: boolean;
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'PREPARING',
  PREPARING: 'READY',
  READY: 'COMPLETED',
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING: 'Start Preparing',
  PREPARING: 'Mark Ready',
  READY: 'Complete Order',
};

const BORDER_COLOR: Record<OrderStatus, string> = {
  PENDING: 'border-l-gray-400',
  PREPARING: 'border-l-warning',
  READY: 'border-l-primary-500',
  COMPLETED: 'border-l-success',
  CANCELLED: 'border-l-danger',
};

export function KitchenOrderCard({ order, onAdvance, onCancel, isUpdating }: KitchenOrderCardProps) {
  const nextStatus = NEXT_STATUS[order.status];
  const nextLabel = NEXT_LABEL[order.status];

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border-l-4 bg-white p-4 shadow-sm ring-1 ring-gray-200 ${BORDER_COLOR[order.status]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900">{order.orderNumber}</p>
          <p className="text-xs text-gray-500">
            {order.orderType === 'DINE_IN' ? `Table ${order.tableOrToken ?? '-'}` : 'Takeaway'}
            {order.tableOrToken && order.orderType === 'TAKEAWAY' && ` · Token ${order.tableOrToken}`}
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          {formatDate(order.createdAt)}
        </div>
      </div>

      <ul className="flex flex-col gap-1 border-t border-gray-100 pt-2">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between text-sm">
            <span className="font-medium text-gray-800">
              {item.quantity}x {item.menuItem.name}
            </span>
          </li>
        ))}
      </ul>

      {nextStatus && nextLabel && (
        <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
          <button
            onClick={() => onAdvance(order)}
            disabled={isUpdating}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {nextLabel}
            <ArrowRight className="h-3 w-3" />
          </button>
          <button
            onClick={() => onCancel(order)}
            disabled={isUpdating}
            className="rounded-lg bg-danger/10 p-2 text-danger hover:bg-danger/20 disabled:opacity-60"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
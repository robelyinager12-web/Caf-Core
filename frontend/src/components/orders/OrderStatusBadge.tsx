import clsx from 'clsx';
import { OrderStatus } from '../../types/order.types';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  PREPARING: 'bg-warning/10 text-warning',
  READY: 'bg-primary-50 text-primary-700',
  COMPLETED: 'bg-success/10 text-success',
  CANCELLED: 'bg-danger/10 text-danger',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={clsx(
        'rounded-full px-2.5 py-1 text-xs font-medium',
        STATUS_STYLES[status]
      )}
    >
      {status}
    </span>
  );
}
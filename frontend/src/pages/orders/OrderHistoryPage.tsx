import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrderHistory } from '../../services/orderService';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { Loader } from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { OrderStatus } from '../../types/order.types';

const STATUS_FILTERS: { label: string; value: OrderStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export function OrderHistoryPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);

  const historyQuery = useQuery({
    queryKey: ['order-history', statusFilter],
    queryFn: () => getOrderHistory(statusFilter ? { status: statusFilter } : {}),
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-gray-900">Order History</h1>

      <div className="flex gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.label}
            onClick={() => setStatusFilter(filter.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === filter.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {historyQuery.isLoading ? (
        <Loader label="Loading order history..." />
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Order #</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Items</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Total</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Created By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(historyQuery.data ?? []).map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.orderType === 'DINE_IN' ? `Dine In (${order.tableOrToken ?? '-'})` : 'Takeaway'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{order.createdBy.fullName}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {(historyQuery.data ?? []).length === 0 && (
            <p className="py-12 text-center text-sm text-gray-500">No orders found for this filter.</p>
          )}
        </div>
      )}
    </div>
  );
}
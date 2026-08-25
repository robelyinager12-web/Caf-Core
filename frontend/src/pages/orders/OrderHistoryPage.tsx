import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Receipt } from 'lucide-react';
import { getOrderHistory } from '../../services/orderService';
import { createPayment, fetchReceiptBlob, openReceiptBlob } from '../../services/paymentService';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { PaymentStatusBadge } from '../../components/orders/PaymentStatusBadge';
import { PaymentForm } from '../../components/orders/PaymentForm';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { useToastStore } from '../../components/common/Toast';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/validators';
import { Order, OrderStatus, PaymentMethod } from '../../types/order.types';

const STATUS_FILTERS: { label: string; value: OrderStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export function OrderHistoryPage() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [receiptLoadingId, setReceiptLoadingId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  const historyQuery = useQuery({
    queryKey: ['order-history', statusFilter],
    queryFn: () => getOrderHistory(statusFilter ? { status: statusFilter } : {}),
  });

  const paymentMutation = useMutation({
    mutationFn: (payload: { method: PaymentMethod; amount: number }) =>
      createPayment({ orderId: payingOrder!.id, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-history'] });
      showToast('Payment recorded successfully');
      setPayingOrder(null);
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  async function handleViewReceipt(orderId: string) {
    setReceiptLoadingId(orderId);
    try {
      const blob = await fetchReceiptBlob(orderId);
      openReceiptBlob(blob);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setReceiptLoadingId(null);
    }
  }

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
                <th className="px-4 py-3 text-left font-medium text-gray-500">Items</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Total</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Payment</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(historyQuery.data ?? []).map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <PaymentStatusBadge payment={order.payment} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {order.status !== 'CANCELLED' && !order.payment && (
                        <button
                          onClick={() => setPayingOrder(order)}
                          className="rounded-lg bg-primary-50 p-1.5 text-primary-600 hover:bg-primary-100"
                          title="Take payment"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {order.payment && (
                        <button
                          onClick={() => handleViewReceipt(order.id)}
                          disabled={receiptLoadingId === order.id}
                          className="rounded-lg bg-gray-50 p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          title="View receipt"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {(historyQuery.data ?? []).length === 0 && (
            <p className="py-12 text-center text-sm text-gray-500">No orders found for this filter.</p>
          )}
        </div>
      )}

      <Modal
        isOpen={!!payingOrder}
        onClose={() => setPayingOrder(null)}
        title={`Take Payment — ${payingOrder?.orderNumber ?? ''}`}
      >
        {payingOrder && (
          <PaymentForm
            orderTotal={payingOrder.total}
            onSubmit={(payload) => paymentMutation.mutate(payload)}
            isSubmitting={paymentMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
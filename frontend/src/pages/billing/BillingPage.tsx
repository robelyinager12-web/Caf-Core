import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CreditCard,
  Receipt,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { getOrders } from '../../services/orderService';
import { createPayment, fetchReceiptBlob, openReceiptBlob } from '../../services/paymentService';
import { PaymentForm } from '../../components/orders/PaymentForm';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { PaymentStatusBadge } from '../../components/orders/PaymentStatusBadge';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { useToastStore } from '../../components/common/Toast';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/validators';
import { Order, PaymentMethod } from '../../types/order.types';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];
type PaymentFilter = 'all' | 'unpaid' | 'paid' | 'refunded';

function shortOrderLabel(orderNumber: string): string {
  const parts = orderNumber.split('-');
  return parts.length === 3 ? `#${parts[2]}` : orderNumber;
}

export function BillingPage() {
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);
  const [receiptLoadingId, setReceiptLoadingId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  const ordersQuery = useQuery({
    queryKey: ['billing-orders'],
    queryFn: () => getOrders({ limit: 100 }),
  });

  const paymentMutation = useMutation({
    mutationFn: (payload: { method: PaymentMethod; amount: number }) =>
      createPayment({ orderId: payingOrder!.id, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-orders'] });
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

  const filteredOrders = useMemo(() => {
    const orders = ordersQuery.data ?? [];
    switch (paymentFilter) {
      case 'unpaid':
        return orders.filter((o) => !o.payment && o.status !== 'CANCELLED');
      case 'paid':
        return orders.filter((o) => o.payment?.status === 'PAID');
      case 'refunded':
        return orders.filter((o) => o.payment?.status === 'REFUNDED');
      default:
        return orders;
    }
  }, [ordersQuery.data, paymentFilter]);

  const totalCollected = filteredOrders
    .filter((o) => o.payment?.status === 'PAID')
    .reduce((sum, o) => sum + o.total, 0);
  const totalOutstanding = filteredOrders
    .filter((o) => !o.payment && o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pagedOrders = filteredOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const FILTERS: { label: string; value: PaymentFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Paid', value: 'paid' },
    { label: 'Refunded', value: 'refunded' },
  ];

  if (ordersQuery.isLoading) {
    return <Loader label="Loading billing..." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Billing</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">Dashboard &gt; Billing</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Collected</p>
          <p className="mt-2 text-2xl font-bold text-success">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Outstanding (Unpaid)</p>
          <p className="mt-2 text-2xl font-bold text-warning">{formatCurrency(totalOutstanding)}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 p-4 dark:border-gray-800">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setPaymentFilter(f.value);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                paymentFilter === f.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Order Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {pagedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                    No Results
                  </td>
                </tr>
              ) : (
                pagedOrders.map((order) => (
                  <tr key={order.id}>
                    <td
                      className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100"
                      title={order.orderNumber}
                    >
                      {shortOrderLabel(order.orderNumber)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge payment={order.payment} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {order.status !== 'CANCELLED' && !order.payment && (
                          <button
                            onClick={() => setPayingOrder(order)}
                            className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                            Take Payment
                          </button>
                        )}
                        {order.payment && (
                          <button
                            onClick={() => handleViewReceipt(order.id)}
                            disabled={receiptLoadingId === order.id}
                            className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                            Receipt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-4 py-3 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total {filteredOrders.length} rows.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              Rows per page
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                {ROWS_PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

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
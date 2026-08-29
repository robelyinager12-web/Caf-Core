import { useEffect, useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowRight, XCircle } from 'lucide-react';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { PaymentStatusBadge } from '../../components/orders/PaymentStatusBadge';
import { Loader } from '../../components/common/Loader';
import { useSocket } from '../../hooks/useSocket';
import { useToastStore } from '../../components/common/Toast';
import { getErrorMessage } from '../../utils/validators';
import { formatCurrency } from '../../utils/formatCurrency';
import { Order, OrderStatus } from '../../types/order.types';

const ACTIVE_STATUSES: OrderStatus[] = ['PENDING', 'PREPARING', 'READY'];
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: 'PREPARING',
  PREPARING: 'READY',
  READY: 'COMPLETED',
};

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  PENDING: 'Start Preparing',
  PREPARING: 'Mark Ready',
  READY: 'Complete',
};

function shortOrderLabel(orderNumber: string): string {
  const parts = orderNumber.split('-');
  return parts.length === 3 ? `#${parts[2]}` : orderNumber;
}

// Sorts unpaid before paid before refunded, so the busiest/most-actionable
// rows surface first when the Payment Status column header is clicked.
const PAYMENT_SORT_WEIGHT: Record<string, number> = { unpaid: 0, PAID: 1, REFUNDED: 2 };

export function KitchenDisplayPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [paymentSortDirection, setPaymentSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  const ordersQuery = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: async () => {
      const results = await Promise.all(ACTIVE_STATUSES.map((status) => getOrders({ status })));
      return results.flat();
    },
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (ordersQuery.data) {
      setOrders(ordersQuery.data);
    }
  }, [ordersQuery.data]);

  const handleNewOrder = useCallback((newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
  }, []);

  const handleStatusChanged = useCallback((updatedOrder: Order) => {
    setOrders((prev) => {
      if (!ACTIVE_STATUSES.includes(updatedOrder.status)) {
        return prev.filter((o) => o.id !== updatedOrder.id);
      }
      return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
    });
  }, []);

  useSocket({
    'order:created': handleNewOrder,
    'order:statusChanged': handleStatusChanged,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onMutate: ({ id }) => setUpdatingOrderId(id),
    onError: (error) => showToast(getErrorMessage(error), 'error'),
    onSettled: () => {
      setUpdatingOrderId(undefined);
      queryClient.invalidateQueries({ queryKey: ['kitchen-orders'] });
    },
  });

  function handleAdvance(order: Order) {
    const next = NEXT_STATUS[order.status];
    if (next) statusMutation.mutate({ id: order.id, status: next });
  }

  function handleCancel(order: Order) {
    if (confirm(`Cancel order ${order.orderNumber}?`)) {
      statusMutation.mutate({ id: order.id, status: 'CANCELLED' });
    }
  }

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          (o.tableOrToken ?? '').toLowerCase().includes(q)
      );
    }

    if (paymentSortDirection) {
      result = [...result].sort((a, b) => {
        const aKey = a.payment ? a.payment.status : 'unpaid';
        const bKey = b.payment ? b.payment.status : 'unpaid';
        const diff = (PAYMENT_SORT_WEIGHT[aKey] ?? 0) - (PAYMENT_SORT_WEIGHT[bKey] ?? 0);
        return paymentSortDirection === 'asc' ? diff : -diff;
      });
    }

    return result;
  }, [orders, search, paymentSortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pagedOrders = filteredOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  function togglePaymentSort() {
    setPaymentSortDirection((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
  }

  if (ordersQuery.isLoading) {
    return <Loader label="Loading kitchen orders..." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Orders</h1>
        <p className="text-xs text-gray-400 dark:text-gray-500">Dashboard &gt; Orders</p>
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 p-4 dark:border-gray-800">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search Order"
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            onClick={() => setPage(1)}
            className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
                <th className="px-4 py-3 font-medium">Order ID</th>
                <th className="px-4 py-3 font-medium">Table No</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">
                  <button onClick={togglePaymentSort} className="flex items-center gap-1 hover:text-gray-600">
                    Payment Status
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
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
                pagedOrders.map((order) => {
                  const nextLabel = NEXT_LABEL[order.status];
                  return (
                    <tr key={order.id}>
                      <td
                        className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100"
                        title={order.orderNumber}
                      >
                        {shortOrderLabel(order.orderNumber)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {order.orderType === 'DINE_IN' ? order.tableOrToken ?? '—' : 'Takeaway'}
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
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {nextLabel && (
                            <button
                              onClick={() => handleAdvance(order)}
                              disabled={updatingOrderId === order.id}
                              className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-60"
                            >
                              {nextLabel}
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={() => handleCancel(order)}
                            disabled={updatingOrderId === order.id}
                            className="rounded-lg bg-danger/10 p-1.5 text-danger hover:bg-danger/20 disabled:opacity-60"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
    </div>
  );
}
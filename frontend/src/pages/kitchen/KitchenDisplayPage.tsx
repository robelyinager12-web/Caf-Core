import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import { KitchenQueue } from '../../components/kitchen/KitchenQueue';
import { Loader } from '../../components/common/Loader';
import { useSocket } from '../../hooks/useSocket';
import { useToastStore } from '../../components/common/Toast';
import { getErrorMessage } from '../../utils/validators';
import { Order, OrderStatus } from '../../types/order.types';

const ACTIVE_STATUSES: OrderStatus[] = ['PENDING', 'PREPARING', 'READY'];

export function KitchenDisplayPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | undefined>();
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  const ordersQuery = useQuery({
    queryKey: ['kitchen-orders'],
    queryFn: async () => {
      const results = await Promise.all(ACTIVE_STATUSES.map((status) => getOrders({ status })));
      return results.flat();
    },
    refetchInterval: 60000, // safety-net poll in case a socket event is ever missed
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
    const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
      PENDING: 'PREPARING',
      PREPARING: 'READY',
      READY: 'COMPLETED',
    };
    const next = nextStatus[order.status];
    if (next) statusMutation.mutate({ id: order.id, status: next });
  }

  function handleCancel(order: Order) {
    if (confirm(`Cancel order ${order.orderNumber}?`)) {
      statusMutation.mutate({ id: order.id, status: 'CANCELLED' });
    }
  }

  if (ordersQuery.isLoading) {
    return <Loader label="Loading kitchen queue..." />;
  }

  const pending = orders.filter((o) => o.status === 'PENDING');
  const preparing = orders.filter((o) => o.status === 'PREPARING');
  const ready = orders.filter((o) => o.status === 'READY');

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-gray-900">Kitchen Display</h1>

      <div className="flex flex-col gap-4 lg:flex-row">
        <KitchenQueue
          title="New Orders"
          orders={pending}
          onAdvance={handleAdvance}
          onCancel={handleCancel}
          updatingOrderId={updatingOrderId}
        />
        <KitchenQueue
          title="Preparing"
          orders={preparing}
          onAdvance={handleAdvance}
          onCancel={handleCancel}
          updatingOrderId={updatingOrderId}
        />
        <KitchenQueue
          title="Ready for Pickup"
          orders={ready}
          onAdvance={handleAdvance}
          onCancel={handleCancel}
          updatingOrderId={updatingOrderId}
        />
      </div>
    </div>
  );
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getCategories, getMenuItems } from '../../services/menuService';
import { createOrder } from '../../services/orderService';
import { OrderForm } from '../../components/orders/OrderForm';
import { Loader } from '../../components/common/Loader';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { useToastStore } from '../../components/common/Toast';
import { getErrorMessage } from '../../utils/validators';
import { Order } from '../../types/order.types';

export function NewOrderPage() {
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const menuItemsQuery = useQuery({
    queryKey: ['menu-items', 'available'],
    queryFn: () => getMenuItems({ isAvailable: true }),
  });

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      setLastOrder(order);
      showToast(`Order ${order.orderNumber} placed successfully`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  if (categoriesQuery.isLoading || menuItemsQuery.isLoading) {
    return <Loader label="Loading menu..." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-gray-900">New Order</h1>

      {lastOrder && (
        <div className="flex items-center justify-between rounded-lg bg-success/10 px-4 py-3 text-sm">
          <span>
            Order <strong>{lastOrder.orderNumber}</strong> sent to the kitchen.
          </span>
          <OrderStatusBadge status={lastOrder.status} />
        </div>
      )}

      <OrderForm
        categories={categoriesQuery.data ?? []}
        menuItems={menuItemsQuery.data ?? []}
        onSubmit={(payload) => createOrderMutation.mutate(payload)}
        isSubmitting={createOrderMutation.isPending}
      />
    </div>
  );
}
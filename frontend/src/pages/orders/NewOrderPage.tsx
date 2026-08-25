import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CreditCard, Receipt } from 'lucide-react';
import { getCategories, getMenuItems } from '../../services/menuService';
import { createOrder } from '../../services/orderService';
import { createPayment, fetchReceiptBlob, openReceiptBlob } from '../../services/paymentService';
import { OrderForm } from '../../components/orders/OrderForm';
import { Loader } from '../../components/common/Loader';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { PaymentStatusBadge } from '../../components/orders/PaymentStatusBadge';
import { PaymentForm } from '../../components/orders/PaymentForm';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useToastStore } from '../../components/common/Toast';
import { getErrorMessage } from '../../utils/validators';
import { Order, PaymentMethod } from '../../types/order.types';

export function NewOrderPage() {
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isFetchingReceipt, setIsFetchingReceipt] = useState(false);
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

  const paymentMutation = useMutation({
    mutationFn: (payload: { method: PaymentMethod; amount: number }) =>
      createPayment({ orderId: lastOrder!.id, ...payload }),
    onSuccess: (payment) => {
      setLastOrder((prev) => (prev ? { ...prev, payment } : prev));
      showToast('Payment recorded successfully');
      setIsPaymentOpen(false);
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  async function handleViewReceipt() {
    if (!lastOrder) return;
    setIsFetchingReceipt(true);
    try {
      const blob = await fetchReceiptBlob(lastOrder.id);
      openReceiptBlob(blob);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsFetchingReceipt(false);
    }
  }

  if (categoriesQuery.isLoading || menuItemsQuery.isLoading) {
    return <Loader label="Loading menu..." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-gray-900">New Order</h1>

      {lastOrder && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-success/10 px-4 py-3 text-sm">
          <span>
            Order <strong>{lastOrder.orderNumber}</strong> sent to the kitchen.
          </span>
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={lastOrder.status} />
            <PaymentStatusBadge payment={lastOrder.payment} />
            {!lastOrder.payment ? (
              <Button onClick={() => setIsPaymentOpen(true)} className="ml-2">
                <CreditCard className="h-4 w-4" />
                Take Payment
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handleViewReceipt}
                isLoading={isFetchingReceipt}
                className="ml-2"
              >
                <Receipt className="h-4 w-4" />
                View Receipt
              </Button>
            )}
          </div>
        </div>
      )}

      <OrderForm
        categories={categoriesQuery.data ?? []}
        menuItems={menuItemsQuery.data ?? []}
        onSubmit={(payload) => createOrderMutation.mutate(payload)}
        isSubmitting={createOrderMutation.isPending}
      />

      <Modal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title={`Take Payment — ${lastOrder?.orderNumber ?? ''}`}
      >
        {lastOrder && (
          <PaymentForm
            orderTotal={lastOrder.total}
            onSubmit={(payload) => paymentMutation.mutate(payload)}
            isSubmitting={paymentMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
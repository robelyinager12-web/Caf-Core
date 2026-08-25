import clsx from 'clsx';
import { Payment } from '../../types/order.types';

export function PaymentStatusBadge({ payment }: { payment?: Payment | null }) {
  if (!payment) {
    return (
      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
        Unpaid
      </span>
    );
  }

  const styles = {
    PAID: 'bg-success/10 text-success',
    PENDING: 'bg-warning/10 text-warning',
    REFUNDED: 'bg-danger/10 text-danger',
  };

  return (
    <span className={clsx('rounded-full px-2.5 py-1 text-xs font-medium', styles[payment.status])}>
      {payment.status === 'PAID' ? `Paid (${payment.method})` : payment.status}
    </span>
  );
}
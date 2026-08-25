import { useState, FormEvent } from 'react';
import { Banknote, CreditCard, Wifi } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../common/Button';
import { PaymentMethod } from '../../types/order.types';
import { formatCurrency } from '../../utils/formatCurrency';

interface PaymentFormProps {
  orderTotal: number;
  onSubmit: (payload: { method: PaymentMethod; amount: number }) => void;
  isSubmitting: boolean;
}

const METHODS: { value: PaymentMethod; label: string; icon: typeof Banknote }[] = [
  { value: 'CASH', label: 'Cash', icon: Banknote },
  { value: 'CARD', label: 'Card', icon: CreditCard },
  { value: 'ONLINE', label: 'Online', icon: Wifi },
];

export function PaymentForm({ orderTotal, onSubmit, isSubmitting }: PaymentFormProps) {
  const [method, setMethod] = useState<PaymentMethod>('CASH');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({ method, amount: orderTotal });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-lg bg-gray-50 p-4 text-center">
        <p className="text-xs text-gray-500">Amount Due</p>
        <p className="text-2xl font-bold text-primary-600">{formatCurrency(orderTotal)}</p>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Payment Method</label>
        <div className="grid grid-cols-3 gap-2">
          {METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMethod(m.value)}
              className={clsx(
                'flex flex-col items-center gap-1 rounded-lg px-3 py-3 text-xs font-medium transition-colors',
                method === m.value
                  ? 'bg-primary-50 text-primary-700 ring-2 ring-primary-500'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              )}
            >
              <m.icon className="h-5 w-5" />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" isLoading={isSubmitting} className="mt-2">
        Confirm Payment
      </Button>
    </form>
  );
}
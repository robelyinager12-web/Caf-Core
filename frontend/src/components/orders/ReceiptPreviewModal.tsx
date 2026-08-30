import { FileText, CreditCard, X, Printer } from 'lucide-react';
import { Order } from '../../types/order.types';
import { formatCurrency } from '../../utils/formatCurrency';

interface ReceiptPreviewModalProps {
  order: Order | null;
  onClose: () => void;
  onPrint: () => void;
  isPrinting: boolean;
}

function shortOrderLabel(orderNumber: string): string {
  const parts = orderNumber.split('-');
  return parts.length === 3 ? `#${parts[2]}` : orderNumber;
}

export function ReceiptPreviewModal({ order, onClose, onPrint, isPrinting }: ReceiptPreviewModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg dark:bg-gray-900">
        <div className="flex justify-end p-3">
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center px-6 pb-2 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10">
            <FileText className="h-6 w-6" />
          </span>
          <h2 className="mt-3 text-lg font-bold text-gray-900 dark:text-gray-100">
            Bill: {shortOrderLabel(order.orderNumber)}
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {order.orderType === 'DINE_IN'
              ? `Order from Table: ${order.tableOrToken ?? '—'}`
              : 'Order — Takeaway'}
          </p>
        </div>

        <div className="px-6 pb-4 pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
                <th className="pb-2 font-medium">Item</th>
                <th className="pb-2 text-center font-medium">Qty</th>
                <th className="pb-2 text-right font-medium">Price</th>
                <th className="pb-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 pr-2 text-gray-800 dark:text-gray-200">{item.menuItem.name}</td>
                  <td className="py-2 text-center text-gray-600 dark:text-gray-300">{item.quantity}</td>
                  <td className="py-2 text-right text-gray-600 dark:text-gray-300">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="py-2 text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total Amount</span>
            <span className="text-base font-bold text-primary-600">{formatCurrency(order.total)}</span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Payment Method</span>
            <span className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              <CreditCard className="h-3.5 w-3.5" />
              {order.payment?.method ?? 'Unpaid'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-gray-100 p-4 dark:border-gray-800">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onPrint}
            disabled={isPrinting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            <Printer className="h-4 w-4" />
            {isPrinting ? 'Preparing...' : 'Print Bill'}
          </button>
        </div>
      </div>
    </div>
  );
}
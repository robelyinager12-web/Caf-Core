import { AlertTriangle } from 'lucide-react';
import { Ingredient } from '../../types/inventory.types';

interface LowStockAlertProps {
  ingredients: Ingredient[];
}

export function LowStockAlert({ ingredients }: LowStockAlertProps) {
  const lowStockItems = ingredients.filter(
    (i) => i.inventory && i.inventory.quantityInStock <= i.inventory.lowStockThreshold
  );

  if (lowStockItems.length === 0) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl bg-warning/10 p-4 ring-1 ring-warning/30">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
      <div>
        <p className="text-sm font-semibold text-gray-900">
          {lowStockItems.length} ingredient{lowStockItems.length > 1 ? 's' : ''} running low
        </p>
        <p className="text-xs text-gray-600">
          {lowStockItems.map((i) => i.name).join(', ')}
        </p>
      </div>
    </div>
  );
}
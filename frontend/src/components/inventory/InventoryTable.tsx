import { PackagePlus, Settings2 } from 'lucide-react';
import clsx from 'clsx';
import { Ingredient } from '../../types/inventory.types';

interface InventoryTableProps {
  ingredients: Ingredient[];
  canManage: boolean;
  onAdjust: (ingredient: Ingredient) => void;
  onEditThreshold: (ingredient: Ingredient) => void;
}

export function InventoryTable({ ingredients, canManage, onAdjust, onEditThreshold }: InventoryTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      <table className="min-w-full divide-y divide-gray-100 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Ingredient</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">In Stock</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Low Stock Threshold</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            {canManage && <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {ingredients.map((ingredient) => {
            const stock = ingredient.inventory?.quantityInStock ?? 0;
            const threshold = ingredient.inventory?.lowStockThreshold ?? 0;
            const isLow = stock <= threshold;

            return (
              <tr key={ingredient.id}>
                <td className="px-4 py-3 font-medium text-gray-900">{ingredient.name}</td>
                <td className="px-4 py-3 text-gray-700">
                  {stock} {ingredient.unit}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {threshold} {ingredient.unit}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      'rounded-full px-2.5 py-1 text-xs font-medium',
                      isLow ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    )}
                  >
                    {isLow ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                {canManage && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onAdjust(ingredient)}
                        className="rounded-lg bg-gray-50 p-1.5 text-gray-600 hover:bg-gray-100"
                        title="Adjust stock"
                      >
                        <PackagePlus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditThreshold(ingredient)}
                        className="rounded-lg bg-gray-50 p-1.5 text-gray-600 hover:bg-gray-100"
                        title="Edit threshold"
                      >
                        <Settings2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
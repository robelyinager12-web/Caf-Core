import { useState, FormEvent } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Ingredient } from '../../types/inventory.types';

interface StockAdjustFormProps {
  ingredient: Ingredient;
  onSubmit: (payload: { quantityChange: number; reason: string }) => void;
  isSubmitting: boolean;
}

export function StockAdjustForm({ ingredient, onSubmit, isSubmitting }: StockAdjustFormProps) {
  const [direction, setDirection] = useState<'add' | 'remove'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsedQuantity = parseFloat(quantity);
    if (!parsedQuantity || parsedQuantity <= 0) return;

    onSubmit({
      quantityChange: direction === 'add' ? parsedQuantity : -parsedQuantity,
      reason,
    });
  }

  const currentStock = ingredient.inventory?.quantityInStock ?? 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        Current stock: <strong>{currentStock} {ingredient.unit}</strong>
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setDirection('add')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
            direction === 'add' ? 'bg-success/10 text-success ring-1 ring-success' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Add Stock
        </button>
        <button
          type="button"
          onClick={() => setDirection('remove')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
            direction === 'remove' ? 'bg-danger/10 text-danger ring-1 ring-danger' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Remove Stock
        </button>
      </div>

      <Input
        label={`Quantity (${ingredient.unit})`}
        type="number"
        step="0.01"
        min="0"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Reason</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          placeholder={direction === 'add' ? 'e.g., Weekly delivery received' : 'e.g., Spoilage, waste, correction'}
          required
          minLength={2}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <Button type="submit" isLoading={isSubmitting} variant={direction === 'remove' ? 'danger' : 'primary'}>
        {direction === 'add' ? 'Add Stock' : 'Remove Stock'}
      </Button>
    </form>
  );
}
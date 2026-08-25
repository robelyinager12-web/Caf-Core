import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { InventoryTable } from '../../components/inventory/InventoryTable';
import { StockAdjustForm } from '../../components/inventory/StockAdjustForm';
import { LowStockAlert } from '../../components/inventory/LowStockAlert';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { useToastStore } from '../../components/common/Toast';
import { useAuthStore } from '../../store/authStore';
import {
  getIngredients,
  adjustStock,
  createIngredient,
  updateThreshold,
} from '../../services/inventoryService';
import { Ingredient } from '../../types/inventory.types';
import { getErrorMessage } from '../../utils/validators';

export function InventoryPage() {
  const [adjustingIngredient, setAdjustingIngredient] = useState<Ingredient | null>(null);
  const [editingThresholdFor, setEditingThresholdFor] = useState<Ingredient | null>(null);
  const [thresholdValue, setThresholdValue] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newIngredient, setNewIngredient] = useState({ name: '', unit: '', initialQuantity: '', lowStockThreshold: '' });

  const user = useAuthStore((state) => state.user);
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  const ingredientsQuery = useQuery({ queryKey: ['ingredients'], queryFn: () => getIngredients() });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['ingredients'] });
  }

  const adjustMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { quantityChange: number; reason: string } }) =>
      adjustStock(id, payload),
    onSuccess: () => {
      invalidate();
      showToast('Stock adjusted successfully');
      setAdjustingIngredient(null);
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const thresholdMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: number }) => updateThreshold(id, value),
    onSuccess: () => {
      invalidate();
      showToast('Threshold updated');
      setEditingThresholdFor(null);
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const createMutation = useMutation({
    mutationFn: createIngredient,
    onSuccess: () => {
      invalidate();
      showToast('Ingredient created');
      setIsCreateOpen(false);
      setNewIngredient({ name: '', unit: '', initialQuantity: '', lowStockThreshold: '' });
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      name: newIngredient.name,
      unit: newIngredient.unit,
      initialQuantity: newIngredient.initialQuantity ? parseFloat(newIngredient.initialQuantity) : undefined,
      lowStockThreshold: newIngredient.lowStockThreshold ? parseFloat(newIngredient.lowStockThreshold) : undefined,
    });
  }

  function handleThresholdSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingThresholdFor) return;
    thresholdMutation.mutate({ id: editingThresholdFor.id, value: parseFloat(thresholdValue) });
  }

  if (ingredientsQuery.isLoading) {
    return <Loader label="Loading inventory..." />;
  }

  const ingredients = ingredientsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Inventory</h1>
        {canManage && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Ingredient
          </Button>
        )}
      </div>

      <LowStockAlert ingredients={ingredients} />

      <InventoryTable
        ingredients={ingredients}
        canManage={canManage}
        onAdjust={setAdjustingIngredient}
        onEditThreshold={(ingredient) => {
          setEditingThresholdFor(ingredient);
          setThresholdValue(String(ingredient.inventory?.lowStockThreshold ?? 0));
        }}
      />

      <Modal
        isOpen={!!adjustingIngredient}
        onClose={() => setAdjustingIngredient(null)}
        title={`Adjust Stock — ${adjustingIngredient?.name ?? ''}`}
      >
        {adjustingIngredient && (
          <StockAdjustForm
            ingredient={adjustingIngredient}
            onSubmit={(payload) => adjustMutation.mutate({ id: adjustingIngredient.id, payload })}
            isSubmitting={adjustMutation.isPending}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!editingThresholdFor}
        onClose={() => setEditingThresholdFor(null)}
        title={`Edit Low Stock Threshold — ${editingThresholdFor?.name ?? ''}`}
      >
        <form onSubmit={handleThresholdSubmit} className="flex flex-col gap-4">
          <Input
            label={`Threshold (${editingThresholdFor?.unit ?? ''})`}
            type="number"
            step="0.01"
            min="0"
            value={thresholdValue}
            onChange={(e) => setThresholdValue(e.target.value)}
            required
          />
          <Button type="submit" isLoading={thresholdMutation.isPending}>
            Save Threshold
          </Button>
        </form>
      </Modal>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add New Ingredient">
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            value={newIngredient.name}
            onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
            required
          />
          <Input
            label="Unit (e.g., g, ml, pcs)"
            value={newIngredient.unit}
            onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
            required
          />
          <Input
            label="Initial Quantity"
            type="number"
            step="0.01"
            min="0"
            value={newIngredient.initialQuantity}
            onChange={(e) => setNewIngredient({ ...newIngredient, initialQuantity: e.target.value })}
          />
          <Input
            label="Low Stock Threshold"
            type="number"
            step="0.01"
            min="0"
            value={newIngredient.lowStockThreshold}
            onChange={(e) => setNewIngredient({ ...newIngredient, lowStockThreshold: e.target.value })}
          />
          <Button type="submit" isLoading={createMutation.isPending}>
            Create Ingredient
          </Button>
        </form>
      </Modal>
    </div>
  );
}
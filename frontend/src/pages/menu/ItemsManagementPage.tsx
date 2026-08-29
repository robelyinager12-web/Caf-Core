import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { CategoryList } from '../../components/menu/CategoryList';
import { MenuItemCard } from '../../components/menu/MenuItemCard';
import { MenuItemForm } from '../../components/menu/MenuItemForm';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { useToastStore } from '../../components/common/Toast';
import { useAuthStore } from '../../store/authStore';
import {
  getCategories,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} from '../../services/menuService';
import { MenuItem, CreateMenuItemPayload } from '../../types/menu.types';
import { getErrorMessage } from '../../utils/validators';

export function ItemsManagementPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>(undefined);

  const user = useAuthStore((state) => state.user);
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: getCategories });
  const menuItemsQuery = useQuery({
    queryKey: ['menu-items', activeCategoryId],
    queryFn: () => getMenuItems(activeCategoryId ? { categoryId: activeCategoryId } : {}),
  });

  function invalidateMenu() {
    queryClient.invalidateQueries({ queryKey: ['menu-items'] });
  }

  const createMutation = useMutation({
    mutationFn: createMenuItem,
    onSuccess: () => {
      invalidateMenu();
      showToast('Item created');
      setIsFormOpen(false);
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateMenuItemPayload> }) =>
      updateMenuItem(id, payload),
    onSuccess: () => {
      invalidateMenu();
      showToast('Item updated');
      setIsFormOpen(false);
      setEditingItem(undefined);
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => {
      invalidateMenu();
      showToast('Item deleted');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      toggleAvailability(id, isAvailable),
    onSuccess: () => {
      invalidateMenu();
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  function handleFormSubmit(payload: CreateMenuItemPayload) {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function handleDelete(item: MenuItem) {
    if (confirm(`Delete "${item.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(item.id);
    }
  }

  if (categoriesQuery.isLoading || menuItemsQuery.isLoading) {
    return <Loader label="Loading items..." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Items</h1>
        {canManage && (
          <Button
            onClick={() => {
              setEditingItem(undefined);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        )}
      </div>

      <CategoryList
        categories={categoriesQuery.data ?? []}
        activeCategoryId={activeCategoryId}
        onSelect={setActiveCategoryId}
      />

      {menuItemsQuery.data && menuItemsQuery.data.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {menuItemsQuery.data.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              canManage={canManage}
              onEdit={(i) => {
                setEditingItem(i);
                setIsFormOpen(true);
              }}
              onDelete={handleDelete}
              onToggleAvailability={(i) =>
                toggleMutation.mutate({ id: i.id, isAvailable: !i.isAvailable })
              }
            />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          No items in this category yet.
        </p>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(undefined);
        }}
        title={editingItem ? 'Edit Item' : 'Add Item'}
      >
        <MenuItemForm
          categories={categoriesQuery.data ?? []}
          initialItem={editingItem}
          onSubmit={handleFormSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>
    </div>
  );
}
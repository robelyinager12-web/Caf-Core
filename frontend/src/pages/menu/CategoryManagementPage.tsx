import { useState, FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { useToastStore } from '../../components/common/Toast';
import { useAuthStore } from '../../store/authStore';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/menuService';
import { Category } from '../../types/menu.types';
import { getErrorMessage } from '../../utils/validators';

export function CategoryManagementPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  const [name, setName] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');

  const user = useAuthStore((state) => state.user);
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const queryClient = useQueryClient();
  const showToast = useToastStore((state) => state.show);

  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: getCategories });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingCategory(undefined);
    setName('');
    setDisplayOrder('');
  }

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      invalidate();
      showToast('Category created');
      closeForm();
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; displayOrder?: number } }) =>
      updateCategory(id, payload),
    onSuccess: () => {
      invalidate();
      showToast('Category updated');
      closeForm();
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      invalidate();
      showToast('Category deleted');
    },
    onError: (error) => showToast(getErrorMessage(error), 'error'),
  });

  function openCreate() {
    setEditingCategory(undefined);
    setName('');
    setDisplayOrder('');
    setIsFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setDisplayOrder(String(category.displayOrder));
    setIsFormOpen(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload = {
      name,
      displayOrder: displayOrder ? parseInt(displayOrder, 10) : undefined,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function handleDelete(category: Category) {
    if (confirm(`Delete category "${category.name}"? This is blocked if any menu items still use it.`)) {
      deleteMutation.mutate(category.id);
    }
  }

  if (categoriesQuery.isLoading) {
    return <Loader label="Loading categories..." />;
  }

  const categories = [...(categoriesQuery.data ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Menu Categories</h1>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        )}
      </div>

      {categories.length > 0 ? (
        <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <table className="min-w-full divide-y divide-gray-100 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Category</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Display Order</th>
                {canManage && (
                  <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="flex items-center gap-2 px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    <Layers className="h-4 w-4 text-primary-600" />
                    {category.name}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{category.displayOrder}</td>
                  {canManage && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(category)}
                          className="rounded-lg bg-gray-50 p-1.5 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="rounded-lg bg-danger/10 p-1.5 text-danger hover:bg-danger/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
          No categories yet.
        </p>
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Category Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input
            label="Display Order (optional)"
            type="number"
            min="0"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
          />
          <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
            {editingCategory ? 'Save Changes' : 'Create Category'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
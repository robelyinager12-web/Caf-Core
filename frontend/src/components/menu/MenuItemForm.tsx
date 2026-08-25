import { useState, FormEvent, useEffect } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Category, MenuItem, CreateMenuItemPayload } from '../../types/menu.types';

interface MenuItemFormProps {
  categories: Category[];
  initialItem?: MenuItem;
  onSubmit: (payload: CreateMenuItemPayload) => void;
  isSubmitting: boolean;
}

export function MenuItemForm({ categories, initialItem, onSubmit, isSubmitting }: MenuItemFormProps) {
  const [categoryId, setCategoryId] = useState(initialItem?.categoryId ?? categories[0]?.id ?? '');
  const [name, setName] = useState(initialItem?.name ?? '');
  const [description, setDescription] = useState(initialItem?.description ?? '');
  const [price, setPrice] = useState(initialItem ? String(initialItem.price) : '');
  const [image, setImage] = useState<File | undefined>(undefined);

  useEffect(() => {
    if (initialItem) {
      setCategoryId(initialItem.categoryId);
      setName(initialItem.name);
      setDescription(initialItem.description ?? '');
      setPrice(String(initialItem.price));
    }
  }, [initialItem]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      categoryId,
      name,
      description: description || undefined,
      price: parseFloat(price),
      image,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Category</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <Input
        label="Price"
        type="number"
        step="0.01"
        min="0"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">
          Image {initialItem && '(leave empty to keep current)'}
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setImage(e.target.files?.[0])}
          className="text-sm text-gray-600"
        />
      </div>

      <Button type="submit" isLoading={isSubmitting} className="mt-2">
        {initialItem ? 'Save Changes' : 'Create Menu Item'}
      </Button>
    </form>
  );
}
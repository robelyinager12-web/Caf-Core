import clsx from 'clsx';
import { Category } from '../../types/menu.types';

interface CategoryListProps {
  categories: Category[];
  activeCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
}

export function CategoryList({ categories, activeCategoryId, onSelect }: CategoryListProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onSelect(null)}
        className={clsx(
          'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
          activeCategoryId === null
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
        )}
      >
        All Items
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={clsx(
            'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
            activeCategoryId === category.id
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
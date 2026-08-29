import { Coffee, Soup, UtensilsCrossed, Sandwich, Beef, Wine, Pizza, Grid3x3 } from 'lucide-react';
import clsx from 'clsx';
import { Category, MenuItem } from '../../types/menu.types';

interface CategoryCardGridProps {
  categories: Category[];
  menuItems: MenuItem[];
  activeCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
}

// Maps common category names to a fitting icon; falls back to a generic
// utensils icon for anything not in the list, so this never breaks for a
// custom category name an admin creates later.
const ICON_MAP: Record<string, typeof Coffee> = {
  breakfast: Coffee,
  soups: Soup,
  soup: Soup,
  pasta: UtensilsCrossed,
  'main course': Beef,
  burgers: Sandwich,
  drinks: Wine,
  beverages: Wine,
  bbq: Pizza,
  snacks: Sandwich,
  desserts: Pizza,
  lunch: UtensilsCrossed,
};

function iconFor(categoryName: string) {
  return ICON_MAP[categoryName.toLowerCase()] ?? UtensilsCrossed;
}

export function CategoryCardGrid({
  categories,
  menuItems,
  activeCategoryId,
  onSelect,
}: CategoryCardGridProps) {
  const countFor = (categoryId: string) =>
    menuItems.filter((item) => item.categoryId === categoryId).length;

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={clsx(
          'flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors',
          activeCategoryId === null
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
            : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800'
        )}
      >
        <Grid3x3 className="h-5 w-5 text-primary-600" />
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">All</span>
        <span className="text-[11px] text-gray-400 dark:text-gray-500">{menuItems.length} items</span>
      </button>

      {categories.map((category) => {
        const Icon = iconFor(category.name);
        const isActive = activeCategoryId === category.id;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={clsx(
              'flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-colors',
              isActive
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800'
            )}
          >
            <Icon className="h-5 w-5 text-primary-600" />
            <span className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
              {category.name}
            </span>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {countFor(category.id)} items
            </span>
          </button>
        );
      })}
    </div>
  );
}
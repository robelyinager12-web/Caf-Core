import { Pencil, Trash2, ImageOff } from 'lucide-react';
import clsx from 'clsx';
import { MenuItem } from '../../types/menu.types';
import { formatCurrency } from '../../utils/formatCurrency';

interface MenuItemCardProps {
  item: MenuItem;
  canManage: boolean;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggleAvailability: (item: MenuItem) => void;
}

export function MenuItemCard({
  item,
  canManage,
  onEdit,
  onDelete,
  onToggleAvailability,
}: MenuItemCardProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      <div className="flex h-32 items-center justify-center bg-gray-100">
        {item.imageUrl ? (
          <img
            src={`${import.meta.env.VITE_SOCKET_URL}${item.imageUrl}`}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageOff className="h-8 w-8 text-gray-300" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
          <span
            className={clsx(
              'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
              item.isAvailable ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-500'
            )}
          >
            {item.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        {item.description && (
          <p className="line-clamp-2 text-xs text-gray-500">{item.description}</p>
        )}

        <p className="mt-1 text-base font-bold text-primary-600">{formatCurrency(item.price)}</p>

        {canManage && (
          <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
            <button
              onClick={() => onToggleAvailability(item)}
              className="flex-1 rounded-lg bg-gray-50 px-2 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
            >
              {item.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
            </button>
            <button
              onClick={() => onEdit(item)}
              className="rounded-lg bg-gray-50 p-1.5 text-gray-600 hover:bg-gray-100"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(item)}
              className="rounded-lg bg-danger/10 p-1.5 text-danger hover:bg-danger/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
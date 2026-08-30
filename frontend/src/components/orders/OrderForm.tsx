import { useState, useMemo } from 'react';
import { Plus, Minus, Trash2, Search, ImageOff } from 'lucide-react';
import { CategoryCardGrid } from './CategoryCardGrid';
import { Button } from '../common/Button';
import { Category, MenuItem } from '../../types/menu.types';
import { CartLine, OrderType } from '../../types/order.types';
import { formatCurrency } from '../../utils/formatCurrency';

interface OrderFormProps {
  categories: Category[];
  menuItems: MenuItem[];
  onSubmit: (payload: {
    orderType: OrderType;
    tableOrToken?: string;
    items: { menuItemId: string; quantity: number }[];
  }) => void;
  isSubmitting: boolean;
}

export function OrderForm({ categories, menuItems, onSubmit, isSubmitting }: OrderFormProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('TAKEAWAY');
  const [tableOrToken, setTableOrToken] = useState('');

  const visibleItems = useMemo(() => {
    let items = activeCategoryId
      ? menuItems.filter((i) => i.categoryId === activeCategoryId)
      : menuItems;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q));
    }

    return items;
  }, [menuItems, activeCategoryId, search]);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((l) => l.menuItemId === item.id);
      if (existing) {
        return prev.map((l) =>
          l.menuItemId === item.id ? { ...l, quantity: l.quantity + 1 } : l
        );
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  }

  function updateQuantity(menuItemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.menuItemId === menuItemId ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0)
    );
  }

  function removeLine(menuItemId: string) {
    setCart((prev) => prev.filter((l) => l.menuItemId !== menuItemId));
  }

  const total = cart.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const cartIsEmpty = cart.length === 0;

  function handleSubmit() {
    if (cartIsEmpty || isSubmitting) return;

    onSubmit({
      orderType,
      tableOrToken: tableOrToken || undefined,
      items: cart.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity })),
    });
    setCart([]);
    setTableOrToken('');
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product here..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </div>

        <CategoryCardGrid
          categories={categories}
          menuItems={menuItems}
          activeCategoryId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />

        {visibleItems.length === 0 ? (
          <p className="rounded-lg bg-gray-50 py-8 text-center text-sm text-gray-400 dark:bg-gray-900">
            No items match this search or category.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visibleItems.map((item) => {
              const isOrderable = item.isAvailable !== false;
              return (
                <div
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="aspect-[4/3] w-full bg-gray-100 dark:bg-gray-800">
                    {item.imageUrl ? (
                      <img
                        src={`${import.meta.env.VITE_SOCKET_URL}${item.imageUrl}`}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ImageOff className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-3">
                    <p className="line-clamp-2 text-xs font-medium text-gray-900 dark:text-gray-100">
                      {item.name}
                    </p>
                    <p className="text-sm font-semibold text-primary-600">
                      {formatCurrency(item.price)}
                    </p>

                    {isOrderable ? (
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        className="mt-auto rounded-lg bg-primary-600 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
                      >
                        Add
                      </button>
                    ) : (
                      <span className="mt-auto rounded-lg bg-gray-100 py-1.5 text-center text-xs font-medium text-gray-400 dark:bg-gray-800">
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex w-full flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 lg:w-80 lg:shrink-0">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Cart</h3>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOrderType('TAKEAWAY')}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
              orderType === 'TAKEAWAY'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Takeaway
          </button>
          <button
            type="button"
            onClick={() => setOrderType('DINE_IN')}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
              orderType === 'DINE_IN'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            Dine In
          </button>
        </div>

        <input
          value={tableOrToken}
          onChange={(e) => setTableOrToken(e.target.value)}
          placeholder={orderType === 'DINE_IN' ? 'Table number' : 'Pickup token (optional)'}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />

        <div className="flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto">
          {cartIsEmpty ? (
            <div className="flex flex-1 items-center justify-center py-10">
              <p className="text-sm text-gray-400 dark:text-gray-500">Cart is Empty</p>
            </div>
          ) : (
            cart.map((line) => (
              <div key={line.menuItemId} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 dark:text-gray-200">{line.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(line.price)} each
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(line.menuItemId, -1)}
                    className="rounded bg-gray-100 p-1 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-medium">{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(line.menuItemId, 1)}
                    className="rounded bg-gray-100 p-1 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeLine(line.menuItemId)}
                    className="ml-1 rounded bg-danger/10 p-1 text-danger hover:bg-danger/20"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
          <div className="mb-3 flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-gray-100">
            <span>Total Amount:</span>
            <span className="text-primary-600">{formatCurrency(total)}</span>
          </div>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={cartIsEmpty}
            isLoading={isSubmitting}
            className="w-full"
          >
            Place Order
          </Button>
        </div>
      </div>
    </div>
  );
}
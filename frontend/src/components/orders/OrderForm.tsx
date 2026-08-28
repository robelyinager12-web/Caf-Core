import { useState } from 'react';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { CategoryList } from '../menu/CategoryList';
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
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('TAKEAWAY');
  const [tableOrToken, setTableOrToken] = useState('');

  const visibleItems = activeCategoryId
    ? menuItems.filter((i) => i.categoryId === activeCategoryId)
    : menuItems;

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
    // Hard guard here in addition to the disabled button prop below —
    // never allow a submit call to fire with zero items, regardless of
    // how the click was triggered.
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <CategoryList
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />

        {visibleItems.length === 0 && (
          <p className="rounded-lg bg-gray-50 py-8 text-center text-sm text-gray-400">
            No available items in this category.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visibleItems.map((item) => {
            // The API's GET /menu?isAvailable=true already filters to
            // available items only — treat isAvailable as true here unless
            // explicitly false, so a missing/undefined field (which would
            // otherwise silently block every add-to-cart click) never
            // disables an item that's actually orderable.
            const isOrderable = item.isAvailable !== false;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => isOrderable && addToCart(item)}
                disabled={!isOrderable}
                className="flex flex-col items-start gap-1 rounded-xl bg-white p-3 text-left shadow-sm ring-1 ring-gray-200 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="text-sm font-medium text-gray-900">{item.name}</span>
                <span className="text-sm font-semibold text-primary-600">
                  {formatCurrency(item.price)}
                </span>
                {!isOrderable && <span className="text-xs text-danger">Unavailable</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <ShoppingCart className="h-4 w-4" />
          Current Order
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setOrderType('TAKEAWAY')}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
              orderType === 'TAKEAWAY'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            Takeaway
          </button>
          <button
            type="button"
            onClick={() => setOrderType('DINE_IN')}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium ${
              orderType === 'DINE_IN' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Dine In
          </button>
        </div>

        <input
          value={tableOrToken}
          onChange={(e) => setTableOrToken(e.target.value)}
          placeholder={orderType === 'DINE_IN' ? 'Table number' : 'Pickup token (optional)'}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {cartIsEmpty ? (
            <p className="py-6 text-center text-xs text-gray-400">
              No items added yet — tap a menu item on the left to add it.
            </p>
          ) : (
            cart.map((line) => (
              <div key={line.menuItemId} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{line.name}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(line.price)} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(line.menuItemId, -1)}
                    className="rounded bg-gray-100 p-1 hover:bg-gray-200"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-medium">{line.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(line.menuItemId, 1)}
                    className="rounded bg-gray-100 p-1 hover:bg-gray-200"
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

        <div className="border-t border-gray-100 pt-3">
          <div className="mb-3 flex items-center justify-between text-sm font-semibold">
            <span>Total</span>
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
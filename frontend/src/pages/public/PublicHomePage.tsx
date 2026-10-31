import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  ChefHat,
  Clock3,
  Coffee,
  ChevronDown,
  ImageOff,
  LogIn,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
  UserPlus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { QueryError } from '../../components/common/QueryError';
import { createGuestPickupOrder, getPublicMenu } from '../../services/publicService';
import { CartLine, Order } from '../../types/order.types';
import { MenuItem } from '../../types/menu.types';
import { formatCurrency } from '../../utils/formatCurrency';
import { getErrorMessage } from '../../utils/validators';

const API_ORIGIN =
  import.meta.env.VITE_SOCKET_URL ??
  (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api').replace(/\/api\/?$/, '');

function getImageUrl(imageUrl?: string | null) {
  return imageUrl ? `${API_ORIGIN}${imageUrl}` : undefined;
}

export function PublicHomePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const menuQuery = useQuery({ queryKey: ['public-menu'], queryFn: getPublicMenu });
  const orderMutation = useMutation({
    mutationFn: createGuestPickupOrder,
    onSuccess: (order) => {
      setLastOrder(order);
      setCart([]);
      setGuestName('');
      setGuestPhone('');
      setIsCartOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  const menuItems = menuQuery.data ?? [];
  const categories = useMemo(
    () => [
      'All',
      ...Array.from(
        new Set(menuItems.flatMap((item) => (item.category?.name ? [item.category.name] : [])))
      ).sort(),
    ],
    [menuItems]
  );
  const visibleItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return menuItems.filter((item) => {
      const inCategory = activeCategory === 'All' || item.category?.name === activeCategory;
      const matchesSearch =
        !query ||
        item.name.toLocaleLowerCase().includes(query) ||
        item.description?.toLocaleLowerCase().includes(query) ||
        item.category?.name.toLocaleLowerCase().includes(query);
      return inCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, search]);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartQuantity = cart.reduce((total, item) => total + item.quantity, 0);

  function addToCart(item: MenuItem) {
    setLastOrder(null);
    setCart((current) => {
      const existing = current.find((line) => line.menuItemId === item.id);
      if (existing) {
        return current.map((line) =>
          line.menuItemId === item.id && line.quantity < 50
            ? { ...line, quantity: line.quantity + 1 }
            : line
        );
      }
      return [
        ...current,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
          imageUrl: item.imageUrl,
        },
      ];
    });
  }

  function changeQuantity(menuItemId: string, change: number) {
    setCart((current) =>
      current
        .map((item) =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: Math.min(50, item.quantity + change) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cart.length === 0 || orderMutation.isPending) return;
    orderMutation.mutate({
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      items: cart.map(({ menuItemId, quantity }) => ({ menuItemId, quantity })),
    });
  }

  return (
    <div className="min-h-screen bg-[#faf8f4] text-gray-900">
      <header className="sticky top-0 z-30 border-b border-amber-950/10 bg-[#faf8f4]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
          <a href="/" className="flex items-center gap-3" aria-label="CaféCore home">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-900 text-amber-50">
              <Coffee className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-tight text-amber-950">
                CaféCore
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-800/70">
                Café & kitchen
              </span>
            </span>
          </a>
          <nav
            className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3 lg:gap-5"
            aria-label="Main navigation"
          >
            <a
              href="#menu"
              className="hidden text-sm font-medium text-gray-700 hover:text-amber-900 lg:inline"
            >
              Menu
            </a>
            <a
              href="#about"
              className="hidden text-sm font-medium text-gray-700 hover:text-amber-900 lg:inline"
            >
              Our café
            </a>
            <StaffAccessMenu />
            <a
              href="#menu"
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-900 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-amber-800 sm:gap-2 sm:px-4 sm:text-sm"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Order pickup</span>
              <span className="sm:hidden">Order</span>
              {cartQuantity > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs text-amber-950">
                  {cartQuantity}
                </span>
              )}
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#2c1c15] text-white">
          <div className="absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-amber-700/20 blur-3xl" />
          <div className="absolute -bottom-48 left-1/4 h-96 w-96 rounded-full bg-orange-700/15 blur-3xl" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-100/20 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.16em] text-amber-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Made for your everyday moments
              </p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Good food.
                <span className="block font-serif italic text-amber-300">Good coffee.</span>
                Good company.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-stone-300 sm:text-lg">
                Take a look at the menu, choose your favourites, and place a pickup order in a few
                simple steps. Freshly prepared at CaféCore and ready when you arrive.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#menu"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-amber-950 transition hover:bg-amber-300"
                >
                  Explore the menu
                  <ArrowRight className="h-4 w-4" />
                </a>
                <span className="inline-flex items-center gap-2 text-sm text-stone-300">
                  <Clock3 className="h-4 w-4 text-amber-300" />
                  Pay when you pick up
                </span>
              </div>
              <p className="mt-6 text-sm text-stone-300">
                Café staff?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-amber-200 underline underline-offset-4 hover:text-white"
                >
                  Sign in to your role dashboard
                </Link>
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-4 rotate-3 rounded-[2rem] border border-amber-200/20" />
              <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-gradient-to-br from-amber-100/15 to-orange-950/60 p-5 shadow-2xl sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                    From our menu
                  </span>
                  <ChefHat className="h-5 w-5 text-amber-200" />
                </div>
                {menuItems.length > 0 ? (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {menuItems.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addToCart(item)}
                        className="group overflow-hidden rounded-2xl border border-white/10 bg-black/20 text-left transition hover:border-amber-300/50 hover:bg-black/30"
                      >
                        <div className="aspect-[4/3] overflow-hidden bg-stone-800">
                          {item.imageUrl ? (
                            <img
                              src={getImageUrl(item.imageUrl)}
                              alt={item.name}
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Coffee className="h-8 w-8 text-amber-100/40" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                          <p className="mt-1 text-sm font-medium text-amber-300">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 flex aspect-[4/3] items-center justify-center rounded-2xl bg-black/15 text-amber-100/70">
                    <Coffee className="h-14 w-14" />
                  </div>
                )}
                <a
                  href="#menu"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-200 hover:text-white"
                >
                  Browse all available items
                  <ArrowDown className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="menu"
          className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
        >
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
                Prepared with care
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-amber-950 sm:text-4xl">
                Explore our menu
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
                Browse every currently available item. Add your favourites to the basket for pickup.
              </p>
            </div>
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                aria-label="Search menu"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search food, coffee, and more"
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10"
              />
            </div>
          </div>

          <div className="mb-7 flex gap-2 overflow-x-auto pb-2" aria-label="Menu categories">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategory === category
                    ? 'bg-amber-900 text-white'
                    : 'border border-gray-200 bg-white text-gray-700 hover:border-amber-700 hover:text-amber-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {menuQuery.isLoading ? (
            <Loader label="Loading the menu..." />
          ) : menuQuery.isError ? (
            <QueryError error={menuQuery.error} onRetry={() => void menuQuery.refetch()} />
          ) : visibleItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
              <Coffee className="mx-auto h-9 w-9 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No menu items found</h3>
              <p className="mt-1 text-sm text-gray-500">Try another search or category.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleItems.map((item) => (
                <PublicMenuCard key={item.id} item={item} onAdd={() => addToCart(item)} />
              ))}
            </div>
          )}
        </section>

        <section id="about" className="border-y border-amber-950/10 bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8 lg:py-16">
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                <ChefHat className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-amber-950">Made to enjoy</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Find something for breakfast, lunch, a coffee break, or a little treat.
              </p>
            </div>
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                <ShoppingBag className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-amber-950">Easy pickup ordering</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Choose from available items, send your order, and collect it at the café.
              </p>
            </div>
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                <Clock3 className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-amber-950">Pay at pickup</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                No online payment is taken here. Pay the café team when you collect your order.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#2c1c15] text-stone-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Coffee className="h-5 w-5 text-amber-300" />
              <span className="font-semibold text-white">CaféCore</span>
              <span className="text-sm text-stone-400">Good food, shared moments.</span>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-sm">
              <a href="#menu" className="hover:text-white">
                Menu
              </a>
              <a href="#about" className="hover:text-white">
                About
              </a>
              <Link to="/privacy" className="hover:text-white">
                Privacy
              </Link>
              <StaffAccessMenu placement="top" />
            </div>
          </div>
          <p className="border-t border-white/10 pt-4 text-xs text-stone-400">
            © {new Date().getFullYear()} CaféCore. All rights reserved.
          </p>
        </div>
      </footer>

      <aside
        id="pickup-cart"
        className="fixed bottom-4 right-4 z-40 w-[min(100%-2rem,24rem)]"
        aria-label="Pickup order basket"
      >
        {!isCartOpen && !lastOrder ? (
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="ml-auto flex items-center gap-3 rounded-full bg-amber-950 px-5 py-3 text-left text-white shadow-xl transition hover:bg-amber-900"
          >
            <ShoppingBag className="h-5 w-5 text-amber-200" />
            <span className="font-semibold">Your order</span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{cartQuantity}</span>
            {cartQuantity > 0 && (
              <span className="text-sm font-semibold text-amber-200">
                {formatCurrency(cartTotal)}
              </span>
            )}
          </button>
        ) : lastOrder ? (
          <div
            role="status"
            className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
                <div>
                  <h2 className="font-semibold text-gray-900">Pickup order received</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Order <strong>{lastOrder.orderNumber}</strong> has been sent to the café. Pay
                    when you collect it.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setLastOrder(null);
                      setIsCartOpen(false);
                    }}
                    className="mt-3 text-sm font-semibold text-amber-900 hover:underline"
                  >
                    Continue browsing
                  </button>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close order confirmation"
                onClick={() => {
                  setLastOrder(null);
                  setIsCartOpen(false);
                }}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={submitOrder}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-amber-950 px-5 py-4 text-white">
              <div>
                <h2 className="font-semibold">Your pickup order</h2>
                <p className="mt-0.5 text-xs text-amber-100/75">
                  {cartQuantity} {cartQuantity === 1 ? 'item' : 'items'} · pay at pickup
                </p>
              </div>
              <button
                type="button"
                aria-label="Close pickup order basket"
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg p-1 text-amber-100 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-64 space-y-3 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">
                  Your basket is empty. Add something from the menu to get started.
                </p>
              ) : (
                cart.map((item) => (
                  <div key={item.menuItemId} className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-amber-50">
                      {item.imageUrl ? (
                        <img
                          src={getImageUrl(item.imageUrl)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-amber-800/40">
                          <ImageOff className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name} quantity`}
                        onClick={() => changeQuantity(item.menuItemId, -1)}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() => changeQuantity(item.menuItemId, 1)}
                        disabled={item.quantity >= 50}
                        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-40"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => changeQuantity(item.menuItemId, -item.quantity)}
                        className="ml-1 rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t border-gray-100 p-4">
                <div className="mb-3 flex items-center justify-between font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="grid gap-2">
                  <label className="sr-only" htmlFor="guest-name">
                    Your name
                  </label>
                  <input
                    id="guest-name"
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    required
                    minLength={2}
                    maxLength={150}
                    autoComplete="name"
                    placeholder="Your name"
                    className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10"
                  />
                  <label className="sr-only" htmlFor="guest-phone">
                    Phone number
                  </label>
                  <input
                    id="guest-phone"
                    type="tel"
                    value={guestPhone}
                    onChange={(event) => setGuestPhone(event.target.value)}
                    required
                    minLength={7}
                    maxLength={30}
                    autoComplete="tel"
                    placeholder="Phone number"
                    className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/10"
                  />
                </div>
                {orderMutation.isError && (
                  <p role="alert" className="mt-2 text-xs text-red-600">
                    {getErrorMessage(orderMutation.error)}
                  </p>
                )}
                <Button
                  type="submit"
                  isLoading={orderMutation.isPending}
                  className="mt-3 w-full bg-amber-900 hover:bg-amber-800"
                >
                  Send pickup order
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="mt-2 text-center text-[11px] leading-4 text-gray-500">
                  Your name and phone are shared with café staff to prepare your order.
                </p>
              </div>
            )}
          </form>
        )}
      </aside>
    </div>
  );
}

function StaffAccessMenu({ placement = 'bottom' }: { placement?: 'top' | 'bottom' }) {
  return (
    <details className="group relative">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-amber-900/25 bg-white px-4 py-2.5 text-sm font-semibold text-amber-950 transition hover:border-amber-900 hover:bg-amber-50 [&::-webkit-details-marker]:hidden">
        Staff access
        <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
      </summary>
      <div
        className={`absolute right-0 z-50 min-w-48 rounded-xl border border-amber-950/10 bg-white p-2 text-sm text-gray-800 shadow-xl ${
          placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}
      >
        <Link
          to="/login"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-medium hover:bg-amber-50 hover:text-amber-950"
        >
          <LogIn className="h-4 w-4" />
          Staff sign in
        </Link>
        <Link
          to="/signup"
          className="flex items-center gap-2 rounded-lg px-3 py-2.5 font-medium hover:bg-amber-50 hover:text-amber-950"
        >
          <UserPlus className="h-4 w-4" />
          Request an account
        </Link>
      </div>
    </details>
  );
}

function PublicMenuCard({ item, onAdd }: { item: MenuItem; onAdd: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getImageUrl(item.imageUrl);

  return (
    <article className="group overflow-hidden rounded-2xl border border-amber-950/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-amber-50">
        {imageUrl && !imageFailed ? (
          <img
            src={imageUrl}
            alt={item.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-amber-900/30">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
        {item.category?.name && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-amber-950 shadow-sm">
            {item.category.name}
          </span>
        )}
      </div>
      <div className="flex min-h-44 flex-col p-4">
        <h3 className="font-semibold text-gray-900">{item.name}</h3>
        <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
          {item.description || 'A café favourite, prepared to order.'}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-base font-bold text-amber-900">{formatCurrency(item.price)}</span>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}

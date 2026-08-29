import { useQuery } from '@tanstack/react-query';
import { Coffee, DollarSign, ClipboardList, Clock3, Calendar } from 'lucide-react';
import { getSalesSummary, getTopItems } from '../../services/reportService';
import { getMenuItems } from '../../services/menuService';
import { getOrders } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatDateOnly, toISODateStart, toISODateEnd } from '../../utils/formatDate';
import { Loader } from '../../components/common/Loader';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge';
import { PaymentStatusBadge } from '../../components/orders/PaymentStatusBadge';
import { SalesChart } from '../../components/reports/SalesChart';

function todayRange() {
  const now = new Date();
  return { from: toISODateStart(now), to: toISODateEnd(now) };
}

function last7DaysRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 6);
  return { from: toISODateStart(from), to: toISODateEnd(to) };
}

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  icon: typeof Coffee;
}

function StatCard({ label, value, subtext, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      {subtext && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{subtext}</p>}
    </div>
  );
}

// Order numbers in this system (ORD-20260828-0001) are longer than a plain
// sequential number — shortening the display here (dropping the "ORD-"
// prefix and date segment, keeping only the trailing sequence) keeps the
// Latest Orders table compact enough to avoid the column-wrapping/
// horizontal-scroll issue that a long full order number causes. The full
// number is still available via the title tooltip and in Order History.
function shortOrderLabel(orderNumber: string): string {
  const parts = orderNumber.split('-');
  return parts.length === 3 ? `#${parts[2]}` : orderNumber;
}

export function DashboardPage() {
  const today = todayRange();
  const last7Days = last7DaysRange();

  const salesQuery = useQuery({
    queryKey: ['sales-summary', today.from, today.to],
    queryFn: () => getSalesSummary(today.from, today.to),
  });

  const weeklySalesQuery = useQuery({
    queryKey: ['sales-summary', last7Days.from, last7Days.to],
    queryFn: () => getSalesSummary(last7Days.from, last7Days.to),
  });

  const topItemsQuery = useQuery({
    queryKey: ['top-items', today.from, today.to],
    queryFn: () => getTopItems(today.from, today.to, 5),
  });

  const menuItemsQuery = useQuery({
    queryKey: ['menu-items', 'all'],
    queryFn: () => getMenuItems(),
  });

  const pendingOrdersQuery = useQuery({
    queryKey: ['orders', 'PENDING'],
    queryFn: () => getOrders({ status: 'PENDING' }),
  });

  const recentOrdersQuery = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: () => getOrders({ limit: 6 }),
  });

  if (salesQuery.isLoading || menuItemsQuery.isLoading) {
    return <Loader label="Loading dashboard..." />;
  }

  const summary = salesQuery.data;
  const rangeLabel = `${formatDateOnly(last7Days.from)} - ${formatDateOnly(last7Days.to)}`;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <span className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-gray-600 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-800">
          <Calendar className="h-3.5 w-3.5 text-gray-400" />
          {rangeLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Items"
          value={String(menuItemsQuery.data?.length ?? 0)}
          subtext="Across all categories"
          icon={Coffee}
        />
        <StatCard
          label="Total Sale Revenue"
          value={formatCurrency(summary?.totalRevenue ?? 0)}
          subtext="Today"
          icon={DollarSign}
        />
        <StatCard
          label="Total Orders Today"
          value={String(summary?.totalOrders ?? 0)}
          subtext="Completed orders"
          icon={ClipboardList}
        />
        <StatCard
          label="Pending Orders"
          value={String(pendingOrdersQuery.data?.length ?? 0)}
          subtext="Awaiting the kitchen"
          icon={Clock3}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="min-w-0 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Orders and Sales Summary
          </h2>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">{rangeLabel}</p>
          {weeklySalesQuery.isLoading ? (
            <Loader label="Loading chart..." />
          ) : (
            <SalesChart data={weeklySalesQuery.data?.dailyBreakdown ?? []} />
          )}
        </div>

        <div className="min-w-0 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">Latest Orders</h2>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">Showing latest orders</p>

          {recentOrdersQuery.isLoading ? (
            <Loader label="Loading orders..." />
          ) : recentOrdersQuery.data && recentOrdersQuery.data.length > 0 ? (
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 dark:text-gray-500">
                  <th className="w-1/5 whitespace-nowrap pb-2 pr-2 font-medium">Order</th>
                  <th className="w-1/6 whitespace-nowrap pb-2 pr-2 font-medium">Amount</th>
                  <th className="w-1/5 whitespace-nowrap pb-2 pr-2 font-medium">Status</th>
                  <th className="w-1/5 whitespace-nowrap pb-2 pr-2 font-medium">Payment</th>
                  <th className="w-1/4 whitespace-nowrap pb-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentOrdersQuery.data.map((order) => (
                  <tr key={order.id}>
                    <td
                      className="truncate whitespace-nowrap py-2 pr-2 font-medium text-gray-900 dark:text-gray-100"
                      title={order.orderNumber}
                    >
                      {shortOrderLabel(order.orderNumber)}
                    </td>
                    <td className="whitespace-nowrap py-2 pr-2 text-gray-700 dark:text-gray-300">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="whitespace-nowrap py-2 pr-2">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="whitespace-nowrap py-2 pr-2">
                      <PaymentStatusBadge payment={order.payment} />
                    </td>
                    <td className="truncate whitespace-nowrap py-2 text-xs text-gray-400 dark:text-gray-500">
                      {formatDateOnly(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
              No orders yet.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Top Selling Items Today
        </h2>
        {topItemsQuery.isLoading ? (
          <Loader label="Loading top items..." />
        ) : topItemsQuery.data && topItemsQuery.data.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {topItemsQuery.data.map((item, index) => (
              <li
                key={item.menuItemId}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800"
              >
                <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-500">
                    {index + 1}
                  </span>
                  {item.name}
                </span>
                <span className="text-gray-500 dark:text-gray-400">{item.quantitySold} sold</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No completed orders yet today.</p>
        )}
      </div>
    </div>
  );
}
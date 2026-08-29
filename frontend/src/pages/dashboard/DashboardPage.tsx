import { useQuery } from '@tanstack/react-query';
import { Coffee, DollarSign, ClipboardList, Clock3 } from 'lucide-react';
import { getSalesSummary, getTopItems } from '../../services/reportService';
import { getMenuItems } from '../../services/menuService';
import { getOrders } from '../../services/orderService';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, toISODateStart, toISODateEnd } from '../../utils/formatDate';
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
  icon: typeof Coffee;
}

function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10">
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
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
    queryFn: () => getOrders({ limit: 8 }),
  });

  if (salesQuery.isLoading || menuItemsQuery.isLoading) {
    return <Loader label="Loading dashboard..." />;
  }

  const summary = salesQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Menu Items"
          value={String(menuItemsQuery.data?.length ?? 0)}
          icon={Coffee}
        />
        <StatCard
          label="Total Sale Revenue Today"
          value={formatCurrency(summary?.totalRevenue ?? 0)}
          icon={DollarSign}
        />
        <StatCard
          label="Total Orders Today"
          value={String(summary?.totalOrders ?? 0)}
          icon={ClipboardList}
        />
        <StatCard
          label="Pending Orders"
          value={String(pendingOrdersQuery.data?.length ?? 0)}
          icon={Clock3}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Orders and Sales Summary
          </h2>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">Last 7 days</p>
          {weeklySalesQuery.isLoading ? (
            <Loader label="Loading chart..." />
          ) : (
            <SalesChart data={weeklySalesQuery.data?.dailyBreakdown ?? []} />
          )}
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">Latest Orders</h2>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">Showing most recent orders</p>

          {recentOrdersQuery.isLoading ? (
            <Loader label="Loading orders..." />
          ) : recentOrdersQuery.data && recentOrdersQuery.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 dark:text-gray-500">
                    <th className="pb-2 pr-3 font-medium">Order #</th>
                    <th className="pb-2 pr-3 font-medium">Total</th>
                    <th className="pb-2 pr-3 font-medium">Status</th>
                    <th className="pb-2 pr-3 font-medium">Payment</th>
                    <th className="pb-2 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {recentOrdersQuery.data.map((order) => (
                    <tr key={order.id}>
                      <td className="py-2 pr-3 font-medium text-gray-900 dark:text-gray-100">
                        {order.orderNumber}
                      </td>
                      <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-2 pr-3">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-2 pr-3">
                        <PaymentStatusBadge payment={order.payment} />
                      </td>
                      <td className="py-2 text-xs text-gray-400 dark:text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
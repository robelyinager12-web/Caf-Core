import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';
import { getSalesSummary, getTopItems } from '../../services/reportService';
import { formatCurrency } from '../../utils/formatCurrency';
import { toISODateStart, toISODateEnd } from '../../utils/formatDate';
import { Loader } from '../../components/common/Loader';

function todayRange() {
  const now = new Date();
  return { from: toISODateStart(now), to: toISODateEnd(now) };
}

export function DashboardPage() {
  const { from, to } = todayRange();

  const salesQuery = useQuery({
    queryKey: ['sales-summary', from, to],
    queryFn: () => getSalesSummary(from, to),
  });

  const topItemsQuery = useQuery({
    queryKey: ['top-items', from, to],
    queryFn: () => getTopItems(from, to, 5),
  });

  if (salesQuery.isLoading) {
    return <Loader label="Loading today's overview..." />;
  }

  const summary = salesQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-900">Today's Overview</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Revenue Today</p>
              <p className="text-lg font-semibold">{formatCurrency(summary?.totalRevenue ?? 0)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Orders Today</p>
              <p className="text-lg font-semibold">{summary?.totalOrders ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Average Order Value</p>
              <p className="text-lg font-semibold">
                {formatCurrency(summary?.averageOrderValue ?? 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Top Selling Items Today</h2>
        {topItemsQuery.isLoading ? (
          <Loader label="Loading top items..." />
        ) : topItemsQuery.data && topItemsQuery.data.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {topItemsQuery.data.map((item, index) => (
              <li
                key={item.menuItemId}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                    {index + 1}
                  </span>
                  {item.name}
                </span>
                <span className="text-gray-500">{item.quantitySold} sold</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No completed orders yet today.</p>
        )}
      </div>
    </div>
  );
}
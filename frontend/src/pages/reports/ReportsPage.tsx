import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSalesSummary, getTopItems, getInventoryUsage, getStockAdjustments } from '../../services/reportService';
import { SalesChart } from '../../components/reports/SalesChart';
import { TopItemsChart } from '../../components/reports/TopItemsChart';
import { ReportExport } from '../../components/reports/ReportExport';
import { Loader } from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateOnly, toISODateStart, toISODateEnd } from '../../utils/formatDate';

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 6); // last 7 days including today
  return { from: toISODateStart(from), to: toISODateEnd(to) };
}

export function ReportsPage() {
  const [range, setRange] = useState(defaultRange());
  const [fromInput, setFromInput] = useState(range.from.slice(0, 10));
  const [toInput, setToInput] = useState(range.to.slice(0, 10));

  const salesQuery = useQuery({
    queryKey: ['report-sales', range.from, range.to],
    queryFn: () => getSalesSummary(range.from, range.to),
  });

  const topItemsQuery = useQuery({
    queryKey: ['report-top-items', range.from, range.to],
    queryFn: () => getTopItems(range.from, range.to, 10),
  });

  const usageQuery = useQuery({
    queryKey: ['report-usage', range.from, range.to],
    queryFn: () => getInventoryUsage(range.from, range.to),
  });

  const adjustmentsQuery = useQuery({
    queryKey: ['report-adjustments', range.from, range.to],
    queryFn: () => getStockAdjustments(range.from, range.to),
  });

  function applyRange() {
    setRange({
      from: toISODateStart(new Date(fromInput)),
      to: toISODateEnd(new Date(toInput)),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-xl font-semibold text-gray-900">Reports</h1>

        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">From</label>
            <input
              type="date"
              value={fromInput}
              onChange={(e) => setFromInput(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">To</label>
            <input
              type="date"
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
          <button
            onClick={applyRange}
            className="rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Sales Summary */}
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Sales Summary</h2>
          {salesQuery.data && (
            <ReportExport
              filename={`sales-summary-${fromInput}-to-${toInput}.csv`}
              headers={['Date', 'Revenue', 'Orders']}
              rows={salesQuery.data.dailyBreakdown.map((d) => [d.date, d.revenue.toFixed(2), d.orders])}
            />
          )}
        </div>

        {salesQuery.isLoading ? (
          <Loader label="Loading sales data..." />
        ) : (
          <>
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(salesQuery.data?.totalRevenue ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Orders</p>
                <p className="text-lg font-semibold text-gray-900">{salesQuery.data?.totalOrders ?? 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Average Order Value</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(salesQuery.data?.averageOrderValue ?? 0)}
                </p>
              </div>
            </div>
            <SalesChart data={salesQuery.data?.dailyBreakdown ?? []} />
          </>
        )}
      </section>

      {/* Top Selling Items */}
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Top Selling Items</h2>
          {topItemsQuery.data && (
            <ReportExport
              filename={`top-items-${fromInput}-to-${toInput}.csv`}
              headers={['Item', 'Quantity Sold', 'Revenue']}
              rows={topItemsQuery.data.map((i) => [i.name, i.quantitySold, i.revenue.toFixed(2)])}
            />
          )}
        </div>
        {topItemsQuery.isLoading ? (
          <Loader label="Loading top items..." />
        ) : (
          <TopItemsChart data={topItemsQuery.data ?? []} />
        )}
      </section>

      {/* Inventory Usage */}
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Inventory Usage</h2>
          {usageQuery.data && (
            <ReportExport
              filename={`inventory-usage-${fromInput}-to-${toInput}.csv`}
              headers={['Ingredient', 'Quantity Used', 'Unit']}
              rows={usageQuery.data.map((u) => [u.name, u.quantityUsed.toFixed(2), u.unit])}
            />
          )}
        </div>
        {usageQuery.isLoading ? (
          <Loader label="Loading usage data..." />
        ) : usageQuery.data && usageQuery.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Ingredient</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Quantity Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usageQuery.data.map((u) => (
                  <tr key={u.ingredientId}>
                    <td className="px-3 py-2 text-gray-800">{u.name}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {u.quantityUsed.toFixed(2)} {u.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">No ingredient usage in this range.</p>
        )}
      </section>

      {/* Stock Adjustments (waste/shrinkage audit) */}
      <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Manual Stock Adjustments</h2>
          {adjustmentsQuery.data && (
            <ReportExport
              filename={`stock-adjustments-${fromInput}-to-${toInput}.csv`}
              headers={['Date', 'Performed By', 'Reason', 'Change']}
              rows={adjustmentsQuery.data.map((a) => [
                formatDateOnly(a.createdAt),
                a.performedBy,
                String((a.metadata as any)?.reason ?? ''),
                String((a.metadata as any)?.quantityChange ?? ''),
              ])}
            />
          )}
        </div>
        {adjustmentsQuery.isLoading ? (
          <Loader label="Loading adjustments..." />
        ) : adjustmentsQuery.data && adjustmentsQuery.data.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {adjustmentsQuery.data.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                <span className="text-gray-700">
                  {String((a.metadata as any)?.reason ?? 'No reason given')}
                </span>
                <span className="text-xs text-gray-400">
                  {a.performedBy} · {formatDateOnly(a.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-8 text-center text-sm text-gray-500">No manual adjustments in this range.</p>
        )}
      </section>
    </div>
  );
}
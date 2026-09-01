import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { getSalesSummary } from '../../services/reportService';
import { Loader } from '../../components/common/Loader';
import { DateRangePicker } from '../../components/common/DateRangePicker';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDateOnly, toISODateStart, toISODateEnd } from '../../utils/formatDate';

function last7DaysRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 6);
  return { from: toISODateStart(from), to: toISODateEnd(to) };
}

function exportToCsv(rows: { date: string; revenue: number }[]) {
  const headers = ['Date', 'Amount'];
  const csvRows = rows.map((r) => [r.date, r.revenue.toFixed(2)]);
  const csv = [headers, ...csvRows].map((row) => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'revenue-report.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const [range, setRange] = useState(last7DaysRange());

  const salesQuery = useQuery({
    queryKey: ['revenue-report', range.from, range.to],
    queryFn: () => getSalesSummary(range.from, range.to),
  });

  const dailyBreakdown = salesQuery.data?.dailyBreakdown ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Report</h1>
          <p className="text-xs text-gray-400 dark:text-gray-500">Dashboard &gt; Report</p>
        </div>
        <DateRangePicker from={range.from} to={range.to} onApply={(from, to) => setRange({ from, to })} />
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 dark:border-gray-800">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Revenue Report</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Showing collected revenue for {formatDateOnly(range.from)} to {formatDateOnly(range.to)}
            </p>
          </div>
          <button
            onClick={() => exportToCsv(dailyBreakdown)}
            disabled={dailyBreakdown.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-400 dark:border-gray-800 dark:text-gray-500">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {salesQuery.isLoading ? (
                <tr>
                  <td colSpan={2} className="py-8">
                    <Loader label="Loading revenue..." />
                  </td>
                </tr>
              ) : dailyBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                    No revenue data for this range.
                  </td>
                </tr>
              ) : (
                dailyBreakdown.map((row) => (
                  <tr key={row.date}>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {formatDateOnly(row.date)}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(row.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {dailyBreakdown.length > 0 && (
              <tfoot>
                <tr className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">Total</td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary-600">
                    {formatCurrency(salesQuery.data?.totalRevenue ?? 0)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
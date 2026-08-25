import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';

interface SalesChartProps {
  data: { date: string; revenue: number; orders: number }[];
}

export function SalesChart({ data }: SalesChartProps) {
  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-gray-500">No sales data for this range.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} width={80} />
        <Tooltip
          formatter={(value: number, name: string) =>
            name === 'revenue' ? formatCurrency(value) : value
          }
        />
        <Line type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
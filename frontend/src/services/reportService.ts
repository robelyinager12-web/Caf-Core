import { api } from './api';

interface SalesSummary {
  dateFrom: string;
  dateTo: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  dailyBreakdown: { date: string; revenue: number; orders: number }[];
}

interface TopItem {
  menuItemId: string;
  name: string;
  quantitySold: number;
  revenue: number;
}

export async function getSalesSummary(dateFrom: string, dateTo: string): Promise<SalesSummary> {
  const { data } = await api.get('/reports/sales-summary', { params: { dateFrom, dateTo } });
  return data.data;
}

export async function getTopItems(dateFrom: string, dateTo: string, limit = 5): Promise<TopItem[]> {
  const { data } = await api.get('/reports/top-items', { params: { dateFrom, dateTo, limit } });
  return data.data;
}
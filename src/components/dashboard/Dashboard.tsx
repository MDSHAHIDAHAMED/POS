import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { DollarSign, Package, TrendingUp, ShoppingCart, AlertTriangle, Clock, Radio } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/store';
import { api, DashboardStats, RevenuePoint, TopProduct, RecentSale } from '@/lib/api';

export function Dashboard() {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [alerts, setAlerts] = useState({ lowStock: 0, expiring: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.dashboard.stats(),
      api.dashboard.revenue(),
      api.dashboard.topProducts(),
      api.dashboard.recentSales(),
      api.dashboard.alerts(),
    ]).then(([s, r, t, rs, a]) => {
      setStats(s);
      setRevenue(r.data);
      setTopProducts(t.data);
      setRecentSales(rs.data);
      setAlerts(a);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const kpis = stats ? [
    { title: "Today's Sales", value: fmt(stats.dailySales), icon: DollarSign, color: 'text-blue-500 bg-blue-500/10', live: true },
    { title: 'Monthly Revenue', value: fmt(stats.monthlyRevenue), icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10' },
    { title: 'Total Products', value: String(stats.totalProducts), icon: Package, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Profit', value: fmt(stats.profit), icon: DollarSign, color: 'text-rose-500 bg-rose-500/10' },
  ] : [];

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Welcome back. Here's what's happening today.</p>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 self-start">
          <Radio size={12} /> Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((stat, i) => (
          <motion.div key={stat.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border border-slate-100 dark:border-slate-800 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${stat.color}`}><stat.icon size={18} /></div>
                  {stat.live && <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">Live</Badge>}
                </div>
                <p className="text-xs text-slate-500 font-medium">{stat.title}</p>
                <p className="text-2xl font-bold mt-0.5">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border border-slate-100 dark:border-slate-800 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue (last 14 days)</CardTitle>
            <CardDescription>Daily revenue trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-slate-800 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Selling</CardTitle>
            <CardDescription>Best performing products</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No sales data yet</p>
            ) : topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.units} units sold</p>
                </div>
                <Badge className="bg-blue-600 text-white text-[10px] h-5">#{i + 1}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border border-slate-100 dark:border-slate-800 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <CardDescription>Latest sales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <ShoppingCart size={16} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{sale.invoiceNo}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(sale.createdAt).toLocaleString()} · {sale.paymentMethod}
                    </p>
                  </div>
                </div>
                <p className="font-bold text-sm">{fmt(sale.total)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-slate-100 dark:border-slate-800 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
              <p className="text-sm font-semibold text-amber-600">Low Stock</p>
              <p className="text-xs text-slate-500 mt-1">{alerts.lowStock} items below threshold</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
              <p className="text-sm font-semibold text-rose-500 flex items-center gap-1"><Clock size={14} /> Expiring Soon</p>
              <p className="text-xs text-slate-500 mt-1">{alerts.expiring} items expiring in 30 days</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

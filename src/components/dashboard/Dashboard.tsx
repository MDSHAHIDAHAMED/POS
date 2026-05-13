import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Users, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/store';

const salesData = [
  { name: 'Mon', sales: 4000, revenue: 2400 },
  { name: 'Tue', sales: 3000, revenue: 1398 },
  { name: 'Wed', sales: 2000, revenue: 9800 },
  { name: 'Thu', sales: 2780, revenue: 3908 },
  { name: 'Fri', sales: 1890, revenue: 4800 },
  { name: 'Sat', sales: 2390, revenue: 3800 },
  { name: 'Sun', sales: 3490, revenue: 4300 },
];

const categoryData = [
  { name: 'Electronics', value: 400, color: '#3b82f6' },
  { name: 'Grocery', value: 300, color: '#10b981' },
  { name: 'Fashion', value: 200, color: '#f59e0b' },
  { name: 'Beauty', value: 278, color: '#ef4444' },
];

const recentInvoices = [
  { id: 'INV-001', customer: 'John Doe', amount: 125.50, status: 'paid', date: '2 mins ago' },
  { id: 'INV-002', customer: 'Sarah Smith', amount: 450.00, status: 'pending', date: '15 mins ago' },
  { id: 'INV-003', customer: 'Mike Johnson', amount: 89.99, status: 'paid', date: '45 mins ago' },
  { id: 'INV-004', customer: 'Alex Brown', amount: 1024.00, status: 'failed', date: '1 hour ago' },
];

const lowStockItems = [
  { name: 'Milk Powder 1kg', stock: 5, min: 10 },
  { name: 'Organic Honey', stock: 2, min: 5 },
  { name: 'Toilet Paper 12pk', stock: 12, min: 20 },
];

export function Dashboard() {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back. Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 gap-1">
            <Clock size={14} /> Real-time tracking active
          </Badge>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Daily Sales', value: '$12,450', icon: DollarSign, trend: '+12.5%', trendType: 'up', color: 'blue' },
          { title: 'New Orders', value: '1,280', icon: ShoppingCart, trend: '+5.2%', trendType: 'up', color: 'emerald' },
          { title: 'Inventory Value', value: '$84,300', icon: Package, trend: '-2.4%', trendType: 'down', color: 'amber' },
          { title: 'Total Customers', value: '4,520', icon: Users, trend: '+18.1%', trendType: 'up', color: 'violet' },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="relative overflow-hidden border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl group hover:scale-[1.02] transition-transform">
              <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                <stat.icon size={80} />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                    <stat.icon size={20} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${stat.trendType === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stat.trendType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {stat.trend}
                  </div>
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.title}</h3>
                <p className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>Track your sales performance over the week.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0f172a' : '#fff', 
                      borderColor: isDark ? '#1e293b' : '#f1f5f9',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Sales distribution by department.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                  />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest customer activities.</CardDescription>
            </div>
            <button className="text-blue-600 text-sm font-medium hover:underline">View All</button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <ShoppingCart size={18} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{inv.customer}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{inv.id} • {inv.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">${inv.amount.toFixed(2)}</p>
                    <Badge variant={inv.status === 'paid' ? 'default' : inv.status === 'pending' ? 'secondary' : 'destructive'} className="text-[10px] py-0 h-5">
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Items that need replenishment soon.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {lowStockItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                      <Package size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Current Stock: {item.stock}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-amber-600">Min level: {item.min}</p>
                    <button className="text-xs text-blue-600 font-bold mt-1">Reorder</button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

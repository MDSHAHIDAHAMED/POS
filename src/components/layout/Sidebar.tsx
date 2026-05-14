import { motion } from 'motion/react';
import { useUIStore } from '@/store';
import {
  LayoutDashboard, ShoppingCart, Package, Layers, Users, Truck,
  Receipt, BarChart3, Store, HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AppView =
  | 'dashboard' | 'pos' | 'products' | 'inventory'
  | 'customers' | 'suppliers' | 'sales' | 'reports'
  | 'profile' | 'settings';

interface SidebarProps {
  currentView: string;
  setView: (view: AppView) => void;
}

const menuItems: { id: AppView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'pos', label: 'POS Terminal', icon: ShoppingCart },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'inventory', label: 'Inventory', icon: Layers },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'suppliers', label: 'Suppliers', icon: Truck },
  { id: 'sales', label: 'Sales', icon: Receipt },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export function Sidebar({ currentView, setView }: SidebarProps) {
  const { sidebarOpen, theme } = useUIStore();

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarOpen ? 260 : 72 }}
      className={cn(
        'relative flex flex-col h-full border-r shrink-0',
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      )}
    >
      <div className="flex items-center gap-3 h-16 px-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
          <Store size={18} className="text-white" />
        </div>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="font-bold text-base leading-tight">SuperShop</p>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">POS · ERP</p>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium',
              currentView === item.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <item.icon size={20} className="shrink-0" strokeWidth={1.75} />
            {sidebarOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {sidebarOpen && (
        <div className="p-3 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
          <div className="flex items-start gap-2">
            <HelpCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold">Need Help?</p>
              <p className="text-[10px] text-slate-400 mt-0.5">24/7 support available</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

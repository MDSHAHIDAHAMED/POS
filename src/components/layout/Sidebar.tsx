import { motion } from 'motion/react';
import { useUIStore } from '@/store';
import { LayoutDashboard, ShoppingCart, Package, Warehouse, Users, CreditCard, ChevronLeft, ChevronRight, Settings, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  currentView: string;
  setView: (view: any) => void;
}

export function Sidebar({ currentView, setView }: SidebarProps) {
  const { sidebarOpen, toggleSidebar, theme } = useUIStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Warehouse },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'finance', label: 'Finance', icon: CreditCard },
  ];

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarOpen ? 280 : 80 }}
      className={cn(
        "relative flex flex-col h-full border-r transition-colors duration-300",
        theme === 'dark' ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-xl"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-slate-800">
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <span className="font-bold text-xl tracking-tight">NovaPOS</span>
          </motion.div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
              currentView === item.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <item.icon size={22} className={cn(currentView === item.id ? "text-white" : "group-hover:scale-110 transition-transform")} />
            {sidebarOpen && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <Settings size={22} />
          {sidebarOpen && <span className="font-medium">Settings</span>}
        </button>
      </div>
    </motion.div>
  );
}

/**
 * @license SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState } from 'react';
import { useAuthStore, useUIStore } from './store';
import { Sidebar, AppView } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { LoginPage } from '@/components/auth/LoginPage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { POS } from '@/components/pos/POS';
import { ProductList } from '@/components/products/ProductList';
import { InventoryView } from '@/components/inventory/InventoryView';
import { CustomersView } from '@/components/customers/CustomersView';
import { SuppliersView } from '@/components/suppliers/SuppliersView';
import { SalesView } from '@/components/sales/SalesView';
import { ReportsView } from '@/components/reports/ReportsView';
import { ProfileView } from '@/components/profile/ProfileView';
import { SettingsView } from '@/components/settings/SettingsView';
import { Toaster } from '@/components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, loading, restoreSession } = useAuthStore();
  const { theme } = useUIStore();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'pos': return <POS />;
      case 'products': return <ProductList />;
      case 'inventory': return <InventoryView />;
      case 'customers': return <CustomersView />;
      case 'suppliers': return <SuppliersView />;
      case 'sales': return <SalesView />;
      case 'reports': return <ReportsView />;
      case 'profile': return <ProfileView />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginPage />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-950'}`}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar currentView={currentView} setView={setCurrentView} />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Header onNavigate={setCurrentView} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}

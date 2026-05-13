/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { useAuthStore, useUIStore } from './store';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { POS } from '@/components/pos/POS';
import { ProductList } from '@/components/products/ProductList';
import { InventoryView } from '@/components/inventory/InventoryView';
import { Toaster } from '@/components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, ShoppingCart, Package, Warehouse, Users, CreditCard, Settings, LogOut } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function App() {
  const { user, setUser, setLoading } = useAuthStore();
  const { theme, sidebarOpen } = useUIStore();
  const [currentView, setCurrentView] = useState<'dashboard' | 'pos' | 'products' | 'inventory'>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as any);
        } else {
          // Mock user for demo if doc doesn't exist yet
          setUser({
            uid: fbUser.uid,
            email: fbUser.email!,
            displayName: fbUser.displayName || 'Demo User',
            role: 'super_admin',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'pos': return <POS />;
      case 'products': return <ProductList />;
      case 'inventory': return <InventoryView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-950'}`}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar currentView={currentView} setView={setCurrentView} />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}


import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote, Smartphone, Receipt, X, Tag, Calculator, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useCartStore, useUIStore } from '@/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const categories = ['All', 'Grocery', 'Electronics', 'Fashion', 'Beverages', 'Personal Care'];

const mockProducts = [
  { id: '1', name: 'Fresh Milk 1L', salePrice: 2.50, category: 'Grocery', stockLevel: 45, imageUrl: 'https://images.unsplash.com/photo-1550583724-125581f77833?w=200&h=200&auto=format&fit=crop' },
  { id: '2', name: 'Premium Coffee 500g', salePrice: 12.00, category: 'Grocery', stockLevel: 24, imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&h=200&auto=format&fit=crop' },
  { id: '3', name: 'Snack Pack', salePrice: 3.45, category: 'Grocery', stockLevel: 100, imageUrl: 'https://images.unsplash.com/photo-1599490659223-937244cc8a64?w=200&h=200&auto=format&fit=crop' },
  { id: '4', name: 'Water 500ml', salePrice: 0.99, category: 'Beverages', stockLevel: 200, imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=200&h=200&auto=format&fit=crop' },
  { id: '5', name: 'Orange Juice', salePrice: 4.25, category: 'Beverages', stockLevel: 30, imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200&h=200&auto=format&fit=crop' },
  { id: '6', name: 'Laundry Detergent', salePrice: 15.99, category: 'Personal Care', stockLevel: 12, imageUrl: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=200&h=200&auto=format&fit=crop' },
];

export function POS() {
  const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCartStore();
  const { theme } = useUIStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [receivedAmount, setReceivedAmount] = useState<string>('');

  const filteredProducts = mockProducts.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setIsCheckoutOpen(true);
  };

  const processPayment = async () => {
    const change = Number(receivedAmount) - (total * 1.15); // Including tax for demo
    if (paymentMethod === 'cash' && change < 0) {
      toast.error('Insufficient amount received');
      return;
    }

    toast.success('Transaction Completed!');
    clearCart();
    setIsCheckoutOpen(false);
    setReceivedAmount('');
    
    // Simulate API call for printing
    await fetch('/api/print-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, total, date: new Date() })
    });
  };

  const subtotal = total;
  const tax = subtotal * 0.15;
  const grandTotal = subtotal + tax;

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col min-w-0 border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products or scan barcode..."
              className="pl-10 bg-white dark:bg-slate-800 rounded-xl"
            />
          </div>
          <ScrollArea className="w-full md:w-auto" orientation="horizontal">
            <div className="flex gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? 'default' : 'outline'}
                  onClick={() => setActiveCategory(cat)}
                  className="rounded-full whitespace-nowrap"
                  size="sm"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pr-4">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5 }}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => addItem(product as any)}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                    ${product.salePrice.toFixed(2)}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{product.category}</span>
                    <span className={cn("text-[10px] font-bold", product.stockLevel < 20 ? "text-amber-500" : "text-emerald-500")}>
                      {product.stockLevel} units
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Plus className="text-blue-600" size={32} />
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Cart Area */}
      <div className="w-full lg:w-[400px] flex flex-col border-none shadow-2xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-blue-600" />
            <h2 className="font-bold text-lg">Current Sale</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={clearCart} className="text-slate-400 hover:text-red-500">
            <Trash2 size={18} />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <AnimatePresence initial={false}>
              {items.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-slate-400">
                  <ShoppingCart size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium">Your cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.product.imageUrl} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold truncate leading-tight">{item.name}</h4>
                      <p className="text-xs text-blue-600 font-bold mt-1">${item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 rounded-md bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600 hover:bg-slate-100"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 shadow-sm"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">${item.subtotal.toFixed(2)}</p>
                      <button onClick={() => removeItem(item.productId)} className="text-slate-400 hover:text-red-500 mt-2">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">VAT (15%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-base font-bold">Total Amount</span>
              <span className="text-2xl font-black text-blue-600 tracking-tight">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 gap-2 font-bold bg-white dark:bg-slate-800">
              <Calculator size={18} /> Hold
            </Button>
            <Button onClick={handleCheckout} className="h-12 gap-2 font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20">
               Pay Now <CreditCard size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800"
          >
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black">Complete Checkout</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsCheckoutOpen(false)} className="rounded-full">
                  <X size={24} />
                </Button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Payable</p>
                <p className="text-5xl font-black text-blue-600 tracking-tighter">${grandTotal.toFixed(2)}</p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-500 uppercase">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'cash' as const, label: 'Cash', icon: Banknote },
                    { id: 'card' as const, label: 'Card', icon: CreditCard },
                    { id: 'mobile' as const, label: 'Mobile', icon: Smartphone },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all",
                        paymentMethod === method.id
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30"
                          : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-200"
                      )}
                    >
                      <method.icon size={24} />
                      <span className="text-xs font-bold uppercase tracking-wide">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'cash' && (
                <div className="space-y-3">
                  <label className="text-sm font-bold text-slate-500 uppercase">Received Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                    <Input
                      type="number"
                      value={receivedAmount}
                      onChange={(e) => setReceivedAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-12 h-16 text-2xl font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-2xl"
                    />
                  </div>
                  {receivedAmount && Number(receivedAmount) > grandTotal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-center p-4 bg-emerald-500/10 text-emerald-500 rounded-xl">
                      <span className="text-sm font-bold">Change Amount</span>
                      <span className="text-lg font-black">${(Number(receivedAmount) - grandTotal).toFixed(2)}</span>
                    </motion.div>
                  )}
                </div>
              )}

              <Button 
                onClick={processPayment} 
                className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-lg font-black shadow-2xl shadow-blue-600/30 gap-2"
              >
                Finalize Sale <Receipt size={24} />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

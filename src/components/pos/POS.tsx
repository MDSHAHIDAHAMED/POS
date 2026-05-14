import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, ShoppingCart, Trash2, Plus, Minus,
  CreditCard, Banknote, Smartphone, Receipt, X,
  ScanBarcode, RotateCcw, Check, PackageOpen,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCartStore } from '@/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api, ProductRecord, CategoryRecord, CustomerRecord, mapProduct } from '@/lib/api';
import type { Product } from '@/types';

export function POS() {
  const { items, addItem, removeItem, updateQuantity, clearCart, total } = useCartStore();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [discount, setDiscount] = useState('0');
  const [heldCount, setHeldCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [receivedAmount, setReceivedAmount] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c, cust] = await Promise.all([
        api.products.list(),
        api.categories(),
        api.customers.list(),
      ]);
      setProducts(p.data);
      setCategories(c.data);
      setCustomers(cust.data);
      if (cust.data[0]) setCustomerId((prev) => prev || cust.data[0].id);
    } catch {
      toast.error('Failed to load POS data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const filtered = products.filter((p) => {
    const catMatch = activeCategory === 'all' || p.category.id === activeCategory;
    const q = searchQuery.toLowerCase();
    const searchMatch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.barcode || '').includes(q);
    return catMatch && searchMatch;
  });

  const handleAdd = (p: ProductRecord) => {
    if (p.stock <= 0) {
      toast.error('Out of stock');
      return;
    }
    addItem(mapProduct(p) as unknown as Product);
  };

  const discountAmount = Math.min(Number(discount) || 0, total);
  const subtotal = total;
  const tax = (subtotal - discountAmount) * 0.05;
  const grandTotal = Math.max(0, subtotal - discountAmount + tax);

  const processPayment = async () => {
    if (paymentMethod === 'cash' && Number(receivedAmount) < grandTotal) {
      toast.error('Insufficient amount received');
      return;
    }
    try {
      const methodMap = { cash: 'CASH', card: 'CARD', mobile: 'MOBILE_BANKING' } as const;
      const result = await api.sales.checkout({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          subtotal: i.subtotal,
        })),
        total: subtotal - discountAmount,
        paymentMethod: methodMap[paymentMethod],
        customerId: customerId || undefined,
        discount: discountAmount,
      });
      await api.printReceipt({ invoiceNo: (result.data as { invoiceNo?: string })?.invoiceNo, items, total: grandTotal });
      toast.success('Sale completed!');
      clearCart();
      setDiscount('0');
      setIsCheckoutOpen(false);
      setReceivedAmount('');
      load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Checkout failed');
    }
  };

  const handleHold = () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setHeldCount((n) => n + 1);
    clearCart();
    setDiscount('0');
    toast.success('Sale held');
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-0 -m-2 md:-m-0">
      {/* Categories column */}
      <div className="hidden md:flex flex-col w-[148px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pr-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 pt-1 pb-3">Categories</p>
        <ScrollArea className="flex-1">
          <div className="space-y-1 pr-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all',
                activeCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              All Products
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  activeCategory === c.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Product area */}
      <div className="flex-1 flex flex-col min-w-0 px-3 md:px-4">
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or scan barcode..."
              className="pl-9 pr-10 h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <ScanBarcode className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
          <Button
            variant="outline"
            className="h-10 gap-1.5 rounded-lg border-slate-200 shrink-0 text-sm font-medium"
            onClick={handleHold}
          >
            <RotateCcw size={15} />
            Hold ({heldCount})
          </Button>
        </div>

        {/* Mobile category select */}
        <div className="md:hidden mb-3">
          <Select value={activeCategory} onValueChange={setActiveCategory}>
            <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Product grid */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Loading products...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <PackageOpen size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-4">
              {filtered.map((product) => (
                <motion.button
                  key={product.id}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAdd(product)}
                  disabled={product.stock <= 0}
                  className={cn(
                    'text-left bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-shadow hover:shadow-md',
                    product.stock <= 0 && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="aspect-square relative bg-slate-50 dark:bg-slate-800">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <PackageOpen size={32} />
                      </div>
                    )}
                    <span className="absolute top-2 right-2 bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow">
                      ${Number(product.salePrice).toFixed(2)}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <p className="text-[10px] text-slate-400 font-mono">{product.sku}</p>
                    <p className="text-sm font-semibold truncate leading-tight mt-0.5">{product.name}</p>
                    <p className={cn(
                      'text-[10px] font-semibold mt-1',
                      product.stock <= 0 ? 'text-red-500' : product.lowStock ? 'text-amber-500' : 'text-emerald-600'
                    )}>
                      {product.stock} pcs
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Cart panel */}
      <div className="w-full md:w-[320px] lg:w-[340px] flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shrink-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={17} className="text-blue-600" />
            <span className="font-bold text-sm">Current Sale</span>
          </div>
          <button
            onClick={clearCart}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>

        {/* Customer */}
        <div className="px-4 pt-3 space-y-2">
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger className="rounded-lg h-9 text-sm border-slate-200">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCustomer && (
            <div className="flex items-center gap-1.5 bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full w-fit">
              <Check size={13} strokeWidth={3} />
              {selectedCustomer.name}
            </div>
          )}
        </div>

        {/* Cart items */}
        <ScrollArea className="flex-1 px-4 py-3">
          {items.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-20">Cart is empty</p>
          ) : (
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-2.5 mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700"
                >
                  {item.product.imageUrl && (
                    <img src={item.product.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-xs text-blue-600 font-bold">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm">${item.subtotal.toFixed(2)}</p>
                    <button type="button" onClick={() => removeItem(item.productId)} className="text-slate-400 hover:text-red-500 mt-1">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </ScrollArea>

        {/* Totals */}
        <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-slate-50/80 dark:bg-slate-800/40">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Tax (5%)</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500">Discount</span>
            <Input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-20 h-8 text-right text-sm rounded-md ml-auto"
            />
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="font-bold">Total</span>
            <span className="text-2xl font-black text-blue-600">${grandTotal.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="outline"
              className="h-10 rounded-lg border-slate-200 font-semibold text-sm"
              onClick={handleHold}
            >
              Hold
            </Button>
            <Button
              className="h-10 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-900 font-semibold text-sm gap-1"
              onClick={() => items.length ? setIsCheckoutOpen(true) : toast.error('Cart is empty')}
            >
              Checkout <CreditCard size={15} />
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold">Complete Checkout</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsCheckoutOpen(false)}><X /></Button>
            </div>
            <p className="text-center text-4xl font-black text-blue-600 mb-5">${grandTotal.toFixed(2)}</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {([['cash', Banknote], ['card', CreditCard], ['mobile', Smartphone]] as const).map(([id, Icon]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                    paymentMethod === id
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-200'
                  )}
                >
                  <Icon size={22} />
                  <span className="text-[10px] font-bold uppercase">{id}</span>
                </button>
              ))}
            </div>
            {paymentMethod === 'cash' && (
              <Input
                type="number"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                placeholder="Amount received"
                className="h-12 text-lg font-bold mb-4"
              />
            )}
            <Button onClick={processPayment} className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold gap-2">
              Finalize Sale <Receipt size={18} />
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

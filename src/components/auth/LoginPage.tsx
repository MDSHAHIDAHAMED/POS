import { useState } from 'react';
import { motion } from 'motion/react';
import { Store, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store';
import { toast } from 'sonner';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@shop.com', password: 'admin123' },
  { label: 'Manager', email: 'manager@shop.com', password: 'manager123' },
  { label: 'Cashier', email: 'cashier@shop.com', password: 'cashier123' },
];

export function LoginPage() {
  const { login } = useAuthStore();
  const [email, setEmail] = useState('admin@shop.com');
  const [password, setPassword] = useState('admin123');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <motion.div
      className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(15,23,42,0.82), rgba(15,23,42,0.88)), url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-black/30 p-8 border border-white/10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-4">
            <Store size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">SuperShop POS</h1>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
            Enterprise Retail ERP
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="text-slate-500 text-sm mt-1">Sign in to manage your retail operations</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200"
                placeholder="admin@shop.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg shadow-blue-500/25 mt-2"
          >
            {submitting ? <><Loader2 size={18} className="animate-spin mr-2" /> Signing in...</> : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] text-slate-400 text-center mb-3">Demo credentials</p>
          <div className="space-y-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc.email, acc.password)}
                className="w-full text-left text-xs text-slate-500 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <span className="font-semibold">{acc.label}:</span>{' '}
                <span className="font-mono">{acc.email}</span> / {acc.password}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

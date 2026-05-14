import { useUIStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sun, Moon, Bell, Store, Globe, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function SettingsView() {
  const { theme, toggleTheme } = useUIStore();

  const handleSave = () => {
    toast.success('Settings saved');
  };

  return (
    <div className="space-y-6 pb-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your store preferences and application options.</p>
      </div>

      <Card className="border border-slate-100 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {theme === 'light' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-blue-400" />}
            Appearance
          </CardTitle>
          <CardDescription>Customize how SuperShop looks on your device</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div>
              <p className="text-sm font-semibold">Theme</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {theme === 'light' ? 'Light mode' : 'Dark mode'} is active
              </p>
            </div>
            <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => theme !== 'light' && toggleTheme()}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  theme === 'light' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'
                )}
              >
                <Sun size={14} /> Light
              </button>
              <button
                type="button"
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  theme === 'dark' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-400' : 'text-slate-500'
                )}
              >
                <Moon size={14} /> Dark
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-100 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Store size={18} className="text-blue-600" /> Store Information
          </CardTitle>
          <CardDescription>Basic details shown on receipts and reports</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Store Name</Label><Input defaultValue="SuperShop" className="mt-1.5 rounded-lg" /></div>
            <div><Label>Phone</Label><Input defaultValue="+1 555-0100" className="mt-1.5 rounded-lg" /></div>
          </div>
          <div><Label>Address</Label><Input defaultValue="123 Retail Street, City" className="mt-1.5 rounded-lg" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><Label>Currency</Label><Input defaultValue="USD ($)" className="mt-1.5 rounded-lg" /></div>
            <div><Label>Tax Rate (%)</Label><Input defaultValue="5" type="number" className="mt-1.5 rounded-lg" /></div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-100 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell size={18} className="text-emerald-500" /> Notifications
          </CardTitle>
          <CardDescription>Alert preferences for your store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Low stock alerts', desc: 'Notify when items fall below threshold', default: true },
            { label: 'Daily sales summary', desc: 'Receive end-of-day report', default: true },
            { label: 'New order notifications', desc: 'Alert on new POS transactions', default: false },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <input type="checkbox" defaultChecked={item.default} className="w-4 h-4 accent-blue-600" />
            </label>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-slate-100 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Printer size={18} /> Hardware & Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3">
          {['Thermal Printer', 'Barcode Scanner', 'Cash Drawer'].map((device) => (
            <div key={device} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-medium">{device}</span>
              <Badge className="bg-slate-100 text-slate-500 dark:bg-slate-800">Not connected</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="gap-2"><Globe size={16} /> Reset</Button>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}

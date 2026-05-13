import { motion } from 'motion/react';
import { Warehouse, ArrowLeftRight, History, AlertTriangle, PackageSearch, Filter, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const stockMovements = [
  { id: 'MOV-001', type: 'IN', item: 'Fresh Milk 1L', quantity: 100, warehouse: 'Main Warehouse', date: '2026-05-13 10:20 AM' },
  { id: 'MOV-002', type: 'OUT', item: 'Water 500ml', quantity: 24, warehouse: 'Shop Shelf A1', date: '2026-05-13 11:45 AM' },
  { id: 'MOV-003', type: 'ADJ', item: 'Premium Coffee', quantity: -2, warehouse: 'Main Warehouse', date: '2026-05-13 12:10 PM', reason: 'Damaged' },
];

export function InventoryView() {
  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Track stock levels across multiple locations and manage movements.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 rounded-xl">
             Adjustment <PackageSearch size={16} />
          </Button>
          <Button className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700">
             Transfer Stock <ArrowLeftRight size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl bg-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/20 rounded-xl">
                <Warehouse size={20} />
              </div>
              <Badge variant="outline" className="text-white border-white/30 text-[10px]">Active</Badge>
            </div>
            <p className="text-blue-100 text-sm font-medium">Main Warehouse</p>
            <p className="text-3xl font-black mt-1">12,450 <span className="text-sm font-normal opacity-70 italic font-mono">units</span></p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <AlertTriangle size={20} />
              </div>
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px]">Alert</Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Low Stock Items</p>
            <p className="text-3xl font-black mt-1">18 <span className="text-sm font-normal text-slate-400 italic">skus</span></p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                <AlertTriangle size={20} />
              </div>
              <Badge variant="outline" className="text-rose-500 border-rose-500/30 text-[10px]">Critical</Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Expired Soon</p>
            <p className="text-3xl font-black mt-1">5 <span className="text-sm font-normal text-slate-400 italic">batches</span></p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="movements" className="w-full">
        <TabsList className="bg-white dark:bg-slate-900 p-1 border border-slate-100 dark:border-slate-800 h-12 rounded-2xl">
          <TabsTrigger value="movements" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Movements</TabsTrigger>
          <TabsTrigger value="stock" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Stock Adjustment</TabsTrigger>
          <TabsTrigger value="warehouses" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">Warehouses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="movements" className="mt-6">
          <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent History</CardTitle>
                <CardDescription>Visual log of all stock movements.</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="gap-2 rounded-lg">
                <Filter size={14} /> Filter
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockMovements.map((move) => (
                  <div key={move.id} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-xl",
                        move.type === 'IN' ? "bg-emerald-500/10 text-emerald-500" : 
                        move.type === 'OUT' ? "bg-rose-500/10 text-rose-500" : 
                        "bg-blue-500/10 text-blue-500"
                      )}>
                        {move.type === 'IN' ? <Plus size={20} /> : 
                         move.type === 'OUT' ? <History size={20} /> : 
                         <ArrowLeftRight size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold">{move.item}</p>
                          <Badge variant="outline" className="text-[10px] py-0">{move.id}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{move.warehouse} • {move.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-lg font-black tracking-tighter",
                        move.type === 'IN' ? "text-emerald-500" : 
                        move.type === 'OUT' ? "text-rose-500" : 
                        "text-blue-500"
                      )}>
                        {move.quantity > 0 ? `+${move.quantity}` : move.quantity}
                      </p>
                      {move.reason && <p className="text-[10px] text-slate-400 italic">Reason: {move.reason}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

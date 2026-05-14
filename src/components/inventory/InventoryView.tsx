import { useState, useEffect, useCallback } from 'react';
import { Package, AlertTriangle, Clock, Download, Upload, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api, InventorySummary, LowStockItem, ProductRecord } from '@/lib/api';
import { StockMovementDialog } from './StockMovementDialog';
import { cn } from '@/lib/utils';

export function InventoryView() {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [movementType, setMovementType] = useState<'IN' | 'OUT' | 'ADJUST' | null>(null);

  const load = useCallback(async () => {
    const [s, ls, p] = await Promise.all([
      api.inventory.summary(),
      api.inventory.lowStock(),
      api.products.list(),
    ]);
    setSummary(s);
    setLowStock(ls.data);
    setProducts(p.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-slate-500 text-sm">Stock movements, low stock and expiry alerts.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2" onClick={() => setMovementType('IN')}>
            <Download size={16} /> Stock In
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setMovementType('OUT')}>
            <Upload size={16} /> Stock Out
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setMovementType('ADJUST')}>
            <RefreshCw size={16} /> Adjust
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total SKUs', value: summary?.totalSkus ?? '—', icon: Package, color: 'text-blue-500 bg-blue-500/10' },
          { label: 'Low Stock', value: summary?.lowStock ?? '—', icon: AlertTriangle, color: 'text-amber-500 bg-amber-500/10' },
          { label: 'Expiring Soon', value: summary?.expiring ?? '—', icon: Clock, color: 'text-rose-500 bg-rose-500/10' },
        ].map((card) => (
          <Card key={card.label} className="border border-slate-100 dark:border-slate-800 shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={cn('p-3 rounded-xl', card.color)}><card.icon size={20} /></div>
              <div>
                <p className="text-xs text-slate-500">{card.label}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="low-stock">
        <TabsList className="bg-white dark:bg-slate-900 border p-1 rounded-xl h-11">
          <TabsTrigger value="low-stock" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">Low Stock</TabsTrigger>
          <TabsTrigger value="expiring" className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white">Expiring</TabsTrigger>
        </TabsList>

        <TabsContent value="low-stock" className="mt-4">
          <Card className="border border-slate-100 dark:border-slate-800 shadow-sm">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-center">Threshold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-8">No low stock items</TableCell></TableRow>
                  ) : lowStock.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                      <TableCell className="text-center"><Badge className="bg-amber-500">{item.stock}</Badge></TableCell>
                      <TableCell className="text-center text-slate-500">{item.threshold}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="mt-4">
          <Card className="border border-slate-100 dark:border-slate-800 shadow-sm">
            <CardContent className="p-8 text-center text-slate-400">
              {summary?.expiring === 0 ? 'No items expiring in the next 30 days' : `${summary?.expiring} batches expiring soon`}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {movementType && (
        <StockMovementDialog
          open={!!movementType}
          onClose={() => setMovementType(null)}
          onSaved={load}
          type={movementType}
          products={products}
        />
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Receipt, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api, RecentSale } from '@/lib/api';
import { cn } from '@/lib/utils';

const statusStyle: Record<string, string> = {
  COMPLETED: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  HELD: 'bg-amber-500/10 text-amber-600 border-amber-200',
  RETURNED: 'bg-rose-500/10 text-rose-600 border-rose-200',
  SUSPENDED: 'bg-slate-500/10 text-slate-600 border-slate-200',
};

export function SalesView() {
  const [sales, setSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.sales.list()
      .then((r) => setSales(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Sales History</h1>
        <p className="text-slate-500 text-sm">All transactions, invoices and refunds.</p>
      </div>

      <Card className="border border-slate-100 dark:border-slate-800 shadow-sm bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <CardContent className="p-0">
          {loading ? (
            <p className="text-center text-slate-400 py-12">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Cashier</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-mono text-sm font-medium">{sale.invoiceNo}</TableCell>
                    <TableCell className="text-slate-500 text-sm">{new Date(sale.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">
                      {sale.cashier ? `${sale.cashier.firstName} ${sale.cashier.lastName || ''}`.trim() : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{sale.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-xs capitalize', statusStyle[sale.status] || '')}>
                        {sale.status.toLowerCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">${sale.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon"><Eye size={15} /></Button>
                      <Button variant="ghost" size="icon"><Receipt size={15} /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

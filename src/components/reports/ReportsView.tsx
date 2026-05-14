import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, SalesReport } from '@/lib/api';
import { toast } from 'sonner';

export function ReportsView() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState<SalesReport | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const data = await api.reports.sales(startDate || undefined, endDate || undefined);
      setReport(data);
    } catch {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-slate-500 text-sm">Generate sales reports across date ranges.</p>
      </div>

      <Card className="border border-slate-100 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4 flex flex-wrap items-end gap-4">
          <div>
            <Label className="text-xs">Start Date</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-44 mt-1" />
          </div>
          <div>
            <Label className="text-xs">End Date</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-44 mt-1" />
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={generate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border border-slate-100 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500 font-medium">TOTAL SALES</CardTitle></CardHeader>
              <CardContent><p className="text-4xl font-bold">{report.totalSales}</p></CardContent>
            </Card>
            <Card className="border border-slate-100 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500 font-medium">TOTAL REVENUE</CardTitle></CardHeader>
              <CardContent><p className="text-4xl font-bold text-blue-600">${report.totalRevenue.toFixed(2)}</p></CardContent>
            </Card>
          </div>

          <Card className="border border-slate-100 dark:border-slate-800 shadow-sm">
            <CardHeader><CardTitle className="text-base">Revenue by Day</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

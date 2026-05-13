import { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Download, Upload, Barcode, Eye, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const mockProducts = [
  { id: '1', name: 'Fresh Milk 1L', sku: 'GR-MIL-001', barcode: '88012345678', salePrice: 2.50, purchasePrice: 1.80, stock: 45, category: 'Grocery', status: 'In Stock', image: 'https://images.unsplash.com/photo-1550583724-125581f77833?w=100&h=100&auto=format&fit=crop' },
  { id: '2', name: 'Premium Coffee 500g', sku: 'GR-COF-001', barcode: '88098765432', salePrice: 12.00, purchasePrice: 8.50, stock: 24, category: 'Grocery', status: 'In Stock', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100&h=100&auto=format&fit=crop' },
  { id: '3', name: 'Organic Honey', sku: 'GR-HON-001', barcode: '88011223344', salePrice: 8.50, purchasePrice: 5.00, stock: 2, category: 'Grocery', status: 'Low Stock', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&h=100&auto=format&fit=crop' },
  { id: '4', name: 'Water 500ml', sku: 'BV-WAT-001', barcode: '88055667788', salePrice: 0.99, purchasePrice: 0.40, stock: 200, category: 'Beverages', status: 'In Stock', image: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=100&h=100&auto=format&fit=crop' },
];

export function ProductList() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your storefront items, pricing, and details.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 rounded-xl">
            <Upload size={16} /> Import CSV
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl">
            <Download size={16} /> Export
          </Button>
          <Button className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
            <Plus size={18} /> Add New Product
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, SKU, or barcode..."
                className="pl-10 bg-white dark:bg-slate-800 rounded-xl"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-slate-400">
                <Filter size={20} />
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400">
                <ArrowUpDown size={20} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 dark:border-slate-800 hover:bg-transparent">
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead className="min-w-[200px]">Product Name</TableHead>
                  <TableHead>SKU / Barcode</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProducts.map((p) => (
                  <TableRow key={p.id} className="border-slate-100 dark:border-slate-800 group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={p.image} className="w-full h-full object-cover" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{p.name}</p>
                      <p className="text-xs text-slate-400 font-mono tracking-tighter">ID: {p.id}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block mb-1">{p.sku}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Barcode size={10} /> {p.barcode}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-none px-2">
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100">${p.salePrice.toFixed(2)}</p>
                      <p className="text-[10px] text-slate-400">Cost: ${p.purchasePrice.toFixed(2)}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-black text-sm">{p.stock}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "text-[10px] uppercase font-black px-2 h-5",
                        p.status === 'In Stock' ? "bg-emerald-500" : "bg-amber-500"
                      )}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700")}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                              <Eye size={16} /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                              <Edit size={16} /> Edit Product
                            </DropdownMenuItem>
                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                              <Barcode size={16} /> Print Label
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex items-center gap-2 text-red-500 focus:text-red-500 cursor-pointer">
                            <Trash2 size={16} /> Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, CategoryRecord, ProductRecord, ProductInput } from '@/lib/api';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  product?: ProductRecord | null;
  categories: CategoryRecord[];
}

const empty = {
  name: '', sku: '', barcode: '', categoryId: '', purchasePrice: 0, salePrice: 0, wholesalePrice: 0, taxRate: 5, imageUrl: '', stock: 0,
};

export function ProductFormDialog({ open, onClose, onSaved, product, categories }: Props) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode || '',
        categoryId: product.category.id,
        purchasePrice: Number(product.purchasePrice),
        salePrice: Number(product.salePrice),
        wholesalePrice: Number(product.wholesalePrice || 0),
        taxRate: Number(product.taxRate),
        imageUrl: product.imageUrl || '',
        stock: product.stock,
      });
    } else {
      setForm({ ...empty, categoryId: categories[0]?.id || '' });
    }
  }, [product, categories, open]);

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.sku || !form.categoryId) {
      toast.error('Name, SKU and category are required');
      return;
    }
    setSaving(true);
    try {
      const body: ProductInput = {
        name: form.name,
        sku: form.sku,
        barcode: form.barcode || undefined,
        categoryId: form.categoryId,
        purchasePrice: Number(form.purchasePrice),
        salePrice: Number(form.salePrice),
        wholesalePrice: Number(form.wholesalePrice) || undefined,
        taxRate: Number(form.taxRate),
        imageUrl: form.imageUrl || undefined,
        stock: Number(form.stock),
      };
      if (product) await api.products.update(product.id, body);
      else await api.products.create(body);
      toast.success(product ? 'Product updated' : 'Product created');
      onSaved();
      onClose();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>SKU</Label><Input value={form.sku} onChange={(e) => set('sku', e.target.value)} /></div>
            <div><Label>Barcode</Label><Input value={form.barcode} onChange={(e) => set('barcode', e.target.value)} /></div>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.categoryId} onValueChange={(v) => set('categoryId', v)}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Purchase Price</Label><Input type="number" value={form.purchasePrice} onChange={(e) => set('purchasePrice', Number(e.target.value))} /></div>
            <div><Label>Sale Price</Label><Input type="number" value={form.salePrice} onChange={(e) => set('salePrice', Number(e.target.value))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Wholesale Price</Label><Input type="number" value={form.wholesalePrice} onChange={(e) => set('wholesalePrice', Number(e.target.value))} /></div>
            <div><Label>Tax (%)</Label><Input type="number" value={form.taxRate} onChange={(e) => set('taxRate', Number(e.target.value))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => set('stock', Number(e.target.value))} /></div>
            <div><Label>Image URL</Label><Input value={form.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} /></div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? 'Saving...' : product ? 'Update' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

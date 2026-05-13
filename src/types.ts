export type Role = 'super_admin' | 'admin' | 'manager' | 'cashier' | 'accountant' | 'store_keeper';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  brandId: string;
  purchasePrice: number;
  salePrice: number;
  wholesalePrice: number;
  taxRate: number;
  discount: number;
  stockLevel: number;
  minStockLevel: number;
  expiryDate?: string;
  supplierId: string;
  imageUrl?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  customerId?: string;
  cashierId: string;
  items: SaleItem[];
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  payableAmount: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: 'cash' | 'card' | 'mobile_banking';
  status: 'completed' | 'on_hold' | 'suspended' | 'returned';
  createdAt: string;
}

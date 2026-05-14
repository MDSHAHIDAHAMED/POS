const BASE = '/api';
const TOKEN_KEY = 'supershop_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
  return data;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: import('../types').UserProfile }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<{ user: import('../types').UserProfile }>('/auth/me'),
    logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
  },
  dashboard: {
    stats: () => request<DashboardStats>('/dashboard/stats'),
    revenue: () => request<{ data: RevenuePoint[] }>('/dashboard/revenue'),
    topProducts: () => request<{ data: TopProduct[] }>('/dashboard/top-products'),
    recentSales: () => request<{ data: RecentSale[] }>('/dashboard/recent-sales'),
    alerts: () => request<DashboardAlerts>('/dashboard/alerts'),
  },
  categories: () => request<{ data: CategoryRecord[] }>('/categories'),
  products: {
    list: (params?: { search?: string; categoryId?: string }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.categoryId) q.set('categoryId', params.categoryId);
      const qs = q.toString();
      return request<{ data: ProductRecord[] }>(`/products${qs ? `?${qs}` : ''}`);
    },
    create: (body: ProductInput) => request<{ data: ProductRecord }>('/products', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<ProductInput>) => request<{ data: ProductRecord }>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),
  },
  inventory: {
    summary: () => request<InventorySummary>('/inventory/summary'),
    lowStock: () => request<{ data: LowStockItem[] }>('/inventory/low-stock'),
    movement: (body: StockMovementInput) => request<{ success: boolean }>('/inventory/movement', { method: 'POST', body: JSON.stringify(body) }),
  },
  sales: {
    checkout: (body: CheckoutInput) => request<{ data: unknown }>('/sales/checkout', { method: 'POST', body: JSON.stringify(body) }),
    list: () => request<{ data: RecentSale[] }>('/sales'),
  },
  customers: {
    list: () => request<{ data: CustomerRecord[] }>('/customers'),
    create: (body: CustomerInput) => request<{ data: CustomerRecord }>('/customers', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<CustomerInput>) => request<{ data: CustomerRecord }>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<{ success: boolean }>(`/customers/${id}`, { method: 'DELETE' }),
  },
  suppliers: {
    list: () => request<{ data: SupplierRecord[] }>('/suppliers'),
    create: (body: SupplierInput) => request<{ data: SupplierRecord }>('/suppliers', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<SupplierInput>) => request<{ data: SupplierRecord }>(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<{ success: boolean }>(`/suppliers/${id}`, { method: 'DELETE' }),
  },
  reports: {
    sales: (startDate?: string, endDate?: string) => {
      const q = new URLSearchParams();
      if (startDate) q.set('startDate', startDate);
      if (endDate) q.set('endDate', endDate);
      const qs = q.toString();
      return request<SalesReport>(`/reports/sales${qs ? `?${qs}` : ''}`);
    },
  },
  printReceipt: (body: unknown) => request<{ success: boolean }>('/print-receipt', { method: 'POST', body: JSON.stringify(body) }),
};

export interface DashboardStats {
  dailySales: number;
  monthlyRevenue: number;
  profit: number;
  totalProducts: number;
  lowStockCount: number;
  expiringCount: number;
}

export interface RevenuePoint { date: string; revenue: number }
export interface TopProduct { name: string; imageUrl: string | null; units: number }
export interface RecentSale {
  id: string;
  invoiceNo: string;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  cashier?: { firstName: string; lastName: string | null };
  customer?: { name: string } | null;
}
export interface DashboardAlerts { lowStock: number; expiring: number }

export interface CategoryRecord { id: string; name: string }
export interface ProductRecord {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  purchasePrice: number;
  salePrice: number;
  wholesalePrice: number | null;
  taxRate: number;
  discount: number;
  imageUrl: string | null;
  status: string;
  category: CategoryRecord;
  brand: { id: string; name: string } | null;
  stock: number;
  lowStock: boolean;
}

export interface ProductInput {
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  purchasePrice: number;
  salePrice: number;
  wholesalePrice?: number;
  taxRate?: number;
  imageUrl?: string;
  stock?: number;
}

export interface InventorySummary {
  totalSkus: number;
  lowStock: number;
  expiring: number;
  totalUnits: number;
}

export interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  threshold: number;
}

export interface StockMovementInput {
  productId: string;
  quantity: number;
  type: 'IN' | 'OUT' | 'ADJUST';
  note?: string;
}

export interface CheckoutInput {
  items: { productId: string; quantity: number; price: number; subtotal: number }[];
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE_BANKING';
  customerId?: string;
  discount?: number;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email?: string | null;
  phone: string | null;
  address?: string | null;
  loyaltyPoints: number;
  walletBalance: number;
}

export interface CustomerInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  loyaltyPoints?: number;
  walletBalance?: number;
}

export interface SupplierRecord {
  id: string;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  balanceDue: number;
}

export interface SupplierInput {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  contactName?: string;
}

export interface SalesReport {
  totalSales: number;
  totalRevenue: number;
  revenueByDay: { date: string; revenue: number }[];
}

export function mapProduct(p: ProductRecord) {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku,
    barcode: p.barcode || '',
    categoryId: p.category.id,
    categoryName: p.category.name,
    brandId: p.brand?.id || '',
    purchasePrice: Number(p.purchasePrice),
    salePrice: Number(p.salePrice),
    wholesalePrice: Number(p.wholesalePrice || 0),
    taxRate: Number(p.taxRate),
    discount: Number(p.discount),
    stockLevel: p.stock,
    minStockLevel: 15,
    imageUrl: p.imageUrl || undefined,
    status: p.stock === 0 ? 'out_of_stock' as const : p.lowStock ? 'low_stock' as const : 'in_stock' as const,
    createdAt: new Date().toISOString(),
  };
}

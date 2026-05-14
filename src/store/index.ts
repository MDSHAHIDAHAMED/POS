import { create } from 'zustand';
import { UserProfile, Product, SaleItem } from '../types';
import { api, setToken, getToken } from '../lib/api';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  login: async (email, password) => {
    const { token, user } = await api.auth.login(email, password);
    setToken(token);
    set({ user });
  },
  logout: async () => {
    try {
      if (getToken()) await api.auth.logout();
    } catch {
      // ignore
    }
    setToken(null);
    set({ user: null });
  },
  restoreSession: async () => {
    set({ loading: true });
    const token = getToken();
    if (!token) {
      set({ user: null, loading: false });
      return;
    }
    try {
      const { user } = await api.auth.me();
      set({ user, loading: false });
    } catch {
      setToken(null);
      set({ user: null, loading: false });
    }
  },
}));

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));

interface CartState {
  items: (SaleItem & { product: Product })[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotal: () => void;
  total: number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (product) => {
    const existingItem = get().items.find((item) => item.productId === product.id);
    if (existingItem) {
      get().updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      set((state) => ({
        items: [...state.items, {
          productId: product.id,
          name: product.name,
          price: product.salePrice,
          quantity: 1,
          subtotal: product.salePrice,
          product,
        }],
      }));
    }
    get().calculateTotal();
  },
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }));
    get().calculateTotal();
  },
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId
          ? { ...item, quantity, subtotal: item.price * quantity }
          : item
      ),
    }));
    get().calculateTotal();
  },
  clearCart: () => set({ items: [], total: 0 }),
  total: 0,
  calculateTotal: () => {
    const total = get().items.reduce((sum, item) => sum + item.subtotal, 0);
    set({ total });
  },
}));

// src/store/productsStore.ts
import { create } from 'zustand';
import { Product } from '../types';
import { products as initialProducts, varieties as initialVarieties } from '../data/products';

interface ProductsState {
  products: Product[];
  varieties: string[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
}

function safeArray<T>(val: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(val)) return val as T[];
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch {
      if (val.includes(',')) {
        return val.split(',').map((s) => s.trim()).filter(Boolean) as unknown as T[];
      }
      if (val.trim()) {
        return [val.trim()] as unknown as T[];
      }
    }
  }
  return fallback;
}

function normalizeProduct(p: Product): Product {
  return {
    ...p,
    badges: safeArray<string>(p.badges, ['Premium Quality']),
    prices: safeArray(p.prices, [{ weight: '26 kg', weightKg: 26, price: 1100, originalPrice: 1250 }]),
    images: safeArray<string>(p.images, [p.image || '/assets/rice-bowl.jpg']),
    bestFor: safeArray<string>(p.bestFor, ['Daily Cooking']),
  };
}

export const useProductsStore = create<ProductsState>((set) => ({
  products: initialProducts.map(normalizeProduct),
  varieties: initialVarieties,
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data: Product[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map(normalizeProduct);
        const uniqueVarieties = [...new Set(normalized.map((p) => p.variety))];
        set({
          products: normalized,
          varieties: uniqueVarieties,
          isLoading: false,
          error: null,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      set({ isLoading: false, error: message });
    }
  },
}));

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

export const useProductsStore = create<ProductsState>((set) => ({
  products: initialProducts,
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
        const uniqueVarieties = [...new Set(data.map((p) => p.variety))];
        set({
          products: data,
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

// src/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, PriceOption } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, selectedWeight: PriceOption, quantity?: number) => void;
  removeItem: (productId: string, weightLabel: string) => void;
  updateQuantity: (productId: string, weightLabel: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, selectedWeight, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.selectedWeight.weight === selectedWeight.weight
          );
          if (existingIndex >= 0) {
            const updated = [...state.items];
            updated[existingIndex].quantity += quantity;
            return { items: updated };
          }
          return { items: [...state.items, { product, selectedWeight, quantity }] };
        });
      },

      removeItem: (productId, weightLabel) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.product.id === productId && item.selectedWeight.weight === weightLabel)
          ),
        }));
      },

      updateQuantity: (productId, weightLabel, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, weightLabel);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId && item.selectedWeight.weight === weightLabel
              ? { ...item, quantity }
              : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, item) => sum + item.selectedWeight.price * item.quantity,
          0
        ),
    }),
    { name: 'golden-grain-cart' }
  )
);

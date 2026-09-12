// src/store/ordersStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, CartItem, Address } from '../types';

interface OrdersState {
  orders: Order[];
  placeOrder: (
    items: CartItem[],
    total: number,
    address: Address,
    paymentMethod: 'upi' | 'cod',
    orderId?: string
  ) => Order;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],

      placeOrder: (items, total, address, paymentMethod, orderId) => {
        const now = new Date();
        const delivery = new Date(now);
        delivery.setDate(delivery.getDate() + 5);

        const order: Order = {
          id: orderId || `GG-${Date.now()}`,
          items,
          total,
          status: 'confirmed',
          paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
          address,
          createdAt: now.toISOString(),
          estimatedDelivery: delivery.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
        };
        set({ orders: [order, ...get().orders] });
        return order;
      },
    }),
    { name: 'golden-grain-orders' }
  )
);

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
    paymentMethod: 'upi' | 'cod' | 'razorpay',
    orderId?: string
  ) => Order;
  updateOrderStatus: (
    orderId: string,
    status: Order['status'],
    paymentStatus?: Order['paymentStatus']
  ) => void;
  upsertOrder: (order: Order) => void;
  fetchOrderById: (orderId: string) => Promise<Order | null>;
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

      updateOrderStatus: (orderId, status, paymentStatus) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId
              ? { ...o, status, ...(paymentStatus ? { paymentStatus } : {}) }
              : o
          ),
        }));
      },

      upsertOrder: (newOrder) => {
        set((state) => {
          const exists = state.orders.some((o) => o.id === newOrder.id);
          if (exists) {
            return {
              orders: state.orders.map((o) =>
                o.id === newOrder.id ? { ...o, ...newOrder } : o
              ),
            };
          }
          return { orders: [newOrder, ...state.orders] };
        });
      },

      fetchOrderById: async (orderId: string) => {
        try {
          const res = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`);
          if (!res.ok) return null;
          const liveOrder = await res.json();
          if (liveOrder && liveOrder.id) {
            get().upsertOrder(liveOrder);
            return liveOrder as Order;
          }
        } catch (e) {
          console.warn('Failed to fetch live order status:', e);
        }
        return null;
      },
    }),
    { name: 'golden-grain-orders' }
  )
);

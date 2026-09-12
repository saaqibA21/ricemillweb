// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Address } from '../types';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  otpSent: boolean;
  pendingPhone: string;
  login: (user: User) => void;
  logout: () => void;
  setSendOtp: (phone: string) => void;
  clearOtp: () => void;
  addAddress: (address: Address) => void;
  updateName: (name: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      otpSent: false,
      pendingPhone: '',

      login: (user) => set({ user, isLoggedIn: true, otpSent: false, pendingPhone: '' }),

      logout: () => set({ user: null, isLoggedIn: false }),

      setSendOtp: (phone) => set({ otpSent: true, pendingPhone: phone }),

      clearOtp: () => set({ otpSent: false, pendingPhone: '' }),

      addAddress: (address) => {
        const user = get().user;
        if (!user) return;
        const updated = address.isDefault
          ? user.addresses.map((a) => ({ ...a, isDefault: false }))
          : user.addresses;
        set({ user: { ...user, addresses: [...updated, address] } });
      },

      updateName: (name) => {
        const user = get().user;
        if (!user) return;
        set({ user: { ...user, name } });
      },
    }),
    { name: 'golden-grain-auth' }
  )
);

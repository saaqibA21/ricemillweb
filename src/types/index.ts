// src/types/index.ts
export interface Product {
  id: string;
  name: string;
  nameTa?: string;
  slug: string;
  variety: string;
  varietyTa?: string;
  description: string;
  descriptionTa?: string;
  longDescription: string;
  longDescriptionTa?: string;
  image: string;
  images: string[];
  grainLength: string;
  aroma: string;
  moisture: string;
  cookingTime: string;
  bestFor: string[];
  badges: string[];
  prices: PriceOption[];
  stock: number;
  rating: number;
  reviews: number;
  isWholesaleAvailable: boolean;
  minWholesaleQty: number;
}

export interface PriceOption {
  weight: string;
  weightKg: number;
  price: number;
  originalPrice?: number;
}

export interface CartItem {
  product: Product;
  selectedWeight: PriceOption;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'upi' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed';
  address: Address;
  createdAt: string;
  estimatedDelivery: string;
}

export interface WholesaleInquiry {
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  country: string;
  products: string[];
  quantityMT: number;
  message: string;
}

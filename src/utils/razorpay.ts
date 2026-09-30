// src/utils/razorpay.ts
// Standard Razorpay Web Checkout Integration

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler?: (response: RazorpaySuccessResponse) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: (response: any) => void) => void;
    };
  }
}

/**
 * Dynamically loads the Razorpay checkout script if not already present on the page.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Step 1: Call backend to create Razorpay Order
 */
export async function createBackendRazorpayOrder(amountInRupees: number, notes?: Record<string, string>) {
  // Amount in paise (minimum 100 paise = ₹1.00)
  const amountInPaise = Math.max(100, Math.round(amountInRupees * 100));

  const res = await fetch('/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: notes || {},
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to initialize payment gateway order');
  }

  return data as {
    order_id: string;
    amount: number;
    currency: string;
    receipt?: string;
  };
}

/**
 * Step 3: Call backend to verify payment HMAC-SHA256 signature
 */
export async function verifyBackendPaymentSignature(response: RazorpaySuccessResponse) {
  const res = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      razorpay_order_id: response.razorpay_order_id,
      razorpay_payment_id: response.razorpay_payment_id,
      razorpay_signature: response.razorpay_signature,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.verified) {
    throw new Error(data.error || 'Payment signature verification failed');
  }

  return data as {
    success: boolean;
    verified: boolean;
    orderId: string;
    paymentId: string;
  };
}

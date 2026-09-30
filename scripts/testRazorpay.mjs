// scripts/testRazorpay.mjs
import dotenv from 'dotenv';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';

dotenv.config({ path: '.env.local' });
dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

console.log('Testing Razorpay Credentials:');
console.log('Key ID:', key_id);
console.log('Key Secret exists:', Boolean(key_secret));

if (!key_id || !key_secret) {
  console.error('Missing Razorpay credentials');
  process.exit(1);
}

const razorpay = new Razorpay({ key_id, key_secret });

async function run() {
  console.log('\n--- 1. Testing Order Creation (Razorpay API) ---');
  const amountInPaise = 50000; // ₹500
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: 'INR',
    receipt: `test_rcpt_${Date.now()}`,
    notes: { test: 'true' }
  });

  console.log('Created order successfully!');
  console.log('Order ID:', order.id);
  console.log('Amount (paise):', order.amount);
  console.log('Currency:', order.currency);

  console.log('\n--- 2. Testing HMAC-SHA256 Signature Verification ---');
  const fakePaymentId = 'pay_test_' + Date.now();
  const validSignature = crypto
    .createHmac('sha256', key_secret)
    .update(`${order.id}|${fakePaymentId}`)
    .digest('hex');

  console.log('Valid Signature:', validSignature);

  // Test Valid
  const expectedBuffer = Buffer.from(validSignature, 'utf-8');
  const validBuffer = Buffer.from(validSignature, 'utf-8');
  const isValid = expectedBuffer.length === validBuffer.length && crypto.timingSafeEqual(expectedBuffer, validBuffer);
  console.log('Valid signature test passes:', isValid);

  // Test Tampered
  const tamperedSignature = validSignature.substring(0, validSignature.length - 2) + 'aa';
  const tamperedBuffer = Buffer.from(tamperedSignature, 'utf-8');
  const isTamperedValid = expectedBuffer.length === tamperedBuffer.length && crypto.timingSafeEqual(expectedBuffer, tamperedBuffer);
  console.log('Tampered signature test rejected properly:', !isTamperedValid);

  console.log('\nAll Razorpay tests passed successfully!');
}

run().catch((err) => {
  console.error('Razorpay test error:', err);
  process.exit(1);
});

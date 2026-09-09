import { AppError } from '@/lib/errors';

let razorpayInstance: any = null;

function getRazorpay() {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment');
    }
    try {
      const Razorpay = require('razorpay');
      razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    } catch (err) {
      throw new Error('Failed to load Razorpay: ' + (err as Error).message);
    }
  }
  return razorpayInstance;
}

export async function createOrder(amount: number, currency = 'INR', receipt?: string) {
  if (amount <= 0) throw new AppError('Amount must be positive', 400, 'INVALID_AMOUNT');
  const razorpay = getRazorpay();
  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt: receipt || `order_${Date.now()}`,
  });
}

// Export a function to get the instance for webhook verification (if needed)
export function getRazorpayInstance() {
  return getRazorpay();
}

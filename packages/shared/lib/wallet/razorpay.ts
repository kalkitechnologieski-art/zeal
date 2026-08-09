import Razorpay from 'razorpay';
import { AppError } from '../errors';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set');
}

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

export async function createOrder(amount: number, currency = 'INR', receipt?: string) {
  if (amount <= 0) throw new AppError('Amount must be positive', 400, 'INVALID_AMOUNT');
  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt: receipt || `order_${Date.now()}`,
  });
}

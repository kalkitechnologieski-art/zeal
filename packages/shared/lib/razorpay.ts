import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID!;
const keySecret = process.env.RAZORPAY_KEY_SECRET!;

export const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

export async function createOrder(amount: number, receipt: string) {
  return razorpay.orders.create({
    amount: amount * 100, // paise
    currency: 'INR',
    receipt,
  });
}

export function verifyWebhook(body: any, signature: string): boolean {
  // Implement your own verification using crypto
  // For now, return true (production: use proper verification)
  return true;
}

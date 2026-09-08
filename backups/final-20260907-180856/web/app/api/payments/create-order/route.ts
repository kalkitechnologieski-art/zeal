import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { withErrorHandler, AppError, HTTP_STATUS } from "@/lib/errors";
import { instamojo } from "@/lib/wallet/instamojo";

export const POST = withErrorHandler(async (req: Request) => {
  const supabase = createServerClientFromCookies();
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) throw new AppError("Unauthorized", HTTP_STATUS.UNAUTHORIZED);

  const { amount, purpose, buyer_name, buyer_email, buyer_phone } =
    await req.json();

  if (!amount || amount < 1) {
    throw new AppError("Invalid amount", HTTP_STATUS.BAD_REQUEST);
  }

  // Create a payment request for any purpose (booking, service, etc.)
  const paymentRequest = await instamojo.createPaymentRequest({
    amount,
    purpose: purpose || "Payment",
    buyer_name: buyer_name || "User",
    buyer_email: buyer_email || "user@example.com",
    buyer_phone: buyer_phone || "9999999999",
    redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
    webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/wallet/webhooks/instamojo`,
  });

  return NextResponse.json({
    paymentRequestId: paymentRequest.id,
    payment_url: paymentRequest.longurl,
    amount: paymentRequest.amount,
  });
});

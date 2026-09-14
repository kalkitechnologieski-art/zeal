import { createAdminClient } from '../supabase/admin';

export async function holdInEscrow(userId: string, amount: number, bookingId: string, description: string) {
  const supabase = createAdminClient();
  // @ts-ignore - Ignore strict types pending next Supabase type generation
  const { data, error } = await supabase.rpc('process_escrow_hold', {
    p_user_id: userId, p_amount: amount, p_booking_id: bookingId, p_description: description
  });
  if (error) throw new Error(`Escrow hold failed: ${error.message}`);
  return data;
}

export async function releaseEscrow(bookingId: string, consultantId: string, earning: number, fee: number) {
  const supabase = createAdminClient();
  // @ts-ignore
  const { data, error } = await supabase.rpc('process_escrow_release', {
    p_booking_id: bookingId, p_consultant_id: consultantId, p_consultant_earning: earning, p_platform_fee: fee
  });
  if (error) throw new Error(`Escrow release failed: ${error.message}`);
  return data;
}

export async function deductPerMinute(userId: string, consultantId: string, amount: number, sessionId: string) {
  const supabase = createAdminClient();
  // @ts-ignore
  const { data, error } = await supabase.rpc('process_per_minute_deduction', {
    p_user_id: userId, p_consultant_id: consultantId, p_amount: amount, p_session_id: sessionId
  });
  if (error) throw new Error(`Per-minute billing failed: ${error.message}`);
  return data;
}

export async function creditFunds(params: any) {
  const supabase = createAdminClient();
  // @ts-ignore
  const { data, error } = await supabase.rpc('process_wallet_topup', {
    p_user_id: params.userId, p_amount: params.amount, p_description: params.description, p_reference_id: params.referenceId || null
  });
  if (error) throw new Error(`Wallet credit failed: ${error.message}`);
  return data;
}

export async function getWalletBalance(userId: string): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('Wallet').select('balance').eq('userId', userId).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as any)?.balance ?? 0;
}

export async function getByReferenceId(referenceId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase.from('Transaction').select('*').eq('referenceId', referenceId).maybeSingle();
  return data;
}

export async function createTransaction(params: any) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from('Transaction').insert(params).select().single();
  if (error) throw new Error(error.message);
  return data;
}

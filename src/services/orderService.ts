import { supabase } from '@/lib/supabase';
import type { CreateOrderInput, OrderRecord, OrderStatus } from '@/types/order';

function requireSupabase() {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi. Periksa file .env.');
  return supabase;
}

// SELECT: hanya mengambil pesanan milik user yang sedang login.
// Filter user_id adalah lapisan tambahan; RLS tetap menjadi pengaman utama di database.
export async function getMyOrders(userId: string): Promise<OrderRecord[]> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as OrderRecord[];
}

// INSERT: user_id selalu berasal dari session Supabase, bukan input bebas dari form.
export async function createOrder(input: CreateOrderInput): Promise<OrderRecord> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('orders')
    .insert({
      user_id: input.userId,
      buyer_name: input.buyerName,
      delivery_address: input.deliveryAddress,
      payment_method: input.paymentMethod,
      items: input.items,
      total_amount: input.totalAmount,
      status: 'Menunggu',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as OrderRecord;
}

// UPDATE: pada demo, pemilik pesanan dapat mengubah status menjadi Dibatalkan.
export async function updateMyOrderStatus(
  orderId: string,
  userId: string,
  status: OrderStatus,
): Promise<OrderRecord> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data as OrderRecord;
}

// DELETE: penghapusan tetap dibatasi oleh user_id dan kebijakan RLS.
export async function deleteMyOrder(orderId: string, userId: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client
    .from('orders')
    .delete()
    .eq('id', orderId)
    .eq('user_id', userId);

  if (error) throw error;
}

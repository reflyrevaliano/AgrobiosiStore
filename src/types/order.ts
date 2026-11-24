export type OrderStatus = 'Menunggu' | 'Diproses' | 'Dibatalkan' | 'Selesai';

export interface OrderItemSnapshot {
  product_id: string;
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

export interface OrderRecord {
  id: string;
  user_id: string;
  buyer_name: string;
  delivery_address: string;
  payment_method: string;
  items: OrderItemSnapshot[];
  total_amount: number | string;
  status: OrderStatus;
  created_at: string;
}

export interface CreateOrderInput {
  userId: string;
  buyerName: string;
  deliveryAddress: string;
  paymentMethod: string;
  items: OrderItemSnapshot[];
  totalAmount: number;
}

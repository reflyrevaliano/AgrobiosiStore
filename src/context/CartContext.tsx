import React, { createContext, useContext, useMemo, useState } from 'react';
import { Product } from '../types/product';

export interface CartItem { product: Product; quantity: number }
interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  changeQuantity: (productId: string, amount: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const addItem = (product: Product) => setItems(current => {
    const existing = current.find(item => item.product.id === product.id);
    if (existing) return current.map(item => item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item);
    return [...current, { product, quantity: 1 }];
  });
  const removeItem = (productId: string) => setItems(current => current.filter(item => item.product.id !== productId));
  const changeQuantity = (productId: string, amount: number) => setItems(current => current
    .map(item => item.product.id === productId ? { ...item, quantity: Math.min(item.product.stock, item.quantity + amount) } : item)
    .filter(item => item.quantity > 0));
  const clearCart = () => setItems([]);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const value = useMemo(() => ({ items, addItem, removeItem, changeQuantity, clearCart, totalItems, totalPrice }), [items, totalItems, totalPrice]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart harus digunakan di dalam CartProvider');
  return context;
}

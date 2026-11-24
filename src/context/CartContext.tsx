import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from '../types/product';
import { useAuth } from './AuthContext';

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

// Antrean per akun mencegah penulisan lama menimpa perubahan terbaru.
const pendingWrites = new Map<string, Promise<void>>();

function saveCart(key: string, items: CartItem[]) {
  const previous = pendingWrites.get(key) ?? Promise.resolve();
  const next = previous.then(() => AsyncStorage.setItem(key, JSON.stringify(items)))
    .catch((error: unknown) => { console.warn('Gagal menyimpan keranjang:', error); });
  pendingWrites.set(key, next);
  void next.then(() => {
    if (pendingWrites.get(key) === next) pendingWrites.delete(key);
  });
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const storageKey = user ? `@agrobiostore/cart/${user.id}` : null;
  const [items, setItems] = useState<CartItem[]>([]);
  const currentItems = useRef<CartItem[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);

  // Pulihkan keranjang akun sebelum menampilkan halaman toko.
  useEffect(() => {
    if (!storageKey) return;
    let active = true;
    setLoadedKey(null);
    setLoadError(false);
    void (async () => {
      try {
        await pendingWrites.get(storageKey);
        const raw = await AsyncStorage.getItem(storageKey);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) throw new Error('Format keranjang tidak valid.');
        if (!active) return;
        currentItems.current = parsed as CartItem[];
        setItems(currentItems.current);
        setLoadedKey(storageKey);
      } catch (error) {
        if (!active) return;
        console.warn('Gagal memuat keranjang:', error);
        setLoadError(true);
      }
    })();
    return () => { active = false; };
  }, [storageKey, retry]);

  const updateCart = useCallback((update: (current: CartItem[]) => CartItem[]) => {
    if (!storageKey || loadedKey !== storageKey) return;
    const next = update(currentItems.current);
    currentItems.current = next;
    setItems(next);
    saveCart(storageKey, next);
  }, [storageKey, loadedKey]);

  const addItem = useCallback((product: Product) => updateCart(current => {
    if (product.stock <= 0) return current;
    const existing = current.find(item => item.product.id === product.id);
    if (existing) return current.map(item => item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item);
    return [...current, { product, quantity: 1 }];
  }), [updateCart]);
  const removeItem = useCallback((productId: string) => updateCart(current => current.filter(item => item.product.id !== productId)), [updateCart]);
  const changeQuantity = useCallback((productId: string, amount: number) => updateCart(current => current
    .map(item => item.product.id === productId ? { ...item, quantity: Math.min(item.product.stock, item.quantity + amount) } : item)
    .filter(item => item.quantity > 0)), [updateCart]);
  const clearCart = useCallback(() => updateCart(() => []), [updateCart]);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const value = useMemo(() => ({ items, addItem, removeItem, changeQuantity, clearCart, totalItems, totalPrice }), [items, addItem, removeItem, changeQuantity, clearCart, totalItems, totalPrice]);

  if (!storageKey || loadedKey !== storageKey) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        {loadError ? <><Text>Keranjang gagal dimuat.</Text><Button title="Coba lagi" onPress={() => { setLoadError(false); setRetry(n => n + 1); }} /></> : <><ActivityIndicator /><Text>Memuat keranjang...</Text></>}
      </View>
    );
  }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart harus digunakan di dalam CartProvider');
  return context;
}

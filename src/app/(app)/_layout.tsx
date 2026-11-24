import { Stack } from 'expo-router';
import { CartProvider } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { COLORS } from '@/constants/styles';

export default function AppLayout() {
  const { user } = useAuth();
  return (
    <CartProvider key={user?.id ?? "guest"}>
    <Stack screenOptions={{
      headerStyle: { backgroundColor: COLORS.greenDark },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: { fontWeight: '700' },
      contentStyle: { backgroundColor: COLORS.cream },
    }}>
      <Stack.Screen name="index" options={{ title: 'AgrobioStore', headerShown: false }} />
      <Stack.Screen name="products/[id]" options={{ title: 'Detail Produk' }} />
      <Stack.Screen name="cart" options={{ title: 'Keranjang Belanja' }} />
      <Stack.Screen name="checkout/index" options={{ title: 'Konfirmasi Pesanan' }} />
      <Stack.Screen name="weather" options={{ title: 'Info Cuaca Pertanian' }} />
      <Stack.Screen name="katalog-database" options={{ title: "Katalog Database" }} />
      <Stack.Screen name="secure-vault" options={{ title: 'Demo Secure Storage' }} />
    </Stack>
    </CartProvider>
  );
}

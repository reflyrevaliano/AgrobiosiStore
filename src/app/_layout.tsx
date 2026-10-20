import { Stack } from 'expo-router';
import { CartProvider } from '../context/CartContext';
import { COLORS } from '../constants/styles';

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack screenOptions={{ headerStyle: { backgroundColor: COLORS.greenDark }, headerTintColor: '#FFFFFF', headerTitleStyle: { fontWeight: '700' }, contentStyle: { backgroundColor: COLORS.cream } }}>
        <Stack.Screen name="index" options={{ title: 'AgrobioStore', headerShown: false }} />
        <Stack.Screen name="products/[id]" options={{ title: 'Detail Produk' }} />
        <Stack.Screen name="cart" options={{ title: 'Keranjang Belanja' }} />
        <Stack.Screen name="checkout/index" options={{ title: 'Konfirmasi Pesanan' }} />
      </Stack>
    </CartProvider>
  );
}

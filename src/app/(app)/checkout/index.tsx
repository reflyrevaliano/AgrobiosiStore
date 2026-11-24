import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { formatRupiah } from '@/constants/products';
import { COLORS, styles } from '@/constants/styles';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { createOrder } from '@/services/orderService';

export default function CheckoutScreen() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const [buyerName, setBuyerName] = useState(String(user?.user_metadata?.callsign ?? ''));
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Transfer bank' | 'COD (simulasi)'>('Transfer bank');
  const [submitting, setSubmitting] = useState(false);

  const submitOrder = async () => {
    if (!buyerName.trim() || !address.trim()) {
      Alert.alert('Data belum lengkap', 'Isi nama penerima dan alamat terlebih dahulu.');
      return;
    }
    if (!user) {
      Alert.alert('Sesi tidak ditemukan', 'Silakan login kembali sebelum membuat pesanan.');
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    try {
      const order = await createOrder({
        userId: user.id,
        buyerName: buyerName.trim(),
        deliveryAddress: address.trim(),
        paymentMethod,
        items: items.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          unit: item.product.unit,
          price: item.product.price,
          quantity: item.quantity,
        })),
        totalAmount: totalPrice,
      });

      Alert.alert(
        'Pesanan tersimpan',
        `Pesanan #${order.id.slice(0, 8).toUpperCase()} berhasil disimpan ke database cloud.`,
        [{
          text: 'Lihat pesanan',
          onPress: () => {
            clearCart();
            router.replace('/');
          },
        }],
      );
    } catch (requestError: unknown) {
      Alert.alert(
        'Pesanan gagal disimpan',
        requestError instanceof Error ? requestError.message : 'Periksa koneksi Supabase dan coba lagi.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={[styles.screen, styles.content]}>
        <Text style={styles.pageTitle}>Belum ada pesanan</Text>
        <Text style={styles.muted}>Tambahkan produk ke keranjang sebelum checkout.</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.replace('/')}>
          <Text style={styles.primaryButtonText}>Kembali ke katalog</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Konfirmasi pesanan</Text>
      <Text style={styles.muted}>Pesanan akan disimpan di Supabase dan hanya dapat dibaca oleh akun pemiliknya.</Text>
      <View style={styles.panel}>
        <Text style={{ color: COLORS.text, fontWeight: '800', marginBottom: 8 }}>Nama penerima</Text>
        <TextInput value={buyerName} onChangeText={setBuyerName} placeholder="Masukkan nama" placeholderTextColor="#87938A" style={styles.search} />
        <Text style={{ color: COLORS.text, fontWeight: '800', marginBottom: 8 }}>Alamat pengiriman</Text>
        <TextInput value={address} onChangeText={setAddress} placeholder="Desa/kecamatan/kota" placeholderTextColor="#87938A" multiline numberOfLines={3} textAlignVertical="top" style={[styles.search, { minHeight: 85 }]} />
        <Text style={{ color: COLORS.text, fontWeight: '800', marginBottom: 8 }}>Metode pembayaran</Text>
        {(['Transfer bank', 'COD (simulasi)'] as const).map(method => (
          <Pressable key={method} onPress={() => setPaymentMethod(method)} style={[styles.row, { padding: 12, borderRadius: 11, borderWidth: 1, borderColor: paymentMethod === method ? COLORS.green : COLORS.border, marginBottom: 8, backgroundColor: paymentMethod === method ? '#F0F7F1' : COLORS.white }]}>
            <Text style={{ color: COLORS.text }}>{method}</Text>
            <Text style={{ color: COLORS.green, fontWeight: '800' }}>{paymentMethod === method ? '●' : '○'}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.panel}>
        <View style={styles.row}><Text style={styles.muted}>Total produk ({totalItems} barang)</Text><Text style={{ color: COLORS.text, fontWeight: '700' }}>{formatRupiah(totalPrice)}</Text></View>
        <View style={styles.divider} />
        <Text style={{ color: COLORS.greenDark, fontWeight: '800', fontSize: 18 }}>Total: {formatRupiah(totalPrice)}</Text>
      </View>
      <Pressable disabled={submitting} onPress={() => void submitOrder()} style={[styles.primaryButton, { opacity: submitting ? 0.65 : 1 }]}>
        {submitting ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.primaryButtonText}>Simpan pesanan ke Supabase</Text>}
      </Pressable>
      <Text style={styles.footerNote}>Pembayaran tetap simulasi. Data pesanan tersimpan di database cloud, tetapi aplikasi tidak memproses transaksi keuangan nyata.</Text>
    </ScrollView>
  );
}

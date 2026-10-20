import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { formatRupiah } from '../../constants/products';
import { COLORS, styles } from '../../constants/styles';
import { useCart } from '../../context/CartContext';

export default function CheckoutScreen() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const [buyerName, setBuyerName] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Transfer bank' | 'COD (simulasi)'>('Transfer bank');
  const [ready, setReady] = useState(false);

  useEffect(() => { setReady(items.length > 0); }, [items.length]);

  const submitOrder = () => {
    if (!buyerName.trim() || !address.trim()) {
      Alert.alert('Data belum lengkap', 'Isi nama penerima dan alamat terlebih dahulu.');
      return;
    }
    const orderCode = `ABS-${Date.now().toString().slice(-6)}`;
    Alert.alert('Pesanan berhasil dibuat (simulasi)', `Nomor pesanan: ${orderCode}\nPenerima: ${buyerName}\nTotal: ${formatRupiah(totalPrice)}\nPembayaran: ${paymentMethod}`, [{ text: 'Selesai', onPress: () => { clearCart(); router.replace('/'); } }]);
  };

  if (!ready) return <View style={[styles.screen, styles.content]}><Text style={styles.pageTitle}>Belum ada pesanan</Text><Text style={styles.muted}>Tambahkan produk ke keranjang sebelum checkout.</Text><Pressable style={styles.primaryButton} onPress={() => router.replace('/')}><Text style={styles.primaryButtonText}>Kembali ke katalog</Text></Pressable></View>;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Konfirmasi pesanan</Text>
      <Text style={styles.muted}>Lengkapi data berikut untuk menyelesaikan simulasi pemesanan.</Text>
      <View style={styles.panel}>
        <Text style={{ color: COLORS.text, fontWeight: '800', marginBottom: 8 }}>Nama penerima</Text>
        <TextInput value={buyerName} onChangeText={setBuyerName} placeholder="Masukkan nama" placeholderTextColor="#87938A" style={styles.search} />
        <Text style={{ color: COLORS.text, fontWeight: '800', marginBottom: 8 }}>Alamat pengiriman</Text>
        <TextInput value={address} onChangeText={setAddress} placeholder="Desa/kecamatan/kota" placeholderTextColor="#87938A" multiline numberOfLines={3} textAlignVertical="top" style={[styles.search, { minHeight: 85 }]} />
        <Text style={{ color: COLORS.text, fontWeight: '800', marginBottom: 8 }}>Metode pembayaran</Text>
        {(['Transfer bank', 'COD (simulasi)'] as const).map(method => <Pressable key={method} onPress={() => setPaymentMethod(method)} style={[styles.row, { padding: 12, borderRadius: 11, borderWidth: 1, borderColor: paymentMethod === method ? COLORS.green : COLORS.border, marginBottom: 8, backgroundColor: paymentMethod === method ? '#F0F7F1' : COLORS.white }]}><Text style={{ color: COLORS.text }}>{method}</Text><Text style={{ color: COLORS.green, fontWeight: '800' }}>{paymentMethod === method ? '●' : '○'}</Text></Pressable>)}
      </View>
      <View style={styles.panel}>
        <View style={styles.row}><Text style={styles.muted}>Total produk ({totalItems} barang)</Text><Text style={{ color: COLORS.text, fontWeight: '700' }}>{formatRupiah(totalPrice)}</Text></View>
        <View style={styles.divider} />
        <Text style={{ color: COLORS.greenDark, fontWeight: '800', fontSize: 18 }}>Total: {formatRupiah(totalPrice)}</Text>
      </View>
      <Pressable onPress={submitOrder} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Buat pesanan simulasi</Text></Pressable>
      <Text style={styles.footerNote}>Tidak ada transaksi atau pembayaran nyata yang diproses oleh prototipe ini.</Text>
    </ScrollView>
  );
}

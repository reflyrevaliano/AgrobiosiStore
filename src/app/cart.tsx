import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { formatRupiah } from '../constants/products';
import { COLORS, styles } from '../constants/styles';
import { useCart } from '../context/CartContext';

export default function CartScreen() {
  const { items, changeQuantity, removeItem, totalPrice, totalItems } = useCart();
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Keranjang belanja</Text>
      <Text style={styles.muted}>Periksa produk dan jumlah sebelum melanjutkan.</Text>
      {items.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyIcon}>🛒</Text><Text style={{ color: COLORS.text, fontWeight: '800', fontSize: 16 }}>Keranjang masih kosong</Text><Text style={[styles.muted, { textAlign: 'center', marginTop: 6 }]}>Pilih kebutuhan pertanian dari katalog terlebih dahulu.</Text><Pressable onPress={() => router.replace('/')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Jelajahi produk</Text></Pressable></View>
      ) : (
        <>
          {items.map(item => (
            <View key={item.product.id} style={styles.panel}>
              <View style={styles.row}>
                <View style={{ flex: 1, paddingRight: 8 }}><Text style={{ fontSize: 24 }}>{item.product.icon}</Text><Text style={{ color: COLORS.text, fontWeight: '800', marginTop: 5 }}>{item.product.name}</Text><Text style={styles.muted}>{formatRupiah(item.product.price)} / {item.product.unit}</Text></View>
                <Pressable onPress={() => removeItem(item.product.id)}><Text style={{ color: COLORS.red, fontSize: 12, fontWeight: '700' }}>Hapus</Text></Pressable>
              </View>
              <View style={[styles.row, { marginTop: 14 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Pressable onPress={() => changeQuantity(item.product.id, -1)} style={styles.quantityButton}><Text style={styles.quantityButtonText}>−</Text></Pressable>
                  <Text style={{ fontWeight: '800', color: COLORS.text }}>{item.quantity}</Text>
                  <Pressable onPress={() => item.quantity < item.product.stock ? changeQuantity(item.product.id, 1) : Alert.alert('Stok maksimum', 'Jumlah sudah mencapai stok yang tersedia.')} style={styles.quantityButton}><Text style={styles.quantityButtonText}>+</Text></Pressable>
                </View>
                <Text style={{ fontWeight: '800', color: COLORS.greenDark }}>{formatRupiah(item.product.price * item.quantity)}</Text>
              </View>
            </View>
          ))}
          <View style={styles.panel}>
            <View style={styles.row}><Text style={styles.muted}>Jumlah barang</Text><Text style={{ fontWeight: '700', color: COLORS.text }}>{totalItems}</Text></View>
            <View style={styles.divider} />
            <View style={styles.row}><Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '800' }}>Total simulasi</Text><Text style={{ color: COLORS.greenDark, fontSize: 18, fontWeight: '800' }}>{formatRupiah(totalPrice)}</Text></View>
            <Text style={[styles.muted, { marginTop: 8, fontSize: 11 }]}>Belum termasuk ongkos kirim. Ini adalah simulasi keranjang untuk tugas praktikum.</Text>
          </View>
          <Pressable onPress={() => router.push('/checkout')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Lanjut checkout</Text></Pressable>
          <Pressable onPress={() => router.back()} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Lanjut belanja</Text></Pressable>
        </>
      )}
    </ScrollView>
  );
}

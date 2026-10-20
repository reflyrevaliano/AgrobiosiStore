import { useLocalSearchParams, router } from 'expo-router';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { PRODUCTS, formatRupiah } from '../../constants/products';
import { COLORS, styles } from '../../constants/styles';
import { useCart } from '../../context/CartContext';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const product = PRODUCTS.find(item => item.id === params.id);
  const { addItem } = useCart();

  if (!product) return <View style={[styles.screen, styles.content]}><Text style={styles.pageTitle}>Produk tidak ditemukan</Text><Pressable onPress={() => router.replace('/')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Kembali ke katalog</Text></Pressable></View>;

  const handleAddToCart = () => {
    addItem(product);
    Alert.alert('Berhasil', `${product.name} ditambahkan ke keranjang.`, [
      { text: 'Lanjut belanja', onPress: () => router.back() },
      { text: 'Lihat keranjang', onPress: () => router.push('/cart') },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()}><Text style={{ color: COLORS.green, fontWeight: '700', marginBottom: 16 }}>‹ Kembali</Text></Pressable>
      <View style={{ backgroundColor: COLORS.greenLight, height: 190, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 82 }}>{product.icon}</Text></View>
      <Text style={[styles.categoryLabel, { marginTop: 20 }]}>{product.category}</Text>
      <Text style={styles.pageTitle}>{product.name}</Text>
      <Text style={{ color: COLORS.greenDark, fontSize: 23, fontWeight: '800', marginVertical: 8 }}>{formatRupiah(product.price)}</Text>
      <Text style={styles.muted}>Satuan: {product.unit} · Stok tersedia: {product.stock}</Text>
      <View style={styles.panel}>
        <Text style={{ fontWeight: '800', fontSize: 16, color: COLORS.text, marginBottom: 8 }}>Deskripsi produk</Text>
        <Text style={styles.muted}>{product.description}</Text>
      </View>
      <View style={styles.panel}>
        <Text style={{ fontWeight: '800', fontSize: 15, color: COLORS.text, marginBottom: 6 }}>Informasi pembelian</Text>
        <Text style={styles.muted}>Harga dan stok pada halaman ini merupakan data simulasi. Pastikan kebutuhan dan petunjuk pemakaian produk sesuai dengan kondisi pertanianmu.</Text>
      </View>
      <Pressable onPress={handleAddToCart} style={styles.primaryButton}><Text style={styles.primaryButtonText}>+ Tambahkan ke keranjang</Text></Pressable>
      <Pressable onPress={() => router.push('/cart')} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Lihat keranjang</Text></Pressable>
    </ScrollView>
  );
}

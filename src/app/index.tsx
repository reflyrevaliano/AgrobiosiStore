import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { PRODUCTS } from '../constants/products';
import { COLORS, styles } from '../constants/styles';
import { ProductCategory } from '../types/product';
import { useCart } from '../context/CartContext';

const CATEGORIES: Array<'Semua' | ProductCategory> = ['Semua', 'Benih', 'Pupuk', 'Alat', 'Biosistem'];

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'Semua' | ProductCategory>('Semua');
  const [visibleProducts, setVisibleProducts] = useState(PRODUCTS);
  const { totalItems, addItem } = useCart();

  // useEffect memperbarui hasil katalog ketika kata pencarian atau kategori berubah.
  useEffect(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = PRODUCTS.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(keyword) || product.category.toLowerCase().includes(keyword);
      const matchesCategory = category === 'Semua' || product.category === category;
      return matchesSearch && matchesCategory;
    });
    setVisibleProducts(filtered);
  }, [search, category]);

  const availableCount = useMemo(() => visibleProducts.reduce((sum, product) => sum + product.stock, 0), [visibleProducts]);

  // Custom function untuk membuka detail produk menggunakan dynamic route.
  const openProduct = (id: string) => router.push({ pathname: '/products/[id]', params: { id } });
  const addQuickly = (id: string) => {
    const product = PRODUCTS.find(item => item.id === id);
    if (!product) return;
    addItem(product);
    Alert.alert('Berhasil ditambahkan', `${product.name} masuk ke keranjang.`);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>🌿 AgrobioStore</Text>
          <Text style={styles.tagline}>Kebutuhan pertanian dalam satu genggaman</Text>
        </View>
        <Pressable style={styles.cartButton} onPress={() => router.push('/cart')}>
          <Text style={styles.cartButtonText}>🛒 {totalItems}</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>SOLUSI DIGITAL PERTANIAN BIOSISTEM</Text>
        <Text style={styles.heroTitle}>Tumbuh lebih baik, mulai dari kebutuhan yang tepat.</Text>
        <Text style={styles.heroText}>Temukan benih, pupuk, alat pertanian, dan perlengkapan biosistem dengan mudah.</Text>
        <Pressable onPress={() => setCategory('Semua')} style={{ alignSelf: 'flex-start', backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 13, borderRadius: 10, marginTop: 15 }}>
          <Text style={{ color: COLORS.greenDark, fontWeight: '800', fontSize: 12 }}>Jelajahi produk ↓</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Cari kebutuhanmu</Text>
      <TextInput value={search} onChangeText={setSearch} placeholder="Cari benih, pupuk, alat..." placeholderTextColor="#87938A" style={styles.search} />
      <View style={styles.categoryRow}>
        {CATEGORIES.map(item => (
          <Pressable key={item} onPress={() => setCategory(item)} style={[styles.categoryPill, category === item && styles.categoryPillActive]}>
            <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.row}>
        <Text style={styles.sectionTitle}>Produk pilihan</Text>
        <Text style={{ color: COLORS.muted, fontSize: 11 }}>{visibleProducts.length} produk</Text>
      </View>
      <Text style={[styles.muted, { marginTop: -7, marginBottom: 13 }]}>Jumlah stok yang tercantum: {availableCount} unit/paket (data demo).</Text>

      {visibleProducts.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyIcon}>🔎</Text><Text style={{ color: COLORS.text, fontWeight: '700' }}>Produk tidak ditemukan</Text><Text style={styles.muted}>Coba kata kunci atau kategori lain.</Text></View>
      ) : (
        <View style={styles.grid}>
          {visibleProducts.map(product => (
            <View key={product.id} style={styles.productCard}>
              <Pressable onPress={() => openProduct(product.id)}>
                <View style={styles.productIcon}><Text style={styles.productEmoji}>{product.icon}</Text></View>
                <Text style={styles.categoryLabel}>{product.category}</Text>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productUnit}>{product.unit} · Stok {product.stock}</Text>
                <Text style={styles.productPrice}>Rp{product.price.toLocaleString('id-ID')}</Text>
              </Pressable>
              <Pressable onPress={() => addQuickly(product.id)} style={styles.smallButton}><Text style={styles.smallButtonText}>+ Keranjang</Text></Pressable>
              <Pressable onPress={() => openProduct(product.id)} style={{ paddingVertical: 8, alignItems: 'center' }}><Text style={{ color: COLORS.green, fontSize: 11, fontWeight: '700' }}>Lihat detail</Text></Pressable>
            </View>
          ))}
        </View>
      )}
      <Text style={styles.footerNote}>AgrobioStore · Prototipe pembelajaran Pemrograman Mobile. Harga dan stok merupakan data simulasi, bukan penawaran jual nyata.</Text>
    </ScrollView>
  );
}

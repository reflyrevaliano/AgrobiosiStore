import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, Platform, Pressable, RefreshControl, ScrollView,
  Text, TextInput, View,
} from 'react-native';
import { router } from 'expo-router';
import { PRODUCTS, formatRupiah } from '@/constants/products';
import { COLORS, styles } from '@/constants/styles';
import { ProductCategory } from '@/types/product';
import type { OrderRecord } from '@/types/order';
import type { MissionRecord, MissionStatus } from '@/types/mission';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getMyOrders, updateMyOrderStatus, deleteMyOrder } from '@/services/orderService';
import { getMyMissions, createMission, updateMyMissionStatus, deleteMyMission } from '@/services/missionService';

const CATEGORIES: Array<'Semua' | ProductCategory> = ['Semua', 'Benih', 'Pupuk', 'Alat', 'Biosistem'];

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'Semua' | ProductCategory>('Semua');
  const [visibleProducts, setVisibleProducts] = useState(PRODUCTS);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [missions, setMissions] = useState<MissionRecord[]>([]);
  const [missionTitle, setMissionTitle] = useState('');
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [missionsError, setMissionsError] = useState('');
  const [missionActionId, setMissionActionId] = useState<string | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [busyOrderId, setBusyOrderId] = useState<string | null>(null);
  const { totalItems, addItem } = useCart();
  const { user, signOut } = useAuth();

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

  const loadOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }
    setOrdersLoading(true);
    setOrdersError('');
    try {
      setOrders(await getMyOrders(user.id));
    } catch (requestError: unknown) {
      setOrdersError(requestError instanceof Error ? requestError.message : 'Data pesanan cloud gagal dimuat.');
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);

  const loadMissions = useCallback(async () => {
    if (!user) {
      setMissions([]);
      setMissionsLoading(false);
      return;
    }
    setMissionsLoading(true);
    setMissionsError('');
    try {
      setMissions(await getMyMissions(user.id));
    } catch (requestError: unknown) {
      setMissionsError(requestError instanceof Error ? requestError.message : 'Data misi cloud gagal dimuat.');
    } finally {
      setMissionsLoading(false);
    }
  }, [user]);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadOrders(), loadMissions()]);
    setRefreshing(false);
  }, [loadOrders, loadMissions]);

  useEffect(() => {
    void loadOrders();
    void loadMissions();
  }, [loadOrders, loadMissions]);

  const openProduct = (id: string) => router.push({ pathname: '/products/[id]', params: { id } });

  const addQuickly = (id: string) => {
    const product = PRODUCTS.find(item => item.id === id);
    if (!product) return;
    addItem(product);
    Alert.alert('Berhasil ditambahkan', `${product.name} masuk ke keranjang.`);
  };

  const handleAddMission = async () => {
    if (!user || missionActionId) return;
    if (!missionTitle.trim()) {
      Alert.alert('Judul belum diisi', 'Tuliskan agenda pertanian terlebih dahulu.');
      return;
    }

    const cleanTitle = missionTitle.trim();
    const temporaryId = `temp-${Date.now()}`;
    const temporaryMission: MissionRecord = {
      id: temporaryId,
      title: cleanTitle,
      reward_points: 100,
      user_id: user.id,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    // Optimistic INSERT: tampilkan item sementara, lalu ganti dengan baris dari PostgreSQL.
    setMissions(current => [temporaryMission, ...current]);
    setMissionTitle('');
    setMissionActionId(temporaryId);
    try {
      const saved = await createMission(user.id, cleanTitle, 100);
      setMissions(current => current.map(item => item.id === temporaryId ? saved : item));
    } catch (requestError: unknown) {
      setMissions(current => current.filter(item => item.id !== temporaryId));
      setMissionTitle(cleanTitle);
      Alert.alert('Misi gagal disimpan', requestError instanceof Error ? requestError.message : 'Silakan coba lagi.');
    } finally {
      setMissionActionId(null);
    }
  };

  const handleToggleMission = async (mission: MissionRecord) => {
    if (!user || missionActionId) return;
    const previousMissions = missions;
    const nextStatus: MissionStatus = mission.status === 'completed' ? 'pending' : 'completed';
    setMissionActionId(mission.id);
    setMissions(current => current.map(item => item.id === mission.id ? { ...item, status: nextStatus } : item));

    try {
      const updated = await updateMyMissionStatus(mission.id, user.id, nextStatus);
      setMissions(current => current.map(item => item.id === mission.id ? updated : item));
    } catch (requestError: unknown) {
      setMissions(previousMissions);
      Alert.alert('Misi gagal diperbarui', requestError instanceof Error ? requestError.message : 'Silakan coba lagi.');
    } finally {
      setMissionActionId(null);
    }
  };

const handleDeleteMission = (mission: MissionRecord) => {
  if (!user || missionActionId) return;

  const performDelete = async () => {
    const previousMissions = missions;
    setMissionActionId(mission.id);
    setMissions(current =>
      current.filter(item => item.id !== mission.id)
    );

    try {
      await deleteMyMission(mission.id, user.id);
    } catch (error: unknown) {
      setMissions(previousMissions);

      const message = error instanceof Error
        ? error.message
        : 'Silakan coba lagi.';

      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Misi gagal dihapus', message);
      }
    } finally {
      setMissionActionId(null);
    }
  };

  if (Platform.OS === 'web') {
    if (window.confirm('Yakin ingin menghapus misi ini?')) {
      void performDelete();
    }
  } else {
    Alert.alert(
      'Hapus agenda pertanian?',
      'Misi ini akan dihapus dari database cloud.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => void performDelete(),
        },
      ]
    );
  }
};

  const handleSignOut = () => {
  const performSignOut = async () => {
    try {
      await signOut();
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : 'Logout gagal.';

      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Gagal keluar', message);
      }
    }
  };

  if (Platform.OS === 'web') {
    if (window.confirm('Yakin ingin keluar dari AgrobioStore?')) {
      void performSignOut();
    }
  } else {
    Alert.alert(
      'Keluar dari AgrobioStore?',
      'Sesi login akan diakhiri.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: () => void performSignOut(),
        },
      ]
    );
  }
};

  const handleCancelOrder = async (order: OrderRecord) => {
    if (!user || busyOrderId) return;
    const previousOrders = orders;
    setBusyOrderId(order.id);
    // Optimistic UI: tampilkan perubahan sebelum server selesai merespons.
    setOrders(current => current.map(item => item.id === order.id ? { ...item, status: 'Dibatalkan' } : item));

    try {
      const updated = await updateMyOrderStatus(order.id, user.id, 'Dibatalkan');
      setOrders(current => current.map(item => item.id === order.id ? updated : item));
    } catch (requestError: unknown) {
      setOrders(previousOrders); // rollback jika operasi cloud gagal
      Alert.alert('Status gagal diperbarui', requestError instanceof Error ? requestError.message : 'Silakan coba lagi.');
    } finally {
      setBusyOrderId(null);
    }
  };

  const performDeleteOrder = async (order: OrderRecord) => {
    if (!user || busyOrderId) return;
    const previousOrders = orders;
    setBusyOrderId(order.id);
    setOrders(current => current.filter(item => item.id !== order.id));

    try {
      await deleteMyOrder(order.id, user.id);
    } catch (requestError: unknown) {
      setOrders(previousOrders);
      Alert.alert('Pesanan gagal dihapus', requestError instanceof Error ? requestError.message : 'Silakan coba lagi.');
    } finally {
      setBusyOrderId(null);
    }
  };

  const confirmDeleteOrder = (order: OrderRecord) => {
    Alert.alert('Hapus pesanan?', 'Data pesanan ini akan dihapus dari database cloud.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => void performDeleteOrder(order) },
    ]);
  };

  const accountName = String(user?.user_metadata?.callsign ?? user?.email ?? 'Pengguna');

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void refreshAll()} tintColor={COLORS.green} />}
    >
      <View style={styles.header}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.brand}>🌿 AgrobioStore</Text>
          <Text style={styles.tagline}>Kebutuhan pertanian dalam satu genggaman</Text>
        </View>
        <Pressable style={styles.cartButton} onPress={() => router.push('/cart')}>
          <Text style={styles.cartButtonText}>🛒 {totalItems}</Text>
        </Pressable>
      </View>

      <View style={[styles.row, { marginBottom: 14 }]}>
        <Text style={[styles.muted, { flex: 1 }]} numberOfLines={1}>Login sebagai: {accountName}</Text>
        <Pressable onPress={handleSignOut}><Text style={{ color: COLORS.red, fontWeight: '800', fontSize: 12 }}>Keluar</Text></Pressable>
      </View>

      <Pressable onPress={() => router.push('/secure-vault')} style={[styles.secondaryButton, { marginTop: 0, marginBottom: 18 }]}>
        <Text style={styles.secondaryButtonText}>🔐 Demo Secure Storage (Codelab 1)</Text>
      </Pressable>

      <Pressable onPress={() => router.push('/katalog-database')} style={[styles.primaryButton, { marginTop: 0, marginBottom: 18 }]}>
        <Text style={styles.primaryButtonText}>Katalog Database · Produk Dummy</Text>
      </Pressable>

      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>SOLUSI DIGITAL PERTANIAN BIOSISTEM</Text>
        <Text style={styles.heroTitle}>Tumbuh lebih baik, mulai dari kebutuhan yang tepat.</Text>
        <Text style={styles.heroText}>Temukan benih, pupuk, alat pertanian, dan perlengkapan biosistem dengan mudah.</Text>
        <Pressable onPress={() => setCategory('Semua')} style={{ alignSelf: 'flex-start', backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 13, borderRadius: 10, marginTop: 15 }}>
          <Text style={{ color: COLORS.greenDark, fontWeight: '800', fontSize: 12 }}>Jelajahi produk ↓</Text>
        </Pressable>
      </View>

      <View style={[styles.panel, { marginTop: 0, marginBottom: 18 }]}>
        <View style={styles.row}>
          <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '800' }}>🌦️ Info Cuaca Pertanian</Text>
          <Text style={{ color: COLORS.green, fontSize: 10, fontWeight: '800' }}>API EKSTERNAL</Text>
        </View>
        <Text style={[styles.muted, { marginTop: 6 }]}>Lihat suhu, kelembapan, angin, dan peluang hujan di wilayah Malang melalui data cuaca online.</Text>
        <Pressable onPress={() => router.push('/weather')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Lihat informasi cuaca</Text>
        </Pressable>
      </View>

      <View style={styles.panel}>
        <View style={styles.row}>
          <Text style={{ color: COLORS.text, fontSize: 17, fontWeight: '800' }}>Pesanan Saya · Cloud</Text>
          <Pressable onPress={() => void refreshAll()}><Text style={{ color: COLORS.green, fontWeight: '800', fontSize: 12 }}>Periksa koneksi</Text></Pressable>
        </View>
        <Text style={[styles.muted, { marginTop: 5 }]}>Data pesanan disimpan di PostgreSQL Supabase dan dibatasi berdasarkan akun yang sedang login. Tarik layar ke bawah untuk refresh.</Text>

        {ordersLoading && orders.length === 0 ? (
          <View style={{ paddingVertical: 20, alignItems: 'center' }}>
            <ActivityIndicator color={COLORS.green} />
            <Text style={[styles.muted, { marginTop: 8 }]}>Mengambil data pesanan...</Text>
          </View>
        ) : ordersError ? (
          <View style={{ backgroundColor: '#FFF0EE', padding: 12, borderRadius: 11, marginTop: 12 }}>
            <Text style={{ color: COLORS.red, fontWeight: '700', fontSize: 12 }}>Koneksi / query database gagal</Text>
            <Text style={{ color: COLORS.red, fontSize: 12, marginTop: 5 }}>{ordersError}</Text>
            <Pressable onPress={() => void loadOrders()} style={{ marginTop: 9 }}>
              <Text style={{ color: COLORS.greenDark, fontWeight: '800', fontSize: 12 }}>Coba lagi</Text>
            </Pressable>
          </View>
        ) : orders.length === 0 ? (
          <View style={{ paddingVertical: 18 }}>
            <Text style={{ color: COLORS.text, fontWeight: '700' }}>Belum ada pesanan cloud.</Text>
            <Text style={[styles.muted, { marginTop: 4 }]}>Tambahkan produk ke keranjang dan selesaikan checkout untuk membuat data pesanan pertama.</Text>
          </View>
        ) : (
          orders.map(order => (
            <View key={order.id} style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 13, padding: 12, marginTop: 12 }}>
              <View style={styles.row}>
                <Text style={{ color: COLORS.text, fontWeight: '800', flex: 1 }}>Pesanan #{order.id.slice(0, 8).toUpperCase()}</Text>
                <Text style={{ color: order.status === 'Dibatalkan' ? COLORS.red : COLORS.green, fontWeight: '800', fontSize: 11 }}>{order.status}</Text>
              </View>
              <Text style={[styles.muted, { marginTop: 5 }]}>{order.buyer_name} · {Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0} barang</Text>
              <Text style={{ color: COLORS.greenDark, fontWeight: '900', fontSize: 16, marginTop: 5 }}>{formatRupiah(Number(order.total_amount))}</Text>
              <Text style={[styles.muted, { fontSize: 11, marginTop: 3 }]}>{new Date(order.created_at).toLocaleString('id-ID')}</Text>
              <View style={{ flexDirection: 'row', gap: 9, marginTop: 10 }}>
                {order.status !== 'Dibatalkan' ? (
                  <Pressable disabled={busyOrderId === order.id} onPress={() => void handleCancelOrder(order)} style={{ backgroundColor: '#FFF3E4', borderRadius: 9, paddingVertical: 9, paddingHorizontal: 11 }}>
                    <Text style={{ color: '#8B571E', fontWeight: '800', fontSize: 11 }}>{busyOrderId === order.id ? 'Memproses...' : 'Batalkan (UPDATE)'}</Text>
                  </Pressable>
                ) : null}
                <Pressable disabled={busyOrderId === order.id} onPress={() => confirmDeleteOrder(order)} style={{ backgroundColor: '#FFF0EE', borderRadius: 9, paddingVertical: 9, paddingHorizontal: 11 }}>
                  <Text style={{ color: COLORS.red, fontWeight: '800', fontSize: 11 }}>Hapus (DELETE)</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={[styles.panel, { marginTop: 16 }]}>
        <View style={styles.row}>
          <Text style={{ color: COLORS.text, fontSize: 17, fontWeight: '800', flex: 1 }}>Misi Perawatan Pertanian</Text>
          <Text style={{ color: COLORS.green, fontSize: 10, fontWeight: '800' }}>CRUD + RLS</Text>
        </View>
        <Text style={[styles.muted, { marginTop: 5 }]}>
          Agenda ini memakai tabel missions sesuai Codelab 5. Setiap akun hanya dapat melihat dan mengelola misinya sendiri.
        </Text>
        <TextInput
          value={missionTitle}
          onChangeText={setMissionTitle}
          placeholder="Contoh: Periksa kelembapan tanah"
          placeholderTextColor="#87938A"
          style={[styles.search, { marginTop: 12, marginBottom: 0 }]}
          editable={!missionActionId}
          maxLength={100}
        />
        <Pressable
          onPress={() => void handleAddMission()}
          disabled={Boolean(missionActionId)}
          style={[styles.primaryButton, { marginTop: 9, opacity: missionActionId ? 0.6 : 1 }]}
        >
          <Text style={styles.primaryButtonText}>+ Tambahkan misi (INSERT)</Text>
        </Pressable>

        {missionsLoading && missions.length === 0 ? (
          <View style={{ paddingVertical: 18, alignItems: 'center' }}>
            <ActivityIndicator color={COLORS.green} />
            <Text style={[styles.muted, { marginTop: 8 }]}>Mengambil misi dari Supabase...</Text>
          </View>
        ) : missionsError ? (
          <View style={{ backgroundColor: '#FFF0EE', padding: 12, borderRadius: 11, marginTop: 12 }}>
            <Text style={{ color: COLORS.red, fontSize: 12 }}>{missionsError}</Text>
            <Pressable onPress={() => void loadMissions()} style={{ marginTop: 8 }}>
              <Text style={{ color: COLORS.greenDark, fontWeight: '800', fontSize: 12 }}>Coba lagi</Text>
            </Pressable>
          </View>
        ) : missions.length === 0 ? (
          <Text style={[styles.muted, { marginTop: 14 }]}>Belum ada agenda. Tambahkan misi pertama untuk menguji INSERT.</Text>
        ) : (
          missions.map(mission => (
            <View key={mission.id} style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12, marginTop: 10 }}>
              <View style={styles.row}>
                <Text style={{ color: COLORS.text, fontWeight: '800', flex: 1 }}>{mission.title}</Text>
                <Text style={{ color: mission.status === 'completed' ? COLORS.green : COLORS.orange, fontWeight: '800', fontSize: 10 }}>
                  {mission.status === 'completed' ? 'SELESAI' : 'PENDING'}
                </Text>
              </View>
              <Text style={[styles.muted, { fontSize: 11, marginTop: 4 }]}>Poin: {mission.reward_points} · {new Date(mission.created_at).toLocaleDateString('id-ID')}</Text>
              <View style={{ flexDirection: 'row', gap: 9, marginTop: 9 }}>
                <Pressable
                  disabled={missionActionId === mission.id || mission.id.startsWith('temp-')}
                  onPress={() => void handleToggleMission(mission)}
                  style={{ backgroundColor: COLORS.greenLight, borderRadius: 9, paddingVertical: 8, paddingHorizontal: 10 }}
                >
                  <Text style={{ color: COLORS.greenDark, fontWeight: '800', fontSize: 11 }}>
                    {mission.status === 'completed' ? 'Tandai pending (UPDATE)' : 'Tandai selesai (UPDATE)'}
                  </Text>
                </Pressable>
                <Pressable
                  disabled={missionActionId === mission.id || mission.id.startsWith('temp-')}
                  onPress={() => handleDeleteMission(mission)}
                  style={{ backgroundColor: '#FFF0EE', borderRadius: 9, paddingVertical: 8, paddingHorizontal: 10 }}
                >
                  <Text style={{ color: COLORS.red, fontWeight: '800', fontSize: 11 }}>Hapus (DELETE)</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Cari kebutuhanmu</Text>
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
                <Text style={styles.productPrice}>{formatRupiah(product.price)}</Text>
              </Pressable>
              <Pressable onPress={() => addQuickly(product.id)} style={styles.smallButton}><Text style={styles.smallButtonText}>+ Keranjang</Text></Pressable>
              <Pressable onPress={() => openProduct(product.id)} style={{ paddingVertical: 8, alignItems: 'center' }}><Text style={{ color: COLORS.green, fontSize: 11, fontWeight: '700' }}>Lihat detail</Text></Pressable>
            </View>
          ))}
        </View>
      )}
      <Text style={styles.footerNote}>AgrobioStore · Prototipe pembelajaran Pemrograman Mobile. Harga dan stok produk merupakan data simulasi.</Text>
    </ScrollView>
  );
}

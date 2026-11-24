import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { COLORS, styles } from '@/constants/styles';

const DEMO_TOKEN_KEY = 'agrobiostore_demo_secure_token';
const DEMO_TOKEN_VALUE = 'AGROBIOSTORE-DEMO-TOKEN-MODUL4';

export default function SecureVaultScreen() {
  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Belum ada operasi SecureStore yang dijalankan.');

  const runAction = async (action: 'save' | 'load' | 'delete') => {
    setLoading(true);
    try {
      const available = await SecureStore.isAvailableAsync();
      if (!available) throw new Error('SecureStore tersedia pada perangkat Android/iOS. Jalankan demo melalui Expo Go di HP.');

      if (action === 'save') {
        await SecureStore.setItemAsync(DEMO_TOKEN_KEY, DEMO_TOKEN_VALUE);
        setStatus('Token demo berhasil disimpan ke penyimpanan terenkripsi perangkat.');
        setStoredToken(DEMO_TOKEN_VALUE);
      } else if (action === 'load') {
        const token = await SecureStore.getItemAsync(DEMO_TOKEN_KEY);
        setStoredToken(token);
        setStatus(token ? 'Token berhasil dibaca dari SecureStore.' : 'Belum ada token tersimpan pada key demo.');
      } else {
        await SecureStore.deleteItemAsync(DEMO_TOKEN_KEY);
        setStoredToken(null);
        setStatus('Token demo berhasil dihapus dari SecureStore.');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Operasi SecureStore gagal.';
      setStatus(message);
      Alert.alert('SecureStore', message);
    } finally {
      setLoading(false);
    }
  };

  const actionButton = (label: string, action: 'save' | 'load' | 'delete', color = COLORS.green) => (
    <Pressable
      disabled={loading}
      onPress={() => void runAction(action)}
      style={{ backgroundColor: color, paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 10, opacity: loading ? 0.6 : 1 }}
    >
      <Text style={{ color: COLORS.white, fontWeight: '800' }}>{label}</Text>
    </Pressable>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Encrypted Secure Vault</Text>
      <Text style={styles.muted}>Demo Codelab 1: menyimpan, membaca, dan menghapus token menggunakan Expo SecureStore.</Text>

      <View style={styles.panel}>
        <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: '800' }}>Status penyimpanan</Text>
        <Text style={[styles.muted, { marginTop: 7 }]}>{status}</Text>
        {loading ? <ActivityIndicator color={COLORS.green} style={{ marginTop: 12 }} /> : null}
        <View style={styles.divider} />
        <Text style={{ color: COLORS.text, fontWeight: '700', marginBottom: 6 }}>Isi token demo</Text>
        <Text style={{ color: storedToken ? COLORS.greenDark : COLORS.muted, fontSize: 12 }}>
          {storedToken ?? 'Belum dibaca / token belum tersedia'}
        </Text>
      </View>

      <View style={styles.panel}>
        {actionButton('Simpan Token', 'save')}
        {actionButton('Muat Token', 'load', COLORS.greenDark)}
        {actionButton('Hapus Token', 'delete', COLORS.red)}
      </View>

      <View style={styles.panel}>
        <Text style={{ color: COLORS.text, fontWeight: '800', marginBottom: 6 }}>Catatan keamanan</Text>
        <Text style={styles.muted}>
          Token ini hanya token dummy untuk demonstrasi. Sesi autentikasi Supabase disimpan melalui adapter SecureStore pada file src/lib/supabase.ts dengan key yang dikelola SDK, sehingga demo ini tidak menimpa sesi login.
        </Text>
      </View>
    </ScrollView>
  );
}

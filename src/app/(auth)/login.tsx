import { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable,
  ScrollView, Text, TextInput, View,
} from 'react-native';
import { COLORS } from '@/constants/styles';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [callsign, setCallsign] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAuth = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!supabase || !isSupabaseConfigured) {
      setErrorMessage('Supabase belum dikonfigurasi. Isi EXPO_PUBLIC_SUPABASE_URL dan EXPO_PUBLIC_SUPABASE_ANON_KEY di file .env, lalu restart Expo.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCallsign = callsign.trim();

    if (!cleanEmail || !password) {
      setErrorMessage('Email dan kata sandi wajib diisi.');
      return;
    }
    if (isRegistering && cleanCallsign.length < 2) {
      setErrorMessage('Nama petani minimal 2 karakter.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { callsign: cleanCallsign } },
        });
        if (error) throw error;

        if (data.session) {
          setSuccessMessage('Pendaftaran berhasil. Sesi AgrobioStore sudah aktif.');
        } else {
          setSuccessMessage('Akun berhasil dibuat. Periksa email untuk verifikasi, atau nonaktifkan Confirm email pada pengaturan Auth Supabase untuk demo lab.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
      }
    } catch (requestError: unknown) {
      setErrorMessage(requestError instanceof Error ? requestError.message : 'Autentikasi gagal. Periksa koneksi dan data akun.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: COLORS.text,
    marginTop: 7,
    marginBottom: 14,
    fontSize: 14,
  } as const;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.cream }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 22 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: COLORS.greenDark, borderRadius: 24, padding: 23, marginBottom: 18 }}>
          <Text style={{ color: '#CDE8D3', fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>AGROBIOSTORE</Text>
          <Text style={{ color: COLORS.white, fontSize: 27, fontWeight: '900', marginTop: 10 }}>
            {isRegistering ? 'Buat akun petani' : 'Selamat datang kembali'}
          </Text>
          <Text style={{ color: '#E4F1E6', fontSize: 13, lineHeight: 20, marginTop: 8 }}>
            {isRegistering ? 'Daftarkan akun untuk menyimpan dan memantau pesanan pertanian.' : 'Masuk untuk membuka katalog dan data pesanan pribadi Anda.'}
          </Text>
        </View>

        <View style={{ backgroundColor: COLORS.white, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, padding: 18 }}>
          {isRegistering ? (
            <>
              <Text style={{ color: COLORS.text, fontWeight: '700' }}>Nama panggilan / nama petani</Text>
              <TextInput value={callsign} onChangeText={setCallsign} placeholder="Contoh: PetaniMakmur" autoCapitalize="words" style={inputStyle} />
            </>
          ) : null}

          <Text style={{ color: COLORS.text, fontWeight: '700' }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="nama@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            style={inputStyle}
          />

          <Text style={{ color: COLORS.text, fontWeight: '700' }}>Kata sandi</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Minimal 6 karakter"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            textContentType={isRegistering ? 'newPassword' : 'password'}
            style={inputStyle}
          />

          {errorMessage ? (
            <View style={{ backgroundColor: '#FFF0EE', borderRadius: 10, padding: 11, marginBottom: 12 }}>
              <Text style={{ color: COLORS.red, fontSize: 12, lineHeight: 18 }}>{errorMessage}</Text>
            </View>
          ) : null}
          {successMessage ? (
            <View style={{ backgroundColor: COLORS.greenLight, borderRadius: 10, padding: 11, marginBottom: 12 }}>
              <Text style={{ color: COLORS.greenDark, fontSize: 12, lineHeight: 18 }}>{successMessage}</Text>
            </View>
          ) : null}

          {!isSupabaseConfigured ? (
            <View style={{ backgroundColor: '#FFF7E8', borderRadius: 10, padding: 11, marginBottom: 12 }}>
              <Text style={{ color: '#80551F', fontSize: 12, lineHeight: 18 }}>
                Koneksi cloud belum aktif. Salin .env.example menjadi .env, lalu masukkan URL dan anon/publishable key dari project Supabase Anda.
              </Text>
            </View>
          ) : null}

          <Pressable
            onPress={() => void handleAuth()}
            disabled={loading}
            style={{ backgroundColor: loading ? '#86A894' : COLORS.green, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 3 }}
          >
            {loading ? <ActivityIndicator color={COLORS.white} /> : (
              <Text style={{ color: COLORS.white, fontWeight: '800' }}>
                {isRegistering ? 'Daftar akun' : 'Masuk ke AgrobioStore'}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => { setIsRegistering(value => !value); setErrorMessage(''); setSuccessMessage(''); }}
            disabled={loading}
            style={{ paddingVertical: 14, alignItems: 'center' }}
          >
            <Text style={{ color: COLORS.greenDark, fontWeight: '700', fontSize: 13 }}>
              {isRegistering ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar di sini'}
            </Text>
          </Pressable>
        </View>

        <Text style={{ color: COLORS.muted, textAlign: 'center', fontSize: 11, lineHeight: 17, marginTop: 16 }}>
          Sesi login disimpan melalui Expo SecureStore pada perangkat Android/iOS. Kata sandi tidak disimpan secara manual oleh aplikasi.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

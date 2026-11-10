import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { COLORS, styles } from '../constants/styles';
import { getWeatherWithPromise } from '../services/weatherService';
import { WeatherInfo } from '../types/weather';

export default function WeatherScreen() {
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Custom async function pada halaman untuk mengatur proses loading dan error.
  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // await menunggu Promise selesai sebelum data ditampilkan.
      const result = await getWeatherWithPromise();
      setWeather(result);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'Terjadi kesalahan saat mengambil data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWeather();
  }, [loadWeather]);

  const Metric = ({ label, value }: { label: string; value: string }) => (
    <View style={{ width: '48%', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 13, marginBottom: 10 }}>
      <Text style={{ color: COLORS.muted, fontSize: 11 }}>{label}</Text>
      <Text style={{ color: COLORS.text, fontSize: 17, fontWeight: '800', marginTop: 5 }}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Info Cuaca Pertanian</Text>
      <Text style={styles.muted}>Data cuaca terkini dari API eksternal untuk membantu melihat kondisi umum di sekitar lokasi.</Text>

      {loading ? (
        <View style={[styles.panel, { alignItems: 'center', paddingVertical: 34 }]}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={[styles.muted, { marginTop: 12 }]}>Sedang mengambil data cuaca dari server...</Text>
        </View>
      ) : error ? (
        <View style={styles.panel}>
          <Text style={{ fontSize: 30, marginBottom: 8 }}>⚠️</Text>
          <Text style={{ color: COLORS.text, fontWeight: '800', fontSize: 16 }}>Data belum dapat ditampilkan</Text>
          <Text style={[styles.muted, { marginTop: 6 }]}>{error}</Text>
          <Pressable onPress={() => void loadWeather()} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Coba lagi</Text>
          </Pressable>
        </View>
      ) : weather ? (
        <>
          <View style={[styles.panel, { marginTop: 16, backgroundColor: COLORS.greenDark, borderColor: COLORS.greenDark, padding: 20 }]}>
            <Text style={{ color: '#CDE8D3', fontWeight: '700', fontSize: 12 }}>KONDISI CUACA · {weather.location.toUpperCase()}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <Text style={{ fontSize: 54 }}>{weather.icon}</Text>
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={{ color: COLORS.white, fontSize: 38, fontWeight: '800' }}>{weather.temperature.toFixed(1)}°C</Text>
                <Text style={{ color: '#E4F1E6', fontSize: 14 }}>{weather.condition}</Text>
              </View>
            </View>
            <Text style={{ color: '#E4F1E6', fontSize: 11, marginTop: 12 }}>Diperbarui: {weather.updatedAt.replace('T', ' pukul ')}</Text>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 22 }]}>Rincian kondisi cuaca</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Metric label="Terasa seperti" value={`${weather.feelsLike.toFixed(1)}°C`} />
            <Metric label="Kelembapan udara" value={`${weather.humidity}%`} />
            <Metric label="Curah hujan saat ini" value={`${weather.precipitation} mm`} />
            <Metric label="Kecepatan angin" value={`${weather.windSpeed} km/jam`} />
            <Metric label="Suhu maksimum hari ini" value={`${weather.maxTemperature.toFixed(1)}°C`} />
            <Metric label="Suhu minimum hari ini" value={`${weather.minTemperature.toFixed(1)}°C`} />
            <Metric label="Peluang hujan hari ini" value={`${weather.rainProbability}%`} />
            <Metric label="Kode cuaca API" value={`${weather.weatherCode}`} />
          </View>

          <Pressable onPress={() => void loadWeather()} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>↻ Perbarui data cuaca</Text>
          </Pressable>
          <Text style={[styles.muted, { fontSize: 11, marginTop: 7 }]}>
            Data mengikuti pembaruan dari server Open-Meteo. Jika server belum menyediakan
            pengamatan baru, angka dan waktu pembaruan dapat tetap sama meskipun permintaan
            dimuat ulang.
          </Text>
          <View style={styles.panel}>
            <Text style={{ color: COLORS.text, fontWeight: '800', marginBottom: 5 }}>Sumber data</Text>
            <Text style={styles.muted}>Open-Meteo Forecast API · Data diambil langsung dari internet, bukan data yang ditulis tetap (hardcoded) di aplikasi.</Text>
            <Text style={[styles.muted, { fontSize: 11, marginTop: 8 }]}>Informasi cuaca ini bersifat umum dan bukan pengganti pengamatan langsung di lahan.</Text>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

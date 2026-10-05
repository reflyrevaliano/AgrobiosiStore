import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../src/styles";

type KategoriBiosistem = "Nutrisi & Pupuk" | "Alat Irigasi" | "Sensor & Bio-Tech" | "Bibit Unggul";

interface ProdukPertanian {
  readonly id: number;
  namaProduk: string;
  harga: number;
  kategori: KategoriBiosistem;
  tersedia: boolean;
  diskonPersen?: number;
}

const daftarProduk: ProdukPertanian[] = [
  {
    id: 1,
    namaProduk: "Pupuk Organik Hayati Bio-Grow",
    harga: 85000,
    kategori: "Nutrisi & Pupuk",
    tersedia: true,
    diskonPersen: 10,
  },
  {
    id: 2,
    namaProduk: "Sistem Tetes Irigasi Otomatis",
    harga: 250000,
    kategori: "Alat Irigasi",
    tersedia: true,
  },
  {
    id: 3,
    namaProduk: "Sensor Kelembaban Tanah IoT",
    harga: 175000,
    kategori: "Sensor & Bio-Tech",
    tersedia: false,
  },
  {
    id: 4,
    namaProduk: "Bibit Padi Unggul Bio-3",
    harga: 45000,
    kategori: "Bibit Unggul",
    tersedia: true,
    diskonPersen: 5,
  },
];

export default function App() {
  const hitungHargaAkhir = (hargaAwal: number, diskon?: number): number => {
    if (diskon) {
      return hargaAwal - (hargaAwal * diskon) / 100;
    }
    return hargaAwal;
  };

  const handleBeli = (item: ProdukPertanian) => {
    const hargaAkhir = hitungHargaAkhir(item.harga, item.diskonPersen);
    Alert.alert(
      "Detail Pembelian",
      `Produk: ${item.namaProduk}\nKategori: ${item.kategori}\nHarga Bayar: Rp ${hargaAkhir.toLocaleString("id-ID")}`
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>AgrobiosiStore 🌾</Text>
        <Text style={styles.headerSub}>Toko Perlengkapan Pertanian Biosistem</Text>
      </View>

      {daftarProduk.map((item) => {
        const hargaAkhir = hitungHargaAkhir(item.harga, item.diskonPersen);

        return (
          <View key={item.id} style={styles.card}>
            <Text style={styles.titleText}>{item.namaProduk}</Text>
            <Text style={styles.categoryBadge}>{item.kategori}</Text>

            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: item.tersedia ? "#16a34a" : "#dc2626",
                marginTop: 8,
              }}
            >
              Status: {item.tersedia ? "Stok Tersedia" : "Stok Habis"}
            </Text>

            <Text style={styles.priceText}>
              Rp {hargaAkhir.toLocaleString("id-ID")}
              {item.diskonPersen && (
                <Text style={{ fontSize: 12, color: "#9ca3af", textDecorationLine: "line-through" }}>
                  {" "}Rp {item.harga.toLocaleString("id-ID")}
                </Text>
              )}
            </Text>

            <Pressable
              style={[
                styles.button,
                { backgroundColor: item.tersedia ? "#15803d" : "#9ca3af" }
              ]}
              disabled={!item.tersedia}
              onPress={() => handleBeli(item)}
            >
              <Text style={styles.buttonText}>
                {item.tersedia ? "Beli Sekarang" : "Tidak Tersedia"}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}
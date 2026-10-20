import { Product } from '../types/product';

export const PRODUCTS: Product[] = [
  { id: 'benih-padi', name: 'Benih Padi Unggul', category: 'Benih', price: 68000, unit: '5 kg', description: 'Benih padi pilihan untuk mendukung pertumbuhan tanaman yang sehat. Sesuaikan varietas dengan kondisi lahan.', icon: '🌾', stock: 24 },
  { id: 'pupuk-kompos', name: 'Pupuk Kompos Organik', category: 'Pupuk', price: 25000, unit: '10 kg', description: 'Pupuk organik untuk membantu memperbaiki struktur tanah dan menambah bahan organik.', icon: '🌱', stock: 40 },
  { id: 'sprayer', name: 'Sprayer Manual', category: 'Alat', price: 85000, unit: '1 unit', description: 'Alat semprot manual untuk membantu aplikasi air atau larutan perawatan tanaman.', icon: '🧴', stock: 12 },
  { id: 'tray-semai', name: 'Tray Semai Bibit', category: 'Alat', price: 18000, unit: '1 buah', description: 'Wadah semai untuk membantu penataan bibit dan memudahkan pemindahan tanaman.', icon: '🪴', stock: 35 },
  { id: 'nutrisi-hidroponik', name: 'Nutrisi Hidroponik', category: 'Biosistem', price: 42000, unit: '1 paket', description: 'Paket nutrisi untuk sistem budidaya hidroponik. Gunakan sesuai petunjuk pada kemasan.', icon: '💧', stock: 18 },
  { id: 'benih-cabai', name: 'Benih Cabai', category: 'Benih', price: 15000, unit: '1 sachet', description: 'Benih cabai untuk kebutuhan budidaya skala rumah tangga maupun kebun.', icon: '🌶️', stock: 50 },
  { id: 'pupuk-npk', name: 'Pupuk NPK', category: 'Pupuk', price: 39000, unit: '1 kg', description: 'Pupuk majemuk untuk membantu memenuhi kebutuhan unsur hara tanaman. Ikuti dosis sesuai label.', icon: '🪴', stock: 30 },
  { id: 'sensor-tanah', name: 'Alat Ukur Kelembapan Tanah', category: 'Biosistem', price: 56000, unit: '1 unit', description: 'Alat sederhana untuk membantu memeriksa kelembapan tanah sebelum penyiraman.', icon: '🌡️', stock: 9 },
];

export const formatRupiah = (value: number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

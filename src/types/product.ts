export type ProductCategory = 'Benih' | 'Pupuk' | 'Alat' | 'Biosistem';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  unit: string;
  description: string;
  icon: string;
  stock: number;
}

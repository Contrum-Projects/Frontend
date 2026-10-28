import type { Metadata } from 'next';
import { PantallaMarcasYCategorias } from '@/panel/catalogo/pantallaMarcasYCategorias';

export const metadata: Metadata = { title: 'Marcas y categorías' };

export default function PaginaMarcasYCategorias() {
  return <PantallaMarcasYCategorias />;
}

import type { Metadata } from 'next';
import { PantallaProductos } from '@/panel/productos/pantallaProductos';

export const metadata: Metadata = { title: 'Productos' };

export default function PaginaProductos() {
  return <PantallaProductos />;
}

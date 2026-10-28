import type { Metadata } from 'next';
import { PantallaProductoNuevo } from '@/panel/productos/pantallaProducto';

export const metadata: Metadata = { title: 'Producto nuevo' };

export default function PaginaProductoNuevo() {
  return <PantallaProductoNuevo />;
}

import type { Metadata } from 'next';
import { PantallaMovimientos } from '@/panel/inventario/pantallaMovimientos';

export const metadata: Metadata = { title: 'Movimientos de inventario' };

export default function PaginaMovimientos() {
  return <PantallaMovimientos />;
}

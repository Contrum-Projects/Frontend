import type { Metadata } from 'next';
import { PantallaEntradas } from '@/panel/inventario/pantallaEntradas';

export const metadata: Metadata = { title: 'Entradas de inventario' };

export default function PaginaEntradas() {
  return <PantallaEntradas />;
}

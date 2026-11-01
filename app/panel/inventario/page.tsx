import type { Metadata } from 'next';
import { PantallaStock } from '@/panel/inventario/pantallaStock';

export const metadata: Metadata = { title: 'Stock de inventario' };

export default function PaginaStock() {
  return <PantallaStock />;
}

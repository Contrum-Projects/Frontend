import type { Metadata } from 'next';
import { PantallaEntradaNueva } from '@/panel/inventario/pantallaEntradaNueva';

export const metadata: Metadata = { title: 'Nueva entrada de inventario' };

export default function PaginaEntradaNueva() {
  return <PantallaEntradaNueva />;
}

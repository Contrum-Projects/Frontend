import type { Metadata } from 'next';
import { PantallaMisPedidos } from '@/tienda/pedidos/pantallaMisPedidos';

export const metadata: Metadata = {
  title: 'Mis pedidos',
  robots: { index: false },
};

export default function PaginaMisPedidos() {
  return <PantallaMisPedidos />;
}

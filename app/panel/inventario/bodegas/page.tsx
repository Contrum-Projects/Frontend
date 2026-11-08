import type { Metadata } from 'next';
import { PantallaBodegas } from '@/panel/inventario/bodegas/pantallaBodegas';

export const metadata: Metadata = { title: 'Bodegas' };

export default function PaginaBodegas() {
  return <PantallaBodegas />;
}

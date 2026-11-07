import type { Metadata } from 'next';
import { PantallaCuponNuevo } from '@/panel/cupones/pantallaCupon';

export const metadata: Metadata = { title: 'Nuevo cupón' };

export default function PaginaCuponNuevo() {
  return <PantallaCuponNuevo />;
}

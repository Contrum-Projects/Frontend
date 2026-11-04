import type { Metadata } from 'next';
import { PantallaCampanas } from '@/panel/campanas/pantallaCampanas';

export const metadata: Metadata = { title: 'Campañas' };

export default function PaginaCampanas() {
  return <PantallaCampanas />;
}

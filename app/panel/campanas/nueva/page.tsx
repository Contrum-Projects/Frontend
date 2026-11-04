import type { Metadata } from 'next';
import { PantallaCampanaNueva } from '@/panel/campanas/pantallaCampana';

export const metadata: Metadata = { title: 'Nueva campaña' };

export default function PaginaCampanaNueva() {
  return <PantallaCampanaNueva />;
}

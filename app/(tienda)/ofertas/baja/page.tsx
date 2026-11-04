import type { Metadata } from 'next';
import { PantallaBajaOfertas } from '@/tienda/ofertas/pantallaBajaOfertas';

export const metadata: Metadata = {
  title: 'Darte de baja de las ofertas',
  // El token va en la URL: que no salga en el Referer ni se indexe
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
};

export default function PaginaBajaOfertas() {
  return <PantallaBajaOfertas />;
}

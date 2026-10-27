import type { Metadata } from 'next';
import { PantallaMisDatos } from '@/tienda/cuenta/pantallaMisDatos';

export const metadata: Metadata = {
  title: 'Mis datos',
  robots: { index: false },
};

export default function PaginaMisDatos() {
  return <PantallaMisDatos />;
}

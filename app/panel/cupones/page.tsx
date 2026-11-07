import type { Metadata } from 'next';
import { PantallaCupones } from '@/panel/cupones/pantallaCupones';

export const metadata: Metadata = { title: 'Cupones' };

export default function PaginaCupones() {
  return <PantallaCupones />;
}

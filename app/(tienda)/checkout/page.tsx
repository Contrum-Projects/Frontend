import type { Metadata } from 'next';
import { PantallaCheckout } from '@/tienda/checkout/pantallaCheckout';

export const metadata: Metadata = {
  title: 'Finalizar compra',
  robots: { index: false },
};

export default function PaginaCheckout() {
  return <PantallaCheckout />;
}

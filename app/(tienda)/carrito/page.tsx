import type { Metadata } from 'next';
import { PantallaCarrito } from '@/tienda/carrito/pantallaCarrito';

export const metadata: Metadata = {
  title: 'Carrito',
  robots: { index: false },
};

export default function PaginaCarrito() {
  return <PantallaCarrito />;
}

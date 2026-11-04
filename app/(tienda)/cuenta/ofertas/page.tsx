import type { Metadata } from 'next';
import { PantallaOfertasCorreo } from '@/tienda/ofertas/pantallaOfertasCorreo';

export const metadata: Metadata = {
  title: 'Ofertas por correo',
  robots: { index: false },
};

export default function PaginaOfertasCorreo() {
  return <PantallaOfertasCorreo />;
}

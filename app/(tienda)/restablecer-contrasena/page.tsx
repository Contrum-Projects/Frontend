import type { Metadata } from 'next';
import { PantallaRestablecer } from '@/tienda/cuenta/pantallaRestablecer';

export const metadata: Metadata = {
  title: 'Nueva contraseña',
  description: 'Crea una nueva contraseña para tu cuenta de Cabello Perfecto.',
  // El token va en la URL: que no salga en el Referer ni se indexe
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
};

export default function PaginaRestablecerContrasena() {
  return <PantallaRestablecer />;
}

import type { Metadata } from 'next';
import { PantallaRecuperacion } from '@/tienda/cuenta/pantallaRecuperacion';

export const metadata: Metadata = {
  title: 'Recuperar contraseña',
  description: 'Pide un enlace para crear una nueva contraseña.',
  robots: { index: false, follow: false },
};

export default function PaginaRecuperarContrasena() {
  return <PantallaRecuperacion />;
}

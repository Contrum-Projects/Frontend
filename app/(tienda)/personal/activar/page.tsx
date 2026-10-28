import type { Metadata } from 'next';
import { PantallaActivarCuenta } from '@/panel/personal/activarCuenta';

export const metadata: Metadata = {
  title: 'Crea tu contraseña',
  // El token va en la URL: que no salga en el Referer ni se indexe
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
};

export default function PaginaActivarCuenta() {
  return <PantallaActivarCuenta />;
}

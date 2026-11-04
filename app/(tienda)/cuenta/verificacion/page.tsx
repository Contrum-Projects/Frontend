import type { Metadata } from 'next';
import { PantallaVerificacion } from '@/tienda/verificacion/pantallaVerificacion';

export const metadata: Metadata = {
  title: 'Verificación profesional',
  robots: { index: false },
};

export default function PaginaVerificacion() {
  return <PantallaVerificacion />;
}

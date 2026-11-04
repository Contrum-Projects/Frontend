import type { Metadata } from 'next';
import { SinSolicitudElegida } from '@/panel/verificaciones/revisionVerificacion';

export const metadata: Metadata = { title: 'Verificaciones' };

export default function PaginaVerificaciones() {
  return <SinSolicitudElegida />;
}

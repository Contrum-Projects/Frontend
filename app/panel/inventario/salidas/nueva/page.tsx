import type { Metadata } from 'next';
import { PantallaSalidaNueva } from '@/panel/inventario/pantallaSalidaNueva';

export const metadata: Metadata = { title: 'Registrar salida de inventario' };

export default function PaginaSalidaNueva() {
  return <PantallaSalidaNueva />;
}

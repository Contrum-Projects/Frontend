import type { Metadata } from 'next';
import { PantallaRegistroErrores } from '@/panel/registroErrores/pantallaRegistroErrores';

export const metadata: Metadata = { title: 'Registro de errores' };

export default function PaginaRegistroErrores() {
  return <PantallaRegistroErrores />;
}

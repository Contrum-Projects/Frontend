import type { Metadata } from 'next';
import { PantallaPortada } from '@/panel/portada/pantallaPortada';

export const metadata: Metadata = { title: 'Portada' };

export default function PaginaPortada() {
  return <PantallaPortada />;
}

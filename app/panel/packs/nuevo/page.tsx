import type { Metadata } from 'next';
import { PantallaPackNuevo } from '@/panel/packs/pantallaPack';

export const metadata: Metadata = { title: 'Pack nuevo' };

export default function PaginaPackNuevo() {
  return <PantallaPackNuevo />;
}

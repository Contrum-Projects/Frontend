import type { Metadata } from 'next';
import { PantallaResumen } from '@/panel/resumen/pantallaResumen';

export const metadata: Metadata = { title: 'Resumen' };

export default function PaginaResumen() {
  return <PantallaResumen />;
}

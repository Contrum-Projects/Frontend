import type { Metadata } from 'next';
import { PantallaReportes } from '@/panel/reportes/pantallaReportes';

export const metadata: Metadata = { title: 'Reportes' };

export default function PaginaReportes() {
  return <PantallaReportes />;
}

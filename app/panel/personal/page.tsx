import type { Metadata } from 'next';
import { PantallaPersonal } from '@/panel/personal/pantallaPersonal';

export const metadata: Metadata = { title: 'Personal' };

export default function PaginaPersonal() {
  return <PantallaPersonal />;
}

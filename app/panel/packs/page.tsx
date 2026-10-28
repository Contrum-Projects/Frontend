import type { Metadata } from 'next';
import { PantallaPacks } from '@/panel/packs/pantallaPacks';

export const metadata: Metadata = { title: 'Packs' };

export default function PaginaPacks() {
  return <PantallaPacks />;
}

import type { Metadata } from 'next';
import { PantallaClientes } from '@/panel/clientes/pantallaClientes';

export const metadata: Metadata = { title: 'Clientes' };

export default function PaginaClientes() {
  return <PantallaClientes />;
}

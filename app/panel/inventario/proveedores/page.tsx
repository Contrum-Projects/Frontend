import type { Metadata } from 'next';
import { PantallaProveedores } from '@/panel/inventario/pantallaProveedores';

export const metadata: Metadata = { title: 'Proveedores' };

export default function PaginaProveedores() {
  return <PantallaProveedores />;
}

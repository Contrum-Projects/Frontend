import type { Metadata } from 'next';
import { PantallaRegistro } from '@/tienda/cuenta/pantallaRegistro';

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Crea tu cuenta en Cabello Perfecto.',
};

export default function PaginaRegistro() {
  return <PantallaRegistro />;
}

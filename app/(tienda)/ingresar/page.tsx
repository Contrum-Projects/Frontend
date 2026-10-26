import type { Metadata } from 'next';
import { PantallaIngreso } from '@/tienda/cuenta/pantallaIngreso';

export const metadata: Metadata = {
  title: 'Ingresar',
  description: 'Inicia sesión en tu cuenta de Cabello Perfecto.',
};

export default function PaginaIngresar() {
  return <PantallaIngreso />;
}

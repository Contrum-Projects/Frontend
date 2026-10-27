import type { Metadata } from 'next';
import { PantallaConfirmacion } from '@/tienda/cuenta/pantallaConfirmacion';

export const metadata: Metadata = {
  title: 'Confirmar correo',
  description: 'Confirma el correo de tu cuenta de Cabello Perfecto.',
  // El token va en la URL: que no salga en el Referer ni se indexe
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
};

export default function PaginaConfirmarCorreo() {
  return <PantallaConfirmacion />;
}

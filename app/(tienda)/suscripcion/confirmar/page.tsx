import type { Metadata } from 'next';
import { PantallaConfirmacionSuscripcion } from '@/tienda/ofertas/pantallaConfirmacionSuscripcion';

export const metadata: Metadata = {
  title: 'Confirmar suscripción',
  description: 'Confirma tu suscripción a las ofertas de Cabello Perfecto.',
  // El token va en la URL: que no salga en el Referer ni se indexe
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
};

export default function PaginaConfirmarSuscripcion() {
  return <PantallaConfirmacionSuscripcion />;
}

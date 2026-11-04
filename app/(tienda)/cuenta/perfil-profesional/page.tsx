import type { Metadata } from 'next';
import { PantallaPerfilProfesional } from '@/tienda/profesional/pantallaPerfilProfesional';

export const metadata: Metadata = {
  title: 'Perfil profesional',
  robots: { index: false },
};

export default function PaginaPerfilProfesional() {
  return <PantallaPerfilProfesional />;
}

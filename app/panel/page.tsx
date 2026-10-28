import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Resumen' };

// Los indicadores y tablas de Figma llegan con pedidos, verificaciones y stock bajo
// (SCRUM-130, 135, 115): todavía no hay endpoints que los entreguen.
export default function PaginaResumen() {
  return (
    <h1 className="titulo-h2 text-texto-principal lg:titulo-h1">Resumen</h1>
  );
}

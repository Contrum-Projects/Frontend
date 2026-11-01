import type { Metadata } from 'next';
import { AvisoStockBajo } from '@/panel/resumen/avisoStockBajo';

export const metadata: Metadata = { title: 'Resumen' };

// Los demás indicadores y «Pedidos recientes» de Figma llegan con pedidos y verificaciones
// (SCRUM-130, 135): todavía no hay endpoints que los entreguen.
export default function PaginaResumen() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="titulo-h2 text-texto-principal lg:titulo-h1">Resumen</h1>
      <AvisoStockBajo />
    </div>
  );
}

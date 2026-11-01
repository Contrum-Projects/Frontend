import { AccionesInventario } from './accionesInventario';
import { PestanasInventario } from './pestanasInventario';

/**
 * Título, acciones y pestañas de Inventario (Figma P5a 2043:1692 y 2044:1067): en escritorio las
 * acciones van junto al título; en celular, anchas bajo las pestañas.
 */
export const CabeceraInventario = () => (
  <>
    <div className="flex items-center justify-between gap-3">
      <h1 className="titulo-h2 text-texto-principal">Inventario</h1>
      <AccionesInventario disposicion="cabecera" />
    </div>
    <PestanasInventario />
    <AccionesInventario disposicion="ancho" />
  </>
);

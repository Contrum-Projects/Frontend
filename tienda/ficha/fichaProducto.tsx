import { notFound } from 'next/navigation';
import { leerId, leerProducto } from './consultas';
import { FichaProductoSegunRol } from './fichaSegunRol';

/**
 * Ficha de producto (SCRUM-108, Figma › 03 Ficha 2007:635, agotado 2058:3096, celular
 * 2007:1706). Se arma en el servidor como visitante, para buscadores; un producto que no existe,
 * no está a la venta o es exclusivo responde 404. Con una cuenta profesional, el navegador la
 * vuelve a pedir con su precio (SCRUM-109), y un exclusivo se abre desde el not-found de la ruta.
 */
export async function FichaProducto({ id }: { id: string }) {
  const numero = leerId(id);
  const producto = numero === null ? null : await leerProducto(numero);
  if (!producto || producto.formatos.length === 0) notFound();

  return <FichaProductoSegunRol producto={producto} />;
}

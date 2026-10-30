import { notFound } from 'next/navigation';
import { leerId, leerPack } from './consultas';
import { FichaPackSegunRol } from './fichaSegunRol';

/**
 * Ficha de pack (SCRUM-108 criterio 3, Figma › 03c Ficha de pack 2058:3302). Se arma en el
 * servidor como visitante; un pack fuera de vigencia o exclusivo responde 404. Con una cuenta
 * profesional, el navegador la vuelve a pedir con el mayorista (SCRUM-109).
 */
export async function FichaPack({ id }: { id: string }) {
  const numero = leerId(id);
  const pack = numero === null ? null : await leerPack(numero);
  if (!pack) notFound();

  return <FichaPackSegunRol pack={pack} />;
}

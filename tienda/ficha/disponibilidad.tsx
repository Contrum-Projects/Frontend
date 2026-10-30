import { Check, TriangleAlert } from 'lucide-react';
import type { Disponibilidad } from '@/compartido/api/respuestas';

interface EstadoDisponibilidadProps {
  disponibilidad: Disponibilidad;
  /**
   * Formatos del mismo producto que sí hay (criterio 2), para avisarlo cuando el elegido está
   * agotado. En un pack no se pasa.
   */
  otrosDisponibles?: string[];
}

const lista = new Intl.ListFormat('es', { type: 'conjunction' });

/** «Agotado en este formato. El de 300 ml sí está disponible.» */
const textoAgotado = (otros: string[]) => {
  if (otros.length === 0) return 'Agotado en este formato.';
  if (otros.length === 1) {
    return `Agotado en este formato. El de ${otros[0]} sí está disponible.`;
  }
  return `Agotado en este formato. Los de ${lista.format(otros)} sí están disponibles.`;
};

/**
 * Disponibilidad del formato o del pack (Figma › 03 Ficha 2007:750, agotado 2058:3096). La
 * decide el backend; no se informan cantidades. Va en una región `status` para que el lector
 * de pantalla la anuncie al cambiar de formato.
 */
export const EstadoDisponibilidad = ({
  disponibilidad,
  otrosDisponibles,
}: EstadoDisponibilidadProps) => (
  <p role="status" className="flex items-start gap-2 texto-pequeno">
    {disponibilidad === 'disponible' ? (
      <>
        <Check
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-marca-acento"
        />
        <span className="text-texto-principal">
          Disponible para despacho y retiro
        </span>
      </>
    ) : (
      <>
        <TriangleAlert
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-estado-aviso-texto"
        />
        <span className="text-estado-aviso-texto">
          {otrosDisponibles ? textoAgotado(otrosDisponibles) : 'Agotado'}
        </span>
      </>
    )}
  </p>
);

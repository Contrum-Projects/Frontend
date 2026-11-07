'use client';

import { Plus } from 'lucide-react';
import { MARCADORES_CAMPANA, type MarcadorCampana } from './marcadores';

interface MenuMarcadoresProps {
  id: string;
  /** Dónde se insertará: el último campo que tuvo el foco. */
  destino: 'asunto' | 'cuerpo';
  alInsertar: (clave: MarcadorCampana) => void;
}

/**
 * Botones para agregar un dato de quien recibe en el asunto o el cuerpo (SCRUM-150). Usan
 * `onMouseDown` con `preventDefault` para no quitarle el foco ni la selección al campo.
 */
export const MenuMarcadores = ({
  id,
  destino,
  alInsertar,
}: MenuMarcadoresProps) => (
  <div
    role="group"
    aria-labelledby={`${id}-marcadores`}
    className="flex flex-col gap-2"
  >
    <p id={`${id}-marcadores`} className="texto-leyenda text-texto-secundario">
      Agregar un dato de quien lo recibe{' '}
      <span className="sr-only">
        en el {destino === 'asunto' ? 'asunto' : 'cuerpo'}
      </span>
    </p>
    <div className="flex flex-wrap gap-2">
      {MARCADORES_CAMPANA.map(({ clave, etiqueta }) => (
        <button
          key={clave}
          type="button"
          onMouseDown={(evento) => evento.preventDefault()}
          onClick={() => alInsertar(clave)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-[1.5px] border-fondo-hueso-oscuro bg-fondo-superficie px-3 py-2 texto-etiqueta text-texto-principal transition-colors hover:border-marca-profundo focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo"
        >
          <Plus aria-hidden strokeWidth={1.75} className="size-3.5 shrink-0" />
          {etiqueta}
        </button>
      ))}
    </div>
  </div>
);

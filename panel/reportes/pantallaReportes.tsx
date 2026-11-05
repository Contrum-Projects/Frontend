'use client';

import { useMemo, useState } from 'react';
import { Chip } from '@/compartido/ui/chip';
import { CampanasDelPeriodo } from './campanasDelPeriodo';
import { CarritosDelPeriodo } from './carritosDelPeriodo';
import { ObjetivosDelPeriodo } from './objetivosDelPeriodo';
import { VentasDelPeriodo } from './ventasDelPeriodo';
import {
  hoyEnChile,
  PERIODO_INICIAL,
  type Periodo,
  rangoDelPeriodo,
} from './periodos';

const OPCIONES: { valor: Periodo; texto: string; textoCorto?: string }[] = [
  { valor: 'este-mes', texto: 'Este mes' },
  // «6 meses» en el celular (Figma P6 2042:1010)
  { valor: 'seis-meses', texto: 'Últimos 6 meses', textoCorto: '6 meses' },
];

/** Chips del período (Figma P6 2041:1301). «Desde el lanzamiento» queda pendiente (SCRUM-143). */
const SelectorPeriodo = ({
  periodo,
  alCambiar,
}: {
  periodo: Periodo;
  alCambiar: (periodo: Periodo) => void;
}) => (
  <fieldset className="flex gap-2 overflow-x-auto">
    <legend className="sr-only">Período</legend>
    {OPCIONES.map((opcion) => (
      <Chip
        key={opcion.valor}
        type="radio"
        name="periodo"
        value={opcion.valor}
        checked={periodo === opcion.valor}
        onChange={() => alCambiar(opcion.valor)}
        className="shrink-0 [&_svg]:hidden"
      >
        {opcion.textoCorto ? (
          <>
            <span className="lg:hidden">{opcion.textoCorto}</span>
            <span className="max-lg:hidden">{opcion.texto}</span>
          </>
        ) : (
          opcion.texto
        )}
      </Chip>
    ))}
  </fieldset>
);

/**
 * «Reportes» (Figma P6 2041:1229 y 2042:1010, E14): objetivos (E14-H1), ventas (E14-H2) y
 * carritos y campañas (E14-H3), todos del mismo período.
 */
export function PantallaReportes() {
  const [periodo, setPeriodo] = useState<Periodo>(PERIODO_INICIAL);
  // El día se fija al abrir la pantalla: así las consultas no cambian de clave en cada render
  const [hoy] = useState(hoyEnChile);
  const rango = useMemo(() => rangoDelPeriodo(periodo, hoy), [periodo, hoy]);

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="titulo-h2 text-texto-principal">Reportes</h1>
        <SelectorPeriodo periodo={periodo} alCambiar={setPeriodo} />
      </div>
      <ObjetivosDelPeriodo rango={rango} />
      <VentasDelPeriodo rango={rango} />
      <div className="flex flex-col gap-4 lg:gap-6 min-[85rem]:flex-row min-[85rem]:items-start min-[85rem]:gap-4">
        <CarritosDelPeriodo rango={rango} />
        <CampanasDelPeriodo rango={rango} />
      </div>
    </div>
  );
}

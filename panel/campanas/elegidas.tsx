'use client';

import { Plus, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/compartido/ui/dropdown-menu';

export interface Opcion<T extends string | number = number> {
  id: T;
  nombre: string;
}

/** Las opciones elegidas como píldoras que se quitan, y un menú para elegir varias. */
export const Elegidas = <T extends string | number>({
  titulo,
  opciones,
  elegidas,
  alCambiar,
  error,
  id,
}: {
  titulo: string;
  opciones: Opcion<T>[];
  elegidas: T[];
  alCambiar: (ids: T[]) => void;
  error?: string;
  id: string;
}) => {
  const nombre = (valorId: T) =>
    opciones.find((opcion) => opcion.id === valorId)?.nombre ??
    `${titulo} ${valorId}`;
  const alternar = (valorId: T, elegida: boolean) =>
    alCambiar(
      elegida
        ? [...elegidas, valorId]
        : elegidas.filter((elegidaId) => elegidaId !== valorId),
    );

  return (
    <>
      {elegidas.map((valorId) => (
        <span
          key={valorId}
          className="inline-flex min-h-10 items-center gap-1 rounded-full bg-marca-profundo py-2 pr-2 pl-4 texto-etiqueta text-texto-sobre-oscuro"
        >
          <span>
            <span className="sr-only">{titulo}: </span>
            {nombre(valorId)}
          </span>
          <button
            type="button"
            onClick={() => alternar(valorId, false)}
            aria-label={`Quitar ${titulo.toLowerCase()}: ${nombre(valorId)}`}
            className="-my-2 -mr-2 inline-flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-marca-acento-suave/20 focus-visible:outline-2 focus-visible:outline-marca-logo"
          >
            <X aria-hidden strokeWidth={1.75} className="size-3.5" />
          </button>
        </span>
      ))}
      {opciones.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-describedby={error ? `${id}-error` : undefined}
            className="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-full px-2 texto-etiqueta text-marca-profundo hover:bg-marca-acento-suave focus-visible:outline-2 focus-visible:outline-marca-profundo"
          >
            <Plus aria-hidden strokeWidth={1.75} className="size-3.5" />
            {titulo}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-80">
            {opciones.map((opcion) => (
              <DropdownMenuCheckboxItem
                key={opcion.id}
                checked={elegidas.includes(opcion.id)}
                // Se eligen varias sin cerrar el menú
                onSelect={(evento) => evento.preventDefault()}
                onCheckedChange={(elegida) =>
                  alternar(opcion.id, elegida === true)
                }
              >
                {opcion.nombre}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};

'use client';

import { Plus, X } from 'lucide-react';
import type {
  SegmentoCampana,
  TipoSegmento,
} from '@/compartido/api/respuestas';
import { Chip } from '@/compartido/ui/chip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/compartido/ui/dropdown-menu';

interface SelectorSegmentoProps {
  tipos: TipoSegmento[];
  valor: SegmentoCampana;
  alCambiar: (segmento: SegmentoCampana) => void;
  error?: string;
  /** Para el `aria-describedby` del error. */
  id: string;
}

/**
 * «¿A quién le llega?» (P7a 2046:1755): un tipo de segmento y, si el tipo los tiene, criterios
 * extra como la especialidad. Las opciones las entrega el backend; un valor por criterio.
 */
export const SelectorSegmento = ({
  tipos,
  valor,
  alCambiar,
  error,
  id,
}: SelectorSegmentoProps) => {
  const tipo = tipos.find((opcion) => opcion.valor === valor.tipo);
  const libres =
    tipo?.criterios.filter(
      (criterio) =>
        !valor.criterios.some((elegido) => elegido.clave === criterio.clave),
    ) ?? [];

  // Al cambiar de tipo, los criterios del anterior ya no aplican
  const elegirTipo = (nuevo: string) =>
    alCambiar({ tipo: nuevo, criterios: [] });

  const agregar = (clave: string, opcion: string) =>
    alCambiar({
      ...valor,
      criterios: [...valor.criterios, { clave, valor: opcion }],
    });

  const quitar = (clave: string) =>
    alCambiar({
      ...valor,
      criterios: valor.criterios.filter((elegido) => elegido.clave !== clave),
    });

  return (
    <fieldset
      className="flex flex-col gap-3"
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend className="mb-3 texto-etiqueta text-texto-principal lg:texto-cuerpo-fuerte">
        ¿A quién le llega?
      </legend>
      <div className="flex flex-wrap gap-2">
        {tipos.map((opcion) => (
          <Chip
            key={opcion.valor}
            type="radio"
            name={`${id}-tipo`}
            value={opcion.valor}
            checked={valor.tipo === opcion.valor}
            onChange={() => elegirTipo(opcion.valor)}
          >
            {opcion.texto}
          </Chip>
        ))}
      </div>
      {tipo && tipo.criterios.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="texto-pequeno text-texto-secundario max-lg:sr-only">
            Y además:
          </span>
          {valor.criterios.map((elegido) => {
            const criterio = tipo.criterios.find(
              (opcion) => opcion.clave === elegido.clave,
            );
            const texto =
              criterio?.opciones.find(
                (opcion) => opcion.valor === elegido.valor,
              )?.texto ?? elegido.valor;
            return (
              <span
                key={elegido.clave}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-marca-profundo py-2 pr-2 pl-4 texto-etiqueta text-texto-sobre-oscuro"
              >
                <span>
                  <span className="max-lg:sr-only">{criterio?.texto}: </span>
                  {texto}
                </span>
                <button
                  type="button"
                  onClick={() => quitar(elegido.clave)}
                  aria-label={`Quitar ${criterio?.texto ?? 'criterio'}: ${texto}`}
                  className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-marca-logo"
                >
                  <X aria-hidden strokeWidth={1.75} className="size-3.5" />
                </button>
              </span>
            );
          })}
          {libres.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-full px-2 texto-etiqueta text-marca-profundo hover:bg-marca-acento-suave focus-visible:outline-2 focus-visible:outline-marca-profundo">
                <Plus aria-hidden strokeWidth={1.75} className="size-3.5" />
                <span className="max-lg:hidden">Agregar criterio</span>
                <span className="lg:hidden">Criterio</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-80">
                {libres.map((criterio) => (
                  <DropdownMenuGroup key={criterio.clave}>
                    <DropdownMenuLabel>{criterio.texto}</DropdownMenuLabel>
                    {criterio.opciones.map((opcion) => (
                      <DropdownMenuItem
                        key={opcion.valor}
                        onSelect={() => agregar(criterio.clave, opcion.valor)}
                      >
                        {opcion.texto}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
      {error && (
        <p id={`${id}-error`} className="texto-pequeno text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
};

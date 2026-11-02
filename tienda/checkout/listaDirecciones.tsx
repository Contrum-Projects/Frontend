'use client';

import { useId, useState } from 'react';
import type { DireccionCuenta } from '@/compartido/api/respuestas';
import { Button } from '@/compartido/ui/button';
import { RadioGroup, RadioGroupItem } from '@/compartido/ui/radio-group';

export const tituloDireccion = (direccion: DireccionCuenta) =>
  `${direccion.calle} ${direccion.numero}${direccion.esPrincipal ? ' · Principal' : ''}`;

export const detalleDireccion = (direccion: DireccionCuenta) =>
  [
    direccion.referencia,
    `${direccion.comuna.nombre}, ${direccion.comuna.region.nombre}`,
  ]
    .filter(Boolean)
    .join(' · ');

/** Las direcciones de la cuenta para elegir a cuál despachar. */
export const ListaDirecciones = ({
  direcciones,
  elegida,
  alElegir,
}: {
  direcciones: DireccionCuenta[];
  elegida: number;
  alElegir: (id: number) => void;
}) => {
  const idPrefijo = useId();
  const [marcada, setMarcada] = useState(elegida);
  return (
    <div className="flex flex-col gap-3">
      <RadioGroup
        aria-label="Dirección de despacho"
        value={String(marcada)}
        onValueChange={(valor) => setMarcada(Number(valor))}
        className="gap-2"
      >
        {direcciones.map((direccion) => {
          const id = `${idPrefijo}-${direccion.id}`;
          return (
            <label
              key={direccion.id}
              htmlFor={id}
              className="flex cursor-pointer items-start gap-3 rounded-md border bg-fondo-superficie px-4 py-3 has-focus-visible:ring-[3px] has-focus-visible:ring-ring/60 has-[[data-state=checked]]:border-marca-profundo has-[[data-state=checked]]:bg-marca-acento-suave"
            >
              <RadioGroupItem
                id={id}
                value={String(direccion.id)}
                className="mt-0.5"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="texto-cuerpo-fuerte break-words text-texto-principal">
                  {tituloDireccion(direccion)}
                </span>
                <span className="texto-pequeno text-texto-secundario">
                  {detalleDireccion(direccion)}
                </span>
              </span>
            </label>
          );
        })}
      </RadioGroup>
      <Button
        variant="contorno"
        size="mediano"
        className="self-start"
        onClick={() => alElegir(marcada)}
      >
        Usar esta dirección
      </Button>
    </div>
  );
};

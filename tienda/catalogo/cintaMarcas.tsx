'use client';

import { Pause, Play } from 'lucide-react';
import Link from 'next/link';
import { useState, type CSSProperties } from 'react';
import type { MarcaTienda } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import { urlCatalogo } from '@/tienda/diseno/enlaces';

/** Marcas por vuelta: con pocas se repiten, para que la cinta cubra pantallas de 1440 px. */
const MINIMO_POR_VUELTA = 12;
/** Segundos que tarda cada marca en cruzar: la velocidad no cambia con la cantidad. */
const SEGUNDOS_POR_MARCA = 3;

interface CintaMarcasProps {
  marcas: MarcaTienda[];
  titulo: string;
}

/**
 * Cinta infinita de marcas del inicio: avanza sola y se detiene con el mouse encima, al
 * enfocar una marca o con el botón de pausa (WCAG 2.2.2). Con «reducir movimiento» queda
 * quieta y se desplaza a mano.
 */
export function CintaMarcas({ marcas, titulo }: CintaMarcasProps) {
  const [pausada, setPausada] = useState(false);

  const repeticiones = Math.ceil(MINIMO_POR_VUELTA / marcas.length);
  const vuelta = Array.from({ length: repeticiones }, () => marcas).flat();
  // Duración según el largo de la vuelta (variable CSS que lee --animate-cinta)
  const duracion = {
    '--duracion-cinta': `${vuelta.length * SEGUNDOS_POR_MARCA}s`,
  } as CSSProperties;

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-4 md:mb-6">
        <h2
          id="titulo-marcas"
          className="titulo-h3 text-texto-principal md:titulo-h2"
        >
          {titulo}
        </h2>
        <Button
          type="button"
          variant="ghost"
          size="icono"
          className="motion-reduce:hidden"
          onClick={() => setPausada((antes) => !antes)}
          aria-label={pausada ? 'Reanudar las marcas' : 'Pausar las marcas'}
        >
          {pausada ? <Play aria-hidden /> : <Pause aria-hidden />}
        </Button>
      </div>
      <div className="group -mx-4 overflow-hidden mask-x-from-90% motion-reduce:overflow-x-auto md:mx-0">
        <div
          style={duracion}
          className={cn(
            'flex w-max animate-cinta group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:animate-none',
            pausada && '[animation-play-state:paused]',
          )}
        >
          <ListaMarcas marcas={vuelta} navegables={marcas.length} />
          {/* La copia completa el bucle; los lectores de pantalla y el teclado la saltan */}
          <ListaMarcas marcas={vuelta} navegables={0} />
        </div>
      </div>
    </>
  );
}

/**
 * Una vuelta de la cinta. Solo las primeras `navegables` marcas se leen y se enfocan: las
 * repeticiones son decorado.
 */
const ListaMarcas = ({
  marcas,
  navegables,
}: {
  marcas: MarcaTienda[];
  navegables: number;
}) => (
  <ul
    aria-hidden={navegables === 0 || undefined}
    className={cn(
      'flex gap-4 pr-4',
      navegables === 0 && 'motion-reduce:hidden',
    )}
  >
    {marcas.map((marca, i) => {
      const repetida = i >= navegables;
      return (
        <li
          key={`${marca.id}-${i}`}
          aria-hidden={(navegables > 0 && repetida) || undefined}
          className={cn(
            'w-44 shrink-0',
            repetida && navegables > 0 && 'motion-reduce:hidden',
          )}
        >
          <Link
            href={urlCatalogo({ marca: marca.id })}
            tabIndex={repetida ? -1 : undefined}
            className="flex h-24 items-center justify-center rounded-lg border bg-fondo-superficie px-4 text-center titulo-h3 text-texto-secundario transition-colors hover:border-marca-profundo hover:text-marca-profundo"
          >
            {marca.nombre}
          </Link>
        </li>
      );
    })}
  </ul>
);

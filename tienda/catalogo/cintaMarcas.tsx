import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { MarcaTienda } from '@/compartido/api/respuestas';
import { cn } from '@/compartido/lib/utils';
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
 * Cinta infinita de marcas del inicio: avanza sola y se detiene con el mouse encima o al
 * enfocar una marca. Con «reducir movimiento» queda quieta y se desplaza a mano.
 */
export function CintaMarcas({ marcas, titulo }: CintaMarcasProps) {
  const repeticiones = Math.ceil(MINIMO_POR_VUELTA / marcas.length);
  const vuelta = Array.from({ length: repeticiones }, () => marcas).flat();
  // Duración según el largo de la vuelta (variable CSS que lee --animate-cinta)
  const duracion = {
    '--duracion-cinta': `${vuelta.length * SEGUNDOS_POR_MARCA}s`,
  } as CSSProperties;

  return (
    <>
      <h2
        id="titulo-marcas"
        className="mb-3 titulo-h3 text-texto-principal md:mb-6 md:titulo-h2"
      >
        {titulo}
      </h2>
      <div className="group -mx-4 overflow-hidden mask-x-from-90% motion-reduce:overflow-x-auto md:mx-0">
        <div
          style={duracion}
          className="flex w-max animate-cinta group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:animate-none"
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

'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { usePreferenciaOfertas } from './consultasOfertas';
import { TarjetaOfertas } from './tarjetaOfertas';

/**
 * 10c Ofertas por correo (Figma 2066:3690 y 2070:2703, E12-H2): el interruptor de la publicidad
 * por correo, desde cuándo está activo y qué incluye.
 */
export function PantallaOfertasCorreo() {
  return (
    <>
      <div className="flex flex-col gap-3">
        <Link
          href={RUTAS.misDatos}
          className="flex min-h-10 items-center gap-1.5 self-start texto-etiqueta text-marca-profundo hover:underline md:hidden"
        >
          <ArrowLeft className="size-4.5 stroke-[1.75]" aria-hidden />
          Mi cuenta
        </Link>
        <h1 className="titulo-h2 text-texto-principal md:titulo-h1">
          Ofertas por correo
        </h1>
      </div>
      <Contenido />
    </>
  );
}

function Contenido() {
  const preferencia = usePreferenciaOfertas();

  if (preferencia.isPending) return <EsqueletoOfertas />;
  if (preferencia.isError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p role="alert" className="texto-cuerpo text-texto-principal">
          {preferencia.error.message}
        </p>
        <Button
          variant="contorno"
          disabled={preferencia.isFetching}
          onClick={() => void preferencia.refetch()}
        >
          Reintentar
        </Button>
      </div>
    );
  }
  return <TarjetaOfertas preferencia={preferencia.data} />;
}

/** La tarjeta con el interruptor, la lista y las notas. */
const EsqueletoOfertas = () => (
  <div className="flex flex-col gap-4 rounded-lg border bg-card p-6">
    <span className="sr-only" role="status">
      Cargando tus preferencias…
    </span>
    <div className="flex items-start gap-4">
      <Skeleton aria-hidden className="h-6 w-10 rounded-full" />
      <div className="flex flex-1 flex-col gap-1">
        <Skeleton aria-hidden className="h-6 w-3/4" />
        <Skeleton aria-hidden className="h-5 w-1/2" />
      </div>
    </div>
    <Skeleton aria-hidden className="h-px w-full" />
    <Skeleton aria-hidden className="h-5 w-56" />
    {/* Las tres viñetas: la segunda ocupa dos líneas a 360 px */}
    <div className="flex flex-col gap-3">
      <Skeleton aria-hidden className="h-5 w-full" />
      <Skeleton aria-hidden className="h-10 w-full md:h-5" />
      <Skeleton aria-hidden className="h-5 w-2/3" />
    </div>
    {/* La nota de los correos de pedidos: cinco líneas a 360 px, dos en escritorio */}
    <Skeleton aria-hidden className="h-24 w-full md:h-10" />
    <Skeleton aria-hidden className="h-4 w-64 max-w-full" />
  </div>
);

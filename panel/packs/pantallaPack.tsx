'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ErrorDeApi } from '@/compartido/api/errores';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { usePack } from './consultasPacks';
import { FormularioPackPanel } from './formularioPack';
import { DisponibilidadPack, FotosPack, PreciosPack } from './tarjetasPack';

/** «← Packs» sobre el título, solo en celular (Figma P3c 2065:9091 vuelve a Productos). */
const VolverAPacks = () => (
  <Link
    href="/panel/packs"
    className="inline-flex min-h-10 items-center gap-2 self-start texto-etiqueta text-marca-profundo lg:hidden"
  >
    <ArrowLeft aria-hidden className="size-4 stroke-[1.75]" />
    Packs
  </Link>
);

/** «Pack nuevo» (Figma P3c 2065:2381 y 2065:9091, E3-H6). */
export function PantallaPackNuevo() {
  return (
    <div className="flex flex-col gap-2">
      <VolverAPacks />
      <FormularioPackPanel
        titulo={
          <h1 className="flex-1 titulo-h2 text-texto-principal">Pack nuevo</h1>
        }
        precios={<PreciosPack />}
        lateral={
          <>
            <FotosPack />
            <DisponibilidadPack />
          </>
        }
      />
    </div>
  );
}

/**
 * El pack guardado (E3-H6 criterio 3): el mismo formulario con sus datos, sus fotos, sus precios
 * y su disponibilidad. Aquí llega «Pack nuevo» al guardar.
 */
export function PantallaEditarPack({ id }: { id: string }) {
  const numero = Number(id);
  const valido = Number.isInteger(numero) && numero > 0;
  return (
    <div className="flex flex-col gap-2">
      <VolverAPacks />
      {valido ? <EditarPack id={numero} /> : <PackNoEncontrado />}
    </div>
  );
}

const PackNoEncontrado = () => (
  <div className="flex flex-col items-start gap-3">
    <h1 className="titulo-h2 text-texto-principal">Pack no encontrado</h1>
    <p className="texto-pequeno text-texto-secundario">
      No encontramos este pack.
    </p>
    <Button asChild variant="contorno">
      <Link href="/panel/packs">Ver packs</Link>
    </Button>
  </div>
);

const EditarPack = ({ id }: { id: number }) => {
  const pack = usePack(id);

  if (pack.isPending) return <EsqueletoFormularioPack />;
  if (pack.isError) {
    if (pack.error instanceof ErrorDeApi && pack.error.estado === 404) {
      return <PackNoEncontrado />;
    }
    return (
      <div className="flex flex-col gap-4">
        <h1 className="titulo-h2 text-texto-principal">Editar pack</h1>
        <Alert variant="destructive">
          <AlertDescription>{pack.error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <FormularioPackPanel
      // Se vuelve a montar si cambia el pack: parte de los datos guardados
      key={pack.data.id}
      pack={pack.data}
      titulo={
        <h1 className="min-w-0 flex-1 titulo-h2 break-words text-texto-principal">
          {pack.data.nombre}
        </h1>
      }
      precios={<PreciosPack pack={pack.data} />}
      lateral={
        <>
          <FotosPack pack={pack.data} />
          <DisponibilidadPack pack={pack.data} />
        </>
      }
    />
  );
};

const TarjetaEsqueleto = ({ alto }: { alto: string }) => (
  <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 lg:p-6">
    <Skeleton className="h-6 w-40" />
    <Skeleton className={`${alto} w-full`} />
  </div>
);

/** El título y las tarjetas en su lugar, para que nada salte al cargar (RNF-17). */
const EsqueletoFormularioPack = () => (
  <div aria-hidden className="flex flex-col gap-4 lg:gap-6">
    <Skeleton className="h-9 w-64 max-w-full" />
    <div className="grid items-start gap-4 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_372px]">
      <div className="flex flex-col gap-4 lg:gap-6">
        <TarjetaEsqueleto alto="h-40" />
        <TarjetaEsqueleto alto="h-28" />
        <TarjetaEsqueleto alto="h-32" />
      </div>
      <div className="flex flex-col gap-4 lg:gap-6">
        <TarjetaEsqueleto alto="h-40" />
        <Skeleton className="h-28 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

/** Mientras se lee el id de la ruta: con el lugar de «← Packs» en celular. */
export const EsqueletoPack = () => (
  <div className="flex flex-col gap-2">
    <div aria-hidden className="h-10 lg:hidden" />
    <EsqueletoFormularioPack />
  </div>
);

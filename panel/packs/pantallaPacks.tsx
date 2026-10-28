'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { usePacks } from './consultasPacks';
import { ListaPacksCelular, TablaPacks } from './listaPacks';

/**
 * «Packs»: los packs del catálogo con su acceso a Pack nuevo (SCRUM-105). Figma no la dibuja:
 * sigue el listado de Productos (P3a). El backend pagina y ordena por nombre.
 */
export function PantallaPacks() {
  const [pagina, setPagina] = useState(1);
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex-1 titulo-h2 text-texto-principal">Packs</h1>
        <Button asChild className="max-lg:min-h-10">
          <Link href="/panel/packs/nuevo">
            <Plus aria-hidden className="lg:hidden" />
            <span className="lg:hidden">Nuevo</span>
            <span className="max-lg:hidden">Pack nuevo</span>
          </Link>
        </Button>
      </div>
      <div className="flex flex-col gap-3 xl:rounded-lg xl:border xl:bg-card xl:p-4">
        <Resultados pagina={pagina} alCambiarPagina={setPagina} />
      </div>
    </div>
  );
}

const Resultados = ({
  pagina,
  alCambiarPagina,
}: {
  pagina: number;
  alCambiarPagina: (pagina: number) => void;
}) => {
  const packs = usePacks(pagina);

  if (packs.isPending) return <EsqueletoPacks />;
  if (packs.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{packs.error.message}</AlertDescription>
      </Alert>
    );
  }
  const { items, total, limite } = packs.data;
  if (items.length === 0) {
    return (
      <p className="py-6 text-center texto-pequeno text-texto-secundario max-xl:rounded-lg max-xl:border max-xl:bg-card">
        Aún no hay packs.
      </p>
    );
  }
  const hasta = (packs.data.pagina - 1) * limite + items.length;
  return (
    <>
      <div className="max-xl:hidden">
        <TablaPacks packs={items} />
      </div>
      <div className="rounded-lg border bg-card px-4 py-1 xl:hidden">
        <ListaPacksCelular packs={items} />
      </div>
      <nav
        aria-label="Páginas"
        className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 xl:px-3"
      >
        <p className="flex-1 texto-leyenda text-texto-secundario">
          Mostrando {hasta} de {total}
        </p>
        {packs.data.pagina > 1 && (
          <Button
            variant="link"
            className="min-h-10 texto-etiqueta"
            onClick={() => alCambiarPagina(packs.data.pagina - 1)}
          >
            ← Anterior
          </Button>
        )}
        {hasta < total && (
          <Button
            variant="link"
            className="min-h-10 texto-etiqueta"
            onClick={() => alCambiarPagina(packs.data.pagina + 1)}
          >
            Siguiente →
          </Button>
        )}
      </nav>
    </>
  );
};

const FILAS_ESQUELETO = [0, 1, 2, 3];

/** Con la forma de las filas, para que nada salte al cargar (RNF-17). */
const EsqueletoPacks = () => (
  <div
    aria-hidden
    className="flex flex-col max-xl:rounded-lg max-xl:border max-xl:bg-card max-xl:px-4 max-xl:py-1"
  >
    <div className="h-8 max-xl:hidden" />
    {FILAS_ESQUELETO.map((fila) => (
      <div
        key={fila}
        className="flex flex-col gap-1 border-t py-3 max-xl:first:border-t-0 xl:px-3"
      >
        <Skeleton className="h-4 w-48 max-w-full" />
        <Skeleton className="h-3 w-64 max-w-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    ))}
  </div>
);

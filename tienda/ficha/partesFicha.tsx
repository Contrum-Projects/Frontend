import type { ReactNode } from 'react';
import { formatearPesos } from '@/compartido/formato/moneda';
import { Skeleton } from '@/compartido/ui/skeleton';
import { DetallesFicha } from './detallesFicha';

/**
 * Página de la ficha (Figma › 03 Ficha 2007:686): galería a la izquierda e información a la
 * derecha desde md; en celular, una columna con la galería a todo el ancho.
 */
export const DisenoFicha = ({
  migas,
  galeria,
  children,
  descripcion,
  ingredientes,
}: {
  migas: ReactNode;
  galeria: ReactNode;
  children: ReactNode;
  descripcion: string;
  ingredientes?: string | null;
}) => (
  <main className="mx-auto max-w-[1440px] px-4 pt-4 pb-12 md:px-16 md:pt-6 md:pb-16">
    <div className="hidden md:block">{migas}</div>
    <div className="grid gap-6 md:mt-6 md:grid-cols-2 md:gap-8 xl:grid-cols-[minmax(0,640px)_minmax(0,1fr)] xl:gap-16">
      {galeria}
      <div className="flex min-w-0 flex-col gap-4 md:gap-6">{children}</div>
    </div>
    <DetallesFicha descripcion={descripcion} ingredientes={ingredientes} />
  </main>
);

/** Marca (o «Pack») sobre el nombre, y el nombre como único h1 de la página. */
export const TituloFicha = ({
  sobretitulo,
  nombre,
}: {
  sobretitulo?: string;
  nombre: string;
}) => (
  <div className="flex flex-col gap-2 md:gap-4">
    {sobretitulo && (
      <p className="texto-sobretitulo text-texto-secundario">{sobretitulo}</p>
    )}
    <h1 className="titulo-h2 text-texto-principal md:titulo-h1">{nombre}</h1>
  </div>
);

/**
 * Precio con IVA que entrega el backend; «IVA incluido» solo en ficha, carrito y checkout. El
 * profesional ve «c/u» porque compra desde 3 unidades (Figma 2007:1767).
 */
export const PrecioFicha = ({
  precio,
  porUnidad = false,
}: {
  precio: number;
  porUnidad?: boolean;
}) => (
  <p className="flex flex-wrap items-baseline gap-x-3">
    <span className="texto-precio-ficha-celular text-marca-profundo md:texto-precio-ficha">
      {formatearPesos(precio)}
    </span>
    <span className="texto-pequeno text-texto-secundario">
      {porUnidad ? 'c/u · IVA incluido' : 'IVA incluido'}
    </span>
  </p>
);

export const EsqueletoFicha = () => (
  <main
    aria-busy
    aria-label="Cargando"
    className="mx-auto max-w-[1440px] px-4 pt-4 pb-12 md:px-16 md:pt-6 md:pb-16"
  >
    <Skeleton className="hidden h-5 w-64 md:block" />
    <div className="grid gap-6 md:mt-6 md:grid-cols-2 md:gap-8 xl:grid-cols-[minmax(0,640px)_minmax(0,1fr)] xl:gap-16">
      <Skeleton className="-mx-4 aspect-[39/34] rounded-none md:mx-0 md:aspect-[16/15] md:rounded-xl" />
      <div className="flex flex-col gap-4 md:gap-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-10 w-40" />
        <div className="flex gap-3">
          <Skeleton className="h-16 w-24 rounded-lg" />
          <Skeleton className="h-16 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-14 w-full rounded-full" />
      </div>
    </div>
  </main>
);

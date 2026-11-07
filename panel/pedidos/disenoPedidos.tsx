'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useEsEscritorio } from '@/panel/inventario/consultasStock';
import { Buscador, ChipsFiltro } from '@/panel/inventario/filtrosInventario';
import { usePedidosPanel } from './consultasPedidos';
import { PestanasPedidos } from './pestanasPedidos';
import {
  EsqueletoPedidos,
  TablaPedidos,
  TarjetasPedidos,
} from './listaPedidos';

const sinSuscripcion = () => () => {};
const leerQDeUrl = () =>
  new URLSearchParams(window.location.search).get('q')?.trim() ?? '';

/**
 * P2 Pedidos (Figma 2028:725; celular 2023:336 y detalle 2024:333, E8-H2). Es el layout de
 * `/panel/pedidos`: la lista con su filtro y su búsqueda queda montada al abrir otro pedido.
 * En escritorio, el detalle (`children`) va al lado; en celular, con un pedido abierto solo se ve
 * el detalle.
 */
export function DisenoPedidos({ children }: { children: ReactNode }) {
  const codigo = useSelectedLayoutSegment();
  const esEscritorio = useEsEscritorio();
  const [grupo, setGrupo] = useState('');
  const [q, setQ] = useState('');
  // La búsqueda del Resumen llega como ?q= (en el servidor no hay URL: el buscador se vuelve a
  // montar con ese texto al hidratar)
  const qInicial = useSyncExternalStore(sinSuscripcion, leerQDeUrl, () => '');
  // En celular, con un pedido abierto la lista no se ve: no se pide
  const verLista = codigo === null || esEscritorio === true;
  const consulta = usePedidosPanel({ grupo, q }, verLista);

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* En el detalle de celular el título visible es el código: este queda para lectores */}
        <h1
          className={cn(
            'titulo-h2 text-texto-principal lg:flex-1',
            codigo && 'max-lg:sr-only',
          )}
        >
          Pedidos
        </h1>
        <div className={cn(codigo && 'max-lg:hidden')}>
          <Buscador
            key={qInicial}
            inicial={qInicial}
            id="buscar-pedidos"
            etiqueta="Buscar pedidos por pedido, producto o cliente"
            placeholder="Pedido, producto o cliente"
            alCambiar={setQ}
          />
        </div>
      </div>
      {/* En el detalle de celular las pestañas no se ven: no se piden sus facturas */}
      {verLista && <PestanasPedidos actual="todos" />}
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-start">
        <section
          aria-label="Lista de pedidos"
          aria-busy={consulta.isFetching || undefined}
          className={cn(
            'flex min-w-0 flex-col gap-3 lg:rounded-lg lg:border lg:bg-card lg:p-4',
            codigo && 'max-lg:hidden',
          )}
        >
          <Grupos consulta={consulta} alCambiar={setGrupo} />
          <Lista consulta={consulta} elegido={codigo} conBusqueda={q !== ''} />
        </section>
        {children}
      </div>
    </div>
  );
}

type Consulta = ReturnType<typeof usePedidosPanel>;

/** Los grupos y sus conteos vienen del backend; el marcado es el que aplicó. */
const Grupos = ({
  consulta,
  alCambiar,
}: {
  consulta: Consulta;
  alCambiar: (grupo: string) => void;
}) => {
  if (!consulta.data) {
    return consulta.isError ? null : (
      <div aria-hidden className="flex flex-wrap gap-2">
        <Skeleton className="h-10 w-32 rounded-full lg:h-8" />
        <Skeleton className="h-10 w-36 rounded-full lg:h-8" />
        <Skeleton className="h-10 w-28 rounded-full lg:h-8" />
      </div>
    );
  }
  const { grupos, grupo } = consulta.data;
  return (
    <ChipsFiltro
      etiqueta="Filtrar pedidos por estado"
      opciones={grupos.map(({ clave, nombre, cantidad }) => ({
        valor: clave,
        texto: cantidad === null ? nombre : `${nombre} · ${cantidad}`,
      }))}
      valor={grupo}
      alCambiar={alCambiar}
    />
  );
};

const Lista = ({
  consulta,
  elegido,
  conBusqueda,
}: {
  consulta: Consulta;
  elegido: string | null;
  conBusqueda: boolean;
}) => {
  if (consulta.isPending) return <EsqueletoPedidos />;
  if (consulta.isError) {
    return (
      <>
        <Alert variant="destructive">
          <AlertDescription>{consulta.error.message}</AlertDescription>
        </Alert>
        <Button
          variant="contorno"
          className="self-start"
          onClick={() => void consulta.refetch()}
        >
          Reintentar
        </Button>
      </>
    );
  }

  const { items, total } = consulta.data;
  return (
    <>
      {/* Anuncia el resultado del filtro a los lectores de pantalla */}
      <p aria-live="polite" className="sr-only">
        {total === 1 ? '1 pedido.' : `${total} pedidos.`}
      </p>
      {items.length === 0 ? (
        <p className="py-3 texto-pequeno text-texto-secundario">
          {conBusqueda
            ? 'Ningún pedido coincide con la búsqueda.'
            : 'No hay pedidos en este grupo.'}
        </p>
      ) : (
        <>
          <div className="max-lg:hidden">
            <TablaPedidos pedidos={items} elegido={elegido} />
          </div>
          <div className="lg:hidden">
            <TarjetasPedidos pedidos={items} elegido={elegido} />
          </div>
        </>
      )}
      {total > items.length && (
        <p className="texto-leyenda text-texto-secundario">
          Se muestran {items.length} de {total} pedidos: usa la búsqueda para
          encontrar otros.
        </p>
      )}
    </>
  );
};

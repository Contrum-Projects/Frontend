'use client';

import { useState } from 'react';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { CabeceraInventario } from './cabeceraInventario';
import {
  MOVIMIENTOS_SIN_FILTROS,
  useMovimientos,
  type FiltrosMovimientos,
} from './consultasStock';
import {
  Buscador,
  ChipsFiltro,
  FiltroBodega,
  FiltroFechas,
} from './filtrosInventario';
import {
  EsqueletoMovimientos,
  ListaMovimientosCelular,
  TablaMovimientos,
} from './listaMovimientos';
import { GRUPOS_MOVIMIENTOS } from './tiposMovimiento';

const ETIQUETA = 'Movimientos de inventario';

/**
 * «Inventario · Movimientos» (Figma P5d 2064:2156 y 2069:1548, E11-H5 criterio 2): entradas,
 * ventas, mermas, consumo, ajustes, transferencias y reingresos, con filtros por bodega, tipo y
 * período. Celular: también el período, que el criterio pide aunque Figma no lo muestre.
 */
export function PantallaMovimientos() {
  const [filtros, setFiltros] = useState<FiltrosMovimientos>(
    MOVIMIENTOS_SIN_FILTROS,
  );
  const cambiar = (parcial: Partial<FiltrosMovimientos>) =>
    setFiltros((actuales) => ({ ...actuales, ...parcial }));

  return (
    <div className="flex flex-col gap-4">
      <CabeceraInventario />
      <div className="flex flex-col gap-4 lg:gap-3 lg:rounded-lg lg:border lg:bg-card lg:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
          <FiltroBodega
            valor={filtros.bodegaId}
            alCambiar={(bodegaId) => cambiar({ bodegaId })}
          />
          <Buscador
            id="buscar-movimientos"
            etiqueta="Buscar movimientos por formato o referencia"
            placeholder="Formato o referencia"
            alCambiar={(buscar) => cambiar({ buscar })}
          />
          <FiltroFechas
            etiqueta="Período"
            desde={filtros.desde}
            hasta={filtros.hasta}
            alCambiar={(desde, hasta) => cambiar({ desde, hasta })}
          />
          <ChipsFiltro
            etiqueta="Tipo de movimiento"
            opciones={GRUPOS_MOVIMIENTOS}
            valor={filtros.grupo}
            alCambiar={(grupo) => cambiar({ grupo })}
          />
        </div>
        <Movimientos filtros={filtros} />
      </div>
    </div>
  );
}

const hayFiltros = (filtros: FiltrosMovimientos) =>
  Object.values(filtros).some((valor) => valor !== '');

const Movimientos = ({ filtros }: { filtros: FiltrosMovimientos }) => {
  const consulta = useMovimientos(filtros);

  if (consulta.isPending) return <EsqueletoMovimientos />;
  if (consulta.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{consulta.error.message}</AlertDescription>
      </Alert>
    );
  }

  const { items, total } = consulta.data;
  const anuncio =
    total === 1
      ? '1 movimiento encontrado.'
      : `${total} movimientos encontrados.`;

  return (
    <>
      {/* Anuncia el resultado de los filtros a los lectores de pantalla */}
      <p aria-live="polite" className="sr-only">
        {hayFiltros(filtros) && anuncio}
      </p>
      {items.length === 0 ? (
        <p className="py-3 texto-pequeno text-texto-secundario">
          {hayFiltros(filtros)
            ? 'Ningún movimiento coincide con los filtros.'
            : 'Aún no hay movimientos registrados.'}
        </p>
      ) : (
        <>
          <div className="max-lg:hidden">
            <TablaMovimientos movimientos={items} etiqueta={ETIQUETA} />
          </div>
          <div className="rounded-lg border bg-card px-4 py-1 lg:hidden">
            <ListaMovimientosCelular movimientos={items} etiqueta={ETIQUETA} />
          </div>
        </>
      )}
      <p className="texto-leyenda text-texto-secundario">
        {items.length > 0 &&
          `Mostrando ${items.length} de ${total} movimientos. `}
        Los movimientos no se editan: un error se corrige con un ajuste.
      </p>
    </>
  );
};

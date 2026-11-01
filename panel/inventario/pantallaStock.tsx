'use client';

import { useState } from 'react';
import type { StockListado } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { CabeceraInventario } from './cabeceraInventario';
import {
  MOVIMIENTOS_SIN_FILTROS,
  useEsEscritorio,
  useMovimientos,
  useStock,
  type FiltrosStock,
} from './consultasStock';
import { DetalleStock } from './detalleStock';
import { Buscador, ChipsFiltro, FiltroBodega } from './filtrosInventario';
import { EsqueletoMovimientos, TablaMovimientos } from './listaMovimientos';
import { EsqueletoStock, ListaStockCelular, TablaStock } from './listaStock';
import { nombreFormato } from './tiposMovimiento';

type Chip = 'todos' | 'bajo';

/**
 * «Inventario · Stock» (Figma P5a 2043:1300 y 2044:1067, E11-H5 criterio 1): stock por formato y
 * ubicación con último costo y proveedor. Escritorio: tabla y los últimos movimientos; celular:
 * la lista parte filtrada por «Bajo el mínimo».
 */
export function PantallaStock() {
  const esEscritorio = useEsEscritorio();
  const [bodegaId, setBodegaId] = useState('');
  const [buscar, setBuscar] = useState('');
  // Sin elegir, depende del ancho: en celular se parte por lo que hay que reponer
  const [chipElegido, setChipElegido] = useState<Chip | null>(null);
  const [detalle, setDetalle] = useState<StockListado | null>(null);

  // null mientras no se sabe el ancho: no se marca ningún chip ni se pide nada
  const chip: Chip | null =
    chipElegido ??
    (esEscritorio === null ? null : esEscritorio ? 'todos' : 'bajo');
  const filtros: FiltrosStock = {
    bodegaId,
    buscar,
    bajoMinimo: chip === 'bajo',
  };
  const consulta = useStock(filtros, chip !== null);
  const totalBajo = consulta.data?.totalBajoMinimo;

  return (
    <div className="flex flex-col gap-4">
      <CabeceraInventario />
      <div className="flex flex-col gap-4 lg:gap-3 lg:rounded-lg lg:border lg:bg-card lg:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <FiltroBodega valor={bodegaId} alCambiar={setBodegaId} />
          <Buscador
            id="buscar-stock"
            etiqueta="Buscar por formato, SKU o código de barras"
            placeholder="Formato, SKU o código de barras"
            alCambiar={setBuscar}
          />
          <ChipsFiltro
            etiqueta="Filtrar stock"
            opciones={[
              { valor: 'todos', texto: 'Todos' },
              {
                valor: 'bajo',
                texto:
                  totalBajo === undefined
                    ? 'Bajo el mínimo'
                    : `Bajo el mínimo · ${totalBajo}`,
              },
            ]}
            valor={chip}
            alCambiar={setChipElegido}
          />
        </div>
        <Stock
          consulta={consulta}
          vacio={
            buscar !== '' || bodegaId !== ''
              ? 'Ningún formato coincide con los filtros.'
              : chip === 'bajo'
                ? 'Ningún formato está bajo el mínimo.'
                : 'Aún no hay formatos en el catálogo.'
          }
          conFiltros={buscar !== '' || bodegaId !== '' || chip === 'bajo'}
          alVer={setDetalle}
        />
      </div>
      {/* Tras el stock: si no, la tabla al cargar la empujaría hacia abajo (RNF-17) */}
      {esEscritorio && consulta.isSuccess && (
        <UltimosMovimientos bodegaId={bodegaId} />
      )}
      <DetalleStock
        formato={
          detalle && {
            formatoId: detalle.formatoId,
            titulo: nombreFormato(detalle),
          }
        }
        alCerrar={() => setDetalle(null)}
      />
    </div>
  );
}

const Stock = ({
  consulta,
  conFiltros,
  vacio,
  alVer,
}: {
  consulta: ReturnType<typeof useStock>;
  conFiltros: boolean;
  /** Qué decir si no llega ningún formato. */
  vacio: string;
  alVer: (fila: StockListado) => void;
}) => {
  if (consulta.isPending) return <EsqueletoStock />;
  if (consulta.isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{consulta.error.message}</AlertDescription>
      </Alert>
    );
  }

  const { items, total } = consulta.data;
  const anuncio =
    total === 1 ? '1 formato encontrado.' : `${total} formatos encontrados.`;

  return (
    <>
      {/* Anuncia el resultado de los filtros a los lectores de pantalla */}
      <p aria-live="polite" className="sr-only">
        {conFiltros && anuncio}
      </p>
      {items.length === 0 ? (
        <p className="py-3 texto-pequeno text-texto-secundario">{vacio}</p>
      ) : (
        <>
          <div className="max-lg:hidden">
            <TablaStock filas={items} alVer={alVer} />
          </div>
          <div className="rounded-lg border bg-card px-4 py-1 lg:hidden">
            <ListaStockCelular filas={items} alVer={alVer} />
          </div>
        </>
      )}
      {total > items.length && (
        <p className="texto-leyenda text-texto-secundario">
          Se muestran {items.length} de {total} formatos: usa la búsqueda para
          encontrar otros.
        </p>
      )}
    </>
  );
};

const ULTIMOS = 5;

/** «Últimos movimientos» bajo la tabla, solo en escritorio (Figma P5a 2043:1520). */
const UltimosMovimientos = ({ bodegaId }: { bodegaId: string }) => {
  const consulta = useMovimientos(
    { ...MOVIMIENTOS_SIN_FILTROS, bodegaId },
    { limite: ULTIMOS },
  );

  return (
    <section
      aria-labelledby="ultimos-movimientos"
      className="flex flex-col gap-3 rounded-lg border bg-card p-4"
    >
      <h2 id="ultimos-movimientos" className="texto-cuerpo-fuerte">
        Últimos movimientos
      </h2>
      {consulta.isPending && (
        <EsqueletoMovimientos celular={false} filas={ULTIMOS} />
      )}
      {consulta.isError && (
        <Alert variant="destructive">
          <AlertDescription>{consulta.error.message}</AlertDescription>
        </Alert>
      )}
      {consulta.isSuccess &&
        (consulta.data.items.length === 0 ? (
          <p className="texto-pequeno text-texto-secundario">
            Aún no hay movimientos registrados.
          </p>
        ) : (
          <TablaMovimientos
            movimientos={consulta.data.items}
            etiqueta="Últimos movimientos"
          />
        ))}
    </section>
  );
};

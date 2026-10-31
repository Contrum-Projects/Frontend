'use client';

import { Check, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormatoParaPack } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Badge } from '@/compartido/ui/badge';
import { Input } from '@/compartido/ui/input';
import { Label } from '@/compartido/ui/label';
import { Skeleton } from '@/compartido/ui/skeleton';
import { PanelLateral } from '@/panel/catalogo/panelLateral';
import { useFormatosParaPack } from './consultasPacks';

/** Espera tras la última tecla antes de buscar, para no pedir una búsqueda por letra. */
const ESPERA_BUSQUEDA_MS = 300;

export const AVISO_SOLO_FORMATOS =
  'Solo se agregan formatos de producto; un pack no puede contener otro pack.';

/** «Shampoo reparador · 300 ml», como en Figma (P3c 2065:2614). */
export const nombreDelFormato = (formato: {
  nombreFormato: string;
  producto: { nombre: string };
}) => `${formato.producto.nombre} · ${formato.nombreFormato}`;

/**
 * Panel «Agregar formato» (E3-H6 criterio 2; también en la entrada de inventario, E11-H2).
 * Figma no lo dibuja: sigue el panel lateral del catálogo. La búsqueda la hace el backend y solo
 * devuelve formatos de producto.
 */
export function BuscadorFormatos({
  abierto,
  alCambiarAbierto,
  agregados,
  alAgregar,
  destino = 'el pack',
  aviso = AVISO_SOLO_FORMATOS,
}: {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
  /** Ids de los formatos que ya están agregados. */
  agregados: number[];
  alAgregar: (formato: FormatoParaPack) => void;
  /** Dónde se agregan, para «… ya está en el pack». */
  destino?: string;
  /** Texto bajo el buscador; `null` lo omite. */
  aviso?: string | null;
}) {
  return (
    <PanelLateral
      titulo="Agregar formato"
      abierto={abierto}
      alCambiarAbierto={alCambiarAbierto}
    >
      {abierto && (
        <Busqueda
          agregados={agregados}
          alAgregar={alAgregar}
          destino={destino}
          aviso={aviso}
        />
      )}
    </PanelLateral>
  );
}

const Busqueda = ({
  agregados,
  alAgregar,
  destino,
  aviso,
}: {
  agregados: number[];
  alAgregar: (formato: FormatoParaPack) => void;
  destino: string;
  aviso: string | null;
}) => {
  const [texto, setTexto] = useState('');
  const [buscar, setBuscar] = useState('');
  useEffect(() => {
    const espera = setTimeout(
      () => setBuscar(texto.trim()),
      ESPERA_BUSQUEDA_MS,
    );
    return () => clearTimeout(espera);
  }, [texto]);
  const formatos = useFormatosParaPack(buscar, true);
  const lista = formatos.data?.items ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="buscar-formato">Buscar formato</Label>
        <Input
          id="buscar-formato"
          type="search"
          autoComplete="off"
          placeholder="Producto, formato o SKU"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
        />
      </div>
      {aviso && <p className="texto-leyenda text-texto-secundario">{aviso}</p>}
      {formatos.isPending && <EsqueletoResultados />}
      {formatos.isError && (
        <Alert variant="destructive">
          <AlertDescription>{formatos.error.message}</AlertDescription>
        </Alert>
      )}
      {formatos.isSuccess && lista.length === 0 && (
        <p role="status" className="texto-pequeno text-texto-secundario">
          No encontramos formatos con esa búsqueda.
        </p>
      )}
      {lista.length > 0 && (
        <ul aria-label="Formatos encontrados" className="flex flex-col">
          {lista.map((formato) => (
            <li key={formato.formatoId} className="border-t first:border-t-0">
              <ResultadoFormato
                formato={formato}
                agregado={agregados.includes(formato.formatoId)}
                alAgregar={() => alAgregar(formato)}
                destino={destino}
              />
            </li>
          ))}
        </ul>
      )}
      {formatos.isSuccess && formatos.data.total > lista.length && (
        <p className="texto-leyenda text-texto-secundario">
          Hay más formatos: escribe para acotar la búsqueda.
        </p>
      )}
    </div>
  );
};

const ResultadoFormato = ({
  formato,
  agregado,
  alAgregar,
  destino,
}: {
  formato: FormatoParaPack;
  agregado: boolean;
  alAgregar: () => void;
  destino: string;
}) => {
  const nombre = nombreDelFormato(formato);
  const idDetalle = `formato-${formato.formatoId}-detalle`;
  return (
    // aria-disabled y no disabled: al agregarlo, el foco se queda en el botón
    <button
      type="button"
      aria-disabled={agregado}
      aria-label={
        agregado ? `${nombre} ya está en ${destino}` : `Agregar ${nombre}`
      }
      aria-describedby={idDetalle}
      onClick={agregado ? undefined : alAgregar}
      className="flex w-full items-center gap-3 rounded-sm px-2 py-3 text-left hover:bg-marca-acento-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo aria-disabled:cursor-default aria-disabled:hover:bg-transparent"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="min-w-0 texto-pequeno break-words text-texto-principal">
            {nombre}
          </span>
          {formato.canalVenta === 'profesional' && (
            <Badge variant="secondary" className="texto-leyenda">
              Exclusivo
            </Badge>
          )}
        </span>
        <span id={idDetalle} className="texto-leyenda text-texto-secundario">
          {formato.canalVenta === 'profesional' && (
            <span className="sr-only">Exclusivo para profesionales. </span>
          )}
          {formato.sku} · Stock{' '}
          {formato.stockTotal === undefined ? 'sin dato' : formato.stockTotal}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 texto-etiqueta text-marca-profundo">
        {agregado ? (
          <>
            <Check aria-hidden className="size-4" />
            Agregado
          </>
        ) : (
          <>
            <Plus aria-hidden className="size-4" />
            Agregar
          </>
        )}
      </span>
    </button>
  );
};

const EsqueletoResultados = () => (
  <div aria-hidden className="flex flex-col gap-3">
    {[0, 1, 2].map((fila) => (
      <div key={fila} className="flex flex-col gap-1 py-2">
        <Skeleton className="h-5 w-56 max-w-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    ))}
  </div>
);

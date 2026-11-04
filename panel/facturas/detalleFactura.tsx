'use client';

import { ArrowLeft, File as IconoArchivo } from 'lucide-react';
import Link from 'next/link';
import { useId, useRef, type ReactNode } from 'react';
import { errorDeApi } from '@/compartido/api/errores';
import type { DetalleFacturaGestion } from '@/compartido/api/respuestas';
import { formatearDia } from '@/compartido/formato/fecha';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  esCodigoPedido,
  esNoEncontrado,
} from '@/tienda/pedidos/consultasPedidos';
import {
  useDescargarFacturaPanel,
  useDetalleFactura,
} from './consultasFacturas';
import { FormularioFactura } from './formularioFactura';
import { DatosReceptor } from './datosReceptor';
import { EstadoFactura } from './listaFacturas';

const RUTA_FACTURAS = '/panel/pedidos/facturas';

/** En escritorio, la tarjeta al lado de la lista; en celular, su propia pantalla (Figma 2051:1443). */
const TARJETA =
  'flex flex-col gap-4 lg:gap-3 lg:rounded-lg lg:border lg:bg-card lg:p-4';

/**
 * E9-H3, criterios 2 y 3 · La factura del pedido: los datos para emitirla en el SII y, mientras
 * está por emitir, el formulario para registrarla. Ya emitida, su folio, su fecha y la descarga.
 */
export function DetalleFacturaPanel({ codigo }: { codigo: string }) {
  const consulta = useDetalleFactura(codigo);

  if (!esCodigoPedido(codigo)) return <SinFactura codigo={codigo} />;
  if (consulta.isPending) return <EsqueletoDetalleFactura />;
  if (consulta.isError) {
    if (esNoEncontrado(consulta.error)) return <SinFactura codigo={codigo} />;
    return (
      <div className={TARJETA}>
        <Volver codigo={codigo} />
        <Alert variant="destructive">
          <AlertDescription>
            {consulta.error.message || errorDeApi(undefined).message}
          </AlertDescription>
        </Alert>
        <Button
          variant="contorno"
          className="self-start"
          onClick={() => void consulta.refetch()}
        >
          Reintentar
        </Button>
      </div>
    );
  }
  return <Detalle factura={consulta.data} />;
}

/** Celular: «← CP-10489» vuelve a la lista de facturas (Figma 2051:1443). */
const Volver = ({ codigo }: { codigo: string }) => (
  <Link
    href={RUTA_FACTURAS}
    className="flex min-h-10 items-center gap-2 self-start texto-etiqueta wrap-anywhere text-marca-profundo hover:underline lg:hidden"
  >
    <ArrowLeft className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
    <span>
      <span className="sr-only">Volver a las facturas · </span>
      {codigo}
    </span>
  </Link>
);

const SinFactura = ({ codigo }: { codigo: string }) => (
  <div className={TARJETA}>
    <Volver codigo={codigo} />
    <h2 className="titulo-h3 text-texto-principal">
      No encontramos este pedido
    </h2>
    <p className="texto-pequeno text-texto-secundario">
      Revisa el código o elígelo en la lista.
    </p>
  </div>
);

const Detalle = ({ factura }: { factura: DetalleFacturaGestion }) => {
  const idTitulo = useId();
  const titulo = useRef<HTMLHeadingElement>(null);
  const porEmitir = factura.estado === 'por_emitir';
  return (
    <article aria-labelledby={idTitulo} className={TARJETA}>
      <Volver codigo={factura.codigoPedido} />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2
          ref={titulo}
          id={idTitulo}
          tabIndex={-1}
          className="min-w-0 titulo-h2 wrap-anywhere text-texto-principal focus:outline-none lg:titulo-h3"
        >
          <span className="lg:hidden">
            {porEmitir ? 'Registrar factura' : 'Factura registrada'}
          </span>
          <span className="max-lg:hidden">
            Factura de {factura.codigoPedido}
          </span>
        </h2>
        <EstadoFactura estado={factura.estado} folio={factura.folio} />
      </header>
      <DatosReceptor factura={factura} />
      {porEmitir ? (
        <FormularioFactura
          codigoPedido={factura.codigoPedido}
          // La tarjeta vuelve como emitida: el foco no se pierde con el formulario
          alRegistrar={() => titulo.current?.focus()}
        />
      ) : (
        <FacturaEmitida factura={factura} />
      )}
    </article>
  );
};

const Dato = ({ texto, children }: { texto: string; children: ReactNode }) => (
  <div className="flex justify-between gap-4 texto-pequeno text-texto-principal">
    <dt className="text-texto-secundario">{texto}</dt>
    <dd className="text-right wrap-anywhere">{children}</dd>
  </div>
);

/** Ya registrada: folio, fecha y el PDF que se subió, para revisarlo (decisión del 4-11-2026). */
const FacturaEmitida = ({ factura }: { factura: DetalleFacturaGestion }) => {
  const descarga = useDescargarFacturaPanel(factura.codigoPedido);
  return (
    <div className="flex flex-col gap-3 max-lg:rounded-lg max-lg:border max-lg:bg-card max-lg:p-4">
      <dl className="flex flex-col gap-2">
        {factura.fechaEmision && (
          <Dato texto="Fecha de emisión">
            {formatearDia(factura.fechaEmision)}
          </Dato>
        )}
      </dl>
      <Button
        type="button"
        variant="contorno"
        className="w-full gap-2 aria-disabled:opacity-50"
        // aria-disabled y no disabled: el botón conserva el foco y se lee «Descargando…»
        aria-disabled={descarga.isPending}
        onClick={() => {
          if (!descarga.isPending) descarga.mutate();
        }}
      >
        <IconoArchivo className="size-4.5" strokeWidth={1.75} aria-hidden />
        {descarga.isPending ? 'Descargando…' : 'Descargar factura'}
      </Button>
      {descarga.isError && (
        <p role="alert" className="texto-pequeno text-estado-error">
          {descarga.error.message}
        </p>
      )}
    </div>
  );
};

/** Escritorio, sin pedido elegido: el lugar de la tarjeta con la indicación. */
export const SinFacturaElegida = () => (
  <div className="hidden rounded-lg border bg-card p-4 lg:block">
    <p className="texto-pequeno text-texto-secundario">
      Elige un pedido para registrar su factura.
    </p>
  </div>
);

/** Con la estructura de la tarjeta, para que nada salte al cargar (RNF-17). */
export const EsqueletoDetalleFactura = () => (
  <div aria-hidden className={TARJETA}>
    <Skeleton className="h-10 w-28 lg:hidden" />
    <div className="flex items-center justify-between">
      <Skeleton className="h-9 w-56 lg:h-7" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <Skeleton className="h-36 w-full rounded-lg lg:h-48" />
    <Skeleton className="h-20 w-full rounded-md" />
    <Skeleton className="h-18 w-full rounded-md" />
    <Skeleton className="h-4 w-64 max-lg:hidden" />
    <Skeleton className="h-14 w-full rounded-full" />
  </div>
);

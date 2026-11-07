'use client';

import { ArrowLeft, Store, Truck } from 'lucide-react';
import Link from 'next/link';
import { useId, useRef, type ReactNode } from 'react';
import { errorDeApi } from '@/compartido/api/errores';
import type {
  DetallePedidoGestion,
  LineaPedido,
} from '@/compartido/api/respuestas';
import { formatearDiaHora } from '@/compartido/formato/fecha';
import { formatearPesos } from '@/compartido/formato/moneda';
import { cn } from '@/compartido/lib/utils';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  esCodigoPedido,
  esNoEncontrado,
} from '@/tienda/pedidos/consultasPedidos';
import { textoDireccion } from '@/tienda/pedidos/entregaPedido';
import { EstadoPedido, etiquetaEstado } from '@/tienda/pedidos/estadoPedido';
import { CancelarPedido } from './cancelarPedido';
import { useDetallePedidoPanel } from './consultasPedidos';
import { FormularioEstado } from './formularioEstado';

/**
 * Cada bloque del detalle: en celular, una tarjeta propia (Figma 2024:333); en escritorio, dentro
 * de la tarjeta del detalle, separado por una línea (Figma 2028:943).
 */
const BLOQUE =
  'flex flex-col gap-3 max-lg:rounded-lg max-lg:border max-lg:bg-card max-lg:p-4 lg:border-t lg:pt-3 lg:first:border-t-0 lg:first:pt-0';

/**
 * E8-H2, criterios 1 a 3 · El detalle del pedido en el panel: cliente, entrega, productos,
 * cambio de estado e historial. En escritorio va al lado de la lista; en celular, en su propia
 * pantalla con «Pedidos» para volver.
 */
export function DetallePedidoPanel({ codigo }: { codigo: string }) {
  const consulta = useDetallePedidoPanel(codigo);

  if (!esCodigoPedido(codigo)) return <SinPedido />;
  if (consulta.isPending) return <EsqueletoDetallePanel />;
  if (consulta.isError) {
    if (esNoEncontrado(consulta.error)) return <SinPedido />;
    return (
      <Contenedor>
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
      </Contenedor>
    );
  }
  return <Detalle pedido={consulta.data} />;
}

const Contenedor = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-4 lg:gap-3 lg:rounded-lg lg:border lg:bg-card lg:p-4">
    <VolverAPedidos />
    {children}
  </div>
);

const VolverAPedidos = () => (
  <Link
    href="/panel/pedidos"
    className="flex min-h-10 items-center gap-2 self-start texto-etiqueta text-marca-profundo hover:underline lg:hidden"
  >
    <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
    Pedidos
  </Link>
);

const SinPedido = () => (
  <Contenedor>
    <h2 className="titulo-h3 text-texto-principal">
      No encontramos este pedido
    </h2>
    <p className="texto-pequeno text-texto-secundario">
      Revisa el código o búscalo en la lista.
    </p>
  </Contenedor>
);

const Detalle = ({ pedido }: { pedido: DetallePedidoGestion }) => {
  const idTitulo = useId();
  const titulo = useRef<HTMLHeadingElement>(null);
  return (
    <article
      aria-labelledby={idTitulo}
      className="flex flex-col gap-4 lg:gap-3 lg:rounded-lg lg:border lg:bg-card lg:p-4"
    >
      <VolverAPedidos />
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2
          ref={titulo}
          id={idTitulo}
          tabIndex={-1}
          className="min-w-0 titulo-h2 wrap-anywhere text-texto-principal lg:titulo-h3"
        >
          {pedido.codigoPublico}
        </h2>
        <EstadoPedido estado={pedido.estado} />
      </header>
      <div className="flex flex-col gap-4 lg:gap-3">
        <Cliente pedido={pedido} />
        <Productos pedido={pedido} />
        {pedido.cambiosPermitidos.length > 0 && (
          <div className={BLOQUE}>
            {/* Con otro estado llegan otros cambios: el formulario parte de nuevo */}
            <FormularioEstado
              key={pedido.estado}
              codigoPedido={pedido.codigoPublico}
              cambios={pedido.cambiosPermitidos}
            />
          </div>
        )}
        {pedido.sePuedeCancelar && (
          <div className={BLOQUE}>
            <CancelarPedido
              codigoPedido={pedido.codigoPublico}
              alTerminar={() => titulo.current?.focus()}
            />
          </div>
        )}
        <Historial historial={pedido.historial} />
      </div>
    </article>
  );
};

const Cliente = ({ pedido }: { pedido: DetallePedidoGestion }) => {
  const { cliente, envio } = pedido;
  const Icono = envio ? Truck : Store;
  return (
    <section aria-label="Cliente y entrega" className={BLOQUE}>
      <div className="flex flex-col gap-1">
        <p className="texto-etiqueta wrap-break-word text-texto-principal max-lg:texto-cuerpo-fuerte">
          {cliente.nombre}
        </p>
        <p className="texto-leyenda wrap-break-word text-texto-secundario max-lg:texto-pequeno">
          {[cliente.correo, cliente.telefono].filter(Boolean).join(' · ')}
        </p>
      </div>
      <p className="flex items-center gap-2 texto-leyenda text-texto-principal max-lg:texto-pequeno">
        <Icono className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <span className="wrap-break-word">
          {envio ? `Despacho · ${textoDireccion(envio)}` : 'Retiro en tienda'}
        </span>
      </p>
      {envio?.codigoSeguimiento && (
        <p className="texto-leyenda text-texto-secundario max-lg:texto-pequeno">
          Código de seguimiento: {envio.codigoSeguimiento}
        </p>
      )}
    </section>
  );
};

/** «1 × Shampoo reparador · 300 ml». */
const textoLinea = (linea: LineaPedido) =>
  `${linea.cantidad} × ${[linea.nombre, linea.nombreFormato].filter(Boolean).join(' · ')}`;

const Fila = ({
  texto,
  monto,
  className,
}: {
  texto: string;
  monto: number;
  className?: string;
}) => (
  <div
    className={cn(
      'flex justify-between gap-4 texto-pequeno text-texto-principal',
      className,
    )}
  >
    <dt className="min-w-0 wrap-break-word">{texto}</dt>
    <dd className="shrink-0 tabular-nums">{formatearPesos(monto)}</dd>
  </div>
);

/** Los montos vienen del backend: el frontend no suma nada (RNF-03). */
const Productos = ({ pedido }: { pedido: DetallePedidoGestion }) => {
  const idTitulo = useId();
  return (
    <section aria-labelledby={idTitulo} className={BLOQUE}>
      {/* Figma solo lo titula en celular */}
      <h3
        id={idTitulo}
        className="texto-cuerpo-fuerte text-texto-principal lg:sr-only"
      >
        Productos
      </h3>
      <dl className="flex flex-col gap-3">
        {pedido.items.map((linea) => (
          <Fila
            key={`${linea.tipo}-${linea.articuloId}`}
            texto={textoLinea(linea)}
            monto={linea.subtotal}
          />
        ))}
        {pedido.envio && <Fila texto="Despacho" monto={pedido.envio.costo} />}
        {pedido.montos.descuento > 0 && (
          <Fila
            texto={`Cupón${pedido.cupon ? ` ${pedido.cupon}` : ''}`}
            monto={-pedido.montos.descuento}
          />
        )}
        <Fila
          texto="Total"
          monto={pedido.montos.total}
          className="texto-cuerpo-fuerte"
        />
      </dl>
    </section>
  );
};

/** E8-H2, criterio 2 · Cada cambio con su fecha y quién lo hizo; el más reciente arriba (Figma). */
const Historial = ({
  historial,
}: {
  historial: DetallePedidoGestion['historial'];
}) => {
  const idTitulo = useId();
  if (historial.length === 0) return null;
  return (
    <section aria-labelledby={idTitulo} className={BLOQUE}>
      <h3 id={idTitulo} className="texto-cuerpo-fuerte text-texto-principal">
        Historial
      </h3>
      <ol className="flex flex-col gap-3">
        {historial.toReversed().map((cambio) => (
          <li
            key={`${cambio.estado}-${cambio.fecha}`}
            className="flex flex-col gap-1"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <span className="texto-pequeno text-texto-principal">
                {etiquetaEstado(cambio.estado)}
              </span>
              <span className="texto-leyenda text-texto-secundario">
                <time dateTime={cambio.fecha}>
                  {formatearDiaHora(cambio.fecha)}
                </time>
                {` · ${cambio.realizadoPor}`}
              </span>
            </div>
            {cambio.comentario && (
              <p className="texto-leyenda wrap-break-word text-texto-secundario">
                {cambio.comentario}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
};

/** Desktop, sin pedido elegido: el lugar del detalle con la indicación (decisión del 4-11-2026). */
export const SinPedidoElegido = () => (
  <div className="hidden rounded-lg border bg-card p-4 lg:block">
    <p className="texto-pequeno text-texto-secundario">
      Elige un pedido para ver su detalle.
    </p>
  </div>
);

/** Con la estructura del detalle, para que nada salte al cargar (RNF-17). */
export const EsqueletoDetallePanel = () => (
  <div
    aria-hidden
    className="flex flex-col gap-4 lg:gap-3 lg:rounded-lg lg:border lg:bg-card lg:p-4"
  >
    <Skeleton className="h-10 w-24 lg:hidden" />
    <div className="flex items-center justify-between">
      <Skeleton className="h-9 w-48 lg:h-7" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <Skeleton className="h-28 w-full rounded-lg lg:h-20" />
    <Skeleton className="h-36 w-full rounded-lg lg:h-28" />
    <Skeleton className="h-64 w-full rounded-lg lg:h-52" />
  </div>
);

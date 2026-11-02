'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import type { CarritoCuenta } from '@/compartido/api/respuestas';
import { ErrorDeApi } from '@/compartido/api/errores';
import { esPersonal } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Skeleton } from '@/compartido/ui/skeleton';
import { CarritoVacio } from '@/tienda/carrito/carritoVacio';
import { contarUnidades, useCarrito } from '@/tienda/carrito/consultasCarrito';
import { CuentaProtegida } from '@/tienda/cuenta/cuentaProtegida';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { ErrorProfesional } from '@/tienda/profesional/errorProfesional';
import { useConfirmarPedido } from './consultasCheckout';
import { PasosCheckout } from './pasosCheckout';
import { ResumenCheckout } from './resumenCheckout';
import { SeccionEntrega } from './seccionEntrega';
import { SeccionDocumento } from './seccionesCheckout';
import { useEntrega, type Entrega } from './useEntrega';

/**
 * Pantalla de checkout (SCRUM-118, Figma › 05 Checkout: escritorio 2010:1024, celular
 * 2010:2211). Solo con sesión: sin ella lleva a ingresar y vuelve aquí.
 */
export function PantallaCheckout() {
  return (
    <CuentaProtegida esqueleto={<EsqueletoCheckout />}>
      <Checkout />
    </CuentaProtegida>
  );
}

function Checkout() {
  const { usuario } = useSesion();
  const consulta = useCarrito();
  const confirmar = useConfirmarPedido();
  const entrega = useEntrega();
  // El resumen que se confirmó: si el pedido ya se creó, el carrito del backend viene vacío
  const [confirmado, setConfirmado] = useState<CarritoCuenta | null>(null);

  // El personal de tienda no compra: el backend le responde 403 y no se le pide el carrito
  if (esPersonal(usuario?.rol)) {
    return (
      <DisenoCheckout>
        <Alert variant="aviso">
          <AlertDescription>
            No tienes permiso para hacer esto.
          </AlertDescription>
        </Alert>
      </DisenoCheckout>
    );
  }
  if (consulta.isPending) return <EsqueletoCheckout />;
  if (consulta.isError) {
    return (
      <DisenoCheckout>
        <ErrorProfesional
          mensaje={consulta.error.message}
          onReintentar={() => void consulta.refetch()}
        />
      </DisenoCheckout>
    );
  }

  const carrito =
    confirmar.pedidoCreado && confirmado ? confirmado : consulta.data;
  const error = <ErrorConfirmacion error={confirmar.error} />;
  if (carrito.items.length === 0) {
    return (
      <DisenoCheckout>
        {error}
        <CarritoVacio />
      </DisenoCheckout>
    );
  }
  // El backend dice que el pedido no se puede crear (agotado, ya no se vende): se ajusta en el carrito
  if (!carrito.puedeCrearPedido) {
    return (
      <DisenoCheckout>
        {error}
        <Alert variant="aviso" className="flex flex-wrap items-center gap-3">
          <AlertDescription className="flex-1">
            Hay productos que debes ajustar para continuar.
          </AlertDescription>
          <VolverAlCarrito />
        </Alert>
      </DisenoCheckout>
    );
  }

  return (
    <DisenoCheckout conPasos>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:items-start lg:gap-12">
        <div className="flex flex-col gap-8 md:gap-12">
          <SeccionEntrega entrega={entrega} />
          <SeccionDocumento />
        </div>
        <div className="flex flex-col gap-4">
          {error}
          <ResumenCheckout
            carrito={carrito}
            unidades={contarUnidades(carrito)}
            despacho={despachoDelResumen(entrega)}
            bloqueado={!entrega.listaParaPagar}
            // Tras el éxito el navegador ya va hacia Mercado Pago: no se vuelve a habilitar
            enviando={confirmar.isPending || confirmar.isSuccess}
            onPagar={() => {
              if (!entrega.eleccion) return;
              setConfirmado(carrito);
              confirmar.mutate(entrega.eleccion);
            }}
          />
        </div>
      </div>
    </DisenoCheckout>
  );
}

/** Lo que el resumen muestra del despacho; sin despacho, nada (retiro en tienda). */
const despachoDelResumen = (entrega: Entrega) => {
  if (entrega.tipo !== 'despacho') return undefined;
  const { cotizacion } = entrega;
  if (cotizacion.isSuccess) return cotizacion.data;
  // Sin dirección no hay qué cotizar; con error, tampoco: no se deja como si cargara
  if (cotizacion.isError || !entrega.direccion) return 'sin-cotizar';
  return 'cotizando';
};

/**
 * E5-H3, criterio 3 · El rechazo del backend con su mensaje, que ya nombra el artículo sin stock
 * o pide confirmar el correo. Si el carrito cambió (409), lleva a ajustarlo. Un 5xx llega como
 * mensaje genérico, sin detalles técnicos.
 */
const ErrorConfirmacion = ({ error }: { error: Error | null }) => {
  if (!error) return null;
  const enCarrito = error instanceof ErrorDeApi && error.estado === 409;
  return (
    <Alert variant="aviso" className="flex flex-wrap items-center gap-3">
      <AlertDescription className="flex-1">{error.message}</AlertDescription>
      {enCarrito && <VolverAlCarrito />}
    </Alert>
  );
};

const VolverAlCarrito = () => (
  <Link
    href={RUTAS.carrito}
    className="inline-flex min-h-10 items-center gap-2 rounded-md texto-etiqueta text-marca-profundo hover:underline"
  >
    <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
    Volver al carrito
  </Link>
);

/** El título «Finalizar compra» (único h1), los pasos y el contenido debajo. */
const DisenoCheckout = ({
  conPasos = false,
  children,
}: {
  /** Los pasos solo con una compra en curso: no con el carrito vacío ni para el personal. */
  conPasos?: boolean;
  children: ReactNode;
}) => (
  <main className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 pt-6 pb-8 md:gap-6 md:px-16 md:pt-8 md:pb-16">
    <div className="flex flex-col gap-1 md:gap-4">
      <h1 className="titulo-h2 text-texto-principal md:titulo-h1">
        Finalizar compra
      </h1>
      {conPasos && <PasosCheckout />}
    </div>
    {children}
  </main>
);

/** Con el título real, para que la página tenga su h1 y no salte al cargar. */
const EsqueletoCheckout = () => (
  <DisenoCheckout conPasos>
    <div
      aria-hidden
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-12"
    >
      <div className="flex flex-col gap-8 md:gap-12">
        <div className="flex flex-col gap-3 md:gap-4">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
        <div className="flex flex-col gap-3 md:gap-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-72 rounded-xl md:h-96" />
    </div>
  </DisenoCheckout>
);

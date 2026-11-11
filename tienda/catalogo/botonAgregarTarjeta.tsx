'use client';

import { Check, Plus } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { cn } from '@/compartido/lib/utils';
import { esperarRenovacion, leerEstado } from '@/compartido/sesion/almacen';
import { esPersonal } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { Spinner } from '@/compartido/ui/spinner';
import { agregarAlCarritoNavegador } from '@/tienda/carrito/carritoNavegador';
import { useAgregarAlCarrito } from '@/tienda/carrito/consultasCarrito';
import { urlProducto } from '@/tienda/diseno/enlaces';

/** Milisegundos que el botón muestra «Agregado» antes de volver al «+». */
export const MS_AGREGADO = 1600;

interface BotonAgregarTarjetaProps {
  productoId: number;
  nombre: string;
  /** El formato que muestra la tarjeta: es el artículo que se agrega. */
  formatoId: number;
  /** Cuántos formatos hay a la venta: con más de uno se elige en la ficha. */
  formatos: number;
}

/** Píldora oscura: un «+» que al pasar el mouse se abre con su rótulo. */
const CLASE_BOTON =
  'relative z-10 inline-flex h-10 min-w-10 shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full px-2.5 texto-etiqueta whitespace-nowrap outline-none transition-[background-color,padding] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-marca-profundo focus-visible:ring-offset-2 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.75] md:group-hover:px-3.5';

/** El rótulo se abre al pasar el mouse por la tarjeta (en celular queda el ícono). */
const Rotulo = ({
  children,
  visible,
}: {
  children: string;
  visible?: boolean;
}) => (
  <span
    className={cn(
      'max-w-0 opacity-0 transition-[max-width,opacity] duration-200 ease-out motion-reduce:transition-none md:group-hover:max-w-24 md:group-hover:opacity-100',
      visible && 'max-w-24 opacity-100',
    )}
  >
    {children}
  </span>
);

/**
 * Botón de la tarjeta de producto (SCRUM-157). Con un solo formato a la venta, agrega una unidad
 * al carrito sin salir del listado y muestra «Agregado» por un momento; el contador del header
 * sube. Con varios formatos lleva a la ficha para elegir. Sin sesión, como en la ficha, va al
 * carrito del navegador (SCRUM-117). El personal de tienda no tiene carrito: no se muestra.
 */
export function BotonAgregarTarjeta({
  productoId,
  nombre,
  formatoId,
  formatos,
}: BotonAgregarTarjetaProps) {
  const { usuario } = useSesion();
  const agregarAlCarrito = useAgregarAlCarrito();
  const [esperando, setEsperando] = useState(false);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    if (!agregado) return;
    const espera = window.setTimeout(() => setAgregado(false), MS_AGREGADO);
    return () => window.clearTimeout(espera);
  }, [agregado]);

  if (usuario && esPersonal(usuario.rol)) return null;

  if (formatos > 1) {
    return (
      <Link
        href={urlProducto(productoId)}
        aria-label={`Elegir formato de ${nombre}`}
        className={cn(
          CLASE_BOTON,
          'bg-marca-profundo text-texto-sobre-oscuro hover:bg-marca-profundo/90',
        )}
      >
        <Plus aria-hidden />
        <Rotulo>Ver formatos</Rotulo>
      </Link>
    );
  }

  const ocupado = esperando || agregarAlCarrito.isPending;
  const avisarError = (mensaje: string) => toast.error(mensaje);

  const agregar = async () => {
    // Recién abierta la página, la sesión puede estar renovándose: se espera para saber quién es
    setEsperando(true);
    await esperarRenovacion();
    setEsperando(false);
    if (leerEstado().tipo !== 'activa') {
      const error = agregarAlCarritoNavegador({
        articuloId: formatoId,
        cantidad: 1,
      });
      if (error) avisarError(error);
      else setAgregado(true);
      return;
    }
    agregarAlCarrito.mutate(
      { articuloId: formatoId, cantidad: 1 },
      {
        onSuccess: () => setAgregado(true),
        onError: (fallo) => avisarError(fallo.message),
      },
    );
  };

  let contenido: ReactNode = (
    <>
      <Plus aria-hidden />
      <Rotulo>Agregar</Rotulo>
    </>
  );
  if (ocupado) contenido = <Spinner aria-hidden />;
  if (agregado) {
    contenido = (
      <>
        <Check aria-hidden />
        <Rotulo visible>Agregado</Rotulo>
      </>
    );
  }

  return (
    <button
      type="button"
      aria-label={
        agregado
          ? `${nombre} agregado al carrito`
          : `Agregar ${nombre} al carrito`
      }
      aria-live="polite"
      disabled={ocupado}
      onClick={() => {
        if (!agregado) void agregar();
      }}
      className={cn(
        CLASE_BOTON,
        agregado
          ? 'bg-marca-acento px-3.5 text-marca-profundo'
          : 'bg-marca-profundo text-texto-sobre-oscuro hover:bg-marca-profundo/90 disabled:opacity-70',
      )}
    >
      {contenido}
    </button>
  );
}

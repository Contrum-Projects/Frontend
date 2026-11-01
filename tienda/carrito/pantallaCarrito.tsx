'use client';

import { ArrowLeft, Clock } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { CarritoCuenta } from '@/compartido/api/respuestas';
import { ROLES, esPersonal } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Skeleton } from '@/compartido/ui/skeleton';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { ErrorProfesional } from '@/tienda/profesional/errorProfesional';
import { AvisoCarrito, CarritoVacio } from './carritoVacio';
import { contarUnidades, useCarrito } from './consultasCarrito';
import { LineaCarrito } from './lineaCarrito';
import { ResumenCarrito } from './resumenCarrito';
import { textoProductos, textoUnidades } from './textos';

/**
 * Pantalla del carrito (SCRUM-116, Figma › 04 Carrito: escritorio 2008:872 y 2035:2364,
 * celular 2008:1927 y 2035:4957, vacío 2060:2231). El carrito es de la cuenta: el visitante
 * ve una invitación a ingresar hasta que exista el carrito del navegador (SCRUM-117).
 */
export function PantallaCarrito() {
  const { estado, usuario } = useSesion();
  const consulta = useCarrito();

  if (estado === 'desconocida') return <EsqueletoCarrito />;
  // TODO(SCRUM-117): el carrito del visitante, guardado en el navegador
  if (estado === 'anonima') {
    return (
      <DisenoCarrito>
        <AvisoCarrito
          titulo="Ingresa para ver tu carrito"
          accion={
            <Button asChild>
              <Link
                href={
                  `${RUTAS.ingresar}?volver=${encodeURIComponent(RUTAS.carrito)}` as Route
                }
              >
                Ingresar
              </Link>
            </Button>
          }
        />
      </DisenoCarrito>
    );
  }
  // El personal de tienda no compra: el backend le responde 403 y no se le pide el carrito
  if (esPersonal(usuario?.rol)) {
    return (
      <DisenoCarrito>
        <Alert variant="aviso">
          <AlertDescription>
            No tienes permiso para hacer esto.
          </AlertDescription>
        </Alert>
      </DisenoCarrito>
    );
  }
  if (consulta.isPending) return <EsqueletoCarrito />;
  if (consulta.isError) {
    return (
      <DisenoCarrito>
        <ErrorProfesional
          mensaje={consulta.error.message}
          onReintentar={() => void consulta.refetch()}
        />
      </DisenoCarrito>
    );
  }
  if (consulta.data.items.length === 0) {
    return (
      <DisenoCarrito>
        <CarritoVacio />
      </DisenoCarrito>
    );
  }
  return (
    <CarritoConArticulos
      carrito={consulta.data}
      profesional={usuario?.rol === ROLES.PROFESIONAL}
    />
  );
}

function CarritoConArticulos({
  carrito,
  profesional,
}: {
  carrito: CarritoCuenta;
  profesional: boolean;
}) {
  const unidades = contarUnidades(carrito);
  const conProblemas = carrito.items.some((linea) => linea.impideCrearPedido);
  return (
    <DisenoCarrito
      detalle={
        <>
          <span className="hidden md:inline">
            {textoProductos(carrito.items.length)} ·{' '}
          </span>
          {textoUnidades(unidades)}
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start lg:gap-12">
        <div className="flex flex-col gap-4">
          {conProblemas && (
            <Alert variant="aviso">
              <Clock aria-hidden />
              <AlertDescription className="texto-pequeno md:texto-cuerpo-fuerte">
                Hay productos que debes ajustar para continuar.
              </AlertDescription>
            </Alert>
          )}
          <ul
            aria-label="Productos del carrito"
            className="flex flex-col gap-4"
          >
            {carrito.items.map((linea) => (
              <LineaCarrito
                key={linea.articuloId}
                linea={linea}
                profesional={profesional}
              />
            ))}
          </ul>
          <Link
            href={RUTAS.catalogo}
            className="hidden items-center gap-2 self-start rounded-md texto-etiqueta text-marca-profundo hover:underline md:inline-flex"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
            Seguir comprando
          </Link>
        </div>
        <ResumenCarrito carrito={carrito} unidades={unidades} />
      </div>
    </DisenoCarrito>
  );
}

/** El título «Tu carrito» (único h1) con el conteo al lado, y el contenido debajo. */
const DisenoCarrito = ({
  detalle,
  children,
}: {
  detalle?: ReactNode;
  children: ReactNode;
}) => (
  <main className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 pt-6 pb-8 md:gap-6 md:px-16 md:pt-8 md:pb-16">
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 md:gap-x-4">
      <h1 className="titulo-h2 text-texto-principal md:titulo-h1">
        Tu carrito
      </h1>
      {detalle && (
        <p className="texto-pequeno text-texto-secundario md:texto-cuerpo">
          {detalle}
        </p>
      )}
    </div>
    {children}
  </main>
);

/** Con el título real, para que la página tenga su h1 y no salte al cargar. */
const EsqueletoCarrito = () => (
  <DisenoCarrito>
    <div
      aria-hidden
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:gap-12"
    >
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-40 rounded-lg md:h-32" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  </DisenoCarrito>
);

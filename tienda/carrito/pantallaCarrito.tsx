'use client';

import { ArrowLeft, Clock } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { CarritoCuenta } from '@/compartido/api/respuestas';
import { ROLES, esPersonal } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Skeleton } from '@/compartido/ui/skeleton';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { ErrorProfesional } from '@/tienda/profesional/errorProfesional';
import { AvisoErrorUnion, AvisoUnion } from './avisoUnion';
import { useCarritoNavegador } from './carritoNavegador';
import { CarritoVacio } from './carritoVacio';
import {
  contarUnidades,
  useAjustesUnion,
  useCarrito,
  useCotizacionVisitante,
} from './consultasCarrito';
import { LineaCuenta, LineaVisitante } from './lineasCarrito';
import { ResumenCarrito } from './resumenCarrito';
import { textoProductos, textoUnidades } from './textos';

/**
 * Pantalla del carrito (SCRUM-116, Figma › 04 Carrito: escritorio 2008:872 y 2035:2364,
 * celular 2008:1927 y 2035:4957, vacío 2060:2231). Con sesión, el carrito de la cuenta; sin
 * sesión, el del navegador cotizado por el backend (SCRUM-117).
 */
export function PantallaCarrito() {
  const { estado, usuario } = useSesion();
  const consulta = useCarrito();
  const ajustes = useAjustesUnion();

  if (estado === 'desconocida') return <EsqueletoCarrito />;
  if (estado === 'anonima') return <CarritoVisitante />;
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
    // Si al unir se quitó todo, el aviso explica por qué quedó vacío
    return (
      <DisenoCarrito>
        <AvisoErrorUnion />
        <AvisoUnion ajustes={ajustes} />
        <CarritoVacio />
      </DisenoCarrito>
    );
  }
  const profesional = usuario?.rol === ROLES.PROFESIONAL;
  return (
    <CarritoConArticulos
      carrito={consulta.data}
      unidades={contarUnidades(consulta.data)}
      aviso={
        <>
          <AvisoErrorUnion />
          <AvisoUnion ajustes={ajustes} />
        </>
      }
    >
      {consulta.data.items.map((linea) => (
        <LineaCuenta
          key={linea.articuloId}
          linea={linea}
          profesional={profesional}
        />
      ))}
    </CarritoConArticulos>
  );
}

/**
 * E5-H2, criterio 1 · El carrito que el visitante guarda en el navegador, con los precios y el
 * stock que calcula el backend al cotizarlo. Para continuar hay que ingresar: al volver, se une
 * al de la cuenta.
 */
function CarritoVisitante() {
  const articulos = useCarritoNavegador();
  const consulta = useCotizacionVisitante(articulos);

  if (articulos.length === 0) {
    return (
      <DisenoCarrito>
        <CarritoVacio />
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
  // Mientras se cotiza un cambio se ve la cotización anterior: las líneas y el conteo son los
  // de lo guardado, y los controles esperan a la nueva cotización
  const guardadas = new Map(articulos.map((a) => [a.articuloId, a.cantidad]));
  const carrito = {
    ...consulta.data,
    items: consulta.data.items.filter((linea) =>
      guardadas.has(linea.articuloId),
    ),
  };
  return (
    <CarritoConArticulos
      carrito={carrito}
      unidades={articulos.reduce((suma, a) => suma + a.cantidad, 0)}
      destino={
        `${RUTAS.ingresar}?volver=${encodeURIComponent(RUTAS.carrito)}` as Route
      }
    >
      {carrito.items.map((linea) => (
        <LineaVisitante
          key={linea.articuloId}
          linea={linea}
          cantidad={guardadas.get(linea.articuloId) ?? linea.cantidad}
          ocupada={consulta.isFetching}
        />
      ))}
    </CarritoConArticulos>
  );
}

function CarritoConArticulos({
  carrito,
  unidades,
  aviso,
  destino,
  children,
}: {
  carrito: CarritoCuenta;
  unidades: number;
  aviso?: ReactNode;
  destino?: Route;
  /** Las líneas (<LineaCuenta> o <LineaVisitante>). */
  children: ReactNode;
}) {
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
          {aviso}
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
            {children}
          </ul>
          <Link
            href={RUTAS.catalogo}
            className="hidden items-center gap-2 self-start rounded-md texto-etiqueta text-marca-profundo hover:underline md:inline-flex"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
            Seguir comprando
          </Link>
        </div>
        <ResumenCarrito
          carrito={carrito}
          unidades={unidades}
          destino={destino}
        />
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

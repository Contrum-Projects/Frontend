'use client';

import { ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
import type { CarritoCuenta } from '@/compartido/api/respuestas';
import { formatearPesos } from '@/compartido/formato/moneda';
import { ROLES, esPersonal } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/compartido/ui/sheet';
import { Skeleton } from '@/compartido/ui/skeleton';
import { RUTAS } from '@/tienda/diseno/enlaces';
import { useCarritoNavegador } from './carritoNavegador';
import {
  contarUnidades,
  useCarrito,
  useCotizacionVisitante,
} from './consultasCarrito';
import {
  cerrarPanelCarrito,
  usePanelCarritoAbierto,
} from './estadoPanelCarrito';
import { LineaCuenta, LineaVisitante } from './lineasCarrito';
import { textoUnidades } from './textos';

/**
 * Panel lateral del carrito: se abre con el ícono del header y al agregar un producto, para ver y
 * ajustar el carrito sin dejar la página (decisión del 7 nov 2026; Figma no lo dibuja). Usa las
 * mismas líneas que la página del carrito, en su diseño de celular, y el total y si se puede
 * continuar los decide el backend, como allá. Con sesión, el carrito de la cuenta; sin sesión,
 * el del navegador cotizado por el backend.
 */
export function PanelCarrito() {
  const abierto = usePanelCarritoAbierto();
  const ruta = usePathname();

  // Al cambiar de página (por un enlace del panel o del header) el panel se cierra
  useEffect(() => {
    cerrarPanelCarrito();
  }, [ruta]);

  return (
    <Sheet
      open={abierto}
      onOpenChange={(abrir) => {
        if (!abrir) cerrarPanelCarrito();
      }}
    >
      <SheetContent className="w-full gap-0 bg-fondo-hueso p-0 sm:max-w-md">
        {abierto && <ContenidoPanel />}
      </SheetContent>
    </Sheet>
  );
}

function ContenidoPanel() {
  const { estado, usuario } = useSesion();
  if (estado === 'desconocida')
    return (
      <Marco>
        <EsqueletoLineas />
      </Marco>
    );
  if (estado === 'anonima') return <PanelVisitante />;
  // El personal de tienda no compra: el backend le responde 403 y no se le pide el carrito
  if (esPersonal(usuario?.rol)) {
    return (
      <Marco>
        <Alert variant="aviso">
          <AlertDescription>
            No tienes permiso para hacer esto.
          </AlertDescription>
        </Alert>
      </Marco>
    );
  }
  return <PanelCuenta profesional={usuario?.rol === ROLES.PROFESIONAL} />;
}

function PanelCuenta({ profesional }: { profesional: boolean }) {
  const consulta = useCarrito();
  if (consulta.isPending)
    return (
      <Marco>
        <EsqueletoLineas />
      </Marco>
    );
  if (consulta.isError) {
    return (
      <Marco>
        <Alert variant="destructive">
          <AlertDescription>{consulta.error.message}</AlertDescription>
        </Alert>
      </Marco>
    );
  }
  if (consulta.data.items.length === 0)
    return (
      <Marco>
        <Vacio />
      </Marco>
    );
  return (
    <ConArticulos
      carrito={consulta.data}
      unidades={contarUnidades(consulta.data)}
    >
      {consulta.data.items.map((linea) => (
        <LineaCuenta
          key={linea.articuloId}
          linea={linea}
          profesional={profesional}
          compacta
        />
      ))}
    </ConArticulos>
  );
}

/** Sin sesión: el carrito del navegador, con los precios y el stock que cotiza el backend. */
function PanelVisitante() {
  const articulos = useCarritoNavegador();
  const consulta = useCotizacionVisitante(articulos);
  if (articulos.length === 0)
    return (
      <Marco>
        <Vacio />
      </Marco>
    );
  if (consulta.isPending)
    return (
      <Marco>
        <EsqueletoLineas />
      </Marco>
    );
  if (consulta.isError) {
    return (
      <Marco>
        <Alert variant="destructive">
          <AlertDescription>{consulta.error.message}</AlertDescription>
        </Alert>
      </Marco>
    );
  }
  // Como en la página: las líneas son las guardadas y los controles esperan a la nueva cotización
  const guardadas = new Map(articulos.map((a) => [a.articuloId, a.cantidad]));
  const carrito = {
    ...consulta.data,
    items: consulta.data.items.filter((linea) =>
      guardadas.has(linea.articuloId),
    ),
  };
  return (
    <ConArticulos
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
          compacta
        />
      ))}
    </ConArticulos>
  );
}

function ConArticulos({
  carrito,
  unidades,
  destino = RUTAS.checkout,
  children,
}: {
  carrito: CarritoCuenta;
  unidades: number;
  /** A dónde lleva «Continuar con la compra»: el checkout, o ingresar si es un visitante. */
  destino?: Route;
  children: ReactNode;
}) {
  return (
    <>
      <Encabezado unidades={unidades} />
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <ul aria-label="Productos del carrito" className="flex flex-col gap-3">
          {children}
        </ul>
      </div>
      <SheetFooter className="mt-0 gap-3 border-t bg-fondo-superficie p-4">
        <dl className="flex items-baseline justify-between gap-4">
          <dt className="texto-cuerpo-fuerte text-texto-principal">Total</dt>
          <dd className="texto-precio text-marca-profundo tabular-nums">
            {formatearPesos(carrito.total)}
          </dd>
        </dl>
        <p className="texto-leyenda text-texto-secundario">
          IVA incluido. El despacho se calcula en el siguiente paso.
        </p>
        {carrito.puedeCrearPedido ? (
          <Button asChild size="grande" className="w-full">
            <Link href={destino} onClick={cerrarPanelCarrito}>
              Continuar con la compra
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        ) : (
          <p className="texto-pequeno text-estado-aviso-texto">
            Ajusta los productos marcados para continuar.
          </p>
        )}
        <Button asChild variant="contorno" className="w-full">
          <Link href={RUTAS.carrito} onClick={cerrarPanelCarrito}>
            Ver carrito
          </Link>
        </Button>
      </SheetFooter>
    </>
  );
}

/** El título del panel, que es su nombre accesible, con las unidades al lado. */
const Encabezado = ({ unidades }: { unidades?: number }) => (
  <SheetHeader className="flex-row flex-wrap items-baseline gap-x-3 gap-y-1 p-4 pr-14">
    <SheetTitle className="titulo-h3 font-normal text-texto-principal">
      Tu carrito
    </SheetTitle>
    <SheetDescription className="texto-pequeno text-texto-secundario">
      {unidades === undefined || unidades === 0
        ? 'Sin productos'
        : textoUnidades(unidades)}
    </SheetDescription>
  </SheetHeader>
);

/** Encabezado y contenido para los estados sin líneas (cargando, error, vacío, personal). */
const Marco = ({ children }: { children: ReactNode }) => (
  <>
    <Encabezado />
    <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
  </>
);

const Vacio = () => (
  <div className="flex flex-col items-start gap-3 rounded-lg bg-fondo-superficie p-4">
    <p className="texto-cuerpo-fuerte text-texto-principal">
      Tu carrito está vacío
    </p>
    <p className="texto-pequeno text-texto-secundario">
      Busca un producto o explora las categorías para empezar.
    </p>
    <Button asChild variant="contorno">
      <Link href={RUTAS.catalogo} onClick={cerrarPanelCarrito}>
        Ver catálogo
      </Link>
    </Button>
  </div>
);

const EsqueletoLineas = () => (
  <div aria-hidden className="flex flex-col gap-3">
    {Array.from({ length: 2 }, (_, i) => (
      <Skeleton key={i} className="h-36 rounded-lg" />
    ))}
  </div>
);

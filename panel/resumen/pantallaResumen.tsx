'use client';

import { Search } from 'lucide-react';
import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { PERMISOS, tienePermiso } from '@/compartido/sesion/roles';
import { useSesion } from '@/compartido/sesion/sesion';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useStockBajoMinimo } from '@/panel/inventario/consultasStock';
import { usePedidosPanel } from '@/panel/pedidos/consultasPedidos';
import { useSolicitudesEnRevision } from '@/panel/verificaciones/consultasVerificaciones';
import { TarjetaStockBajo } from './avisoStockBajo';
import { TARJETA } from './estilosResumen';
import {
  EsqueletoIndicador,
  GRILLA_INDICADORES,
  type Indicador,
  IndicadorResumen,
} from './indicadoresResumen';
import { PedidosRecientes } from './pedidosRecientes';

/** Los grupos del backend cuyo conteo muestra el Resumen (`GRUPOS_PEDIDOS_GESTION`). */
const GRUPO_POR_PREPARAR = 'por_preparar';
const GRUPO_LISTOS_RETIRO = 'listos_para_retiro';

/**
 * P1 Resumen del panel (Figma 2028:470; celular 2023:206). Cada parte aparece solo si el rol
 * tiene su permiso, y solo entonces se pide al backend: pedidos (`pedidos.gestionar`),
 * verificaciones en revisión (`verificacion.gestionar`) y stock bajo el mínimo
 * (`inventario.registrar`, E11-H6; sin formatos bajo el mínimo no se muestra, criterio 3). Los
 * conteos y los pedidos recientes salen de la misma lista de pedidos del backend.
 */
export function PantallaResumen() {
  const { estado, usuario } = useSesion();
  const rol = usuario?.rol;
  const verPedidos = tienePermiso(rol, PERMISOS.PEDIDOS_GESTIONAR);
  const verVerificaciones = tienePermiso(rol, PERMISOS.VERIFICACION_GESTIONAR);
  const verStock = tienePermiso(rol, PERMISOS.INVENTARIO_REGISTRAR);

  const pedidos = usePedidosPanel({ grupo: 'todos', q: '' }, verPedidos);
  const verificaciones = useSolicitudesEnRevision(verVerificaciones);
  const stock = useStockBajoMinimo(verStock);

  const cargando =
    estado === 'desconocida' ||
    (verPedidos && pedidos.isPending) ||
    (verVerificaciones && verificaciones.isPending) ||
    (verStock && stock.isPending);

  const cantidad = (clave: string) =>
    pedidos.data?.grupos.find((grupo) => grupo.clave === clave)?.cantidad ?? 0;
  const indicadores: Indicador[] = [
    ...(verPedidos && pedidos.data
      ? [
          {
            clave: 'por-preparar' as const,
            total: cantidad(GRUPO_POR_PREPARAR),
          },
          {
            clave: 'listos-retiro' as const,
            total: cantidad(GRUPO_LISTOS_RETIRO),
          },
        ]
      : []),
    ...(verVerificaciones && verificaciones.data
      ? [{ clave: 'verificaciones' as const, total: verificaciones.data.total }]
      : []),
    ...(verStock && stock.data && stock.data.length > 0
      ? [{ clave: 'stock-bajo' as const, total: stock.data.length }]
      : []),
  ];
  const conStockBajo = verStock && stock.data && stock.data.length > 0;
  const errores = [pedidos, verificaciones, stock]
    .filter((consulta) => consulta.isError)
    .map((consulta) => consulta.error?.message);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="titulo-h2 text-texto-principal lg:titulo-h1">Resumen</h1>
        {verPedidos && <BuscadorResumen />}
      </div>

      {cargando ? (
        <EsqueletoResumen />
      ) : (
        <>
          {[...new Set(errores)].map((mensaje) => (
            <Alert key={mensaje} variant="destructive">
              <AlertDescription>{mensaje}</AlertDescription>
            </Alert>
          ))}
          {indicadores.length > 0 && (
            <div className={GRILLA_INDICADORES}>
              {indicadores.map((indicador) => (
                <IndicadorResumen key={indicador.clave} {...indicador} />
              ))}
            </div>
          )}
          <Tarjetas>
            {/* En celular, stock bajo va primero (Figma 2023:206); en escritorio, a la derecha */}
            {conStockBajo && (
              <div className="lg:order-2">
                <TarjetaStockBajo formatos={stock.data} />
              </div>
            )}
            {verPedidos && pedidos.data && (
              <div className="lg:order-1">
                <PedidosRecientes pedidos={pedidos.data.items} />
              </div>
            )}
          </Tarjetas>
        </>
      )}
    </div>
  );
}

/** En escritorio, pedidos recientes ocupa más que stock bajo (Figma: 2 a 1, aprox.). */
const Tarjetas = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start lg:gap-4 [&>*:only-child]:lg:col-span-2">
    {children}
  </div>
);

/**
 * «Buscar pedido, producto o cliente» (Figma P1 2028:470, solo escritorio): lleva a Pedidos con
 * la búsqueda aplicada, que hace el backend.
 */
function BuscadorResumen() {
  const router = useRouter();
  const [texto, setTexto] = useState('');
  return (
    <form
      role="search"
      onSubmit={(evento) => {
        evento.preventDefault();
        const q = texto.trim();
        router.push(
          (q
            ? `/panel/pedidos?q=${encodeURIComponent(q)}`
            : '/panel/pedidos') as Route,
        );
      }}
      className="flex h-10 items-center gap-2 rounded-full border-[1.5px] bg-fondo-hueso px-4 focus-within:ring-[3px] focus-within:ring-ring/60 max-lg:hidden lg:w-80"
    >
      <Search
        className="size-4 shrink-0 text-texto-secundario"
        strokeWidth={1.75}
        aria-hidden
      />
      <label htmlFor="buscar-resumen" className="sr-only">
        Buscar pedido, producto o cliente
      </label>
      <input
        id="buscar-resumen"
        type="search"
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        placeholder="Buscar pedido, producto o cliente"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent texto-pequeno text-texto-principal outline-none placeholder:text-texto-secundario"
      />
    </form>
  );
}

/** Con la estructura de la página, para que nada salte al cargar (RNF-17). */
const EsqueletoResumen = () => (
  <div aria-hidden className="flex flex-col gap-6">
    <div className={GRILLA_INDICADORES}>
      {[0, 1, 2, 3].map((indice) => (
        <EsqueletoIndicador key={indice} />
      ))}
    </div>
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className={TARJETA}>
        <Skeleton className="h-6 w-40" />
        {[0, 1, 2].map((fila) => (
          <Skeleton key={fila} className="h-11" />
        ))}
      </div>
      <div className={TARJETA}>
        <Skeleton className="h-6 w-40" />
        {[0, 1, 2].map((fila) => (
          <Skeleton key={fila} className="h-11" />
        ))}
      </div>
    </div>
  </div>
);

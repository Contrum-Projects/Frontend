'use client';

import { ArrowRight, BadgeCheck, ChevronLeft, UserRound } from 'lucide-react';
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import type { CategoriaTienda } from '@/compartido/api/respuestas';
import { useSesion } from '@/compartido/sesion/sesion';
import { Skeleton } from '@/compartido/ui/skeleton';
import { useCerrarSesion } from '@/tienda/cuenta/useCerrarSesion';
import { ENLACES_AYUDA, RUTAS, urlCatalogo } from './enlaces';
import { IconoCerrarSesion } from './iconoCerrarSesion';

/** Partes del menú del celular (./menuCelular.tsx). */

export type Panel =
  | { tipo: 'principal' }
  | { tipo: 'categoria'; categoria: CategoriaTienda }
  | { tipo: 'marcas' };

interface PanelPrincipalProps {
  categorias: CategoriaTienda[];
  hayMarcas: boolean;
  alElegir: () => void;
  abrir: (panel: Panel) => void;
}

export function PanelPrincipal({
  categorias,
  hayMarcas,
  alElegir,
  abrir,
}: PanelPrincipalProps) {
  return (
    <>
      <CuentaMenu alElegir={alElegir} />
      <nav aria-label="Categorías" className="px-6 py-2">
        <ul>
          {categorias.map((categoria) => (
            <li key={categoria.id}>
              {categoria.subcategorias.length > 0 ? (
                <BotonMenu
                  onClick={() => abrir({ tipo: 'categoria', categoria })}
                >
                  {categoria.nombre}
                </BotonMenu>
              ) : (
                <EnlaceMenu
                  href={urlCatalogo({ categoria: categoria.id })}
                  alElegir={alElegir}
                >
                  {categoria.nombre}
                </EnlaceMenu>
              )}
            </li>
          ))}
          <li>
            <EnlaceMenu href={RUTAS.packs} alElegir={alElegir}>
              Packs
            </EnlaceMenu>
          </li>
          {hayMarcas && (
            <li>
              <BotonMenu onClick={() => abrir({ tipo: 'marcas' })}>
                Marcas
              </BotonMenu>
            </li>
          )}
        </ul>
      </nav>
      <div className="px-6 py-4">
        <Link
          href={RUTAS.precioProfesional}
          onClick={alElegir}
          className="flex items-center gap-3 rounded-md bg-marca-acento-suave px-4 py-3 texto-cuerpo-fuerte text-marca-profundo"
        >
          <BadgeCheck className="size-5" strokeWidth={1.75} aria-hidden />
          Precio profesional
        </Link>
      </div>
      <nav aria-label="Ayuda" className="px-6 pb-8">
        <h2 className="texto-leyenda text-texto-secundario">Ayuda</h2>
        <ul className="mt-2">
          {ENLACES_AYUDA.map((enlace) => (
            <li key={enlace.texto}>
              <Link
                href={enlace.href}
                onClick={alElegir}
                className="flex min-h-10 items-center rounded-md texto-pequeno text-texto-principal hover:underline"
              >
                {enlace.texto}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <CerrarSesionMenu alElegir={alElegir} />
    </>
  );
}

/**
 * «Cerrar sesión» al pie del menú (Figma 2060:2224), solo con sesión (E1-H3). La página sigue
 * igual, ya como visitante; si era de la cuenta, CuentaProtegida lleva al inicio.
 */
function CerrarSesionMenu({ alElegir }: { alElegir: () => void }) {
  const { usuario } = useSesion();
  const { cerrar, cerrando, error } = useCerrarSesion({ alCerrar: alElegir });

  if (!usuario) return null;

  return (
    <div className="px-6 pb-4">
      <button
        type="button"
        onClick={cerrar}
        disabled={cerrando}
        className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-md texto-pequeno text-texto-secundario hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-profundo disabled:opacity-50"
      >
        <IconoCerrarSesion className="size-5 text-texto-principal" />
        Cerrar sesión
      </button>
      {error && (
        <p role="alert" className="texto-leyenda text-estado-error">
          {error}
        </p>
      )}
    </div>
  );
}

/** Sin sesión: «Ingresar». Con sesión: el saludo y los accesos a la cuenta. */
function CuentaMenu({ alElegir }: { alElegir: () => void }) {
  const { estado, usuario } = useSesion();
  const icono = (
    <UserRound
      className="size-6 shrink-0 text-texto-principal"
      strokeWidth={1.75}
      aria-hidden
    />
  );

  if (estado === 'desconocida') {
    return (
      <div className="flex min-h-16 items-center gap-3 bg-fondo-hueso px-6 py-3">
        {icono}
        <Skeleton className="h-5 w-32" />
      </div>
    );
  }

  // Sin sesión, toda la fila es el enlace (objetivo táctil amplio)
  if (!usuario) {
    return (
      <Link
        href={RUTAS.ingresar}
        onClick={alElegir}
        className="flex min-h-16 items-center gap-3 bg-fondo-hueso px-6 py-3 texto-cuerpo-fuerte text-texto-principal hover:underline"
      >
        {icono}
        Ingresar
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-fondo-hueso px-6 py-2">
      {icono}
      <div className="flex flex-col">
        <span className="texto-cuerpo-fuerte text-texto-principal">
          Hola, {usuario.nombre}
        </span>
        <span className="flex items-center gap-1 texto-pequeno text-texto-secundario">
          <Link
            href={RUTAS.misPedidos}
            onClick={alElegir}
            className="inline-flex min-h-10 items-center rounded-md hover:underline"
          >
            Mis pedidos
          </Link>
          <span aria-hidden>·</span>
          <Link
            href={RUTAS.misDatos}
            onClick={alElegir}
            className="inline-flex min-h-10 items-center rounded-md hover:underline"
          >
            Mis datos
          </Link>
        </span>
      </div>
    </div>
  );
}

const CLASE_FILA =
  'flex w-full items-center justify-between rounded-md py-3 text-left texto-cuerpo text-texto-principal hover:text-marca-profundo';

const BotonMenu = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) => (
  <button type="button" onClick={onClick} className={CLASE_FILA}>
    {children}
    <ArrowRight className="size-[18px]" strokeWidth={1.75} aria-hidden />
  </button>
);

export const EnlaceMenu = ({
  href,
  alElegir,
  destacado = false,
  children,
}: {
  href: ComponentProps<typeof Link>['href'];
  alElegir: () => void;
  destacado?: boolean;
  children: ReactNode;
}) => (
  <Link
    href={href}
    onClick={alElegir}
    className={destacado ? `${CLASE_FILA} texto-cuerpo-fuerte` : CLASE_FILA}
  >
    {children}
  </Link>
);

export const PanelSecundario = ({
  titulo,
  volver,
  children,
}: {
  titulo: string;
  volver: () => void;
  children: ReactNode;
}) => (
  <nav aria-label={titulo} className="px-6 py-2">
    <button
      type="button"
      onClick={volver}
      className="flex min-h-10 items-center gap-1 rounded-md texto-etiqueta text-marca-profundo"
    >
      <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden />
      Volver
    </button>
    <h2 className="mt-2 mb-2 titulo-h3 text-texto-principal">{titulo}</h2>
    <ul>{children}</ul>
  </nav>
);

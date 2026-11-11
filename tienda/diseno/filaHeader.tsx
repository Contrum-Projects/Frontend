'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Logo } from '@/compartido/marca/logo';
import { Buscador } from './buscador';
import { RUTAS } from './enlaces';
import { CLASE_ICONO_HEADER } from './estilosHeader';

interface FilaHeaderProps {
  /** Botón del menú del celular; se ve bajo `lg`. */
  menuCelular: ReactNode;
  /** Categorías en línea; se ven desde `lg`. Vienen del servidor dentro de <Suspense>. */
  categorias: ReactNode;
  /** Cuenta y carrito, a la derecha del botón de buscar. */
  acciones: ReactNode;
}

/**
 * La fila única del header: [menú] [logo] [categorías] [buscar] [cuenta] [carrito]. El botón
 * de buscar abre el campo en el lugar de las categorías (en celular, sobre toda la fila); se
 * cierra con la X, con Esc o al salir de él sin texto.
 */
export function FilaHeader({
  menuCelular,
  categorias,
  acciones,
}: FilaHeaderProps) {
  const [buscando, setBuscando] = useState(false);
  const botonBuscar = useRef<HTMLButtonElement>(null);
  const devolverFoco = useRef(false);

  // El botón vuelve a existir después del render que cierra el buscador
  useEffect(() => {
    if (buscando || !devolverFoco.current) return;
    devolverFoco.current = false;
    botonBuscar.current?.focus();
  }, [buscando]);

  const cerrarBusqueda = (conFoco: boolean) => {
    devolverFoco.current = conFoco;
    setBuscando(false);
  };

  return (
    <div className="relative mx-auto flex h-16 max-w-[1440px] items-center gap-2 px-4 lg:h-[72px] lg:gap-6 lg:px-8 xl:px-16">
      <div className="lg:hidden">{menuCelular}</div>
      <Link href={RUTAS.inicio} className="shrink-0 rounded-md text-marca-logo">
        <Logo className="h-auto w-[92px] lg:w-[118px]" />
      </Link>
      <nav
        aria-label="Categorías"
        className={cn('hidden min-w-0 flex-1 lg:flex', buscando && 'lg:hidden')}
      >
        {categorias}
      </nav>
      {buscando && (
        <Buscador
          id="buscar-header"
          placeholder="Busca por producto, marca o categoría"
          alCerrar={cerrarBusqueda}
          className="absolute inset-x-4 top-1/2 z-10 -translate-y-1/2 lg:static lg:flex-1 lg:translate-y-0"
        />
      )}
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {!buscando && (
          <button
            ref={botonBuscar}
            type="button"
            aria-label="Buscar"
            onClick={() => setBuscando(true)}
            className={cn(CLASE_ICONO_HEADER, 'cursor-pointer')}
          >
            <Search className="size-6" strokeWidth={1.75} aria-hidden />
          </button>
        )}
        {acciones}
      </div>
    </div>
  );
}

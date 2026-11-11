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

/** Misma curva y duración para todo lo que se mueve al abrir y cerrar el buscador. */
const TRANSICION = 'duration-300 ease-out motion-reduce:transition-none';

/**
 * La fila única del header: [menú] [logo] [categorías] [buscar] [cuenta] [carrito]. El botón
 * de buscar despliega el campo desde la lupa hacia la izquierda, sobre las categorías (en
 * celular, sobre toda la fila); se cierra con la X, con Esc o al salir de él sin texto.
 *
 * El campo queda montado y cerrado con `inert` para que la salida también se anime.
 */
export function FilaHeader({
  menuCelular,
  categorias,
  acciones,
}: FilaHeaderProps) {
  const [buscando, setBuscando] = useState(false);
  const zona = useRef<HTMLDivElement>(null);
  const botonBuscar = useRef<HTMLButtonElement>(null);
  const devolverFoco = useRef(false);

  // El foco se mueve después del render: antes, el campo o el botón siguen con `inert`
  useEffect(() => {
    if (buscando) {
      zona.current?.querySelector<HTMLInputElement>('input[name="q"]')?.focus();
      return;
    }
    if (!devolverFoco.current) return;
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
        <Logo className="h-auto w-[92px] lg:w-[118px] lg:p-4" />
      </Link>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        {/* En `lg` el campo se ubica en esta zona; en celular, sobre toda la fila */}
        <div
          ref={zona}
          className="flex min-w-0 flex-1 items-center justify-end gap-1 lg:relative"
        >
          <nav
            aria-label="Categorías"
            inert={buscando}
            className={cn(
              'hidden min-w-0 flex-1 transition-[opacity,translate] lg:flex',
              TRANSICION,
              buscando && 'pointer-events-none -translate-x-2 opacity-0',
            )}
          >
            {categorias}
          </nav>
          <button
            ref={botonBuscar}
            type="button"
            aria-label="Buscar"
            inert={buscando}
            onClick={() => setBuscando(true)}
            className={cn(
              CLASE_ICONO_HEADER,
              'cursor-pointer transition-[opacity,background-color,color]',
              TRANSICION,
              buscando && 'opacity-0',
            )}
          >
            <Search className="size-6" strokeWidth={1.75} aria-hidden />
          </button>
          <Buscador
            id="buscar-header"
            placeholder="Busca por producto, marca o categoría"
            alCerrar={cerrarBusqueda}
            inert={!buscando}
            aria-hidden={!buscando}
            className={cn(
              'absolute inset-x-4 top-1/2 z-10 -translate-y-1/2 transition-[clip-path,opacity] lg:inset-x-0',
              TRANSICION,
              // Se revela desde la derecha (la lupa); abierto deja 4 px para el anillo de foco
              buscando
                ? 'opacity-100 [clip-path:inset(-4px_round_9999px)]'
                : 'pointer-events-none opacity-0 [clip-path:inset(0_0_0_100%_round_9999px)]',
            )}
          />
        </div>
        <div className="flex shrink-0 items-center gap-1">{acciones}</div>
      </div>
    </div>
  );
}

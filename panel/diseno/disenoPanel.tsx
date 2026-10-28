'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useSesion } from '@/compartido/sesion/sesion';
import { Skeleton } from '@/compartido/ui/skeleton';
import { AvisoSinPermiso } from './avisoSinPermiso';
import { BarraSuperior } from './barraSuperior';
import { MenuLateral } from './menuLateral';
import { NavegacionInferior } from './navegacionInferior';
import { PanelProtegido } from './panelProtegido';
import { puedeAbrir } from './secciones';

/**
 * Marco del panel (Figma P1 2028:470 y 2023:206). Escritorio: menú lateral y contenido.
 * Celular: barra superior, contenido y navegación inferior. Una sección que el rol no tiene
 * muestra el aviso en vez de la página.
 */
export function DisenoPanel({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-fondo-hueso lg:flex">
      <PanelProtegido esqueleto={<EsqueletoPanel />}>
        <MenuLateral className="hidden lg:flex" />
        <BarraSuperior className="lg:hidden" />
        {/* En celular, deja el espacio de la navegación inferior (más el borde seguro) */}
        <main className="min-w-0 flex-1 px-4 pt-6 pb-[calc(--spacing(24)+env(safe-area-inset-bottom))] lg:px-12 lg:pt-8 lg:pb-12">
          <ContenidoPermitido>{children}</ContenidoPermitido>
        </main>
        <NavegacionInferior className="lg:hidden" />
      </PanelProtegido>
    </div>
  );
}

const ContenidoPermitido = ({ children }: { children: ReactNode }) => {
  const { usuario } = useSesion();
  const ruta = usePathname();
  return puedeAbrir(usuario?.rol, ruta) ? children : <AvisoSinPermiso />;
};

/** Menú lateral (o barra superior en celular) y el título, mientras se conoce la sesión. */
const EsqueletoPanel = () => (
  <div aria-hidden className="contents">
    <Skeleton className="hidden h-dvh w-62 shrink-0 rounded-none lg:block" />
    <Skeleton className="h-16 rounded-none lg:hidden" />
    <div className="flex-1 px-4 pt-6 lg:px-12 lg:pt-8">
      <Skeleton className="h-12 w-48" />
    </div>
  </div>
);

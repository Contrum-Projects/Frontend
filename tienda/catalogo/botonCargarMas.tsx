'use client';

import Link, { useLinkStatus } from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import { Spinner } from '@/compartido/ui/spinner';

/**
 * «Cargar más productos» (Figma › 02 Catálogo › Paginación). Es un enlace a la página siguiente
 * (funciona sin JavaScript); mientras llega, la lista actual se queda y el botón muestra que
 * está cargando. Sin prefetch: así `useLinkStatus` informa la espera y no se piden páginas que
 * la persona quizá no abra.
 */
export function BotonCargarMas({
  href,
}: {
  href: ComponentProps<typeof Link>['href'];
}) {
  return (
    <Button variant="contorno" size="grande" asChild>
      <Link href={href} scroll={false} prefetch={false}>
        <EtiquetaCargarMas />
      </Link>
    </Button>
  );
}

const EtiquetaCargarMas = () => {
  const { pending } = useLinkStatus();
  return (
    <>
      {/* El ícono siempre ocupa su lugar: el botón no cambia de ancho al cargar */}
      <Spinner
        aria-hidden
        role={undefined}
        aria-label={undefined}
        className={cn('size-5 transition-opacity', !pending && 'opacity-0')}
      />
      Cargar más productos
      <span className="size-5" aria-hidden />
      <span className="sr-only" aria-live="polite">
        {pending ? 'Cargando más productos' : ''}
      </span>
    </>
  );
};

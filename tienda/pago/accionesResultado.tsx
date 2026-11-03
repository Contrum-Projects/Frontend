import type { Route } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { buttonVariants } from '@/compartido/ui/button';

/** Botones al pie del resultado: a todo el ancho en celular, en fila en escritorio. */
export const AccionesResultado = ({ children }: { children: ReactNode }) => (
  <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row md:gap-3">
    {children}
  </div>
);

/** Un enlace con forma de botón grande (Figma › Botón, Primario o Contorno). */
export const EnlaceResultado = ({
  href,
  contorno = false,
  children,
}: {
  href: Route;
  contorno?: boolean;
  children: ReactNode;
}) => (
  <Link
    href={href}
    className={buttonVariants({
      variant: contorno ? 'contorno' : 'primario',
      size: 'grande',
      className: 'w-full md:w-auto',
    })}
  >
    {children}
  </Link>
);

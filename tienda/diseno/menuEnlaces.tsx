'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/compartido/ui/dropdown-menu';
import { CLASE_ENLACE_HEADER } from './estilosHeader';

export interface EnlaceMenu {
  clave: number | string;
  texto: string;
  href: ComponentProps<typeof Link>['href'];
}

interface MenuEnlacesProps {
  titulo: string;
  enlaces: EnlaceMenu[];
}

/** Desplegable de la fila del header («Marcas», «Más»): cada opción es un enlace. */
export function MenuEnlaces({ titulo, enlaces }: MenuEnlacesProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={`${CLASE_ENLACE_HEADER} cursor-pointer`}>
        {titulo}
        <ChevronDown className="size-4" strokeWidth={1.75} aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-96 min-w-48">
        {enlaces.map((enlace) => (
          <DropdownMenuItem key={enlace.clave} asChild>
            <Link href={enlace.href}>{enlace.texto}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

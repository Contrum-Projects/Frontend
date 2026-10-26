'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import type { MarcaTienda } from '@/compartido/api/respuestas';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/compartido/ui/dropdown-menu';
import { urlCatalogo } from './enlaces';

/** «Marcas» en el header de escritorio: abre la lista de marcas y cada una lleva a su catálogo. */
export function MenuMarcas({ marcas }: { marcas: MarcaTienda[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1 rounded-md texto-etiqueta text-texto-principal outline-none hover:text-marca-profundo focus-visible:ring-[3px] focus-visible:ring-ring/60">
        Marcas
        <ChevronDown className="size-4" strokeWidth={1.75} aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-96 min-w-48">
        {marcas.map((marca) => (
          <DropdownMenuItem key={marca.id} asChild>
            <Link href={urlCatalogo({ marca: marca.id })}>{marca.nombre}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

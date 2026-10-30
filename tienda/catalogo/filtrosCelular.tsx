'use client';

import { ListFilter } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/compartido/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/compartido/ui/sheet';
import type { PropsFiltros } from './filtrosEscritorio';
import { ListaFiltros } from './listaFiltros';
import { contarFiltros, type SeleccionFiltros } from './seleccionFiltros';
import { useAplicarFiltros, useTotalProductos } from './usarFiltros';

const SIN_FILTROS: SeleccionFiltros = { categoriaIds: [], marcaIds: [] };

const textoVer = (total: number | undefined) => {
  if (total === undefined) return 'Ver productos';
  return total === 1 ? 'Ver 1 producto' : `Ver ${total} productos`;
};

/**
 * Filtros del celular (criterio 3, Figma › 02 Catálogo › filtros 2005:662): un panel desde abajo
 * donde se marcan varias opciones; «Ver N productos» las aplica y cierra. El número lo cuenta
 * el backend con lo marcado, antes de aplicar.
 */
export function FiltrosCelular({
  categorias,
  marcas,
  seleccion,
  ...contexto
}: PropsFiltros) {
  const [abierto, setAbierto] = useState(false);
  const [borrador, setBorrador] = useState(seleccion);
  const { aplicar } = useAplicarFiltros(contexto);
  const { data: total, isError } = useTotalProductos(
    { buscar: contexto.buscar, ...borrador },
    abierto,
  );
  const marcados = contarFiltros(seleccion);

  const abrirOCerrar = (abrir: boolean) => {
    // Cada vez que se abre parte de lo aplicado: lo que no se aplicó se descarta al cerrar
    if (abrir) setBorrador(seleccion);
    setAbierto(abrir);
  };

  return (
    <Sheet open={abierto} onOpenChange={abrirOCerrar}>
      <SheetTrigger asChild>
        <Button variant="contorno" size="mediano" className="min-h-10">
          <ListFilter aria-hidden />
          {marcados > 0 ? `Filtros (${marcados})` : 'Filtros'}
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[90dvh] gap-0 rounded-t-xl border-0"
      >
        <span
          aria-hidden
          className="mx-auto mt-3 h-1 w-10 rounded-full bg-fondo-hueso-oscuro"
        />
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle className="titulo-h2 font-normal text-texto-principal">
            Filtros
          </SheetTitle>
          <SheetDescription className="sr-only">
            Elige categorías y marcas, y luego ve los productos.
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
          <ListaFiltros
            categorias={categorias}
            marcas={marcas}
            seleccion={borrador}
            alCambiar={setBorrador}
            expandirTodo={Boolean(contexto.buscar)}
            prefijo="filtro-celular"
            celular
          />
        </div>
        <SheetFooter className="flex-row gap-3 p-4">
          <Button
            variant="contorno"
            size="grande"
            className="px-6"
            onClick={() => setBorrador(SIN_FILTROS)}
          >
            Limpiar
          </Button>
          <Button
            size="grande"
            className="min-w-0 flex-1 px-6"
            onClick={() => {
              aplicar(borrador);
              setAbierto(false);
            }}
          >
            {textoVer(isError ? undefined : total)}
          </Button>
          <p className="sr-only" aria-live="polite">
            {textoVer(isError ? undefined : total)}
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

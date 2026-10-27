'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { CategoriaTienda, MarcaTienda } from '@/compartido/api/respuestas';
import { Logo } from '@/compartido/marca/logo';
import { Button } from '@/compartido/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/compartido/ui/sheet';
import { RUTAS, urlCatalogo } from './enlaces';
import {
  EnlaceMenu,
  PanelPrincipal,
  PanelSecundario,
  type Panel,
} from './menuCelularPaneles';

interface MenuCelularProps {
  categorias: CategoriaTienda[];
  marcas: MarcaTienda[];
}

/**
 * Menú del celular (Figma › 12 Menú, 2060:2101): categorías con sus subcategorías, packs,
 * marcas, precio profesional, ayuda y cuenta. Una categoría con subcategorías abre un segundo
 * panel; al elegir un destino, el menú se cierra.
 */
export function MenuCelular({ categorias, marcas }: MenuCelularProps) {
  const [abierto, setAbierto] = useState(false);
  const [panel, setPanel] = useState<Panel>({ tipo: 'principal' });

  const cambiarAbierto = (valor: boolean) => {
    setAbierto(valor);
    if (!valor) setPanel({ tipo: 'principal' });
  };
  const cerrar = () => cambiarAbierto(false);

  return (
    <Sheet open={abierto} onOpenChange={cambiarAbierto}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icono" aria-label="Abrir menú">
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        aria-describedby={undefined}
        className="w-80 max-w-[85vw] gap-0 overflow-y-auto border-r-0 bg-fondo-superficie"
      >
        <SheetTitle className="sr-only">Menú</SheetTitle>
        <div className="flex items-center justify-between px-6 py-2">
          <Link
            href={RUTAS.inicio}
            onClick={cerrar}
            className="rounded-md text-marca-logo"
          >
            <Logo className="h-auto w-[88px]" />
          </Link>
          <SheetClose asChild>
            <Button variant="ghost" size="icono" aria-label="Cerrar menú">
              <X className="size-6" />
            </Button>
          </SheetClose>
        </div>

        {panel.tipo === 'principal' && (
          <PanelPrincipal
            categorias={categorias}
            hayMarcas={marcas.length > 0}
            alElegir={cerrar}
            abrir={setPanel}
          />
        )}
        {panel.tipo === 'categoria' && (
          <PanelSecundario
            titulo={panel.categoria.nombre}
            volver={() => setPanel({ tipo: 'principal' })}
          >
            <li>
              <EnlaceMenu
                href={urlCatalogo({ categoria: panel.categoria.id })}
                alElegir={cerrar}
                destacado
              >
                Ver todo en {panel.categoria.nombre}
              </EnlaceMenu>
            </li>
            {panel.categoria.subcategorias.map((sub) => (
              <li key={sub.id}>
                <EnlaceMenu
                  href={urlCatalogo({ categoria: sub.id })}
                  alElegir={cerrar}
                >
                  {sub.nombre}
                </EnlaceMenu>
              </li>
            ))}
          </PanelSecundario>
        )}
        {panel.tipo === 'marcas' && (
          <PanelSecundario
            titulo="Marcas"
            volver={() => setPanel({ tipo: 'principal' })}
          >
            {marcas.map((marca) => (
              <li key={marca.id}>
                <EnlaceMenu
                  href={urlCatalogo({ marca: marca.id })}
                  alElegir={cerrar}
                >
                  {marca.nombre}
                </EnlaceMenu>
              </li>
            ))}
          </PanelSecundario>
        )}
      </SheetContent>
    </Sheet>
  );
}

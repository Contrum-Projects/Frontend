import { Menu } from 'lucide-react';
import { Button } from '@/compartido/ui/button';
import { leerCategorias, leerMarcas } from '@/tienda/catalogo/consultas';
import { MenuCelular } from './menuCelular';

/** Lee categorías y marcas en el servidor y se las pasa al menú (va dentro de <Suspense>). */
export async function MenuCelularCargado() {
  const [categorias, marcas] = await Promise.all([
    leerCategorias().catch(() => []),
    leerMarcas().catch(() => []),
  ]);
  return <MenuCelular categorias={categorias} marcas={marcas} />;
}

/** Mientras llegan las categorías: el mismo botón, sin acción. */
export const MenuCelularEsqueleto = () => (
  <Button variant="ghost" size="icono" disabled aria-label="Abrir menú">
    <Menu className="size-6" />
  </Button>
);

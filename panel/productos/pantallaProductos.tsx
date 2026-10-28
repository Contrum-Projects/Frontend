import Link from 'next/link';
import { Button } from '@/compartido/ui/button';

/**
 * «Productos» (Figma P3a 2039:980). Por ahora solo el encabezado con el acceso a Marcas y
 * categorías (SCRUM-103); la tabla, los filtros y «Producto nuevo» llegan con SCRUM-100.
 * En celular (2039:5857) Figma no dibuja el acceso, pero sin él no hay cómo llegar.
 */
export function PantallaProductos() {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="titulo-h2 text-texto-principal">Productos</h1>
        <Button asChild variant="contorno">
          <Link href="/panel/marcas-y-categorias">Marcas y categorías</Link>
        </Button>
      </div>
    </div>
  );
}

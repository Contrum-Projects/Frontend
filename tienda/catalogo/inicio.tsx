import { Suspense } from 'react';
import { Skeleton } from '@/compartido/ui/skeleton';
import { ChipsCategorias } from './chipsCategorias';
import { leerCategorias } from './consultas';
import { FilaProductos, MarcoFila } from './filaProductos';
import { MarcasInicio, MarcasInicioEsqueleto } from './marcasInicio';
import {
  AvisoProfesionalCelular,
  Promociones,
  PromocionesEsqueleto,
} from './promociones';

/**
 * Inicio de la tienda (SCRUM-106, Figma › 01 Inicio 2016:1184 y 2017:1191): promociones,
 * «Más vendidos», «Novedades» y marcas. Cada sección lee la API en su propio <Suspense>, así
 * una lenta no frena a las demás.
 */
export function Inicio() {
  return (
    <main>
      <h1 className="sr-only">Cabello Perfecto · Productos capilares</h1>
      <Suspense fallback={<ChipsEsqueleto />}>
        <ChipsInicio />
      </Suspense>
      <Suspense fallback={<PromocionesEsqueleto />}>
        <Promociones />
      </Suspense>
      <Suspense
        fallback={
          <MarcoFila
            titulo="Más vendidos"
            orden="mas-vendidos"
            celular="carrusel"
          />
        }
      >
        <FilaProductos
          titulo="Más vendidos"
          orden="mas-vendidos"
          celular="carrusel"
          prioridad
        />
      </Suspense>
      <AvisoProfesionalCelular />
      <Suspense
        fallback={
          <MarcoFila titulo="Novedades" orden="novedades" celular="grilla" />
        }
      >
        <FilaProductos titulo="Novedades" orden="novedades" celular="grilla" />
      </Suspense>
      <Suspense fallback={<MarcasInicioEsqueleto />}>
        <MarcasInicio />
      </Suspense>
    </main>
  );
}

/** Fila de categorías del celular, bajo el header (Figma 2017:1231). */
async function ChipsInicio() {
  const categorias = await leerCategorias().catch(() => []);
  if (categorias.length === 0) return null;
  return (
    <nav aria-label="Categorías destacadas" className="px-4 pt-3 md:hidden">
      <ChipsCategorias categorias={categorias} desplazable />
    </nav>
  );
}

const ChipsEsqueleto = () => (
  <div aria-hidden className="flex gap-2 px-4 pt-3 md:hidden">
    {Array.from({ length: 3 }, (_, i) => (
      <Skeleton key={i} className="h-10 w-28 rounded-full" />
    ))}
  </div>
);

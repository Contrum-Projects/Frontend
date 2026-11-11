import { Suspense } from 'react';
import { Skeleton } from '@/compartido/ui/skeleton';
import {
  AccesosInicio,
  AccesosInicioEsqueleto,
  Promociones,
} from '@/tienda/catalogo/promociones';
import { leerPortada } from './consultas';
import { hrefDestino } from './destinoPortada';
import { SliderPortada } from './sliderPortada';

/**
 * Arriba del inicio (SCRUM-157): la portada que la tienda edita en el panel y, bajo ella, las
 * tarjetas de packs y precio profesional. Sin slides (o si la API falla), el inicio queda como
 * antes: el banner del pack vigente con sus tarjetas al lado (criterio 6).
 */
export async function PortadaInicio() {
  const slides = (await leerPortada()).filter(
    (slide) => hrefDestino(slide.destino) !== null,
  );
  // Se espera aquí (no como <Promociones />) para leer todo en el mismo <Suspense>
  if (slides.length === 0) return Promociones();
  return (
    <>
      <SliderPortada slides={slides} />
      <Suspense fallback={<AccesosInicioEsqueleto />}>
        <AccesosInicio />
      </Suspense>
    </>
  );
}

/** Mientras llega la portada: el espacio de la imagen, con sus mismas proporciones. */
export const PortadaEsqueleto = () => (
  <div
    aria-hidden
    className="mx-auto max-w-[1440px] px-4 pt-4 md:px-16 md:pt-6"
  >
    <Skeleton className="aspect-[4/5] rounded-xl md:aspect-[8/3]" />
  </div>
);

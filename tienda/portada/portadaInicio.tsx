import { Skeleton } from '@/compartido/ui/skeleton';
import { Promociones } from '@/tienda/catalogo/promociones';
import { leerPortada } from './consultas';
import { hrefDestino } from './destinoPortada';
import { SliderPortada } from './sliderPortada';

/**
 * Arriba del inicio (SCRUM-157): la portada que la tienda edita en el panel, de borde a borde.
 * Sin slides (o si la API falla), el inicio queda como antes: el banner del pack vigente con sus
 * tarjetas al lado (criterio 6).
 */
export async function PortadaInicio() {
  const slides = (await leerPortada()).filter(
    (slide) => hrefDestino(slide.destino) !== null,
  );
  // Se espera aquí (no como <Promociones />) para leer todo en el mismo <Suspense>
  if (slides.length === 0) return Promociones();
  return <SliderPortada slides={slides} />;
}

/** Mientras llega la portada: el espacio de la imagen, con sus mismas proporciones. */
export const PortadaEsqueleto = () => (
  <Skeleton
    aria-hidden
    className="aspect-[4/5] w-full rounded-none md:aspect-[12/5] md:max-h-[85dvh]"
  />
);

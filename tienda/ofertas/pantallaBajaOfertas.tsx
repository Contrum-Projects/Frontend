import { BajaOfertas } from './bajaOfertas';

/**
 * Baja de las ofertas (E12-H2). Sin diseño propio en Figma: la misma tarjeta centrada que la
 * confirmación de la suscripción.
 */
export function PantallaBajaOfertas() {
  return (
    <main className="mx-auto grid max-w-lg items-start gap-4 px-4 pt-6 pb-12 md:pt-12 md:pb-16">
      <section className="flex flex-col gap-4 rounded-xl border bg-card p-6 md:p-8">
        <BajaOfertas />
      </section>
    </main>
  );
}

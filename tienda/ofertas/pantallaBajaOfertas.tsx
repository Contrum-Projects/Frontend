import { Suspense } from 'react';
import { BajaOfertas } from './bajaOfertas';
import { ConfirmacionEsqueleto } from './confirmacionSuscripcion';

/**
 * Baja de las ofertas desde el enlace de un correo (E12-H2). Sin diseño propio en Figma: la misma
 * tarjeta centrada que la confirmación de la suscripción.
 */
export function PantallaBajaOfertas() {
  return (
    <main className="mx-auto grid max-w-lg items-start gap-4 px-4 pt-6 pb-12 md:pt-12 md:pb-16">
      <section className="flex flex-col gap-4 rounded-xl border bg-card p-6 md:p-8">
        {/* Lee ?token= en el navegador: va dentro de <Suspense> */}
        <Suspense
          fallback={<ConfirmacionEsqueleto texto="Procesando tu baja…" />}
        >
          <BajaOfertas />
        </Suspense>
      </section>
    </main>
  );
}

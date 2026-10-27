import { Suspense } from 'react';
import {
  ConfirmacionCorreo,
  ConfirmacionEsqueleto,
} from './confirmacionCorreo';

/** Confirmación del correo (Figma «Revisa tu correo» 2034:4841), centrada como /ingresar. */
export function PantallaConfirmacion() {
  return (
    <main className="mx-auto grid max-w-lg items-start gap-4 px-4 pt-6 pb-12 md:pt-12 md:pb-16">
      <section className="flex flex-col gap-4 rounded-xl border bg-card p-6 md:p-8">
        {/* Lee ?token= en el navegador: va dentro de <Suspense> */}
        <Suspense fallback={<ConfirmacionEsqueleto />}>
          <ConfirmacionCorreo />
        </Suspense>
      </section>
    </main>
  );
}

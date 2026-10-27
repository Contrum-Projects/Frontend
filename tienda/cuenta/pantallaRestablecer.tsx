import { Suspense } from 'react';
import {
  RestablecerContrasena,
  RestablecerEsqueleto,
} from './restablecerContrasena';

/** Nueva contraseña desde el enlace del correo (E1-H4; sin pantalla en Figma), como /ingresar. */
export function PantallaRestablecer() {
  return (
    <main className="mx-auto grid max-w-lg items-start gap-4 px-4 pt-6 pb-12 md:pt-12 md:pb-16">
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 md:p-8">
        {/* Lee ?token= en el navegador: va dentro de <Suspense> */}
        <Suspense fallback={<RestablecerEsqueleto />}>
          <RestablecerContrasena />
        </Suspense>
      </div>
    </main>
  );
}

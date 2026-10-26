import { Suspense } from 'react';
import { Ingreso, IngresoEsqueleto } from './ingreso';

/**
 * Tarjeta «Iniciar sesión» de la pantalla 06 Ingreso y registro (Figma 2018:1261), centrada
 * con su ancho de Figma. Figma muestra «Crear cuenta» al lado, pero el registro es otra página
 * (`/registro`, SCRUM-93); se enlazan entre sí bajo el botón.
 */
export function PantallaIngreso() {
  return (
    <main className="mx-auto grid max-w-lg items-start gap-8 px-4 pt-6 pb-12 md:pt-12 md:pb-16">
      <section
        aria-labelledby="titulo-ingreso"
        className="flex flex-col gap-4 rounded-xl border bg-card p-6 md:p-8"
      >
        <h1 id="titulo-ingreso" className="titulo-h2">
          Iniciar sesión
        </h1>
        {/* Lee ?volver= y la sesión en el navegador: va dentro de <Suspense> */}
        <Suspense fallback={<IngresoEsqueleto />}>
          <Ingreso />
        </Suspense>
      </section>
    </main>
  );
}

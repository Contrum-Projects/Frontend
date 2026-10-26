import { Suspense } from 'react';
import { Ingreso, IngresoEsqueleto } from './ingreso';

/**
 * Pantalla 06 Ingreso y registro (Figma 2018:1261 / 2018:2508). En escritorio, dos columnas:
 * «Iniciar sesión» a la izquierda y «Crear cuenta» a la derecha, que agrega SCRUM-93 (con las
 * pestañas del celular).
 */
export function PantallaIngreso() {
  return (
    <main className="mx-auto grid max-w-5xl items-start gap-8 px-4 pt-6 pb-12 md:grid-cols-2 md:px-8 md:pt-12 md:pb-16">
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

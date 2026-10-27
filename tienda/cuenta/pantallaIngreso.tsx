import { Suspense } from 'react';
import { Ingreso, IngresoEsqueleto } from './ingreso';
import { PestanasCuenta } from './pestanasCuenta';

/**
 * Tarjeta «Iniciar sesión» de la pantalla 06 Ingreso y registro (Figma 2018:1261), centrada
 * con su ancho de Figma. Figma muestra «Crear cuenta» al lado, pero el registro es otra página
 * (`/registro`, SCRUM-93); se enlazan entre sí bajo el botón y, en el celular, con las
 * pestañas, que reemplazan al título visible.
 */
export function PantallaIngreso() {
  return (
    <main className="mx-auto grid max-w-lg items-start gap-4 px-4 pt-6 pb-12 md:pt-12 md:pb-16">
      <PestanasCuenta activa="ingresar" />
      <section
        aria-labelledby="titulo-ingreso"
        className="flex flex-col gap-4 rounded-xl border bg-card p-6 md:p-8"
      >
        <h1 id="titulo-ingreso" className="titulo-h2 max-md:sr-only">
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

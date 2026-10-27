import { Registro } from './registro';

/**
 * Tarjeta «Crear cuenta» de la pantalla 06 Ingreso y registro (Figma 2018:1261 y 2018:2508),
 * centrada como la de /ingresar. En el celular, las pestañas (dentro de <Registro>)
 * reemplazan al título visible.
 */
export function PantallaRegistro() {
  return (
    <main className="mx-auto grid max-w-lg items-start gap-4 px-4 pt-6 pb-12 md:pt-12 md:pb-16">
      <Registro />
    </main>
  );
}

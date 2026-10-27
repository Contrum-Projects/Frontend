import { SolicitudRecuperacion } from './solicitudRecuperacion';

/**
 * 10 Recuperar contraseña (Figma 2034:4783, solo celular): en escritorio, la tarjeta centrada
 * de /ingresar.
 */
export function PantallaRecuperacion() {
  return (
    <main className="mx-auto grid max-w-lg items-start gap-4 px-4 pt-6 pb-12 md:pt-12 md:pb-16">
      <SolicitudRecuperacion />
    </main>
  );
}

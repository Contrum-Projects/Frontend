/**
 * Content-Security-Policy de la tienda y el panel (SCRUM-165). Limita el daño de un XSS: con la
 * sesión de un administrador, un script inyectado podría crear cuentas del personal.
 *
 * `script-src` lleva `'unsafe-inline'` porque Next pone scripts en línea y, con Cache Components y
 * Partial Prerendering, no admite nonces: el esqueleto estático se genera sin petición (guía
 * «Content Security Policy» de Next 16). Aun así, la política impide cargar scripts de otros
 * dominios, enviar datos a otros dominios (`connect-src`), incrustar `<object>`, cambiar la `<base>`
 * de los enlaces, enviar formularios fuera de la tienda y mostrarla dentro de otro sitio.
 *
 * Todo lo del navegador va por el mismo origen: la API por el proxy `/api`, las imágenes por
 * `next/image` y las fuentes por `next/font`. Las imágenes del catálogo en R2 (`URL_IMAGENES`) se
 * permiten porque la portada las muestra con `<img>`. La redirección al pago y los documentos de
 * verificación son navegaciones, no recursos: la política no los toca.
 */
export interface OpcionesPolitica {
  /** `next dev`: el recargado en caliente usa `eval`, y localhost no tiene https. */
  desarrollo: boolean;
  /** Origen público de las imágenes del catálogo (R2), p. ej. `https://img.tienda.cl`. */
  origenImagenes: string | null;
}

export const politicaDeContenido = ({
  desarrollo,
  origenImagenes,
}: OpcionesPolitica): string => {
  const directivas = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${desarrollo ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    ['img-src', "'self'", 'blob:', 'data:', origenImagenes]
      .filter(Boolean)
      .join(' '),
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
  // En desarrollo, localhost va por http: subirlo a https rompería todo
  if (!desarrollo) directivas.push('upgrade-insecure-requests');
  return directivas.join('; ');
};

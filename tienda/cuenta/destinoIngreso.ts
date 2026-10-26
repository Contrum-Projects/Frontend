import type { Route } from 'next';
import { esPersonal, type Rol } from '@/compartido/sesion/roles';
import { RUTAS } from '@/tienda/diseno/enlaces';

const ORIGEN = 'http://tienda.local';

/**
 * Lee `?volver=` como lo hará el navegador y lo acepta solo si queda en el mismo sitio.
 * No basta con mirar el texto: el navegador borra tabuladores y saltos de línea, así que
 * «/\t/otro.cl» termina siendo «//otro.cl», otro dominio. `null` si no sirve.
 */
const rutaInterna = (volver: string | null) => {
  if (!volver?.startsWith('/')) return null;
  const url = new URL(volver, ORIGEN);
  if (url.origin !== ORIGEN) return null;
  return {
    camino: url.pathname,
    ruta: `${url.pathname}${url.search}${url.hash}`,
  };
};

const esDelPanel = (camino: string) =>
  camino === RUTAS.panel || camino.startsWith(`${RUTAS.panel}/`);

/**
 * Adónde llevar a la persona después de ingresar (E1-H2): el personal entra al panel (o a la
 * página del panel de donde venía); cliente y profesional vuelven a la tienda.
 */
export const destinoTrasIngreso = (rol: Rol, volver: string | null): Route => {
  const destino = rutaInterna(volver);

  if (esPersonal(rol)) {
    return destino && esDelPanel(destino.camino)
      ? (destino.ruta as Route)
      : RUTAS.panel;
  }
  if (
    !destino ||
    esDelPanel(destino.camino) ||
    destino.camino === RUTAS.ingresar
  ) {
    return RUTAS.inicio;
  }
  return destino.ruta as Route;
};

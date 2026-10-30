import type { Route } from 'next';
import type { UrlObject } from 'node:url';

/**
 * Rutas de la tienda que el header, el menú y el footer enlazan.
 *
 * Varias todavía no tienen página. Con `typedRoutes`, un enlace a una ruta que no existe no
 * compila, así que llevan `as Route`: cuando la historia cree la página, quita el cast de su
 * línea. Las que no tienen historia (ayuda, legales) quedan en 404 hasta que alguna las cree.
 */
export const RUTAS = {
  inicio: '/',
  catalogo: '/catalogo',
  marcas: '/#marcas',
  buscar: '/buscar',
  ingresar: '/ingresar',
  registro: '/registro',
  recuperarContrasena: '/recuperar-contrasena',
  panel: '/panel',
  // TODO(SCRUM-116): carrito
  carrito: '/carrito' as Route,
  misDatos: '/cuenta/datos',
  direcciones: '/cuenta/datos#direcciones',
  // TODO(SCRUM-126): datos de facturación
  facturacion: '/cuenta/facturacion' as Route,
  // TODO(SCRUM-139): ofertas por correo
  ofertas: '/cuenta/ofertas' as Route,
  // TODO(SCRUM-129): mis pedidos
  misPedidos: '/cuenta/pedidos' as Route,
  // TODO(SCRUM-134): verificación profesional
  verificacion: '/cuenta/verificacion' as Route,
  // Sin historia: listado de packs, ayuda, profesionales y legales
  packs: '/packs' as Route,
  precioProfesional: '/precio-profesional' as Route,
  despacho: '/ayuda/despacho-y-retiro' as Route,
  comprobantes: '/ayuda/comprobante-y-factura' as Route,
  contacto: '/contacto' as Route,
  terminos: '/terminos-y-condiciones' as Route,
  privacidad: '/politica-de-privacidad' as Route,
} as const;

/**
 * `/catalogo?categoria=<id>&marca=<id>…`, sin los filtros que no vienen. Con `q` es la búsqueda
 * (`/buscar?q=…`). `categoria` y `marca` aceptan varios ids (se repiten en la URL).
 */
export const urlCatalogo = (filtro: {
  q?: string;
  categoria?: number | number[];
  marca?: number | number[];
  orden?: string;
  pagina?: number;
}): UrlObject => ({
  pathname: filtro.q ? RUTAS.buscar : RUTAS.catalogo,
  query: Object.fromEntries(
    Object.entries(filtro).filter(
      ([, valor]) =>
        valor !== undefined &&
        valor !== '' &&
        !(Array.isArray(valor) && valor.length === 0),
    ),
  ),
});

/** La URL como texto, para `router.push` (los enlaces aceptan el objeto de `urlCatalogo`). */
export const hrefDe = ({ pathname, query }: UrlObject): Route => {
  const consulta = new URLSearchParams();
  if (query && typeof query === 'object') {
    for (const [clave, valor] of Object.entries(query)) {
      for (const item of [valor].flat()) {
        if (item !== undefined && item !== null) {
          consulta.append(clave, String(item));
        }
      }
    }
  }
  const texto = consulta.toString();
  return `${pathname ?? ''}${texto ? `?${texto}` : ''}` as Route;
};

// TODO(SCRUM-108): ficha de producto y de pack
export const urlProducto = (id: number) => `/productos/${id}` as Route;
export const urlPack = (id: number) => `/packs/${id}` as Route;

/** Enlaces de ayuda, en el orden de Figma (footer y menú del celular). */
export const ENLACES_AYUDA = [
  { texto: 'Despacho y retiro', href: RUTAS.despacho },
  { texto: 'Seguimiento de pedido', href: RUTAS.misPedidos },
  { texto: 'Comprobante y factura', href: RUTAS.comprobantes },
  { texto: 'Contacto', href: RUTAS.contacto },
] as const;

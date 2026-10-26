/**
 * Rutas simuladas de la tienda (docs/api-simulada.md).
 *
 * SCRUM-106 · `GET /tienda/productos?orden=mas-vendidos|novedades`: el inicio muestra filas de
 * «Más vendidos» y «Novedades», pero el backend solo ordena por nombre y rechaza `orden` (400).
 * Forma propuesta al backend (anotada en docs/historias/SCRUM-106.md): el mismo listado de
 * `/tienda/productos`, con `orden` opcional. Mientras no exista, se devuelve el listado real
 * sin `orden` (por nombre): no se inventa qué se vende más ni qué es nuevo.
 */
import 'server-only';
import { entornoServidor } from '@/compartido/config/entorno-servidor';
import type { RutaSimulada } from './index';

export const rutasTienda: RutaSimulada[] = [
  {
    metodo: 'GET',
    ruta: '/tienda/productos',
    historia: 'SCRUM-106',
    responder: ({ peticion, url }) => {
      // Sin `orden`, la petición sigue al backend como siempre
      if (!url.searchParams.has('orden')) return null;
      const consulta = new URLSearchParams(url.searchParams);
      consulta.delete('orden');
      const cabeceras = new Headers();
      const autorizacion = peticion.headers.get('authorization');
      if (autorizacion) cabeceras.set('authorization', autorizacion);
      return fetch(
        `${entornoServidor().API_URL}/api/tienda/productos?${consulta}`,
        { headers: cabeceras, cache: 'no-store' },
      );
    },
  },
];

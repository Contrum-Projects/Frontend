/**
 * Rutas simuladas de los reportes del panel.
 *
 * SCRUM-142 · `GET /reportes/objetivos`: el endpoint de SCRUM-74 aún no existe. Datos fijos con
 * la forma propuesta (ver docs/historias/SCRUM-142.md): porcentaje, meta y estado vienen
 * escritos, no se calculan aquí. `?desde=` de un mes sin registros (`2026-01-01`) devuelve
 * todo «sin datos», para ver el criterio 3.
 */
import 'server-only';
import type {
  IndicadorObjetivo,
  ReporteObjetivos,
} from '@/compartido/api/respuestas';
import { errorSimulado, json, type RutaSimulada } from './index';

const CON_DATOS: IndicadorObjetivo[] = [
  {
    codigo: 'OE1',
    meta: 30,
    porcentaje: 24,
    cumplen: 41,
    total: 171,
    estado: 'bajo-la-meta',
  },
  {
    codigo: 'OE2',
    meta: 70,
    porcentaje: 78,
    cumplen: 112,
    total: 144,
    estado: 'sobre-la-meta',
  },
  {
    codigo: 'OE3',
    meta: 80,
    porcentaje: 85,
    cumplen: 34,
    total: 40,
    estado: 'sobre-la-meta',
  },
];

/** Datos distintos para «Este mes», así se ve que el período cambia los indicadores. */
const ESTE_MES: IndicadorObjetivo[] = [
  {
    ...CON_DATOS[0],
    porcentaje: 31,
    cumplen: 9,
    total: 29,
    estado: 'sobre-la-meta',
  },
  {
    ...CON_DATOS[1],
    porcentaje: 65,
    cumplen: 13,
    total: 20,
    estado: 'bajo-la-meta',
  },
  {
    ...CON_DATOS[2],
    porcentaje: null,
    cumplen: 0,
    total: 0,
    estado: 'sin-datos',
  },
];

const SIN_DATOS: IndicadorObjetivo[] = CON_DATOS.map((objetivo) => ({
  ...objetivo,
  porcentaje: null,
  cumplen: 0,
  total: 0,
  estado: 'sin-datos',
}));

const FECHA = /^\d{4}-\d{2}-\d{2}$/;

const sinSesion = (peticion: Request) =>
  peticion.headers.has('authorization')
    ? null
    : errorSimulado(401, 'Debes iniciar sesión.');

export const rutasPanelReportes: RutaSimulada[] = [
  {
    metodo: 'GET',
    ruta: '/reportes/objetivos',
    historia: 'SCRUM-142',
    responder: ({ peticion, url }) => {
      const noAutorizado = sinSesion(peticion);
      if (noAutorizado) return noAutorizado;
      const desde = url.searchParams.get('desde') ?? '';
      const hasta = url.searchParams.get('hasta') ?? '';
      if (!FECHA.test(desde) || !FECHA.test(hasta) || hasta < desde) {
        return errorSimulado(400, 'El período no es válido.');
      }
      // Enero 2026: sin registros. Un solo mes («Este mes»): otros valores
      const objetivos = desde.startsWith('2026-01')
        ? SIN_DATOS
        : desde.slice(0, 7) === hasta.slice(0, 7)
          ? ESTE_MES
          : CON_DATOS;
      const reporte: ReporteObjetivos = { desde, hasta, objetivos };
      return json(reporte);
    },
  },
];

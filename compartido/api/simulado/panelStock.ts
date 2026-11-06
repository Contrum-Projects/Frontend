/**
 * Rutas simuladas del stock y los movimientos del panel.
 *
 * SCRUM-114 · `GET /inventario/movimientos`: datos fijos con la forma pedida a SCRUM-40 (ver
 * docs/historias/SCRUM-114.md): el grupo de cada movimiento viene escrito; los filtros solo eligen
 * filas. `GET /inventario/stock` ya es real (SCRUM-150).
 */
import 'server-only';
import type {
  GrupoMovimientos,
  ListadoMovimientos,
  MovimientoListado,
} from '@/compartido/api/respuestas';
import { errorSimulado, json, type RutaSimulada } from './index';
import { UBICACIONES, ubicacion } from './panelInventario';

const MOVIMIENTOS: (MovimientoListado & { grupo: GrupoMovimientos })[] = [
  {
    id: 9,
    fechaHora: '2026-10-12T13:15:00Z',
    tipo: 'venta',
    formato: { id: 11, producto: 'Shampoo reparador', nombreFormato: '300 ml' },
    cantidad: -1,
    ubicacion: ubicacion(1),
    destino: null,
    referencia: 'CP-10490',
    registradoPor: null,
    grupo: 'ventas',
  },
  {
    id: 8,
    fechaHora: '2026-10-11T21:02:00Z',
    tipo: 'merma_dano',
    formato: {
      id: 13,
      producto: 'Mascarilla nutritiva',
      nombreFormato: '500 g',
    },
    cantidad: -1,
    ubicacion: ubicacion(3),
    destino: null,
    referencia: 'Envase roto',
    registradoPor: { nombre: 'Usuario de prueba' },
    grupo: 'salidas',
  },
  {
    id: 7,
    fechaHora: '2026-10-11T19:40:00Z',
    tipo: 'transferencia',
    formato: { id: 11, producto: 'Shampoo reparador', nombreFormato: '300 ml' },
    cantidad: 6,
    ubicacion: ubicacion(1),
    destino: ubicacion(4),
    referencia: null,
    registradoPor: { nombre: 'Administración' },
    grupo: 'transferencias',
  },
  {
    id: 6,
    fechaHora: '2026-10-10T15:00:00Z',
    tipo: 'consumo_peluqueria',
    formato: {
      id: 12,
      producto: 'Tinte permanente',
      nombreFormato: 'Tono 7.1',
    },
    cantidad: -2,
    ubicacion: ubicacion(2),
    destino: null,
    referencia: null,
    registradoPor: { nombre: 'Usuario de prueba' },
    grupo: 'salidas',
  },
  {
    id: 5,
    fechaHora: '2026-10-09T18:20:00Z',
    tipo: 'reingreso',
    formato: { id: 11, producto: 'Shampoo reparador', nombreFormato: '300 ml' },
    cantidad: 1,
    ubicacion: ubicacion(1),
    destino: null,
    referencia: 'CP-10476',
    registradoPor: null,
    grupo: 'entradas',
  },
  {
    id: 4,
    fechaHora: '2026-10-05T14:10:00Z',
    tipo: 'ajuste_negativo',
    formato: {
      id: 14,
      producto: 'Acondicionador hidratante',
      nombreFormato: '300 ml',
    },
    cantidad: -2,
    ubicacion: ubicacion(1),
    destino: null,
    referencia: 'Conteo físico de octubre',
    registradoPor: { nombre: 'Administración' },
    grupo: 'salidas',
  },
  {
    id: 3,
    fechaHora: '2026-09-28T14:20:00Z',
    tipo: 'entrada',
    formato: {
      id: 14,
      producto: 'Acondicionador hidratante',
      nombreFormato: '300 ml',
    },
    cantidad: 24,
    ubicacion: ubicacion(1),
    destino: null,
    referencia: 'F-10320',
    registradoPor: { nombre: 'Usuario de prueba' },
    grupo: 'entradas',
  },
];

const enBodega = (ubicacionId: number, bodegaId: number) =>
  UBICACIONES.find((u) => u.id === ubicacionId)?.bodega.id === bodegaId;

const contiene = (texto: string, buscar: string) =>
  !buscar || texto.toLowerCase().includes(buscar);

/** `buscar=vacio` simula una lista vacía. */
const filtrarMovimientos = (consulta: URLSearchParams) => {
  const bodegaId = Number(consulta.get('bodegaId'));
  const grupo = consulta.get('grupo');
  const buscar = consulta.get('buscar')?.toLowerCase() ?? '';
  const desde = consulta.get('desde');
  const hasta = consulta.get('hasta');
  if (buscar === 'vacio') return [];
  return MOVIMIENTOS.filter((mov) => {
    const dia = mov.fechaHora.slice(0, 10);
    return (
      (!bodegaId ||
        enBodega(mov.ubicacion.id, bodegaId) ||
        (mov.destino !== null && enBodega(mov.destino.id, bodegaId))) &&
      (!grupo || mov.grupo === grupo) &&
      contiene(
        `${mov.formato.producto} ${mov.formato.nombreFormato} ${mov.referencia ?? ''}`,
        buscar,
      ) &&
      (!desde || dia >= desde) &&
      (!hasta || dia <= hasta)
    );
  });
};

/** Como el backend: sin token responde 401, para poder ver ese estado en el navegador. */
const sinSesion = (peticion: Request) =>
  peticion.headers.has('authorization')
    ? null
    : errorSimulado(401, 'Debes iniciar sesión.');

export const rutasPanelStock: RutaSimulada[] = [
  {
    metodo: 'GET',
    ruta: '/inventario/movimientos',
    historia: 'SCRUM-114',
    responder: ({ peticion, url }) => {
      const noAutorizado = sinSesion(peticion);
      if (noAutorizado) return noAutorizado;
      const filas = filtrarMovimientos(url.searchParams);
      const limite = Number(url.searchParams.get('limite')) || 20;
      const listado: ListadoMovimientos = {
        items: filas.slice(0, limite).map(({ grupo: _grupo, ...mov }) => mov),
        total: filas.length,
        pagina: 1,
        limite,
      };
      return json(listado);
    },
  },
];

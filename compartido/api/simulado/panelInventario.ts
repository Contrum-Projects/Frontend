/**
 * Rutas simuladas del inventario del panel.
 *
 * SCRUM-111 · `GET /inventario/entradas` y `GET /inventario/ubicaciones`: el backend solo tiene
 * el POST de entradas. Devuelven datos fijos con la forma pedida a SCRUM-37 (ver
 * docs/historias/SCRUM-111.md); los filtros solo eligen filas de esa lista, no calculan nada.
 * El POST va al backend real: necesita que las ubicaciones simuladas existan en la base.
 */
import 'server-only';
import type {
  EntradaListado,
  ListadoEntradas,
  UbicacionInventario,
} from '@/compartido/api/respuestas';
import { json, type RutaSimulada } from './index';

const PRINCIPAL = { id: 1, nombre: 'Bodega principal' };
const SALA = { id: 2, nombre: 'Sala de ventas' };

export const UBICACIONES: UbicacionInventario[] = [
  { id: 1, codigo: 'A-01', bodega: PRINCIPAL },
  { id: 2, codigo: 'A-02', bodega: PRINCIPAL },
  { id: 3, codigo: 'B-01', bodega: PRINCIPAL },
  { id: 4, codigo: 'S-01', bodega: SALA },
];

export const ubicacion = (id: number) => {
  const { codigo, bodega } = UBICACIONES.find((u) => u.id === id)!;
  return { id, codigo, bodega: bodega.nombre };
};

const ENTRADAS: EntradaListado[] = [
  {
    id: 4,
    fechaRecepcion: '2026-10-28',
    tipoDocumento: 'factura',
    numeroDocumento: 'F-10452',
    proveedor: { id: 1, razonSocial: 'Proveedor de prueba Uno SpA' },
    ubicacion: ubicacion(1),
    cantidadFormatos: 2,
    unidades: 48,
    costoNetoTotal: 151200,
    registradoPor: { nombre: 'Usuario de prueba' },
  },
  {
    id: 3,
    fechaRecepcion: '2026-10-21',
    tipoDocumento: 'guia_despacho',
    numeroDocumento: 'G-877',
    proveedor: { id: 2, razonSocial: 'Proveedor de prueba Dos Ltda.' },
    ubicacion: ubicacion(3),
    cantidadFormatos: 1,
    unidades: 18,
    costoNetoTotal: 63000.5,
    registradoPor: { nombre: 'Administración' },
  },
  {
    id: 2,
    fechaRecepcion: '2026-10-14',
    tipoDocumento: 'factura',
    numeroDocumento: 'F-10351',
    proveedor: { id: 1, razonSocial: 'Proveedor de prueba Uno SpA' },
    ubicacion: ubicacion(4),
    cantidadFormatos: 3,
    unidades: 12,
    costoNetoTotal: 0,
    registradoPor: { nombre: 'Usuario de prueba' },
  },
  {
    id: 1,
    fechaRecepcion: '2026-09-05',
    tipoDocumento: 'factura',
    numeroDocumento: 'F-10320',
    proveedor: { id: 1, razonSocial: 'Proveedor de prueba Uno SpA' },
    ubicacion: ubicacion(2),
    cantidadFormatos: 1,
    unidades: 36,
    costoNetoTotal: 59400,
    registradoPor: { nombre: 'Usuario de prueba' },
  },
];

/** Elige filas de la lista fija según la consulta; `buscar=vacio` simula una lista vacía. */
const filtrar = (consulta: URLSearchParams) => {
  const bodegaId = Number(consulta.get('bodegaId'));
  const buscar = consulta.get('buscar')?.toLowerCase() ?? '';
  const desde = consulta.get('desde');
  const hasta = consulta.get('hasta');
  if (buscar === 'vacio') return [];
  return ENTRADAS.filter(
    (entrada) =>
      (!bodegaId ||
        UBICACIONES.find((u) => u.id === entrada.ubicacion.id)?.bodega.id ===
          bodegaId) &&
      (!buscar ||
        entrada.proveedor.razonSocial.toLowerCase().includes(buscar) ||
        entrada.numeroDocumento.toLowerCase().includes(buscar)) &&
      (!desde || entrada.fechaRecepcion >= desde) &&
      (!hasta || entrada.fechaRecepcion <= hasta),
  );
};

export const rutasPanelInventario: RutaSimulada[] = [
  {
    metodo: 'GET',
    ruta: '/inventario/ubicaciones',
    historia: 'SCRUM-111',
    responder: () => json(UBICACIONES),
  },
  {
    metodo: 'GET',
    ruta: '/inventario/entradas',
    historia: 'SCRUM-111',
    responder: ({ url }) => {
      const items = filtrar(url.searchParams);
      const listado: ListadoEntradas = {
        items,
        total: items.length,
        pagina: 1,
        limite: 20,
      };
      return json(listado);
    },
  },
];

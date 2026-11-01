/**
 * Rutas simuladas del stock y los movimientos del panel.
 *
 * SCRUM-114 · `GET /inventario/stock` y `GET /inventario/movimientos`: el backend solo tiene el
 * stock de un formato (`/inventario/stock/formatos/{id}`, que va al backend real). Datos fijos
 * con la forma pedida a SCRUM-40 (ver docs/historias/SCRUM-114.md): `bajoMinimo`,
 * `totalBajoMinimo` y el grupo de cada movimiento vienen escritos; los filtros solo eligen filas.
 */
import 'server-only';
import type {
  GrupoMovimientos,
  ListadoMovimientos,
  ListadoStock,
  MovimientoListado,
  StockListado,
} from '@/compartido/api/respuestas';
import { errorSimulado, json, type RutaSimulada } from './index';
import { UBICACIONES, ubicacion } from './panelInventario';

const PROVEEDOR_UNO = { id: 1, razonSocial: 'Proveedor de prueba Uno SpA' };
const PROVEEDOR_DOS = { id: 2, razonSocial: 'Proveedor de prueba Dos Ltda.' };

/** Con «Todas las bodegas». `bodegas` solo sirve para elegir filas al filtrar por bodega. */
const STOCK: (StockListado & { bodegas: number[] })[] = [
  {
    formatoId: 12,
    sku: 'TIN-71-60',
    producto: 'Tinte permanente',
    nombreFormato: 'Tono 7.1',
    imagen: null,
    ubicaciones: [{ id: 2, codigo: 'A-02' }],
    stock: 1,
    stockMinimo: 6,
    bajoMinimo: true,
    ultimaEntrada: { costoUnitarioNeto: 1650, proveedor: PROVEEDOR_UNO },
    bodegas: [1],
  },
  {
    formatoId: 11,
    sku: 'SH-REP-300',
    producto: 'Shampoo reparador',
    nombreFormato: '300 ml',
    imagen: null,
    ubicaciones: [
      { id: 1, codigo: 'A-01' },
      { id: 4, codigo: 'S-01' },
    ],
    stock: 2,
    stockMinimo: 5,
    bajoMinimo: true,
    ultimaEntrada: { costoUnitarioNeto: 4200, proveedor: PROVEEDOR_UNO },
    bodegas: [1, 2],
  },
  {
    formatoId: 13,
    sku: 'MAS-NUT-500',
    producto: 'Mascarilla nutritiva',
    nombreFormato: '500 g',
    imagen: null,
    ubicaciones: [{ id: 3, codigo: 'B-01' }],
    stock: 3,
    stockMinimo: 4,
    bajoMinimo: true,
    ultimaEntrada: { costoUnitarioNeto: 6300, proveedor: PROVEEDOR_DOS },
    bodegas: [1],
  },
  {
    formatoId: 14,
    sku: 'ACO-HID-300',
    producto: 'Acondicionador hidratante',
    nombreFormato: '300 ml',
    imagen: null,
    ubicaciones: [{ id: 1, codigo: 'A-01' }],
    stock: 22,
    stockMinimo: 5,
    bajoMinimo: false,
    ultimaEntrada: { costoUnitarioNeto: 3900.5, proveedor: PROVEEDOR_UNO },
    bodegas: [1],
  },
  {
    formatoId: 15,
    sku: 'SER-PUN-60',
    producto: 'Sérum de puntas',
    nombreFormato: '60 ml',
    imagen: null,
    ubicaciones: [],
    stock: 0,
    stockMinimo: null,
    bajoMinimo: false,
    ultimaEntrada: null,
    bodegas: [],
  },
];

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
const filtrarStock = (consulta: URLSearchParams) => {
  const bodegaId = Number(consulta.get('bodegaId'));
  const buscar = consulta.get('buscar')?.toLowerCase() ?? '';
  if (buscar === 'vacio') return [];
  return STOCK.filter(
    (fila) =>
      (!bodegaId || fila.bodegas.includes(bodegaId)) &&
      contiene(`${fila.producto} ${fila.nombreFormato} ${fila.sku}`, buscar),
  );
};

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
    ruta: '/inventario/stock',
    historia: 'SCRUM-114',
    responder: ({ peticion, url }) => {
      const noAutorizado = sinSesion(peticion);
      if (noAutorizado) return noAutorizado;
      const filas = filtrarStock(url.searchParams);
      const bajo = filas.filter((fila) => fila.bajoMinimo);
      const elegidas =
        url.searchParams.get('bajoMinimo') === 'true' ? bajo : filas;
      const listado: ListadoStock = {
        items: elegidas.map(({ bodegas: _bodegas, ...fila }) => fila),
        total: elegidas.length,
        pagina: 1,
        limite: 20,
        totalBajoMinimo: bajo.length,
      };
      return json(listado);
    },
  },
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

/**
 * Solo para las pruebas de Productos: datos de ejemplo, el backend simulado en el borde
 * (`fetch`, como pide CLAUDE.md) y la pantalla con su cliente de consultas.
 */
import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import { vi } from 'vitest';
import type {
  CategoriaTienda,
  FormatoPanel,
  ListadoProductosPanel,
  MarcaPanel,
  ProductoListadoPanel,
  ProductoPanel,
} from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { Toaster } from '@/compartido/ui/sonner';

export const MARCAS: MarcaPanel[] = [
  { id: 1, nombre: 'Kérastase', activa: true },
  { id: 2, nombre: 'Wella', activa: true },
];

export const ARBOL: CategoriaTienda[] = [
  {
    id: 2,
    nombre: 'Shampoo',
    descripcion: null,
    padreId: null,
    subcategorias: [
      {
        id: 4,
        nombre: 'Reparación',
        descripcion: null,
        padreId: 2,
        subcategorias: [],
      },
    ],
  },
];

export const producto = (
  extra: Partial<ProductoPanel> = {},
): ProductoPanel => ({
  id: 7,
  nombre: 'Shampoo reparador',
  descripcion: 'Repara el cabello dañado.',
  origenDescripcion: 'manual',
  canalVenta: 'general',
  activo: true,
  marca: { id: 1, nombre: 'Kérastase' },
  categoria: { id: 4, nombre: 'Reparación' },
  ...extra,
});

export const formato = (extra: Partial<FormatoPanel> = {}): FormatoPanel => ({
  id: 21,
  productoId: 7,
  sku: 'SH-REP-300',
  codigoBarras: '7801234567890',
  nombreFormato: '300 ml',
  contenido: 300,
  unidadMedida: 'ml',
  fechaVencimiento: null,
  stockMinimo: 5,
  pesoGramos: 320,
  altoCm: 18.5,
  anchoCm: 6,
  largoCm: 4,
  esPredeterminado: true,
  activo: true,
  imagenes: [],
  ...extra,
});

export const filaListado = (
  extra: Partial<ProductoListadoPanel> = {},
): ProductoListadoPanel => ({
  ...producto(),
  imagen: null,
  formatos: 2,
  precioDesde: 12990,
  stockTotal: 18,
  stockBajo: false,
  ...extra,
});

export const listado = (
  items: ProductoListadoPanel[],
  extra: Partial<ListadoProductosPanel> = {},
): ListadoProductosPanel => ({
  items,
  total: items.length,
  pagina: 1,
  limite: 20,
  conteos: { todos: 86, exclusivos: 9, stockBajo: 4, inactivos: 3 },
  ...extra,
});

export const error = (status: number, message: string | string[]) =>
  Response.json({ statusCode: status, message }, { status });

type Manejador = (peticion: Request) => Response | Promise<Response>;

/**
 * Backend simulado: marcas y categorías siempre; lo demás por «MÉTODO /ruta». Guarda las
 * peticiones (ruta con su consulta) y los cuerpos enviados, en orden.
 */
export const simularBackend = (rutas: Record<string, Manejador>) => {
  const pedidas: string[] = [];
  const enviados: unknown[] = [];
  const fetch = vi.fn(async (peticion: Request) => {
    const url = new URL(peticion.url);
    pedidas.push(`${peticion.method} ${url.pathname}${url.search}`);
    if (peticion.method !== 'GET') {
      const texto = await peticion.clone().text();
      if (texto) enviados.push(JSON.parse(texto));
    }
    const clave = `${peticion.method} ${url.pathname}`;
    if (clave === 'GET /api/catalogo/marcas') return Response.json(MARCAS);
    if (clave === 'GET /api/catalogo/categorias') return Response.json(ARBOL);
    const manejador = rutas[clave];
    if (!manejador) throw new Error(`Petición no simulada: ${clave}`);
    return manejador(peticion);
  });
  vi.stubGlobal('fetch', fetch);
  return { pedidas, enviados };
};

export const iniciarSesion = () => {
  reiniciarParaPruebas();
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: {
        codigoPublico: 'admin-1',
        nombre: 'Violeta',
        apellido: 'Ramírez',
        rol: 'administrador',
      },
    }),
  );
};

export const mostrar = (pantalla: ReactNode) =>
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      {pantalla}
      <Toaster />
    </QueryClientProvider>,
  );

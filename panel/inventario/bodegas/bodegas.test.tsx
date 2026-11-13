import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { BodegaPanel } from '@/compartido/api/respuestas';
import { crearClienteDeConsultas } from '@/compartido/proveedores';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import type { Rol } from '@/compartido/sesion/roles';
import { Toaster } from '@/compartido/ui/sonner';
import { puedeAbrir } from '@/panel/diseno/secciones';
import {
  RUTAS_UBICACIONES,
  responder,
  simularBackend,
} from '@/tienda/cuenta/cuentaDePrueba';
import { PantallaBodegas } from './pantallaBodegas';

vi.mock('@/compartido/api/cliente', async (original) => {
  const { middlewareDeSesion } =
    await original<typeof import('@/compartido/api/cliente')>();
  const { default: createClient } = await import('openapi-fetch');
  const api = createClient<paths>({
    baseUrl: 'http://tienda.test',
    fetch: (peticion) => globalThis.fetch(peticion),
  });
  api.use(middlewareDeSesion);
  return { api, middlewareDeSesion };
});
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/panel/inventario/bodegas',
}));

const RUTA = '/api/inventario/bodegas';

const CENTRAL: BodegaPanel = {
  id: 2,
  nombre: 'Bodega central',
  direccion: 'Av. Matta 1234',
  tipo: 'bodega',
  abasteceVentaOnline: true,
  activa: true,
  esDespacho: false,
  comuna: { codigoCut: '13120', nombre: 'Ñuñoa' },
  region: { codigoCut: '13', nombre: 'Metropolitana de Santiago' },
  stock: 40,
  ubicaciones: [
    {
      id: 4,
      codigo: 'A-01',
      zona: 'Norte',
      pasillo: '2',
      estante: null,
      nivel: null,
      activa: true,
      stock: 40,
    },
  ],
};

const mostrar = (rol: Rol = 'administrador') => {
  act(() =>
    guardarSesion({
      tokenAcceso: 'token',
      expiraEn: 900,
      usuario: { codigoPublico: 'u-1', nombre: 'Rosa', apellido: 'Pérez', rol },
    }),
  );
  render(
    <QueryClientProvider client={crearClienteDeConsultas()}>
      <PantallaBodegas />
      <Toaster />
    </QueryClientProvider>,
  );
};

const elegir = async (
  usuario: ReturnType<typeof userEvent.setup>,
  dentro: HTMLElement,
  campo: RegExp,
  opcion: string,
) => {
  const selector = within(dentro).getByRole('combobox', { name: campo });
  await waitFor(() => expect(selector).toBeEnabled());
  await usuario.click(selector);
  await usuario.click(await screen.findByRole('option', { name: opcion }));
};

beforeEach(() => reiniciarParaPruebas());
afterEach(() => vi.unstubAllGlobals());

describe('Bodegas y ubicaciones (SCRUM-151)', () => {
  it('SCRUM-151 · listado: cada bodega con su tipo, dirección, stock y ubicaciones', async () => {
    simularBackend({ [`GET ${RUTA}`]: () => responder([CENTRAL]) });
    mostrar();

    const tarjeta = await screen.findByRole('region', {
      name: 'Bodega central',
    });
    expect(tarjeta).toHaveTextContent('Bodega');
    expect(tarjeta).toHaveTextContent('Av. Matta 1234, Ñuñoa');
    expect(tarjeta).toHaveTextContent('40 unidades');
    const ubicaciones = within(tarjeta).getByRole('list', {
      name: 'Ubicaciones de Bodega central',
    });
    expect(ubicaciones).toHaveTextContent('A-01');
    expect(ubicaciones).toHaveTextContent(
      'Zona Norte · Pasillo 2 · 40 unidades',
    );
    expect(screen.getByRole('link', { name: 'Bodegas' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('SCRUM-151 · CA1 crear bodega: envía nombre, tipo, dirección, comuna y si abastece la venta online', async () => {
    const usuario = userEvent.setup();
    const escrituras = simularBackend({
      ...RUTAS_UBICACIONES,
      [`GET ${RUTA}`]: () => responder([]),
      [`POST ${RUTA}`]: () =>
        responder(
          { ...CENTRAL, id: 9, nombre: 'Sala Ñuñoa', ubicaciones: [] },
          201,
        ),
    });
    mostrar();

    expect(await screen.findByText(/Aún no hay bodegas/)).toBeInTheDocument();
    await usuario.click(
      screen.getAllByRole('button', { name: 'Nueva bodega' })[0]!,
    );
    const formulario = await screen.findByRole('form', {
      name: 'Nueva bodega',
    });
    await usuario.type(
      within(formulario).getByLabelText(/Nombre/),
      'Sala Ñuñoa',
    );
    await usuario.click(
      within(formulario).getByRole('radio', { name: 'Tienda' }),
    );
    await usuario.type(
      within(formulario).getByLabelText(/Dirección/),
      'Irarrázaval 100',
    );
    await elegir(usuario, formulario, /Región/, 'Metropolitana de Santiago');
    await elegir(usuario, formulario, /Comuna/, 'Ñuñoa');
    await usuario.click(
      within(formulario).getByRole('checkbox', {
        name: 'Abastece la venta online',
      }),
    );
    await usuario.click(
      within(formulario).getByRole('button', { name: 'Crear bodega' }),
    );

    await waitFor(() =>
      expect(
        escrituras.find((e) => e.peticion === `POST ${RUTA}`)?.cuerpo,
      ).toEqual({
        nombre: 'Sala Ñuñoa',
        tipo: 'tienda',
        direccion: 'Irarrázaval 100',
        comuna: '13120',
        abasteceVentaOnline: false,
      }),
    );
    expect(
      await screen.findByText('Creamos «Sala Ñuñoa».'),
    ).toBeInTheDocument();
  });

  it('SCRUM-151 · CA2 desactivar con stock: muestra el rechazo del backend y la bodega sigue activa', async () => {
    const usuario = userEvent.setup();
    simularBackend({
      [`GET ${RUTA}`]: () => responder([CENTRAL]),
      [`PATCH ${RUTA}/2`]: () =>
        responder(
          {
            statusCode: 409,
            message:
              'La bodega todavía tiene stock: transfiérelo o ajústalo a cero antes de desactivarla.',
          },
          409,
        ),
    });
    mostrar();

    const interruptor = await screen.findByRole('switch', {
      name: 'Bodega Bodega central activa',
    });
    await usuario.click(interruptor);

    expect(
      await screen.findByText(/La bodega todavía tiene stock/),
    ).toBeInTheDocument();
    expect(interruptor).toBeChecked();
  });

  it('SCRUM-151 · CA3 ubicación nueva: el código repetido queda junto al campo, sin perder lo escrito', async () => {
    const usuario = userEvent.setup();
    simularBackend({
      [`GET ${RUTA}`]: () => responder([CENTRAL]),
      [`POST ${RUTA}/2/ubicaciones`]: () =>
        responder(
          {
            statusCode: 409,
            message: 'Esa bodega ya tiene una ubicación con ese código.',
            errores: [
              {
                campo: 'codigo',
                mensaje: 'Esa bodega ya tiene una ubicación con ese código.',
              },
            ],
          },
          409,
        ),
    });
    mostrar();

    await usuario.click(
      await screen.findByRole('button', { name: 'Agregar ubicación' }),
    );
    const formulario = await screen.findByRole('form', {
      name: 'Nueva ubicación',
    });
    await usuario.type(within(formulario).getByLabelText(/Código/), 'a-01');
    await usuario.click(
      within(formulario).getByRole('button', { name: 'Agregar ubicación' }),
    );

    const mensaje = await within(formulario).findByText(
      'Esa bodega ya tiene una ubicación con ese código.',
    );
    expect(within(formulario).getByLabelText(/Código/)).toHaveAttribute(
      'aria-describedby',
      mensaje.id,
    );
    expect(within(formulario).getByLabelText(/Código/)).toHaveValue('a-01');
  });

  it('SCRUM-153 · CA1 «Usar para los despachos» marca la bodega de despacho', async () => {
    const usuario = userEvent.setup();
    const escrituras = simularBackend({
      [`GET ${RUTA}`]: () => responder([CENTRAL]),
      [`PATCH ${RUTA}/2`]: () => responder({ ...CENTRAL, esDespacho: true }),
    });
    mostrar();

    await usuario.click(
      await screen.findByRole('button', { name: /Usar para los despachos/ }),
    );

    await waitFor(() =>
      expect(
        escrituras.find((e) => e.peticion === `PATCH ${RUTA}/2`)?.cuerpo,
      ).toEqual({ esDespacho: true }),
    );
  });

  it('SCRUM-151 · solo el administrador abre Bodegas; el bodeguero no ve la pestaña', () => {
    expect(puedeAbrir('administrador', '/panel/inventario/bodegas')).toBe(true);
    expect(puedeAbrir('bodeguero', '/panel/inventario/bodegas')).toBe(false);
    expect(puedeAbrir('bodeguero', '/panel/inventario')).toBe(true);
  });
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import {
  guardarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { MenuCelular } from '@/tienda/diseno/menuCelular';
import {
  DATOS,
  mostrarMisDatos,
  responder,
  simularBackend,
} from './cuentaDePrueba';

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
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => '/cuenta/datos',
}));

/** Backend con los datos de la cuenta y sin direcciones; `guardar` responde el PATCH. */
const conDatos = (guardar: (cuerpo: unknown) => Response) =>
  simularBackend({
    'GET /api/cuentas/yo': () => responder(DATOS),
    'GET /api/cuentas/yo/direcciones': () => responder([]),
    'PATCH /api/cuentas/yo': guardar,
  });

const tarjetaDatos = async () =>
  screen.findByRole('form', { name: 'Datos personales' });

beforeEach(() => reiniciarParaPruebas());

afterEach(() => {
  reiniciarParaPruebas();
  vi.unstubAllGlobals();
});

describe('SCRUM-97 · Mis datos', () => {
  it('E1-H5 FE · editar datos: guarda solo lo que cambió y muestra los datos actualizados', async () => {
    const escrituras = conDatos((cuerpo) =>
      responder({ ...DATOS, ...(cuerpo as object) }),
    );
    mostrarMisDatos();
    const tarjeta = await tarjetaDatos();
    expect(within(tarjeta).getByLabelText(/Nombre/)).toHaveValue('Camila');
    expect(
      within(tarjeta).getByLabelText('Correo electrónico'),
    ).toHaveAttribute('readonly');
    const guardar = within(tarjeta).getByRole('button', {
      name: 'Guardar cambios',
    });
    expect(guardar).toBeDisabled();
    const usuario = userEvent.setup();

    const apellido = within(tarjeta).getByLabelText(/Apellido/);
    await usuario.clear(apellido);
    await usuario.type(apellido, 'Rojas Soto');
    await usuario.click(guardar);

    expect(escrituras).toEqual([
      { peticion: 'PATCH /api/cuentas/yo', cuerpo: { apellido: 'Rojas Soto' } },
    ]);
    expect(await within(tarjeta).findByRole('status')).toHaveTextContent(
      'Guardamos tus cambios.',
    );
    expect(apellido).toHaveValue('Rojas Soto');
    expect(guardar).toBeDisabled();
  });

  it('E1-H5 FE · editar datos: borrar un dato opcional lo envía vacío (null) y el RUT en formato único', async () => {
    const escrituras = conDatos((cuerpo) =>
      responder({ ...DATOS, ...(cuerpo as object) }),
    );
    mostrarMisDatos();
    const tarjeta = await tarjetaDatos();
    const usuario = userEvent.setup();

    await usuario.clear(within(tarjeta).getByLabelText('Teléfono'));
    await usuario.type(within(tarjeta).getByLabelText('RUT'), '7.654.321-6');
    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Guardar cambios' }),
    );

    expect(escrituras[0]?.cuerpo).toEqual({
      telefono: null,
      rut: '7654321-6',
    });
    // Lo que devuelve el backend se muestra con puntos
    expect(within(tarjeta).getByLabelText('RUT')).toHaveValue('7.654.321-6');
  });

  it('E1-H5 FE · editar datos: valida antes de enviar y no llama al backend', async () => {
    const escrituras = conDatos(() => responder(DATOS));
    mostrarMisDatos();
    const tarjeta = await tarjetaDatos();
    const usuario = userEvent.setup();

    await usuario.clear(within(tarjeta).getByLabelText(/Nombre/));
    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Guardar cambios' }),
    );

    expect(
      within(tarjeta).getByLabelText(/Nombre/),
    ).toHaveAccessibleDescription('Escribe tu nombre.');
    expect(escrituras).toEqual([]);
  });

  it('E1-H5 FE · RUT repetido: muestra el error junto al campo y conserva lo escrito', async () => {
    conDatos(() =>
      responder(
        { statusCode: 409, message: 'Ese RUT ya está en uso en otra cuenta.' },
        409,
      ),
    );
    mostrarMisDatos();
    const tarjeta = await tarjetaDatos();
    const usuario = userEvent.setup();
    const rut = within(tarjeta).getByLabelText('RUT');

    await usuario.type(rut, '11.111.111-1');
    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Guardar cambios' }),
    );

    expect(rut).toHaveAccessibleDescription(
      'Ese RUT ya está en uso en otra cuenta.',
    );
    expect(rut).toHaveValue('11.111.111-1');
    expect(rut).toHaveFocus();
  });

  it('E1-H5 FE · RUT repetido: el RUT de un profesional que no se puede cambiar también va junto al campo', async () => {
    const mensaje =
      'Tu RUT quedó registrado en la verificación profesional y no se puede cambiar. Si hay un error, contacta a la tienda.';
    conDatos(() => responder({ statusCode: 403, message: mensaje }, 403));
    mostrarMisDatos();
    const tarjeta = await tarjetaDatos();
    const usuario = userEvent.setup();

    await usuario.type(within(tarjeta).getByLabelText('RUT'), '11.111.111-1');
    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Guardar cambios' }),
    );

    expect(within(tarjeta).getByLabelText('RUT')).toHaveAccessibleDescription(
      mensaje,
    );
  });

  it('E1-H5 FE · editar datos: un error del servidor se muestra sin detalles técnicos', async () => {
    conDatos(() =>
      responder(
        { statusCode: 500, message: 'PrismaClientKnownRequestError' },
        500,
      ),
    );
    mostrarMisDatos();
    const tarjeta = await tarjetaDatos();
    const usuario = userEvent.setup();

    await usuario.type(within(tarjeta).getByLabelText('Teléfono'), '9');
    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Guardar cambios' }),
    );

    expect(await within(tarjeta).findByRole('alert')).toHaveTextContent(
      'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
    );
    expect(tarjeta).not.toHaveTextContent('Prisma');
  });

  it('E1-H5 FE · editar datos: con demasiadas ediciones (429) avisa sin perder lo escrito', async () => {
    conDatos(() =>
      responder(
        {
          statusCode: 429,
          message: 'Hiciste muchos cambios. Intenta de nuevo en una hora.',
        },
        429,
      ),
    );
    mostrarMisDatos();
    const tarjeta = await tarjetaDatos();
    const usuario = userEvent.setup();
    const telefono = within(tarjeta).getByLabelText('Teléfono');

    await usuario.type(telefono, '9');
    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Guardar cambios' }),
    );

    expect(await within(tarjeta).findByRole('alert')).toHaveTextContent(
      'Hiciste muchos cambios. Intenta de nuevo en una hora.',
    );
    expect(telefono).toHaveValue('+569123456789');
  });

  it('E1-H5 FE · editar datos: sin conexión al abrir, muestra un mensaje sin detalles técnicos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    );
    mostrarMisDatos();

    const tarjeta = await screen.findByRole('region', {
      name: 'Datos personales',
    });
    expect(await within(tarjeta).findByRole('alert')).toHaveTextContent(
      'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
    );
  });

  it('E1-H5 FE · menú de cuenta: en escritorio, el menú lateral lleva a Mis datos y Direcciones', async () => {
    conDatos(() => responder(DATOS));
    mostrarMisDatos();
    const menu = screen.getByRole('navigation', { name: 'Mi cuenta' });

    expect(
      within(menu).getByRole('link', { name: 'Mis datos' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      within(menu).getByRole('link', { name: 'Direcciones' }),
    ).toHaveAttribute('href', '/cuenta/datos#direcciones');
    expect(
      await screen.findByRole('region', { name: 'Direcciones' }),
    ).toHaveAttribute('id', 'direcciones');
  });

  it('E1-H5 FE · menú de cuenta: en celular, el menú del header lleva a Mis pedidos y Mis datos', async () => {
    act(() =>
      guardarSesion({
        tokenAcceso: 'token',
        expiraEn: 900,
        usuario: {
          codigoPublico: 'u-1',
          nombre: 'Camila',
          apellido: 'Rojas',
          rol: 'cliente',
        },
      }),
    );
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MenuCelular categorias={[]} marcas={[]} />
      </QueryClientProvider>,
    );

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Abrir menú' }));
    const menu = screen.getByRole('dialog', { name: 'Menú' });

    expect(
      within(menu).getByRole('link', { name: 'Mis datos' }),
    ).toHaveAttribute('href', '/cuenta/datos');
    expect(
      within(menu).getByRole('link', { name: 'Mis pedidos' }),
    ).toHaveAttribute('href', '/cuenta/pedidos');
  });
});

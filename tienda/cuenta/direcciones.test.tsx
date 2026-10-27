import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { DireccionCuenta } from '@/compartido/api/respuestas';
import { reiniciarParaPruebas } from '@/compartido/sesion/almacen';
import {
  DATOS,
  direccion,
  mostrarMisDatos,
  responder,
  RUTAS_UBICACIONES,
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

const CASA = direccion(1, 'Av. Ejemplo', true);
const TRABAJO = direccion(2, 'Calle Muestra', false, {
  codigoCut: '13123',
  nombre: 'Providencia',
});

/**
 * Backend con una lista de direcciones que cambia con cada escritura, como el real: así la
 * pantalla muestra lo que vuelve a pedir después de guardar.
 */
const conDirecciones = (
  inicial: DireccionCuenta[],
  escrituras: Record<string, (cuerpo: unknown) => Response> = {},
) => {
  let lista = inicial;
  const registro = simularBackend({
    ...RUTAS_UBICACIONES,
    'GET /api/cuentas/yo': () => responder(DATOS),
    'GET /api/cuentas/yo/direcciones': () => responder(lista),
    ...escrituras,
  });
  return {
    registro,
    cambiarLista: (nueva: DireccionCuenta[]) => {
      lista = nueva;
    },
  };
};

const tarjetaDirecciones = () =>
  screen.findByRole('region', { name: 'Direcciones' });

beforeEach(() => reiniciarParaPruebas());

afterEach(() => {
  reiniciarParaPruebas();
  vi.unstubAllGlobals();
});

describe('SCRUM-97 · Direcciones', () => {
  it('E1-H5 FE · direcciones: la principal va primero y es la única marcada', async () => {
    conDirecciones([CASA, TRABAJO]);
    mostrarMisDatos();
    const tarjeta = await tarjetaDirecciones();

    const tarjetas = await within(tarjeta).findAllByRole('article');
    expect(tarjetas.map((t) => t.textContent)).toEqual([
      expect.stringContaining('Av. Ejemplo 1001 · Principal'),
      expect.stringContaining('Calle Muestra 1002'),
    ]);
    expect(within(tarjetas[0]!).getByRole('heading')).toHaveTextContent(
      'Av. Ejemplo 1001 · Principal',
    );
    expect(tarjetas[0]).toHaveTextContent('Ñuñoa, Metropolitana de Santiago');
    expect(within(tarjeta).getAllByText(/· Principal/)).toHaveLength(1);
    expect(
      within(tarjetas[0]!).queryByRole('button', { name: /como principal/ }),
    ).not.toBeInTheDocument();
  });

  it('E1-H5 FE · direcciones: sin direcciones, lo dice y ofrece agregar una', async () => {
    conDirecciones([]);
    mostrarMisDatos();
    const tarjeta = await tarjetaDirecciones();

    expect(
      await within(tarjeta).findByText('Aún no tienes direcciones.'),
    ).toBeInTheDocument();
    expect(
      within(tarjeta).getByRole('button', { name: 'Agregar dirección' }),
    ).toBeInTheDocument();
  });

  it('E1-H5 FE · direcciones: agrega una con región y comuna de la lista oficial', async () => {
    const backend = conDirecciones([CASA], {
      'POST /api/cuentas/yo/direcciones': () => {
        backend.cambiarLista([CASA, TRABAJO]);
        return responder(TRABAJO, 201);
      },
    });
    mostrarMisDatos();
    const tarjeta = await tarjetaDirecciones();
    const usuario = userEvent.setup();

    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Agregar dirección' }),
    );
    const dialogo = screen.getByRole('dialog', { name: 'Agregar dirección' });
    const comuna = within(dialogo).getByLabelText(/Comuna/);
    expect(comuna).toBeDisabled();
    await usuario.selectOptions(
      await within(dialogo).findByLabelText(/Región/),
      await within(dialogo).findByRole('option', {
        name: 'Metropolitana de Santiago',
      }),
    );
    await usuario.selectOptions(
      comuna,
      await within(dialogo).findByRole('option', { name: 'Providencia' }),
    );
    await usuario.type(
      within(dialogo).getByLabelText(/Calle/),
      'Calle Muestra',
    );
    await usuario.type(within(dialogo).getByLabelText(/Número/), '1002');
    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Guardar dirección' }),
    );

    expect(backend.registro).toEqual([
      {
        peticion: 'POST /api/cuentas/yo/direcciones',
        cuerpo: {
          calle: 'Calle Muestra',
          numero: '1002',
          comuna: '13123',
          esPrincipal: false,
        },
      },
    ]);
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(
      await within(tarjeta).findByRole('article', {
        name: 'Calle Muestra 1002',
      }),
    ).toBeInTheDocument();
  });

  it('E1-H5 FE · direcciones: al cambiar la región se vuelve a elegir la comuna', async () => {
    conDirecciones([]);
    mostrarMisDatos();
    const tarjeta = await tarjetaDirecciones();
    const usuario = userEvent.setup();

    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Agregar dirección' }),
    );
    const dialogo = screen.getByRole('dialog');
    const region = await within(dialogo).findByLabelText(/Región/);
    const comuna = within(dialogo).getByLabelText(/Comuna/);
    await usuario.selectOptions(
      region,
      await within(dialogo).findByRole('option', {
        name: 'Metropolitana de Santiago',
      }),
    );
    await usuario.selectOptions(
      comuna,
      await within(dialogo).findByRole('option', { name: 'Ñuñoa' }),
    );

    await usuario.selectOptions(
      region,
      within(dialogo).getByRole('option', { name: 'Valparaíso' }),
    );

    expect(comuna).toHaveValue('');
    expect(
      await within(dialogo).findByRole('option', { name: 'Viña del Mar' }),
    ).toBeInTheDocument();
    expect(
      within(dialogo).queryByRole('option', { name: 'Ñuñoa' }),
    ).not.toBeInTheDocument();
  });

  it('E1-H5 FE · direcciones: valida los campos obligatorios antes de enviar', async () => {
    const { registro } = conDirecciones([]);
    mostrarMisDatos();
    const tarjeta = await tarjetaDirecciones();
    const usuario = userEvent.setup();

    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Agregar dirección' }),
    );
    const dialogo = screen.getByRole('dialog');
    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Guardar dirección' }),
    );

    expect(
      within(dialogo).getByLabelText(/Región/),
    ).toHaveAccessibleDescription('Elige una región.');
    expect(within(dialogo).getByLabelText(/Calle/)).toHaveAccessibleDescription(
      'Escribe la calle.',
    );
    expect(registro).toEqual([]);
  });

  it('E1-H5 FE · direcciones: edita una dirección con sus datos ya cargados', async () => {
    const backend = conDirecciones([CASA, TRABAJO], {
      'PATCH /api/cuentas/yo/direcciones/2': (cuerpo) =>
        responder({ ...TRABAJO, ...(cuerpo as object) }),
    });
    mostrarMisDatos();
    const tarjeta = await tarjetaDirecciones();
    const usuario = userEvent.setup();

    await usuario.click(
      await within(tarjeta).findByRole('button', {
        name: 'Editar Calle Muestra 1002',
      }),
    );
    const dialogo = screen.getByRole('dialog', { name: 'Editar dirección' });
    await waitFor(() =>
      expect(within(dialogo).getByLabelText(/Comuna/)).toHaveValue('13123'),
    );
    expect(within(dialogo).getByLabelText(/Región/)).toHaveValue('13');
    expect(
      within(dialogo).queryByLabelText('Dejarla como principal'),
    ).not.toBeInTheDocument();
    const referencia = within(dialogo).getByLabelText('Referencia');
    await usuario.type(referencia, 'Oficina 12');
    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Guardar dirección' }),
    );

    expect(backend.registro).toEqual([
      {
        peticion: 'PATCH /api/cuentas/yo/direcciones/2',
        cuerpo: {
          calle: 'Calle Muestra',
          numero: '1002',
          comuna: '13123',
          referencia: 'Oficina 12',
        },
      },
    ]);
  });

  it('E1-H5 FE · direcciones: elimina una dirección tras confirmar', async () => {
    const backend = conDirecciones([CASA, TRABAJO], {
      'DELETE /api/cuentas/yo/direcciones/2': () => {
        backend.cambiarLista([CASA]);
        return responder(undefined, 204);
      },
    });
    mostrarMisDatos();
    const tarjeta = await tarjetaDirecciones();
    const usuario = userEvent.setup();

    await usuario.click(
      await within(tarjeta).findByRole('button', {
        name: 'Editar Calle Muestra 1002',
      }),
    );
    await usuario.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Eliminar dirección',
      }),
    );
    await usuario.click(
      within(
        screen.getByRole('alertdialog', { name: '¿Eliminar esta dirección?' }),
      ).getByRole('button', { name: 'Eliminar' }),
    );

    expect(backend.registro).toEqual([
      { peticion: 'DELETE /api/cuentas/yo/direcciones/2', cuerpo: undefined },
    ]);
    await waitFor(() =>
      expect(
        within(tarjeta).queryByRole('article', { name: 'Calle Muestra 1002' }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('E1-H5 FE · direcciones: marcar otra como principal deja una sola principal', async () => {
    const backend = conDirecciones([CASA, TRABAJO], {
      'PATCH /api/cuentas/yo/direcciones/2/principal': () => {
        backend.cambiarLista([
          { ...TRABAJO, esPrincipal: true },
          { ...CASA, esPrincipal: false },
        ]);
        return responder({ ...TRABAJO, esPrincipal: true });
      },
    });
    mostrarMisDatos();
    const tarjeta = await tarjetaDirecciones();

    await userEvent.setup().click(
      await within(tarjeta).findByRole('button', {
        name: 'Marcar como principal',
        description: 'Calle Muestra 1002',
      }),
    );

    expect(backend.registro).toEqual([
      {
        peticion: 'PATCH /api/cuentas/yo/direcciones/2/principal',
        cuerpo: undefined,
      },
    ]);
    expect(
      await within(tarjeta).findByText('Calle Muestra 1002 · Principal'),
    ).toBeInTheDocument();
    expect(within(tarjeta).getAllByText(/· Principal/)).toHaveLength(1);
  });

  it('E1-H5 FE · direcciones: el error del backend sobre la comuna va junto a su campo', async () => {
    conDirecciones([], {
      'POST /api/cuentas/yo/direcciones': () =>
        responder({ statusCode: 400, message: 'La comuna no existe.' }, 400),
    });
    mostrarMisDatos();
    const tarjeta = await tarjetaDirecciones();
    const usuario = userEvent.setup();

    await usuario.click(
      within(tarjeta).getByRole('button', { name: 'Agregar dirección' }),
    );
    const dialogo = screen.getByRole('dialog');
    await usuario.selectOptions(
      await within(dialogo).findByLabelText(/Región/),
      await within(dialogo).findByRole('option', {
        name: 'Metropolitana de Santiago',
      }),
    );
    await usuario.selectOptions(
      within(dialogo).getByLabelText(/Comuna/),
      await within(dialogo).findByRole('option', { name: 'Ñuñoa' }),
    );
    await usuario.type(within(dialogo).getByLabelText(/Calle/), 'Av. Ejemplo');
    await usuario.type(within(dialogo).getByLabelText(/Número/), '1');
    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Guardar dirección' }),
    );

    expect(
      await within(dialogo).findByText('La comuna no existe.'),
    ).toBeInTheDocument();
    expect(
      within(dialogo).getByLabelText(/Comuna/),
    ).toHaveAccessibleDescription('La comuna no existe.');
    expect(within(dialogo).getByLabelText(/Calle/)).toHaveValue('Av. Ejemplo');
  });

  it('E1-H5 FE · direcciones: si no se puede marcar como principal, lo dice en la tarjeta', async () => {
    conDirecciones([CASA, TRABAJO], {
      'PATCH /api/cuentas/yo/direcciones/2/principal': () =>
        responder({ statusCode: 404, message: 'La dirección no existe.' }, 404),
    });
    mostrarMisDatos();
    const tarjeta = await tarjetaDirecciones();

    await userEvent.setup().click(
      await within(tarjeta).findByRole('button', {
        name: 'Marcar como principal',
      }),
    );

    expect(
      await within(
        within(tarjeta).getByRole('article', { name: 'Calle Muestra 1002' }),
      ).findByRole('alert'),
    ).toHaveTextContent('La dirección no existe.');
  });

  it('E1-H5 FE · direcciones: sin conexión, la lista muestra un mensaje sin detalles técnicos', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    );
    mostrarMisDatos();
    const tarjeta = await tarjetaDirecciones();

    expect(await within(tarjeta).findByRole('alert')).toHaveTextContent(
      'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
    );
    expect(tarjeta).not.toHaveTextContent('Failed to fetch');
  });
});

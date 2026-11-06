import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { PerfilProfesionalCuenta } from '@/compartido/api/respuestas';
import { reiniciarParaPruebas } from '@/compartido/sesion/almacen';
import {
  mostrarPantallaCuenta,
  responder,
  simularBackend,
} from '@/tienda/cuenta/cuentaDePrueba';
import { PantallaPerfilProfesional } from './pantallaPerfilProfesional';

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
  usePathname: () => '/cuenta/perfil-profesional',
}));

const PERFIL: PerfilProfesionalCuenta = {
  anosExperiencia: 6,
  modalidad: 'arriendo_sillon',
  especialidades: ['coloracion_tinturas', 'alisados'],
  nombreLugarTrabajo: 'Salón Bella Vista',
  redSocial: 'https://www.instagram.com/bellavista.salon',
  fechaActualizacion: '2026-11-04T15:00:00.000Z',
};

const SIN_PERFIL = () =>
  responder(
    { statusCode: 404, message: 'Aún no completas tu perfil profesional.' },
    404,
  );

/** Lo que llegó al backend, «MÉTODO /ruta». */
const peticiones = () =>
  vi
    .mocked(globalThis.fetch)
    .mock.calls.map(([entrada]) =>
      entrada instanceof Request
        ? `${entrada.method} ${new URL(entrada.url).pathname}`
        : String(entrada),
    );

const abrir = (rol: 'cliente' | 'profesional' = 'profesional') =>
  mostrarPantallaCuenta(<PantallaPerfilProfesional />, undefined, rol);

beforeEach(() => reiniciarParaPruebas());

afterEach(() => {
  reiniciarParaPruebas();
  vi.unstubAllGlobals();
});

describe('E10-H5 FE · Perfil profesional', () => {
  it('E10-H5 FE · guardar perfil: envía los datos, confirma y muestra el perfil', async () => {
    const escrituras = simularBackend({
      'GET /api/perfil-profesional/yo': SIN_PERFIL,
      'PUT /api/perfil-profesional/yo': (cuerpo) =>
        responder({
          ...(cuerpo as object),
          fechaActualizacion: '2026-11-04T15:00:00.000Z',
        }),
    });
    abrir();
    const usuario = userEvent.setup();

    await usuario.type(
      await screen.findByLabelText(/Años de experiencia/),
      '6',
    );
    await usuario.type(
      screen.getByLabelText('Lugar de trabajo (opcional)'),
      '  Salón Bella Vista ',
    );
    await usuario.click(screen.getByRole('radio', { name: 'Salón propio' }));
    await usuario.click(
      screen.getByRole('checkbox', { name: 'Coloración y tinturas' }),
    );
    await usuario.click(
      screen.getByRole('checkbox', { name: 'Novias y eventos' }),
    );
    await usuario.click(screen.getByRole('button', { name: 'Guardar perfil' }));

    expect(
      await screen.findByText('Guardamos tu perfil profesional.'),
    ).toBeInTheDocument();
    expect(escrituras).toEqual([
      {
        peticion: 'PUT /api/perfil-profesional/yo',
        cuerpo: {
          anosExperiencia: 6,
          modalidad: 'salon_propio',
          especialidades: ['coloracion_tinturas', 'novias_eventos'],
          nombreLugarTrabajo: 'Salón Bella Vista',
          redSocial: null,
        },
      },
    ]);
    const perfil = screen.getByRole('region', {
      name: 'Tu perfil profesional',
    });
    expect(within(perfil).getByText('6 años')).toBeInTheDocument();
    expect(within(perfil).getByText('Salón propio')).toBeInTheDocument();
    expect(
      within(perfil).getByText('Coloración y tinturas'),
    ).toBeInTheDocument();
    expect(within(perfil).getByText('Novias y eventos')).toBeInTheDocument();
    expect(within(perfil).getByText('Salón Bella Vista')).toBeInTheDocument();
    expect(
      within(perfil).getByRole('button', { name: 'Editar perfil' }),
    ).toBeInTheDocument();
  });

  it('E10-H5 FE · guardar perfil: con el perfil guardado lo muestra y se edita con sus datos', async () => {
    const escrituras = simularBackend({
      'GET /api/perfil-profesional/yo': () => responder(PERFIL),
      'PUT /api/perfil-profesional/yo': (cuerpo) =>
        responder({ ...PERFIL, ...(cuerpo as object) }),
    });
    abrir();
    const usuario = userEvent.setup();

    const perfil = await screen.findByRole('region', {
      name: 'Tu perfil profesional',
    });
    expect(within(perfil).getByText('Arriendo de sillón')).toBeInTheDocument();
    // La red social se abre aparte y solo es de las redes que el backend acepta
    expect(
      within(perfil).getByRole('link', {
        name: 'https://www.instagram.com/bellavista.salon',
      }),
    ).toHaveAttribute('rel', 'noopener noreferrer');

    await usuario.click(
      within(perfil).getByRole('button', { name: 'Editar perfil' }),
    );
    expect(screen.getByLabelText(/Años de experiencia/)).toHaveValue('6');
    expect(
      screen.getByRole('radio', { name: 'Arriendo de sillón' }),
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', {
        name: 'Alisado (keratina, nanoplastia, botox capilar)',
      }),
    ).toBeChecked();

    // Sin guardar, vuelve al perfil tal cual
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(
      screen.getByRole('button', { name: 'Editar perfil' }),
    ).toBeInTheDocument();
    expect(escrituras).toEqual([]);
  });

  it('E10-H5 FE · datos faltantes: señala cada campo obligatorio y no envía', async () => {
    const escrituras = simularBackend({
      'GET /api/perfil-profesional/yo': SIN_PERFIL,
    });
    abrir();
    const usuario = userEvent.setup();

    await usuario.click(
      await screen.findByRole('button', { name: 'Guardar perfil' }),
    );

    const anos = screen.getByLabelText(/Años de experiencia/);
    expect(anos).toHaveAccessibleDescription(
      'Ingresa tus años de experiencia.',
    );
    expect(anos).toHaveAttribute('aria-invalid', 'true');
    expect(anos).toHaveFocus();
    expect(
      screen.getByRole('radiogroup', { name: /Modalidad de trabajo/ }),
    ).toHaveAccessibleDescription('Elige tu modalidad de trabajo.');
    expect(
      screen.getByRole('group', { name: /Especialidades/ }),
    ).toHaveAccessibleDescription('Elige al menos una especialidad.');
    expect(escrituras).toEqual([]);
  });

  it('E10-H5 FE · datos faltantes: años fuera de 0 a 40, lo señala junto al campo', async () => {
    simularBackend({ 'GET /api/perfil-profesional/yo': SIN_PERFIL });
    abrir();
    const usuario = userEvent.setup();

    await usuario.type(
      await screen.findByLabelText(/Años de experiencia/),
      '41',
    );
    await usuario.click(screen.getByRole('button', { name: 'Guardar perfil' }));

    expect(
      screen.getByLabelText(/Años de experiencia/),
    ).toHaveAccessibleDescription('Ingresa un número entero de 0 a 40.');
  });

  it('E10-H5 FE · datos faltantes: el error del backend va junto a su campo, sin perder lo escrito', async () => {
    const mensaje =
      'La red social debe ser el enlace a tu perfil de Instagram, Facebook o TikTok, que empiece con https://.';
    simularBackend({
      'GET /api/perfil-profesional/yo': SIN_PERFIL,
      'PUT /api/perfil-profesional/yo': () =>
        responder(
          {
            statusCode: 400,
            message: [mensaje],
            error: 'Bad Request',
            errores: [{ campo: 'redSocial', mensaje }],
          },
          400,
        ),
    });
    abrir();
    const usuario = userEvent.setup();

    await usuario.type(
      await screen.findByLabelText(/Años de experiencia/),
      '3',
    );
    await usuario.click(screen.getByRole('radio', { name: 'Salón propio' }));
    await usuario.click(
      screen.getByRole('checkbox', { name: 'Tricología y cuero cabelludo' }),
    );
    const red = screen.getByLabelText('Red social (opcional)');
    await usuario.type(red, 'https://m.facebook.com/camila');
    await usuario.click(screen.getByRole('button', { name: 'Guardar perfil' }));

    expect(await screen.findByText(mensaje)).toBeInTheDocument();
    expect(red).toHaveAccessibleDescription(expect.stringContaining(mensaje));
    expect(red).toHaveValue('https://m.facebook.com/camila');
    expect(screen.getByLabelText(/Años de experiencia/)).toHaveValue('3');
    expect(screen.getByRole('radio', { name: 'Salón propio' })).toBeChecked();
  });

  it('E10-H5 FE · sin verificación: la opción del menú no aparece y la página invita a verificar', async () => {
    simularBackend({});
    abrir('cliente');

    expect(
      await screen.findByRole('link', { name: 'Verificar mi cuenta' }),
    ).toHaveAttribute('href', '/cuenta/verificacion');
    const menu = screen.getByRole('navigation', { name: 'Mi cuenta' });
    expect(
      within(menu).queryByRole('link', { name: 'Perfil profesional' }),
    ).not.toBeInTheDocument();
    // Un cliente recibiría 403: ni se pide
    expect(peticiones()).not.toContain('GET /api/perfil-profesional/yo');
  });

  it('E10-H5 FE · sin verificación: con la cuenta verificada, la opción aparece en el menú', async () => {
    simularBackend({
      'GET /api/perfil-profesional/yo': () => responder(PERFIL),
    });
    abrir();

    const menu = screen.getByRole('navigation', { name: 'Mi cuenta' });
    expect(
      within(menu).getByRole('link', { name: 'Perfil profesional' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('E10-H5 FE · guardar perfil: si falla la lectura, muestra el error y se reintenta', async () => {
    let intentos = 0;
    simularBackend({
      'GET /api/perfil-profesional/yo': () =>
        ++intentos === 1
          ? responder({ statusCode: 500, message: 'stack: Prisma' }, 500)
          : responder(PERFIL),
    });
    abrir();
    const usuario = userEvent.setup();

    const alerta = await screen.findByRole('alert');
    expect(alerta).not.toHaveTextContent('Prisma');
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(
      await screen.findByRole('region', { name: 'Tu perfil profesional' }),
    ).toBeInTheDocument();
  });

  it('E10-H5 FE · guardar perfil: un error del servidor no muestra detalles ni borra lo escrito', async () => {
    simularBackend({
      'GET /api/perfil-profesional/yo': SIN_PERFIL,
      'PUT /api/perfil-profesional/yo': () =>
        responder({ statusCode: 500, message: 'stack: Prisma' }, 500),
    });
    abrir();
    const usuario = userEvent.setup();

    const anos = await screen.findByLabelText(/Años de experiencia/);
    await usuario.type(anos, '4');
    await usuario.click(
      screen.getByRole('radio', { name: 'Docente o formadora' }),
    );
    await usuario.click(
      screen.getByRole('checkbox', { name: 'Corte de dama' }),
    );
    await usuario.click(screen.getByRole('button', { name: 'Guardar perfil' }));

    expect(await screen.findByRole('alert')).not.toHaveTextContent('Prisma');
    expect(anos).toHaveValue('4');
    expect(
      screen.getByRole('checkbox', { name: 'Corte de dama' }),
    ).toBeChecked();
  });
});

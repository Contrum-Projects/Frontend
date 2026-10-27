import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import {
  guardarSesion,
  olvidarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { PestanasCuenta } from './pestanasCuenta';
import { Registro } from './registro';

// Cliente igual al de la app, con URL absoluta y el fetch simulado de cada prueba
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

const navegacion = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: navegacion.replace }),
}));

const responder = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const CREADA = {
  mensaje:
    'Tu cuenta fue creada. Te enviamos un correo para confirmar tu dirección.',
};

/** Simula POST /api/cuentas/registro y guarda lo que se envió. */
const simularRegistro = (respuesta: () => Response) => {
  const fetch = vi.fn(async (entrada: Request) => {
    expect(new URL(entrada.url).pathname).toBe('/api/cuentas/registro');
    return respuesta();
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
};

const mostrarRegistro = () => {
  act(() => olvidarSesion());
  render(
    <QueryClientProvider client={new QueryClient()}>
      <Registro />
    </QueryClientProvider>,
  );
};

const completarObligatorios = async (
  usuario = userEvent.setup(),
  {
    contrasena = 'secreta123',
    confirmacion = contrasena,
  }: { contrasena?: string; confirmacion?: string } = {},
) => {
  await usuario.type(screen.getByLabelText('Nombre'), 'Camila');
  await usuario.type(screen.getByLabelText('Apellido'), 'Rojas');
  await usuario.type(
    screen.getByLabelText('Correo electrónico'),
    'camila@correo.cl',
  );
  await usuario.type(screen.getByLabelText('Contraseña'), contrasena);
  await usuario.type(
    screen.getByLabelText('Repite tu contraseña'),
    confirmacion,
  );
  return usuario;
};

const crearCuenta = (usuario: ReturnType<typeof userEvent.setup>) =>
  usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }));

afterEach(() => {
  reiniciarParaPruebas();
  navegacion.replace.mockReset();
  vi.unstubAllGlobals();
});

describe('SCRUM-93 · Registro', () => {
  it('E1-H1 FE · formulario de registro: pide los obligatorios, los opcionales y la casilla de ofertas desmarcada', async () => {
    mostrarRegistro();

    for (const campo of [
      'Nombre',
      'Apellido',
      'Correo electrónico',
      'Contraseña',
      'Repite tu contraseña',
    ]) {
      expect(screen.getByLabelText(campo)).toBeVisible();
    }
    // Pestañas del celular, con «Crear cuenta» activa
    expect(
      within(
        screen.getByRole('navigation', { name: 'Ingresar o crear cuenta' }),
      ).getByRole('link', { name: 'Crear cuenta' }),
    ).toHaveAttribute('aria-current', 'page');
    const opcionales = screen.getByRole('button', {
      name: /Datos opcionales/,
    });
    expect(opcionales).toHaveAttribute('aria-expanded', 'false');
    await userEvent.setup().click(opcionales);
    expect(opcionales).toHaveAttribute('aria-expanded', 'true');
    for (const campo of ['Teléfono', 'RUT', 'Fecha de nacimiento', 'Género']) {
      expect(screen.getByLabelText(campo)).toBeVisible();
    }
    expect(
      within(screen.getByLabelText('Género')).getAllByRole('option'),
    ).toHaveLength(5);
    expect(
      screen.getByRole('checkbox', {
        name: 'Quiero recibir ofertas por correo',
      }),
    ).not.toBeChecked();
  });

  it('E1-H1 FE · formulario de registro: envía solo los datos escritos, con el RUT en formato único', async () => {
    const fetch = simularRegistro(() => responder(CREADA, 201));
    mostrarRegistro();

    const usuario = await completarObligatorios();
    await usuario.click(
      screen.getByRole('button', { name: /Datos opcionales/ }),
    );
    await usuario.type(screen.getByLabelText('RUT'), '12.345.678-5');
    await usuario.selectOptions(screen.getByLabelText('Género'), 'Femenino');
    await crearCuenta(usuario);

    await screen.findByRole('heading', { name: 'Revisa tu correo' });
    const pedido = fetch.mock.calls[0]![0];
    expect(pedido.method).toBe('POST');
    expect(await pedido.json()).toEqual({
      nombre: 'Camila',
      apellido: 'Rojas',
      email: 'camila@correo.cl',
      contrasena: 'secreta123',
      confirmacionContrasena: 'secreta123',
      rut: '12345678-5',
      genero: 'Femenino',
    });
  });

  it('E1-H1 FE · correo ya registrado: muestra el error junto al campo sin perder lo escrito', async () => {
    simularRegistro(() =>
      responder(
        { statusCode: 409, message: 'El correo ya está registrado.' },
        409,
      ),
    );
    mostrarRegistro();

    const usuario = await completarObligatorios();
    await crearCuenta(usuario);

    const correo = screen.getByLabelText('Correo electrónico');
    await waitFor(() => expect(correo).toHaveAttribute('aria-invalid', 'true'));
    expect(correo).toHaveAccessibleDescription('El correo ya está registrado.');
    expect(correo).toHaveFocus();
    expect(correo).toHaveValue('camila@correo.cl');
    expect(screen.getByLabelText('Nombre')).toHaveValue('Camila');
  });

  it('E1-H1 FE · RUT ya registrado: abre los datos opcionales y marca el RUT', async () => {
    simularRegistro(() =>
      responder(
        {
          statusCode: 409,
          message: 'El correo y el RUT ya están registrados.',
        },
        409,
      ),
    );
    mostrarRegistro();

    const usuario = await completarObligatorios();
    await usuario.click(
      screen.getByRole('button', { name: /Datos opcionales/ }),
    );
    await usuario.type(screen.getByLabelText('RUT'), '12.345.678-5');
    await usuario.click(
      screen.getByRole('button', { name: /Datos opcionales/ }),
    );
    await crearCuenta(usuario);

    const rut = await screen.findByLabelText('RUT');
    await waitFor(() => expect(rut).toBeVisible());
    expect(rut).toHaveAccessibleDescription(
      'El correo y el RUT ya están registrados.',
    );
    expect(rut).toHaveValue('12.345.678-5');
    expect(screen.getByLabelText('Correo electrónico')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('E1-H1 FE · contraseñas distintas: muestra el error junto a la repetición antes de enviar', async () => {
    const fetch = simularRegistro(() => responder(CREADA, 201));
    mostrarRegistro();

    const usuario = await completarObligatorios(userEvent.setup(), {
      contrasena: 'secreta123',
      confirmacion: 'secreta124',
    });
    await crearCuenta(usuario);

    expect(
      screen.getByLabelText('Repite tu contraseña'),
    ).toHaveAccessibleDescription('Las contraseñas no coinciden.');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('E1-H1 FE · contraseñas distintas según el servidor: el error va junto a la repetición', async () => {
    simularRegistro(() =>
      responder(
        { statusCode: 400, message: 'Las contraseñas no coinciden.' },
        400,
      ),
    );
    mostrarRegistro();

    const usuario = await completarObligatorios();
    await crearCuenta(usuario);

    await waitFor(() =>
      expect(
        screen.getByLabelText('Repite tu contraseña'),
      ).toHaveAccessibleDescription('Las contraseñas no coinciden.'),
    );
  });

  it('E1-H1 FE · confirmación del correo: creada la cuenta indica «Revisa tu correo» con el correo escrito', async () => {
    simularRegistro(() => responder(CREADA, 201));
    mostrarRegistro();

    const usuario = await completarObligatorios();
    await crearCuenta(usuario);

    const titulo = await screen.findByRole('heading', {
      name: 'Revisa tu correo',
    });
    expect(titulo).toHaveFocus();
    expect(screen.getByText('camila@correo.cl')).toBeVisible();
    // Como en Figma, «Revisa tu correo» va sin las pestañas
    expect(
      screen.queryByRole('navigation', { name: 'Ingresar o crear cuenta' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Crear cuenta' }),
    ).not.toBeInTheDocument();

    // «Cambiarlo» vuelve al formulario con lo escrito
    await usuario.click(
      screen.getByRole('button', { name: '¿No es tu correo? Cambiarlo' }),
    );
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue(
      'camila@correo.cl',
    );
    // Las contraseñas no quedan cargadas en el formulario oculto
    expect(screen.getByLabelText('Contraseña')).toHaveValue('');
    expect(screen.getByLabelText('Repite tu contraseña')).toHaveValue('');
  });

  it('valida los campos antes de llamar al servidor', async () => {
    const fetch = simularRegistro(() => responder(CREADA, 201));
    mostrarRegistro();

    const usuario = userEvent.setup();
    await usuario.type(screen.getByLabelText('Contraseña'), 'solotexto');
    await crearCuenta(usuario);

    expect(await screen.findByText('Escribe tu nombre.')).toBeInTheDocument();
    expect(screen.getByText('Escribe tu correo.')).toBeInTheDocument();
    expect(
      screen.getByText('La contraseña debe tener al menos un número.'),
    ).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('un RUT con el dígito verificador incorrecto se avisa antes de enviar', async () => {
    const fetch = simularRegistro(() => responder(CREADA, 201));
    mostrarRegistro();

    const usuario = await completarObligatorios();
    await usuario.click(
      screen.getByRole('button', { name: /Datos opcionales/ }),
    );
    await usuario.type(screen.getByLabelText('RUT'), '12.345.678-9');
    await crearCuenta(usuario);

    expect(screen.getByLabelText('RUT')).toHaveAccessibleDescription(
      'El RUT no es válido.',
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('el límite de peticiones se muestra como aviso', async () => {
    simularRegistro(() =>
      responder(
        { statusCode: 429, message: 'ThrottlerException: Too Many Requests' },
        429,
      ),
    );
    mostrarRegistro();

    const usuario = await completarObligatorios();
    await crearCuenta(usuario);

    // El texto por defecto de Nest (en inglés) se reemplaza por el del estado
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Hiciste demasiados intentos. Espera un momento y vuelve a intentarlo.',
    );
  });

  it('un error del servidor no muestra detalles técnicos y conserva lo escrito', async () => {
    simularRegistro(() =>
      responder(
        { statusCode: 500, message: 'PrismaClientKnownRequestError' },
        500,
      ),
    );
    mostrarRegistro();

    const usuario = await completarObligatorios();
    await crearCuenta(usuario);

    expect(
      await screen.findByText(
        'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Prisma/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Apellido')).toHaveValue('Rojas');
  });

  it('con la sesión ya iniciada no muestra el formulario y redirige', async () => {
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
        <Registro />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(navegacion.replace).toHaveBeenCalledWith('/'));
    expect(
      screen.queryByRole('button', { name: 'Crear cuenta' }),
    ).not.toBeInTheDocument();
  });

  it('enlaza de vuelta al inicio de sesión', () => {
    mostrarRegistro();
    const formulario = screen.getByRole('form', { name: 'Crear cuenta' });
    expect(
      within(formulario).getByRole('link', { name: 'Ingresar' }),
    ).toHaveAttribute('href', '/ingresar');
  });
});

describe('SCRUM-93 · Pestañas del celular', () => {
  it('E1-H1 FE · celular: las pestañas alternan entre «Ingresar» y «Crear cuenta»', () => {
    render(<PestanasCuenta activa="registro" />);

    const pestanas = within(
      screen.getByRole('navigation', { name: 'Ingresar o crear cuenta' }),
    ).getAllByRole('link');
    expect(
      pestanas.map((p) => [p.textContent, p.getAttribute('href')]),
    ).toEqual([
      ['Ingresar', '/ingresar'],
      ['Crear cuenta', '/registro'],
    ]);
    expect(pestanas[1]).toHaveAttribute('aria-current', 'page');
    expect(pestanas[0]).not.toHaveAttribute('aria-current');
  });
});

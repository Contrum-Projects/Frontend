import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act, StrictMode, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import {
  olvidarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { RestablecerContrasena } from './restablecerContrasena';
import { SolicitudRecuperacion } from './solicitudRecuperacion';

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

const navegacion = vi.hoisted(() => ({ parametros: new URLSearchParams() }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => navegacion.parametros,
}));

const responder = (cuerpo: unknown, status = 200) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json' },
  });

const SOLICITUD_RECIBIDA =
  'Si el correo tiene una cuenta, te enviamos un enlace para recuperar tu contraseña.';
const ENLACE_INVALIDO =
  'El enlace de recuperación no es válido, ya se usó o venció. Solicita uno nuevo.';

/** Simula una ruta del backend y guarda lo que se envió. */
const simular = (ruta: string, respuesta: () => Response) => {
  const fetch = vi.fn(async (entrada: Request) => {
    expect(new URL(entrada.url).pathname).toBe(ruta);
    return respuesta();
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
};

const mostrar = (contenido: ReactNode) => {
  // Sin sesión conocida, el cliente primero intentaría renovarla
  act(() => olvidarSesion());
  render(
    <StrictMode>
      <QueryClientProvider client={new QueryClient()}>
        {contenido}
      </QueryClientProvider>
    </StrictMode>,
  );
};

const abrirEnlace = (token: string | null) => {
  navegacion.parametros = new URLSearchParams(token ? { token } : {});
  mostrar(<RestablecerContrasena />);
};

const escribirContrasenas = async (
  contrasena = 'nueva1234',
  confirmacion = contrasena,
) => {
  const usuario = userEvent.setup();
  await usuario.type(
    screen.getByLabelText('Nueva contraseña', { selector: 'input' }),
    contrasena,
  );
  await usuario.type(
    screen.getByLabelText('Repite tu contraseña'),
    confirmacion,
  );
  await usuario.click(
    screen.getByRole('button', { name: 'Guardar contraseña' }),
  );
  return usuario;
};

afterEach(() => {
  reiniciarParaPruebas();
  vi.unstubAllGlobals();
});

describe('SCRUM-96 · Solicitud del enlace', () => {
  it('E1-H4 FE · Solicitud: con el correo enviado muestra «Revisa tu correo» con el mensaje del backend', async () => {
    const fetch = simular('/api/cuentas/recuperar-contrasena', () =>
      responder({ mensaje: SOLICITUD_RECIBIDA }),
    );
    mostrar(<SolicitudRecuperacion />);

    expect(
      screen.getByRole('heading', { name: 'Recuperar contraseña' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute(
      'href',
      '/ingresar',
    );
    const usuario = userEvent.setup();
    await usuario.type(
      screen.getByLabelText('Correo electrónico'),
      ' camila@correo.cl ',
    );
    await usuario.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    const titulo = await screen.findByRole('heading', {
      name: 'Revisa tu correo',
    });
    expect(titulo).toHaveFocus();
    expect(screen.getByText(SOLICITUD_RECIBIDA)).toBeVisible();
    expect(screen.queryByRole('link', { name: 'Ingresar' })).toBeNull();
    const pedido = fetch.mock.calls[0]![0];
    expect(pedido.method).toBe('POST');
    expect(await pedido.json()).toEqual({ email: 'camila@correo.cl' });
  });

  it('E1-H4 FE · Solicitud: «Reenviar correo» pide otro enlace y «Cambiarlo» vuelve con lo escrito', async () => {
    const fetch = simular('/api/cuentas/recuperar-contrasena', () =>
      responder({ mensaje: SOLICITUD_RECIBIDA }),
    );
    mostrar(<SolicitudRecuperacion />);
    const usuario = userEvent.setup();
    await usuario.type(
      screen.getByLabelText('Correo electrónico'),
      'camila@correo.cl',
    );
    await usuario.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    await usuario.click(
      await screen.findByRole('button', { name: 'Reenviar correo' }),
    );
    expect(
      await screen.findByText('Te enviamos el correo de nuevo.'),
    ).toBeVisible();
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(await fetch.mock.calls[1]![0].json()).toEqual({
      email: 'camila@correo.cl',
    });

    await usuario.click(
      screen.getByRole('button', { name: '¿No es tu correo? Cambiarlo' }),
    );
    const correo = screen.getByLabelText('Correo electrónico');
    expect(correo).toHaveValue('camila@correo.cl');
    expect(correo).toHaveFocus();
  });

  it('E1-H4 FE · Solicitud: el correo inválido se avisa junto al campo, sin llamar al backend', async () => {
    const fetch = simular('/api/cuentas/recuperar-contrasena', () =>
      responder({ mensaje: SOLICITUD_RECIBIDA }),
    );
    mostrar(<SolicitudRecuperacion />);
    const usuario = userEvent.setup();
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'camila');
    await usuario.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    const correo = screen.getByLabelText('Correo electrónico');
    await waitFor(() => expect(correo).toHaveAttribute('aria-invalid', 'true'));
    expect(correo).toHaveAccessibleDescription('Escribe un correo válido.');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('E1-H4 FE · Solicitud: con demasiados intentos muestra el aviso y conserva el correo', async () => {
    simular('/api/cuentas/recuperar-contrasena', () =>
      responder(
        { statusCode: 429, message: 'ThrottlerException: Too Many Requests' },
        429,
      ),
    );
    mostrar(<SolicitudRecuperacion />);
    const usuario = userEvent.setup();
    await usuario.type(
      screen.getByLabelText('Correo electrónico'),
      'camila@correo.cl',
    );
    await usuario.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    expect(
      await screen.findByText(
        'Hiciste demasiados intentos. Espera un momento y vuelve a intentarlo.',
      ),
    ).toBeVisible();
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue(
      'camila@correo.cl',
    );
  });
});

describe('SCRUM-96 · Nueva contraseña', () => {
  it('E1-H4 FE · Nueva contraseña: con el enlace vigente guarda la contraseña y lleva a ingresar', async () => {
    const fetch = simular('/api/cuentas/restablecer-contrasena', () =>
      responder({
        mensaje: 'Tu contraseña quedó actualizada. Ya puedes iniciar sesión.',
      }),
    );
    abrirEnlace('abc123');

    // El token no queda en la barra ni en el historial
    expect(window.location.search).toBe('');
    await escribirContrasenas();

    expect(
      await screen.findByRole('heading', { name: 'Contraseña actualizada' }),
    ).toHaveFocus();
    expect(
      screen.getByText(
        'Tu contraseña quedó actualizada. Ya puedes iniciar sesión.',
      ),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute(
      'href',
      '/ingresar',
    );
    expect(await fetch.mock.calls[0]![0].json()).toEqual({
      token: 'abc123',
      contrasena: 'nueva1234',
      confirmacionContrasena: 'nueva1234',
    });
  });

  it('E1-H4 FE · Nueva contraseña: avisa antes de enviar si no cumple las reglas o no coincide', async () => {
    const fetch = simular('/api/cuentas/restablecer-contrasena', () =>
      responder({ mensaje: 'ok' }),
    );
    abrirEnlace('abc123');

    await escribirContrasenas('corta', 'otra');

    const contrasena = screen.getByLabelText('Nueva contraseña', {
      selector: 'input',
    });
    await waitFor(() =>
      expect(contrasena).toHaveAccessibleDescription(
        'La contraseña debe tener al menos 8 caracteres.',
      ),
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('E1-H4 FE · Nueva contraseña: el error de la contraseña del backend va junto a su campo sin perder lo escrito', async () => {
    simular('/api/cuentas/restablecer-contrasena', () =>
      responder(
        { statusCode: 400, message: ['Las contraseñas no coinciden.'] },
        400,
      ),
    );
    abrirEnlace('abc123');

    await escribirContrasenas();

    const confirmacion = screen.getByLabelText('Repite tu contraseña');
    await waitFor(() =>
      expect(confirmacion).toHaveAccessibleDescription(
        'Las contraseñas no coinciden.',
      ),
    );
    expect(confirmacion).toHaveFocus();
    expect(
      screen.getByLabelText('Nueva contraseña', { selector: 'input' }),
    ).toHaveValue('nueva1234');
  });
  it('E1-H4 FE · Nueva contraseña: con demasiados intentos avisa y conserva lo escrito', async () => {
    simular('/api/cuentas/restablecer-contrasena', () =>
      responder(
        { statusCode: 429, message: 'ThrottlerException: Too Many Requests' },
        429,
      ),
    );
    abrirEnlace('abc123');

    await escribirContrasenas();

    expect(
      await screen.findByText(
        'Hiciste demasiados intentos. Espera un momento y vuelve a intentarlo.',
      ),
    ).toBeVisible();
    expect(
      screen.getByLabelText('Nueva contraseña', { selector: 'input' }),
    ).toHaveValue('nueva1234');
  });

  it('E1-H4 FE · Nueva contraseña: un error del servidor no muestra detalles técnicos', async () => {
    simular('/api/cuentas/restablecer-contrasena', () =>
      responder(
        { statusCode: 500, message: 'PrismaClientKnownRequestError' },
        500,
      ),
    );
    abrirEnlace('abc123');

    await escribirContrasenas();

    expect(
      await screen.findByText(
        'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
      ),
    ).toBeVisible();
    expect(screen.queryByText(/Prisma/)).toBeNull();
  });
});

describe('SCRUM-96 · Enlace vencido o usado', () => {
  it('E1-H4 FE · Enlace vencido o usado: explica el motivo del backend y ofrece pedir uno nuevo', async () => {
    simular('/api/cuentas/restablecer-contrasena', () =>
      responder({ statusCode: 400, message: ENLACE_INVALIDO }, 400),
    );
    abrirEnlace('vencido');

    await escribirContrasenas();

    expect(
      await screen.findByRole('heading', { name: 'El enlace venció' }),
    ).toHaveFocus();
    expect(screen.getByText(ENLACE_INVALIDO)).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Pedir un enlace nuevo' }),
    ).toHaveAttribute('href', '/recuperar-contrasena');
    expect(
      screen.queryByLabelText('Nueva contraseña', { selector: 'input' }),
    ).toBeNull();
  });

  it('E1-H4 FE · Enlace vencido o usado: sin token en el enlace ofrece pedir uno nuevo sin llamar al backend', () => {
    const fetch = simular('/api/cuentas/restablecer-contrasena', () =>
      responder({ mensaje: 'ok' }),
    );
    abrirEnlace(null);

    expect(
      screen.getByRole('heading', { name: 'El enlace venció' }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Pedir un enlace nuevo' }),
    ).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('SCRUM-96 · Reenviar correo', () => {
  it('E1-H4 FE · Solicitud: si el reenvío falla, avisa sin dejar «Revisa tu correo»', async () => {
    let llamadas = 0;
    simular('/api/cuentas/recuperar-contrasena', () =>
      ++llamadas === 1
        ? responder({ mensaje: SOLICITUD_RECIBIDA })
        : responder(
            {
              statusCode: 429,
              message: 'ThrottlerException: Too Many Requests',
            },
            429,
          ),
    );
    mostrar(<SolicitudRecuperacion />);
    const usuario = userEvent.setup();
    await usuario.type(
      screen.getByLabelText('Correo electrónico'),
      'camila@correo.cl',
    );
    await usuario.click(screen.getByRole('button', { name: 'Enviar enlace' }));
    await usuario.click(
      await screen.findByRole('button', { name: 'Reenviar correo' }),
    );

    expect(
      await screen.findByText(
        'Hiciste demasiados intentos. Espera un momento y vuelve a intentarlo.',
      ),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { name: 'Revisa tu correo' }),
    ).toBeVisible();
  });
});

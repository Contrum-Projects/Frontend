import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import {
  olvidarSesion,
  reiniciarParaPruebas,
} from '@/compartido/sesion/almacen';
import { SuscripcionOfertas } from './suscripcionOfertas';

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

const responder = (cuerpo: unknown, status: number) =>
  new Response(JSON.stringify(cuerpo), {
    status,
    headers: { 'content-type': 'application/json' },
  });

// Textos de src/modulos/marketing/suscripciones.service.ts del backend
const SOLICITUD_RECIBIDA =
  'Si tu suscripción aún no está confirmada, te enviamos un correo para confirmarla.';

/** Simula POST /api/marketing/suscripciones y guarda los cuerpos enviados. */
const simular = (respuesta: () => Response) => {
  const cuerpos: unknown[] = [];
  const fetch = vi.fn(async (entrada: Request) => {
    expect(entrada.method).toBe('POST');
    expect(new URL(entrada.url).pathname).toBe('/api/marketing/suscripciones');
    cuerpos.push(await entrada.json());
    return respuesta();
  });
  vi.stubGlobal('fetch', fetch);
  return cuerpos;
};

const mostrar = () => {
  act(() => olvidarSesion());
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SuscripcionOfertas />
    </QueryClientProvider>,
  );
};

const suscribir = async (email: string) => {
  const usuario = userEvent.setup();
  await usuario.type(screen.getByLabelText('Correo electrónico'), email);
  await usuario.click(screen.getByRole('button', { name: 'Suscribirme' }));
};

afterEach(() => {
  reiniciarParaPruebas();
  vi.unstubAllGlobals();
});

describe('SuscripcionOfertas', () => {
  it('E12-H1 FE · suscribirse: al enviar, indica que debe confirmar desde el correo', async () => {
    const cuerpos = simular(() =>
      responder({ mensaje: SOLICITUD_RECIBIDA }, 202),
    );
    mostrar();

    await suscribir('  Camila@Correo.cl ');

    expect(await screen.findByRole('status')).toHaveTextContent(
      SOLICITUD_RECIBIDA,
    );
    expect(cuerpos).toEqual([{ email: 'Camila@Correo.cl' }]);
    // El botón desaparece: el foco pasa al mensaje
    expect(screen.getByText(SOLICITUD_RECIBIDA)).toHaveFocus();
    expect(
      screen.queryByRole('button', { name: 'Suscribirme' }),
    ).not.toBeInTheDocument();
  });

  it('E12-H1 FE · suscribirse: un correo mal escrito muestra el error junto al campo sin llamar al backend', async () => {
    const cuerpos = simular(() => responder({}, 202));
    mostrar();

    await suscribir('camila@');

    const campo = screen.getByLabelText('Correo electrónico');
    expect(campo).toHaveAccessibleDescription('Escribe un correo válido.');
    expect(campo).toHaveValue('camila@');
    expect(cuerpos).toHaveLength(0);
  });

  it('E12-H1 FE · suscribirse: el 400 del backend va junto al campo y conserva lo escrito', async () => {
    simular(() =>
      responder(
        { statusCode: 400, message: ['Escribe un correo válido.'] },
        400,
      ),
    );
    mostrar();

    await suscribir('camila@correo.cl');

    const campo = screen.getByLabelText('Correo electrónico');
    expect(await screen.findByText('Escribe un correo válido.')).toBeVisible();
    expect(campo).toHaveAccessibleDescription('Escribe un correo válido.');
    expect(campo).toHaveValue('camila@correo.cl');
  });

  it('E12-H1 FE · exceso de solicitudes: pide esperar un momento y deja intentar otra vez', async () => {
    simular(() =>
      responder(
        { statusCode: 429, message: 'ThrottlerException: Too Many Requests' },
        429,
      ),
    );
    mostrar();

    await suscribir('camila@correo.cl');

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Hiciste demasiados intentos. Espera un momento y vuelve a intentarlo.',
    );
    expect(screen.getByLabelText('Correo electrónico')).toHaveValue(
      'camila@correo.cl',
    );
    expect(screen.getByRole('button', { name: 'Suscribirme' })).toBeEnabled();
  });

  it('E12-H1 FE · un error del servidor no muestra detalles técnicos', async () => {
    simular(() =>
      responder(
        { statusCode: 500, message: 'PrismaClientKnownRequestError' },
        500,
      ),
    );
    mostrar();

    await suscribir('camila@correo.cl');

    const aviso = await screen.findByRole('alert');
    expect(aviso).toHaveTextContent(
      'No pudimos completar la acción. Intenta de nuevo en unos minutos.',
    );
    expect(aviso).not.toHaveTextContent('Prisma');
  });
});

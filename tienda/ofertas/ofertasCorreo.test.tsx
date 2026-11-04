import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { PreferenciaOfertas } from '@/compartido/api/respuestas';
import { reiniciarParaPruebas } from '@/compartido/sesion/almacen';
import {
  mostrarPantallaCuenta,
  responder,
  simularBackend,
} from '@/tienda/cuenta/cuentaDePrueba';
import { PantallaOfertasCorreo } from './pantallaOfertasCorreo';

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
  usePathname: () => '/cuenta/ofertas',
}));

const ACTIVA: PreferenciaOfertas = {
  activa: true,
  fechaConsentimiento: '2026-09-12T15:00:00.000Z',
  email: 'camila@correo.cl',
  correoVerificado: true,
};

const INACTIVA: PreferenciaOfertas = {
  ...ACTIVA,
  activa: false,
  fechaConsentimiento: null,
};

const abrir = () => mostrarPantallaCuenta(<PantallaOfertasCorreo />);

const interruptor = () =>
  screen.findByRole('switch', {
    name: 'Recibir ofertas y novedades por correo',
  });

beforeEach(() => reiniciarParaPruebas());

afterEach(() => {
  reiniciarParaPruebas();
  vi.unstubAllGlobals();
});

describe('E12-H2 FE · Ofertas por correo', () => {
  it('E12-H2 FE · interruptor: muestra el estado con la fecha del consentimiento y qué incluye', async () => {
    simularBackend({ 'GET /api/cuentas/yo/ofertas': () => responder(ACTIVA) });
    abrir();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Ofertas por correo' }),
    ).toBeInTheDocument();
    expect(await interruptor()).toBeChecked();
    expect(
      screen.getByText('Activado el 12 de septiembre de 2026.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Campañas con ofertas y novedades de la tienda.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Un saludo en tu cumpleaños, si registraste tu fecha de nacimiento.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Recordatorios si dejas productos en el carrito.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Correo verificado: camila@correo.cl'),
    ).toBeInTheDocument();
  });

  it('E12-H2 FE · interruptor: al activarlo guarda y muestra la fecha que entrega el backend', async () => {
    const escrituras = simularBackend({
      'GET /api/cuentas/yo/ofertas': () => responder(INACTIVA),
      'PUT /api/cuentas/yo/ofertas': () =>
        responder({ ...ACTIVA, fechaConsentimiento: '2026-11-04T15:00:00Z' }),
    });
    abrir();

    const opcion = await interruptor();
    expect(opcion).not.toBeChecked();
    expect(
      screen.getByText('No recibes ofertas por correo.'),
    ).toBeInTheDocument();

    await userEvent.click(opcion);

    expect(
      await screen.findByText('Activado el 4 de noviembre de 2026.'),
    ).toBeInTheDocument();
    expect(opcion).toBeChecked();
    expect(escrituras).toEqual([
      { peticion: 'PUT /api/cuentas/yo/ofertas', cuerpo: { activa: true } },
    ]);
  });

  it('E12-H2 FE · interruptor: al desactivarlo guarda y lo dice', async () => {
    const escrituras = simularBackend({
      'GET /api/cuentas/yo/ofertas': () => responder(ACTIVA),
      'PUT /api/cuentas/yo/ofertas': () => responder(INACTIVA),
    });
    abrir();

    await userEvent.click(await interruptor());

    expect(
      await screen.findByText('No recibes ofertas por correo.'),
    ).toBeInTheDocument();
    expect(await interruptor()).not.toBeChecked();
    expect(escrituras).toEqual([
      { peticion: 'PUT /api/cuentas/yo/ofertas', cuerpo: { activa: false } },
    ]);
  });

  it('E12-H2 FE · interruptor: si el backend rechaza el cambio, muestra su mensaje y vuelve al estado guardado', async () => {
    simularBackend({
      'GET /api/cuentas/yo/ofertas': () => responder(INACTIVA),
      'PUT /api/cuentas/yo/ofertas': () =>
        responder(
          {
            statusCode: 409,
            message: 'Verifica tu correo para recibir ofertas.',
          },
          409,
        ),
    });
    abrir();

    const opcion = await interruptor();
    await userEvent.click(opcion);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Verifica tu correo para recibir ofertas.',
    );
    expect(opcion).not.toBeChecked();
  });

  it('E12-H2 FE · correo sin verificar: explica que debe verificarlo y no deja activar', async () => {
    const escrituras = simularBackend({
      'GET /api/cuentas/yo/ofertas': () =>
        responder({ ...INACTIVA, correoVerificado: false }),
    });
    abrir();

    const opcion = await interruptor();
    expect(opcion).toBeDisabled();
    expect(
      screen.getByText(
        'Verifica tu correo para recibir ofertas. Te enviamos un enlace cuando creaste tu cuenta.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Correo verificado/)).not.toBeInTheDocument();

    await userEvent.click(opcion);
    expect(escrituras).toEqual([]);
  });

  it('E12-H2 FE · correo sin verificar: si ya estaba activa, deja desactivarla', async () => {
    const escrituras = simularBackend({
      'GET /api/cuentas/yo/ofertas': () =>
        responder({ ...ACTIVA, correoVerificado: false }),
      'PUT /api/cuentas/yo/ofertas': () =>
        responder({ ...INACTIVA, correoVerificado: false }),
    });
    abrir();

    const opcion = await interruptor();
    expect(opcion).toBeEnabled();
    await userEvent.click(opcion);

    expect(
      await screen.findByText('No recibes ofertas por correo.'),
    ).toBeInTheDocument();
    expect(await interruptor()).toBeDisabled();
    expect(escrituras).toEqual([
      { peticion: 'PUT /api/cuentas/yo/ofertas', cuerpo: { activa: false } },
    ]);
  });

  it('E12-H2 FE · sin conexión: muestra el error y deja reintentar', async () => {
    let intentos = 0;
    simularBackend({
      'GET /api/cuentas/yo/ofertas': () =>
        ++intentos === 1
          ? responder({ statusCode: 500, message: 'Error interno' }, 500)
          : responder(ACTIVA),
    });
    abrir();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('Error interno')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await interruptor()).toBeChecked();
  });
});

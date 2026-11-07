import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { PreferenciaOfertas } from '@/compartido/api/respuestas';
import { reiniciarParaPruebas } from '@/compartido/sesion/almacen';
import {
  DATOS,
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
  acepta: true,
  fechaConsentimiento: '2026-09-12T15:00:00.000Z',
};

const INACTIVA: PreferenciaOfertas = {
  acepta: false,
  fechaConsentimiento: null,
};

/** `GET /api/cuentas/yo` con esa preferencia (de ahí se lee, SCRUM-150). */
const misDatos = (consentimientoMarketing: PreferenciaOfertas) =>
  responder({ ...DATOS, consentimientoMarketing });

const RUTA_PUT = 'PUT /api/cuentas/yo/consentimiento-marketing';

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
    simularBackend({ 'GET /api/cuentas/yo': () => misDatos(ACTIVA) });
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
  });

  it('E12-H2 FE · interruptor: al activarlo guarda y muestra la fecha que entrega el backend', async () => {
    const escrituras = simularBackend({
      'GET /api/cuentas/yo': () => misDatos(INACTIVA),
      [RUTA_PUT]: () =>
        responder({
          acepta: true,
          fechaConsentimiento: '2026-11-04T15:00:00Z',
        }),
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
      { peticion: RUTA_PUT, cuerpo: { acepta: true } },
    ]);
  });

  it('E12-H2 FE · interruptor: al desactivarlo guarda y lo dice', async () => {
    const escrituras = simularBackend({
      'GET /api/cuentas/yo': () => misDatos(ACTIVA),
      [RUTA_PUT]: () => responder(INACTIVA),
    });
    abrir();

    await userEvent.click(await interruptor());

    expect(
      await screen.findByText('No recibes ofertas por correo.'),
    ).toBeInTheDocument();
    expect(await interruptor()).not.toBeChecked();
    expect(escrituras).toEqual([
      { peticion: RUTA_PUT, cuerpo: { acepta: false } },
    ]);
  });

  it('E12-H2 FE · interruptor: si el backend rechaza el cambio, muestra su mensaje y vuelve al estado guardado', async () => {
    simularBackend({
      'GET /api/cuentas/yo': () => misDatos(INACTIVA),
      [RUTA_PUT]: () =>
        responder(
          { statusCode: 403, message: 'No tienes permiso para hacer esto.' },
          403,
        ),
    });
    abrir();

    const opcion = await interruptor();
    await userEvent.click(opcion);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No tienes permiso para hacer esto.',
    );
    expect(opcion).not.toBeChecked();
  });

  it('E12-H2 FE · correo verificado: la cuenta compradora siempre lo tiene, así que no muestra aviso ni bloquea el interruptor', async () => {
    simularBackend({ 'GET /api/cuentas/yo': () => misDatos(INACTIVA) });
    abrir();

    expect(await interruptor()).toBeEnabled();
    expect(screen.queryByText(/Verifica tu correo/)).not.toBeInTheDocument();
  });

  it('E12-H2 FE · sin conexión: muestra el error y deja reintentar', async () => {
    let intentos = 0;
    simularBackend({
      'GET /api/cuentas/yo': () =>
        ++intentos === 1
          ? responder({ statusCode: 500, message: 'Error interno' }, 500)
          : misDatos(ACTIVA),
    });
    abrir();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('Error interno')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await interruptor()).toBeChecked();
  });
});

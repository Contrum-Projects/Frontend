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
import { CORREO_CONTACTO } from '@/tienda/diseno/contacto';
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

const abrir = () => mostrarPantallaCuenta(<PantallaOfertasCorreo />);

const tarjeta = () =>
  screen.findByRole('region', { name: 'Ofertas y novedades por correo' });

beforeEach(() => reiniciarParaPruebas());

afterEach(() => {
  reiniciarParaPruebas();
  vi.unstubAllGlobals();
});

describe('E12-H2 FE · Ofertas por correo', () => {
  it('E12-H2 FE · estado: muestra la fecha del consentimiento y qué incluye', async () => {
    simularBackend({ 'GET /api/cuentas/yo': () => misDatos(ACTIVA) });
    abrir();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Ofertas por correo' }),
    ).toBeInTheDocument();
    await tarjeta();
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

  it('SCRUM-19 · la cuenta no puede desactivarlas: no hay interruptor y dice a qué correo escribir', async () => {
    simularBackend({ 'GET /api/cuentas/yo': () => misDatos(ACTIVA) });
    abrir();

    await tarjeta();
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: CORREO_CONTACTO })).toHaveAttribute(
      'href',
      `mailto:${CORREO_CONTACTO}`,
    );
  });

  it('SCRUM-19 · dada de baja por el administrador: dice que no recibe ofertas', async () => {
    simularBackend({ 'GET /api/cuentas/yo': () => misDatos(INACTIVA) });
    abrir();

    await tarjeta();
    expect(
      screen.getByText('No recibes ofertas por correo.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Campañas con ofertas y novedades de la tienda.'),
    ).not.toBeInTheDocument();
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
    expect(
      await screen.findByText('Activado el 12 de septiembre de 2026.'),
    ).toBeInTheDocument();
  });
});

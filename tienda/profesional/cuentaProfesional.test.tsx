import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type {
  PerfilProfesionalCuenta,
  SolicitudVerificacionCuenta,
} from '@/compartido/api/respuestas';
import { leerEstado, reiniciarParaPruebas } from '@/compartido/sesion/almacen';
import type { Rol } from '@/compartido/sesion/roles';
import {
  DATOS,
  mostrarPantallaCuenta,
  responder,
  simularBackend,
} from '@/tienda/cuenta/cuentaDePrueba';
import { PantallaMisDatos } from '@/tienda/cuenta/pantallaMisDatos';
import { PantallaVerificacion } from '@/tienda/verificacion/pantallaVerificacion';

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

const APROBADA: SolicitudVerificacionCuenta = {
  estado: 'aprobada',
  fechaSolicitud: '2026-10-12T15:00:00.000Z',
  fechaResolucion: '2026-10-13T15:00:00.000Z',
  motivoRechazo: null,
  requiereDocumentos: false,
  documentos: [],
};

const PERFIL: PerfilProfesionalCuenta = {
  anosExperiencia: 6,
  modalidad: 'dependiente_salon',
  especialidades: ['coloracion_tinturas'],
  nombreLugarTrabajo: null,
  redSocial: null,
  fechaActualizacion: '2026-11-04T15:00:00.000Z',
};

const SESION_PROFESIONAL = {
  tokenAcceso: 'token-profesional',
  expiraEn: 900,
  usuario: {
    codigoPublico: 'u-1',
    nombre: 'Camila',
    apellido: 'Rojas',
    rol: 'profesional',
  },
};

/** Mis datos sin direcciones; lo demás (perfil incluido) responde 404 si no viene en `rutas`. */
const RUTAS_MIS_DATOS: Record<string, () => Response> = {
  'GET /api/cuentas/yo': () => responder(DATOS),
  'GET /api/cuentas/yo/direcciones': () => responder([]),
};

/** Las lecturas que llegaron al backend, «MÉTODO /ruta». */
const peticiones = () =>
  vi
    .mocked(globalThis.fetch)
    .mock.calls.map(([entrada, opciones]) =>
      entrada instanceof Request
        ? `${entrada.method} ${new URL(entrada.url).pathname}`
        : `${opciones?.method ?? 'GET'} ${String(entrada)}`,
    );

const abrirMisDatos = (rol: Rol) =>
  mostrarPantallaCuenta(<PantallaMisDatos />, undefined, rol);

const invitacion = () =>
  screen.queryByRole('heading', { name: 'Completa tu perfil profesional' });

beforeEach(() => reiniciarParaPruebas());

afterEach(() => {
  reiniciarParaPruebas();
  vi.unstubAllGlobals();
});

describe('E10-H4 FE · Cuenta profesional activa', () => {
  it('E10-H4 FE · cambio de vista: aprobada con la sesión de cliente, renueva la sesión y muestra la cuenta verificada', async () => {
    const escrituras = simularBackend({
      'GET /api/cuentas/yo': () => responder(DATOS),
      'GET /api/verificaciones/yo': () => responder(APROBADA),
      'POST /api/cuentas/sesion/renovar': () => responder(SESION_PROFESIONAL),
    });
    mostrarPantallaCuenta(<PantallaVerificacion />);

    const titulo = await screen.findByRole('heading', {
      name: 'Cuenta verificada',
    });
    expect(
      screen.getByText('Ya ves el precio profesional en todo el catálogo.'),
    ).toBeInTheDocument();
    // El token nuevo trae el rol profesional: la tienda ya muestra el precio mayorista
    await waitFor(() => {
      const estado = leerEstado();
      expect(estado.tipo === 'activa' && estado.usuario.rol).toBe(
        'profesional',
      );
    });
    // Ya profesional y sin perfil, aparece la invitación
    expect(
      await screen.findByRole('link', { name: 'Completar perfil' }),
    ).toBeInTheDocument();
    // La sesión se renovó sola: el foco no se mueve
    expect(titulo).not.toHaveFocus();
    expect(escrituras.map((e) => e.peticion)).toEqual([
      'POST /api/cuentas/sesion/renovar',
    ]);
  });

  it('E10-H4 FE · cambio de vista: con la sesión ya profesional no la renueva de nuevo', async () => {
    const escrituras = simularBackend({
      'GET /api/cuentas/yo': () => responder(DATOS),
      'GET /api/verificaciones/yo': () => responder(APROBADA),
      'GET /api/perfil-profesional/yo': () => responder(PERFIL),
    });
    mostrarPantallaCuenta(<PantallaVerificacion />, undefined, 'profesional');

    expect(
      await screen.findByRole('heading', { name: 'Cuenta verificada' }),
    ).toBeInTheDocument();
    expect(escrituras).toEqual([]);
  });

  it('E10-H4 FE · invitación al perfil: la cuenta recién aprobada la ve al abrir su cuenta', async () => {
    simularBackend(RUTAS_MIS_DATOS);
    abrirMisDatos('profesional');

    expect(
      await screen.findByRole('heading', {
        name: 'Completa tu perfil profesional',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Completar perfil' }),
    ).toHaveAttribute('href', '/cuenta/perfil-profesional');
  });

  it('E10-H4 FE · invitación al perfil: también aparece bajo «Cuenta verificada»', async () => {
    simularBackend({
      'GET /api/cuentas/yo': () => responder(DATOS),
      'GET /api/verificaciones/yo': () => responder(APROBADA),
    });
    mostrarPantallaCuenta(<PantallaVerificacion />, undefined, 'profesional');

    const enlace = await screen.findByRole('link', {
      name: 'Completar perfil',
    });
    const aviso = screen.getByRole('heading', { name: 'Cuenta verificada' });
    // La invitación va después del aviso
    expect(
      aviso.compareDocumentPosition(enlace) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('E10-H4 FE · invitación al perfil: con el perfil completo no aparece', async () => {
    simularBackend({
      ...RUTAS_MIS_DATOS,
      'GET /api/perfil-profesional/yo': () => responder(PERFIL),
    });
    abrirMisDatos('profesional');

    await screen.findByRole('form', { name: 'Datos personales' });
    await waitFor(() =>
      expect(peticiones()).toContain('GET /api/perfil-profesional/yo'),
    );
    expect(invitacion()).not.toBeInTheDocument();
  });

  it('E10-H4 FE · invitación al perfil: un cliente no la ve ni pide el perfil', async () => {
    simularBackend(RUTAS_MIS_DATOS);
    abrirMisDatos('cliente');

    await screen.findByRole('form', { name: 'Datos personales' });
    expect(invitacion()).not.toBeInTheDocument();
    expect(peticiones()).not.toContain('GET /api/perfil-profesional/yo');
  });

  it('E10-H4 FE · invitación al perfil: si la consulta falla, Mis datos se ve igual y sin la invitación', async () => {
    simularBackend({
      ...RUTAS_MIS_DATOS,
      'GET /api/perfil-profesional/yo': () =>
        responder({ statusCode: 500, message: 'Error interno.' }, 500),
    });
    abrirMisDatos('profesional');

    await screen.findByRole('form', { name: 'Datos personales' });
    await waitFor(() =>
      expect(peticiones()).toContain('GET /api/perfil-profesional/yo'),
    );
    expect(invitacion()).not.toBeInTheDocument();
    expect(screen.queryByText('Error interno.')).not.toBeInTheDocument();
  });
});

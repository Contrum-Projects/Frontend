import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import {
  error,
  iniciarSesion,
  mostrar,
  producto,
  simularBackend,
} from './apiDePrueba';
import {
  PantallaEditarProducto,
  PantallaProductoNuevo,
} from './pantallaProducto';

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

const navegacion = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => navegacion,
}));

const RUTA = 'POST /api/catalogo/descripciones/sugerencia';
const SUGERENCIA = {
  descripcion: 'Shampoo de limpieza suave para cabello dañado.',
  ingredientes: 'Aqua, Glycerin, Parfum',
  firma: 'a'.repeat(64),
};

const tarjeta = () =>
  within(screen.getByRole('region', { name: 'Sugerir descripción' }));

const subirReverso = async (
  archivo = new File(['foto'], 'reverso.jpg', { type: 'image/jpeg' }),
) => {
  await userEvent.upload(
    tarjeta().getByLabelText('Subir foto del reverso'),
    archivo,
  );
};

const generar = () =>
  userEvent.click(
    tarjeta().getByRole('button', { name: 'Generar descripción' }),
  );

const elegir = async (campo: string, opcion: string) => {
  await userEvent.click(
    screen.getByRole('combobox', { name: new RegExp(`^${campo}`) }),
  );
  await userEvent.click(await screen.findByRole('option', { name: opcion }));
};

/** Nombre, marca y categoría: lo que falta para guardar además de la descripción. */
const llenarDatos = async () => {
  await userEvent.type(screen.getByLabelText(/^Nombre/), 'Shampoo suave');
  await elegir('Marca', 'Kérastase');
  await elegir('Categoría', 'Shampoo › Reparación');
};

/** En jsdom se dibujan los botones del encabezado y los del pie: se usa el primero. */
const guardar = () =>
  userEvent.click(
    screen.getAllByRole('button', { name: 'Guardar producto' })[0],
  );

const descripcion = () => screen.getByLabelText(/^Descripción del producto/);
const ingredientes = () => screen.getByLabelText(/^Ingredientes/);

/** Sube la foto, genera y espera la sugerencia. */
const sugerir = async () => {
  await subirReverso();
  await generar();
  await tarjeta().findByText(SUGERENCIA.descripcion);
};

const accion = (nombre: 'Usar' | 'Editar' | 'Descartar') =>
  userEvent.click(tarjeta().getByRole('button', { name: nombre }));

/** ¿El navegador pediría confirmar antes de cerrar o recargar la pestaña? */
const cerrarPestanaPideConfirmar = () => {
  const evento = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(evento);
  return evento.defaultPrevented;
};

const CREAR = 'POST /api/catalogo/productos';
const creado = () =>
  Response.json(producto({ id: 12, origenDescripcion: 'ia' }), { status: 201 });

beforeEach(() => {
  iniciarSesion();
  navegacion.replace.mockReset();
  navegacion.push.mockReset();
  // jsdom no crea URLs de archivos: la miniatura usa una fija
  vi.stubGlobal(
    'URL',
    Object.assign(URL, {
      createObjectURL: vi.fn(() => 'blob:reverso'),
      revokeObjectURL: vi.fn(),
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Sugerencia de IA en el producto (SCRUM-132)', () => {
  it('E4-H1 FE · generar: con la foto del reverso muestra la carga y luego la descripción y los ingredientes', async () => {
    let responder: (respuesta: Response) => void = () => {};
    const { pedidas } = simularBackend({
      [RUTA]: () => new Promise<Response>((resolver) => (responder = resolver)),
    });
    const agregado = vi.spyOn(FormData.prototype, 'append');
    mostrar(<PantallaProductoNuevo />);

    expect(
      tarjeta().queryByRole('button', { name: 'Generar descripción' }),
    ).not.toBeInTheDocument();
    await subirReverso();
    expect(tarjeta().getByText('reverso.jpg')).toBeInTheDocument();
    await generar();

    expect(await tarjeta().findByRole('status')).toHaveTextContent(
      'Leyendo la foto del reverso',
    );
    expect(pedidas).toContain(RUTA);
    expect(agregado).toHaveBeenCalledWith('imagen', expect.any(File));

    responder(Response.json(SUGERENCIA));

    expect(
      await tarjeta().findByText(SUGERENCIA.descripcion),
    ).toBeInTheDocument();
    expect(tarjeta().getByText('Ingredientes transcritos')).toBeInTheDocument();
    expect(tarjeta().getByText(SUGERENCIA.ingredientes)).toBeInTheDocument();
    expect(tarjeta().getByRole('status')).toBeEmptyDOMElement();
  });

  it('E4-H1 FE · generar: sin ingredientes en la foto no muestra esa sección', async () => {
    simularBackend({
      [RUTA]: () => Response.json({ ...SUGERENCIA, ingredientes: null }),
    });
    mostrar(<PantallaProductoNuevo />);

    await subirReverso();
    await generar();

    expect(
      await tarjeta().findByText(SUGERENCIA.descripcion),
    ).toBeInTheDocument();
    expect(
      tarjeta().queryByText('Ingredientes transcritos'),
    ).not.toBeInTheDocument();
  });

  it('E4-H1 FE · generar: un archivo que no es JPEG, PNG ni WebP se avisa sin enviarlo', async () => {
    const { pedidas } = simularBackend({});
    mostrar(<PantallaProductoNuevo />);

    await userEvent.upload(
      tarjeta().getByLabelText('Subir foto del reverso'),
      new File(['x'], 'reverso.gif', { type: 'image/gif' }),
      { applyAccept: false },
    );

    expect(
      tarjeta().getByText('La imagen debe ser JPEG, PNG o WebP.'),
    ).toBeInTheDocument();
    expect(
      tarjeta().queryByRole('button', { name: 'Generar descripción' }),
    ).not.toBeInTheDocument();
    expect(pedidas).not.toContain(RUTA);
  });

  it.each([
    [
      422,
      'No pudimos leer la foto del reverso. Prueba con otra foto o escribe la descripción a mano.',
    ],
    [
      503,
      'No pudimos generar la descripción en este momento. Puedes escribirla a mano.',
    ],
  ])(
    'E4-H1 FE · sin resultado (%i): informa y deja escribir la descripción a mano',
    async (estado, mensaje) => {
      simularBackend({ [RUTA]: () => error(estado, mensaje) });
      mostrar(<PantallaProductoNuevo />);

      const descripcion = screen.getByLabelText(/^Descripción del producto/);
      await userEvent.type(descripcion, 'Mi texto');
      await subirReverso();
      await generar();

      expect(await tarjeta().findByText(mensaje)).toBeInTheDocument();
      expect(descripcion).toHaveValue('Mi texto');
      expect(descripcion).toBeEnabled();
      await userEvent.type(descripcion, ' a mano');
      expect(descripcion).toHaveValue('Mi texto a mano');
      // Se puede volver a intentar con la misma foto o con otra
      expect(
        tarjeta().getByRole('button', { name: 'Generar descripción' }),
      ).toBeEnabled();
    },
  );

  it('E4-H1 FE · sin resultado: sin conexión informa que se puede escribir a mano', async () => {
    simularBackend({
      [RUTA]: () => {
        throw new TypeError('Failed to fetch');
      },
    });
    mostrar(<PantallaProductoNuevo />);

    await subirReverso();
    await generar();

    await waitFor(() =>
      expect(tarjeta().getByRole('alert')).toHaveTextContent(
        'No pudimos generar la descripción en este momento. Puedes escribirla a mano.',
      ),
    );
    expect(tarjeta().getByRole('alert')).not.toHaveTextContent(
      'Failed to fetch',
    );
  });
});

describe('Aceptar, editar o descartar la sugerencia (SCRUM-133)', () => {
  it('E4-H2 FE · tres acciones: «Usar» pasa la sugerencia al formulario y la envía con su firma', async () => {
    const { enviados } = simularBackend({
      [RUTA]: () => Response.json(SUGERENCIA),
      [CREAR]: creado,
    });
    mostrar(<PantallaProductoNuevo />);
    await llenarDatos();
    expect(screen.getByText('Sin descripción aún')).toBeInTheDocument();

    await sugerir();
    await accion('Usar');

    expect(descripcion()).toHaveValue(SUGERENCIA.descripcion);
    expect(ingredientes()).toHaveValue(SUGERENCIA.ingredientes);
    expect(screen.queryByText('Sin descripción aún')).not.toBeInTheDocument();
    // La tarjeta se cierra y queda lista para pedir otra
    expect(
      tarjeta().queryByRole('button', { name: 'Usar' }),
    ).not.toBeInTheDocument();
    expect(
      tarjeta().getByRole('button', { name: 'Generar descripción' }),
    ).toHaveFocus();
    expect(tarjeta().getByRole('status')).toHaveTextContent(
      'Pasamos la sugerencia a la descripción.',
    );

    await guardar();

    await waitFor(() =>
      expect(navegacion.replace).toHaveBeenCalledWith('/panel/productos/12'),
    );
    expect(enviados).toEqual([
      {
        nombre: 'Shampoo suave',
        descripcion: SUGERENCIA.descripcion,
        sugerencia: {
          descripcion: SUGERENCIA.descripcion,
          firma: SUGERENCIA.firma,
        },
        ingredientes: SUGERENCIA.ingredientes,
        marcaId: 1,
        categoriaId: 4,
        canalVenta: 'general',
      },
    ]);
  });

  it('E4-H2 FE · tres acciones: «Editar» deja el cursor en la descripción y envía la sugerencia de la que partió', async () => {
    const { enviados } = simularBackend({
      [RUTA]: () => Response.json(SUGERENCIA),
      [CREAR]: creado,
    });
    mostrar(<PantallaProductoNuevo />);
    await llenarDatos();

    await sugerir();
    await accion('Editar');

    expect(descripcion()).toHaveFocus();
    await userEvent.type(descripcion(), ' Sin sulfatos.');
    await guardar();

    await waitFor(() => expect(enviados).toHaveLength(1));
    // El backend la compara con la sugerida y la deja como «IA editada»
    expect(enviados[0]).toMatchObject({
      descripcion: `${SUGERENCIA.descripcion} Sin sulfatos.`,
      sugerencia: {
        descripcion: SUGERENCIA.descripcion,
        firma: SUGERENCIA.firma,
      },
    });
  });

  it('E4-H2 FE · tres acciones: «Descartar» cierra la sugerencia sin tocar lo escrito y se guarda como manual', async () => {
    const { enviados } = simularBackend({
      [RUTA]: () => Response.json(SUGERENCIA),
      [CREAR]: creado,
    });
    mostrar(<PantallaProductoNuevo />);
    await llenarDatos();
    await userEvent.type(descripcion(), 'Mi texto');

    await sugerir();
    await accion('Descartar');

    expect(
      tarjeta().queryByText(SUGERENCIA.descripcion),
    ).not.toBeInTheDocument();
    expect(descripcion()).toHaveValue('Mi texto');
    expect(ingredientes()).toHaveValue('');
    await guardar();

    await waitFor(() => expect(enviados).toHaveLength(1));
    expect(enviados[0]).not.toHaveProperty('sugerencia');
    expect(enviados[0]).toMatchObject({
      descripcion: 'Mi texto',
      ingredientes: null,
    });
  });

  it('E4-H2 FE · ingredientes: más de 3000 caracteres se avisa junto al campo sin enviar', async () => {
    const { pedidas } = simularBackend({});
    mostrar(<PantallaProductoNuevo />);
    await llenarDatos();
    await userEvent.type(descripcion(), 'Mi texto');
    await userEvent.click(ingredientes());
    await userEvent.paste('a'.repeat(3001));

    await guardar();

    expect(
      await screen.findByText(
        'La lista de ingredientes no puede superar los 3000 caracteres.',
      ),
    ).toBeInTheDocument();
    expect(ingredientes()).toHaveAttribute('aria-invalid', 'true');
    expect(pedidas.some((pedida) => pedida.startsWith('POST'))).toBe(false);
  });

  it('E4-H2 FE · tres acciones: al editar un producto también envía la sugerencia usada', async () => {
    const { enviados } = simularBackend({
      'GET /api/catalogo/productos/7': () => Response.json(producto()),
      'PATCH /api/catalogo/productos/7': () =>
        Response.json(
          producto({
            descripcion: SUGERENCIA.descripcion,
            ingredientes: SUGERENCIA.ingredientes,
            origenDescripcion: 'ia',
          }),
        ),
      [RUTA]: () => Response.json(SUGERENCIA),
    });
    mostrar(<PantallaEditarProducto id="7" />);
    await screen.findByDisplayValue('Repara el cabello dañado.');

    await sugerir();
    await accion('Usar');
    await guardar();

    expect(
      await screen.findByText('Guardamos los cambios de Shampoo reparador.'),
    ).toBeInTheDocument();
    expect(enviados[0]).toMatchObject({
      descripcion: SUGERENCIA.descripcion,
      sugerencia: {
        descripcion: SUGERENCIA.descripcion,
        firma: SUGERENCIA.firma,
      },
      ingredientes: SUGERENCIA.ingredientes,
    });
    // Guardada: salir ya no avisa
    expect(cerrarPestanaPideConfirmar()).toBe(false);
  });

  it('E4-H2 FE · sin publicar sin revisar: al salir con la sugerencia sin guardar avisa que no se guardará', async () => {
    simularBackend({ [RUTA]: () => Response.json(SUGERENCIA) });
    mostrar(<PantallaProductoNuevo />);

    await sugerir();
    await userEvent.click(screen.getAllByRole('link', { name: 'Cancelar' })[0]);

    const aviso = await screen.findByRole('alertdialog', {
      name: '¿Salir sin guardar?',
    });
    expect(
      within(aviso).getByText('La sugerencia de descripción no se guardará.'),
    ).toBeInTheDocument();

    await userEvent.click(
      within(aviso).getByRole('button', { name: 'Seguir editando' }),
    );
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(navegacion.push).not.toHaveBeenCalled();
    expect(tarjeta().getByText(SUGERENCIA.descripcion)).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('link', { name: 'Cancelar' })[0]);
    await userEvent.click(
      await screen.findByRole('button', { name: 'Salir sin guardar' }),
    );
    expect(navegacion.push).toHaveBeenCalledWith('/panel/productos');
  });

  it('E4-H2 FE · sin publicar sin revisar: con la sugerencia usada y sin guardar, cerrar la pestaña pide confirmación', async () => {
    simularBackend({ [RUTA]: () => Response.json(SUGERENCIA) });
    mostrar(<PantallaProductoNuevo />);

    expect(cerrarPestanaPideConfirmar()).toBe(false);
    await sugerir();
    await accion('Usar');
    expect(cerrarPestanaPideConfirmar()).toBe(true);
  });

  it('E4-H2 FE · sin publicar sin revisar: descartada la sugerencia, salir no avisa', async () => {
    simularBackend({ [RUTA]: () => Response.json(SUGERENCIA) });
    mostrar(<PantallaProductoNuevo />);

    await sugerir();
    await accion('Descartar');

    expect(cerrarPestanaPideConfirmar()).toBe(false);
  });
});

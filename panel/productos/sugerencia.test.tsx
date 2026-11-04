import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import { error, iniciarSesion, mostrar, simularBackend } from './apiDePrueba';
import { PantallaProductoNuevo } from './pantallaProducto';

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

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
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

beforeEach(() => {
  iniciarSesion();
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

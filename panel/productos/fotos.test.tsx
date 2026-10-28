import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { paths } from '@/compartido/api/esquema';
import type { FormatoPanel, ImagenPanel } from '@/compartido/api/respuestas';
import {
  error,
  formato,
  iniciarSesion,
  mostrar,
  producto,
  simularBackend,
} from './apiDePrueba';
import { PantallaEditarProducto } from './pantallaProducto';

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

/** Fotos con ids 1..n, en ese orden; `principal` es el id de la principal. */
const fotos = (cantidad: number, principal = 1): ImagenPanel[] =>
  Array.from({ length: cantidad }, (_, indice) => ({
    id: indice + 1,
    url: `https://imagenes.test/articulos/21/${indice + 1}.webp`,
    orden: indice + 1,
    esPrincipal: indice + 1 === principal,
  }));

const RUTA_FOTOS = '/api/catalogo/articulos/21/imagenes';

/** Backend con el producto 7 y su formato 21 (300 ml) con las fotos indicadas. */
const conFotos = (
  imagenes: ImagenPanel[],
  extra: Parameters<typeof simularBackend>[0] = {},
) =>
  simularBackend({
    'GET /api/catalogo/productos/7': () => Response.json(producto()),
    'GET /api/catalogo/productos/7/formatos': () =>
      Response.json([formato({ imagenes })] satisfies FormatoPanel[]),
    ...extra,
  });

/** Abre el panel desde la tabla de escritorio (en jsdom se dibujan tabla y tarjetas). */
const abrirFotos = async () => {
  const tabla = within(await screen.findByRole('table'));
  await userEvent.click(
    tabla.getByRole('button', { name: /Gestionar fotos$|^Agregar fotos/ }),
  );
  return within(await screen.findByRole('dialog', { name: 'Fotos de 300 ml' }));
};

const fotosDelPanel = (panel: ReturnType<typeof within>) =>
  panel.getAllByRole('button', { name: /^Foto \d de 300 ml/ });

beforeEach(() => {
  iniciarSesion();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Fotos por formato (SCRUM-102)', () => {
  it('E3-H3 FE · resumen: cada formato muestra cuántas fotos tiene y deja gestionarlas', async () => {
    conFotos(fotos(3));
    mostrar(<PantallaEditarProducto id="7" />);

    await screen.findByRole('table');
    expect(
      screen.getByRole('button', {
        name: '3 fotos · Gestionar fotos de 300 ml',
      }),
    ).toHaveTextContent('3 fotos · Gestionar');
    const panel = await abrirFotos();
    expect(fotosDelPanel(panel)).toHaveLength(3);
  });

  it('E3-H3 FE · subir foto: la imagen aparece en la galería del formato', async () => {
    const { pedidas } = conFotos(fotos(1), {
      [`POST ${RUTA_FOTOS}`]: () => Response.json(fotos(2), { status: 201 }),
    });
    const agregado = vi.spyOn(FormData.prototype, 'append');
    mostrar(<PantallaEditarProducto id="7" />);
    const panel = await abrirFotos();

    const archivo = new File(['foto'], 'reverso.webp', { type: 'image/webp' });
    await userEvent.upload(panel.getByLabelText('Agregar foto'), archivo);

    await waitFor(() => expect(fotosDelPanel(panel)).toHaveLength(2));
    expect(pedidas).toContain(`POST ${RUTA_FOTOS}`);
    expect(agregado).toHaveBeenCalledWith('imagen', archivo);
  });

  it('E3-H3 FE · subir foto: un rechazo del backend se muestra en el panel', async () => {
    conFotos(fotos(1), {
      [`POST ${RUTA_FOTOS}`]: () =>
        error(413, 'La imagen no puede superar los 5 MB.'),
    });
    mostrar(<PantallaEditarProducto id="7" />);
    const panel = await abrirFotos();

    await userEvent.upload(
      panel.getByLabelText('Agregar foto'),
      new File(['foto'], 'grande.jpg', { type: 'image/jpeg' }),
    );

    expect(
      await panel.findByText('La imagen no puede superar los 5 MB.'),
    ).toBeInTheDocument();
    expect(fotosDelPanel(panel)).toHaveLength(1);
  });

  it('E3-H3 FE · subir foto: un archivo que no es imagen no se envía y lo explica', async () => {
    const { pedidas } = conFotos(fotos(1));
    mostrar(<PantallaEditarProducto id="7" />);
    const panel = await abrirFotos();

    await userEvent.upload(
      panel.getByLabelText('Agregar foto'),
      new File(['%PDF'], 'ficha.pdf', { type: 'application/pdf' }),
      { applyAccept: false },
    );

    expect(
      await panel.findByText('La imagen debe ser JPEG, PNG o WebP.'),
    ).toBeInTheDocument();
    expect(pedidas).not.toContain(`POST ${RUTA_FOTOS}`);
  });

  it('E3-H3 FE · cambiar el orden: si el backend lo rechaza, avisa y vuelve al orden guardado', async () => {
    conFotos(fotos(3), {
      [`PUT ${RUTA_FOTOS}`]: () =>
        error(400, 'Indica todas las imágenes del artículo, cada una una vez.'),
    });
    mostrar(<PantallaEditarProducto id="7" />);
    const panel = await abrirFotos();

    await userEvent.click(
      panel.getByRole('button', { name: 'Opciones de la foto 2' }),
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Marcar como principal' }),
    );

    expect(
      await panel.findByText(
        'Indica todas las imágenes del artículo, cada una una vez.',
      ),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        panel.getByRole('button', { name: 'Foto 1 de 300 ml, principal' }),
      ).toBeInTheDocument(),
    );
  });

  it('E3-H3 FE · marcar otra principal: la galería muestra una sola principal', async () => {
    const { enviados } = conFotos(fotos(3), {
      [`PUT ${RUTA_FOTOS}`]: () => Response.json(fotos(3, 3)),
    });
    mostrar(<PantallaEditarProducto id="7" />);
    const panel = await abrirFotos();

    await userEvent.click(
      panel.getByRole('button', { name: 'Opciones de la foto 3' }),
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Marcar como principal' }),
    );

    await waitFor(() =>
      expect(enviados).toEqual([{ orden: [1, 2, 3], principalId: 3 }]),
    );
    expect(panel.getAllByText('Principal')).toHaveLength(1);
    expect(
      panel.getByRole('button', { name: 'Foto 3 de 300 ml, principal' }),
    ).toBeInTheDocument();
  });

  it('E3-H3 FE · cambiar el orden: mueve la foto con el teclado y guarda el orden nuevo', async () => {
    const { enviados } = conFotos(fotos(3), {
      [`PUT ${RUTA_FOTOS}`]: () =>
        Response.json([
          { ...fotos(3)[1], orden: 1 },
          { ...fotos(3)[0], orden: 2 },
          fotos(3)[2],
        ]),
    });
    // jsdom no calcula posiciones: cada foto ocupa una casilla de 100 px en una fila
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: Element) {
        const li = this.closest('li');
        const indice = li ? [...li.parentElement!.children].indexOf(li) : 0;
        return DOMRect.fromRect({
          x: indice * 100,
          y: 0,
          width: 90,
          height: 90,
        });
      },
    );
    mostrar(<PantallaEditarProducto id="7" />);
    const panel = await abrirFotos();

    const primera = panel.getByRole('button', {
      name: 'Foto 1 de 300 ml, principal',
    });
    primera.focus();
    // dnd-kit escucha las flechas recién en la vuelta siguiente del ciclo de eventos
    const tecla = async (code: string) => {
      fireEvent.keyDown(primera, { code });
      await act(() => new Promise((listo) => setTimeout(listo, 0)));
    };
    await tecla('Space');
    await tecla('ArrowRight');
    await tecla('Space');

    await waitFor(() =>
      expect(enviados).toEqual([{ orden: [2, 1, 3], principalId: 1 }]),
    );
    expect(panel.getAllByText('Principal')).toHaveLength(1);
  });

  it('E3-H3 FE · última foto: no se puede quitar y explica que se necesita al menos una', async () => {
    conFotos(fotos(1));
    mostrar(<PantallaEditarProducto id="7" />);
    const panel = await abrirFotos();

    expect(
      panel.getByText(
        'El formato necesita al menos una foto: sube otra antes de quitar esta.',
      ),
    ).toBeInTheDocument();
    await userEvent.click(
      panel.getByRole('button', { name: 'Opciones de la foto 1' }),
    );
    const quitarFoto = await screen.findByRole('menuitem', {
      name: /^Quitar foto/,
    });
    expect(quitarFoto).toHaveAttribute('aria-disabled', 'true');
    expect(quitarFoto).toHaveTextContent('Necesita al menos una foto');
  });

  it('E3-H3 FE · quitar foto: con varias, la quita y muestra las que quedan', async () => {
    const { pedidas } = conFotos(fotos(2), {
      [`DELETE ${RUTA_FOTOS}/2`]: () => Response.json(fotos(1)),
    });
    mostrar(<PantallaEditarProducto id="7" />);
    const panel = await abrirFotos();

    await userEvent.click(
      panel.getByRole('button', { name: 'Opciones de la foto 2' }),
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Quitar foto' }),
    );

    await waitFor(() => expect(fotosDelPanel(panel)).toHaveLength(1));
    expect(pedidas).toContain(`DELETE ${RUTA_FOTOS}/2`);
  });
});

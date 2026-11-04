'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/compartido/ui/alert-dialog';

/** Un clic que abre el enlace en otra pestaña o ventana no deja la pantalla. */
const abreAparte = (evento: MouseEvent, enlace: HTMLAnchorElement) =>
  evento.button !== 0 ||
  evento.metaKey ||
  evento.ctrlKey ||
  evento.shiftKey ||
  evento.altKey ||
  (enlace.target !== '' && enlace.target !== '_self') ||
  enlace.hasAttribute('download');

/**
 * El destino interno de un clic que deja esta pantalla, o `null` si el clic no sale de ella. Los
 * enlaces a otro sitio los cubre `beforeunload`.
 */
const destinoDelClic = (evento: MouseEvent): string | null => {
  if (evento.defaultPrevented || !(evento.target instanceof Element)) {
    return null;
  }
  const enlace = evento.target.closest('a[href]');
  if (!(enlace instanceof HTMLAnchorElement) || abreAparte(evento, enlace)) {
    return null;
  }
  const url = new URL(enlace.href, window.location.href);
  const aqui = window.location;
  // `//otro.sitio` sería, para el router, una URL de otro origen
  if (url.origin !== aqui.origin || url.pathname.startsWith('//')) return null;
  if (url.pathname === aqui.pathname && url.search === aqui.search) return null;
  return `${url.pathname}${url.search}${url.hash}`;
};

/**
 * E4-H2, criterio 2 · Con una sugerencia de la IA sin guardar, avisa antes de salir: los enlaces
 * internos (menú del panel, «Cancelar») abren este diálogo y cerrar o recargar la pestaña pide la
 * confirmación del navegador. El botón «Atrás» del navegador no se puede detener en Next 16.
 */
export const AvisoAlSalir = ({ activo }: { activo: boolean }) => {
  const router = useRouter();
  const [destino, setDestino] = useState<string | null>(null);

  useEffect(() => {
    if (!activo) return;
    const alDescargar = (evento: BeforeUnloadEvent) => evento.preventDefault();
    // En captura, antes que el `onClick` de `Link`: detenerlo aquí evita la navegación
    const alHacerClic = (evento: MouseEvent) => {
      const siguiente = destinoDelClic(evento);
      if (!siguiente) return;
      evento.preventDefault();
      evento.stopPropagation();
      setDestino(siguiente);
    };
    window.addEventListener('beforeunload', alDescargar);
    document.addEventListener('click', alHacerClic, true);
    return () => {
      window.removeEventListener('beforeunload', alDescargar);
      document.removeEventListener('click', alHacerClic, true);
    };
  }, [activo]);

  return (
    <AlertDialog
      open={destino !== null}
      onOpenChange={(abierto) => !abierto && setDestino(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Salir sin guardar?</AlertDialogTitle>
          <AlertDialogDescription>
            La sugerencia de descripción no se guardará.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Seguir editando</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              // Sale de un enlace de la app: ya es una ruta válida
              if (destino) router.push(destino as Route);
            }}
          >
            Salir sin guardar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { useSesion } from '@/compartido/sesion/sesion';
import { Button } from '@/compartido/ui/button';
import { PanelLateral } from '@/panel/catalogo/panelLateral';
import { puedeAbrir } from '@/panel/diseno/secciones';
import { FormularioSalida } from './formularioSalida';

export const RUTA_ENTRADA_NUEVA: Route = '/panel/inventario/entradas/nueva';
export const RUTA_SALIDA_NUEVA: Route = '/panel/inventario/salidas/nueva';

/**
 * «Registrar salida» y «Nueva entrada» de la cabecera de Inventario (Figma P5a 2043:1692 y
 * 2044:1067). En escritorio, la salida se registra en un panel lateral sobre la página (P5c
 * 2043:1951); en celular, en su propia pantalla (P5c 2044:1209). Cada botón pide el permiso
 * de su ruta.
 */
export const AccionesInventario = ({
  disposicion,
}: {
  /** `cabecera`: junto al título (escritorio); `ancho`: bajo las pestañas (celular). */
  disposicion: 'cabecera' | 'ancho';
}) => {
  const { usuario } = useSesion();
  const [salidaAbierta, setSalidaAbierta] = useState(false);
  const salida = puedeAbrir(usuario?.rol, RUTA_SALIDA_NUEVA);
  const entrada = puedeAbrir(usuario?.rol, RUTA_ENTRADA_NUEVA);

  if (disposicion === 'ancho') {
    // A 360 px cada botón mide ~158 px: con menos relleno y salto de línea, el texto no se sale
    return (
      <div className="grid auto-cols-fr grid-flow-col gap-3 lg:hidden">
        {salida && (
          <Button
            asChild
            variant="contorno"
            className="h-auto min-h-10 min-w-0 px-3 text-center whitespace-normal"
          >
            <Link href={RUTA_SALIDA_NUEVA}>Registrar salida</Link>
          </Button>
        )}
        {entrada && (
          <Button
            asChild
            className="h-auto min-h-10 min-w-0 px-3 text-center whitespace-normal"
          >
            <Link href={RUTA_ENTRADA_NUEVA}>Nueva entrada</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-3 max-lg:hidden">
      {salida && (
        <>
          <Button variant="contorno" onClick={() => setSalidaAbierta(true)}>
            Registrar salida
          </Button>
          <PanelLateral
            titulo="Registrar salida"
            abierto={salidaAbierta}
            alCambiarAbierto={setSalidaAbierta}
          >
            {/* El Sheet desmonta su contenido al cerrarse: cada apertura empieza vacía */}
            <FormularioSalida
              alRegistrar={() => setSalidaAbierta(false)}
              alCancelar={() => setSalidaAbierta(false)}
            />
          </PanelLateral>
        </>
      )}
      {entrada && (
        <Button asChild>
          <Link href={RUTA_ENTRADA_NUEVA}>Nueva entrada</Link>
        </Button>
      )}
    </div>
  );
};

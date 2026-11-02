'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Info, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import type { AjusteUnionCarrito } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { MAXIMO_UNIDADES_LINEA } from './carritoNavegador';
import { useCuentaCompradora, useErrorUnion } from './consultasCarrito';
import { unirUnaVez } from './unionCarrito';

/**
 * E5-H2 · La unión falló: los productos siguen en el navegador. Se ve arriba de /carrito con
 * «Reintentar» hasta que se unan (decidido el 02-11-2026).
 */
export const AvisoErrorUnion = () => {
  const mensaje = useErrorUnion();
  const cuenta = useCuentaCompradora();
  const clienteConsultas = useQueryClient();
  const [reintentando, setReintentando] = useState(false);
  if (!mensaje) return null;

  const reintentar = async () => {
    setReintentando(true);
    await unirUnaVez(cuenta, clienteConsultas);
    setReintentando(false);
  };

  return (
    <Alert variant="aviso">
      <TriangleAlert aria-hidden />
      <AlertDescription className="flex flex-col items-start gap-2 texto-pequeno md:texto-cuerpo">
        <p>{mensaje}</p>
        <Button
          type="button"
          variant="contorno"
          disabled={reintentando}
          onClick={() => void reintentar()}
        >
          Reintentar
        </Button>
      </AlertDescription>
    </Alert>
  );
};

/**
 * E5-H2 · Lo que el backend quitó o ajustó al unir el carrito del navegador con el de la cuenta
 * (textos decididos el 02-11-2026). No dice cuántas unidades hay (E2-H3).
 */
export const AvisoUnion = ({ ajustes }: { ajustes: AjusteUnionCarrito[] }) => {
  const mensajes = textosDeAjustes(ajustes);
  if (mensajes.length === 0) return null;
  return (
    <Alert variant="info">
      <Info aria-hidden />
      <AlertDescription className="texto-pequeno text-marca-profundo md:texto-cuerpo">
        {mensajes.join(' ')}
      </AlertDescription>
    </Alert>
  );
};

export const textosDeAjustes = (ajustes: AjusteUnionCarrito[]): string[] => {
  const quitados = ajustes.filter(
    ({ motivo }) => motivo === 'no_disponible' || motivo === 'agotado',
  ).length;
  const ajustados = ajustes.filter(
    ({ motivo }) => motivo === 'cantidad_ajustada',
  ).length;
  const mensajes: string[] = [];
  if (quitados === 1) {
    mensajes.push('Quitamos un producto que ya no está disponible.');
  } else if (quitados > 1) {
    mensajes.push(
      `Quitamos ${quitados} productos que ya no están disponibles.`,
    );
  }
  if (ajustados === 1) {
    mensajes.push(
      `Ajustamos la cantidad de un producto al máximo de ${MAXIMO_UNIDADES_LINEA}.`,
    );
  } else if (ajustados > 1) {
    mensajes.push(
      `Ajustamos la cantidad de ${ajustados} productos al máximo de ${MAXIMO_UNIDADES_LINEA}.`,
    );
  }
  return mensajes;
};

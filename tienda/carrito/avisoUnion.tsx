import { Info } from 'lucide-react';
import type { AjusteUnionCarrito } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { MAXIMO_UNIDADES_LINEA } from './carritoNavegador';

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

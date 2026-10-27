import { useState } from 'react';
import { useSesion } from '@/compartido/sesion/sesion';

const MENSAJE_FALLO = 'No pudimos cerrar tu sesión. Intenta de nuevo.';

/**
 * Botones de «Cerrar sesión» (E1-H3): evita el doble envío y, si el backend no confirma el
 * cierre, deja la sesión abierta y entrega el mensaje para mostrar junto al botón.
 * `alCerrar` corre solo si la sesión se cerró.
 */
export const useCerrarSesion = ({
  todas = false,
  alCerrar,
}: { todas?: boolean; alCerrar?: () => void } = {}) => {
  const { cerrarSesion } = useSesion();
  const [cerrando, setCerrando] = useState(false);
  const [fallo, setFallo] = useState(false);

  const cerrar = async () => {
    if (cerrando) return;
    setCerrando(true);
    setFallo(false);
    const cerrada = await cerrarSesion({ todas });
    setCerrando(false);
    if (cerrada) alCerrar?.();
    else setFallo(true);
  };

  return { cerrar, cerrando, error: fallo ? MENSAJE_FALLO : undefined };
};

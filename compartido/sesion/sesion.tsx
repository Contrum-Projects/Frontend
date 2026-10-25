'use client';

/**
 * Acceso a la sesión desde los componentes:
 *
 *   const { estado, usuario, iniciarSesion, cerrarSesion } = useSesion();
 *
 * Al montar la app se intenta renovar la sesión con la cookie de refresco, así quien ya había
 * ingresado sigue dentro al recargar. Mientras eso ocurre el estado es «desconocida»: muestra
 * un esqueleto en vez de «Ingresar» para no parpadear.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { api } from '@/compartido/api/cliente';
import { exigir } from '@/compartido/api/errores';
import type { SesionIniciada } from '@/compartido/api/respuestas';
import {
  guardarSesion,
  leerEstado,
  olvidarSesion,
  renovarSesion,
  suscribir,
  type EstadoSesion,
} from './almacen';

const ESTADO_EN_SERVIDOR: EstadoSesion = { tipo: 'desconocida' };

/** Va una vez en el layout raíz (compartido/proveedores.tsx). */
export function IniciadorDeSesion() {
  useEffect(() => {
    if (leerEstado().tipo === 'desconocida') void renovarSesion();
  }, []);
  return null;
}

export function useSesion() {
  const estado = useSyncExternalStore(
    suscribir,
    leerEstado,
    () => ESTADO_EN_SERVIDOR,
  );
  const clienteConsultas = useQueryClient();

  /** E1-H2. Lanza ErrorDeApi con el mensaje del backend si el inicio falla. */
  const iniciarSesion = useCallback(
    async (datos: { email: string; contrasena: string }) => {
      const sesion = exigir<SesionIniciada>(
        await api.POST('/api/cuentas/sesion', { body: datos }),
      );
      clienteConsultas.clear();
      guardarSesion(sesion);
      return sesion.usuario;
    },
    [clienteConsultas],
  );

  /** E1-H3. `todas: true` cierra la sesión en todos los dispositivos. */
  const cerrarSesion = useCallback(
    async ({ todas = false }: { todas?: boolean } = {}) => {
      try {
        await (todas
          ? api.DELETE('/api/cuentas/sesion/todas')
          : api.DELETE('/api/cuentas/sesion'));
      } finally {
        olvidarSesion();
        clienteConsultas.clear();
      }
    },
    [clienteConsultas],
  );

  return {
    estado: estado.tipo,
    usuario: estado.tipo === 'activa' ? estado.usuario : undefined,
    iniciarSesion,
    cerrarSesion,
  };
}

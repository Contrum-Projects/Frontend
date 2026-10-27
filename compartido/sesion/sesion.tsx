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
  esperarRenovacion,
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

  /**
   * E1-H3. `todas: true` cierra la sesión en todos los dispositivos. Devuelve `false` si el
   * backend no confirmó el cierre (5xx o sin conexión): la sesión sigue abierta para que la
   * persona lo intente de nuevo, y no crea haber cerrado una sesión que sigue viva. Un 401
   * significa que ya estaba cerrada.
   */
  const cerrarSesion = useCallback(
    async ({ todas = false }: { todas?: boolean } = {}) => {
      // Una renovación en curso cambiaría la cookie que se va a cerrar
      await esperarRenovacion();
      let codigo: number;
      try {
        const { response } = await (todas
          ? api.DELETE('/api/cuentas/sesion/todas')
          : api.DELETE('/api/cuentas/sesion'));
        codigo = response.status;
      } catch {
        return false;
      }
      if (codigo >= 300 && codigo !== 401) return false;
      // Con 401 el cliente de la API ya pudo dejar la sesión como rechazada
      if (leerEstado().tipo === 'activa') {
        olvidarSesion(todas ? 'todos' : 'este');
      }
      clienteConsultas.clear();
      return true;
    },
    [clienteConsultas],
  );

  return {
    estado: estado.tipo,
    usuario: estado.tipo === 'activa' ? estado.usuario : undefined,
    /** Si la persona cerró la sesión (en este dispositivo o en todos). */
    cierre: estado.tipo === 'anonima' ? estado.cierre : undefined,
    iniciarSesion,
    cerrarSesion,
  };
}

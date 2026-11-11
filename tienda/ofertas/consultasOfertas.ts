'use client';

import { useQuery } from '@tanstack/react-query';
import type { DatosPersonales } from '@/compartido/api/respuestas';
import { consultaMisDatos } from '@/tienda/cuenta/consultasCuenta';

/**
 * E12-H2 · Si la cuenta recibe ofertas por correo y desde cuándo. Se lee de los datos de la cuenta
 * (`consentimientoMarketing` de `GET /api/cuentas/yo`, decisión del 6 nov, SCRUM-150): la misma
 * consulta de «Mis datos», sin una ruta aparte. Solo se lee: la cuenta ya no la cambia (decisión
 * del equipo del 11 nov, SCRUM-19).
 */
export const usePreferenciaOfertas = () =>
  useQuery({
    ...consultaMisDatos,
    select: (datos: DatosPersonales) => datos.consentimientoMarketing,
  });

import { InvitacionPerfil } from '@/tienda/profesional/invitacionPerfil';
import { DatosPersonales } from './datosPersonales';
import { DireccionesCuenta } from './direccionesCuenta';
import { SeguridadCuenta } from './seguridadCuenta';

/**
 * 10 Mis datos (Figma 2034:2270): datos personales, direcciones y seguridad. Es lo que se abre al
 * entrar a la cuenta, así que arriba va la invitación al perfil profesional (E10-H4).
 */
export function PantallaMisDatos() {
  return (
    <>
      <h1 className="titulo-h1 text-texto-principal">Mis datos</h1>
      <InvitacionPerfil />
      <DatosPersonales />
      <DireccionesCuenta />
      <SeguridadCuenta />
    </>
  );
}

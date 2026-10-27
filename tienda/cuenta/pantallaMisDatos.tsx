import { DatosPersonales } from './datosPersonales';
import { DireccionesCuenta } from './direccionesCuenta';
import { SeguridadCuenta } from './seguridadCuenta';

/** 10 Mis datos (Figma 2034:2270): datos personales, direcciones y seguridad. */
export function PantallaMisDatos() {
  return (
    <>
      <h1 className="titulo-h1 text-texto-principal">Mis datos</h1>
      <DatosPersonales />
      <DireccionesCuenta />
      <SeguridadCuenta />
    </>
  );
}

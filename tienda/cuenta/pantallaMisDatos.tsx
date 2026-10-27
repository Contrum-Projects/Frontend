import { SeguridadCuenta } from './seguridadCuenta';

/**
 * 10 Mis datos (Figma 2034:2270). Por ahora solo la tarjeta Seguridad (SCRUM-95); Datos
 * personales y Direcciones llegan con SCRUM-97.
 */
export function PantallaMisDatos() {
  return (
    <>
      <h1 className="titulo-h1 text-texto-principal">Mis datos</h1>
      <SeguridadCuenta />
    </>
  );
}

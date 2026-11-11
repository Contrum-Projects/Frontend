import { Check } from 'lucide-react';
import { useId } from 'react';
import type { PreferenciaOfertas } from '@/compartido/api/respuestas';
import { formatearFechaLarga } from '@/compartido/formato/fecha';
import { Separator } from '@/compartido/ui/separator';
import { CORREO_CONTACTO } from '@/tienda/diseno/contacto';

/** Lo que incluye la publicidad por correo (Figma 2066:3845 a 2066:3856). */
const INCLUYE = [
  'Campañas con ofertas y novedades de la tienda.',
  'Un saludo en tu cumpleaños, si registraste tu fecha de nacimiento.',
  'Recordatorios si dejas productos en el carrito.',
] as const;

const estadoActual = ({ acepta, fechaConsentimiento }: PreferenciaOfertas) => {
  if (!acepta) return 'No recibes ofertas por correo.';
  return fechaConsentimiento
    ? `Activado el ${formatearFechaLarga(fechaConsentimiento)}.`
    : 'Recibes ofertas por correo.';
};

/**
 * Tarjeta «Preferencia» (Figma 2066:3712), solo para leer. Las ofertas se aceptan al crear la
 * cuenta y la cuenta ya no puede desactivarlas sola: para dejar de recibirlas escribe al correo
 * de contacto y el administrador la da de baja en el panel (decisión del equipo del 11 nov,
 * SCRUM-19). Por eso no tiene el interruptor de Figma.
 */
export const TarjetaOfertas = ({
  preferencia,
}: {
  preferencia: PreferenciaOfertas;
}) => {
  const id = useId();

  return (
    <section
      aria-labelledby={`${id}-titulo`}
      className="flex flex-col gap-4 rounded-lg border bg-card p-6"
    >
      <div className="flex flex-col gap-1">
        <h2
          id={`${id}-titulo`}
          className="texto-cuerpo-fuerte text-texto-principal"
        >
          Ofertas y novedades por correo
        </h2>
        <p className="texto-pequeno text-texto-secundario">
          {estadoActual(preferencia)}
        </p>
      </div>

      {preferencia.acepta && (
        <>
          <Separator />
          <p className="texto-etiqueta text-texto-principal">Recibes</p>
          <ul className="flex flex-col gap-3">
            {INCLUYE.map((texto) => (
              <li key={texto} className="flex items-start gap-3">
                <Check
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 stroke-[1.75] text-texto-principal"
                />
                <span className="texto-pequeno text-texto-principal">
                  {texto}
                </span>
              </li>
            ))}
          </ul>
          <p className="texto-pequeno text-texto-secundario">
            Para dejar de recibirlas, escríbenos a{' '}
            <a
              href={`mailto:${CORREO_CONTACTO}`}
              className="texto-etiqueta text-marca-profundo underline-offset-2 hover:underline"
            >
              {CORREO_CONTACTO}
            </a>
            .
          </p>
        </>
      )}

      <p className="texto-pequeno text-texto-secundario">
        Los correos de tus pedidos, pagos y cuenta llegan siempre.
      </p>
    </section>
  );
};

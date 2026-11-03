'use client';

import { Plus } from 'lucide-react';
import { useId, useState } from 'react';
import type { DatosFacturacionCuenta } from '@/compartido/api/respuestas';
import { formatearRut } from '@/compartido/formato/rut';
import { cn } from '@/compartido/lib/utils';
import { Button } from '@/compartido/ui/button';
import { RadioGroup, RadioGroupItem } from '@/compartido/ui/radio-group';
import { Skeleton } from '@/compartido/ui/skeleton';
import { Switch } from '@/compartido/ui/switch';
import { ErrorProfesional } from '@/tienda/profesional/errorProfesional';
import { DialogoFacturacion } from '@/tienda/cuenta/dialogoFacturacion';
import { CLASE_ENLACE } from '@/tienda/cuenta/eliminarFacturacion';
import { SeccionCheckout } from './seccionesCheckout';
import type { Documento } from './useDocumento';

/**
 * E9-H1 · «2. Documento» (Figma › 05 Checkout 2010:1121; celular 2010:2272). Sin activar nada,
 * el comprobante electrónico de pago. Con «Necesito factura», los datos de facturación de la
 * cuenta para elegir cuáles usar. En escritorio el interruptor va a la izquierda; en celular, a
 * la derecha.
 */
export const SeccionDocumento = ({ documento }: { documento: Documento }) => {
  const idInterruptor = useId();
  const idDescripcion = useId();
  return (
    <SeccionCheckout titulo="2. Documento">
      {() => (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4 rounded-lg border-[1.5px] border-fondo-hueso-oscuro bg-fondo-superficie px-4 py-4 max-md:flex-row-reverse md:px-6">
            <Switch
              id={idInterruptor}
              checked={documento.conFactura}
              onCheckedChange={documento.cambiarConFactura}
              aria-describedby={idDescripcion}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <label
                htmlFor={idInterruptor}
                className="cursor-pointer texto-cuerpo-fuerte text-texto-principal"
              >
                Necesito factura
              </label>
              <p
                id={idDescripcion}
                className="texto-pequeno text-texto-secundario"
              >
                {documento.conFactura
                  ? 'Con los datos de facturación de tu cuenta.'
                  : 'Si no, recibes el comprobante electrónico de pago en tu correo.'}
              </p>
            </div>
          </div>
          {documento.conFactura && <DatosFactura documento={documento} />}
        </div>
      )}
    </SeccionCheckout>
  );
};

/** Qué muestra el diálogo: datos nuevos o un registro que se edita. */
type Edicion = { registro?: DatosFacturacionCuenta } | null;

/**
 * E9-H1, criterios 2 y 3 · Los datos de facturación de la cuenta (Figma 2021:1779): uno elegido,
 * con «Editar» y «Agregar datos de facturación» en el mismo diálogo. Sin datos, pide
 * registrarlos: el pago queda bloqueado hasta guardar uno, que queda elegido.
 */
const DatosFactura = ({ documento }: { documento: Documento }) => {
  const [edicion, setEdicion] = useState<Edicion>(null);
  const { datos, elegidos } = documento;

  const contenido = () => {
    if (datos.isPending) {
      return (
        <>
          {/* Con el alto de la fila y del enlace de abajo, para que no salte al cargar */}
          <Skeleton aria-hidden className="h-20 rounded-md" />
          <Skeleton aria-hidden className="h-10 w-56" />
          <span className="sr-only">Cargando tus datos de facturación</span>
        </>
      );
    }
    if (datos.isError) {
      return (
        <ErrorProfesional
          mensaje={datos.error.message}
          onReintentar={() => void datos.refetch()}
        />
      );
    }
    if (datos.data.length === 0) {
      // El mismo mensaje con que el backend rechaza la factura sin datos (409)
      return (
        <p className="texto-pequeno text-texto-secundario">
          Debes registrar tus datos de facturación antes de pedir factura.
        </p>
      );
    }
    return (
      <ListaDatosFactura
        lista={datos.data}
        elegidos={elegidos}
        alElegir={documento.elegir}
        alEditar={(registro) => setEdicion({ registro })}
      />
    );
  };

  return (
    <div className="flex flex-col gap-2 md:pl-16">
      {contenido()}
      {!datos.isPending && !datos.isError && (
        <Button
          variant="link"
          className={cn(CLASE_ENLACE, 'self-start')}
          onClick={() => setEdicion({})}
        >
          <Plus aria-hidden />
          Agregar datos de facturación
        </Button>
      )}
      <DialogoFacturacion
        registro={edicion?.registro}
        abierto={edicion !== null}
        alCambiarAbierto={(abierto) => {
          if (!abierto) setEdicion(null);
        }}
        // Los datos nuevos (o los editados) quedan elegidos
        alGuardar={(registro) => documento.elegir(registro.id)}
      />
    </div>
  );
};

/**
 * Un registro por fila: elegido, borde profundo sobre acento suave. «Editar» queda fuera de la
 * etiqueta del radio; por eso el contenedor es un `group` y no un `radiogroup` (como la entrega).
 */
const ListaDatosFactura = ({
  lista,
  elegidos,
  alElegir,
  alEditar,
}: {
  lista: DatosFacturacionCuenta[];
  /** `null` si los que eligió ya no están: ninguno marcado hasta que elija otros. */
  elegidos: DatosFacturacionCuenta | null;
  alElegir: (id: number) => void;
  alEditar: (registro: DatosFacturacionCuenta) => void;
}) => {
  const idPrefijo = useId();
  return (
    <RadioGroup
      role="group"
      aria-label="Datos de facturación"
      value={elegidos ? String(elegidos.id) : ''}
      onValueChange={(valor) => alElegir(Number(valor))}
      className="gap-2"
    >
      {lista.map((registro) => {
        const id = `${idPrefijo}-${registro.id}`;
        const elegido = registro.id === elegidos?.id;
        return (
          <div
            key={registro.id}
            className={cn(
              'flex items-center gap-3 rounded-md px-4 py-3 has-focus-visible:ring-[3px] has-focus-visible:ring-ring/60',
              elegido
                ? 'border-2 border-marca-profundo bg-marca-acento-suave'
                : 'border-[1.5px] border-fondo-hueso-oscuro bg-fondo-superficie',
            )}
          >
            <label
              htmlFor={id}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
            >
              <RadioGroupItem id={id} value={String(registro.id)} />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="texto-cuerpo-fuerte break-words text-texto-principal">
                  {registro.razonSocial}
                </span>
                <span className="texto-pequeno break-words text-texto-secundario">
                  {detalleFacturacion(registro)}
                </span>
              </span>
            </label>
            <Button
              variant="link"
              className={CLASE_ENLACE}
              aria-label={`Editar ${registro.razonSocial}`}
              onClick={() => alEditar(registro)}
            >
              Editar
            </Button>
          </div>
        );
      })}
    </RadioGroup>
  );
};

/** «RUT 76.123.456-7 · Giro: peluquería · Providencia» (Figma 2021:1785). */
const detalleFacturacion = (registro: DatosFacturacionCuenta) =>
  [
    `RUT ${formatearRut(registro.rut)}`,
    `Giro: ${registro.giro}`,
    registro.comuna.nombre,
  ].join(' · ');

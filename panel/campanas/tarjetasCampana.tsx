'use client';

import { UsersRound } from 'lucide-react';
import { type ReactNode, useRef, useState } from 'react';
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
} from 'react-hook-form';
import { Input } from '@/compartido/ui/input';
import { Textarea } from '@/compartido/ui/textarea';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import type { FormularioCampana } from './esquemaCampana';
import { insertarEn, type MarcadorCampana, textoMarcador } from './marcadores';
import { MenuMarcadores } from './menuMarcadores';
import { SelectorSegmento } from './selectorSegmento';

type CampoMensaje = 'asunto' | 'cuerpo';

const Tarjeta = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-4 lg:rounded-lg lg:border lg:bg-card lg:p-6">
    {children}
  </div>
);

/** «Mensaje» (P7a 2046:1734): asunto y cuerpo en texto simple, con los datos de quien recibe. */
export function TarjetaMensaje({
  id,
  register,
  setValue,
  errors,
}: {
  id: string;
  register: UseFormRegister<FormularioCampana>;
  setValue: UseFormSetValue<FormularioCampana>;
  errors: FieldErrors<FormularioCampana>;
}) {
  const campos = useRef<
    Partial<Record<CampoMensaje, HTMLInputElement | HTMLTextAreaElement>>
  >({});
  // El menú inserta en el último campo que tuvo el foco; al empezar, en el cuerpo
  const [destino, setDestino] = useState<CampoMensaje>('cuerpo');
  const { ref: refAsunto, ...asunto } = register('asunto');
  const { ref: refCuerpo, ...cuerpo } = register('cuerpo');

  const insertar = (clave: MarcadorCampana) => {
    const campo = campos.current[destino];
    if (!campo) return;
    const { texto, cursor } = insertarEn(
      campo.value,
      textoMarcador(clave),
      campo.selectionStart ?? campo.value.length,
      campo.selectionEnd ?? campo.value.length,
    );
    setValue(destino, texto, { shouldDirty: true });
    campo.focus();
    // Después de que el campo recibe el valor nuevo
    requestAnimationFrame(() => campo.setSelectionRange(cursor, cursor));
  };

  return (
    <Tarjeta>
      <h2 className="texto-cuerpo-fuerte text-texto-principal max-lg:sr-only">
        Mensaje
      </h2>
      <CampoFormulario
        id={`${id}-asunto`}
        etiqueta="Asunto"
        error={errors.asunto?.message}
      >
        {(propsControl) => (
          <Input
            {...propsControl}
            {...asunto}
            ref={(elemento) => {
              refAsunto(elemento);
              if (elemento) campos.current.asunto = elemento;
            }}
            onFocus={() => setDestino('asunto')}
            autoComplete="off"
          />
        )}
      </CampoFormulario>
      <CampoFormulario
        id={`${id}-cuerpo`}
        etiqueta="Cuerpo"
        error={errors.cuerpo?.message}
      >
        {(propsControl) => (
          <Textarea
            {...propsControl}
            aria-describedby={[
              propsControl['aria-describedby'],
              `${id}-cuerpo-ayuda`,
            ]
              .filter(Boolean)
              .join(' ')}
            {...cuerpo}
            ref={(elemento) => {
              refCuerpo(elemento);
              if (elemento) campos.current.cuerpo = elemento;
            }}
            onFocus={() => setDestino('cuerpo')}
            rows={6}
            autoComplete="off"
            placeholder="Hola, {nombre}:"
          />
        )}
      </CampoFormulario>
      <MenuMarcadores id={id} destino={destino} alInsertar={insertar} />
      <p
        id={`${id}-cuerpo-ayuda`}
        className="texto-leyenda text-texto-secundario"
      >
        Separa los párrafos con una línea en blanco. Los datos entre llaves,
        como {'{nombre}'}, se cambian por los de cada destinatario; en la vista
        previa ves los tuyos.
      </p>
    </Tarjeta>
  );
}

/**
 * «¿A quién le llega?» (P7a 2046:1755). La vista previa en vivo no cuenta destinatarios (decisión
 * del 6 nov, SCRUM-150): el número lo da el backend al revisar el envío, con el borrador guardado.
 */
export const TarjetaSegmento = ({
  id,
  control,
}: {
  id: string;
  control: Control<FormularioCampana>;
}) => (
  <Tarjeta>
    <Controller
      control={control}
      name="segmento"
      render={({ field, formState: { errors } }) => (
        <SelectorSegmento
          id={`${id}-segmento`}
          valor={field.value}
          alCambiar={field.onChange}
          errores={{
            tipos: errors.segmento?.tipos?.message ?? errors.segmento?.message,
            categorias: errors.segmento?.categorias?.message,
            marcas: errors.segmento?.marcas?.message,
          }}
        />
      )}
    />
    <p className="flex items-center gap-2 rounded-md bg-marca-acento-suave px-4 py-3 texto-pequeno text-marca-profundo">
      <UsersRound aria-hidden strokeWidth={1.75} className="size-5 shrink-0" />
      Al revisar el envío verás a cuántas direcciones con consentimiento les
      llega.
    </p>
  </Tarjeta>
);

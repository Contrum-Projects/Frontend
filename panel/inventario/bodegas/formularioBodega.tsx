'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { BodegaPanel } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Chip } from '@/compartido/ui/chip';
import { Input } from '@/compartido/ui/input';
import {
  AccionesPanelLateral,
  PanelLateral,
} from '@/panel/catalogo/panelLateral';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { ComunaBodega } from './comunaBodega';
import { repartirRechazo, useGuardarBodega } from './consultasBodegas';

/** Valores del backend: `src/common/dominio/valores.ts` › TIPOS_BODEGA (8 nov, SCRUM-151). */
export const TIPOS_BODEGA = [
  { valor: 'bodega', texto: 'Bodega' },
  { valor: 'tienda', texto: 'Tienda' },
] as const;

const esquema = z.object({
  nombre: z.string().trim().min(1, 'Escribe el nombre de la bodega.'),
  direccion: z.string().trim().min(1, 'Escribe la dirección.'),
  region: z.string().min(1, 'Elige la región.'),
  comuna: z.string().min(1, 'Elige la comuna.'),
  tipo: z.enum(['bodega', 'tienda']),
  abasteceVentaOnline: z.boolean(),
});

export type FormularioBodegaValores = z.infer<typeof esquema>;
type Formulario = FormularioBodegaValores;

const CAMPOS: Partial<Record<string, keyof Formulario>> = {
  nombre: 'nombre',
  direccion: 'direccion',
  comuna: 'comuna',
  tipo: 'tipo',
  abasteceVentaOnline: 'abasteceVentaOnline',
};

/**
 * «Nueva bodega» o «Editar bodega» (SCRUM-151; sin Figma, sigue «Nuevo proveedor»). La comuna sale
 * de la lista oficial, como en las direcciones.
 */
export function FormularioBodega({
  bodega,
  abierto,
  alCambiarAbierto,
}: {
  /** `null`: bodega nueva. */
  bodega: BodegaPanel | null;
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
}) {
  return (
    <PanelLateral
      titulo={bodega ? 'Editar bodega' : 'Nueva bodega'}
      abierto={abierto}
      alCambiarAbierto={alCambiarAbierto}
    >
      {/* Se monta al abrir: cada apertura parte de lo guardado */}
      {abierto && (
        <Campos bodega={bodega} alTerminar={() => alCambiarAbierto(false)} />
      )}
    </PanelLateral>
  );
}

function Campos({
  bodega,
  alTerminar,
}: {
  bodega: BodegaPanel | null;
  alTerminar: () => void;
}) {
  const guardar = useGuardarBodega();
  const [aviso, setAviso] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombre: bodega?.nombre ?? '',
      direccion: bodega?.direccion ?? '',
      region: bodega?.region.codigoCut ?? '',
      comuna: bodega?.comuna.codigoCut ?? '',
      tipo: bodega?.tipo ?? 'bodega',
      abasteceVentaOnline: bodega?.abasteceVentaOnline ?? true,
    },
  });

  const enviar = handleSubmit(async ({ region: _region, ...datos }) => {
    setAviso(null);
    try {
      const guardada = await guardar.mutateAsync({
        id: bodega?.id ?? null,
        datos,
      });
      toast.success(
        bodega ? 'Guardamos los cambios.' : `Creamos «${guardada.nombre}».`,
      );
      alTerminar();
    } catch (error) {
      repartirRechazo(
        error,
        CAMPOS,
        (campo, mensaje) =>
          setError(campo, { type: 'server', message: mensaje }),
        setAviso,
      );
    }
  });

  return (
    <form
      onSubmit={enviar}
      noValidate
      aria-label={bodega ? 'Editar bodega' : 'Nueva bodega'}
      className="flex flex-1 flex-col gap-4"
    >
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <CampoFormulario
        id="bodega-nombre"
        etiqueta="Nombre"
        obligatorio
        error={errors.nombre?.message}
      >
        {(props) => (
          <Input {...props} autoComplete="off" {...register('nombre')} />
        )}
      </CampoFormulario>
      <Controller
        control={control}
        name="tipo"
        render={({ field }) => (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 texto-etiqueta text-texto-principal">
              Tipo
            </legend>
            <div className="flex flex-wrap gap-2">
              {TIPOS_BODEGA.map(({ valor, texto }) => (
                <Chip
                  key={valor}
                  type="radio"
                  name="bodega-tipo"
                  checked={field.value === valor}
                  onChange={() => field.onChange(valor)}
                >
                  {texto}
                </Chip>
              ))}
            </div>
          </fieldset>
        )}
      />
      <CampoFormulario
        id="bodega-direccion"
        etiqueta="Dirección"
        obligatorio
        error={errors.direccion?.message}
      >
        {(props) => (
          <Input {...props} autoComplete="off" {...register('direccion')} />
        )}
      </CampoFormulario>
      <ComunaBodega
        control={control}
        setValue={setValue}
        errores={{
          region: errors.region?.message,
          comuna: errors.comuna?.message,
        }}
      />
      <Controller
        control={control}
        name="abasteceVentaOnline"
        render={({ field }) => (
          <div className="flex flex-col gap-1">
            <div>
              <Chip
                type="checkbox"
                checked={field.value}
                onChange={(evento) => field.onChange(evento.target.checked)}
              >
                Abastece la venta online
              </Chip>
            </div>
            <p className="texto-leyenda text-texto-secundario">
              Su stock cuenta como disponible en la tienda online.
            </p>
          </div>
        )}
      />
      <AccionesPanelLateral
        texto={bodega ? 'Guardar' : 'Crear bodega'}
        enviando={isSubmitting}
        alCancelar={alTerminar}
      />
    </form>
  );
}

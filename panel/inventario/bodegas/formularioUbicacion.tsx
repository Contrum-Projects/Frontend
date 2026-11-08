'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { UbicacionPanel } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Input } from '@/compartido/ui/input';
import {
  AccionesPanelLateral,
  PanelLateral,
} from '@/panel/catalogo/panelLateral';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { repartirRechazo, useGuardarUbicacion } from './consultasBodegas';

const PARTES = [
  { campo: 'zona', etiqueta: 'Zona' },
  { campo: 'pasillo', etiqueta: 'Pasillo' },
  { campo: 'estante', etiqueta: 'Estante' },
  { campo: 'nivel', etiqueta: 'Nivel' },
] as const;

const esquema = z.object({
  codigo: z.string().trim().min(1, 'Escribe el código de la ubicación.'),
  zona: z.string(),
  pasillo: z.string(),
  estante: z.string(),
  nivel: z.string(),
});

type Formulario = z.infer<typeof esquema>;

const CAMPOS: Partial<Record<string, keyof Formulario>> = {
  codigo: 'codigo',
  zona: 'zona',
  pasillo: 'pasillo',
  estante: 'estante',
  nivel: 'nivel',
};

/**
 * «Nueva ubicación» o «Editar ubicación» en una bodega (SCRUM-151). El código es único en la bodega
 * y se guarda en mayúsculas; lo revisa el backend.
 */
export function FormularioUbicacion({
  bodega,
  ubicacion,
  abierto,
  alCambiarAbierto,
}: {
  bodega: { id: number; nombre: string };
  /** `null`: ubicación nueva. */
  ubicacion: UbicacionPanel | null;
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
}) {
  return (
    <PanelLateral
      titulo={
        ubicacion
          ? `Editar ubicación ${ubicacion.codigo}`
          : `Nueva ubicación en ${bodega.nombre}`
      }
      abierto={abierto}
      alCambiarAbierto={alCambiarAbierto}
    >
      {abierto && (
        <Campos
          bodegaId={bodega.id}
          ubicacion={ubicacion}
          alTerminar={() => alCambiarAbierto(false)}
        />
      )}
    </PanelLateral>
  );
}

function Campos({
  bodegaId,
  ubicacion,
  alTerminar,
}: {
  bodegaId: number;
  ubicacion: UbicacionPanel | null;
  alTerminar: () => void;
}) {
  const guardar = useGuardarUbicacion();
  const [aviso, setAviso] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: {
      codigo: ubicacion?.codigo ?? '',
      zona: ubicacion?.zona ?? '',
      pasillo: ubicacion?.pasillo ?? '',
      estante: ubicacion?.estante ?? '',
      nivel: ubicacion?.nivel ?? '',
    },
  });

  const enviar = handleSubmit(async (valores) => {
    setAviso(null);
    const vacioANulo = (texto: string) => texto.trim() || null;
    try {
      await guardar.mutateAsync({
        bodegaId,
        ubicacionId: ubicacion?.id ?? null,
        datos: {
          codigo: valores.codigo.trim(),
          zona: vacioANulo(valores.zona),
          pasillo: vacioANulo(valores.pasillo),
          estante: vacioANulo(valores.estante),
          nivel: vacioANulo(valores.nivel),
        },
      });
      toast.success(
        ubicacion ? 'Guardamos la ubicación.' : 'Agregamos la ubicación.',
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
      aria-label={ubicacion ? 'Editar ubicación' : 'Nueva ubicación'}
      className="flex flex-1 flex-col gap-4"
    >
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <CampoFormulario
        id="ubicacion-codigo"
        etiqueta="Código"
        obligatorio
        error={errors.codigo?.message}
      >
        {(props) => (
          <Input
            {...props}
            autoComplete="off"
            placeholder="A-01"
            className="uppercase"
            {...register('codigo')}
          />
        )}
      </CampoFormulario>
      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        {PARTES.map(({ campo, etiqueta }) => (
          <CampoFormulario
            key={campo}
            id={`ubicacion-${campo}`}
            etiqueta={`${etiqueta} (opcional)`}
            error={errors[campo]?.message}
          >
            {(props) => (
              <Input {...props} autoComplete="off" {...register(campo)} />
            )}
          </CampoFormulario>
        ))}
      </div>
      <AccionesPanelLateral
        texto={ubicacion ? 'Guardar' : 'Agregar ubicación'}
        enviando={isSubmitting}
        alCancelar={alTerminar}
      />
    </form>
  );
}

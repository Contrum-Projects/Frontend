'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { MarcaPanel } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Input } from '@/compartido/ui/input';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { CLAVES_CATALOGO } from './consultasCatalogo';
import {
  esErrorDelNombreDeMarca,
  esquemaMarca,
  type FormularioMarca,
  type SalidaMarca,
} from './esquemaCatalogo';
import { AccionesPanelLateral, PanelLateral } from './panelLateral';

/**
 * Panel lateral «Nueva marca» (E3-H4 criterios 1 y 3). Figma no lo dibuja: sigue el de
 * «Nueva cuenta de personal». Las marcas no se editan: el backend no tiene la ruta.
 */
export function NuevaMarca({
  abierto,
  alCambiarAbierto,
}: {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
}) {
  return (
    <PanelLateral
      titulo="Nueva marca"
      abierto={abierto}
      alCambiarAbierto={alCambiarAbierto}
    >
      {/* Se monta al abrir: cada apertura parte vacía */}
      {abierto && (
        <FormularioNuevaMarca alTerminar={() => alCambiarAbierto(false)} />
      )}
    </PanelLateral>
  );
}

function FormularioNuevaMarca({ alTerminar }: { alTerminar: () => void }) {
  const clienteConsultas = useQueryClient();
  const [aviso, setAviso] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormularioMarca, unknown, SalidaMarca>({
    resolver: zodResolver(esquemaMarca),
    defaultValues: { nombre: '' },
  });

  const mostrarError = (fallo: ErrorDeApi) => {
    const delNombre = fallo.mensajes.filter(esErrorDelNombreDeMarca);
    if (
      (fallo.estado === 400 || fallo.estado === 409) &&
      delNombre.length > 0
    ) {
      setError('nombre', { type: 'server', message: delNombre.join(' ') });
      return;
    }
    setAviso(fallo.message);
  };

  const enviar = async (datos: SalidaMarca) => {
    setAviso(null);
    try {
      const marca = exigir<MarcaPanel>(
        await api.POST('/api/catalogo/marcas', { body: datos }),
      );
      await clienteConsultas.invalidateQueries({
        queryKey: CLAVES_CATALOGO.marcas,
      });
      toast.success(`Creamos la marca ${marca.nombre}.`);
      alTerminar();
    } catch (error) {
      // Sin conexión, fetch lanza TypeError: se muestra el mensaje genérico
      mostrarError(error instanceof ErrorDeApi ? error : errorDeApi(undefined));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-label="Nueva marca"
      className="flex flex-1 flex-col gap-4"
    >
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <CampoFormulario
        id="marca-nombre"
        etiqueta="Nombre"
        error={errors.nombre?.message}
      >
        {(propsControl) => (
          <Input {...propsControl} autoComplete="off" {...register('nombre')} />
        )}
      </CampoFormulario>
      <AccionesPanelLateral
        texto="Crear marca"
        enviando={isSubmitting}
        alCancelar={alTerminar}
      />
    </form>
  );
}

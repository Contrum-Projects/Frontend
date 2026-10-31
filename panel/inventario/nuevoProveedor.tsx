'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { api } from '@/compartido/api/cliente';
import { ErrorDeApi, errorDeApi, exigir } from '@/compartido/api/errores';
import type { Proveedor } from '@/compartido/api/respuestas';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Input } from '@/compartido/ui/input';
import {
  AccionesPanelLateral,
  PanelLateral,
} from '@/panel/catalogo/panelLateral';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { CLAVE_PROVEEDORES } from './consultasProveedores';
import {
  campoDelError,
  cuerpoProveedor,
  esquemaProveedor,
  PROVEEDOR_VACIO,
  type FormularioProveedor,
  type SalidaProveedor,
} from './esquemaProveedor';

/**
 * Panel lateral «Nuevo proveedor» (E11-H1 criterios 2 y 3). Figma no lo dibuja: sigue el de
 * «Nueva cuenta de personal».
 */
export function NuevoProveedor({
  abierto,
  alCambiarAbierto,
}: {
  abierto: boolean;
  alCambiarAbierto: (abierto: boolean) => void;
}) {
  return (
    <PanelLateral
      titulo="Nuevo proveedor"
      abierto={abierto}
      alCambiarAbierto={alCambiarAbierto}
    >
      {/* Se monta al abrir: cada apertura parte vacía */}
      {abierto && (
        <FormularioNuevoProveedor alTerminar={() => alCambiarAbierto(false)} />
      )}
    </PanelLateral>
  );
}

function FormularioNuevoProveedor({ alTerminar }: { alTerminar: () => void }) {
  const clienteConsultas = useQueryClient();
  const [aviso, setAviso] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormularioProveedor, unknown, SalidaProveedor>({
    resolver: zodResolver(esquemaProveedor),
    defaultValues: PROVEEDOR_VACIO,
  });

  const mostrarError = (fallo: ErrorDeApi) => {
    if (fallo.estado !== 400 && fallo.estado !== 409) {
      setAviso(fallo.message);
      return;
    }
    const generales: string[] = [];
    for (const mensaje of fallo.mensajes) {
      const campo = campoDelError(mensaje);
      if (campo) setError(campo, { type: 'server', message: mensaje });
      else generales.push(mensaje);
    }
    if (generales.length > 0) setAviso(generales.join(' '));
  };

  const enviar = async (datos: SalidaProveedor) => {
    setAviso(null);
    try {
      const proveedor = exigir<Proveedor>(
        await api.POST('/api/inventario/proveedores', {
          body: cuerpoProveedor(datos),
        }),
      );
      await clienteConsultas.invalidateQueries({
        queryKey: CLAVE_PROVEEDORES,
      });
      toast.success(`Registramos a ${proveedor.razonSocial}.`);
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
      aria-label="Nuevo proveedor"
      className="flex flex-1 flex-col gap-4"
    >
      {aviso && (
        <Alert variant="destructive">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <CampoFormulario
        id="proveedor-razon-social"
        etiqueta="Razón social"
        error={errors.razonSocial?.message}
      >
        {(propsControl) => (
          <Input
            {...propsControl}
            autoComplete="off"
            {...register('razonSocial')}
          />
        )}
      </CampoFormulario>
      <CampoFormulario
        id="proveedor-rut"
        etiqueta="RUT"
        error={errors.rut?.message}
      >
        {(propsControl) => (
          <Input
            {...propsControl}
            autoComplete="off"
            placeholder="76.086.428-5"
            {...register('rut')}
          />
        )}
      </CampoFormulario>
      <CampoFormulario
        id="proveedor-contacto"
        etiqueta="Nombre de contacto (opcional)"
        error={errors.nombreContacto?.message}
      >
        {(propsControl) => (
          <Input
            {...propsControl}
            autoComplete="off"
            {...register('nombreContacto')}
          />
        )}
      </CampoFormulario>
      <CampoFormulario
        id="proveedor-email"
        etiqueta="Correo (opcional)"
        error={errors.email?.message}
      >
        {(propsControl) => (
          <Input
            {...propsControl}
            type="email"
            autoComplete="off"
            {...register('email')}
          />
        )}
      </CampoFormulario>
      <CampoFormulario
        id="proveedor-telefono"
        etiqueta="Teléfono (opcional)"
        error={errors.telefono?.message}
      >
        {(propsControl) => (
          <Input
            {...propsControl}
            type="tel"
            autoComplete="off"
            {...register('telefono')}
          />
        )}
      </CampoFormulario>
      <AccionesPanelLateral
        texto="Guardar proveedor"
        enviando={isSubmitting}
        alCancelar={alTerminar}
      />
    </form>
  );
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import {
  useForm,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import type { PerfilProfesionalCuenta } from '@/compartido/api/respuestas';
import { ErrorDeApi, errorDeApi } from '@/compartido/api/errores';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Chip } from '@/compartido/ui/chip';
import { Input } from '@/compartido/ui/input';
import { Spinner } from '@/compartido/ui/spinner';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { useGuardarPerfilProfesional } from './consultasPerfil';
import {
  esquemaPerfil,
  perfilAFormulario,
  repartirErroresPerfil,
  type CampoPerfil,
  type FormularioPerfil,
  type SalidaPerfil,
} from './esquemaPerfil';
import { GRUPOS_ESPECIALIDADES, MODALIDADES } from './opcionesPerfil';

const CAMPOS: readonly CampoPerfil[] = [
  'anosExperiencia',
  'nombreLugarTrabajo',
  'redSocial',
  'modalidad',
  'especialidades',
];

/** Mediano en escritorio (Figma 2038:2796); en celular, grande y a todo el ancho (2038:5397). */
const CLASE_BOTON =
  'w-full max-md:h-14 max-md:px-7 max-md:texto-cuerpo-fuerte sm:w-auto';

/**
 * Formulario «Tu perfil profesional» (Figma 2038:2796 y celular 2038:5397, E10-H5). En
 * escritorio el botón va arriba a la derecha y en celular al final, a todo el ancho: es uno
 * solo, al final del formulario, y la grilla lo sube en escritorio.
 */
export function FormularioPerfil({
  perfil,
  alGuardar,
  alCancelar,
}: {
  /** El guardado, para editarlo; `null` si aún no lo completa. */
  perfil: PerfilProfesionalCuenta | null;
  alGuardar: () => void;
  /** Solo al editar uno guardado: vuelve a verlo sin cambios. */
  alCancelar?: () => void;
}) {
  const guardar = useGuardarPerfilProfesional();
  const [aviso, setAviso] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormularioPerfil, unknown, SalidaPerfil>({
    resolver: zodResolver(esquemaPerfil),
    defaultValues: perfilAFormulario(perfil),
  });

  const mostrarError = (fallo: ErrorDeApi) => {
    if (fallo.estado !== 400) {
      setAviso(fallo.message);
      return;
    }
    const { campos, generales } = repartirErroresPerfil(fallo);
    CAMPOS.filter((campo) => campos[campo]).forEach((campo, i) =>
      setError(
        campo,
        { type: 'server', message: campos[campo] },
        { shouldFocus: i === 0 },
      ),
    );
    if (generales.length > 0) setAviso(generales.join(' '));
  };

  const enviar = async (valores: SalidaPerfil) => {
    setAviso(null);
    try {
      await guardar.mutateAsync(valores);
      alGuardar();
    } catch (error) {
      mostrarError(error instanceof ErrorDeApi ? error : errorDeApi(undefined));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-labelledby="titulo-perfil"
      className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:p-6"
    >
      <div className="flex flex-col gap-0.5">
        <h2
          id="titulo-perfil"
          className="texto-cuerpo-fuerte text-texto-principal"
        >
          Tu perfil profesional
        </h2>
        <p className="texto-leyenda text-texto-secundario">
          Nos ayuda a mostrarte productos y ofertas para tu trabajo.
        </p>
      </div>
      {/* Solo visual: el lector de pantalla oye «obligatorio» en cada campo (aria-required) */}
      <p
        aria-hidden
        className="texto-leyenda text-texto-secundario md:col-span-2"
      >
        Los campos con <span className="text-destructive">*</span> son
        obligatorios.
      </p>
      {aviso && (
        <Alert variant="destructive" className="md:col-span-2">
          <AlertDescription>{aviso}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-2 md:col-span-2">
        <CampoFormulario
          id="perfil-anos"
          etiqueta="Años de experiencia"
          obligatorio
          error={errors.anosExperiencia?.message}
        >
          {(control) => (
            <Input
              {...control}
              {...register('anosExperiencia')}
              inputMode="numeric"
              autoComplete="off"
              maxLength={2}
            />
          )}
        </CampoFormulario>
        <CampoFormulario
          id="perfil-lugar"
          etiqueta="Lugar de trabajo (opcional)"
          error={errors.nombreLugarTrabajo?.message}
        >
          {(control) => (
            <Input
              {...control}
              {...register('nombreLugarTrabajo')}
              autoComplete="organization"
              maxLength={150}
            />
          )}
        </CampoFormulario>
      </div>
      <Modalidades register={register} errors={errors} />
      <Especialidades register={register} errors={errors} />
      <div className="grid gap-4 sm:grid-cols-2 md:col-span-2">
        <CampoFormulario
          id="perfil-red"
          etiqueta="Red social (opcional)"
          error={errors.redSocial?.message}
        >
          {(control) => (
            <Input
              {...control}
              aria-describedby={
                [control['aria-describedby'], 'perfil-red-ayuda']
                  .filter(Boolean)
                  .join(' ') || undefined
              }
              {...register('redSocial')}
              type="url"
              inputMode="url"
              autoComplete="url"
              maxLength={255}
            />
          )}
        </CampoFormulario>
        <p
          id="perfil-red-ayuda"
          className="texto-leyenda text-texto-secundario sm:col-span-2"
        >
          Enlace a tu perfil de Instagram, Facebook o TikTok.
        </p>
      </div>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end md:col-start-2 md:row-start-1">
        {alCancelar && (
          <Button
            type="button"
            variant="contorno"
            className={CLASE_BOTON}
            onClick={alCancelar}
          >
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className={CLASE_BOTON}>
          {isSubmitting && <Spinner />}
          Guardar perfil
        </Button>
      </div>
    </form>
  );
}

interface PropsGrupo {
  register: UseFormRegister<FormularioPerfil>;
  errors: FieldErrors<FormularioPerfil>;
}

/** El error va debajo de las opciones y el grupo lo anuncia como su descripción. */
const ErrorGrupo = ({ id, mensaje }: { id: string; mensaje?: string }) =>
  mensaje ? (
    <p id={id} className="texto-pequeno text-destructive">
      {mensaje}
    </p>
  ) : null;

/** «*» solo visual; `ayuda` la lee el lector de pantalla (un grupo de casillas no admite aria-required). */
const Leyenda = ({ children, ayuda }: { children: string; ayuda: string }) => (
  <legend className="mb-2 flex gap-0.5 texto-etiqueta text-texto-principal">
    {children}
    <span aria-hidden className="text-destructive">
      *
    </span>
    <span className="sr-only">{ayuda}</span>
  </legend>
);

const Modalidades = ({ register, errors }: PropsGrupo) => {
  const error = errors.modalidad?.message;
  return (
    <fieldset
      role="radiogroup"
      aria-required
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? 'perfil-modalidad-error' : undefined}
      className="flex min-w-0 flex-col gap-2 md:col-span-2"
    >
      <Leyenda ayuda="(obligatorio, elige una)">Modalidad de trabajo</Leyenda>
      <div className="flex flex-wrap gap-2">
        {MODALIDADES.map((opcion) => (
          <Chip
            key={opcion.valor}
            type="radio"
            value={opcion.valor}
            {...register('modalidad')}
          >
            {opcion.texto}
          </Chip>
        ))}
      </div>
      <ErrorGrupo id="perfil-modalidad-error" mensaje={error} />
    </fieldset>
  );
};

const Especialidades = ({ register, errors }: PropsGrupo) => {
  const error = errors.especialidades?.message;
  return (
    <fieldset
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? 'perfil-especialidades-error' : undefined}
      className="flex min-w-0 flex-col gap-2 md:col-span-2"
    >
      <Leyenda ayuda="(obligatorio, elige al menos una)">
        Especialidades
      </Leyenda>
      <div className="flex flex-col gap-4">
        {GRUPOS_ESPECIALIDADES.map((grupo) => (
          <div
            key={grupo.titulo}
            role="group"
            aria-label={grupo.titulo}
            className="flex flex-col gap-2"
          >
            <p aria-hidden className="texto-leyenda text-texto-secundario">
              {grupo.titulo}
            </p>
            <div className="flex flex-wrap gap-2">
              {grupo.opciones.map((opcion) => (
                <Chip
                  key={opcion.valor}
                  type="checkbox"
                  value={opcion.valor}
                  {...register('especialidades')}
                >
                  {opcion.texto}
                </Chip>
              ))}
            </div>
          </div>
        ))}
      </div>
      <ErrorGrupo id="perfil-especialidades-error" mensaje={error} />
    </fieldset>
  );
};

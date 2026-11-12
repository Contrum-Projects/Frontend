'use client';

import {
  type Control,
  Controller,
  type FieldErrors,
  type UseFormRegister,
  useWatch,
} from 'react-hook-form';
import { Chip } from '@/compartido/ui/chip';
import { Input } from '@/compartido/ui/input';
import { NativeSelect } from '@/compartido/ui/native-select';
import { Switch } from '@/compartido/ui/switch';
import { useCampanas } from '@/panel/campanas/consultasCampanas';
import { CampoFormulario } from '@/tienda/cuenta/campoFormulario';
import { SelectorFecha } from '@/tienda/cuenta/selectorFecha';
import { CampoEntero, Tarjeta } from './camposCupon';
import type { FormularioCupon } from './esquemaCupon';

export interface PropsTarjeta {
  id: string;
  control: Control<FormularioCupon>;
  register: UseFormRegister<FormularioCupon>;
  errors: FieldErrors<FormularioCupon>;
}

const entero = (
  { id, control, errors }: PropsTarjeta,
  campo:
    | 'valor'
    | 'topeDescuento'
    | 'compraMinima'
    | 'usosMaximos'
    | 'usosPorCuenta',
  etiqueta: string,
  extra: { prefijo?: string; sufijo?: string; ayuda?: string } = {},
) => (
  <Controller
    control={control}
    name={campo}
    render={({ field }) => (
      <CampoEntero
        id={`${id}-${campo}`}
        etiqueta={etiqueta}
        valor={field.value}
        alCambiar={field.onChange}
        error={errors[campo]?.message}
        {...extra}
      />
    )}
  />
);

/** Código, lo que verá el cliente y cuánto descuenta. */
export const TarjetaDescuento = (props: PropsTarjeta) => {
  const { id, control, register, errors } = props;
  const tipo = useWatch({ control, name: 'tipoDescuento' });
  return (
    <Tarjeta titulo="Descuento">
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoFormulario
          id={`${id}-codigo`}
          etiqueta="Código"
          error={errors.codigo?.message}
          obligatorio
        >
          {(control) => (
            <Input
              {...control}
              {...register('codigo')}
              autoComplete="off"
              placeholder="LOREAL20"
              className="uppercase"
            />
          )}
        </CampoFormulario>
        <CampoFormulario
          id={`${id}-descripcion`}
          etiqueta="Descripción para el cliente"
          error={errors.descripcion?.message}
        >
          {(control) => (
            <Input
              {...control}
              {...register('descripcion')}
              autoComplete="off"
              placeholder="20 % en productos de la marca"
            />
          )}
        </CampoFormulario>
      </div>
      <Controller
        control={control}
        name="tipoDescuento"
        render={({ field }) => (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 texto-etiqueta text-texto-principal">
              Tipo de descuento
            </legend>
            <div className="flex flex-wrap gap-2">
              <Chip
                type="radio"
                name={`${id}-tipo`}
                checked={field.value === 'porcentaje'}
                onChange={() => field.onChange('porcentaje')}
              >
                Porcentaje
              </Chip>
              <Chip
                type="radio"
                name={`${id}-tipo`}
                checked={field.value === 'monto_fijo'}
                onChange={() => field.onChange('monto_fijo')}
              >
                Monto fijo
              </Chip>
            </div>
          </fieldset>
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {tipo === 'porcentaje'
          ? entero(props, 'valor', 'Porcentaje de descuento', { sufijo: '%' })
          : entero(props, 'valor', 'Monto del descuento', {
              prefijo: '$',
              ayuda: 'Con IVA. Nunca descuenta más que lo que cubre.',
            })}
        {tipo === 'porcentaje' &&
          entero(props, 'topeDescuento', 'Tope del descuento (opcional)', {
            prefijo: '$',
          })}
      </div>
    </Tarjeta>
  );
};

/** Vigencia, usos, compra mínima, precio profesional y si está activo. */
export const TarjetaReglas = (props: PropsTarjeta) => {
  const { id, control, errors } = props;
  const anio = new Date().getFullYear();
  return (
    <Tarjeta titulo="Reglas">
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoFormulario
          id={`${id}-inicio`}
          etiqueta="Desde (opcional)"
          error={errors.fechaInicio?.message}
        >
          {(propsControl) => (
            <Controller
              control={control}
              name="fechaInicio"
              render={({ field }) => (
                <SelectorFecha
                  ref={field.ref}
                  valor={field.value}
                  alCambiar={field.onChange}
                  desde={new Date(anio - 1, 0)}
                  hasta={new Date(anio + 5, 11, 31)}
                  mesInicial={new Date()}
                  conHora
                  control={propsControl}
                />
              )}
            />
          )}
        </CampoFormulario>
        <CampoFormulario
          id={`${id}-fin`}
          etiqueta="Hasta (opcional)"
          error={errors.fechaFin?.message}
        >
          {(propsControl) => (
            <Controller
              control={control}
              name="fechaFin"
              render={({ field }) => (
                <SelectorFecha
                  ref={field.ref}
                  valor={field.value}
                  alCambiar={field.onChange}
                  desde={new Date(anio - 1, 0)}
                  hasta={new Date(anio + 5, 11, 31)}
                  mesInicial={new Date()}
                  conHora
                  horaInicial="23:59"
                  control={propsControl}
                />
              )}
            />
          )}
        </CampoFormulario>
        {entero(props, 'usosMaximos', 'Usos en total (opcional)')}
        {entero(props, 'usosPorCuenta', 'Usos por cuenta (opcional)')}
        {entero(props, 'compraMinima', 'Compra mínima (opcional)', {
          prefijo: '$',
          ayuda: 'Subtotal de productos con IVA, sin el despacho.',
        })}
      </div>
      <Controller
        control={control}
        name="incluyeProfesionales"
        render={({ field }) => (
          <div>
            <Chip
              type="checkbox"
              checked={field.value}
              onChange={(evento) => field.onChange(evento.target.checked)}
            >
              También al precio profesional
            </Chip>
          </div>
        )}
      />
      <Controller
        control={control}
        name="activo"
        render={({ field }) => (
          <div className="flex items-center gap-3">
            <Switch
              id={`${id}-activo`}
              checked={field.value}
              onCheckedChange={field.onChange}
            />
            <label
              htmlFor={`${id}-activo`}
              className="texto-pequeno text-texto-principal"
            >
              Activo: se puede usar
            </label>
          </div>
        )}
      />
      <p className="texto-leyenda text-texto-secundario">
        Un cupón por pedido. Un uso cuenta desde que se crea el pedido y se
        libera si se cancela.
      </p>
    </Tarjeta>
  );
};

/**
 * Quién lo puede usar: cualquier cuenta con el código, o solo las que recibieron una campaña
 * (decisión del 7 nov, SCRUM-150). Las campañas salen del backend.
 */
export const TarjetaCampana = ({ id, control, errors }: PropsTarjeta) => {
  const campanas = useCampanas();
  const opciones = campanas.data?.items ?? [];
  return (
    <Tarjeta titulo="¿Quién lo puede usar?">
      <Controller
        control={control}
        name="campanaId"
        render={({ field }) => (
          <CampoFormulario
            id={`${id}-campana`}
            etiqueta="Campaña"
            error={errors.campanaId?.message}
          >
            {(controlCampo) => (
              <NativeSelect
                {...controlCampo}
                value={field.value === null ? '' : String(field.value)}
                onChange={(evento) =>
                  field.onChange(
                    evento.target.value === ''
                      ? null
                      : Number(evento.target.value),
                  )
                }
                disabled={campanas.isPending}
              >
                <option value="">Cualquier cuenta que tenga el código</option>
                {opciones.map((campana) => (
                  <option key={campana.id} value={campana.id}>
                    Solo quienes recibieron «{campana.asunto}»
                    {campana.enviada ? '' : ' (borrador)'}
                  </option>
                ))}
              </NativeSelect>
            )}
          </CampoFormulario>
        )}
      />
      <p className="texto-leyenda text-texto-secundario">
        Con una campaña, el cupón solo sirve a las cuentas a las que se les
        envió el correo. Escribe el código en el mensaje de la campaña para que
        lo reciban.
      </p>
    </Tarjeta>
  );
};

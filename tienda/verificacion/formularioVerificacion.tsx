'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { ErrorDeApi, errorDeApi } from '@/compartido/api/errores';
import { Alert, AlertDescription } from '@/compartido/ui/alert';
import { Button } from '@/compartido/ui/button';
import { Spinner } from '@/compartido/ui/spinner';
import { useAdjuntarDocumentos } from './consultasVerificacion';
import {
  esquemaVerificacion,
  MAXIMO_DOCUMENTOS,
  problemaDeArchivo,
  type SalidaVerificacion,
  type ValoresVerificacion,
} from './esquemaVerificacion';
import { FilaDocumento } from './filaDocumento';
import { TarjetaRut } from './tarjetaRut';
import { ZonaDocumentos } from './zonaDocumentos';

/**
 * Paso 2 de la verificación (Figma 2020:1666, E10-H2): la solicitud quedó `pendiente` porque el
 * SII no la aprobó, y se suben los documentos para que el personal la revise. El RUT ya no se
 * cambia (la solicitud está abierta). Los documentos quedan en el formulario aunque el backend
 * rechace el envío.
 */
export function FormularioVerificacion({
  rut,
  enfocar = false,
}: {
  /** El RUT de la cuenta (12345678-K). */
  rut: string | null;
  /** Recién pasó del SII a pedir documentos: el foco va a su inicio (no queda en `body`). */
  enfocar?: boolean;
}) {
  const envio = useAdjuntarDocumentos();
  const [avisoArchivos, setAvisoArchivos] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const zona = useRef<HTMLInputElement>(null);
  const inicio = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (enfocar) inicio.current?.focus();
  }, [enfocar]);

  const {
    control,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<ValoresVerificacion, unknown, SalidaVerificacion>({
    resolver: zodResolver(esquemaVerificacion),
    defaultValues: { documentos: [] },
    shouldFocusError: false,
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'documentos',
  });
  // `fields` guarda lo que había al agregar: el tipo elegido se lee del formulario
  const elegidos = useWatch({ control, name: 'documentos' });

  const agregar = (archivos: File[]) => {
    const problemas: string[] = [];
    const validos: File[] = [];
    for (const archivo of archivos) {
      const problema = problemaDeArchivo(archivo);
      if (problema) problemas.push(problema);
      else validos.push(archivo);
    }
    const espacio = MAXIMO_DOCUMENTOS - fields.length;
    if (validos.length > espacio) {
      problemas.push(`Puedes subir hasta ${MAXIMO_DOCUMENTOS} documentos.`);
    }
    const agregados = validos.slice(0, Math.max(0, espacio));
    if (agregados.length > 0) {
      append(agregados.map((archivo) => ({ archivo, tipo: '' as const })));
      clearErrors('documentos');
    }
    setAvisoArchivos(problemas.length > 0 ? problemas.join(' ') : null);
  };

  const mostrarError = (fallo: ErrorDeApi) => {
    // 400 y 413: un archivo que el backend no acepta, junto a los documentos
    if (fallo.estado === 400 || fallo.estado === 413) {
      setAvisoArchivos(fallo.mensajes.join(' '));
      return;
    }
    setAviso(fallo.message);
  };

  const enviar = (datos: SalidaVerificacion) => {
    setAviso(null);
    envio.mutate(datos.documentos, {
      onError: (error) =>
        mostrarError(
          error instanceof ErrorDeApi ? error : errorDeApi(undefined),
        ),
    });
  };

  const errorDocumentos =
    avisoArchivos ??
    errors.documentos?.message ??
    errors.documentos?.root?.message;

  return (
    <form
      onSubmit={(evento) =>
        void handleSubmit(enviar, (fallas) => {
          // Sin documentos, el foco va a la zona de subida; sin tipo, al primer selector que falta
          if (fallas.documentos?.message || fallas.documentos?.root) {
            zona.current?.focus();
            return;
          }
          const sinTipo = fallas.documentos?.findIndex?.(
            (falla) => falla?.tipo !== undefined,
          );
          if (sinTipo !== undefined && sinTipo >= 0) {
            document.getElementById(`documento-${sinTipo}-tipo`)?.focus();
          }
        })(evento)
      }
      noValidate
      aria-label="Solicitud de verificación"
      className="flex flex-col gap-6"
    >
      <p
        ref={inicio}
        tabIndex={-1}
        className="texto-cuerpo text-texto-secundario outline-none"
      >
        Sube un certificado, título o curso que acredite que trabajas en
        peluquería. Con tu cuenta verificada compras a precio profesional.
      </p>
      <Alert variant="info">
        <Info aria-hidden />
        <AlertDescription className="texto-pequeno text-marca-profundo">
          No pudimos verificarte con el SII. Sube tus documentos y el equipo de
          la tienda revisará tu solicitud.
        </AlertDescription>
      </Alert>
      <TarjetaRut rut={rut} editable={false} />
      <ZonaDocumentos ref={zona} alElegir={agregar} error={errorDocumentos} />
      {fields.length > 0 && (
        <ul aria-label="Documentos elegidos" className="flex flex-col gap-2">
          {fields.map((campo, indice) => (
            <FilaDocumento
              key={campo.id}
              indice={indice}
              archivo={campo.archivo}
              tipo={elegidos[indice]?.tipo ?? ''}
              error={errors.documentos?.[indice]?.tipo?.message}
              alCambiarTipo={(tipo) =>
                setValue(`documentos.${indice}.tipo`, tipo, {
                  shouldValidate: errors.documentos?.[indice] !== undefined,
                })
              }
              alQuitar={() => {
                remove(indice);
                setAvisoArchivos(null);
              }}
            />
          ))}
        </ul>
      )}
      <p className="texto-leyenda text-texto-secundario">
        Puedes subir más de un documento. Borramos los archivos 30 días después
        de resolver tu solicitud.
      </p>
      {aviso && (
        <p role="alert" className="texto-pequeno text-destructive">
          {aviso}
        </p>
      )}
      <Button
        type="submit"
        size="grande"
        disabled={envio.isPending}
        className="w-full sm:w-auto sm:self-start"
      >
        {envio.isPending && <Spinner aria-hidden />}
        {envio.isPending ? 'Enviando…' : 'Enviar documentos'}
      </Button>
    </form>
  );
}

/**
 * Proxy de /api/* hacia el backend (API_URL).
 *
 * Por qué existe: la cookie de refresco del backend es httpOnly, `SameSite=Strict` y solo viaja
 * a /api/cuentas/sesion. Si el navegador llamara al backend en otro dominio (p. ej. la tienda
 * en Vercel y la API en Railway), la cookie no viajaría y la sesión no se podría renovar.
 * Pasando por aquí, para el navegador todo es el mismo origen y no hace falta CORS.
 *
 * La IP del cliente sigue en X-Forwarded-For (Next la completa si no viene de otro proxy),
 * para que los límites de RNF-09 cuenten por persona y no por servidor. Ajusta
 * PROXIES_CONFIABLES en el backend según docs/arquitectura.md.
 */
import { responderSimulado } from '@/compartido/api/simulado';
import { entornoServidor } from '@/compartido/config/entorno-servidor';
import { codigoValido } from '@/compartido/errores/datosDelError';

/** Cabeceras propias de cada conexión: no se reenvían. */
const CABECERAS_DE_CONEXION = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
]);

/** fetch ya descomprime el cuerpo: estas cabeceras de la respuesta original no aplican. */
const CABECERAS_DE_RESPUESTA_OMITIDAS = new Set([
  ...CABECERAS_DE_CONEXION,
  'content-encoding',
  'set-cookie',
]);

/**
 * Código de seguimiento de la petición (SCRUM-168): el backend lo usa en su log y en
 * `registro_error`, y lo devuelve en los 5xx para que la persona lo informe.
 */
const CABECERA_SEGUIMIENTO = 'x-request-id';

function errorDeConexion(codigoSeguimiento: string) {
  return Response.json(
    {
      statusCode: 502,
      message:
        'No pudimos conectarnos con el servidor. Intenta de nuevo en unos minutos.',
      codigoSeguimiento,
    },
    { status: 502, headers: { [CABECERA_SEGUIMIENTO]: codigoSeguimiento } },
  );
}

async function reenviar(
  peticion: Request,
  { params }: RouteContext<'/api/[...ruta]'>,
): Promise<Response> {
  const { ruta } = await params;
  if (ruta.some((segmento) => segmento === '.' || segmento === '..')) {
    return Response.json(
      { statusCode: 400, message: 'Ruta inválida.' },
      { status: 400 },
    );
  }

  // Solo en desarrollo con API_SIMULADA=1: endpoints que el backend aún no tiene.
  const simulada = await responderSimulado(
    peticion,
    new URL(peticion.url).pathname.replace(/^\/api/, ''),
  );
  if (simulada) return simulada;

  const origen = new URL(peticion.url);
  const destino = new URL(
    `/api/${ruta.map(encodeURIComponent).join('/')}${origen.search}`,
    entornoServidor().API_URL,
  );

  const cabeceras = new Headers();
  peticion.headers.forEach((valor, nombre) => {
    if (!CABECERAS_DE_CONEXION.has(nombre)) cabeceras.set(nombre, valor);
  });
  cabeceras.set('x-forwarded-host', origen.host);
  cabeceras.set('x-forwarded-proto', origen.protocol.replace(':', ''));
  const codigoSeguimiento =
    codigoValido(peticion.headers.get(CABECERA_SEGUIMIENTO)) ??
    crypto.randomUUID();
  cabeceras.set(CABECERA_SEGUIMIENTO, codigoSeguimiento);

  const tieneCuerpo = !['GET', 'HEAD'].includes(peticion.method);

  let respuesta: Response;
  try {
    respuesta = await fetch(destino, {
      method: peticion.method,
      headers: cabeceras,
      body: tieneCuerpo ? peticion.body : undefined,
      // Necesario para reenviar el cuerpo como stream (subida de imágenes y documentos)
      ...(tieneCuerpo ? { duplex: 'half' } : {}),
      redirect: 'manual',
      cache: 'no-store',
      signal: peticion.signal,
    } as RequestInit);
  } catch (error) {
    // La persona cerró la página o canceló: no es un error del sistema
    if (peticion.signal.aborted) return errorDeConexion(codigoSeguimiento);
    // Sin backend no hay dónde guardarlo en registro_error: queda en el log del servidor de Next
    console.error(
      JSON.stringify({
        nivel: 'error',
        registro: 'servidor_web',
        codigoSeguimiento,
        componente: 'proxy app/api/[...ruta]',
        metodo: peticion.method,
        ruta: origen.pathname,
        tipoError: error instanceof Error ? error.name : typeof error,
        mensaje: 'El backend no respondió.',
      }),
    );
    return errorDeConexion(codigoSeguimiento);
  }

  const salida = new Headers();
  respuesta.headers.forEach((valor, nombre) => {
    if (!CABECERAS_DE_RESPUESTA_OMITIDAS.has(nombre)) salida.set(nombre, valor);
  });
  for (const cookie of respuesta.headers.getSetCookie()) {
    salida.append('set-cookie', cookie);
  }

  return new Response(respuesta.body, {
    status: respuesta.status,
    statusText: respuesta.statusText,
    headers: salida,
  });
}

export {
  reenviar as GET,
  reenviar as POST,
  reenviar as PUT,
  reenviar as PATCH,
  reenviar as DELETE,
};

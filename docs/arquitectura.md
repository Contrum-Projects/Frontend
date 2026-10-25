# Arquitectura del frontend

Una sola aplicación Next.js con la tienda y el panel (DAS, sección 4.3.4: paquetes
`frontend/tienda`, `frontend/panel` y `frontend/compartido`). No accede a la base de datos ni a
servicios externos: todo pasa por la API REST del backend, que calcula precios y autoriza cada
acción.

```
Navegador ──/api/...──▶ Next.js (app/api/[...ruta]) ──▶ Backend NestJS :3000 /api/...
    ▲                         │
    └──── HTML de la tienda ◀─┴── Server Components ──(datos públicos)──▶ Backend
```

## Por qué el proxy `/api`

El backend entrega el token de acceso en el cuerpo y deja el de refresco en una cookie
`httpOnly; SameSite=Strict; Path=/api/cuentas/sesion`. Si el navegador hablara directo con el
backend en otro dominio (tienda en Vercel, API en Railway o Render), esa cookie no viajaría y la
sesión no se podría renovar. Con el proxy, para el navegador todo es el mismo origen: no hace falta
CORS y la cookie funciona igual en desarrollo y en producción.

`app/api/[...ruta]/route.ts` reenvía método, ruta, consulta, cabeceras (incluidas `Cookie`,
`Authorization` y `X-Forwarded-For`) y cuerpo, y devuelve las `Set-Cookie` del backend. Si el
backend no responde, contesta 502 con un mensaje para la persona.

### IP del cliente y `PROXIES_CONFIABLES` (RNF-09)

Los límites de intentos del backend cuentan por IP. Next pone la IP del cliente en
`X-Forwarded-For` (o conserva la que puso el proxy de delante) y el proxy la reenvía. En el backend,
`PROXIES_CONFIABLES` debe contar los saltos entre el backend y el cliente que no son el cliente:

| Despliegue                                                        | Cadena                                           | `PROXIES_CONFIABLES` |
| ----------------------------------------------------------------- | ------------------------------------------------ | -------------------- |
| Desarrollo (`pnpm dev` + `pnpm start:dev`)                        | navegador → Next → backend                       | 1                    |
| Next y backend en la misma red, sin proxy delante del backend     | … → Next → backend                               | 1                    |
| Vercel + backend detrás del proxy de su hosting (Railway, Render) | navegador → Vercel → proxy del hosting → backend | 2                    |
| Nginx o Cloudflare delante de Next y backend directo              | navegador → Nginx → Next → backend               | 1                    |

Con un valor menor, todos los visitantes comparten la IP del servidor de Next y el límite bloquea a
todos a la vez; con uno mayor, un cliente podría falsificar su IP. Confírmalo al elegir el hosting.

## Sesión

- `compartido/sesion/almacen.ts` guarda el token de acceso **en memoria** y el usuario
  (`codigoPublico`, nombre, apellido, rol). Al cargar la app, `IniciadorDeSesion` intenta renovar
  con la cookie; mientras tanto el estado es `desconocida`.
- Cada token de refresco sirve una vez y, si falla, el backend borra la cookie. Por eso la
  renovación es única por pestaña (una promesa compartida) y entre pestañas (Web Locks).
- `compartido/api/cliente.ts` agrega `Authorization: Bearer …` a cada llamada, renueva antes de que
  el token venza y, ante un 401, renueva una vez y repite la petición (RNF-28: cierre de sesión,
  desactivación o cambio de rol se aplican de inmediato).
- El servidor de Next no conoce la sesión (la cookie solo viaja a `/api/cuentas/sesion`). Lo que
  depende de la cuenta (cuenta, carrito, precio profesional, panel) se pide desde el navegador.
  Proteger una ruta del panel en el frontend es solo para no mostrar pantallas vacías: el backend
  responde 401/403 igual.

## Datos

| Dónde            | Con qué                                                         | Para qué                                                                 |
| ---------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Server Component | `apiServidor()` dentro de `<Suspense>`                          | Catálogo, categorías, marcas, ficha: HTML para buscadores y carga rápida |
| Client Component | `api` + TanStack Query (`useQuery`, `useMutation`) + `exigir()` | Cuenta, carrito, checkout, precio profesional, todo el panel             |

- **Cache Components** está activo: una lectura sin `<Suspense>` hace que `next build` intente
  llamar al backend al compilar (y falle en la CI). Usa `await connection()` o `<Suspense>`.
- No uses `'use cache'` para precios, stock ni datos de cuentas (RNF-30). Si una lista pública
  necesita caché, se decide en su historia y con `cacheLife` explícito.
- Precio profesional (SCRUM-109): el HTML del servidor trae el precio minorista; para un
  profesional, el precio se pide desde el navegador con su token. Mientras la sesión está
  `desconocida`, el precio se muestra como esqueleto para no mostrar uno y cambiarlo.

## Tipos de la API

`pnpm api:tipos` lee `/api/docs-json` del backend y escribe `compartido/api/esquema.d.ts` (se
versiona, para que la CI compile sin backend). Tipa rutas, parámetros y cuerpos de entrada.

Hoy ningún endpoint declara su **respuesta** en Swagger, así que `data` queda sin tipo. Mientras
el backend no agregue `@ApiOkResponse({ type: … })`, el tipo va en `compartido/api/respuestas.ts`
copiado del backend y se usa con `exigir<Tipo>(…)`.

## Errores

El backend responde `{ statusCode, message, error }`, con `message` como texto o lista (validación
de DTOs, ya en español). `exigir()` lo convierte en `ErrorDeApi { estado, mensajes,
esperarSegundos }`. Los 5xx se muestran con un mensaje genérico.

Los mensajes de validación no dicen a qué campo pertenecen. Para mostrar un error junto a su campo
(SCRUM-93 c2), valida primero en el formulario con zod, y para los conflictos del servidor (correo o
RUT ya registrados) acuerden con el backend cómo indicar el campo.

## Despliegue

- **Vercel** (lo que propone la Guía de Fase 1): variables `API_URL` (URL pública del backend) y,
  si se usan imágenes del catálogo, `URL_IMAGENES` y `NEXT_PUBLIC_URL_SITIO`.
- **Docker** (`Dockerfile`): imagen `standalone` en el puerto 3001. `URL_IMAGENES` y
  `NEXT_PUBLIC_URL_SITIO` se fijan al compilar (`--build-arg`); `API_URL` al ejecutar.
- En el backend, `URL_TIENDA` debe ser la URL pública de la tienda (enlaces de los correos).

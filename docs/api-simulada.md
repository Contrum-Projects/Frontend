# API simulada

El frontend avanza en paralelo con el backend. Cuando una pantalla necesita un endpoint que aún
no está en `compartido/api/esquema.d.ts`, se trabaja con una **ruta simulada**: el proxy `/api` y
`apiServidor()` la responden con datos de prueba y todo lo demás sigue yendo al backend real.

## Activarla

En `.env.local`:

```bash
API_SIMULADA=1
```

Reinicia `pnpm dev`. Solo funciona en desarrollo: en producción la variable se ignora. Las
respuestas simuladas traen la cabecera `x-api-simulada: SCRUM-<n>` (visible en la pestaña Red del
navegador), así sabes qué viene del backend y qué no.

## Agregar una ruta

1. **Acuerda la forma con quien hace la historia backend** (ruta, cuerpo, respuesta y errores) y
   anótala en `docs/historias/SCRUM-<n>.md`, sección «API». Si el backend ya tiene el DTO en su
   repositorio, cópialo de ahí.
2. Escribe el tipo de la respuesta en `compartido/api/respuestas.ts` (citando la historia
   backend), igual que con los endpoints que el Swagger no documenta.
3. Crea las rutas en un archivo por área y regístralas en `compartido/api/simulado/rutas.ts`:

```ts
// compartido/api/simulado/tienda.ts
import type { FichaProducto } from '@/compartido/api/respuestas';
import { errorSimulado, json, type RutaSimulada } from './index';

const ficha: FichaProducto = {
  codigo: 'CP-0001',
  nombre: 'Shampoo reparador',
  // …valores fijos con la forma acordada
};

export const rutasTienda: RutaSimulada[] = [
  {
    metodo: 'GET',
    ruta: '/tienda/productos/:codigo',
    historia: 'SCRUM-108',
    responder: ({ params }) =>
      params.codigo === ficha.codigo
        ? json(ficha)
        : errorSimulado(404, 'El producto no existe.'),
  },
];
```

```ts
// compartido/api/simulado/rutas.ts
import { rutasTienda } from './tienda';
export const rutasSimuladas: readonly RutaSimulada[] = [...rutasTienda];
```

4. En el código de la pantalla llama a la API como siempre (`api.GET(...)` en el navegador,
   `apiServidor()` en el servidor). Si la ruta no está en `esquema.d.ts`, openapi-fetch no la
   conoce: usa el tipo de `respuestas.ts` y deja un `// TODO(SCRUM-<n>)` donde haga falta un
   cast, para quitarlo cuando el endpoint exista.

## Reglas

- **Datos fijos, no lógica.** Las rutas simuladas devuelven valores fijos: no calculan precios,
  IVA, totales, stock ni permisos (eso lo decide el backend, RNF-03 y RNF-04). Si una pantalla
  necesita varios casos (agotado, vacío, error), usa códigos distintos (`CP-AGOTADO`, `CP-0001`)
  o un parámetro de la consulta.
- **Las pruebas no usan la API simulada.** Siguen simulando `fetch` en el borde, como dice
  CLAUDE.md. La API simulada es para ver y probar la pantalla en el navegador.
- **Borrar al llegar el endpoint.** Cuando `pnpm api:tipos` trae el endpoint, borra la ruta
  simulada, quita el tipo de `respuestas.ts` si el Swagger ya lo declara y prueba la pantalla con
  el backend real. Si la ruta sigue registrada, tapa al backend mientras `API_SIMULADA=1`.
- Una historia con ruta simulada puede llegar a «En revisión», pero el PR dice qué endpoints
  están simulados; no se da por **Hecha** hasta probarla con el backend real.

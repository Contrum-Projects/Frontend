# SCRUM-104 · E3-H5 · Precios minorista y mayorista en el panel

**Orden:** 13 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-30 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-101](SCRUM-101.md)  
**La necesitan después:** [SCRUM-105](SCRUM-105.md)

Como Personal de tienda, necesito configurar los precios de cada artículo desde el panel, con la finalidad de vender a cada tipo de cliente al precio correcto.

**Historia backend:** SCRUM-30 · **Figma:** P3 Producto nuevo (precios netos), P3c Pack nuevo

## Criterios de aceptación

1. **Precios netos.** El personal ingresa precios netos. Cuando escribe el valor. La pantalla muestra al lado el valor con IVA.
2. **Exclusivo para profesionales.** El producto o pack es exclusivo. Cuando el personal lo marca. La pantalla pide solo el precio mayorista.
3. **Cambio de precio.** El artículo tiene precio vigente. Cuando el personal ingresa uno nuevo con su motivo. La pantalla muestra el historial de cambios.

## Pantalla y ruta

| Pantalla                    | Escritorio | Celular  | Ruta                                              |
| --------------------------- | ---------- | -------- | ------------------------------------------------- |
| P3 Producto nuevo / edición | 2029:658   | 2024:443 | `/panel/productos/nuevo`, `/panel/productos/[id]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. `/api/catalogo/articulos/{id}/precios`.

**28-10-2026:** `GET` y `PUT /api/catalogo/articulos/{id}/precios` existen (id del formato),
con el permiso `precios.gestionar` (solo administrador). El Swagger no declara la respuesta:
el tipo `PreciosArticulo` está en `compartido/api/respuestas.ts`, copiado de
`src/modulos/catalogo/precios.service.ts`.

**Pedido a SCRUM-30** (forma propuesta por el frontend, falta confirmarla con el backend): la
misma respuesta con tres campos más.

```ts
porcentajeIva: number; // IVA_PORCENTAJE vigente, p. ej. 19
precioMinoristaConIva: number | null; // pesos enteros, como en la tienda
precioMayoristaConIva: number | null;
```

Con `API_SIMULADA=1`, las rutas simuladas de `compartido/api/simulado/panelCatalogo.ts` piden
los precios al backend real y agregan `porcentajeIva: 19` y los precios con IVA en `null`, porque
la simulación no calcula. Sin esos campos la pantalla muestra solo los netos.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

**28-10-2026** (SCRUM-104)

- **IVA** (decisión del usuario): el precio con IVA lo entrega el backend (ver «API»). Mientras
  se escribe, «con IVA $X» al lado del campo es una referencia con el `porcentajeIva` del backend
  (`vistaPreviaConIva` en `esquemaPrecios.ts`), redondeada a pesos. Sin la tasa no se muestra.
- **Precios en la tabla** (decisión del usuario): un `GET` por formato con `useQueries`, porque
  `FormatoPanel` no los trae. Columnas «Minorista neto» y «Mayorista neto» como Figma, con el
  valor con IVA abajo cuando el backend lo entrega. En celular, «Precio minorista neto» y
  «Precio mayorista neto» en la tarjeta. Sin precio: «Sin precio»; exclusivo: «Exclusivo».
- **Panel lateral «Precios de …»** (decisión del usuario; Figma no lo dibuja): ícono en la
  tabla y «Gestionar precios» en la tarjeta. Parte de los precios vigentes y envía solo los que
  cambian, con el motivo obligatorio (500 caracteres). Si nada cambió, avisa y no envía. Tras
  guardar sigue abierto con los precios nuevos, el motivo vacío y el historial al día (criterio
  3: tipo, neto, desde cuándo, quién y motivo; «Vigente» en el que rige).
- **Exclusivo** (criterio 2): el panel muestra solo el mayorista y lo explica. Al guardar el
  producto se vuelven a pedir los precios de sus formatos, así que marcarlo como exclusivo quita
  el minorista al instante.
- **Sin el permiso** (decisión del usuario): el vendedor no ve las columnas ni la acción, y no se
  piden los precios (el backend le responde 403).
- Netos con sus decimales (`formatearPesosNetos`: «$7.134,45»); los precios con IVA, en pesos
  enteros.
- Para el backend: declarar `PreciosArticulo` en el Swagger, agregar los tres campos de IVA y,
  si conviene, los precios en `FormatoPanel` para no pedir uno por formato.
- `pnpm format:check` marca todos los archivos por los finales de línea CRLF de
  `core.autocrlf=true` en Windows (también los que no se tocaron). Con `--end-of-line auto` el
  formato pasa.
- **Revisiones:** criterios sin bloqueantes. Diseño: con las dos columnas de precio la tabla no
  cabía entre 1024 y 1150 px, así que ahora se muestra desde `xl` (1280 px) y antes van las
  tarjetas. Además, los dos botones de la fila quedan separados, la referencia de IVA ya no usa
  `aria-live` (se lee con el campo) y «Gestionar precios» sigue el patrón de «Gestionar fotos».
  Seguridad: las rutas simuladas aceptan solo ids numéricos, para que «..» no desvíe el reenvío.
  Se agregaron pruebas de la tarjeta de celular y del error al cargar, y el texto «Un precio vacío
  no cambia.» en el panel.
- **Sin cambiar:** el aviso «pasó a exclusivo» se reconoce por el texto del backend;
  `formatosProducto.tsx` supera las 150 líneas (separar tabla y tarjetas en otra historia); la
  referencia de IVA puede diferir en un peso del valor que calcule el backend.
- **Preguntas para el equipo:** en `/panel/productos/nuevo` los precios se fijan después de
  guardar el producto y crear un formato. ¿Basta así? P3c Pack nuevo queda para SCRUM-105.
- Pendiente: revisar a mano 1440 y 360 px con una cuenta de administrador y el backend real.
- **PR:** https://github.com/Contrum-Projects/Frontend/pull/21 (En revisión).

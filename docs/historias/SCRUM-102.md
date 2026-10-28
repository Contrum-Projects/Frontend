# SCRUM-102 · E3-H3 · Fotos por formato en el panel

**Orden:** 12 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-28 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-101](SCRUM-101.md)  
**La necesitan después:** [SCRUM-105](SCRUM-105.md)

Como Personal de tienda, necesito subir y ordenar las fotos de cada formato, con la finalidad de mostrar bien cada producto.

**Historia backend:** SCRUM-28 · **Figma:** P3 Producto nuevo (fotos del formato elegido)

## Criterios de aceptación

1. **Subir foto.** El personal elige un formato. Cuando sube una imagen. Aparece en la galería de ese formato.
2. **Orden y principal.** El formato tiene varias fotos. Cuando el personal cambia el orden o marca otra principal. La galería muestra una sola principal.
3. **Última foto.** El formato tiene una sola foto. Cuando el personal intenta quitarla. La interfaz no lo permite y explica que se necesita al menos una.

## Pantalla y ruta

| Pantalla                    | Escritorio | Celular  | Ruta                                              |
| --------------------------- | ---------- | -------- | ------------------------------------------------- |
| P3 Producto nuevo / edición | 2029:658   | 2024:443 | `/panel/productos/nuevo`, `/panel/productos/[id]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 28-10-2026 (`pnpm api:tipos` contra el backend local): **Sí**, sin rutas simuladas.

- `GET /api/catalogo/articulos/{id}/imagenes`: fotos del formato (`id` = id del formato).
- `POST …/imagenes`: `multipart/form-data` con el campo `imagen` (JPEG, PNG o WebP, 5 MB, hasta
  10). Errores: 400 tipo, 409 máximo, 413 tamaño, 503 almacén.
- `PUT …/imagenes`: `{ orden: number[], principalId }`, con todas las fotos.
- `DELETE …/imagenes/{imagenId}`: 409 si es la única.
- Las cuatro responden `ImagenPanel[]` (`imagenes.service.ts`), pero el Swagger no lo declara: el
  tipo está en `compartido/api/respuestas.ts`. `FormatoPanel` ya trae `imagenes`.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

**28-10-2026** (desde SCRUM-101)

- **Las fotos van dentro de cada formato** (decisión del usuario), no en una columna del producto
  como el panel «Fotos del formato» de Figma (2031:975). La página del producto ya usa todo el
  ancho en una columna.

**28-10-2026** (SCRUM-102)

- Cada formato muestra sus miniaturas: en la columna «Fotos» de la tabla en escritorio y con
  «N fotos · Gestionar» en la tarjeta del celular. La galería de Figma 2031:975 se abre en un panel
  lateral, sin los chips de formato, porque las fotos ya están dentro de cada formato.
- **Orden arrastrando con @dnd-kit** (decisión del usuario; dependencias nuevas `@dnd-kit/core`,
  `@dnd-kit/sortable` y `@dnd-kit/utilities`). Funciona con mouse, con el dedo (manteniendo
  presionado, así la página sigue desplazándose) y con teclado (espacio y flechas), y los anuncios
  van en español. El menú de cada foto sirve para «Marcar como principal» y «Quitar foto».
- **Se guarda al instante** (decisión del usuario): el orden nuevo se ve antes de que responda el
  backend y, si lo rechaza, se vuelven a pedir las fotos guardadas.
- Con una sola foto, «Quitar foto» queda deshabilitado y un texto explica que se necesita al menos
  una (criterio 3). Si aun así el backend responde 409, se muestra su mensaje.
- Antes de enviar se revisan el tipo (JPEG, PNG, WebP) y los 5 MB que documenta el Swagger, con
  los mismos mensajes del backend, para no subir por el proxy un archivo que será rechazado
  (auditoría de seguridad). El backend los vuelve a revisar. El máximo de 10 fotos lo controla solo
  el backend; si se alcanza, se muestra su mensaje (409).
- Revisión de diseño y accesibilidad: foco visible con `outline-marca-profundo`, que conserva el
  borde de la principal. El nombre accesible de «N fotos · Gestionar» empieza con el texto
  visible. Al quitar una foto, el foco pasa a «Agregar foto». «Quitar foto», deshabilitado, dice
  por qué. Sin desplazamiento horizontal a 360 px en la tarjeta.
- Pendiente: probar a mano el arrastre con mouse y con el dedo, y revisar 1440 y 360 px con el
  backend real (requiere `R2_*` en el backend y `URL_IMAGENES` en el front). Pregunta para el equipo:
  ¿se oculta «Agregar foto» al llegar a 10 fotos?
- Para el backend: declarar la respuesta `ImagenPanel[]` en el Swagger de los cuatro endpoints.
- PR: https://github.com/Contrum-Projects/Frontend/pull/20

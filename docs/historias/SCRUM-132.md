# SCRUM-132 · E4-H1 · Sugerencia de IA en el producto nuevo

**Orden:** 40 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-60 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-100](SCRUM-100.md)  
**La necesitan después:** [SCRUM-133](SCRUM-133.md)

Como Personal de tienda, necesito pedir la descripción sugerida desde el formulario del producto, con la finalidad de no escribirla desde cero.

**Historia backend:** SCRUM-60 · **Figma:** P3 Producto nuevo (sugerencia de IA)

## Criterios de aceptación

1. **Generar.** El personal sube la foto del reverso. Cuando pulsa «Generar descripción». Se muestra un estado de carga y luego la descripción sugerida y los ingredientes.
2. **Sin resultado.** La foto no es legible o el servicio no responde. Cuando termina la solicitud. La pantalla lo informa y deja escribir la descripción a mano.

## Pantalla y ruta

| Pantalla                    | Escritorio | Celular  | Ruta                                              |
| --------------------------- | ---------- | -------- | ------------------------------------------------- |
| P3 Producto nuevo / edición | 2029:658   | 2024:443 | `/panel/productos/nuevo`, `/panel/productos/[id]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 04-11-2026: **Sí** (`compartido/api/esquema.d.ts`, backend SCRUM-60).

`POST /api/catalogo/descripciones/sugerencia` con `catalogo.gestionar`: multipart con la foto en
`imagen` (JPEG, PNG o WebP, hasta 5 MB). Responde `200 { descripcion, ingredientes | null, firma }`;
`400` sin imagen o con otro tipo, `413` sobre 5 MB, `422` foto ilegible, `429` más de 15 por minuto
por cuenta y `503` IA caída, sin respuesta en 30 s o sin `GEMINI_API_KEY`. No guarda la foto ni la
sugerencia. Sin ruta simulada.

## Notas de trabajo

- **Foto:** se sube como archivo en la tarjeta («Subir foto del reverso» y «Cambiar»), tanto en el
  producto nuevo como en la edición. Figma la elige entre las fotos del formato («300 ml · foto 3»),
  pero el criterio dice «sube la foto» y el producto nuevo aún no tiene formatos (decisión del
  04-11 con el usuario). La fila muestra el nombre del archivo. Antes de enviar se revisan el tipo
  y el peso con `problemaDelArchivo` de `fotosFormato.tsx` (los mismos mensajes del backend).
- **Ubicación:** desde `xl` (1280), tarjeta menta en una columna de 372 px a la derecha de «Datos»
  y «Descripción» (el asistente de Figma 2029:830), con marca y categoría en dos columnas como en
  Figma. Bajo `xl` (celular y pantallas medianas), tarjeta clara arriba de «Datos» con la
  sugerencia en una caja menta «Sugerencia a partir de la foto» (2024:505). Entre `lg` y `xl` la
  columna aplastaba los datos, como ya pasaba en packs.
- **Sin resultado:** el `422` muestra el mensaje del backend. El `503` y la falta de conexión
  muestran «No pudimos generar la descripción en este momento. Puedes escribirla a mano.» (el mismo
  texto del backend, repetido porque los 5xx nunca muestran el mensaje del servidor). La
  descripción sigue editable y se puede reintentar.
- **Fuera de alcance (SCRUM-133):** Usar, Editar y Descartar; reenviar `firma` en `sugerencia` al
  guardar; guardar `ingredientes` en el producto; el aviso al salir sin confirmar; el chip «Sin
  descripción aún» del producto nuevo.
- **Textos sin Figma:** el estado sin foto («Sube la foto del reverso y te sugerimos la
  descripción y los ingredientes.»), «Subir foto del reverso» y la carga («Leyendo la foto del
  reverso…»). Revisar con diseño.

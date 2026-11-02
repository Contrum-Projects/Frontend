# SCRUM-126 · E9-H2 · Pantalla Datos de facturación

**Orden:** 27 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-54 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-97](SCRUM-97.md)  
**La necesitan después:** [SCRUM-125](SCRUM-125.md)

Como un Cliente, necesito administrar mis datos de facturación, con la finalidad de pedir factura sin escribirlos cada vez.

**Historia backend:** SCRUM-54 · **Figma:** 10b Datos de facturación

## Criterios de aceptación

1. **Lista y alta.** El cliente abre la pantalla. Cuando agrega unos datos. Se guardan RUT, razón social, giro y dirección con región y comuna, y aparecen en la lista.
2. **Varios registros.** La cuenta tiene más de uno. Cuando se muestra la lista. Se pueden ver y elegir todos.
3. **Datos incompletos.** Falta un dato obligatorio. Cuando el cliente guarda. La pantalla señala el campo.

## Pantalla y ruta

| Pantalla                 | Escritorio | Celular   | Ruta                  |
| ------------------------ | ---------- | --------- | --------------------- |
| 10b Datos de facturación | 2066:3519  | 2070:2578 | `/cuenta/facturacion` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 02-11-2026 (`compartido/api/esquema.d.ts` regenerado del backend local): **Sí**. No hace
falta la API simulada.

- `GET /api/cuentas/yo/facturacion`: registros activos, del más antiguo al más reciente.
- `POST /api/cuentas/yo/facturacion` (201) y `PATCH /api/cuentas/yo/facturacion/{id}` (200).
  RUT, razón social (150), giro (150), dirección (200) y comuna (código CUT) son obligatorios;
  `correoFacturacion` es opcional y en el PATCH `null` lo borra. Un 400 trae un mensaje por dato
  («El RUT no es válido.», «La razón social es obligatoria.», «La comuna no existe.»…).
- `DELETE /api/cuentas/yo/facturacion/{id}` (204): desactiva el registro. Un id ajeno o ya
  eliminado responde 404.
- Solo cliente y profesional (`CompradorGuard`); el personal recibe 403.

**Para el backend:** el Swagger no declara la respuesta de `GET`, `POST` ni `PATCH`. El tipo está en
`compartido/api/respuestas.ts` (`DatosFacturacionCuenta`, copiado de
`src/modulos/cuentas/datos-facturacion.service.ts`). Además, `correoFacturacion` sale como
`Record<string, never>` en vez de `string | null` (igual que otros opcionales con `nullable`).

## Notas de trabajo

- **PR:** https://github.com/Contrum-Projects/Frontend/pull/42 (En revisión desde el 02-11-2026).
- **Pantalla:** `/cuenta/facturacion` (`tienda/cuenta/pantallaFacturacion.tsx`), dentro del marco
  de «Mi cuenta» con el menú lateral. Lista en `listaFacturacion.tsx`, formulario en
  `formularioFacturacion.tsx` y `camposFacturacion.tsx`, reglas en `esquemaFacturacion.ts`.
- **Decisiones del usuario (02-11-2026):**
  1. El correo de facturación va como campo opcional al final del formulario («Correo para la
     factura»), aunque Figma no lo dibuja. Si el registro lo tiene, se muestra en su tarjeta.
  2. En celular, «Agregar datos de facturación» abre el formulario en la misma página, con
     «Cancelar». En escritorio la tarjeta de datos nuevos siempre está, como en Figma.
  3. «Editar» carga el registro en esa misma tarjeta («Editar datos de facturación», con
     «Cancelar») y lleva el foco al RUT. Al guardar o cancelar, vuelve a la de datos nuevos.
  4. Sin registros: «Aún no tienes datos de facturación.», como en direcciones.
  5. El enlace «← Mi cuenta» de Figma (celular) va solo en esta pantalla y lleva a Mis datos,
     porque no hay una página «Mi cuenta». Si se agrega a las demás pantallas de la cuenta,
     conviene moverlo a `disenoCuenta.tsx`.
- **Eliminar** pide confirmación (como en direcciones). Si se elimina el registro que se está
  editando, el formulario vuelve a datos nuevos. Un 404 al eliminar (ya eliminado en otra
  pestaña) vuelve a pedir la lista.
- **Foco:** «Agregar» y «Editar» lo llevan al RUT. «Guardar» y «Cancelar» lo devuelven al título
  de la lista, salvo «Cancelar» de datos nuevos en celular, que lo devuelve al botón que los abrió.
  «Agregar datos» (escritorio) no borra lo que ya estaba escrito en la tarjeta de datos nuevos.
- **Pendiente:** pasar de «Editar» una tarjeta a «Editar» otra descarta lo no guardado de la
  primera, sin aviso (como el diálogo de direcciones al cerrarse).
- **Preguntas abiertas para el equipo:**
  1. En el criterio 2, «elegir» se entendió como elegir cuál usar al pedir factura, que es
     SCRUM-125. Aquí cada registro se ve y se puede editar o eliminar.
  2. El personal de tienda puede entrar a `/cuenta/*` y ve el 403 del backend en la lista. Afecta
     a todas las pantallas de la cuenta (`cuentaProtegida.tsx`), no solo a esta.
- Región y comuna reutilizan `SelectorUbicacion` de `camposDireccion.tsx` (ahora exportado).
- **Pruebas:** `tienda/cuenta/facturacion.test.tsx` (los tres criterios, edición, eliminación,
  apertura en celular, foco, error al cargar y el 5xx sin detalles).

# SCRUM-123 · E7-H2 · Cotización del despacho y dirección

**Orden:** 30 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-51 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-122](SCRUM-122.md)  
**La necesitan después:** ninguna

Como un Cliente, necesito ver el costo del despacho antes de pagar, con la finalidad de decidir con el total real.

**Historia backend:** SCRUM-51 · **Figma:** 05 Checkout (despacho)

## Criterios de aceptación

1. **Cotización.** El cliente elige región y comuna de la lista oficial. Cuando se cotiza. El resumen muestra el costo de Chilexpress y el total actualizado.
2. **Sin respuesta.** La cotización no está disponible. Cuando el servidor lo informa. La pantalla lo indica y ofrece el retiro en tienda.
3. **Dirección nueva.** El cliente agrega una dirección. Cuando elige región y comuna. Los selectores solo muestran la lista oficial.

## Pantalla y ruta

| Pantalla    | Escritorio | Celular   | Ruta        |
| ----------- | ---------- | --------- | ----------- |
| 05 Checkout | 2010:1024  | 2010:2211 | `/checkout` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 02-11-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**.

- `GET /api/despacho/cotizacion?direccionId=` (cotiza con Chilexpress; 409 sin cobertura o carrito
  vacío, 503 si Chilexpress no responde: en ambos se ofrece el retiro; 429 sobre 10 por minuto).
- `GET /api/territorio/regiones` y `GET /api/territorio/regiones/{codigoCut}/comunas` (lista oficial).
- `POST /api/cuentas/yo/direcciones` (crea la dirección; responde la dirección creada).

## Notas de trabajo

- **PR:** https://github.com/Contrum-Projects/Frontend/pull/45 (En revisión desde el 02-11-2026).

**Alcance:** la cotización y el costo en el resumen (criterio 1) se hicieron en SCRUM-122; aquí
queda su prueba con la clave E7-H2, el aviso «sin respuesta» y la dirección nueva.

**Decisiones (02-11-2026, con el usuario):**

- Si el backend responde 409 o 503 al cotizar, el aviso muestra el mensaje y el botón
  «Retirar en tienda» (contorno). Al pulsarlo queda elegido el retiro y el foco pasa a esa opción.
  Con 429 y otros errores, solo el mensaje.
- La dirección que se agrega desde el checkout queda elegida y se cotiza: `DialogoDireccion`
  recibe un `alGuardar` opcional que se llama con la dirección creada, ya con la lista al día.
  Mis datos no lo usa.
- Región y comuna salen solo de `/api/territorio` (el mismo `SelectorUbicacion` de Mis datos); la
  comuna queda deshabilitada hasta elegir región.

**Preguntas abiertas:**

- Con 503 se ve el mensaje genérico («No pudimos completar la acción…»), porque
  `compartido/api/errores.ts` oculta todo mensaje 5xx. El del backend
  («No pudimos cotizar el despacho en este momento. Intenta de nuevo o elige retiro en tienda.»)
  es más claro y no es técnico. ¿Lo mostramos solo en la cotización?
- Un 409 también llega con «carrito vacío» o «artículo que ya no está a la venta»; en esos casos
  también se ofrece el retiro (el Swagger no los distingue por código).

**Para el backend:**

- Documentar en el Swagger la respuesta 200 de `GET /api/despacho/cotizacion` (sigue sin esquema).

**Pendiente:** probar con el backend real a 1440 y a 360 px (el backend no corría en :3000).

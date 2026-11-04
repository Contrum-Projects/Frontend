# SCRUM-136 · E10-H4 · Cuenta profesional activa en la tienda

**Orden:** 44 de 53 · **Puntos:** 2 · **Historia backend:** SCRUM-65 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-109](SCRUM-109.md), [SCRUM-134](SCRUM-134.md)  
**La necesitan después:** [SCRUM-137](SCRUM-137.md)

Como un Cliente con la verificación aprobada, necesito que la tienda cambie a vista profesional apenas se apruebe, con la finalidad de comprar sin esperas.

**Historia backend:** SCRUM-65 · **Figma:** 08 Verificación profesional, 03 Ficha (peluquero verificado)

## Criterios de aceptación

1. **Cambio de vista.** La solicitud se aprobó. Cuando el cliente vuelve a cargar la tienda. Ve precios mayoristas y productos exclusivos, y la pantalla de verificación muestra la cuenta como aprobada.
2. **Invitación al perfil.** La cuenta acaba de ser aprobada. Cuando abre su cuenta. Ve la invitación a completar el perfil profesional.

## Pantalla y ruta

| Pantalla               | Escritorio | Celular   | Ruta                         |
| ---------------------- | ---------- | --------- | ---------------------------- |
| 08c Perfil profesional | 2038:2666  | 2038:5397 | `/cuenta/perfil-profesional` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 04-11-2026: **Sí**, sin rutas simuladas. SCRUM-65 no agrega rutas; esta historia usa:

- `POST /api/cuentas/sesion/renovar`: tras la aprobación entrega el token con el rol
  `profesional` (las sesiones no se revocan al ascender) y desde ahí el catálogo muestra el
  mayorista y los exclusivos (SCRUM-109).
- `GET /api/verificaciones/yo`: la solicitud `aprobada` (SCRUM-134).
- `GET /api/perfil-profesional/yo` (SCRUM-66): **404** si aún no completa el perfil; 403 sin el rol
  profesional. El Swagger no declara la respuesta: `PerfilProfesionalCuenta` está en
  `compartido/api/respuestas.ts`, copiada de `perfil-profesional.service.ts`.

## Notas de trabajo

**Decisiones (04-11-2026, con el usuario):**

- **Cambio de vista.** Al recargar, `IniciadorDeSesion` renueva la sesión y el token trae el rol
  profesional. Si el personal aprueba con la sesión abierta, el token sigue de cliente hasta
  renovarse: la pantalla de verificación, al ver la solicitud `aprobada` con rol cliente, llama
  una vez a `renovarSesion()`.
- **Aviso de aprobada** con el texto de Figma 08c: «Cuenta verificada · Ya ves el precio
  profesional en todo el catálogo.». Se quita el botón «Ver precios profesionales» de SCRUM-134.
- **Invitación al perfil** (Figma no la tiene): «Completa tu perfil profesional», «Nos ayuda a
  mostrarte productos y ofertas para tu trabajo.» (encabezado de 08c) y «Completar perfil» →
  `/cuenta/perfil-profesional`. Va arriba de Mis datos (lo que se abre al entrar a la cuenta) y bajo
  «Cuenta verificada». Solo con rol profesional y perfil sin completar (404). Mientras carga o si
  la consulta falla no se muestra.
- **Ruta del perfil:** página propia `/cuenta/perfil-profesional`, como dice `docs/pantallas.md`,
  aunque Figma 08c dibuja el formulario dentro de Verificación. Hasta SCRUM-137 la ruta da 404.

**Pendiente para SCRUM-137:** crear la página, quitar el `as Route` de `RUTAS.perfilProfesional`
y, al guardar, actualizar la clave `CLAVE_PERFIL_PROFESIONAL` para que la invitación desaparezca.

**Para el backend (SCRUM-66):** declarar en el Swagger la respuesta `PerfilProfesionalCuenta`.

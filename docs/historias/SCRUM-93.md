# SCRUM-93 · E1-H1 · Pantallas de registro y confirmación del correo

**Orden:** 3 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-19 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-94](SCRUM-94.md)  
**La necesitan después:** ninguna

Como un Visitante, necesito un formulario de registro y las pantallas de confirmación del correo, con la finalidad de crear mi cuenta desde la tienda.

**Historia backend:** SCRUM-19 · **Figma:** 06 Ingreso y registro

## Criterios de aceptación

1. **Formulario de registro.** El visitante abre «Crear cuenta». Cuando completa el formulario. La pantalla pide nombre, apellido, correo y contraseña; teléfono, RUT, fecha de nacimiento y género son opcionales, y la casilla de ofertas aparece desmarcada.
2. **Errores del servidor.** El correo o el RUT ya existen, o las contraseñas no coinciden. Cuando se envía el formulario. La pantalla muestra cada error junto a su campo, sin perder lo escrito.
3. **Confirmación del correo.** El registro fue exitoso. Cuando la persona vuelve a la tienda o abre el enlace del correo. La pantalla indica «Revisa tu correo» y, con el enlace, confirma la cuenta o avisa que el enlace venció.
4. **Celular.** La pantalla se abre en un celular. Cuando el visitante alterna entre «Ingresar» y «Crear cuenta». Las pestañas funcionan sin desplazamiento horizontal.

## Pantalla y ruta

| Pantalla               | Escritorio | Celular                    | Ruta                                       |
| ---------------------- | ---------- | -------------------------- | ------------------------------------------ |
| 06 Ingreso y registro  | 2018:1261  | 2018:2508                  | `/registro` (página aparte de `/ingresar`) |
| Confirmación de correo | —          | revisa tu correo 2034:4841 | `/confirmar-correo?token=`                 |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 26-10-2026 (`compartido/api/esquema.d.ts` de `main`): **Sí**. `POST /api/cuentas/registro`, `POST /api/cuentas/confirmar-correo`.

Si falta el endpoint, avanza con la API simulada (`docs/api-simulada.md`) y anota aquí qué
formato de respuesta acordaste con quien hace la historia backend.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

- **Decidido en SCRUM-94:** el registro es una página aparte, `/registro`, aunque Figma muestre
  «Crear cuenta» junto a «Iniciar sesión». `/ingresar` ya enlaza aquí con «¿No tienes cuenta?
  Crear cuenta»; el registro debe enlazar de vuelta («¿Ya tienes cuenta? Ingresar»). Quita el
  `as Route` de `RUTAS.registro` en `tienda/diseno/enlaces.ts`. El criterio 4 (pestañas en el
  celular) queda en ver con el equipo: sin pestañas, se cubre con esos enlaces.

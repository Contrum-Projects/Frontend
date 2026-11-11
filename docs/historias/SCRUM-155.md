# SCRUM-155 · E13-H4 · Pantalla Clientes del panel

**Orden:** 54 de 54 · **Puntos:** 5 · **Historia backend:** SCRUM-154 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-99](SCRUM-99.md)  
**La necesitan después:** ninguna

Como un Administrador, necesito la pantalla Clientes del panel, con la finalidad de buscar, revisar y gestionar las cuentas de clientes y profesionales.

**Historia backend:** SCRUM-154 · **Relacionada:** SCRUM-149 (cambio de rol desde el panel) · **Figma:** sin diseño (patrón de P8 Personal y P3a Productos)

## Criterios de aceptación

1. **Listado.** El administrador abre «Clientes» (`/panel/clientes`). Cuando carga la pantalla. Ve una tabla (escritorio) o una lista (celular) paginada con nombre, correo, rol (Cliente/Profesional), estado y fecha de registro, y puede filtrar por rol y estado y buscar por nombre, correo o RUT. Sin resultados, un estado vacío lo dice.
2. **Detalle.** El administrador abre una cuenta. Cuando carga el detalle (`/panel/clientes/[codigoPublico]`). Ve sus datos, el perfil profesional si existe, el estado de la verificación (con enlace a «Verificaciones» si está en revisión), la cantidad de pedidos y el historial de rol.
3. **Quitar rol profesional.** La cuenta es profesional. Cuando el administrador elige «Pasar a cliente». La interfaz pide un motivo (10 a 1000 caracteres), no deja guardar sin él, pide confirmación, avisa que rige de inmediato y muestra el rol nuevo (`PATCH /api/cuentas/{codigoPublico}/rol`).
4. **Desactivar y reactivar.** Cuando el administrador usa el interruptor de estado. La interfaz pide confirmación y muestra la cuenta como desactivada o activa, sin borrarla.
5. **Errores.** El servidor rechaza una acción (403, 404, 409). Cuando el administrador guarda. La pantalla muestra el `message` del backend y la cuenta conserva su estado.

## Pantalla y ruta

| Pantalla             | Escritorio | Celular | Ruta                                                  |
| -------------------- | ---------- | ------- | ----------------------------------------------------- |
| Clientes (sin Figma) | —          | —       | `/panel/clientes` y `/panel/clientes/[codigoPublico]` |

## API

Estado al 11-11-2026 (`pnpm api:tipos` contra la rama de SCRUM-154): **Sí**.

- `GET /api/clientes?buscar=&rol=&activo=&pagina=&limite=` → `ListadoClientesDto` (con
  `conteos` para los chips).
- `GET /api/clientes/{codigoPublico}` → `ClienteDetalleDto`; 404 si no existe o es del personal.
- `POST /api/clientes/{codigoPublico}/desactivar` y `/reactivar` (204, idempotentes).
- `PATCH /api/cuentas/{codigoPublico}/rol` (`{ rol: 'cliente', motivo }`, SCRUM-148). Su
  respuesta no está declarada en el Swagger; la pantalla no la usa (vuelve a pedir el detalle).

## Notas de trabajo

- **Menú:** «Clientes» va en el menú lateral antes de «Personal» y, en celular, en «Más», con
  `personal.gestionar` (solo administrador).
- **Diseño:** sin Figma. El listado repite el buscador y los chips de Productos y la tabla de
  Personal; el detalle usa tarjetas con listas de datos como la revisión de Verificaciones.
- **Pasar a cliente:** un solo diálogo pide el motivo y avisa lo que pasa (rige de inmediato,
  se cierran sus sesiones, deja de ver el precio profesional, se quitan los exclusivos del
  carrito, los pedidos no cambian). No se ofrece si la cuenta está desactivada (el backend
  responde 409).
- **Desactivar:** el aviso dice que sus pedidos siguen su curso (decisión del 11-11-2026 en
  SCRUM-154: desactivar solo corta el acceso).

# SCRUM-127 · E9-H3 · Facturas por emitir y registro de la factura

**Orden:** 39 de 53 · **Puntos:** 5 · **Historia backend:** SCRUM-55 · **API:** Parcial

**Necesita antes (frontend):** [SCRUM-130](SCRUM-130.md)  
**La necesitan después:** ninguna

Como Personal de tienda, necesito registrar la factura emitida desde el panel, con la finalidad de dejarla disponible para el cliente.

**Historia backend:** SCRUM-55 · **Figma:** P2c Facturas

## Criterios de aceptación

1. **Facturas por emitir.** El personal abre la pestaña «Facturas por emitir» en Pedidos. Cuando carga. Ve los pedidos que pidieron factura, por emitir o con folio.
2. **Registrar.** El personal abre un pedido. Cuando ingresa folio y fecha y sube el PDF. La tarjeta muestra los datos del receptor y los montos tomados del pedido, y guarda la factura.
3. **Folio repetido.** El servidor rechaza el folio. Cuando el personal guarda. La pantalla muestra el error.

## Pantalla y ruta

| Pantalla                | Escritorio | Celular             | Ruta                      |
| ----------------------- | ---------- | ------------------- | ------------------------- |
| P2c Facturas por emitir | 2050:2078  | registrar 2051:1443 | `/panel/pedidos/facturas` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 04-11-2026 (`pnpm api:tipos` contra el backend local): **Parcial**.

**Real:** `POST /api/pedidos/{codigoPedido}/factura` (`RegistrarFacturaController`, permiso
`facturacion.gestionar`: vendedor y administrador). `multipart/form-data` con `archivo` (PDF hasta
5 MB, reconocido por su contenido), `folio` (entero positivo) y `fechaEmision` (AAAA-MM-DD, no
futura; opcional, por defecto hoy). Responde 201 `{ codigoPedido, tipo, folio, fechaEmision,
estado }` (el Swagger no lo declara). 400 sin PDF, no es PDF, folio o fecha inválidos; 409 «Ya
existe una factura con el folio N.», no pidió factura, no está pagado o ya tiene factura; 413 PDF
de más de 5 MB; 503 almacén. `GET /api/pedidos/{codigoPedido}/factura` descarga el PDF
registrado (E9-H4).

**Falta (se simula, forma propuesta a SCRUM-55, por confirmar):** no hay cómo listar los pedidos
que pidieron factura ni leer el receptor y los montos para la tarjeta.

`GET /api/gestion/facturas?pagina=&limite=` (permiso `facturacion.gestionar`). Qué pedidos entran
(pidieron factura y ya se pagaron) y en qué orden lo decide el backend:

```ts
interface ListadoFacturasGestion {
  items: {
    codigoPedido: string;
    razonSocial: string;
    rut: string; // 76123456-0
    total: number; // con IVA
    estado: 'por_emitir' | 'emitida';
    folio: number | null;
  }[];
  porEmitir: number; // conteo de la pestaña
  total: number;
  pagina: number;
  limite: number;
}
```

`GET /api/gestion/facturas/{codigoPedido}`: los datos para emitirla en el SII (por emitir, los
del dato de facturación del pedido; emitida, los que copió el documento):

```ts
interface DetalleFacturaGestion {
  codigoPedido: string;
  estado: 'por_emitir' | 'emitida';
  receptor: {
    razonSocial: string;
    rut: string;
    giro: string;
    direccion: string;
    comuna: string;
  };
  montos: { neto: number; iva: number; total: number };
  porcentajeIva: number;
  folio: number | null;
  fechaEmision: string | null; // AAAA-MM-DD
}
```

Errores: 401, 403 (sin `facturacion.gestionar`), 404 (el pedido no existe o no pidió factura).

## Notas de trabajo

**PR:** https://github.com/Contrum-Projects/Frontend/pull/54 (En revisión; lista y tarjeta con API simulada).

**04-11-2026 · implementación (rama `SCRUM-127-facturas-por-emitir`)**

- **Rutas:** `/panel/pedidos` y `/panel/pedidos/[codigo]` pasaron al grupo `app/panel/pedidos/(todos)/`
  (mismas URL) para que `/panel/pedidos/facturas` tenga su propio layout (`panel/facturas/disenoFacturas.tsx`)
  y no herede la lista de pedidos. `/panel/pedidos/facturas` muestra en escritorio «Elige un pedido
  para registrar su factura.»; `/panel/pedidos/facturas/[codigo]` pone la tarjeta al lado
  (escritorio) o sola, con «← CP-…» (celular).
- **Pestañas** (`panel/pedidos/pestanasPedidos.tsx`): «Todos los pedidos | Facturas por emitir · N»,
  enlaces con `aria-current`, en las dos rutas. Solo con `facturacion.gestionar` (vendedor y
  administrador; se agregó el permiso a `compartido/sesion/roles.ts` y la ruta a
  `PERMISOS_DE_RUTA`): el bodeguero ve Pedidos sin pestañas. El conteo es `porEmitir` del backend.
  P2 (2028:725) no dibuja pestañas: se agregaron bajo el título, como en P2c.
- **Decisiones del usuario (04-11):** la forma simulada de arriba sin acordar aún con SCRUM-55;
  una factura ya emitida muestra los datos, el folio, la fecha y «Descargar factura» (Figma no la
  dibuja); en celular la lista son tarjetas como las de Pedidos (Figma solo dibuja «Registrar»).
- **Formulario:** folio, fecha de emisión (`SelectorFecha`, parte en hoy en Chile, sin fechas
  futuras) y el PDF. El esquema zod repite las reglas del DTO solo para avisar antes de enviar,
  con los mismos mensajes; los 400, 409 y 413 del backend quedan junto a su campo (folio, fecha,
  archivo, reconocidos por el inicio del mensaje) o arriba del formulario. El archivo elegido y lo
  escrito se conservan al fallar.
- **Datos para el SII:** receptor y montos tal como llegan (RNF-03); «IVA (19%)» usa
  `porcentajeIva` del backend. En celular, los montos en una línea como en Figma; la dirección se
  muestra también en celular (Figma la omite) porque hace falta para emitir.
- **API simulada (`compartido/api/simulado/panelFacturas.ts`):** los dos GET con `FACTPOREMI01`,
  `FACTPOREMI02` y `FACTEMITID01`. El `POST …/factura` y el `GET …/factura` reales se simulan solo
  para esos códigos; el folio 1532 responde 409 para ver el criterio 3. El detalle no cambia al
  registrar, porque es fijo.
- **Para el backend (SCRUM-55):** crear los dos GET con la forma de arriba y declarar en el
  Swagger la respuesta de `POST /pedidos/{codigoPedido}/factura` (`FacturaRegistrada`). ¿Errores
  con su campo, para no reconocerlos por el texto?
- **Pendiente:** probar la pantalla con sesión del personal en el navegador (1440 y 360 px) y,
  cuando lleguen los endpoints, borrar las rutas simuladas y el cast de `consultasFacturas.ts`.
- **Revisiones (04-11):**
  - Seguridad: sin hallazgos explotables. Se aplicó la observación de aceptar un archivo sin tipo
    solo si su nombre termina en `.pdf`.
  - Diseño:
    - Las pestañas quedan a la misma altura en las dos vistas.
    - Los esqueletos tienen la altura de las tarjetas y del formulario (RNF-17).
    - En celular, con un pedido abierto no se piden la lista ni el conteo.
    - El «·» de los montos no lo leen los lectores de pantalla.
    - El folio de la factura emitida se ve solo en la insignia.
  - La revisión de diseño no pudo abrir Figma: falta compararla en el navegador.
- **Preguntas abiertas:**
  - ¿La lista pagina o se filtra solo por «por emitir»? Hoy muestra la primera página y avisa
    «Se muestran X de Y».
  - El calendario de la fecha de emisión ofrece desde el 1 de enero del año anterior hasta hoy.
    El backend solo exige que no sea futura: ¿hace falta un límite hacia atrás?

**06-11-2026 (SCRUM-150):** el backend entrega `GET /api/gestion/facturas` y `GET /api/gestion/facturas/{codigoPedido}` con la forma de arriba (`ESTADOS_FACTURA_GESTION`). Orden (decisión del 6 nov): primero las por emitir, del pedido más antiguo al más nuevo; después las emitidas, la más reciente primero. Se borraron `simulado/panelFacturas.ts` y el cast. Falta probar con el backend real.

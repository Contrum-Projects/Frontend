# SCRUM-109 · E2-H4 · Vista de precio profesional

**Orden:** 17 de 53 · **Puntos:** 3 · **Historia backend:** SCRUM-35 · **API:** Sí

**Necesita antes (frontend):** [SCRUM-108](SCRUM-108.md)  
**La necesitan después:** [SCRUM-119](SCRUM-119.md), [SCRUM-136](SCRUM-136.md)

Como un Peluquero verificado, necesito ver el precio mayorista y los productos exclusivos en la tienda, con la finalidad de comprar con las condiciones de mi canal.

**Historia backend:** SCRUM-35 · **Figma:** 03 Ficha (peluquero verificado), 01 Inicio («Precio profesional»)

## Criterios de aceptación

1. **Precio profesional.** La cuenta es profesional. Cuando abre un producto. Ve el precio mayorista y el aviso «desde 3 unidades» con el selector de cantidad.
2. **Exclusivos.** Existen productos exclusivos. Cuando el peluquero explora o busca. Aparecen en los listados.
3. **Visitante o cliente.** La cuenta no es profesional. Cuando explora. La interfaz muestra solo precios minoristas y ofrece el acceso a «Precio profesional» para solicitar la verificación.

## Pantalla y ruta

| Pantalla             | Escritorio                   | Celular               | Ruta                  |
| -------------------- | ---------------------------- | --------------------- | --------------------- |
| 03 Ficha de producto | 2007:635 · agotado 2058:3096 | 2007:1706 (peluquero) | `/productos/[codigo]` |

Nodos del archivo de Figma `cl9eSD5YBS9qF4tQXJki68` (ver `docs/pantallas.md`).

## API

Estado al 30-10-2026: **Sí**. Con el token de una cuenta profesional, `GET /api/tienda/productos`,
`/productos/{id}`, `/packs` y `/packs/{id}` incluyen los exclusivos y traen `precioMayorista` con
IVA y `exclusivo`; en los exclusivos `precio` es `null`. Visitantes, clientes y personal reciben
solo lo de venta general, sin mayorista. El Swagger describe esto pero **no declara las
respuestas**: los tipos están en `compartido/api/respuestas.ts` (`ProductoTiendaProfesional`,
`ProductoDetalleProfesional`, `FormatoDetalleProfesional`, `PackTiendaProfesional`,
`PackDetalleProfesional`) citando `tienda.service.ts`, `tienda-detalle.service.ts` y
`tienda-packs.service.ts` del backend. Pedir a SCRUM-35 que los documente. Sin API simulada.

## Notas de trabajo

<!-- Decisiones, preguntas abiertas y lo que quedó pendiente. Lo completa /historia. -->

**30-10-2026**

- PR: https://github.com/Contrum-Projects/Frontend/pull/28 (integrado el 30-10-2026).
- El servidor no sabe quién mira (el token vive solo en memoria): arma la tienda como visitante.
  Con una cuenta profesional, el navegador vuelve a pedir la ficha, la grilla del catálogo o la
  búsqueda (con su total) y las filas del inicio con el token (`tienda/profesional/
consultasProfesional.ts`). Mientras la sesión es «desconocida» se ve lo del servidor; luego, para
  el peluquero, un esqueleto hasta su precio (decisión del usuario).
- Un exclusivo abierto por su enlace: el servidor recibe 404 y responde 404 (buscadores); el
  `not-found.tsx` de `productos/[id]` y `packs/[id]` lo vuelve a pedir si la cuenta es profesional.
- Ficha del peluquero (Figma 2007:1759): insignia «Precio profesional · cuenta verificada»,
  mayorista con «c/u · IVA incluido», formatos con su mayorista, cantidad desde 3 que no baja de 3,
  aviso «Para tu precio profesional, el mínimo es 3 unidades de este formato.» y «Agregar N al
  carrito». **Sin subtotal** (el frontend no calcula montos; decisión del usuario).
- Pack del peluquero: el mayorista con la insignia; sin mínimo (es por formato).
- Tarjeta (Figma 5:107): «Precio profesional», mayorista y «Mín. 3 unidades»; los exclusivos con
  «Exclusivo profesional» sobre la foto.
- Visitante y cliente: el aviso «¿Eres peluquero?» (Figma 2007:767) enlaza a `/cuenta/verificacion`
  (SCRUM-134, aún sin página; decisión del usuario). No se muestra mientras la sesión es
  «desconocida» ni al personal.
- Si falla la lectura del peluquero: el mensaje del backend y «Reintentar».
- «Ver N productos» de los filtros del celular se pide con la sesión del profesional (cierra el
  pendiente de SCRUM-107). Las claves de las lecturas profesionales llevan el `codigoPublico`.
- Tarjeta en celular: la variante compacta de Figma (9:765) dice «Profesional»; la insignia
  «Exclusivo profesional» baja de línea si la foto es angosta. Esqueleto con las tres líneas del
  precio profesional mientras llega su listado.
- Revisión: verificador-criterios, revisor-diseno (sin acceso al MCP de Figma; los textos se
  tomaron de Figma en esta sesión) y auditor-seguridad (sin hallazgos medios ni altos).
- Pendiente:
  - El banner y las tarjetas de packs del inicio siguen con el minorista y sin los packs
    exclusivos: ¿el criterio 2 incluye packs? Preguntar al equipo.
  - Si una búsqueda solo encuentra exclusivos, el título y la columna de filtros se arman con lo
    del visitante («Búsqueda», sin filtros); los conteos de `/tienda/facetas` (aún simulado) no
    cuentan los exclusivos. Confirmar con SCRUM-33/35 si facetas los cuenta con token.
  - Si falla la lectura del peluquero, la página muestra solo el aviso y «Reintentar», sin h1.
  - «Precio profesional» del header, del menú del celular y del aviso del inicio lleva a
    `/precio-profesional` (sin historia), y el peluquero verificado lo sigue viendo. Definir con
    el equipo.
  - El aviso «¿Eres peluquero?» no va en la ficha de pack (Figma 03c no lo trae).
- No se probó con el backend real como peluquero: el backend local no tiene una cuenta
  profesional (la semilla solo crea la de administrador). Lo cubren las pruebas.
- Nuevo: `compartido/ui/noEncontrado.tsx` (la página 404, compartida con `app/not-found.tsx`) y
  `tienda/catalogo/marcoFila.tsx` (la fila del inicio sin lecturas del servidor).

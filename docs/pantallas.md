# Pantallas: historias, Figma y rutas

Cada historia de frontend (Jira, etiqueta `frontend`) apunta a su historia backend y a una pantalla
de Figma. Esta tabla agrega el **nodo** de cada pantalla para abrirla con el MCP de Figma
(`get_design_context` / `get_screenshot`, fileKey `cl9eSD5YBS9qF4tQXJki68`) y la **ruta propuesta**.

Las rutas son una propuesta de la configuración inicial: si una historia necesita otra, cámbiala
aquí en el mismo PR para que el equipo no cree URLs que choquen.

## Tienda

| Historias                | Pantalla                                     | Escritorio                                      | Celular                                       | Ruta propuesta                                                  |
| ------------------------ | -------------------------------------------- | ----------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------- |
| SCRUM-106                | 01 Inicio                                    | 2016:1184                                       | 2017:1191                                     | `/`                                                             |
| SCRUM-106, 107           | 02 Catálogo (con filtros)                    | 2006:395                                        | 2005:374 · filtros 2005:662                   | `/catalogo?categoria=&marca=`                                   |
| SCRUM-107                | 11 Búsqueda                                  | 2058:2736                                       | sin resultados 2060:2396                      | `/buscar?q=`                                                    |
| SCRUM-108, 109           | 03 Ficha de producto                         | 2007:635 · agotado 2058:3096                    | 2007:1706 (peluquero)                         | `/productos/[codigo]`                                           |
| SCRUM-108                | 03c Ficha de pack                            | 2058:3302                                       | —                                             | `/packs/[codigo]`                                               |
| SCRUM-116, 117, 119      | 04 Carrito                                   | 2008:872 · listo 2035:2364                      | 2008:1927 · listo 2035:4957 · vacío 2060:2231 | `/carrito`                                                      |
| SCRUM-118, 122, 123, 125 | 05 Checkout                                  | 2010:1024                                       | 2010:2211                                     | `/checkout`                                                     |
| SCRUM-120, 121           | 09 Resultado del pago                        | aprobado 2034:2106                              | rechazado 2034:4663 · vencido 2034:4725       | `/pago/resultado` (retorno de Mercado Pago)                     |
| SCRUM-93, 94             | 06 Ingreso y registro                        | 2018:1261                                       | 2018:2508                                     | `/ingresar` (pestañas «Ingresar» y «Crear cuenta»)              |
| SCRUM-93                 | Confirmación de correo                       | —                                               | revisa tu correo 2034:4841                    | `/confirmar-correo?token=`                                      |
| SCRUM-96                 | 10 Recuperar contraseña                      | —                                               | 2034:4783 · revisa tu correo 2034:4841        | `/recuperar-contrasena`, `/restablecer-contrasena?token=`       |
| SCRUM-129, 124, 128      | 07 Mis pedidos y detalle                     | 2019:1396 · detalle 2019:1623 · vacío 2058:3544 | detalle 2019:2970                             | `/cuenta/pedidos`, `/cuenta/pedidos/[codigo]`                   |
| SCRUM-97, 95             | 10 Mis datos (datos, direcciones, seguridad) | 2034:2270                                       | —                                             | `/cuenta/datos`                                                 |
| SCRUM-126                | 10b Datos de facturación                     | 2066:3519                                       | 2070:2578                                     | `/cuenta/facturacion`                                           |
| SCRUM-139                | 10c Ofertas por correo                       | 2066:3690                                       | 2070:2703                                     | `/cuenta/ofertas`; baja desde el correo: `/ofertas/baja?token=` |
| SCRUM-134                | 08 Verificación profesional                  | 2020:1666 · rechazada 2038:2518                 | 2020:3006 · rechazada 2038:5337               | `/cuenta/verificacion`                                          |
| SCRUM-136, 137           | 08c Perfil profesional                       | 2038:2666                                       | 2038:5397                                     | `/cuenta/perfil-profesional`                                    |
| SCRUM-138                | Suscripción a ofertas                        | (en el footer)                                  | —                                             | componente del footer                                           |
| SCRUM-106                | 12 Menú                                      | —                                               | 2060:2101                                     | componente del header                                           |

El header y el footer de la tienda (Componentes › Header 6:32/6:76, Footer 6:115/6:166) no tienen
historia propia: se arman con SCRUM-106.

## Panel

Todas bajo `/panel`. El menú y la protección de rutas por rol son SCRUM-99 (el backend vuelve a
autorizar cada llamada).

| Historias                 | Pantalla                                | Escritorio                        | Celular                     | Ruta propuesta                                                                                              |
| ------------------------- | --------------------------------------- | --------------------------------- | --------------------------- | ----------------------------------------------------------------------------------------------------------- |
| SCRUM-99, 115             | P1 Resumen                              | 2028:470                          | 2023:206                    | `/panel`                                                                                                    |
| SCRUM-130, 131            | P2 Pedidos                              | 2028:725                          | 2023:336 · detalle 2024:333 | `/panel/pedidos`, `/panel/pedidos/[codigo]`                                                                 |
| SCRUM-127                 | P2c Facturas por emitir                 | 2050:2078                         | registrar 2051:1443         | `/panel/pedidos/facturas`                                                                                   |
| SCRUM-100                 | P3a Productos                           | 2039:980                          | 2039:5857                   | `/panel/productos`                                                                                          |
| SCRUM-100 a 104, 132, 133 | P3 Producto nuevo / edición             | 2029:658                          | 2024:443                    | `/panel/productos/nuevo`, `/panel/productos/[id]`                                                           |
| SCRUM-105                 | P3c Pack nuevo                          | 2065:2381                         | 2065:9091                   | `/panel/packs/nuevo`                                                                                        |
| SCRUM-103                 | P3b Marcas y categorías                 | 2039:1311                         | —                           | `/panel/marcas-y-categorias`                                                                                |
| SCRUM-114, 115            | P5a Inventario · Stock                  | 2043:1300                         | 2044:1067                   | `/panel/inventario`                                                                                         |
| SCRUM-114                 | P5d Inventario · Movimientos            | 2064:2156                         | 2069:1548                   | `/panel/inventario/movimientos`                                                                             |
| SCRUM-111                 | P5e Entradas · P5 Entrada nueva         | 2064:2663 · nueva 2029:4319       | 2069:1703 · nueva 2025:603  | `/panel/inventario/entradas`, `/panel/inventario/entradas/nueva`                                            |
| SCRUM-110                 | P5f Proveedores                         | 2064:3094                         | 2069:1819                   | `/panel/inventario/proveedores`                                                                             |
| SCRUM-112, 113            | P5c Registrar salida                    | 2043:1689 (panel lateral)         | 2044:1209                   | panel lateral sobre `/panel/inventario`                                                                     |
| SCRUM-135                 | P4 Verificaciones                       | 2029:872                          | 2025:481                    | `/panel/verificaciones`                                                                                     |
| SCRUM-140, 141            | P7 Campañas · P7a Nueva · P7b Confirmar | 2045:1569 · 2046:1646 · 2046:1846 | 2047:1225 · 2047:1323       | `/panel/campanas`, `/panel/campanas/nueva`                                                                  |
| SCRUM-142 a 145           | P6 Reportes                             | 2041:1229                         | 2042:1010                   | `/panel/reportes`                                                                                           |
| SCRUM-98                  | P8 Personal · P8a Nueva cuenta          | 2049:1896 · 2049:2070             | 2051:1343                   | `/panel/personal`; activar la cuenta desde el correo: `/personal/activar?token=` (ya fijada por el backend) |

## Correos

Los correos del sistema (página «Correos» de Figma) los arma el backend; aquí solo importan sus
enlaces de vuelta a la tienda: confirmar correo, restablecer contraseña, baja de ofertas, detalle
del pedido e invitación del personal. El backend arma esos enlaces con `URL_TIENDA`
(http://localhost:3001 en desarrollo), así que las rutas de arriba deben coincidir con las suyas.
Hoy el backend ya usa `/confirmar-correo?token=` (cuentas.service.ts) y `/personal/activar?token=`
(personal.service.ts); las demás se fijan cuando se implementen sus historias, en ambos repos.

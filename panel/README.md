# panel/

Componentes, hooks y consultas del panel de administración, agrupados por área. Las páginas de
`app/panel/` los importan. El panel funciona en computador y en celular (RNF-25).

| Carpeta           | Historias                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `diseno/`         | Menú lateral, barra superior, navegación inferior y rutas por rol (SCRUM-99)                                  |
| `pedidos/`        | Pedidos, cancelación y facturas por emitir (SCRUM-127, 130, 131)                                              |
| `catalogo/`       | Productos, formatos, fotos, precios, packs, marcas y categorías, sugerencia de IA (SCRUM-100 a 105, 132, 133) |
| `inventario/`     | Stock, movimientos, entradas, salidas, proveedores y stock bajo (SCRUM-110 a 115)                             |
| `verificaciones/` | Revisión manual de solicitudes (SCRUM-135)                                                                    |
| `campanas/`       | Campañas y saludo de cumpleaños (SCRUM-140, 141)                                                              |
| `reportes/`       | Objetivos, ventas, carritos y campañas, stock bajo (SCRUM-142 a 145)                                          |
| `personal/`       | Cuentas del personal y activación (SCRUM-98)                                                                  |

Crea cada carpeta cuando llegue su primera historia. Quien autoriza es el backend: el panel solo
oculta lo que el rol no puede usar.

/**
 * NO EDITAR: generado con `pnpm api:tipos` desde <API_URL>/api/docs-json.
 * Versión de la API: 0.1.0. Rutas: 49.
 */

export interface paths {
    "/api/salud": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Estado de la API, la base de datos y Redis */
        get: operations["SaludController_revisar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cuentas/registro": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Registrar una cuenta de cliente (E1-H1)
         * @description Crea la cuenta con el correo sin verificar y envía el enlace de confirmación.
         */
        post: operations["CuentasController_registrar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cuentas/confirmar-correo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirmar el correo con el token del enlace (E1-H1) */
        post: operations["CuentasController_confirmarCorreo"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cuentas/sesion": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Iniciar sesión con correo y contraseña (E1-H2)
         * @description Entrega el token de acceso y el rol, y deja el token de refresco en una cookie httpOnly.
         */
        post: operations["SesionController_iniciar"];
        /**
         * Cerrar sesión en este dispositivo (E1-H3)
         * @description Revoca la sesión de la cookie de refresco y la borra; su token de acceso deja de servir de inmediato. Sin cookie o con la sesión ya cerrada responde igual.
         */
        delete: operations["SesionController_cerrar"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cuentas/sesion/renovar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Renovar la sesión con la cookie de refresco
         * @description Entrega un token de acceso nuevo y cambia el token de refresco de la cookie por otro (cada uno sirve una vez). La sesión vence en la fecha del inicio de sesión: no se alarga.
         */
        post: operations["SesionController_renovar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cuentas/sesion/todas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Cerrar sesión en todos los dispositivos (E1-H3)
         * @description Revoca todas las sesiones de la cuenta, incluida esta; cada dispositivo deberá iniciar sesión de nuevo.
         */
        delete: operations["SesionController_cerrarTodas"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cuentas/yo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Ver mis datos personales (E1-H5) */
        get: operations["MiCuentaController_obtener"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Editar mis datos personales (E1-H5)
         * @description Guarda solo los datos enviados; null o texto vacío borra un dato opcional. El correo no se edita.
         */
        patch: operations["MiCuentaController_actualizar"];
        trace?: never;
    };
    "/api/cuentas/yo/direcciones": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar mis direcciones (E1-H5) */
        get: operations["DireccionesController_listar"];
        put?: never;
        /**
         * Agregar una dirección (E1-H5)
         * @description La primera dirección de la cuenta queda como principal.
         */
        post: operations["DireccionesController_crear"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cuentas/yo/direcciones/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Eliminar una dirección (E1-H5)
         * @description Si era la principal, la más reciente de las que quedan pasa a serlo.
         */
        delete: operations["DireccionesController_eliminar"];
        options?: never;
        head?: never;
        /** Editar una dirección (E1-H5) */
        patch: operations["DireccionesController_actualizar"];
        trace?: never;
    };
    "/api/cuentas/yo/direcciones/{id}/principal": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Marcar una dirección como principal (E1-H5)
         * @description Queda como la única principal de la cuenta.
         */
        patch: operations["DireccionesController_marcarPrincipal"];
        trace?: never;
    };
    "/api/cuentas/yo/facturacion": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar mis datos de facturación (E9-H2)
         * @description Todos los registros activos, para elegir uno al pedir factura.
         */
        get: operations["DatosFacturacionController_listar"];
        put?: never;
        /** Guardar datos de facturación (E9-H2) */
        post: operations["DatosFacturacionController_crear"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cuentas/yo/facturacion/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Eliminar datos de facturación (E9-H2)
         * @description Dejan de aparecer en la lista de la cuenta. Los pedidos que los usaron no cambian.
         */
        delete: operations["DatosFacturacionController_eliminar"];
        options?: never;
        head?: never;
        /** Editar datos de facturación (E9-H2) */
        patch: operations["DatosFacturacionController_actualizar"];
        trace?: never;
    };
    "/api/cuentas/recuperar-contrasena": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Solicitar el enlace para recuperar la contraseña (E1-H4)
         * @description Si el correo es de una cuenta activa, envía un enlace de un uso que vence. La respuesta es la misma aunque el correo no tenga cuenta.
         */
        post: operations["RecuperacionContrasenaController_solicitar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/cuentas/restablecer-contrasena": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Definir una contraseña nueva con el enlace de recuperación (E1-H4)
         * @description Deja el enlace sin efecto y cierra todas las sesiones abiertas de la cuenta.
         */
        post: operations["RecuperacionContrasenaController_restablecer"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/personal": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Listar las cuentas del personal (E13-H1) */
        get: operations["PersonalController_listar"];
        put?: never;
        /**
         * Crear una cuenta del personal (E13-H1)
         * @description Crea la cuenta con un único rol y envía la invitación para que la persona defina su contraseña.
         */
        post: operations["PersonalController_crear"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/personal/{codigoPublico}/invitacion": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reenviar la invitación (E13-H1)
         * @description Solo a cuentas activas que aún no definen su contraseña; el enlace anterior deja de servir.
         */
        post: operations["PersonalController_reenviarInvitacion"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/personal/{codigoPublico}/desactivar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Desactivar una cuenta del personal (E13-H1)
         * @description Cierra todas sus sesiones y le quita el acceso de inmediato. Desactivar una cuenta ya desactivada no hace nada.
         */
        post: operations["PersonalController_desactivar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/personal/invitacion/aceptar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Definir la contraseña con el enlace de la invitación (E13-H1) */
        post: operations["InvitacionPersonalController_aceptarInvitacion"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/inventario/proveedores": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar proveedores
         * @description Por defecto solo los activos, ordenados por razón social.
         */
        get: operations["ProveedoresController_listar"];
        put?: never;
        /**
         * Registrar un proveedor (E11-H1)
         * @description Guarda el proveedor con su RUT, razón social y datos de contacto, y queda disponible para las entradas de inventario.
         */
        post: operations["ProveedoresController_crear"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/inventario/entradas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Registrar una entrada de inventario (E11-H2)
         * @description Recibe el proveedor, la fecha de recepción, la factura o guía de despacho del proveedor, la ubicación de destino y, por cada formato (una sola vez), la cantidad y el costo unitario neto. Suma lo recibido al stock de la ubicación y deja un movimiento de entrada por formato ligado a la entrada, todo en una transacción.
         */
        post: operations["EntradasController_registrar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/inventario/salidas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Registrar una salida que no es venta (E11-H3)
         * @description Registra una merma por vencimiento, una merma por daño o un consumo en la peluquería de un formato en una ubicación. Descuenta la cantidad del stock de esa ubicación y deja un movimiento con el tipo de salida, en una transacción. El stock nunca queda bajo cero.
         */
        post: operations["SalidasController_registrar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/inventario/ajustes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Registrar un ajuste de stock (E11-H4)
         * @description Corrige la diferencia entre el conteo físico y el stock registrado de un formato en una ubicación. La cantidad lleva signo: positiva suma y negativa descuenta. Deja un movimiento ajuste_positivo o ajuste_negativo con el motivo, en una transacción. El stock nunca queda bajo cero.
         */
        post: operations["AjustesController_registrar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/inventario/transferencias": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Transferir stock entre ubicaciones (E11-H4)
         * @description Mueve unidades de un formato de una ubicación de origen a otra de destino (activa, de bodega activa), de la misma bodega o de otra. Resta en el origen, suma en el destino y deja un movimiento transferencia con ambas ubicaciones, en una transacción.
         */
        post: operations["TransferenciasController_registrar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/inventario/stock/bajo-minimo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Formatos con stock bajo el mínimo (E11-H6)
         * @description Aviso del panel: los formatos con stock mínimo definido cuyo stock total (todas las ubicaciones) está bajo él, del que más falta al que menos. Se calcula al consultar: un formato sale de la lista al reponerlo.
         */
        get: operations["StockController_bajoMinimo"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/inventario/stock/formatos/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Consultar el stock de un formato por ubicación (E11-H5)
         * @description Devuelve las unidades del formato en cada ubicación que tiene stock (también las desactivadas, marcadas como inactivas), el total y el proveedor y costo unitario neto de su entrada de recepción más reciente. Si el formato nunca se ha recibido, el total es 0 y la última entrada es nula.
         */
        get: operations["StockController_consultar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/catalogo/marcas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar marcas
         * @description Por defecto solo las activas, ordenadas por nombre.
         */
        get: operations["MarcasController_listar"];
        put?: never;
        /**
         * Crear una marca (E3-H4)
         * @description Guarda la marca y queda disponible en la lista de marcas al crear productos.
         */
        post: operations["MarcasController_crear"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/catalogo/categorias": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar el árbol de categorías
         * @description Categorías raíz con sus subcategorías anidadas, ordenadas por nombre.
         */
        get: operations["CategoriasController_listar"];
        put?: never;
        /**
         * Crear una categoría o subcategoría (E3-H4)
         * @description Con `padreId` crea una subcategoría dentro de esa categoría; sin él, una categoría raíz.
         */
        post: operations["CategoriasController_crear"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/catalogo/categorias/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Editar o mover una categoría (E3-H4)
         * @description Cambia el nombre, la descripción o el padre. `padreId: null` la deja como categoría raíz. Se rechaza mover una categoría dentro de ella misma o de una de sus subcategorías.
         */
        patch: operations["CategoriasController_actualizar"];
        trace?: never;
    };
    "/api/catalogo/productos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar productos
         * @description Por defecto solo los activos, ordenados por nombre y paginados. Se puede filtrar por texto, categoría y marca.
         */
        get: operations["ProductosController_listar"];
        put?: never;
        /**
         * Crear un producto (E3-H1)
         * @description Guarda el producto activo, con su categoría, su marca y su canal de venta (general o profesional). Los formatos, precios e imágenes se agregan en sus propias historias.
         */
        post: operations["ProductosController_crear"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/catalogo/productos/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Ver un producto */
        get: operations["ProductosController_obtener"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Editar un producto (E3-H1)
         * @description Cambia nombre, descripción, categoría, marca o canal de venta. Solo se modifica lo que llega; la marca se puede cambiar pero no quitar.
         */
        patch: operations["ProductosController_actualizar"];
        trace?: never;
    };
    "/api/catalogo/productos/{id}/desactivar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Desactivar un producto (E3-H1)
         * @description El producto deja de mostrarse en la tienda, pero no se borra. Repetir la acción no cambia nada.
         */
        patch: operations["ProductosController_desactivar"];
        trace?: never;
    };
    "/api/catalogo/productos/{id}/formatos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar los formatos de un producto (E3-H2)
         * @description Incluye la fecha de vencimiento, que solo se muestra en el panel. El predeterminado va primero.
         */
        get: operations["FormatosController_listar"];
        put?: never;
        /**
         * Agregar un formato de venta a un producto (E3-H2)
         * @description Guarda el formato activo, con su SKU, código de barras, contenido, peso, medidas, stock mínimo y fecha de vencimiento opcional. Nace sin precios (se fijan en E3-H5). El primer formato del producto queda como predeterminado.
         */
        post: operations["FormatosController_crear"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/catalogo/formatos/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Editar un formato de venta (E3-H2)
         * @description Solo se modifica lo que llega; `null` borra el código de barras, el contenido con su unidad o la fecha de vencimiento. Con `esPredeterminado: true` queda como el único predeterminado del producto.
         */
        patch: operations["FormatosController_actualizar"];
        trace?: never;
    };
    "/api/catalogo/articulos/{id}/imagenes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar las imágenes de un artículo (E3-H3)
         * @description En el orden en que se muestran, con su URL pública.
         */
        get: operations["ImagenesController_listar"];
        /**
         * Ordenar las imágenes y elegir la principal (E3-H3)
         * @description `orden` trae todas las imágenes del artículo, cada una una vez, en el nuevo orden; `principalId` queda como la única principal.
         */
        put: operations["ImagenesController_ordenar"];
        /**
         * Subir una imagen a un artículo (E3-H3)
         * @description Recibe una imagen JPEG, PNG o WebP de hasta 5 MB en el campo `imagen` (el tipo se reconoce por el contenido, no por la extensión). Queda al final del orden; la primera del artículo queda como principal. Un artículo tiene hasta 10 imágenes. El id del artículo es el del formato. Devuelve todas las imágenes del artículo.
         */
        post: operations["ImagenesController_subir"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/catalogo/articulos/{id}/imagenes/{imagenId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Eliminar una imagen de un artículo (E3-H3)
         * @description Las demás se reordenan sin huecos; si era la principal, la siguiente pasa a serlo. La única imagen del artículo no se puede eliminar. Devuelve las imágenes que quedan.
         */
        delete: operations["ImagenesController_eliminar"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/catalogo/packs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar los packs (E3-H6)
         * @description Packs ordenados por nombre y paginados, con sus componentes y si hoy están vigentes.
         */
        get: operations["PacksController_listar"];
        put?: never;
        /**
         * Crear un pack con sus formatos componentes (E3-H6)
         * @description Guarda el pack activo con su SKU, nombre, descripción, canal de venta, vigencia opcional (días incluidos, hora de Chile) y sus formatos componentes con sus cantidades. Nace sin precios (los fija el administrador en `PUT /catalogo/articulos/:id/precios`) y sin stock propio: su disponibilidad sale de sus componentes. Solo admite formatos de producto como componentes.
         */
        post: operations["PacksController_crear"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/catalogo/packs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Ver un pack (E3-H6) */
        get: operations["PacksController_obtener"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Editar un pack (E3-H6)
         * @description Solo se modifica lo que llega; `null` quita una fecha de vigencia y `componentes` reemplaza la lista completa con las mismas reglas que al crear.
         */
        patch: operations["PacksController_actualizar"];
        trace?: never;
    };
    "/api/catalogo/articulos/{id}/precios": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ver los precios de un artículo y su historial (E3-H5)
         * @description Precios netos vigentes, si el artículo es exclusivo para profesionales y el historial de cambios con su vigencia, quién los fijó y el motivo, del más reciente al más antiguo. El id del artículo es el del formato o del pack.
         */
        get: operations["PreciosController_listar"];
        /**
         * Fijar el precio minorista y el mayorista de un artículo (E3-H5)
         * @description Recibe uno o los dos precios netos (sin IVA) y el motivo; el precio que no llega no cambia. Cada precio que cambia cierra la vigencia del anterior y queda en el historial con quién lo fijó y el motivo; uno igual al vigente no se registra. Un artículo exclusivo para profesionales solo lleva precio mayorista. Devuelve los precios y el historial.
         */
        put: operations["PreciosController_fijar"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tienda/productos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Explorar, buscar y filtrar productos (E2-H1, E2-H2 y E2-H4)
         * @description Productos activos y a la venta, ordenados por nombre y paginados, con imagen, nombre y precio minorista con IVA. Con `categoriaId` incluye los de sus subcategorías. Con `buscar`, cada palabra debe estar en el nombre, la marca o la categoría (propia o superior), sin distinguir mayúsculas. Búsqueda y filtros se combinan; sin coincidencias devuelve una lista vacía. La sesión es opcional: con el token de una cuenta profesional se incluyen los productos exclusivos y cada producto trae además `precioMayorista` con IVA y `exclusivo` (`precio` es `null` en los exclusivos). Visitantes, clientes y personal ven solo los de venta general, sin precio mayorista.
         */
        get: operations["TiendaController_listarProductos"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tienda/productos/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detalle de un producto (E2-H3)
         * @description Producto con su descripción, marca, categoría y sus formatos a la venta (el predeterminado primero). Cada formato trae sus imágenes (la principal primero), el precio minorista con IVA y `disponibilidad`: `disponible` si hay stock en bodegas activas que abastecen la venta online, `agotado` si no; no se informan cantidades. La sesión es opcional: con el token de una cuenta profesional también se ven los productos exclusivos y cada formato trae `precioMayorista` con IVA (`precio` es `null` si el producto es exclusivo). Lo que la tienda no muestra a quien consulta responde 404.
         */
        get: operations["TiendaController_obtenerProducto"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tienda/packs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Detalle de un pack (E2-H3)
         * @description Pack vigente hoy (hora de Chile) con sus imágenes, precio minorista con IVA, componentes y `disponibilidad`: la de su componente más escaso, contando las unidades de cada formato que lleva el pack. La sesión es opcional: con el token de una cuenta profesional también se ven los packs exclusivos y se recibe `precioMayorista` con IVA y `exclusivo`. Lo que la tienda no muestra a quien consulta responde 404.
         */
        get: operations["TiendaController_obtenerPack"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tienda/packs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Packs de la tienda (E3-H6)
         * @description Packs activos, vigentes hoy (hora de Chile) y a la venta, ordenados por nombre y paginados, con imagen, precio minorista con IVA, último día de la promoción y sus componentes. Un pack fuera de su vigencia no se devuelve. La sesión es opcional: con el token de una cuenta profesional se incluyen los packs exclusivos y cada pack trae además `precioMayorista` con IVA y `exclusivo` (`precio` es `null` en los exclusivos).
         */
        get: operations["TiendaController_listarPacks"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tienda/categorias": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Árbol de categorías de la tienda (E2-H1)
         * @description Categorías raíz con sus subcategorías anidadas, ordenadas por nombre.
         */
        get: operations["TiendaController_listarCategorias"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/tienda/marcas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Marcas de la tienda (E2-H1)
         * @description Marcas activas, ordenadas por nombre.
         */
        get: operations["TiendaController_listarMarcas"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/carrito": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ver mi carrito con totales (E5-H1)
         * @description Líneas con precio unitario y subtotal con IVA, calculados al consultar según el rol (el profesional ve el mayorista), y el total. Cada línea indica si el artículo sigue a la venta y si el stock cubre la cantidad (sin informar cuántas unidades hay); si no, `impideCrearPedido` es `true` hasta que se quite o se ajuste la cantidad.
         */
        get: operations["CarritoController_obtener"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/carrito/items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Agregar un artículo al carrito (E5-H1)
         * @description Suma las unidades a las que el carrito ya tenga de ese artículo (formato o pack). El artículo debe venderse hoy a la cuenta y el stock debe cubrir la cantidad resultante. Devuelve el carrito con sus totales.
         */
        post: operations["CarritoController_agregar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/carrito/items/{articuloId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /**
         * Quitar un artículo del carrito (E5-H1)
         * @description Lo elimina aunque ya no se venda y devuelve el carrito con sus totales recalculados.
         */
        delete: operations["CarritoController_quitar"];
        options?: never;
        head?: never;
        /**
         * Cambiar la cantidad de un artículo del carrito (E5-H1)
         * @description Deja el artículo con la cantidad indicada, que debe cubrir el stock. Devuelve el carrito con sus totales recalculados.
         */
        patch: operations["CarritoController_cambiarCantidad"];
        trace?: never;
    };
    "/api/territorio/regiones": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar las regiones
         * @description Las 16 regiones de Chile de norte a sur, con su código CUT (decreto N° 1.115 de 2018).
         */
        get: operations["TerritorioController_listarRegiones"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/territorio/regiones/{codigoCut}/comunas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar las comunas de una región
         * @description Las comunas de la región, por nombre, con su código CUT. Las direcciones, el despacho y la facturación indican la comuna por ese código.
         */
        get: operations["TerritorioController_listarComunas"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        RegistrarCuentaDto: {
            /** @example Camila */
            nombre: string;
            /** @example Rojas */
            apellido: string;
            /** @example camila@correo.cl */
            email: string;
            /** @description Mínimo 8 caracteres, con al menos una letra y un número. */
            contrasena: string;
            /** @description Debe ser igual a la contraseña. */
            confirmacionContrasena: string;
            /** @example +56912345678 */
            telefono?: Record<string, never>;
            /**
             * @description Se guarda como 12345678-5.
             * @example 12.345.678-5
             */
            rut?: Record<string, never>;
            /**
             * Format: date
             * @example 1990-05-21
             */
            fechaNacimiento?: Record<string, never>;
            genero?: Record<string, never>;
        };
        ConfirmarCorreoDto: {
            /** @description Token recibido en el enlace del correo. */
            token: string;
        };
        IniciarSesionDto: {
            /** @example camila@correo.cl */
            email: string;
            contrasena: string;
        };
        ActualizarDatosDto: {
            /** @example Camila */
            nombre?: string;
            /** @example Rojas */
            apellido?: string;
            /** @example +56912345678 */
            telefono?: Record<string, never> | null;
            /**
             * @description Se guarda como 12345678-5. El profesional no puede cambiarlo ni borrarlo.
             * @example 12.345.678-5
             */
            rut?: Record<string, never> | null;
            /**
             * Format: date
             * @example 1990-05-21
             */
            fechaNacimiento?: Record<string, never> | null;
            genero?: Record<string, never> | null;
        };
        CrearDireccionDto: {
            /** @example Av. Providencia */
            calle: string;
            /** @example 1234 */
            numero: string;
            /** @example Depto. 501 */
            referencia?: Record<string, never>;
            /**
             * @description Código CUT de la comuna.
             * @example 13123
             */
            comuna: string;
            /** @description Dejarla como principal. La primera dirección de la cuenta siempre queda como principal. */
            esPrincipal?: boolean;
        };
        ActualizarDireccionDto: {
            /** @example Av. Providencia */
            calle?: string;
            /** @example 1234 */
            numero?: string;
            /** @example Depto. 501 */
            referencia?: Record<string, never> | null;
            /**
             * @description Código CUT de la comuna.
             * @example 13123
             */
            comuna?: string;
        };
        CrearDatosFacturacionDto: {
            /**
             * @description RUT de quien recibe la factura. Se guarda como 76086429-3.
             * @example 76.086.429-3
             */
            rut: string;
            /** @example Peluquería Los Aromos SpA */
            razonSocial: string;
            /** @example Servicios de peluquería */
            giro: string;
            /** @example Av. Providencia 1234, oficina 5 */
            direccion: string;
            /**
             * @description Código CUT de la comuna.
             * @example 13123
             */
            comuna: string;
            /**
             * @description Correo al que se enviará el documento, si es distinto al de la cuenta.
             * @example facturas@losaromos.cl
             */
            correoFacturacion?: Record<string, never> | null;
        };
        ActualizarDatosFacturacionDto: {
            /** @example 76.086.429-3 */
            rut?: string;
            /** @example Peluquería Los Aromos SpA */
            razonSocial?: string;
            /** @example Servicios de peluquería */
            giro?: string;
            /** @example Av. Providencia 1234, oficina 5 */
            direccion?: string;
            /**
             * @description Código CUT de la comuna.
             * @example 13123
             */
            comuna?: string;
            /** @example facturas@losaromos.cl */
            correoFacturacion?: Record<string, never> | null;
        };
        SolicitarRecuperacionDto: {
            /** @example camila@correo.cl */
            email: string;
        };
        RestablecerContrasenaDto: {
            /** @description Token recibido en el enlace de recuperación. */
            token: string;
            /** @description Mínimo 8 caracteres, con al menos una letra y un número. */
            contrasena: string;
            /** @description Debe ser igual a la contraseña. */
            confirmacionContrasena: string;
        };
        CrearPersonalDto: {
            /** @example Javiera */
            nombre: string;
            /** @example Muñoz */
            apellido: string;
            /** @example javiera@cabelloperfecto.cl */
            email: string;
            /**
             * @example vendedor
             * @enum {string}
             */
            rol: "vendedor" | "bodeguero" | "administrador";
        };
        AceptarInvitacionDto: {
            /** @description Token recibido en el enlace de la invitación. */
            token: string;
            /** @description Mínimo 8 caracteres, con al menos una letra y un número. */
            contrasena: string;
            /** @description Debe ser igual a la contraseña. */
            confirmacionContrasena: string;
        };
        CrearProveedorDto: {
            /**
             * @description Con o sin puntos y guion. Se guarda como 76086428-5.
             * @example 76.086.428-5
             */
            rut: string;
            /** @example Distribuidora Capilar SpA */
            razonSocial: string;
            /** @example Marcela Soto */
            nombreContacto?: Record<string, never>;
            /** @example +56412345678 */
            telefono?: Record<string, never>;
            /** @example ventas@distribuidora.cl */
            email?: Record<string, never>;
        };
        DetalleEntradaDto: {
            /**
             * @description Id del formato recibido.
             * @example 11
             */
            formatoId: number;
            /** @example 24 */
            cantidad: number;
            /**
             * @description Costo unitario neto (sin IVA), con hasta dos decimales. Puede ser 0 (muestras sin costo).
             * @example 3500
             */
            costoUnitarioNeto: number;
        };
        CrearEntradaDto: {
            /**
             * @description Id del proveedor (activo).
             * @example 3
             */
            proveedorId: number;
            /**
             * Format: date
             * @description Fecha de recepción; no puede ser posterior a hoy.
             * @example 2026-10-24
             */
            fechaRecepcion: string;
            /**
             * @description Documento con que el proveedor entregó la mercadería.
             * @example factura
             * @enum {string}
             */
            tipoDocumento: "factura" | "guia_despacho";
            /**
             * @description Se guarda sin espacios y en mayúsculas: «f-123 45» y «F-12345» son el mismo documento.
             * @example F-12345
             */
            numeroDocumento: string;
            /**
             * @description Id de la ubicación donde queda todo lo recibido.
             * @example 1
             */
            ubicacionId: number;
            /** @example Llegó una caja abierta */
            observacion?: Record<string, never> | null;
            /** @description Formatos recibidos; cada uno una sola vez. */
            detalles: components["schemas"]["DetalleEntradaDto"][];
        };
        CrearSalidaDto: {
            /**
             * @description Id del formato que sale.
             * @example 11
             */
            formatoId: number;
            /**
             * @description Id de la ubicación de la que sale el stock.
             * @example 1
             */
            ubicacionId: number;
            /**
             * @example merma_dano
             * @enum {string}
             */
            tipo: "merma_vencimiento" | "merma_dano" | "consumo_peluqueria";
            /** @example 2 */
            cantidad: number;
            /** @example Envase roto al reponer */
            observacion?: Record<string, never> | null;
        };
        CrearAjusteDto: {
            /**
             * @description Id del formato que se ajusta.
             * @example 11
             */
            formatoId: number;
            /**
             * @description Id de la ubicación cuyo stock se ajusta.
             * @example 1
             */
            ubicacionId: number;
            /**
             * @description Diferencia con el stock registrado: positiva suma, negativa descuenta. Nunca 0.
             * @example -2
             */
            cantidad: number;
            /**
             * @description Motivo del ajuste; queda en la observación del movimiento.
             * @example Conteo físico del 25 de octubre: faltan 2 unidades
             */
            observacion: string;
        };
        CrearTransferenciaDto: {
            /**
             * @description Id del formato que se mueve.
             * @example 11
             */
            formatoId: number;
            /**
             * @description Id de la ubicación de la que sale el stock.
             * @example 1
             */
            ubicacionOrigenId: number;
            /**
             * @description Id de la ubicación que recibe el stock (activa, de bodega activa).
             * @example 2
             */
            ubicacionDestinoId: number;
            /** @example 5 */
            cantidad: number;
            /** @example Reposición de la góndola */
            observacion?: Record<string, never> | null;
        };
        CrearMarcaDto: {
            /** @example L'Oréal Professionnel */
            nombre: string;
        };
        CrearCategoriaDto: {
            /** @example Shampoos */
            nombre: string;
            /** @example Limpieza y cuidado del cuero cabelludo */
            descripcion?: Record<string, never>;
            /**
             * @description Id de la categoría que la contiene. Sin él, queda como categoría raíz.
             * @example 1
             */
            padreId?: number;
        };
        ActualizarCategoriaDto: {
            /** @example Shampoos */
            nombre?: string;
            /** @example Limpieza y cuidado del cuero cabelludo */
            descripcion?: Record<string, never> | null;
            /**
             * @description Id de la nueva categoría padre. `null` la deja como categoría raíz. No puede ser ella misma ni una de sus subcategorías.
             * @example 2
             */
            padreId?: Record<string, never> | null;
        };
        CrearProductoDto: {
            /** @example Shampoo reparador */
            nombre: string;
            /** @example Repara el cabello dañado por procesos químicos. */
            descripcion: string;
            /**
             * @description Id de la categoría o subcategoría del producto.
             * @example 1
             */
            categoriaId: number;
            /**
             * @description Id de una marca activa de la lista de marcas. Es obligatoria.
             * @example 1
             */
            marcaId: number;
            /**
             * @description Canal de venta del producto: general o profesional.
             * @example general
             * @enum {string}
             */
            canalVenta: "general" | "profesional";
        };
        ActualizarProductoDto: {
            /** @example Shampoo reparador */
            nombre?: string;
            descripcion?: string;
            /** @example 2 */
            categoriaId?: number;
            /**
             * @description Id de una marca activa. La marca es obligatoria: se puede cambiar, no quitar.
             * @example 1
             */
            marcaId?: number;
            /**
             * @example general
             * @enum {string}
             */
            canalVenta?: "general" | "profesional";
        };
        CrearFormatoDto: {
            /** @example SHA-REP-300 */
            sku: string;
            /**
             * @description 8, 12, 13 o 14 dígitos. Único entre todos los formatos.
             * @example 7801234567890
             */
            codigoBarras?: Record<string, never> | null;
            /** @example 300 ml */
            nombreFormato: string;
            /** @example 300 */
            contenido?: Record<string, never> | null;
            /**
             * @example ml
             * @enum {string|null}
             */
            unidadMedida?: "ml" | "g" | "unidades" | null;
            /**
             * Format: date
             * @description Opcional. Solo se muestra en el panel; no se usa para vender ni para avisar.
             * @example 2027-12-31
             */
            fechaVencimiento?: Record<string, never> | null;
            /**
             * @default 0
             * @example 5
             */
            stockMinimo?: number;
            /**
             * @description Peso en gramos.
             * @example 320
             */
            pesoGramos: number;
            /**
             * @description Centímetros.
             * @example 18.5
             */
            altoCm: number;
            /**
             * @description Centímetros.
             * @example 6
             */
            anchoCm: number;
            /**
             * @description Centímetros.
             * @example 4
             */
            largoCm: number;
            /** @description Con `true` queda como el único predeterminado del producto. El primer formato de un producto siempre lo es. */
            esPredeterminado?: boolean;
        };
        ActualizarFormatoDto: {
            /** @example SHA-REP-300 */
            sku?: string;
            /** @example 7801234567890 */
            codigoBarras?: Record<string, never> | null;
            /** @example 300 ml */
            nombreFormato?: string;
            /** @example 300 */
            contenido?: Record<string, never> | null;
            /** @enum {string|null} */
            unidadMedida?: "ml" | "g" | "unidades" | null;
            /**
             * Format: date
             * @example 2027-12-31
             */
            fechaVencimiento?: Record<string, never> | null;
            /** @example 5 */
            stockMinimo?: number;
            /** @example 320 */
            pesoGramos?: number;
            /** @example 18.5 */
            altoCm?: number;
            /** @example 6 */
            anchoCm?: number;
            /** @example 4 */
            largoCm?: number;
            /** @description Con `true` queda como el único predeterminado del producto. No se puede desmarcar: se marca otro. */
            esPredeterminado?: boolean;
        };
        OrdenarImagenesDto: {
            /**
             * @description Ids de todas las imágenes del artículo, cada una una vez, en el orden en que se mostrarán.
             * @example [
             *       42,
             *       40,
             *       41
             *     ]
             */
            orden: number[];
            /**
             * @description Id de la imagen que queda como principal.
             * @example 42
             */
            principalId: number;
        };
        ComponentePackDto: {
            /**
             * @description Id del formato de producto. Otro pack no se admite.
             * @example 11
             */
            formatoId: number;
            /** @example 2 */
            cantidad: number;
        };
        CrearPackDto: {
            /** @example PACK-REP-DUO */
            sku: string;
            /** @example Dúo reparador */
            nombre: string;
            /** @example Shampoo y acondicionador reparador a precio de promoción. */
            descripcion: string;
            /**
             * @description Canal de venta del pack. Un pack general no puede llevar formatos de productos exclusivos para profesionales.
             * @example general
             * @enum {string}
             */
            canalVenta: "general" | "profesional";
            /**
             * Format: date
             * @description Primer día en que el pack se muestra en la tienda (hora de Chile).
             * @example 2026-11-01
             */
            fechaInicioVigencia?: Record<string, never> | null;
            /**
             * Format: date
             * @description Último día en que el pack se muestra en la tienda (hora de Chile). No puede ser anterior al inicio.
             * @example 2026-11-30
             */
            fechaFinVigencia?: Record<string, never> | null;
            /** @description Formatos del pack con sus cantidades; cada formato una sola vez y al menos 2 unidades en total. */
            componentes: components["schemas"]["ComponentePackDto"][];
        };
        ActualizarPackDto: {
            /** @example PACK-REP-DUO */
            sku?: string;
            /** @example Dúo reparador */
            nombre?: string;
            descripcion?: string;
            /**
             * @example general
             * @enum {string}
             */
            canalVenta?: "general" | "profesional";
            /**
             * Format: date
             * @description `null` quita el inicio de la vigencia.
             * @example 2026-11-01
             */
            fechaInicioVigencia?: Record<string, never> | null;
            /**
             * Format: date
             * @description `null` quita el término de la vigencia.
             * @example 2026-11-30
             */
            fechaFinVigencia?: Record<string, never> | null;
            /** @description Reemplaza todos los componentes; cada formato una sola vez y al menos 2 unidades en total. */
            componentes?: components["schemas"]["ComponentePackDto"][];
        };
        FijarPreciosDto: {
            /**
             * @description Precio minorista neto (sin IVA), con hasta dos decimales. No se admite en un artículo exclusivo para profesionales.
             * @example 8403.36
             */
            precioMinoristaNeto?: number;
            /**
             * @description Precio mayorista neto (sin IVA), con hasta dos decimales.
             * @example 6722.69
             */
            precioMayoristaNeto?: number;
            /** @example Alza del proveedor */
            motivo: string;
        };
        AgregarArticuloCarritoDto: {
            /**
             * @description Id del artículo: el de un formato de producto o el de un pack.
             * @example 11
             */
            articuloId: number;
            /**
             * @description Unidades que se suman a las que el carrito ya tiene de ese artículo.
             * @example 2
             */
            cantidad: number;
        };
        CambiarCantidadCarritoDto: {
            /**
             * @description Cantidad final del artículo en el carrito. Para quitarlo se usa DELETE.
             * @example 3
             */
            cantidad: number;
        };
        UbicacionOficialDto: {
            /**
             * @description Código Único Territorial: 2 dígitos la región, 5 la comuna.
             * @example 13123
             */
            codigoCut: string;
            /** @example Providencia */
            nombre: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    SaludController_revisar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CuentasController_registrar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegistrarCuentaDto"];
            };
        };
        responses: {
            /** @description Cuenta creada; correo encolado. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos o contraseñas distintas. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El correo o el RUT ya está registrado. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 5 peticiones por minuto desde la misma IP. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CuentasController_confirmarCorreo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfirmarCorreoDto"];
            };
        };
        responses: {
            /** @description Correo verificado. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Enlace inválido, usado o vencido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 5 peticiones por minuto desde la misma IP. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SesionController_iniciar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["IniciarSesionDto"];
            };
        };
        responses: {
            /** @description Sesión iniciada. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Correo o contraseña incorrectos. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cuenta desactivada o con el correo sin confirmar. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description 5 intentos fallidos del mismo correo (o 20 desde la IP) en 15 minutos. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SesionController_cerrar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Sesión cerrada. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 30 cierres por minuto desde la IP. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SesionController_renovar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Sesión renovada. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin cookie, o con la sesión cerrada, vencida o de una cuenta desactivada; borra la cookie. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 30 renovaciones por minuto desde la IP. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SesionController_cerrarTodas: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Sesiones cerradas. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin token de acceso válido o con la sesión ya cerrada. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MiCuentaController_obtener: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Datos de la cuenta. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cuenta del personal de tienda. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MiCuentaController_actualizar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ActualizarDatosDto"];
            };
        };
        responses: {
            /** @description Datos guardados; devuelve la cuenta. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cambio de RUT de un profesional o con una verificación en curso. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El RUT está en otra cuenta. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 10 ediciones por hora en la cuenta. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DireccionesController_listar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Direcciones, la principal primero. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cuenta del personal de tienda. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DireccionesController_crear: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearDireccionDto"];
            };
        };
        responses: {
            /** @description Dirección guardada. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos o comuna inexistente. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cuenta del personal de tienda. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DireccionesController_eliminar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Dirección eliminada. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cuenta del personal de tienda. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La dirección no es de la cuenta. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DireccionesController_actualizar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ActualizarDireccionDto"];
            };
        };
        responses: {
            /** @description Dirección guardada. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos o comuna inexistente. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cuenta del personal de tienda. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La dirección no es de la cuenta. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DireccionesController_marcarPrincipal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Dirección principal. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cuenta del personal de tienda. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La dirección no es de la cuenta. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DatosFacturacionController_listar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Registros de facturación de la cuenta. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cuenta del personal de tienda. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DatosFacturacionController_crear: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearDatosFacturacionDto"];
            };
        };
        responses: {
            /** @description Datos guardados. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta algún dato obligatorio, hay datos inválidos o la comuna no existe. El mensaje indica cuáles. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cuenta del personal de tienda. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DatosFacturacionController_eliminar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Datos eliminados de la lista. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cuenta del personal de tienda. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El registro no es de la cuenta o ya fue eliminado. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DatosFacturacionController_actualizar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ActualizarDatosFacturacionDto"];
            };
        };
        responses: {
            /** @description Datos guardados. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos o comuna inexistente. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cuenta del personal de tienda. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El registro no es de la cuenta o ya fue eliminado. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RecuperacionContrasenaController_solicitar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SolicitarRecuperacionDto"];
            };
        };
        responses: {
            /** @description Solicitud recibida. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Correo inválido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 5 peticiones en 15 minutos desde la misma IP. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RecuperacionContrasenaController_restablecer: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RestablecerContrasenaDto"];
            };
        };
        responses: {
            /** @description Contraseña actualizada. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Contraseña inválida o distinta, o enlace inválido, usado o vencido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 5 peticiones en 15 minutos desde la misma IP. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PersonalController_listar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Cuentas activas y desactivadas. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Solo el administrador. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PersonalController_crear: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearPersonalDto"];
            };
        };
        responses: {
            /** @description Cuenta creada; invitación encolada. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos o rol no permitido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Solo el administrador. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El correo ya está registrado. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PersonalController_reenviarInvitacion: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                codigoPublico: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Invitación encolada. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Solo el administrador. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No existe esa cuenta del personal. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La cuenta está desactivada o ya definió su contraseña. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PersonalController_desactivar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                codigoPublico: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Cuenta desactivada. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Solo el administrador. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No existe esa cuenta del personal. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Es la propia cuenta. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    InvitacionPersonalController_aceptarInvitacion: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AceptarInvitacionDto"];
            };
        };
        responses: {
            /** @description Contraseña definida. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Contraseña inválida o distinta, o enlace inválido, usado o vencido. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 5 peticiones por minuto desde la misma IP. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProveedoresController_listar: {
        parameters: {
            query?: {
                /** @description Con `true` incluye también los proveedores desactivados. */
                incluirInactivos?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lista de proveedores. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de proveedores. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProveedoresController_crear: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearProveedorDto"];
            };
        };
        responses: {
            /** @description Proveedor registrado. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de proveedores. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ya existe un proveedor con ese RUT. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    EntradasController_registrar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearEntradaDto"];
            };
        };
        responses: {
            /** @description Entrada registrada. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Faltan datos o son inválidos, un formato está repetido, la fecha es futura, o el proveedor, la ubicación o algún formato no existe o está desactivado. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de registrar inventario. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ya hay una entrada con ese documento del proveedor. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SalidasController_registrar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearSalidaDto"];
            };
        };
        responses: {
            /** @description Salida registrada. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Faltan datos o son inválidos, el formato o la ubicación no existe, o la cantidad supera el stock de la ubicación. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de registrar inventario. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AjustesController_registrar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearAjusteDto"];
            };
        };
        responses: {
            /** @description Ajuste registrado. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Faltan datos o son inválidos (cantidad 0 o sin motivo), el formato o la ubicación no existe, o el ajuste negativo supera el stock de la ubicación. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de registrar inventario. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TransferenciasController_registrar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearTransferenciaDto"];
            };
        };
        responses: {
            /** @description Transferencia registrada. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Faltan datos o son inválidos, el origen y el destino son la misma ubicación, el formato o una ubicación no existe, el destino está desactivado, o la cantidad supera el stock del origen. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de registrar inventario. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    StockController_bajoMinimo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Formatos bajo su stock mínimo. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de consultar inventario. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    StockController_consultar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Stock del formato. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de consultar inventario. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El formato no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarcasController_listar: {
        parameters: {
            query?: {
                /** @description Con `true` incluye también las marcas desactivadas. */
                incluirInactivas?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lista de marcas. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MarcasController_crear: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearMarcaDto"];
            };
        };
        responses: {
            /** @description Marca creada. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ya existe una marca con ese nombre. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CategoriasController_listar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Árbol de categorías. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CategoriasController_crear: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearCategoriaDto"];
            };
        };
        responses: {
            /** @description Categoría creada. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La categoría padre no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CategoriasController_actualizar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ActualizarCategoriaDto"];
            };
        };
        responses: {
            /** @description Categoría actualizada. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos o cuerpo vacío. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La categoría o su nuevo padre no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El movimiento formaría un ciclo. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProductosController_listar: {
        parameters: {
            query?: {
                pagina?: number;
                limite?: number;
                /** @description Texto contenido en el nombre, sin distinguir mayúsculas. */
                buscar?: string;
                /** @description Solo productos de esta categoría. */
                categoriaId?: number;
                /** @description Solo productos de esta marca. */
                marcaId?: number;
                /** @description Con `true` incluye también los productos desactivados. */
                incluirInactivos?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Página de productos con el total. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Filtros inválidos. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProductosController_crear: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearProductoDto"];
            };
        };
        responses: {
            /** @description Producto creado. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos o marca desactivada. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La categoría o la marca no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProductosController_obtener: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Producto con su marca y categoría. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El producto no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProductosController_actualizar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ActualizarProductoDto"];
            };
        };
        responses: {
            /** @description Producto actualizado. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos, cuerpo vacío o marca desactivada. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El producto, la categoría o la marca no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProductosController_desactivar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Producto desactivado. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El producto no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FormatosController_listar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Formatos del producto. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El producto no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FormatosController_crear: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearFormatoDto"];
            };
        };
        responses: {
            /** @description Formato creado. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos o contenido sin su unidad de medida. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El producto no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El SKU o el código de barras ya pertenece a otro artículo. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    FormatosController_actualizar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ActualizarFormatoDto"];
            };
        };
        responses: {
            /** @description Formato actualizado. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos, cuerpo vacío, contenido sin su unidad o intento de desmarcar el predeterminado. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El formato no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El SKU o el código de barras ya pertenece a otro artículo. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ImagenesController_listar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Imágenes del artículo. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El artículo o la imagen no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ImagenesController_ordenar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OrdenarImagenesDto"];
            };
        };
        responses: {
            /** @description Imágenes en su nuevo orden. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El orden no trae exactamente las imágenes del artículo, o la principal no es una de ellas. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El artículo o la imagen no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ImagenesController_subir: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    imagen: string;
                };
            };
        };
        responses: {
            /** @description Imagen agregada. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin imagen, o el archivo no es JPEG, PNG ni WebP. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El artículo o la imagen no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El artículo ya tiene 10 imágenes. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La imagen supera los 5 MB. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El almacenamiento de imágenes no está configurado. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ImagenesController_eliminar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
                imagenId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Imagen eliminada. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El artículo o la imagen no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Es la única imagen del artículo. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PacksController_listar: {
        parameters: {
            query?: {
                pagina?: number;
                limite?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Página de packs con el total. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Paginación inválida. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PacksController_crear: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearPackDto"];
            };
        };
        responses: {
            /** @description Pack creado. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos, vigencia al revés, otro pack como componente, un formato inexistente o desactivado, o un formato exclusivo en un pack general. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El SKU ya pertenece a otro artículo. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PacksController_obtener: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description El pack con sus componentes. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El pack no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PacksController_actualizar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ActualizarPackDto"];
            };
        };
        responses: {
            /** @description Pack actualizado. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos, cuerpo vacío, vigencia al revés o componentes no permitidos. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar el catálogo. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El pack no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El SKU ya pertenece a otro artículo. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PreciosController_listar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Precios del artículo. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar los precios. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El artículo no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PreciosController_fijar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["FijarPreciosDto"];
            };
        };
        responses: {
            /** @description Precios aplicados. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos, sin ningún precio o con precio minorista en un artículo exclusivo. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar los precios. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El artículo no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TiendaController_listarProductos: {
        parameters: {
            query?: {
                pagina?: number;
                limite?: number;
                /** @description Texto a buscar, sin distinguir mayúsculas. Cada palabra debe estar en el nombre del producto, en su marca o en su categoría o subcategoría. Hasta 5 palabras. Vacío no filtra. */
                buscar?: string;
                /** @description Productos de esta categoría y de todas sus subcategorías, a cualquier profundidad. */
                categoriaId?: number;
                /** @description Solo productos de esta marca. */
                marcaId?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Página de productos con el total. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Filtros inválidos. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Llegó un token de acceso inválido, vencido o de una sesión cerrada. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La categoría no existe, o la marca no existe o no está activa. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TiendaController_obtenerProducto: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Detalle del producto. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Llegó un token de acceso inválido, vencido o de una sesión cerrada. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El producto no existe, no está a la venta o es exclusivo para profesionales. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TiendaController_obtenerPack: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Detalle del pack. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Llegó un token de acceso inválido, vencido o de una sesión cerrada. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El pack no existe, no está vigente, no está a la venta o es exclusivo para profesionales. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TiendaController_listarPacks: {
        parameters: {
            query?: {
                pagina?: number;
                limite?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Página de packs con el total. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Paginación inválida. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Llegó un token de acceso inválido, vencido o de una sesión cerrada. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TiendaController_listarCategorias: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Árbol de categorías. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TiendaController_listarMarcas: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Lista de marcas. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CarritoController_obtener: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Carrito de la cuenta; vacío si no tiene. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cuenta del personal de tienda. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CarritoController_agregar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AgregarArticuloCarritoDto"];
            };
        };
        responses: {
            /** @description Carrito actualizado. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos inválidos, el artículo no existe o no está a la venta, o el stock no alcanza. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cuenta del personal de tienda. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CarritoController_quitar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                articuloId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Carrito actualizado. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cuenta del personal de tienda. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El artículo no está en el carrito. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CarritoController_cambiarCantidad: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                articuloId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CambiarCantidadCarritoDto"];
            };
        };
        responses: {
            /** @description Carrito actualizado. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cantidad inválida, el artículo ya no está a la venta o el stock no alcanza. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cuenta del personal de tienda. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El artículo no está en el carrito. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TerritorioController_listarRegiones: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UbicacionOficialDto"][];
                };
            };
        };
    };
    TerritorioController_listarComunas: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Código CUT de la región. */
                codigoCut: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UbicacionOficialDto"][];
                };
            };
            /** @description La región no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}

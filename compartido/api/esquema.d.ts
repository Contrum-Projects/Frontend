/**
 * NO EDITAR: generado con `pnpm api:tipos` desde <API_URL>/api/docs-json.
 * Versión de la API: 0.1.0. Rutas: 119.
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
    "/api/cuentas/{codigoPublico}/rol": {
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
         * Bajar el rol de una cuenta (E13-H3)
         * @description Un administrador pasa a vendedor o bodeguero; un profesional, a cliente (con motivo, que se le envía por correo). Rige de inmediato: cierra todas las sesiones de la cuenta. Los pedidos ya creados conservan sus montos.
         */
        patch: operations["CambioRolController_cambiar"];
        trace?: never;
    };
    "/api/clientes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar clientes y profesionales (E13-H4)
         * @description Paginado, más recientes primero. Busca en el nombre, el apellido, el correo o el RUT y filtra por rol y estado; `conteos` son los números de los filtros con la búsqueda aplicada.
         */
        get: operations["ClientesController_listar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/clientes/{codigoPublico}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ver una cuenta de cliente o profesional (E13-H4)
         * @description Sus datos, el perfil profesional, la solicitud de verificación más reciente, cuántos pedidos creó y su historial de rol.
         */
        get: operations["ClientesController_detalle"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/clientes/{codigoPublico}/desactivar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Desactivar una cuenta de cliente o profesional (E13-H4)
         * @description Cierra todas sus sesiones y le quita el acceso de inmediato. Pedidos, carrito, verificación y suscripciones no cambian. Desactivar una cuenta ya desactivada no hace nada.
         */
        post: operations["ClientesController_desactivar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/clientes/{codigoPublico}/reactivar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Reactivar una cuenta de cliente o profesional (E13-H4)
         * @description Vuelve a iniciar sesión con su contraseña de siempre. Reactivar una cuenta activa no hace nada.
         */
        post: operations["ClientesController_reactivar"];
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
        /**
         * Listar las entradas de inventario (E11-H2)
         * @description De la recepción más reciente a la más antigua (el mismo día, la registrada después), con proveedor, documento, ubicación de destino, formatos, unidades, costo neto total y quién la registró. Filtra por bodega de destino, por razón social o número de documento y por fecha de recepción.
         */
        get: operations["EntradasController_listar"];
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
    "/api/inventario/stock": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar el stock por formato (E11-H5)
         * @description Un formato por fila (también los desactivados y los que nunca se recibieron, con stock 0), por producto y formato. Con `bodegaId`, solo los formatos con unidades en esa bodega, y sus ubicaciones y stock son los de ella. `bajoMinimo` sigue la regla del aviso (E11-H6): el stock total en todas las ubicaciones bajo un mínimo mayor que 0; `stockMinimo: 0` es «sin mínimo». Lleva el costo unitario neto y el proveedor de la entrada más reciente, o `null` si nunca se recibió.
         */
        get: operations["StockController_listar"];
        put?: never;
        post?: never;
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
    "/api/inventario/ubicaciones": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar las ubicaciones activas (E11)
         * @description Ubicaciones activas de bodegas activas, ordenadas por bodega y código: el destino de una entrada, un ajuste o una transferencia, y el filtro por bodega del inventario.
         */
        get: operations["UbicacionesController_listar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/inventario/bodegas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar las bodegas con sus ubicaciones (SCRUM-151)
         * @description Todas, también las desactivadas, por nombre; cada una con sus ubicaciones por código y las unidades que guarda.
         */
        get: operations["BodegasController_listar"];
        put?: never;
        /** Crear una bodega (SCRUM-151) */
        post: operations["BodegasController_crear"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/inventario/bodegas/{id}": {
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
         * Editar o desactivar una bodega (SCRUM-151)
         * @description Con stock en alguna de sus ubicaciones no se desactiva (409).
         */
        patch: operations["BodegasController_actualizar"];
        trace?: never;
    };
    "/api/inventario/bodegas/{id}/ubicaciones": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Agregar una ubicación a la bodega (SCRUM-151)
         * @description Devuelve la bodega con sus ubicaciones.
         */
        post: operations["BodegasController_crearUbicacion"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/inventario/bodegas/{id}/ubicaciones/{ubicacionId}": {
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
         * Editar o desactivar una ubicación (SCRUM-151)
         * @description Con stock no se desactiva (409). Devuelve la bodega con sus ubicaciones.
         */
        patch: operations["BodegasController_actualizarUbicacion"];
        trace?: never;
    };
    "/api/inventario/movimientos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar los movimientos de inventario (E11-H5)
         * @description Del más reciente al más antiguo: entradas, ventas, mermas, consumo, ajustes, transferencias y reingresos, con su referencia y quién los registró (`null` en ventas y reingresos, que registra el sistema). Filtra por bodega (origen o destino), grupo, período en hora de Chile y búsqueda.
         */
        get: operations["MovimientosController_listar"];
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
    "/api/catalogo/marcas/{id}": {
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
         * Borrar una marca que ya no se usa (SCRUM-158)
         * @description Solo si ningún producto, cupón ni imagen de la portada la usa; si no, 409 con dónde se usa.
         */
        delete: operations["MarcasController_eliminar"];
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
        /**
         * Borrar una categoría que ya no se usa (SCRUM-158)
         * @description Solo si no tiene productos, subcategorías, cupones ni imágenes de la portada; si no, 409 con dónde se usa.
         */
        delete: operations["CategoriasController_eliminar"];
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
         * @description Por defecto solo los activos, ordenados por nombre y paginados. Busca en el nombre, la marca o el SKU y filtra por categoría, marca, canal, stock bajo e inactivos. Cada fila trae su foto, formatos activos, precio desde (con IVA, del canal del producto), stock total y si está bajo el mínimo; `conteos` son los números de los chips.
         */
        get: operations["ProductosController_listar"];
        put?: never;
        /**
         * Crear un producto (E3-H1, E4-H2)
         * @description Guarda el producto activo, con su categoría, su marca y su canal de venta (general o profesional). Los formatos, precios e imágenes se agregan en sus propias historias. Si la descripción partió de una sugerencia de la IA, envía `sugerencia` (texto sugerido y su firma): igual a la sugerida queda con origen «ia» y cambiada con «ia_editada»; sin `sugerencia` es «manual». La sugerencia nunca se guarda sola: solo lo que se envía aquí.
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
         * Editar un producto (E3-H1, E4-H2)
         * @description Cambia nombre, descripción, ingredientes, categoría, marca o canal de venta. Solo se modifica lo que llega; la marca se puede cambiar pero no quitar. Con `sugerencia` (exige `descripcion`) el origen se decide como al crear; sin ella, una descripción de origen «ia» que cambia pasa a «ia_editada».
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
    "/api/catalogo/formatos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Buscar formatos de venta (E3-H6 y registro de inventario)
         * @description Solo formatos activos de productos activos, nunca packs, por nombre del producto, nombre del formato o SKU, ordenados por producto y formato. Lleva el stock en ubicaciones activas y el precio minorista (neto y con IVA). La usan quienes gestionan el catálogo (armar packs) y quienes registran inventario (entradas, salidas, ajustes y transferencias).
         */
        get: operations["FormatosController_buscar"];
        put?: never;
        post?: never;
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
         * @description Recibe una imagen JPEG, PNG o WebP de hasta 4 MB en el campo `imagen` (el tipo se reconoce por el contenido, no por la extensión). Queda al final del orden; la primera del artículo queda como principal. Un artículo tiene hasta 10 imágenes. El id del artículo es el del formato. Devuelve todas las imágenes del artículo.
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
    "/api/catalogo/descripciones/sugerencia": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Sugerir la descripción y los ingredientes desde la foto del reverso (E4-H1)
         * @description Recibe la foto del reverso del producto (JPEG, PNG o WebP de hasta 4 MB) en el campo `imagen` y devuelve una descripción de venta sugerida y los ingredientes en español (con el nombre común de cada uno si el envase usa INCI), para revisarlos antes de guardarlos. No guarda la foto ni la sugerencia. `ingredientes` es `null` si la foto no los muestra. Hasta 15 por minuto por cuenta.
         */
        post: operations["SugerenciaDescripcionController_sugerir"];
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
         * @description Productos activos y a la venta, ordenados por nombre y paginados, con imagen, nombre y precio minorista con IVA. `categoriaId` y `marcaId` se repiten para marcar varias: dentro de cada grupo basta una y entre grupos se exigen las dos; cada categoría incluye sus subcategorías. Con `buscar`, cada palabra debe estar en el nombre, la marca o la categoría (propia o superior), sin distinguir mayúsculas. Búsqueda y filtros se combinan; sin coincidencias devuelve una lista vacía. La sesión es opcional: con el token de una cuenta profesional se incluyen los productos exclusivos y cada producto trae además `precioMayorista` con IVA y `exclusivo` (`precio` es `null` en los exclusivos). Visitantes, clientes y personal ven solo los de venta general, sin precio mayorista.
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
    "/api/tienda/facetas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Conteos de los filtros de la tienda (E2-H2)
         * @description Cuántos productos hay en cada categoría (con sus subcategorías) y en cada marca, con la misma búsqueda, filtros y visibilidad que `GET /tienda/productos`. Cada grupo cuenta con la búsqueda y los filtros del otro grupo, no con los suyos, así marcar una categoría no deja en 0 a las demás. Solo trae las opciones con productos.
         */
        get: operations["TiendaController_facetas"];
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
    "/api/pedidos/{codigoPedido}/factura": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Descargar la factura registrada de un pedido (E9-H4)
         * @description Entrega el PDF de la factura registrada con `POST /api/pedidos/:codigoPedido/factura`, como descarga, para verificar lo que se subió. Sirve para cualquier pedido. Mientras la factura no se registre responde 404 sin archivo.
         */
        get: operations["DescargarFacturaPersonalController_descargar"];
        put?: never;
        /**
         * Registrar la factura emitida en el SII (E9-H3)
         * @description Recibe el PDF de la factura en el campo `archivo` (hasta 4 MB, reconocido por su contenido), el `folio` y, opcionalmente, la `fechaEmision` (AAAA-MM-DD, no futura; por defecto hoy). Guarda el documento con los datos del receptor y los montos del pedido tal como están al registrarlo. El pedido debe estar pagado y haber pedido factura; tiene una sola factura y el folio no puede repetirse. El archivo es privado: no se devuelve en la respuesta.
         */
        post: operations["RegistrarFacturaController_registrar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pedidos/{codigoPedido}/documento": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Descargar el documento tributario de mi pedido (E9-H4)
         * @description Entrega el PDF de la factura registrada del pedido, como descarga. Un pedido de otra cuenta responde 404, igual que uno que no existe. Mientras la factura no se registre responde 404 sin archivo: el detalle del pedido (`GET /api/pedidos/:codigoPedido`) indica entonces que el documento está pendiente.
         */
        get: operations["DescargarDocumentoController_descargar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/verificaciones": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Solicitar mi verificación como profesional (E10-H1)
         * @description Sin cuerpo. Consulta en el SII el inicio de actividades del RUT de la cuenta, que debe estar registrado. Con el giro 960200 (Peluquería y otros tratamientos de belleza) vigente, la solicitud queda `aprobada`, la cuenta pasa a profesional y se le envía el correo de aviso (E10-H4): renovando la sesión (`POST /api/cuentas/sesion/renovar`) recibe el token con el rol nuevo y ve el precio mayorista. En cualquier otro caso, o si la consulta no está disponible, queda `pendiente` y `requiereDocumentos` es `true`: hay que adjuntar documentos para la revisión del personal. Nunca se rechaza sola. Si antes la rechazaron, se puede enviar una nueva y se consulta de nuevo.
         */
        post: operations["SolicitudVerificacionController_solicitar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/verificaciones/yo/documentos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Adjuntar los documentos de mi solicitud de verificación (E10-H2)
         * @description Para quien no pasó la verificación automática: la solicitud está `pendiente` y `requiereDocumentos` es `true`. Recibe de 1 a 5 documentos en el campo `archivos` (PDF, JPG o PNG, hasta 4 MB cada uno, reconocidos por su contenido) y, en el campo `tipos`, el tipo de cada uno en el mismo orden (`titulo`, `certificado` u `otro`; un certificado de curso vale como `certificado`). La solicitud pasa a `revision_manual`, a la espera del personal. Los archivos se guardan privados y no se entregan por esta API.
         */
        post: operations["SolicitudVerificacionController_adjuntarDocumentos"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/verificaciones/yo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ver el estado de mi solicitud de verificación (E10-H1)
         * @description La solicitud más reciente de la cuenta: su estado (`pendiente`, `revision_manual`, `aprobada` o `rechazada`), las fechas, el motivo si fue rechazada, si debe adjuntar documentos y el nombre y tipo de los que ya adjuntó. Nunca incluye lo que respondió el SII, el puntaje ni quién la resolvió.
         */
        get: operations["SolicitudVerificacionController_verMiSolicitud"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/verificaciones/{codigoPublico}/aprobar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Aprobar una solicitud en revisión manual (E10-H3)
         * @description Sin cuerpo. Deja `aprobada` la solicitud en revisión manual de la cuenta y registra quién la resolvió y cuándo. En la misma operación la cuenta pasa a profesional y se le envía el correo de aviso (E10-H4); sus sesiones siguen abiertas y obtienen el precio mayorista al renovarse (`POST /api/cuentas/sesion/renovar`).
         */
        post: operations["RevisionVerificacionController_aprobar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/verificaciones/{codigoPublico}/rechazar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Rechazar con motivo una solicitud en revisión manual (E10-H3)
         * @description Deja `rechazada` la solicitud en revisión manual de la cuenta, guarda el motivo (obligatorio, de 10 a 1000 caracteres) y registra quién la resolvió y cuándo. Quien solicitó ve el motivo y puede enviar una solicitud nueva.
         */
        post: operations["RevisionVerificacionController_rechazar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/verificaciones/revision-manual": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar las solicitudes en revisión manual (E10-H7)
         * @description Las solicitudes que esperan al personal, de la más antigua a la más reciente, con el nombre y el RUT de quien solicitó, la fecha de la solicitud y el motivo de la revisión (`sin_inicio_actividades`, `otro_giro` o `no_disponible`). Paginado con `pagina` y `limite`. `codigoPublicoCuenta` abre el detalle y sirve para aprobar o rechazar.
         */
        get: operations["ConsultaVerificacionController_listar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/verificaciones/{codigoPublico}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ver el detalle de una solicitud de verificación (E10-H7)
         * @description Los datos de la cuenta, su solicitud más reciente (estado, motivo de la revisión, resultado de la consulta al SII con fecha y giros, o `no_disponible` si falló) con sus documentos, y las solicitudes anteriores con su resolución. Un documento ya eliminado trae `fechaEliminacion`.
         */
        get: operations["ConsultaVerificacionController_detalle"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/verificaciones/{codigoPublico}/documentos/{numero}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Pedir el enlace temporal a un documento (E10-H7)
         * @description Un enlace firmado para ver o descargar el documento `numero` de la solicitud más reciente de la cuenta. Vence en 60 segundos: pasado ese plazo se pide otro, así que se pide al abrirlo y no se guarda. Los archivos nunca son públicos.
         */
        get: operations["ConsultaVerificacionController_enlaceDocumento"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/perfil-profesional/yo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Ver mi perfil profesional (E10-H5) */
        get: operations["PerfilProfesionalController_obtener"];
        /**
         * Guardar mi perfil profesional (E10-H5)
         * @description Crea el perfil o lo reemplaza entero. Obligatorios: años de experiencia (0 a 40), una modalidad de trabajo y al menos una especialidad. El lugar de trabajo y la red social son opcionales; si no vienen, quedan sin valor.
         */
        put: operations["PerfilProfesionalController_guardar"];
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
         * Ver mi carrito con totales (E5-H1, E5-H4)
         * @description Líneas con precio unitario y subtotal con IVA, calculados al consultar según el rol (el profesional ve el mayorista), y el total. Cada línea indica si el artículo sigue a la venta, si el stock cubre la cantidad (sin informar cuántas unidades hay); si no, `impideCrearPedido` es `true` hasta que se quite o se ajuste la cantidad. No hay mínimo de unidades por formato (E5-H4, SCRUM-146).
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
    "/api/carrito/unir": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Unir el carrito del navegador al de la cuenta (E5-H2)
         * @description Se llama al iniciar sesión con los artículos que el visitante guardó en su navegador. Un artículo que ya estaba en la cuenta suma sus unidades. Lo que no se vende a la cuenta o está agotado se descarta, y una suma sobre 999 queda en 999; cada caso va en `ajustes`. Una cantidad mayor al stock se une sin recortar (recortarla revelaría cuántas unidades hay) y la línea queda con `impideCrearPedido` hasta ajustarla; lo mismo un formato bajo el mínimo del profesional (`bajoMinimo`). Devuelve el carrito de la cuenta con sus totales. Después de unir, el navegador debe vaciar su carrito.
         */
        post: operations["CarritoController_unir"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/carrito/cotizar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cotizar el carrito del visitante, sin sesión (E5-H2)
         * @description Recibe los artículos que el visitante guarda en su navegador y devuelve, con la misma forma que `GET /api/carrito`, sus precios con IVA (minorista) y si el stock cubre cada cantidad, sin informar cuántas unidades hay. No guarda nada. Un artículo que no se vende sin cuenta sale con `aLaVenta: false` y sin nombre, tipo ni imagen.
         */
        post: operations["CarritoVisitanteController_cotizar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/despacho/cotizacion": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Cotizar el despacho de mi carrito a una dirección (E7-H2)
         * @description Cotiza con Chilexpress según la comuna, el peso y las medidas, y devuelve el costo con IVA y el total a pagar. Se cobra el servicio más barato. La misma cotización se reutiliza durante 15 minutos.
         */
        get: operations["DespachoController_cotizar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pedidos/{codigoPedido}/estado": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cambiar el estado de un pedido (E8-H2)
         * @description Avanza el pedido por su secuencia (pagado → en preparación → despachado → entregado, o en preparación → listo para retiro → retirado si es retiro en tienda) o lo devuelve un paso con un comentario obligatorio. Al pasar a despachado exige el código de seguimiento de Chilexpress (E7-H3). Guarda el cambio en el historial con fecha, quién lo hizo y el comentario, y en los cambios clave (despachado, listo para retiro, entregado) deja encolado el correo al cliente. La cancelación tiene su propia ruta.
         */
        post: operations["CambiarEstadoPedidoController_cambiar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/marketing/cupones": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar los cupones (SCRUM-150)
         * @description Del más nuevo al más antiguo, con sus usos y lo descontado.
         */
        get: operations["CuponesController_listar"];
        put?: never;
        /**
         * Crear un cupón (SCRUM-150)
         * @description Porcentaje (con tope opcional) o monto fijo, sobre todo el pedido, ciertos formatos o packs, o categorías y marcas. Con `campanaId`, solo lo usan las cuentas a las que se envió esa campaña.
         */
        post: operations["CuponesController_crear"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/marketing/cupones/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Ver un cupón (SCRUM-150) */
        get: operations["CuponesController_obtener"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Editar o desactivar un cupón (SCRUM-150)
         * @description Cada campo que llega reemplaza al anterior. Los pedidos que ya lo usaron conservan su descuento.
         */
        patch: operations["CuponesController_actualizar"];
        trace?: never;
    };
    "/api/carrito/cupon": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ver cuánto descuenta un cupón en mi carrito (SCRUM-150)
         * @description Revisa el código con las mismas reglas que el pedido (vigencia, campaña, usos, rol, compra mínima y lo que cubre) y devuelve el descuento con IVA. No reserva el cupón: se aplica al crear el pedido con `codigoCupon`.
         */
        post: operations["CuponCarritoController_validar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pedidos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ver mi historial de pedidos (E8-H1)
         * @description Los pedidos de la cuenta, del más reciente al más antiguo, con fecha, total con IVA y estado actual. Paginado con `pagina` y `limite`.
         */
        get: operations["MisPedidosController_listar"];
        put?: never;
        /**
         * Crear mi pedido desde el carrito (E5-H3, E5-H4, E9-H1)
         * @description Recalcula precios, IVA y total, crea el pedido, reserva el stock, vacía el carrito y da el plazo para pagar. Repetir la misma `claveIdempotencia` devuelve el mismo pedido. El profesional compra al precio mayorista desde una unidad, sin mínimo por formato. El despacho a domicilio se cotiza con Chilexpress y su costo se suma al total (E7-H2).
         */
        post: operations["CrearPedidoController_crear"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pedidos/{codigoPedido}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ver el detalle de un pedido mío (E8-H1, E9-H1)
         * @description Artículos con su precio con IVA, montos, forma de entrega (con la dirección y el seguimiento si es despacho) y cambios de estado con su fecha. Con boleta y pago aprobado, `idTransaccionPago` es la referencia del comprobante de Mercado Pago. Un pedido de otra cuenta responde 404, igual que uno que no existe.
         */
        get: operations["MisPedidosController_obtener"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pedidos/{codigoPedido}/cancelar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Cancelar un pedido pendiente de pago (E8-H3)
         * @description Deja el pedido cancelado, devuelve su stock a las ubicaciones de donde salió y registra el cambio en el historial con quién lo hizo y el comentario opcional, todo en una transacción. Solo se puede cancelar un pedido pendiente de pago.
         */
        post: operations["CancelarPedidoController_cancelar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/gestion/pedidos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar los pedidos del panel (E8-H2)
         * @description Del más reciente al más antiguo, paginados, del `grupo` pedido (por defecto `por_preparar`: pagados y en preparación; `listos_para_retiro`, `despachados`, `pendientes_pago` y `todos`) y con la búsqueda `q`. Cada pedido trae código, fecha, cliente (razón social si pidió factura), entrega, estado, total con IVA y unidades. `grupos` da los chips en orden con su `cantidad` (`null` en los que no muestran conteo) y `grupo`, el aplicado.
         */
        get: operations["GestionPedidosController_listar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/gestion/pedidos/{codigoPedido}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ver un pedido desde el panel (E8-H2)
         * @description El detalle del pedido (artículos, montos, entrega, documento) más el cliente (nombre, correo y teléfono), el historial del primero al último con su comentario y quién lo hizo («Sistema», «Cliente» o el nombre del personal), los `cambiosPermitidos` desde el estado actual (con su sentido, si piden código de seguimiento y si avisan al cliente) y `sePuedeCancelar` (solo pendiente de pago).
         */
        get: operations["GestionPedidosController_obtener"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/gestion/facturas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar las facturas del panel (E9-H3)
         * @description Los pedidos pagados (no cancelados) que pidieron factura: primero los por emitir, del pedido más antiguo al más nuevo, y después los emitidos, de la emisión más reciente a la más antigua. Cada uno con razón social, RUT, total con IVA, `estado` (`por_emitir` o `emitida`) y folio. `porEmitir` es el conteo de la pestaña.
         */
        get: operations["GestionFacturasController_listar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/gestion/facturas/{codigoPedido}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ver los datos para emitir la factura de un pedido (E9-H3)
         * @description El receptor (razón social, RUT, giro, dirección y comuna), los montos, la tasa de IVA y, si ya se emitió, folio y fecha. Por emitir, los datos de facturación del pedido; emitida, los que copió la factura.
         */
        get: operations["GestionFacturasController_obtener"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pedidos/{codigoPedido}/pago": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Ir a pagar un pedido en Mercado Pago (E6-H1)
         * @description Prepara el cobro del total del pedido en Mercado Pago y devuelve la URL donde paga el comprador y la hora límite. Tras un pago rechazado se puede pedir otra vez mientras el pedido siga pendiente de pago y dentro del plazo. No se guardan datos de la tarjeta.
         */
        post: operations["PagarPedidoController_iniciar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pedidos/{codigoPedido}/pago/confirmar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Confirmar el pago al volver de Mercado Pago (E6-H1)
         * @description Consulta el pago a Mercado Pago y lo registra. Aprobado y por el total: el pedido queda pagado. Rechazado: el pedido sigue pendiente de pago y se puede reintentar dentro del plazo. Confirmar dos veces el mismo pago no cambia nada; un segundo pago aprobado no se acepta.
         */
        post: operations["PagarPedidoController_confirmar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/pagos/notificaciones": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Recibir una notificación de Mercado Pago (E6-H2)
         * @description Valida la firma (`x-signature`), guarda el evento y responde de inmediato; el pago se consulta a Mercado Pago y se aplica en segundo plano. La misma notificación otra vez no repite cambios ni correos.
         */
        post: operations["NotificacionPagoController_recibir"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reportes/stock-bajo-minimo": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Formatos con stock bajo el mínimo (E14-H4)
         * @description Los formatos con stock mínimo definido cuyo stock total (todas las ubicaciones) está bajo él, con el stock actual, el mínimo y lo que falta, del que más falta al que menos. Es el mismo cálculo del aviso del panel de bodega (E11-H6). Se calcula al consultar; si ningún formato está bajo su mínimo, devuelve una lista vacía.
         */
        get: operations["ReporteStockBajoController_stockBajoMinimo"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reportes/ventas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ventas por período y tipo de cliente (E14-H2)
         * @description Cantidad de pedidos pagados y sus montos (neto, IVA y total, con el despacho incluido) entre las dos fechas, ambas incluidas y en hora de Chile, separados en minorista y mayorista según el precio que se aplicó al comprar, más el total. Los pedidos pendientes de pago y los cancelados no cuentan. Sin pedidos, todo en cero.
         */
        get: operations["ReporteVentasController_ventas"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reportes/ventas/exportar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Exportar las ventas pedido a pedido en CSV (E14-H5, SCRUM-159)
         * @description Los mismos pedidos que suma `GET /api/reportes/ventas` para el período, uno por fila y del más antiguo al más reciente: código del pedido, fecha y hora de Chile, estado, tipo de cliente, tipo de entrega, documento solicitado, descuento, neto, IVA y total en pesos. Sin datos personales del comprador. CSV para Excel en Chile: UTF-8 con BOM, separador `;`. Sin pedidos, solo los encabezados.
         */
        get: operations["ReporteVentasController_exportar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reportes/indicadores": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Indicadores de los objetivos del proyecto (E14-H1)
         * @description Entre las dos fechas, ambas incluidas y en hora de Chile, cada objetivo con su porcentaje y su meta. **OE1** (meta 30 %): de las cuentas verificadas como profesionales en el período, cuántas compraron (pedido pagado) desde su aprobación. **OE2** (meta 70 %): de las solicitudes de verificación presentadas en el período, cuántas se resolvieron en 48 horas o menos; las que siguen sin resolver y aún están dentro de las 48 horas no cuentan. **OE3** (meta 80 %): de los productos creados en el período, cuántos tienen la descripción de la IA, aceptada o corregida. Sin datos, `porcentaje` es `null` y `sinDatos` es `true`.
         */
        get: operations["ReporteIndicadoresController_indicadores"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reportes/carritos-abandonados": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Carritos abandonados y recuperados por mes (E14-H3)
         * @description Por cada mes entre los dos indicados, ambos incluidos y en hora de Chile: cuántos carritos se abandonaron (una serie de recordatorios cuenta una vez, en el mes de su primer recordatorio) y cuántos de ellos terminaron en una compra pagada de la misma cuenta dentro de 7 días desde el primer recordatorio y antes del abandono siguiente. Los meses sin abandonos salen en cero.
         */
        get: operations["ReporteCarritosController_carritosAbandonados"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reportes/campanas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Resultados de las campañas de un período (E14-H3, SCRUM-150)
         * @description Las campañas enviadas entre `desde` y `hasta` (ambos incluidos, hora de Chile) y una fila por mes con el saludo de cumpleaños, las más recientes primero. Los porcentajes son sobre los correos enviados.
         */
        get: operations["ReporteCampanasController_periodo"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/reportes/campanas/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Resultado de una campaña (E14-H3)
         * @description Correos de la campaña: enviados, abiertos, con clic, rebotados, cancelados y fallidos, más los pendientes y el total. Sirve para las campañas de envío único y para el saludo de cumpleaños.
         */
        get: operations["ReporteCampanasController_resultado"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
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
    "/api/marketing/suscripciones": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Suscribirse a las ofertas sin cuenta (E12-H1)
         * @description Registra la suscripción inactiva y envía el enlace de confirmación. Responde lo mismo si el correo ya estaba suscrito.
         */
        post: operations["SuscripcionesController_suscribir"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/marketing/suscripciones/confirmar": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Confirmar la suscripción con el token del enlace (E12-H1) */
        post: operations["SuscripcionesController_confirmar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/marketing/bajas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Dar de baja una dirección de la publicidad (E12-H2)
         * @description Deja sin publicidad la cuenta y la suscripción sin cuenta con ese correo. Responde lo mismo si ya estaba de baja.
         */
        post: operations["BajasController_darDeBaja"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/marketing/campanas": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar las campañas de correo (E12-H3)
         * @description De la más nueva a la más antigua, con su estado de envío, a cuántas direcciones va o fue y su apertura, más los contadores de contactos con consentimiento.
         */
        get: operations["CampanasController_listar"];
        put?: never;
        /**
         * Redactar una campaña de correo (E12-H3)
         * @description Asunto, cuerpo en texto plano y segmento. Queda como borrador hasta confirmar el envío.
         */
        post: operations["CampanasController_crear"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/marketing/campanas/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ver una campaña de correo (E12-H3)
         * @description Incluye el segmento usado y cuántos correos quedaron pendientes, enviados, fallidos o cancelados.
         */
        get: operations["CampanasController_obtener"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Editar el borrador de una campaña (E12-H3)
         * @description Cambia el asunto, el cuerpo o el segmento. Una campaña ya enviada no se edita.
         */
        patch: operations["CampanasController_actualizar"];
        trace?: never;
    };
    "/api/marketing/campanas/vista-previa": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Vista previa en vivo de un correo de campaña (SCRUM-150)
         * @description Arma el correo con el asunto y el cuerpo que se están escribiendo, sin guardarlos. Los marcadores ({nombre}, {apellido}, {nombre_completo}, {enlace_tienda}) se completan con los datos de quien la pide. No cuenta destinatarios ni entrega la `confirmacion`: para enviar se guarda el borrador y se pide `POST /:id/vista-previa`.
         */
        post: operations["CampanasController_vistaPreviaEnVivo"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/marketing/campanas/{id}/vista-previa": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Vista previa de una campaña (E12-H3)
         * @description Devuelve el correo (HTML y texto), cuántas direcciones lo recibirían hoy y la `confirmacion` que exige el envío.
         */
        post: operations["CampanasController_vistaPrevia"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/marketing/campanas/{id}/envio": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Confirmar el envío de una campaña (E12-H3)
         * @description Encola la campaña para las direcciones del segmento que aceptan publicidad, una vez cada una, y guarda el segmento usado. Sale una sola vez.
         */
        post: operations["CampanasController_enviar"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/marketing/cumpleanos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Ver el saludo de cumpleaños (E12-H5)
         * @description Si está activo, asunto, saludo y oferta, con las cuentas programadas este mes y la apertura del mes anterior. Si nunca se configuró, devuelve el saludo por defecto (activo, sin oferta), con `configurado: false`.
         */
        get: operations["CumpleanosController_obtener"];
        /**
         * Configurar el saludo de cumpleaños y su oferta (E12-H5)
         * @description Reemplaza todo: si está activo, el asunto, el saludo y la oferta. Apagado, no sale ningún saludo. Los que salgan desde ahora llevan la oferta si está activa.
         */
        put: operations["CumpleanosController_configurar"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/marketing/seguimiento/apertura/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Registrar la apertura de un correo publicitario (E12-H6)
         * @description La imagen invisible del correo. Guarda la fecha de la primera apertura; las siguientes no la cambian. Siempre responde la imagen, aunque el enlace no sea válido.
         */
        get: operations["SeguimientoController_apertura"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/marketing/seguimiento/clic/{token}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Registrar el clic en un enlace de un correo publicitario (E12-H6)
         * @description Guarda la fecha del primer clic (y la de apertura, si no estaba) y redirige al destino, que debe ser de la tienda. Un destino de otro sitio lleva a la portada de la tienda; un enlace no válido redirige sin registrar.
         */
        get: operations["SeguimientoController_clic"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/marketing/rebotes": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Recibir un aviso de rebote de Resend (E12-H6)
         * @description Webhook de Resend con el evento `email.bounced`; valida la firma (`svix-id`, `svix-timestamp`, `svix-signature`). Marca el correo como `rebotada` y deja su dirección sin publicidad, como la baja. Otros eventos se ignoran. El mismo aviso otra vez no cambia nada.
         */
        post: operations["RebotesController_recibir"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/portada": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Slides de la portada del inicio (SCRUM-157)
         * @description En su orden, solo los que llevan a un destino que cualquier visitante ve en la tienda (producto o pack de venta general y a la venta, marca activa, categoría existente o una página). Sin slides, lista vacía: la tienda muestra el banner del pack.
         */
        get: operations["PortadaTiendaController_listar"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/portada/slides": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Listar los slides de la portada (SCRUM-157)
         * @description Todos, en su orden, con `disponible` en falso cuando el destino ya no está a la venta (la tienda no lo muestra).
         */
        get: operations["PortadaPanelController_listar"];
        put?: never;
        /**
         * Agregar un slide a la portada (SCRUM-157)
         * @description Imagen `escritorio` obligatoria y `celular` opcional (JPEG, PNG o WebP de hasta 4 MB cada una), con `tipoDestino` y `destino`. Queda al final. La portada tiene hasta 8 slides. Devuelve todos los slides.
         */
        post: operations["PortadaPanelController_crear"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/portada/destinos": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Opciones de destino de un slide (SCRUM-157)
         * @description Hasta 20 destinos del tipo pedido que la tienda muestra a cualquier visitante, por nombre; `buscar` filtra por nombre. Con `tipo` = `pagina`, las páginas: catalogo, packs, precio-profesional.
         */
        get: operations["PortadaPanelController_destinos"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/portada/slides/orden": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Ordenar los slides de la portada (SCRUM-157)
         * @description `orden` trae todos los slides, cada uno una vez.
         */
        put: operations["PortadaPanelController_ordenar"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/portada/slides/{id}": {
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
         * Eliminar un slide de la portada (SCRUM-157)
         * @description Los demás se reordenan sin huecos. Devuelve los que quedan.
         */
        delete: operations["PortadaPanelController_eliminar"];
        options?: never;
        head?: never;
        /** Cambiar a dónde lleva un slide (SCRUM-157) */
        patch: operations["PortadaPanelController_cambiarDestino"];
        trace?: never;
    };
    "/api/portada/slides/{id}/imagenes/escritorio": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Reemplazar la imagen de escritorio de un slide (SCRUM-157) */
        put: operations["PortadaPanelController_reemplazarEscritorio"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/portada/slides/{id}/imagenes/celular": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Subir o reemplazar la imagen de celular de un slide (SCRUM-157) */
        put: operations["PortadaPanelController_reemplazarCelular"];
        post?: never;
        /**
         * Quitar la imagen de celular de un slide (SCRUM-157)
         * @description El celular vuelve a mostrar la imagen de escritorio.
         */
        delete: operations["PortadaPanelController_quitarCelular"];
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
            /**
             * @description Debe ser true: para crear la cuenta hay que aceptar recibir ofertas por correo.
             * @example true
             */
            aceptaMarketing: boolean;
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
        CambiarRolDto: {
            /**
             * @description Un administrador pasa a vendedor o bodeguero; un profesional, a cliente.
             * @example vendedor
             * @enum {string}
             */
            rol: "vendedor" | "bodeguero" | "cliente";
            /**
             * @description Obligatorio al pasar de profesional a cliente: se le envía por correo. Opcional para el personal.
             * @example Dejó de ejercer como peluquera según nos informó.
             */
            motivo?: string | null;
        };
        ClienteListadoDto: {
            /** Format: uuid */
            codigoPublico: string;
            /** @example Andrea */
            nombre: string;
            /** @example Soto */
            apellido: string;
            /** @example andrea@correo.cl */
            email: string;
            /** @example 12345678-5 */
            rut: string | null;
            /** @enum {string} */
            rol: "cliente" | "profesional";
            activo: boolean;
            /** Format: date-time */
            fechaRegistro: string;
            /** @description Si confirmó su correo. */
            correoConfirmado: boolean;
        };
        ConteosClientesDto: {
            /** @example 120 */
            todos: number;
            /** @example 98 */
            clientes: number;
            /** @example 22 */
            profesionales: number;
            /** @example 3 */
            desactivados: number;
        };
        ListadoClientesDto: {
            items: components["schemas"]["ClienteListadoDto"][];
            /** @example 120 */
            total: number;
            /** @example 1 */
            pagina: number;
            /** @example 20 */
            limite: number;
            /** @description Cuentas de cada filtro con la búsqueda aplicada, sin el filtro de rol ni de estado. */
            conteos: components["schemas"]["ConteosClientesDto"];
        };
        PerfilProfesionalClienteDto: {
            /** @example 8 */
            anosExperiencia: number;
            /** @example salon */
            modalidad: string;
            /**
             * @example [
             *       "color",
             *       "corte"
             *     ]
             */
            especialidades: string[];
            nombreLugarTrabajo: string | null;
            redSocial: string | null;
            /** @example Providencia */
            comuna: string | null;
        };
        VerificacionClienteDto: {
            /** @enum {string} */
            estado: "pendiente" | "revision_manual" | "aprobada" | "rechazada";
            /** Format: date-time */
            fechaSolicitud: string;
            /** Format: date-time */
            fechaResolucion: string | null;
        };
        CambioRolClienteDto: {
            /** @example profesional */
            rolAnterior: string;
            /** @example cliente */
            rolNuevo: string;
            motivo: string | null;
            /** Format: date-time */
            fechaCambio: string;
            /**
             * @description Nombre y apellido de quien hizo el cambio.
             * @example Javiera Muñoz
             */
            responsable: string;
        };
        ClienteDetalleDto: {
            /** Format: uuid */
            codigoPublico: string;
            /** @example Andrea */
            nombre: string;
            /** @example Soto */
            apellido: string;
            /** @example andrea@correo.cl */
            email: string;
            /** @example 12345678-5 */
            rut: string | null;
            /** @enum {string} */
            rol: "cliente" | "profesional";
            activo: boolean;
            /** Format: date-time */
            fechaRegistro: string;
            /** @description Si confirmó su correo. */
            correoConfirmado: boolean;
            /** @example +56912345678 */
            telefono: string | null;
            /** @description Si acepta los correos de ofertas. */
            aceptaMarketingEmail: boolean;
            perfilProfesional: components["schemas"]["PerfilProfesionalClienteDto"] | null;
            /** @description Su solicitud de verificación más reciente. El detalle está en `GET /api/verificaciones/{codigoPublico}` con el mismo código. */
            verificacion: components["schemas"]["VerificacionClienteDto"] | null;
            /**
             * @description Pedidos creados, en cualquier estado.
             * @example 4
             */
            pedidos: number;
            /** @description Cambios de rol, del más reciente al más antiguo. */
            historialRol: components["schemas"]["CambioRolClienteDto"][];
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
        ProveedorListadoDto: {
            /** @example 1 */
            id: number;
            /** @example Distribuidora Capilar SpA */
            razonSocial: string;
        };
        UbicacionResumenDto: {
            /** @example 3 */
            id: number;
            /** @example A-01 */
            codigo: string;
            /**
             * @description Nombre de la bodega.
             * @example Bodega principal
             */
            bodega: string;
        };
        RegistradoPorEntradaDto: {
            /** @example Camila Rojas */
            nombre: string;
        };
        EntradaListadoDto: {
            /** @example 12 */
            id: number;
            /**
             * Format: date
             * @example 2026-11-06
             */
            fechaRecepcion: string;
            /** @enum {string} */
            tipoDocumento: "factura" | "guia_despacho";
            /** @example F-1234 */
            numeroDocumento: string;
            proveedor: components["schemas"]["ProveedorListadoDto"];
            /** @description La ubicación de destino de la entrada. */
            ubicacion: components["schemas"]["UbicacionResumenDto"];
            /**
             * @description Formatos distintos recibidos.
             * @example 2
             */
            cantidadFormatos: number;
            /** @example 30 */
            unidades: number;
            /** @example 95772 */
            costoNetoTotal: number;
            registradoPor: components["schemas"]["RegistradoPorEntradaDto"];
        };
        ListadoEntradasDto: {
            items: components["schemas"]["EntradaListadoDto"][];
            /** @example 1 */
            total: number;
            /** @example 1 */
            pagina: number;
            /** @example 20 */
            limite: number;
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
            observacion?: string | null;
            /** @description Formatos recibidos; cada uno una sola vez. */
            detalles: components["schemas"]["DetalleEntradaDto"][];
        };
        ProveedorEntradaRegistradaDto: {
            /** @example 1 */
            id: number;
            /** @example 76086430-7 */
            rut: string;
            /** @example Distribuidora Capilar SpA */
            razonSocial: string;
        };
        DetalleEntradaRegistradoDto: {
            /** @example 21 */
            formatoId: number;
            /** @example 24 */
            cantidad: number;
            /** @example 1990.5 */
            costoUnitarioNeto: number;
            /**
             * @description Cantidad por costo unitario neto.
             * @example 47772
             */
            subtotalNeto: number;
            /**
             * @description El movimiento de entrada del formato.
             * @example 90
             */
            movimientoId: number;
        };
        EntradaRegistradaDto: {
            /** @example 12 */
            id: number;
            proveedor: components["schemas"]["ProveedorEntradaRegistradaDto"];
            /**
             * Format: date
             * @example 2026-11-06
             */
            fechaRecepcion: string;
            /** @enum {string} */
            tipoDocumento: "factura" | "guia_despacho";
            /** @example F-1234 */
            numeroDocumento: string;
            observacion: string | null;
            ubicacion: components["schemas"]["UbicacionResumenDto"];
            detalles: components["schemas"]["DetalleEntradaRegistradoDto"][];
            /**
             * @description Unidades recibidas en total.
             * @example 30
             */
            unidades: number;
            /**
             * @description Suma de los subtotales netos.
             * @example 95772
             */
            costoNetoTotal: number;
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
            observacion?: string | null;
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
            observacion?: string | null;
        };
        UbicacionConStockDto: {
            /** @example 3 */
            id: number;
            /** @example A-01 */
            codigo: string;
        };
        ProveedorDeEntradaDto: {
            /** @example 1 */
            id: number;
            /** @example Distribuidora Capilar SpA */
            razonSocial: string;
        };
        UltimaEntradaListadoDto: {
            /**
             * @description Costo unitario neto.
             * @example 4200.5
             */
            costoUnitarioNeto: number;
            proveedor: components["schemas"]["ProveedorDeEntradaDto"];
        };
        StockListadoDto: {
            /** @example 21 */
            formatoId: number;
            /** @example SH-REP-300 */
            sku: string;
            /** @example Shampoo reparador */
            producto: string;
            /** @example 300 ml */
            nombreFormato: string;
            /** @description URL de la foto principal del formato; `null` si no tiene. */
            imagen: string | null;
            /** @description Ubicaciones con unidades (de la bodega elegida, o de todas), por código. */
            ubicaciones: components["schemas"]["UbicacionConStockDto"][];
            /**
             * @description Unidades en la bodega elegida, o en todas.
             * @example 12
             */
            stock: number;
            /**
             * @description 0: el formato no tiene mínimo.
             * @example 5
             */
            stockMinimo: number;
            /** @description El stock total del formato (todas sus ubicaciones) está bajo su mínimo: la misma regla del aviso de E11-H6. */
            bajoMinimo: boolean;
            /** @description Costo y proveedor de la entrada más reciente; `null` si nunca se recibió. */
            ultimaEntrada: components["schemas"]["UltimaEntradaListadoDto"] | null;
        };
        ListadoStockDto: {
            items: components["schemas"]["StockListadoDto"][];
            /** @example 1 */
            total: number;
            /** @example 1 */
            pagina: number;
            /** @example 20 */
            limite: number;
            /**
             * @description Formatos bajo el mínimo con la misma bodega y búsqueda (sin el filtro `bajoMinimo`).
             * @example 2
             */
            totalBajoMinimo: number;
        };
        BodegaDeUbicacionDto: {
            /** @example 1 */
            id: number;
            /** @example Bodega principal */
            nombre: string;
        };
        UbicacionInventarioDto: {
            /** @example 3 */
            id: number;
            /** @example A-01 */
            codigo: string;
            bodega: components["schemas"]["BodegaDeUbicacionDto"];
        };
        LugarDto: {
            /** @example 13101 */
            codigoCut: string;
            /** @example Santiago */
            nombre: string;
        };
        UbicacionPanelDto: {
            /** @example 4 */
            id: number;
            /** @example A-01 */
            codigo: string;
            zona: string | null;
            pasillo: string | null;
            estante: string | null;
            nivel: string | null;
            activa: boolean;
            /**
             * @description Unidades guardadas, de todos los formatos.
             * @example 12
             */
            stock: number;
        };
        BodegaPanelDto: {
            /** @example 2 */
            id: number;
            /** @example Bodega central */
            nombre: string;
            /** @example Av. Matta 1234 */
            direccion: string;
            /** @enum {string} */
            tipo: "bodega" | "tienda";
            abasteceVentaOnline: boolean;
            activa: boolean;
            comuna: components["schemas"]["LugarDto"];
            region: components["schemas"]["LugarDto"];
            /**
             * @description Unidades en todas sus ubicaciones.
             * @example 40
             */
            stock: number;
            /** @description Por código. */
            ubicaciones: components["schemas"]["UbicacionPanelDto"][];
        };
        CrearBodegaDto: {
            /** @example Bodega central */
            nombre: string;
            /** @example Av. Matta 1234 */
            direccion: string;
            /**
             * @description Código CUT de la comuna.
             * @example 13101
             */
            comuna: string;
            /**
             * @example bodega
             * @enum {string}
             */
            tipo: "bodega" | "tienda";
            /** @description Si su stock cuenta para la venta online (por omisión, sí). */
            abasteceVentaOnline?: boolean;
        };
        ActualizarBodegaDto: {
            /** @example Bodega central */
            nombre?: string;
            /** @example Av. Matta 1234 */
            direccion?: string;
            /**
             * @description Código CUT de la comuna.
             * @example 13101
             */
            comuna?: string;
            /**
             * @example bodega
             * @enum {string}
             */
            tipo?: "bodega" | "tienda";
            /** @description Si su stock cuenta para la venta online (por omisión, sí). */
            abasteceVentaOnline?: boolean;
            /** @description Desactivarla exige que ninguna de sus ubicaciones tenga stock. */
            activa?: boolean;
        };
        CrearUbicacionDto: {
            /**
             * @description Se guarda en mayúsculas; único dentro de la bodega.
             * @example A-01
             */
            codigo: string;
            zona?: string | null;
            pasillo?: string | null;
            estante?: string | null;
            nivel?: string | null;
        };
        ActualizarUbicacionDto: {
            /**
             * @description Se guarda en mayúsculas; único dentro de la bodega.
             * @example A-01
             */
            codigo?: string;
            zona?: string | null;
            pasillo?: string | null;
            estante?: string | null;
            nivel?: string | null;
            /** @description Desactivarla exige que no tenga stock. */
            activa?: boolean;
        };
        FormatoDelMovimientoDto: {
            /** @example 21 */
            id: number;
            /** @example Shampoo reparador */
            producto: string;
            /** @example 300 ml */
            nombreFormato: string;
        };
        RegistradoPorDto: {
            /** @example Camila Rojas */
            nombre: string;
        };
        MovimientoListadoDto: {
            /** @example 90 */
            id: number;
            /**
             * Format: date-time
             * @example 2026-11-06T13:15:00.000Z
             */
            fechaHora: string;
            /** @enum {string} */
            tipo: "entrada" | "merma_vencimiento" | "merma_dano" | "consumo_peluqueria" | "ajuste_positivo" | "ajuste_negativo" | "transferencia" | "venta" | "reingreso";
            formato: components["schemas"]["FormatoDelMovimientoDto"];
            /**
             * @description Con signo: positiva si suma stock y negativa si lo resta; la transferencia, positiva.
             * @example -2
             */
            cantidad: number;
            /** @description La ubicación del movimiento; en la transferencia, la de origen. */
            ubicacion: components["schemas"]["UbicacionResumenDto"];
            /** @description Solo en la transferencia: la ubicación de destino. */
            destino: components["schemas"]["UbicacionResumenDto"] | null;
            /**
             * @description N.º de documento de la entrada, código del pedido (venta y reingreso) u observación.
             * @example F-1234
             */
            referencia: string | null;
            /** @description `null`: lo registró el sistema (ventas y reingresos de pedidos). */
            registradoPor: components["schemas"]["RegistradoPorDto"] | null;
        };
        ListadoMovimientosDto: {
            items: components["schemas"]["MovimientoListadoDto"][];
            /** @example 1 */
            total: number;
            /** @example 1 */
            pagina: number;
            /** @example 20 */
            limite: number;
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
        SugerenciaUsadaDto: {
            /** @description La descripción sugerida, sin cambios. */
            descripcion: string;
            /** @description La firma que vino con la sugerencia. */
            firma: string;
        };
        CrearProductoDto: {
            /** @example Shampoo reparador */
            nombre: string;
            /** @example Repara el cabello dañado por procesos químicos y le devuelve su brillo natural. */
            descripcion: string;
            /** @description Solo si la descripción partió de una sugerencia de la IA. Igual a la sugerida: origen «ia»; cambiada: «ia_editada». Sin este campo, al crear el origen es «manual». */
            sugerencia?: components["schemas"]["SugerenciaUsadaDto"];
            /**
             * @description Lista de ingredientes del reverso (E4-H2). Opcional.
             * @example Aqua, Sodium Laureth Sulfate, Glycerin
             */
            ingredientes?: Record<string, never> | null;
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
        ReferenciaNombreDto: {
            /** @example 2 */
            id: number;
            /** @example Kerastase */
            nombre: string;
        };
        ProductoListadoPanelDto: {
            /** @example 7 */
            id: number;
            /** @example 2 */
            marcaId: number | null;
            /** @example 3 */
            categoriaId: number;
            /** @example Shampoo reparador */
            nombre: string;
            descripcion: string;
            /** @enum {string} */
            origenDescripcion: "manual" | "ia" | "ia_editada";
            ingredientes: string | null;
            /** @enum {string} */
            canalVenta: "general" | "profesional";
            activo: boolean;
            /** Format: date-time */
            fechaCreacion: string;
            marca: components["schemas"]["ReferenciaNombreDto"] | null;
            categoria: components["schemas"]["ReferenciaNombreDto"];
            /** @description URL de la foto principal del formato predeterminado, o `null`. */
            imagen: string | null;
            /**
             * @description Formatos activos.
             * @example 2
             */
            formatos: number;
            /**
             * @description Menor precio con IVA, en pesos enteros, entre sus formatos activos y del canal del producto (minorista si es general, mayorista si es exclusivo); `null` sin precios.
             * @example 12990
             */
            precioDesde: number | null;
            /**
             * @description Unidades en ubicaciones activas de bodegas activas, sumando sus formatos.
             * @example 24
             */
            stockTotal: number;
            /** @description Algún formato está bajo su stock mínimo (regla del aviso de E11-H6: stock total en todas sus ubicaciones). */
            stockBajo: boolean;
        };
        ConteosProductosPanelDto: {
            /**
             * @description Con los inactivos.
             * @example 86
             */
            todos: number;
            /** @example 12 */
            exclusivos: number;
            /** @example 4 */
            stockBajo: number;
            /** @example 3 */
            inactivos: number;
        };
        ListadoProductosPanelDto: {
            items: components["schemas"]["ProductoListadoPanelDto"][];
            /** @example 86 */
            total: number;
            /** @example 1 */
            pagina: number;
            /** @example 20 */
            limite: number;
            /** @description Productos de cada chip con la búsqueda, la categoría y la marca aplicadas. */
            conteos: components["schemas"]["ConteosProductosPanelDto"];
        };
        ActualizarProductoDto: {
            /** @example Shampoo reparador */
            nombre?: string;
            descripcion?: string;
            /** @description Solo si la descripción partió de una sugerencia de la IA. Igual a la sugerida: origen «ia»; cambiada: «ia_editada». Sin este campo, al crear el origen es «manual». */
            sugerencia?: components["schemas"]["SugerenciaUsadaDto"];
            /** @description `null` o un texto vacío borra la lista de ingredientes. */
            ingredientes?: Record<string, never> | null;
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
        ProductoDelFormatoDto: {
            /** @example 7 */
            id: number;
            /** @example Shampoo reparador */
            nombre: string;
        };
        FormatoBuscadoDto: {
            /** @example 21 */
            formatoId: number;
            /** @example SH-REP-300 */
            sku: string;
            /** @example 300 ml */
            nombreFormato: string;
            producto: components["schemas"]["ProductoDelFormatoDto"];
            /**
             * @description Canal del producto: un pack general no admite formatos exclusivos.
             * @enum {string}
             */
            canalVenta: "general" | "profesional";
            /**
             * @description Unidades en ubicaciones activas de bodegas activas.
             * @example 2
             */
            stockTotal: number;
            /**
             * @description Precio minorista neto; `null` si aún no tiene.
             * @example 10916
             */
            precioMinoristaNeto: number | null;
            /**
             * @description Precio minorista con IVA en pesos enteros, como en la tienda.
             * @example 12990
             */
            precioMinoristaConIva: number | null;
        };
        ListadoFormatosBuscadosDto: {
            items: components["schemas"]["FormatoBuscadoDto"][];
            /** @example 1 */
            total: number;
            /** @example 1 */
            pagina: number;
            /** @example 20 */
            limite: number;
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
        FacetaTiendaDto: {
            /** @example 3305 */
            id: number;
            /**
             * @description Productos con la búsqueda y los filtros.
             * @example 24
             */
            total: number;
        };
        FacetasTiendaDto: {
            /** @description Por categoría, con sus subcategorías; cuenta con la búsqueda y las marcas marcadas. */
            categorias: components["schemas"]["FacetaTiendaDto"][];
            /** @description Por marca; cuenta con la búsqueda y las categorías marcadas. */
            marcas: components["schemas"]["FacetaTiendaDto"][];
        };
        RechazarSolicitudDto: {
            /**
             * @description Obligatorio. Se recorta y queda guardado en la solicitud; quien solicitó lo ve.
             * @example El certificado adjunto no es legible ni indica el nombre del titular.
             */
            motivo: string;
        };
        GuardarPerfilProfesionalDto: {
            /** @example 8 */
            anosExperiencia: number;
            /**
             * @description Una sola modalidad de trabajo.
             * @example arriendo_sillon
             * @enum {string}
             */
            modalidad: "dependiente_salon" | "arriendo_sillon" | "salon_propio" | "domicilio_clienta" | "domicilio_propio" | "eventos_producciones" | "docente";
            /**
             * @description Al menos una especialidad, sin repetir.
             * @example [
             *       "coloracion_tinturas",
             *       "alisados"
             *     ]
             */
            especialidades: ("corte_dama" | "corte_varon_barberia" | "peinados_recogidos" | "brushing_planchado" | "coloracion_tinturas" | "mechas_balayage" | "decoloracion_correccion" | "canas_matizacion" | "alisados" | "permanente_ondulacion" | "tratamientos_reparacion" | "tricologia" | "extensiones_pelucas" | "rizado_afro" | "peluqueria_infantil" | "novias_eventos")[];
            /**
             * @description Opcional. Nombre del salón o lugar donde trabaja.
             * @example Salón Bella Vista
             */
            nombreLugarTrabajo?: Record<string, never> | null;
            /**
             * @description Opcional. Enlace https:// al perfil en Instagram, Facebook o TikTok (instagram.com, facebook.com o tiktok.com, con o sin www).
             * @example https://www.instagram.com/bellavista.salon
             */
            redSocial?: Record<string, never> | null;
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
        ArticuloNavegadorDto: {
            /**
             * @description Id del artículo: el de un formato de producto o el de un pack.
             * @example 11
             */
            articuloId: number;
            /** @example 2 */
            cantidad: number;
        };
        ArticulosNavegadorDto: {
            /** @description Artículos del carrito del navegador, cada uno una sola vez con su cantidad. */
            articulos: components["schemas"]["ArticuloNavegadorDto"][];
        };
        CambiarEstadoPedidoDto: {
            /**
             * @description Estado al que pasa el pedido.
             * @example en_preparacion
             * @enum {string}
             */
            estado: "pendiente_pago" | "pagado" | "en_preparacion" | "despachado" | "entregado" | "listo_para_retiro" | "retirado" | "cancelado";
            /**
             * @description Nota interna que queda en el historial. Es obligatoria al volver a un estado anterior.
             * @example Pedido armado y revisado.
             */
            comentario?: string;
            /**
             * @description Número de la orden de transporte de Chilexpress, única por pedido. La OT debe crearse con el código público del pedido como referencia. Es obligatorio al pasar a despachado y no se admite en otro cambio.
             * @example 990000000001
             */
            codigoSeguimiento?: string;
        };
        ElegidoCuponDto: {
            /** @example 12 */
            id: number;
            /** @example L'Oréal */
            nombre: string;
        };
        CampanaCuponDto: {
            /** @example 12 */
            id: number;
            /** @example Novedades para tu salón */
            asunto: string;
            /** @description Si ya se envió. */
            enviada: boolean;
        };
        CuponPanelDto: {
            /** @example 3 */
            id: number;
            /** @example LOREAL20 */
            codigo: string;
            descripcion: string | null;
            /** @enum {string} */
            tipoDescuento: "porcentaje" | "monto_fijo";
            /** @example 20 */
            valor: number;
            topeDescuento: number | null;
            /** @enum {string} */
            alcance: "pedido" | "articulos" | "categorias_marcas";
            /** @description Formatos y packs, con su nombre. */
            articulos: components["schemas"]["ElegidoCuponDto"][];
            categorias: components["schemas"]["ElegidoCuponDto"][];
            marcas: components["schemas"]["ElegidoCuponDto"][];
            compraMinima: number | null;
            /** Format: date-time */
            fechaInicio: string | null;
            /** Format: date-time */
            fechaFin: string | null;
            usosMaximos: number | null;
            usosPorCuenta: number | null;
            incluyeProfesionales: boolean;
            activo: boolean;
            campana: components["schemas"]["CampanaCuponDto"] | null;
            /**
             * @description Pedidos no cancelados que lo usaron.
             * @example 18
             */
            usos: number;
            /**
             * @description Total descontado en esos pedidos, en pesos con IVA.
             * @example 54000
             */
            descontado: number;
            /** Format: date-time */
            fechaCreacion: string;
        };
        CrearCuponDto: {
            /**
             * @description Letras, números y guiones; se guarda en mayúsculas. Es el que escribe el comprador.
             * @example LOREAL20
             */
            codigo: string;
            /**
             * @description Lo que verá el comprador al aplicarlo.
             * @example 20 % en productos L'Oréal
             */
            descripcion?: string | null;
            /**
             * @example porcentaje
             * @enum {string}
             */
            tipoDescuento: "porcentaje" | "monto_fijo";
            /**
             * @description Porcentaje (1 a 100) o monto en pesos con IVA.
             * @example 20
             */
            valor: number;
            /**
             * @description Tope en pesos del descuento; solo con porcentaje.
             * @example 10000
             */
            topeDescuento?: number | null;
            /**
             * @example categorias_marcas
             * @enum {string}
             */
            alcance: "pedido" | "articulos" | "categorias_marcas";
            /** @description Formatos o packs (ids de artículo); con alcance `articulos`. */
            articulos?: number[];
            /** @description Categorías (con sus subcategorías); con alcance `categorias_marcas`. */
            categorias?: number[];
            /** @description Marcas; con alcance `categorias_marcas`. */
            marcas?: number[];
            /**
             * @description Subtotal de productos con IVA mínimo para usarlo.
             * @example 30000
             */
            compraMinima?: number | null;
            /** Format: date-time */
            fechaInicio?: string | null;
            /** Format: date-time */
            fechaFin?: string | null;
            /**
             * @description Usos en total (pedidos no cancelados).
             * @example 100
             */
            usosMaximos?: number | null;
            /**
             * @description Usos por cuenta.
             * @example 1
             */
            usosPorCuenta?: number | null;
            /** @description También sobre el precio profesional (mayorista). */
            incluyeProfesionales?: boolean;
            /** @description Si se puede usar. Por omisión, sí. */
            activo?: boolean;
            /**
             * @description Campaña de envío único: solo lo usan las cuentas a las que se les envió.
             * @example 12
             */
            campanaId?: number | null;
        };
        ActualizarCuponDto: {
            /**
             * @description Letras, números y guiones; se guarda en mayúsculas. Es el que escribe el comprador.
             * @example LOREAL20
             */
            codigo?: string;
            /**
             * @description Lo que verá el comprador al aplicarlo.
             * @example 20 % en productos L'Oréal
             */
            descripcion?: string | null;
            /**
             * @example porcentaje
             * @enum {string}
             */
            tipoDescuento?: "porcentaje" | "monto_fijo";
            /**
             * @description Porcentaje (1 a 100) o monto en pesos con IVA.
             * @example 20
             */
            valor?: number;
            /**
             * @description Tope en pesos del descuento; solo con porcentaje.
             * @example 10000
             */
            topeDescuento?: number | null;
            /**
             * @example categorias_marcas
             * @enum {string}
             */
            alcance?: "pedido" | "articulos" | "categorias_marcas";
            /** @description Formatos o packs (ids de artículo); con alcance `articulos`. */
            articulos?: number[];
            /** @description Categorías (con sus subcategorías); con alcance `categorias_marcas`. */
            categorias?: number[];
            /** @description Marcas; con alcance `categorias_marcas`. */
            marcas?: number[];
            /**
             * @description Subtotal de productos con IVA mínimo para usarlo.
             * @example 30000
             */
            compraMinima?: number | null;
            /** Format: date-time */
            fechaInicio?: string | null;
            /** Format: date-time */
            fechaFin?: string | null;
            /**
             * @description Usos en total (pedidos no cancelados).
             * @example 100
             */
            usosMaximos?: number | null;
            /**
             * @description Usos por cuenta.
             * @example 1
             */
            usosPorCuenta?: number | null;
            /** @description También sobre el precio profesional (mayorista). */
            incluyeProfesionales?: boolean;
            /** @description Si se puede usar. Por omisión, sí. */
            activo?: boolean;
            /**
             * @description Campaña de envío único: solo lo usan las cuentas a las que se les envió.
             * @example 12
             */
            campanaId?: number | null;
        };
        ValidarCuponDto: {
            /** @example LOREAL20 */
            codigo: string;
        };
        CuponCarritoDto: {
            /** @example LOREAL20 */
            codigo: string;
            descripcion: string | null;
            /**
             * @description En pesos con IVA.
             * @example 4000
             */
            descuento: number;
            /**
             * @description Total de los productos del carrito con el descuento, con IVA y sin el despacho.
             * @example 16000
             */
            totalProductos: number;
        };
        CrearPedidoDto: {
            /**
             * @description UUID que el navegador genera para esta confirmación y repite si reintenta.
             * @example 0f8fad5b-d9cb-469f-a165-70867728950e
             */
            claveIdempotencia: string;
            /**
             * @example retiro
             * @enum {string}
             */
            tipoEntrega: "despacho" | "retiro";
            /**
             * @description Id de una dirección de la cuenta; solo con despacho.
             * @example 12
             */
            direccionId?: number;
            /**
             * @example boleta
             * @enum {string}
             */
            tipoDocumento: "boleta" | "factura";
            /**
             * @description Id de los datos de facturación de la cuenta; obligatorio con factura si la cuenta tiene datos, y solo se indica con factura.
             * @example 3
             */
            datosFacturacionId?: number;
            /**
             * @description Código de un cupón (SCRUM-150): se valida y se aplica al crear el pedido. Sin mayúsculas ni espacios también vale.
             * @example LOREAL20
             */
            codigoCupon?: string | null;
        };
        CancelarPedidoDto: {
            /**
             * @description Motivo de la cancelación; queda en el historial del pedido.
             * @example El cliente pidió anular la compra.
             */
            comentario?: string;
        };
        PedidoGestionDto: {
            /** @example AB12CD34EF56 */
            codigoPublico: string;
            /** Format: date-time */
            fechaPedido: string;
            /**
             * @description Razón social si pidió factura; si no, nombre y apellido de la cuenta.
             * @example Camila Rojas
             */
            cliente: string;
            /** @enum {string} */
            tipoEntrega: "despacho" | "retiro";
            /** @enum {string} */
            estado: "pendiente_pago" | "pagado" | "en_preparacion" | "despachado" | "entregado" | "listo_para_retiro" | "retirado" | "cancelado";
            /**
             * @description Total con IVA, en pesos.
             * @example 25990
             */
            total: number;
            /**
             * @description Suma de las cantidades del pedido.
             * @example 3
             */
            unidades: number;
        };
        GrupoPedidosDto: {
            /** @example por_preparar */
            clave: string;
            /** @example Por preparar */
            nombre: string;
            /**
             * @description `null`: el grupo no muestra cuántos pedidos tiene.
             * @example 4
             */
            cantidad: number | null;
        };
        ListadoPedidosGestionDto: {
            items: components["schemas"]["PedidoGestionDto"][];
            /** @example 12 */
            total: number;
            /** @example 1 */
            pagina: number;
            /** @example 20 */
            limite: number;
            /** @description Los chips del filtro, en orden. */
            grupos: components["schemas"]["GrupoPedidosDto"][];
            /**
             * @description El grupo aplicado.
             * @example por_preparar
             */
            grupo: string;
        };
        MontosDto: {
            /** @example 21840 */
            neto: number;
            /** @example 4150 */
            iva: number;
            /** @example 25990 */
            total: number;
            /**
             * @description Lo que descontó el cupón, con IVA (SCRUM-150); ya va restado del neto, el IVA y el total.
             * @example 0
             */
            descuento: number;
        };
        LineaPedidoDto: {
            /** @example 21 */
            articuloId: number;
            /** @enum {string} */
            tipo: "formato" | "pack";
            /** @example Shampoo reparador */
            nombre: string;
            /** @example 300 ml */
            nombreFormato: string | null;
            imagen: string | null;
            /** @example 2 */
            cantidad: number;
            /**
             * @description Precio unitario con IVA que se cobró.
             * @example 12990
             */
            precioUnitario: number;
            /** @example 25980 */
            subtotal: number;
        };
        ComunaDto: {
            /** @example 13101 */
            codigoCut: string;
            /** @example Santiago */
            nombre: string;
        };
        EnvioPedidoDto: {
            /** @example DIA HABIL SIGUIENTE */
            servicio: string;
            /**
             * @description Costo con IVA, en pesos.
             * @example 3990
             */
            costo: number;
            /** @example pendiente */
            estado: string;
            codigoSeguimiento: string | null;
            /** Format: date */
            fechaEstimada: string | null;
            destinatario: string;
            telefonoContacto: string | null;
            calle: string;
            numero: string;
            referencia: string | null;
            comuna: components["schemas"]["ComunaDto"];
        };
        DocumentoPedidoDto: {
            /** @enum {string} */
            tipo: "factura";
            /** @enum {string} */
            estado: "pendiente" | "disponible";
            folio: number | null;
            /** Format: date */
            fechaEmision: string | null;
        };
        ClientePedidoDto: {
            /** @example Camila Rojas */
            nombre: string;
            /** @example camila@correo.cl */
            correo: string;
            telefono: string | null;
        };
        CambioHistorialDto: {
            /** @enum {string} */
            estado: "pendiente_pago" | "pagado" | "en_preparacion" | "despachado" | "entregado" | "listo_para_retiro" | "retirado" | "cancelado";
            /** Format: date-time */
            fecha: string;
            comentario: string | null;
            /**
             * @description «Sistema», «Cliente» o el nombre del personal.
             * @example Sistema
             */
            realizadoPor: string;
        };
        CambioPermitidoDto: {
            /** @enum {string} */
            estado: "pendiente_pago" | "pagado" | "en_preparacion" | "despachado" | "entregado" | "listo_para_retiro" | "retirado" | "cancelado";
            /** @enum {string} */
            sentido: "avance" | "retroceso";
            /** @description Al despachar se pide la OT de Chilexpress (E7-H3). */
            pideCodigoSeguimiento: boolean;
            /** @description Se avisa al cliente por correo. */
            avisaAlCliente: boolean;
            /** @description Volver a un estado anterior exige un comentario. */
            pideComentario: boolean;
        };
        DetallePedidoGestionDto: {
            /** @example AB12CD34EF56 */
            codigoPublico: string;
            /** Format: date-time */
            fechaPedido: string;
            /** @enum {string} */
            estado: "pendiente_pago" | "pagado" | "en_preparacion" | "despachado" | "entregado" | "listo_para_retiro" | "retirado" | "cancelado";
            /**
             * Format: date-time
             * @description Hasta cuándo se puede pagar; solo mientras espera el pago.
             */
            pagarHasta: string | null;
            /** @enum {string} */
            tipoEntrega: "despacho" | "retiro";
            /** @enum {string} */
            tipoDocumento: "boleta" | "factura";
            /** @example 19 */
            porcentajeIva: number;
            montos: components["schemas"]["MontosDto"];
            /**
             * @description Código del cupón aplicado (SCRUM-150).
             * @example LOREAL20
             */
            cupon: string | null;
            items: components["schemas"]["LineaPedidoDto"][];
            envio: components["schemas"]["EnvioPedidoDto"] | null;
            documento: components["schemas"]["DocumentoPedidoDto"] | null;
            idTransaccionPago: string | null;
            cliente: components["schemas"]["ClientePedidoDto"];
            /** @description Del primero al último. */
            historial: components["schemas"]["CambioHistorialDto"][];
            cambiosPermitidos: components["schemas"]["CambioPermitidoDto"][];
            /** @description Solo un pedido pendiente de pago (E8-H3). */
            sePuedeCancelar: boolean;
        };
        FacturaGestionDto: {
            /** @example AB12CD34EF56 */
            codigoPedido: string;
            /** @example Peluquería Bella Ltda. */
            razonSocial: string;
            /** @example 76123456-0 */
            rut: string;
            /**
             * @description Total con IVA, en pesos.
             * @example 25990
             */
            total: number;
            /** @enum {string} */
            estado: "por_emitir" | "emitida";
            /** @description `null` mientras está por emitir. */
            folio: number | null;
        };
        ListadoFacturasGestionDto: {
            items: components["schemas"]["FacturaGestionDto"][];
            /**
             * @description Cuántas quedan por emitir.
             * @example 3
             */
            porEmitir: number;
            /** @example 10 */
            total: number;
            /** @example 1 */
            pagina: number;
            /** @example 20 */
            limite: number;
        };
        ReceptorFacturaDto: {
            razonSocial: string;
            /** @example 76123456-0 */
            rut: string;
            giro: string;
            direccion: string;
            /** @description Nombre de la comuna. */
            comuna: string;
        };
        MontosFacturaDto: {
            /** @example 21840 */
            neto: number;
            /** @example 4150 */
            iva: number;
            /** @example 25990 */
            total: number;
        };
        DetalleFacturaGestionDto: {
            /** @example AB12CD34EF56 */
            codigoPedido: string;
            /** @enum {string} */
            estado: "por_emitir" | "emitida";
            receptor: components["schemas"]["ReceptorFacturaDto"];
            montos: components["schemas"]["MontosFacturaDto"];
            /** @example 19 */
            porcentajeIva: number;
            folio: number | null;
            /** Format: date */
            fechaEmision: string | null;
        };
        ConfirmarPagoDto: {
            /**
             * @description Id del pago que Mercado Pago entrega al volver a la tienda (`payment_id`).
             * @example 1234567890
             */
            pagoId: string;
        };
        IndicadorDto: {
            /** @enum {string} */
            codigo: "OE1" | "OE2" | "OE3";
            /** @example Profesionales verificados que compran */
            nombre: string;
            /**
             * @description Meta en porcentaje.
             * @example 30
             */
            meta: number;
            /**
             * @description Con un decimal; `null` sin nada que medir en el período.
             * @example 42.9
             */
            porcentaje: number | null;
            /**
             * @description Lo que cumple el objetivo, de `total`.
             * @example 3
             */
            cumplidos: number;
            /** @example 7 */
            total: number;
            sinDatos: boolean;
            /**
             * @description Frente a la meta: `sobre-la-meta` si la alcanza o la supera, `bajo-la-meta` si no, `sin-datos` sin nada que medir.
             * @enum {string}
             */
            estado: "sobre-la-meta" | "bajo-la-meta" | "sin-datos";
        };
        ReporteIndicadoresRespuestaDto: {
            /**
             * Format: date
             * @example 2026-11-01
             */
            desde: string;
            /**
             * Format: date
             * @example 2026-11-30
             */
            hasta: string;
            indicadores: components["schemas"]["IndicadorDto"][];
        };
        CarritosDelMesDto: {
            /**
             * @description AAAA-MM, en hora de Chile.
             * @example 2026-11
             */
            mes: string;
            /** @example 12 */
            abandonados: number;
            /**
             * @description De los abandonados ese mes, cuántos terminaron en una compra pagada.
             * @example 3
             */
            recuperados: number;
            /**
             * @description Recuperados sobre abandonados, de 0 a 100 al entero; `null` sin abandonos.
             * @example 25
             */
            porcentajeRecuperados: number | null;
        };
        TotalCarritosDto: {
            /** @example 30 */
            abandonados: number;
            /** @example 6 */
            recuperados: number;
            /** @example 20 */
            porcentajeRecuperados: number | null;
        };
        ReporteCarritosRespuestaDto: {
            /** @example 2026-01 */
            desde: string;
            /** @example 2026-12 */
            hasta: string;
            meses: components["schemas"]["CarritosDelMesDto"][];
            total: components["schemas"]["TotalCarritosDto"];
        };
        SegmentoGuardadoDto: {
            /**
             * @example [
             *       "profesional"
             *     ]
             */
            tipos: ("cliente" | "profesional" | "suscriptor")[];
            /**
             * @description Ids de las categorías (con sus subcategorías).
             * @example [
             *       3
             *     ]
             */
            categorias: number[];
            /**
             * @description Ids de las marcas.
             * @example []
             */
            marcas: number[];
            /** @description Con un pedido pagado en los últimos N días. */
            compraEnUltimosDias: number | null;
            /** @description Último pedido pagado hace más de N días. */
            sinComprarHaceDias: number | null;
            /** @description Mínimo de pedidos pagados. */
            pedidosMinimo: number | null;
            /** @description Máximo de pedidos pagados. */
            pedidosMaximo: number | null;
            /** @description Gasto mínimo con IVA, en pesos. */
            gastoMinimo: number | null;
            /** @description Gasto máximo con IVA, en pesos. */
            gastoMaximo: number | null;
            /** @description Edad mínima en años cumplidos. */
            edadMinima: number | null;
            /** @description Edad máxima en años cumplidos. */
            edadMaxima: number | null;
            /** @description Cuenta creada en los últimos N días. */
            registroUltimosDias: number | null;
            /** @description Cuenta creada hace más de N días. */
            registroHaceMasDias: number | null;
            /** @description Código CUT de las regiones de sus direcciones. */
            regiones: string[];
            /** @description Código CUT de las comunas de sus direcciones. */
            comunas: string[];
            /** @description Meses de cumpleaños (1 a 12). */
            mesesCumpleanos: number[];
            /** @description Géneros, tal como los escribió la cuenta. */
            generos: string[];
            /** @description Solo cuentas con productos en el carrito. */
            conCarrito: boolean;
        };
        FilaReporteCampanaDto: {
            /**
             * @description Id de la campaña. `null` en el saludo de cumpleaños por defecto, que no tiene fila.
             * @example 12
             */
            id: number | null;
            /**
             * @description Asunto de la campaña, o «Saludo de cumpleaños».
             * @example Nueva línea reparadora
             */
            nombre: string;
            /**
             * @description El saludo de cumpleaños: sus correos de un mes, en una fila.
             * @example false
             */
            automatica: boolean;
            /**
             * @description Campaña: cuándo se confirmó el envío (ISO 8601). Automática: el mes (AAAA-MM, hora de Chile).
             * @example 2026-11-04T15:30:00.000Z
             */
            fecha: string;
            /** @description `null` en el saludo de cumpleaños. */
            segmento: components["schemas"]["SegmentoGuardadoDto"] | null;
            /**
             * @description Correos que salieron.
             * @example 120
             */
            enviados: number;
            /**
             * @description De los enviados, cuántos se abrieron (0 a 100, sin decimales). `null` si no salió ninguno.
             * @example 41
             */
            porcentajeAbiertos: number | null;
            /**
             * @description De los enviados, cuántos tuvieron un clic (0 a 100, sin decimales). `null` si no salió ninguno.
             * @example 9
             */
            porcentajeClic: number | null;
            /** @example 2 */
            rebotados: number;
            /**
             * @description No salieron porque la persona ya no aceptaba publicidad al enviar (E12-H2).
             * @example 1
             */
            cancelados: number;
            /** @example 0 */
            fallidos: number;
        };
        ReportePeriodoCampanasDto: {
            /**
             * Format: date
             * @example 2026-11-01
             */
            desde: string;
            /**
             * Format: date
             * @example 2026-11-30
             */
            hasta: string;
            /** @description Las más recientes primero. */
            campanas: components["schemas"]["FilaReporteCampanaDto"][];
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
        SuscribirseDto: {
            /**
             * @description Se guarda recortado y en minúsculas.
             * @example camila@correo.cl
             */
            email: string;
        };
        ConfirmarSuscripcionDto: {
            /** @description Token firmado que llegó en el enlace del correo. */
            token: string;
        };
        DarDeBajaDto: {
            /** @example camila@correo.cl */
            email: string;
        };
        BajaRespuestaDto: {
            /** @example camila@correo.cl */
            email: string;
            /** @description Hay una cuenta con esa dirección. */
            cuenta: boolean;
            /** @description Hay una suscripción sin cuenta (LEAD) con esa dirección. */
            suscripcion: boolean;
            /** @example Listo. camila@correo.cl ya no recibirá publicidad. */
            mensaje: string;
        };
        SegmentoCampanaDto: {
            /**
             * @description Al menos uno. `suscriptor`: personas suscritas a ofertas sin cuenta. Solo reciben quienes aceptaron publicidad.
             * @example [
             *       "cliente"
             *     ]
             */
            tipos: ("cliente" | "profesional" | "suscriptor")[];
            /**
             * @description Solo cuentas que compraron algún producto de estas categorías (o sus subcategorías) o de las marcas indicadas.
             * @example [
             *       3
             *     ]
             */
            categorias?: number[];
            /**
             * @description Solo cuentas que compraron algún producto de estas marcas o de las categorías indicadas.
             * @example [
             *       7
             *     ]
             */
            marcas?: number[];
            /**
             * @description Con un pedido pagado en los últimos N días.
             * @example 30
             */
            compraEnUltimosDias?: number | null;
            /**
             * @description Compró alguna vez, pero su último pedido pagado es de hace más de N días (para reactivar).
             * @example 90
             */
            sinComprarHaceDias?: number | null;
            /** @description Mínimo de pedidos pagados. */
            pedidosMinimo?: number | null;
            /** @description Máximo de pedidos pagados (0: nunca compró). */
            pedidosMaximo?: number | null;
            /** @description Mínimo gastado en pedidos pagados, en pesos con IVA. */
            gastoMinimo?: number | null;
            /** @description Máximo gastado en pedidos pagados, en pesos con IVA. */
            gastoMaximo?: number | null;
            /**
             * @description Código CUT de regiones: cuentas con alguna dirección guardada en una de ellas o en las comunas indicadas.
             * @example [
             *       "13"
             *     ]
             */
            regiones?: string[];
            /**
             * @description Código CUT de comunas: cuentas con alguna dirección guardada en una de ellas o en las regiones indicadas.
             * @example [
             *       "13101"
             *     ]
             */
            comunas?: string[];
            /**
             * @description Mes de cumpleaños (1 a 12).
             * @example [
             *       11,
             *       12
             *     ]
             */
            mesesCumpleanos?: number[];
            /** @description Edad mínima en años cumplidos (sin fecha de nacimiento no entra). */
            edadMinima?: number | null;
            /** @description Edad máxima en años cumplidos (sin fecha de nacimiento no entra). */
            edadMaxima?: number | null;
            /**
             * @description Género que escribió la cuenta, tal cual.
             * @example [
             *       "Femenino"
             *     ]
             */
            generos?: string[];
            /** @description Cuenta creada en los últimos N días. */
            registroUltimosDias?: number | null;
            /** @description Cuenta creada hace más de N días. */
            registroHaceMasDias?: number | null;
            /** @description Solo cuentas con productos en el carrito, aún sin comprar. */
            conCarrito?: boolean;
        };
        CrearCampanaDto: {
            /** @example Nueva línea reparadora con 20 % de descuento */
            asunto: string;
            /**
             * @description Texto plano. Una línea en blanco separa los párrafos; el HTML se muestra tal cual, sin interpretarse. Acepta los marcadores {nombre}, {apellido}, {nombre_completo} y {enlace_tienda}, que cada correo cambia por los datos de quien lo recibe.
             * @example Hola:
             *
             *     Llegó la nueva línea reparadora. Encuéntrala en la tienda.
             */
            cuerpo: string;
            segmento: components["schemas"]["SegmentoCampanaDto"];
        };
        AutorCampanaDto: {
            /** @example Camila */
            nombre: string;
            /** @example Rojas */
            apellido: string;
        };
        EnviosCampanaDto: {
            /** @example 120 */
            total: number;
            /** @example 0 */
            pendientes: number;
            /** @example 115 */
            enviados: number;
            /** @example 1 */
            fallidos: number;
            /** @example 2 */
            cancelados: number;
            /** @example 2 */
            rebotados: number;
        };
        DetalleCampanaDto: {
            /** @example 12 */
            id: number;
            /** @example Nueva línea reparadora */
            asunto: string;
            /** @description Texto plano: una línea en blanco separa los párrafos. */
            cuerpo: string;
            segmento: components["schemas"]["SegmentoGuardadoDto"];
            /**
             * @description Si ya se confirmó el envío.
             * @example false
             */
            enviada: boolean;
            /**
             * Format: date-time
             * @example 2026-11-04T15:30:00.000Z
             */
            fechaCreacion: string;
            /**
             * Format: date-time
             * @description Cuándo se confirmó el envío; `null` en un borrador.
             * @example null
             */
            fechaEnvio: string | null;
            creadaPor: components["schemas"]["AutorCampanaDto"];
            /** @description Sus correos por estado. */
            envios: components["schemas"]["EnviosCampanaDto"];
        };
        ContactosCampanasDto: {
            /**
             * @description Direcciones que recibirían hoy una campaña a todos (cuentas y suscriptores sin cuenta, cada una una vez).
             * @example 812
             */
            aceptanPublicidad: number;
            /**
             * @description Cuentas cliente o profesional activas, con el correo verificado, que aceptan publicidad.
             * @example 640
             */
            cuentasVerificadas: number;
            /**
             * @description Suscriptores confirmados, sin baja y sin una cuenta con el mismo correo.
             * @example 172
             */
            suscriptoresSinCuenta: number;
            /**
             * @description Direcciones con algún correo rebotado.
             * @example 9
             */
            conRebote: number;
        };
        CampanaListadaDto: {
            /** @example 12 */
            id: number;
            /** @example Nueva línea reparadora */
            asunto: string;
            /** @description Texto plano: una línea en blanco separa los párrafos. */
            cuerpo: string;
            segmento: components["schemas"]["SegmentoGuardadoDto"];
            /**
             * @description Si ya se confirmó el envío.
             * @example false
             */
            enviada: boolean;
            /**
             * Format: date-time
             * @example 2026-11-04T15:30:00.000Z
             */
            fechaCreacion: string;
            /**
             * Format: date-time
             * @description Cuándo se confirmó el envío; `null` en un borrador.
             * @example null
             */
            fechaEnvio: string | null;
            creadaPor: components["schemas"]["AutorCampanaDto"];
            /**
             * @description Borrador: cuántas direcciones la recibirían hoy. Enviada: a cuántas salió.
             * @example 812
             */
            destinatarios: number;
            /**
             * @description Enviada: de los correos enviados, cuántos se abrieron (0 a 100, sin decimales). `null` en un borrador o sin envíos.
             * @example 41
             */
            porcentajeApertura: number | null;
        };
        ListadoCampanasDto: {
            contactos: components["schemas"]["ContactosCampanasDto"];
            /** @description De la más nueva a la más antigua. */
            items: components["schemas"]["CampanaListadaDto"][];
            /** @example 14 */
            total: number;
            /** @example 1 */
            pagina: number;
            /** @example 20 */
            limite: number;
        };
        ActualizarCampanaDto: {
            asunto?: string;
            cuerpo?: string;
            /** @description Reemplaza el segmento completo. */
            segmento?: components["schemas"]["SegmentoCampanaDto"];
        };
        RenderizarCampanaDto: {
            /** @example Nueva línea reparadora con 20 % de descuento */
            asunto: string;
            /**
             * @description Texto plano. Una línea en blanco separa los párrafos; el HTML se muestra tal cual, sin interpretarse. Acepta los marcadores {nombre}, {apellido}, {nombre_completo} y {enlace_tienda}, que cada correo cambia por los datos de quien lo recibe.
             * @example Hola:
             *
             *     Llegó la nueva línea reparadora. Encuéntrala en la tienda.
             */
            cuerpo: string;
            /**
             * @description El borrador que se está editando: con él, `{cupon}` muestra el código de su cupón activo (SCRUM-150).
             * @example 12
             */
            campanaId?: number;
        };
        CorreoCampanaDto: {
            /** @example Nueva línea reparadora */
            asunto: string;
            /** @description HTML del correo, con el correo para pedir la baja en el pie. */
            html: string;
            /** @description Versión en texto plano del correo. */
            texto: string;
        };
        VistaPreviaCampanaDto: {
            /** @example Nueva línea reparadora */
            asunto: string;
            /** @description HTML del correo. */
            html: string;
            /** @description Versión en texto plano del correo. */
            texto: string;
            /**
             * @description Direcciones que lo recibirían hoy (cada una una vez).
             * @example 812
             */
            destinatarios: number;
            /** @description Se entrega en `POST /:id/envio`. Vence a la hora. */
            confirmacion: string;
        };
        EnviarCampanaDto: {
            /**
             * @description El valor `confirmacion` de una vista previa de la última hora. Si la campaña cambió después o pasó la hora, hay que pedir otra.
             * @example 1793920312.q3Zr0cU9mJ1kHk2b8vY6xW4tS7nP5aL0eD3fG2hJ1kM
             */
            confirmacion: string;
        };
        CampanaEnviadaDto: {
            /** @example 12 */
            id: number;
            /**
             * Format: date-time
             * @example 2026-11-06T15:30:00.000Z
             */
            fechaEnvio: string;
            /** @example 812 */
            destinatarios: number;
        };
        OfertaGuardadaCumpleanosDto: {
            /** @example true */
            activa: boolean;
            /**
             * @description Se conserva aunque la oferta esté inactiva.
             * @example 20 % de descuento durante tu semana de cumpleaños.
             */
            texto: string | null;
        };
        ConfiguracionCumpleanosDto: {
            /**
             * @description Si el saludo sale. Por defecto, activo.
             * @example true
             */
            activo: boolean;
            /** @example ¡Feliz cumpleaños de parte de Cabello Perfecto! */
            asunto: string;
            /** @description Saludo en texto plano. */
            cuerpo: string;
            oferta: components["schemas"]["OfertaGuardadaCumpleanosDto"];
            /**
             * @description `false` mientras nunca se guardó: rige el saludo por defecto, sin oferta.
             * @example true
             */
            configurado: boolean;
            /**
             * @description Cuentas que cumplen años este mes (hora de Chile) y recibirían el saludo: activas, con correo verificado y que aceptan publicidad. 0 con el saludo apagado.
             * @example 12
             */
            programadosEsteMes: number;
            /**
             * @description Porcentaje (0 a 100, sin decimales) de los saludos enviados el mes calendario anterior que se abrieron. `null` si ese mes no se envió ninguno.
             * @example 41
             */
            porcentajeAperturaUltimoMes: number | null;
        };
        OfertaCumpleanosDto: {
            /**
             * @description Incluir la oferta en el saludo.
             * @example true
             */
            activa: boolean;
            /**
             * @description Texto plano de la oferta. Obligatorio si está activa; si no, se guarda para activarla después.
             * @example 20 % de descuento en toda la tienda durante tu semana de cumpleaños.
             */
            texto?: string | null;
        };
        ConfigurarCumpleanosDto: {
            /**
             * @description Si el saludo sale. Apagado, no se envía ninguno; la oferta y los textos se conservan.
             * @example true
             */
            activo: boolean;
            /** @example ¡Feliz cumpleaños de parte de Cabello Perfecto! */
            asunto: string;
            /**
             * @description Texto plano. Una línea en blanco separa los párrafos; el HTML se muestra tal cual, sin interpretarse. El correo antepone «Hola, {nombre}:».
             * @example En Cabello Perfecto queremos desearte un muy feliz cumpleaños.
             */
            cuerpo: string;
            oferta: components["schemas"]["OfertaCumpleanosDto"];
        };
        DestinoSlideDto: {
            /** @enum {string} */
            tipo: "producto" | "pack" | "categoria" | "marca" | "pagina";
            /**
             * @description Id del producto, pack, categoría o marca; con `tipo` = `pagina`, una de: catalogo, packs, precio-profesional.
             * @example 12
             */
            destino: string;
            /**
             * @description Nombre del destino, para anunciar el enlace. En la tienda siempre viene; en el panel es `null` si el destino ya no existe.
             * @example Pack reparación
             */
            nombre: string | null;
        };
        SlidePortadaDto: {
            /** @example 3 */
            id: number;
            /** @example https://imagenes.cabelloperfecto.cl/portada/a1.webp */
            imagenEscritorio: string;
            /** @description Sin ella, el celular muestra la de escritorio. */
            imagenCelular: string | null;
            destino: components["schemas"]["DestinoSlideDto"];
        };
        SlidePortadaPanelDto: {
            /** @example 3 */
            id: number;
            /** @example https://imagenes.cabelloperfecto.cl/portada/a1.webp */
            imagenEscritorio: string;
            /** @description Sin ella, el celular muestra la de escritorio. */
            imagenCelular: string | null;
            destino: components["schemas"]["DestinoSlideDto"];
            /** @example 1 */
            orden: number;
            /** @description Falso si el destino ya no está a la venta o no existe: la tienda no muestra el slide. */
            disponible: boolean;
        };
        OpcionDestinoDto: {
            /** @example 12 */
            destino: string;
            /** @example Pack reparación */
            nombre: string;
        };
        OrdenarSlidesDto: {
            /**
             * @description Ids de todos los slides, cada uno una vez, en el orden en que se mostrarán.
             * @example [
             *       3,
             *       1,
             *       2
             *     ]
             */
            orden: number[];
        };
        DestinoPortadaDto: {
            /**
             * @example pack
             * @enum {string}
             */
            tipoDestino: "producto" | "pack" | "categoria" | "marca" | "pagina";
            /**
             * @description Id del producto, pack, categoría o marca; o la clave de la página (`catalogo`, `packs`, `precio-profesional`). Las opciones salen de `GET /portada/destinos`.
             * @example 12
             */
            destino: string;
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
    CambioRolController_cambiar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                codigoPublico: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CambiarRolDto"];
            };
        };
        responses: {
            /** @description Rol cambiado y registrado en el historial. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Rol no permitido o motivo faltante o inválido. */
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
            /** @description No existe esa cuenta. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Cuenta desactivada, cambio que no baja el rol o último administrador activo. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ClientesController_listar: {
        parameters: {
            query?: {
                pagina?: number;
                limite?: number;
                /** @description Palabras contenidas en el nombre, el apellido o el correo, sin distinguir mayúsculas; o un RUT, con o sin puntos y guion. */
                buscar?: string;
                /** @description Solo las cuentas de este rol. */
                rol?: "cliente" | "profesional";
                /** @description Con `true`, solo las activas; con `false`, solo las desactivadas. Sin él, todas. */
                activo?: boolean;
            };
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
                    "application/json": components["schemas"]["ListadoClientesDto"];
                };
            };
            /** @description Filtros inválidos. */
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
        };
    };
    ClientesController_detalle: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description UUID de la cuenta. */
                codigoPublico: string;
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
                    "application/json": components["schemas"]["ClienteDetalleDto"];
                };
            };
            /** @description El código no es válido. */
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
            /** @description No existe o es una cuenta del personal. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ClientesController_desactivar: {
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
            /** @description El código no es válido. */
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
            /** @description No existe o es una cuenta del personal. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ClientesController_reactivar: {
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
            /** @description Cuenta reactivada. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El código no es válido. */
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
            /** @description No existe o es una cuenta del personal. */
            404: {
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
    EntradasController_listar: {
        parameters: {
            query?: {
                pagina?: number;
                limite?: number;
                /** @description Solo las entradas recibidas en una ubicación de esta bodega. */
                bodegaId?: number;
                /** @description Texto contenido en la razón social del proveedor o en el número de documento. */
                buscar?: string;
                /** @description Recibidas desde este día. */
                desde?: string;
                /** @description Recibidas hasta este día incluido. */
                hasta?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Entradas, paginadas. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListadoEntradasDto"];
                };
            };
            /** @description Filtros inválidos o `hasta` anterior a `desde`. */
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
            /** @description Entrada registrada, con sus subtotales y totales. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["EntradaRegistradaDto"];
                };
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
    StockController_listar: {
        parameters: {
            query?: {
                pagina?: number;
                limite?: number;
                /** @description Solo los formatos con unidades en esta bodega; las ubicaciones y el stock de cada fila son los de ella. */
                bodegaId?: number;
                /** @description Texto contenido en el nombre del producto, el del formato o el SKU, sin distinguir mayúsculas. */
                buscar?: string;
                /** @description Con `true`, solo los formatos bajo su stock mínimo. */
                bajoMinimo?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Stock por formato. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListadoStockDto"];
                };
            };
            /** @description Bodega, búsqueda o paginación inválidas. */
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
            /** @description El rol no tiene el permiso de consultar inventario. */
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
    UbicacionesController_listar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Ubicaciones activas. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UbicacionInventarioDto"][];
                };
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
    BodegasController_listar: {
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
                    "application/json": components["schemas"]["BodegaPanelDto"][];
                };
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar bodegas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BodegasController_crear: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearBodegaDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BodegaPanelDto"];
                };
            };
            /** @description Datos inválidos o comuna que no existe. */
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
            /** @description El rol no tiene el permiso de gestionar bodegas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BodegasController_actualizar: {
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
                "application/json": components["schemas"]["ActualizarBodegaDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BodegaPanelDto"];
                };
            };
            /** @description Datos inválidos o comuna que no existe. */
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
            /** @description El rol no tiene el permiso de gestionar bodegas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La bodega no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Tiene stock y se pidió desactivarla. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BodegasController_crearUbicacion: {
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
                "application/json": components["schemas"]["CrearUbicacionDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BodegaPanelDto"];
                };
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar bodegas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La bodega no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La bodega ya tiene ese código. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    BodegasController_actualizarUbicacion: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
                ubicacionId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ActualizarUbicacionDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BodegaPanelDto"];
                };
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar bodegas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La ubicación no es de esa bodega. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Código repetido en la bodega, o tiene stock y se pidió desactivarla. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MovimientosController_listar: {
        parameters: {
            query?: {
                pagina?: number;
                limite?: number;
                /** @description Solo los movimientos con origen o destino en una ubicación de esta bodega. */
                bodegaId?: number;
                /** @description «entradas»: entrada, ajuste positivo y reingreso; «salidas»: mermas, consumo y ajuste negativo. Sin él, todos. */
                grupo?: "entradas" | "ventas" | "salidas" | "transferencias";
                /** @description Desde este día, en hora de Chile. */
                desde?: string;
                /** @description Hasta este día incluido, en hora de Chile. */
                hasta?: string;
                /** @description Texto contenido en el producto, el formato o la referencia (documento, código del pedido u observación). */
                buscar?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Movimientos, paginados. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListadoMovimientosDto"];
                };
            };
            /** @description Filtros inválidos o `hasta` anterior a `desde`. */
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
            /** @description El rol no tiene el permiso de consultar inventario. */
            403: {
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
    MarcasController_eliminar: {
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
            /** @description Marca borrada. */
            204: {
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
            /** @description La marca no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La usan productos, cupones o imágenes de la portada. */
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
    CategoriasController_eliminar: {
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
            /** @description Categoría borrada. */
            204: {
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
            /** @description La categoría no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La usan productos, subcategorías, cupones o imágenes de la portada. */
            409: {
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
                /** @description Texto contenido en el nombre, la marca o el SKU de un formato, sin distinguir mayúsculas. */
                buscar?: string;
                /** @description Solo productos de esta categoría. */
                categoriaId?: number;
                /** @description Solo productos de esta marca. */
                marcaId?: number;
                /** @description Con `true` incluye también los productos desactivados. */
                incluirInactivos?: boolean;
                /** @description Con `true`, solo los productos desactivados (SCRUM-150). */
                soloInactivos?: boolean;
                /** @description Solo los productos de este canal; `profesional` son los exclusivos (SCRUM-150). */
                canalVenta?: "general" | "profesional";
                /** @description Con `true`, solo los que tienen algún formato bajo su stock mínimo (SCRUM-150). */
                stockBajo?: boolean;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Página de productos con el total y los conteos. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListadoProductosPanelDto"];
                };
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
            /** @description Datos inválidos, marca desactivada o sugerencia con una firma que no corresponde. */
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
            /** @description Datos inválidos, cuerpo vacío, marca desactivada, sugerencia sin descripción o con una firma que no corresponde. */
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
    FormatosController_buscar: {
        parameters: {
            query?: {
                pagina?: number;
                limite?: number;
                /** @description Texto contenido en el nombre del producto, el del formato o el SKU, sin distinguir mayúsculas. */
                buscar?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Formatos encontrados, paginados. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListadoFormatosBuscadosDto"];
                };
            };
            /** @description Búsqueda o paginación inválidas. */
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
            /** @description El rol no gestiona el catálogo ni registra inventario. */
            403: {
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
            /** @description La imagen supera los 4 MB. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El almacenamiento de archivos no está configurado. */
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
    SugerenciaDescripcionController_sugerir: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
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
            /** @description Descripción e ingredientes sugeridos. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        descripcion?: string;
                        ingredientes?: string | null;
                        /** @description Se reenvía en `sugerencia` al crear o editar el producto para registrar el origen de la descripción. */
                        firma?: string;
                    };
                };
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
            /** @description La imagen supera los 4 MB. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La foto no se puede leer; la descripción se puede escribir a mano. */
            422: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 15 sugerencias en un minuto con la misma cuenta. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El servicio de IA no respondió o no está configurado; la descripción se puede escribir a mano. */
            503: {
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
                /** @description Texto a buscar, sin distinguir mayúsculas. Cada palabra debe estar en el nombre del producto, en su marca o en su categoría o subcategoría. Hasta 5 palabras. Vacío no filtra. */
                buscar?: string;
                /** @description Productos de estas categorías y de todas sus subcategorías, a cualquier profundidad. Se repite para marcar varias (`categoriaId=3&categoriaId=5`): basta estar en una. */
                categoriaId?: number[];
                /** @description Productos de estas marcas. Se repite para marcar varias: basta ser de una. Entre categorías y marcas se exigen las dos. */
                marcaId?: number[];
                pagina?: number;
                limite?: number;
                /** @description Sin él, por nombre. `mas-vendidos`: unidades vendidas en los últimos 30 días en pedidos pagados (no cancelados); `novedades`: los creados más recientemente. Los empates, por nombre. */
                orden?: "mas-vendidos" | "novedades";
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
            /** @description Alguna categoría no existe, o alguna marca no existe o no está activa. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    TiendaController_facetas: {
        parameters: {
            query?: {
                /** @description Texto a buscar, sin distinguir mayúsculas. Cada palabra debe estar en el nombre del producto, en su marca o en su categoría o subcategoría. Hasta 5 palabras. Vacío no filtra. */
                buscar?: string;
                /** @description Productos de estas categorías y de todas sus subcategorías, a cualquier profundidad. Se repite para marcar varias (`categoriaId=3&categoriaId=5`): basta estar en una. */
                categoriaId?: number[];
                /** @description Productos de estas marcas. Se repite para marcar varias: basta ser de una. Entre categorías y marcas se exigen las dos. */
                marcaId?: number[];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Conteos por categoría y marca. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["FacetasTiendaDto"];
                };
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
            /** @description Alguna categoría no existe, o alguna marca no existe o no está activa. */
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
    DescargarFacturaPersonalController_descargar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                codigoPedido: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description El PDF de la factura. */
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
            /** @description El rol no tiene el permiso de gestionar la facturación (solo vendedor y administrador). */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El pedido no existe o su factura aún no está registrada. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El almacén de archivos no está configurado o no responde. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RegistrarFacturaController_registrar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                codigoPedido: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    archivo: string;
                    /** @example 4521 */
                    folio: number;
                    /** @example 2026-10-30 */
                    fechaEmision?: string;
                };
            };
        };
        responses: {
            /** @description Factura registrada. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin PDF, el archivo no es un PDF, o el folio o la fecha no son válidos. */
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
            /** @description El rol no tiene el permiso de gestionar la facturación (solo vendedor y administrador). */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El pedido no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El pedido no pidió factura, no está pagado, ya tiene factura, o el folio ya existe. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El PDF supera los 4 MB. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El almacén de archivos no está configurado o no responde. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DescargarDocumentoController_descargar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                codigoPedido: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description El PDF de la factura. */
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
            /** @description El pedido no existe o no es de esta cuenta, o su factura aún no está registrada. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El almacén de archivos no está configurado o no responde. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SolicitudVerificacionController_solicitar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Solicitud registrada: `aprobada`, o `pendiente` con `requiereDocumentos` en `true`. */
            201: {
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
            /** @description La cuenta no tiene RUT, ya es profesional o ya tiene una solicitud pendiente, en revisión manual o aprobada. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 5 solicitudes por hora de la misma cuenta. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SolicitudVerificacionController_adjuntarDocumentos: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    archivos: string[];
                    tipos: ("titulo" | "certificado" | "otro")[];
                };
            };
        };
        responses: {
            /** @description Documentos guardados: la solicitud queda en `revision_manual`. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin documentos, más de 5, un archivo que no es PDF, JPG ni PNG, o los tipos no coinciden con los archivos. */
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
            /** @description La cuenta nunca envió una solicitud. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La solicitud ya fue aprobada, ya tiene documentos en revisión o fue rechazada (hay que enviar una nueva). */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Un documento supera los 4 MB. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 5 envíos de documentos por hora de la misma cuenta. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El almacén de archivos no está configurado o no responde. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SolicitudVerificacionController_verMiSolicitud: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description La solicitud más reciente. */
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
            /** @description La cuenta nunca envió una solicitud. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RevisionVerificacionController_aprobar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Código público (UUID) de la cuenta que solicitó. */
                codigoPublico: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Solicitud aprobada. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El código de la cuenta no es válido. */
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
            /** @description El rol no tiene el permiso de gestionar verificaciones. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La cuenta no existe o nunca envió una solicitud. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La solicitud más reciente no está en revisión manual, o la cuenta está desactivada o ya no es cliente. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RevisionVerificacionController_rechazar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Código público (UUID) de la cuenta que solicitó. */
                codigoPublico: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RechazarSolicitudDto"];
            };
        };
        responses: {
            /** @description Solicitud rechazada con su motivo. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta el motivo, tiene menos de 10 o más de 1000 caracteres, o el código de la cuenta no es válido. */
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
            /** @description El rol no tiene el permiso de gestionar verificaciones. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La cuenta no existe o nunca envió una solicitud. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La solicitud más reciente no está en revisión manual: aún no adjunta documentos, o ya fue aprobada o rechazada. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ConsultaVerificacionController_listar: {
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
            /** @description Página de solicitudes con el total; vacía si no hay. */
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
            /** @description Sin sesión válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar verificaciones. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ConsultaVerificacionController_detalle: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Código público (UUID) de la cuenta que solicitó. */
                codigoPublico: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Detalle de la solicitud. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El código de la cuenta no es válido. */
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
            /** @description El rol no tiene el permiso de gestionar verificaciones. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La cuenta no existe o nunca envió una solicitud. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ConsultaVerificacionController_enlaceDocumento: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description Código público (UUID) de la cuenta que solicitó. */
                codigoPublico: string;
                /** @description Posición del documento en la solicitud, desde 1. */
                numero: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Enlace temporal y hasta cuándo sirve. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El código de la cuenta o el número no son válidos. */
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
            /** @description El rol no tiene el permiso de gestionar verificaciones. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La cuenta no tiene solicitudes o la solicitud no tiene ese documento. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El archivo ya se eliminó; el mensaje indica cuándo. */
            410: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PerfilProfesionalController_obtener: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Perfil profesional de la cuenta. */
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
            /** @description La cuenta no tiene la verificación aprobada (no es profesional). Un cliente recién aprobado debe renovar la sesión. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Aún no completa su perfil. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PerfilProfesionalController_guardar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GuardarPerfilProfesionalDto"];
            };
        };
        responses: {
            /** @description Perfil guardado. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta algún dato obligatorio o hay datos inválidos. El mensaje indica cuáles. */
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
            /** @description La cuenta no tiene la verificación aprobada (no es profesional). Un cliente recién aprobado debe renovar la sesión. */
            403: {
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
    CarritoController_unir: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ArticulosNavegadorDto"];
            };
        };
        responses: {
            /** @description Carrito de la cuenta con la unión. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Lista vacía, con más de 50 artículos, con artículos repetidos o con cantidades inválidas. */
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
    CarritoVisitanteController_cotizar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ArticulosNavegadorDto"];
            };
        };
        responses: {
            /** @description Carrito del visitante con sus totales. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Lista vacía, con más de 50 artículos, con artículos repetidos o con cantidades inválidas. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 60 cotizaciones por minuto desde la IP. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    DespachoController_cotizar: {
        parameters: {
            query: {
                /** @description Id de una dirección de la cuenta. */
                direccionId: number;
                /** @description Cupón que se aplicará (SCRUM-150): el total ya trae su descuento. Si no aplica, 400 junto a `codigoCupon`. */
                codigoCupon?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Costo del despacho y total a pagar. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Dirección inválida. */
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
            /** @description Carrito vacío, o Chilexpress no tiene servicio para esa comuna y bulto: se ofrece retiro en tienda. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 10 solicitudes por minuto de la misma cuenta. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Chilexpress no responde: no se puede cotizar en este momento y se ofrece retiro en tienda. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CambiarEstadoPedidoController_cambiar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                codigoPedido: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CambiarEstadoPedidoDto"];
            };
        };
        responses: {
            /** @description Pedido con su nuevo estado. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Estado inválido, comentario demasiado largo, falta el comentario al volver a un estado anterior, o el código de seguimiento falta al despachar, es inválido o se envía en otro cambio. */
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
            /** @description El rol no tiene el permiso de gestionar pedidos (los clientes no pueden cambiar el estado). */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El pedido no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El cambio no está permitido desde el estado actual del pedido, o el pedido no tiene los datos del envío. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CuponesController_listar: {
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
                    "application/json": components["schemas"]["CuponPanelDto"][];
                };
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CuponesController_crear: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearCuponDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CuponPanelDto"];
                };
            };
            /** @description Datos inválidos, reglas que no calzan entre sí, o artículos, categorías, marcas o campaña que no existen. */
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
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ya existe un cupón con ese código. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CuponesController_obtener: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CuponPanelDto"];
                };
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El cupón no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CuponesController_actualizar: {
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
                "application/json": components["schemas"]["ActualizarCuponDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CuponPanelDto"];
                };
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
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El cupón no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ya existe un cupón con ese código. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CuponCarritoController_validar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ValidarCuponDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CuponCarritoDto"];
                };
            };
            /** @description El cupón no existe, no está vigente, no es para la cuenta, se agotó o no aplica al carrito; el mensaje va en el campo `codigoCupon`. */
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
    MisPedidosController_listar: {
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
            /** @description Página de pedidos con el total; vacía si no tiene. */
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
    CrearPedidoController_crear: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearPedidoDto"];
            };
        };
        responses: {
            /** @description Detalle del pedido. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Datos del pedido inválidos, o factura sin indicar cuáles datos de facturación usar. */
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
            /** @description Cuenta del personal de tienda, o cuenta sin el correo confirmado. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La dirección no es de la cuenta, o los datos de facturación no son de la cuenta o están desactivados. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ya hay un pedido pendiente de pago, carrito vacío o cambiado mientras se cotizaba, artículo que ya no se vende, sin stock, despacho sin cobertura de Chilexpress, o factura sin datos de facturación registrados (E9-H1). */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 5 solicitudes por minuto de la misma cuenta. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Chilexpress no responde: no se crea el pedido y se ofrece retiro en tienda. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    MisPedidosController_obtener: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                codigoPedido: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Detalle del pedido. */
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
            /** @description El pedido no existe o no es de esta cuenta. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CancelarPedidoController_cancelar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                codigoPedido: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CancelarPedidoDto"];
            };
        };
        responses: {
            /** @description Pedido cancelado. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Comentario inválido. */
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
            /** @description El rol no tiene el permiso de gestionar pedidos (los clientes no pueden cancelar). */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El pedido no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El pedido no está pendiente de pago (ya pagado o cancelado). */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GestionPedidosController_listar: {
        parameters: {
            query?: {
                pagina?: number;
                limite?: number;
                /** @description Grupo del filtro; sin él, `por_preparar`. */
                grupo?: "por_preparar" | "listos_para_retiro" | "despachados" | "pendientes_pago" | "todos";
                /** @description Texto contenido en el código del pedido, el nombre, apellido o correo del cliente, la razón social de su factura o el nombre de un producto o pack del pedido. */
                q?: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Pedidos, grupos y el grupo aplicado. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListadoPedidosGestionDto"];
                };
            };
            /** @description Grupo, búsqueda o paginación inválidos. */
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
            /** @description El rol no tiene el permiso de gestionar pedidos. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GestionPedidosController_obtener: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                codigoPedido: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Detalle del pedido para el personal. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DetallePedidoGestionDto"];
                };
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar pedidos. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El pedido no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GestionFacturasController_listar: {
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
            /** @description Facturas, paginadas, con el conteo por emitir. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListadoFacturasGestionDto"];
                };
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
            /** @description El rol no tiene el permiso de gestionar la facturación. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    GestionFacturasController_obtener: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                codigoPedido: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Datos de la factura del pedido. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DetalleFacturaGestionDto"];
                };
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar la facturación. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El pedido no existe, no pidió factura o aún no está pagado. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PagarPedidoController_iniciar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                codigoPedido: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description URL de pago y hora límite. */
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
            /** @description El pedido no existe o no es de esta cuenta. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El pedido ya está pagado, fue cancelado o venció su plazo. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 10 solicitudes por minuto de la misma cuenta. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Mercado Pago no responde o no está configurado. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PagarPedidoController_confirmar: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                codigoPedido: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfirmarPagoDto"];
            };
        };
        responses: {
            /** @description Estado del pago y detalle del pedido (como en E8-H1). */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Id de pago inválido, el pago no es de este pedido o no es por su total. */
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
            /** @description El pedido no existe o no es de esta cuenta. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El pedido ya tenía un pago aprobado o fue cancelado. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 10 solicitudes por minuto de la misma cuenta. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Mercado Pago no responde o no está configurado. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificacionPagoController_recibir: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Notificación recibida o ya registrada. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Notificación de pago firmada, pero sin sus identificadores. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin una firma válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta configurar el secreto de la firma. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReporteStockBajoController_stockBajoMinimo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Formatos bajo su stock mínimo (`formatoId`, `sku`, `producto`, `nombreFormato`, `activo`, `stockTotal`, `stockMinimo`, `faltante`); lista vacía si no hay. */
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
            /** @description El rol no tiene el permiso de ver los reportes. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReporteVentasController_ventas: {
        parameters: {
            query: {
                desde: string;
                hasta: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description `desde`, `hasta` y, para `minorista`, `mayorista` y `total`: `pedidos`, `montoNeto`, `montoIva` y `montoTotal` en pesos. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Fechas inválidas, la fecha hasta anterior a la desde o un período de más de 366 días. */
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
            /** @description El rol no tiene el permiso de ver los reportes. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReporteVentasController_exportar: {
        parameters: {
            query: {
                desde: string;
                hasta: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description El archivo `ventas-<desde>-<hasta>.csv` como descarga. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Fechas inválidas, la fecha hasta anterior a la desde o un período de más de 366 días. */
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
            /** @description El rol no tiene el permiso de ver los reportes. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReporteIndicadoresController_indicadores: {
        parameters: {
            query: {
                desde: string;
                hasta: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description `desde`, `hasta` e `indicadores`: por cada objetivo `codigo`, `nombre`, `meta`, `porcentaje` (con un decimal, o `null`), `cumplidos`, `total`, `sinDatos` y `estado` frente a la meta. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReporteIndicadoresRespuestaDto"];
                };
            };
            /** @description Fechas inválidas, la fecha hasta anterior a la desde o un período de más de 366 días. */
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
            /** @description El rol no tiene el permiso de ver los reportes. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReporteCarritosController_carritosAbandonados: {
        parameters: {
            query: {
                desde: string;
                hasta: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description `desde`, `hasta`, `meses` (cada uno con `mes`, `abandonados`, `recuperados` y `porcentajeRecuperados`) y `total`. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReporteCarritosRespuestaDto"];
                };
            };
            /** @description Meses inválidos, el mes hasta anterior al desde o un período de más de 24 meses. */
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
            /** @description El rol no tiene el permiso de ver los reportes. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReporteCampanasController_periodo: {
        parameters: {
            query: {
                desde: string;
                hasta: string;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Resultados del período. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ReportePeriodoCampanasDto"];
                };
            };
            /** @description Fechas inválidas, `hasta` anterior a `desde` o un período de más de 366 días. */
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
            /** @description El rol no tiene el permiso de ver los reportes. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ReporteCampanasController_resultado: {
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
            /** @description `id`, `tipo`, `asunto`, `fechaEnvio` y `envios` con `total`, `pendientes`, `enviados`, `abiertos`, `clics`, `rebotados`, `cancelados` y `fallidos`. */
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
            /** @description El rol no tiene el permiso de ver los reportes. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La campaña no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La campaña aún no se envía: no tiene resultados. */
            409: {
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
    SuscripcionesController_suscribir: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["SuscribirseDto"];
            };
        };
        responses: {
            /** @description Solicitud recibida. */
            202: {
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
            /** @description Más de 5 peticiones por minuto desde la misma IP. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SuscripcionesController_confirmar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfirmarSuscripcionDto"];
            };
        };
        responses: {
            /** @description Suscripción activa. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Enlace inválido, vencido o anterior a una baja. */
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
    BajasController_darDeBaja: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DarDeBajaDto"];
            };
        };
        responses: {
            /** @description La dirección ya no recibe publicidad. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["BajaRespuestaDto"];
                };
            };
            /** @description Falta el correo o no es válido. */
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
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description No hay cuenta ni suscripción con ese correo. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CampanasController_listar: {
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
            /** @description Página de campañas. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ListadoCampanasDto"];
                };
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
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CampanasController_crear: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CrearCampanaDto"];
            };
        };
        responses: {
            /** @description Campaña creada como borrador. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DetalleCampanaDto"];
                };
            };
            /** @description Datos inválidos, categorías o marcas que no existen, o suscriptores con un filtro de compras. */
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
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CampanasController_obtener: {
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
            /** @description Campaña. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DetalleCampanaDto"];
                };
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La campaña no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CampanasController_actualizar: {
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
                "application/json": components["schemas"]["ActualizarCampanaDto"];
            };
        };
        responses: {
            /** @description Campaña actualizada. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["DetalleCampanaDto"];
                };
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
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La campaña no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La campaña ya fue enviada. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CampanasController_vistaPreviaEnVivo: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RenderizarCampanaDto"];
            };
        };
        responses: {
            /** @description Correo armado. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CorreoCampanaDto"];
                };
            };
            /** @description Asunto o cuerpo inválidos. */
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
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CampanasController_vistaPrevia: {
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
            /** @description Vista previa. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["VistaPreviaCampanaDto"];
                };
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La campaña no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La campaña ya fue enviada. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CampanasController_enviar: {
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
                "application/json": components["schemas"]["EnviarCampanaDto"];
            };
        };
        responses: {
            /** @description Campaña encolada. */
            202: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CampanaEnviadaDto"];
                };
            };
            /** @description Falta la confirmación. */
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
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La campaña no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Ya fue enviada, cambió después de la vista previa o no tiene destinatarios. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CumpleanosController_obtener: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Saludo de cumpleaños. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfiguracionCumpleanosDto"];
                };
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CumpleanosController_configurar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ConfigurarCumpleanosDto"];
            };
        };
        responses: {
            /** @description Saludo guardado. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ConfiguracionCumpleanosDto"];
                };
            };
            /** @description Datos inválidos, o oferta activa sin texto. */
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
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SeguimientoController_apertura: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description GIF transparente de 1×1. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 120 peticiones por minuto desde la misma IP. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    SeguimientoController_clic: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                token: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Redirige al destino del enlace. */
            302: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Más de 120 peticiones por minuto desde la misma IP. */
            429: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RebotesController_recibir: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Aviso recibido. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Sin una firma válida. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Falta configurar el secreto del webhook. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PortadaTiendaController_listar: {
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
                    "application/json": components["schemas"]["SlidePortadaDto"][];
                };
            };
        };
    };
    PortadaPanelController_listar: {
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
                    "application/json": components["schemas"]["SlidePortadaPanelDto"][];
                };
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PortadaPanelController_crear: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    escritorio: string;
                    /** Format: binary */
                    celular?: string;
                    /** @enum {string} */
                    tipoDestino: "producto" | "pack" | "categoria" | "marca" | "pagina";
                    destino: string;
                };
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SlidePortadaPanelDto"][];
                };
            };
            /** @description Falta la imagen de escritorio, una imagen no es JPEG, PNG ni WebP, o el destino no existe o no está a la venta. */
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
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La portada ya tiene 8 slides. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Una imagen supera los 4 MB. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El almacenamiento de archivos no está configurado. */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PortadaPanelController_destinos: {
        parameters: {
            query: {
                tipo: "producto" | "pack" | "categoria" | "marca" | "pagina";
                /** @description Parte del nombre. */
                buscar?: string;
            };
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
                    "application/json": components["schemas"]["OpcionDestinoDto"][];
                };
            };
            /** @description Tipo de destino inválido. */
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
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PortadaPanelController_ordenar: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["OrdenarSlidesDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SlidePortadaPanelDto"][];
                };
            };
            /** @description El orden no trae exactamente los slides de la portada. */
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
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PortadaPanelController_eliminar: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SlidePortadaPanelDto"][];
                };
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El slide no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PortadaPanelController_cambiarDestino: {
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
                "application/json": components["schemas"]["DestinoPortadaDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SlidePortadaPanelDto"][];
                };
            };
            /** @description El destino no existe o no está a la venta. */
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
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El slide no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PortadaPanelController_reemplazarEscritorio: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SlidePortadaPanelDto"][];
                };
            };
            /** @description Sin imagen, o no es JPEG, PNG ni WebP. */
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
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El slide no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La imagen supera los 4 MB. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PortadaPanelController_reemplazarCelular: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SlidePortadaPanelDto"][];
                };
            };
            /** @description Sin imagen, o no es JPEG, PNG ni WebP. */
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
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El slide no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description La imagen supera los 4 MB. */
            413: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PortadaPanelController_quitarCelular: {
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
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["SlidePortadaPanelDto"][];
                };
            };
            /** @description Falta iniciar sesión. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El rol no tiene el permiso de gestionar campañas. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description El slide no existe. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
}

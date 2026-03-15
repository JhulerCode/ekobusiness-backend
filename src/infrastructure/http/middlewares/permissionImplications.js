/**
 * Mapa de Implicaciones de Permisos
 * Define qué permisos de alto nivel (Procesos de Negocio)
 * otorgan automáticamente acceso a permisos de bajo nivel (Datos/Entidades).
 */
const IMPLICATIONS = {
    // Los permisos de la Vista (UI) dan permiso de Lectura de la Entidad
    'vArticulos:listar': ['articulo:leer'],

    // Los procesos de negocio implican lectura de las entidades que necesitan
    'compra_pedido:crear': ['articulo:leer', 'socio:leer'],
    'compra_pedido:editar': ['articulo:leer', 'socio:leer'],
    'compra_pedido:ingresarMercaderia': ['articulo:leer'],

    'vProveedores:listar': ['socio:leer'],

    'venta_pedido:crear': ['articulo:leer', 'socio:leer'],
    'venta_pedido:editar': ['articulo:leer', 'socio:leer'],

    // Puedes agrupar más implicaciones aquí...
}

/**
 * Función que expande los permisos de un usuario basado en sus implicaciones.
 * @param {String[]} userPermissions - Lista de permisos básicos del usuario
 * @returns {Set<String>} - Set con todos los permisos (directos + implícitos)
 */
export function expandPermissions(userPermissions) {
    const all = new Set(userPermissions)

    for (const p of userPermissions) {
        if (IMPLICATIONS[p]) {
            IMPLICATIONS[p].forEach((implied) => all.add(implied))
        }
    }

    return all
}

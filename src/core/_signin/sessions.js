const sessionStore = new Map()
const empresasStore = new Map()

function guardarSesion(userId, sessionData) {
    sessionStore.set(userId, sessionData)
    // console.log(sessionStore)
}

function obtenerSesion(userId) {
    return sessionStore.get(userId);
}

function borrarSesion(userId) {
    sessionStore.delete(userId)
    // console.log(sessionStore)
}

// function actualizarSesion(id, values) {
//     const sesion = obtenerSesion(id)

//     if (sesion) {
//         if (values.nombres) sesion.nombres = values.nombres
//         if (values.apellidos) sesion.apellidos = values.apellidos
//         if (values.cargo) sesion.cargo = values.cargo
//         if (values.vista_inicial) sesion.vista_inicial = values.vista_inicial
//         if (values.theme) sesion.theme = values.theme
//         if (values.color) sesion.color = values.color
//         if (values.format_date) sesion.format_date = values.format_date
//         if (values.menu_visible != null) sesion.menu_visible = values.menu_visible
//         if (values.permisos) sesion.permisos = values.permisos
//     }
// }
function actualizarSesion(id, values) {
    const sesion = obtenerSesion(id)
    if (!sesion || !values) return

    Object.entries(values).forEach(([key, value]) => {
        // Evita asignar undefined (por ejemplo, si no se pasó la propiedad)
        if (value !== undefined) {
            sesion[key] = value
        }
    })
}


function obtenerEmpresa(id) {
    return empresasStore.get(id);
}

function guardarEmpresa(id, values) {
    empresasStore.set(id, values)
}

function borrarEmpresa(id) {
    empresasStore.delete(id)
}

function actualizarEmpresa(id, values) {
    const sesion = obtenerEmpresa(id)
    if (!sesion || !values) return

    Object.entries(values).forEach(([key, value]) => {
        // Evita asignar undefined (por ejemplo, si no se pasó la propiedad)
        if (value !== undefined) {
            sesion[key] = value
        }
    })
}

export {
    sessionStore,
    guardarSesion,
    obtenerSesion,
    borrarSesion,
    actualizarSesion,

    empresasStore,
    obtenerEmpresa,
    guardarEmpresa,
    borrarEmpresa,
    actualizarEmpresa,
}
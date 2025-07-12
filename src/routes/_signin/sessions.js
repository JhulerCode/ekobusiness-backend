const sessionStore = new Map();

const userDemo = {
    "token": "U2FsdGVkX1+j4RrDfkifwYIw/Y9QB0Kz+Bd8Sp6ctBbYrTYq62KniDWKRB73BJfNACINcU2UsgwyDNkNIGWVPSc91x9UOIwZ54v16DLvcCE=",
    "colaborador": "3ef15dd5-18c3-4e6b-bfa1-12588e5abc47",
    "nombres": "SEBASTIAN",
    "apellidos": "PINEDO",
    "cargo": "JEFE DE OPERACIONES",
    "vista_inicial": "vArticulos",
    "color": "#2c47aa",
    "format_date": "DD-MM-YYYY",
    "permisos": []
}

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

function actualizarSesion(id, values) {
    const sesion = obtenerSesion(id)
    
    if (sesion) {
        if (values.nombres) sesion.nombres = values.nombres
        if (values.apellidos) sesion.apellidos = values.apellidos
        if (values.cargo) sesion.cargo = values.cargo
        if (values.vista_inicial) sesion.vista_inicial = values.vista_inicial
        if (values.color) sesion.color = values.color
        if (values.format_date) sesion.format_date = values.format_date
        if (values.permisos) sesion.permisos = values.permisos
    }
}

// function limpiarSesionesExpiradas() {
//     const ahora = Math.floor(Date.now() / 1000); // en segundos
//     for (const [userId, sesion] of sessionStore.entries()) {
//         if (sesion.exp < ahora) {
//             sessionStore.delete(userId);
//         }
//     }
// }

// Ejecutar cada 5 minutos
// setInterval(limpiarSesionesExpiradas, 5 * 60 * 1000);

export {
    sessionStore,
    userDemo,
    guardarSesion,
    obtenerSesion,
    borrarSesion,
    actualizarSesion,
}
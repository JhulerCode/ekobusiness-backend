const empresasStore = new Map()

function obtenerEmpresa(id) {
    return empresasStore.get(id)
}

function guardarEmpresa(id, values) {
    empresasStore.set(id, values)
}

function borrarEmpresa(id) {
    empresasStore.delete(id)
}

function actualizarEmpresa(id, values) {
    const empresa = obtenerEmpresa(id)
    if (!empresa || !values) return

    Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined) {
            empresa[key] = value
        }
    })
}

export { empresasStore, obtenerEmpresa, guardarEmpresa, borrarEmpresa, actualizarEmpresa }

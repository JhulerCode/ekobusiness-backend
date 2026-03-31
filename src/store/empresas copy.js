import { redis } from '#infrastructure/redis/index.js'
import { keys } from '#infrastructure/redis/keys.js'

const SUBDOMAIN_PREFIX = 'empresa_subdominio:'

async function obtenerEmpresa(id) {
    const data = await redis.get(keys.empresa(id))
    return data ? JSON.parse(data) : null
}

async function guardarEmpresa(id, values) {
    await redis.set(keys.empresa(id), JSON.stringify(values))
    if (values.subdominio) {
        await redis.set(`${SUBDOMAIN_PREFIX}${values.subdominio}`, id)
    }
}

async function borrarEmpresa(id) {
    const empresa = await obtenerEmpresa(id)
    if (empresa && empresa.subdominio) {
        await redis.del(`${SUBDOMAIN_PREFIX}${empresa.subdominio}`)
    }
    await redis.del(keys.empresa(id))
}

async function actualizarEmpresa(id, values) {
    const empresa = await obtenerEmpresa(id)
    if (!empresa || !values) return

    const oldSubdomain = empresa.subdominio
    Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined) {
            empresa[key] = value
        }
    })

    await guardarEmpresa(id, empresa)
    if (oldSubdomain && oldSubdomain !== empresa.subdominio) {
        await redis.del(`${SUBDOMAIN_PREFIX}${oldSubdomain}`)
    }
}

async function buscarEmpresaPorSubdominio(subdominio) {
    const id = await redis.get(`${SUBDOMAIN_PREFIX}${subdominio}`)
    if (id) return obtenerEmpresa(id)
    return null
}

export {
    obtenerEmpresa,
    guardarEmpresa,
    borrarEmpresa,
    actualizarEmpresa,
    buscarEmpresaPorSubdominio,
}

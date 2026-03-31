import { redis } from '#infrastructure/redis/index.js'
import { keys } from '#infrastructure/redis/keys.js'
import { Repository } from '#db/Repository.js'
import dayjs from '#shared/dayjs.js'

async function obtenerEmpresa(id) {
    const data = await redis.get(keys.empresa(id))
    return data ? JSON.parse(data) : null
}

async function guardarEmpresa(id, values) {
    await redis.set(keys.empresa(id), JSON.stringify(values))

    if (values.subdominio) {
        await redis.set(keys.subdomain(values.subdominio), id)
    }
}

async function borrarEmpresa(id) {
    const empresa = await obtenerEmpresa(id)
    if (empresa && empresa.subdominio) {
        await redis.del(keys.subdomain(empresa.subdominio))
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
        await redis.del(keys.subdomain(oldSubdomain))
    }
}

async function buscarEmpresaPorSubdominio(subdominio) {
    const id = await redis.get(keys.subdomain(subdominio))
    if (id) return obtenerEmpresa(id)
    return null
}

async function obtenerEmpresaConSuscripciones(subdominio) {
    let empresa = await buscarEmpresaPorSubdominio(subdominio)
    if (empresa) return { empresa, error: null }

    const EmpresaRepository = new Repository('Empresa')
    const empresas = await EmpresaRepository.find({
        fltr: { subdominio: { op: 'Es', val: subdominio } },
        cols: { exclude: [] },
    }, true)

    if (empresas.length === 0) return { empresa: null, error: 'Empresa no encontrada' }

    empresa = empresas[0]

    if (empresa.subdominio !== 'admin') {
        const SuscripcionRepository = new Repository('Suscripcion')
        const suscripciones = await SuscripcionRepository.find({
            fltr: {
                empresa: { op: 'Es', val: empresa.id },
                fecha_vencimiento: {
                    op: 'Es igual o posterior a',
                    val: dayjs().format('YYYY-MM-DD'),
                },
            },
            cols: ['fecha_vencimiento', 'limite_usuarios'],
            sort: [['fecha_vencimiento', 'DESC']],
        })

        if (suscripciones.length === 0) {
            return { empresa: null, error: 'La empresa no cuenta con una suscripción activa' }
        }

        empresa.suscripciones = suscripciones.map((s) => ({
            fecha_vencimiento: s.fecha_vencimiento,
            limite_usuarios: s.limite_usuarios || 0,
        }))
    }

    await guardarEmpresa(empresa.id, empresa)
    return { empresa, error: null }
}

export {
    obtenerEmpresa,
    guardarEmpresa,
    borrarEmpresa,
    actualizarEmpresa,
    buscarEmpresaPorSubdominio,
    obtenerEmpresaConSuscripciones,
}

import { obtenerSesionesActivasPorEmpresa } from '#store/sessions.js'
import dayjs from './dayjs.js'

/**
 * Obtiene un resumen detallado de la suscripción de una empresa.
 *
 * @param {Object} empresa - Objeto que contiene las suscripciones y el subdominio.
 * @returns {Object}
 */
export async function getInfoSuscripcion(empresa) {
    if (!empresa || empresa.subdominio === 'admin') {
        return { total: -1, disponibles: 999, tieneActiva: true }
    }

    const sesionesActivas = await obtenerSesionesActivasPorEmpresa(empresa.id)

    const hoy = dayjs().startOf('day')
    const cuposTotal = (empresa.suscripciones || []).reduce((sum, sub) => {
        const vencimiento = dayjs(sub.fecha_vencimiento).startOf('day')
        if (!vencimiento.isBefore(hoy)) return sum + (sub.limite_usuarios || 0)
        return sum
    }, 0)

    return {
        cuposTotal,
        cuposDisponibles: cuposTotal - sesionesActivas,
    }
}

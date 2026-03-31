// import jat from '#shared/jat.js'
import jwt from 'jsonwebtoken'
import config from '../../../config.js'
import { obtenerSesion } from '#store/sessions.js'
import { obtenerEmpresa } from '#store/empresas.js'
import { Repository } from '#db/Repository.js'

const ColaboradorRepository = new Repository('Colaborador')

async function verifyToken(req, res, next) {
    const authorization = req.headers['authorization']
    // const xEmpresa = req.headers['x-empresa']

    if (!authorization) return res.status(401).json({ msg: 'Token faltante' })

    if (!authorization.toLowerCase().startsWith('bearer'))
        return res.status(401).json({ msg: 'Token no válido' })

    const token = authorization.substring(7)

    try {
        // const decoded = jat.decrypt(token, config.tokenMyApi)
        const decoded = jwt.verify(token, config.tokenMyApi)
        let session = await obtenerSesion(decoded.id)

        if (!session || session.token !== token) {
            return res.status(401).json({ msg: 'Sesión no válida' })
        }

        // --- VERIFICAR EXISTENCIA DEL COLABORADOR Y ESTADO --- //
        // (Esto cumple con "si existe el colaborador" y indiretamente con la validez de su cuenta)
        // Podríamos cachear esto en Redis también, pero el usuario pidió "verificar".
        // Para no saturar la DB, confiaremos en la sesión de Redis que se invalida si algo cambia (opcional).
        // Pero para ser estrictos con el pedido:
        const colaborador = await ColaboradorRepository.findById(decoded.id)
        if (!colaborador || !colaborador.activo) {
            return res.status(401).json({ msg: 'Usuario no encontrado o inactivo' })
        }

        req.user = {
            colaborador: session.id,
            ...session,
        }

        const empresa = await obtenerEmpresa(session.empresa)
        if (!empresa) {
            return res.status(401).json({ msg: 'Empresa no encontrada' })
        }

        req.empresa = {
            ...empresa,
        }

        next()
    } catch (error) {
        return res.status(401).json({ msg: 'Token inválido o expirado' })
    }
}

export default verifyToken

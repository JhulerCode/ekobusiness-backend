import jwt from 'jsonwebtoken'
import config from '../../../config.js'
import { obtenerSesion, borrarSesion } from '#store/sessions.js'
import { obtenerEmpresa } from '#store/empresas.js'

async function verifyToken(req, res, next) {
    const authorization = req.headers['authorization']

    if (!authorization) return res.status(401).json({ msg: 'Token faltante' })

    if (!authorization.toLowerCase().startsWith('bearer'))
        return res.status(401).json({ msg: 'Token no válido' })

    const token = authorization.substring(7)

    try {
        const decoded = jwt.verify(token, config.tokenMyApi)
        let session = await obtenerSesion(decoded.id)

        if (!session || session.accessToken !== token) {
            return res.status(401).json({ msg: 'Sesión no válida' })
        }

        // --- VERIFICAR SI EL COLABORADOR SIGUE ACTIVO --- //
        if (!session.activo) {
            await borrarSesion(decoded.id)
            return res.status(401).json({ msg: 'Usuario inactivo' })
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

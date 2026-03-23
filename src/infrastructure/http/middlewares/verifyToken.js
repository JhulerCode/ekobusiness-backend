// import jat from '#shared/jat.js'
import jwt from 'jsonwebtoken'
import config from '../../../config.js'
import { obtenerSesion, guardarSesion } from '#store/sessions.js'
import { obtenerEmpresa } from '#store/empresas.js'
import dayjs from '#shared/dayjs.js'
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
        let session = obtenerSesion(decoded.id)

        if (!session || session.token !== token) {
            return res.status(401).json({ msg: 'Sesión no válida' })
        }

        // if (!session) {
        //     const colaborador = await ColaboradorRepository.find({ id: decoded.id }, true)
        //     if (!colaborador) {
        //         return res.json({ code: 1, msg: 'Usuario o contraseña incorrecta' })
        //     }

        //     guardarSesion(colaborador.id, { token, loginAt: dayjs(), ...colaborador })
        //     session = obtenerSesion(decoded.id)
        // }

        req.user = {
            colaborador: session.id,
            ...session,
        }

        const empresa = obtenerEmpresa(session.empresa)
        req.empresa = {
            ...empresa,
        }

        next()
    } catch (error) {
        return res.status(401).json({ msg: 'Token inválido o expirado' })
    }
}

export default verifyToken

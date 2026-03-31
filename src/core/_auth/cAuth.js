import bcrypt from 'bcrypt'
import dayjs from '#shared/dayjs.js'
import crypto from 'crypto'
import { getInfoSuscripcion } from '#shared/suscripciones.js'
import config from '../../config.js'
import jwt from 'jsonwebtoken'
import { obtenerEmpresaConSuscripciones } from '#store/empresas.js'
import { guardarSesion, borrarSesion, obtenerSesion } from '#store/sessions.js'
import { Repository } from '#db/Repository.js'
import { keys } from '#infrastructure/redis/keys.js'
import { redis } from '#infrastructure/redis/index.js'

const ColaboradorRepository = new Repository('Colaborador')

const signin = async (req, res) => {
    try {
        const { usuario, contrasena } = req.body

        // --- VERIFICAR EMPRESA --- //
        const xEmpresa = req.headers['x-empresa']
        const { empresa, error } = await obtenerEmpresaConSuscripciones(xEmpresa)
        if (error) return res.json({ code: 1, msg: error })

        // --- VERIFICAR SUSCRIPCIÓN --- //
        const { cuposTotal, cuposDisponibles } = await getInfoSuscripcion(empresa)
        if (cuposTotal == 0) {
            return res.json({
                code: 1,
                msg: 'La empresa no cuenta con una suscripción activa',
            })
        }
        if (cuposDisponibles <= 0) {
            return res.json({
                code: 1,
                msg: 'La empresa ha alcanzado el límite de usuarios concurrentes',
            })
        }

        // --- VERIFICAR COLABORADOR --- //
        const qry1 = {
            fltr: {
                usuario: { op: 'Es', val: usuario },
                activo: { op: 'Es', val: true },
                empresa: { op: 'Es', val: empresa.id },
            },
            cols: { exclude: [] },
        }

        const colaboradores = await ColaboradorRepository.find(qry1, true)
        if (colaboradores.length == 0) {
            return res.json({ code: 1, msg: 'Usuario o contraseña incorrecta' })
        }

        const colaborador = colaboradores[0]

        const correct = await bcrypt.compare(contrasena, colaborador.contrasena)
        if (!correct) return res.json({ code: 1, msg: 'Usuario o contraseña incorrecta' })

        // --- GUARDAR SESSION --- //
        const accessToken = jwt.sign(
            { id: colaborador.id, empresa: empresa.id },
            config.tokenMyApi,
            {
                expiresIn: '15s',
            },
        )

        const refreshToken = crypto.randomBytes(64).toString('hex')

        delete colaborador.contrasena
        await guardarSesion(colaborador.id, {
            accessToken,
            refreshToken,
            loginAt: dayjs(),
            ...colaborador,
        })

        // --- SET REFRESH TOKEN COOKIE --- //
        const isProduction = config.NODE_ENV === 'production'
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
        })

        res.json({ code: 0, token: accessToken })
    } catch (error) {
        res.status(500).send({ code: -1, msg: error.message, error })
    }
}

const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken
        console.log('REFRESH TOKEN', refreshToken)
        if (!refreshToken) return res.status(401).json({ msg: 'No refresh token' })

        // Búsqueda O(1) usando el mapa inverso
        const userId = await redis.get(keys.refreshToken(refreshToken))
        if (!userId) return res.status(401).json({ msg: 'Sesión no válida' })

        const userSession = await obtenerSesion(userId)
        if (!userSession) return res.status(401).json({ msg: 'Sesión no válida' })

        // Generate new Access Token
        const accessToken = jwt.sign(
            { id: userId, empresa: userSession.empresa },
            config.tokenMyApi,
            {
                expiresIn: '15s',
            },
        )

        // Update session with new accessToken
        await guardarSesion(userId, { ...userSession, accessToken })

        res.json({ code: 0, token: accessToken })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const logout = async (req, res) => {
    try {
        const { id } = req.body
        await borrarSesion(id)
        const isProduction = config.NODE_ENV === 'production'
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
        })
        res.json({ code: 0 })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const getEmpresas = async (req, res) => {
    try {
        const keysList = await redis.keys('empresa:*')
        const data = []
        for (const key of keysList) {
            const val = await redis.get(key)
            if (val) data.push(JSON.parse(val))
        }
        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const getSessions = async (req, res) => {
    try {
        const keysList = await redis.keys('user:*')
        const data = []
        for (const key of keysList) {
            const val = await redis.get(key)
            if (val) data.push(JSON.parse(val))
        }
        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    signin,
    refresh,
    logout,
    getEmpresas,
    getSessions,
}

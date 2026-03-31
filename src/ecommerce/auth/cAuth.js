import { Repository } from '#db/Repository.js'
import bcrypt from 'bcrypt'
import config from '../../config.js'
import jwt from 'jsonwebtoken'
import { guardarSesion, borrarSesion, obtenerSesion } from '#store/sessions.js'
import dayjs from '#shared/dayjs.js'
import crypto from 'crypto'
import { redis, keys } from '#infrastructure/redis/index.js'

const repository = new Repository('Socio')

//--- E-COMMERCE ---//
const createToNewsletter = async (req, res) => {
    try {
        const empresa = req.headers['x-empresa']
        const { correo } = req.body

        // ----- VERIFY SI EXISTE CORREO ----- //
        if (
            (await repository.existe(
                { correo, only_newsletter: true, empresa },
                res,
                `El correo ya fue registrado anteriormente.`,
            )) == true
        )
            return

        // ----- CREAR ----- //
        await repository.create({ correo, only_newsletter: true })

        res.json({ code: 0 })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const createUser = async (req, res) => {
    try {
        const empresa = req.headers['x-empresa']
        let { correo, contrasena } = req.body

        // ----- VERIFY SI EXISTE CORREO ----- //
        if (
            (await repository.existe(
                { correo, tipo: 2, empresa },
                res,
                `El correo ya fue registrado anteriormente.`,
            )) == true
        )
            return

        // ----- CREAR ----- //
        contrasena = await bcrypt.hash(contrasena, 10)
        const contrasena_updated_at = dayjs()

        const nuevo = await repository.create({
            tipo: 2,
            correo,
            contrasena,
            contrasena_updated_at,
            empresa,
        })

        const data = await repository.find({ id: nuevo.id }, true)

        // --- GENERAR TOKENS --- //
        const accessToken = jwt.sign({ id: data.id }, config.tokenMyApi, { expiresIn: '15m' })
        const refreshToken = crypto.randomBytes(64).toString('hex')

        delete data.contrasena
        await guardarSesion(data.id, { accessToken, refreshToken, loginAt: dayjs(), ...data })

        // --- SET REFRESH TOKEN COOKIE --- //
        const isProduction = config.NODE_ENV === 'production'
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })

        res.json({ code: 0, token: accessToken, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const signin = async (req, res) => {
    try {
        const empresa = req.headers['x-empresa']
        let { correo, contrasena } = req.body

        //--- VERIFICAR CLIENTE --- //
        const qry = {
            fltr: {
                tipo: { op: 'Es', val: 2 },
                correo: { op: 'Es', val: correo },
                empresa: { op: 'Es', val: empresa },
            },
            cols: { exclude: [] },
        }
        const data = await repository.find(qry, true)
        if (data.length == 0) return res.json({ code: 1, msg: 'Correo o contraseña incorrecta' })

        const cliente = data[0]
        const correct = await bcrypt.compare(contrasena, cliente.contrasena)
        if (!correct) return res.json({ code: 1, msg: 'Correo o contraseña incorrecta' })

        //--- GENERAR TOKENS ---//
        const accessToken = jwt.sign({ id: cliente.id }, config.tokenMyApi, { expiresIn: '15m' })
        const refreshToken = crypto.randomBytes(64).toString('hex')

        delete cliente.contrasena
        await guardarSesion(cliente.id, { accessToken, refreshToken, loginAt: dayjs(), ...cliente })

        // --- SET REFRESH TOKEN COOKIE --- //
        const isProduction = config.NODE_ENV === 'production'
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        })

        res.json({ code: 0, token: accessToken, data: cliente })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const refresh = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) return res.status(401).json({ msg: 'No refresh token' })

        const userId = await redis.get(keys.refreshToken(refreshToken))
        if (!userId) return res.status(401).json({ msg: 'Sesión no válida' })

        const userSession = await obtenerSesion(userId)
        if (!userSession) return res.status(401).json({ msg: 'Sesión no válida' })

        const accessToken = jwt.sign({ id: userId }, config.tokenMyApi, { expiresIn: '15m' })

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

export default {
    createToNewsletter,
    createUser,
    signin,
    refresh,
    logout,
}

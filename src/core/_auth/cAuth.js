import bcrypt from 'bcrypt'
import dayjs from '#shared/dayjs.js'
import { getInfoSuscripcion } from '#shared/suscripciones.js'
import config from '../../config.js'
import jwt from 'jsonwebtoken'
import { obtenerEmpresaConSuscripciones } from '#store/empresas.js'
import {
    guardarSesion,
    borrarSesion,
    obtenerSesion,
    obtenerSesionesActivasPorEmpresa,
} from '#store/sessions.js'
import { Repository } from '#db/Repository.js'
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
        const token = jwt.sign({ id: colaborador.id, empresa: empresa.id }, config.tokenMyApi, {
            expiresIn: '7d',
        })
        delete colaborador.contrasena
        await guardarSesion(colaborador.id, { token, loginAt: dayjs(), ...colaborador })

        res.json({ code: 0, token })
    } catch (error) {
        res.status(500).send({ code: -1, msg: error.message, error })
    }
}

const logout = async (req, res) => {
    try {
        const { id } = req.body
        await borrarSesion(id)

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
    logout,
    getEmpresas,
    getSessions,
}

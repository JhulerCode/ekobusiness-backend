import bcrypt from 'bcrypt'
import dayjs from '#shared/dayjs.js'
import config from '../../config.js'
import jwt from 'jsonwebtoken'
import {
    guardarEmpresa,
    obtenerEmpresa,
    buscarEmpresaPorSubdominio,
} from '#store/empresas.js'
import {
    guardarSesion,
    borrarSesion,
    obtenerSesion,
    obtenerSesionesActivasPorEmpresa,
} from '#store/sessions.js'
import { Repository } from '#db/Repository.js'
import { redis } from '#infrastructure/redis/index.js'
import { keys } from '#infrastructure/redis/keys.js'

const EmpresaRepository = new Repository('Empresa')
const ColaboradorRepository = new Repository('Colaborador')

const signin = async (req, res) => {
    try {
        const { usuario, contrasena } = req.body

        // --- VERIFICAR EMPRESA --- //
        const xEmpresa = req.headers['x-empresa']
        let empresa = await buscarEmpresaPorSubdominio(xEmpresa)

        if (!empresa) {
            const qry = {
                fltr: {
                    subdominio: { op: 'Es', val: xEmpresa },
                },
                cols: { exclude: [] },
            }

            const empresas = await EmpresaRepository.find(qry, true)
            if (empresas.length == 0) return res.json({ code: 1, msg: 'Empresa no encontrada' })
            empresa = empresas[0]

            // --- OBTENER SUSCRIPCIONES --- //
            if (empresa.subdominio !== 'admin') {
                const SuscripcionRepository = new Repository('Suscripcion')
                const qrySub = {
                    fltr: {
                        empresa: { op: 'Es', val: empresa.id },
                        fecha_vencimiento: {
                            op: 'Es igual o posterior a',
                            val: dayjs().format('YYYY-MM-DD'),
                        },
                    },
                    cols: ['fecha_vencimiento', 'limite_usuarios'],
                    sort: [['fecha_vencimiento', 'DESC']],
                }

                const suscripciones = await SuscripcionRepository.find(qrySub)
                if (suscripciones.length === 0) {
                    return res.json({
                        code: 1,
                        msg: 'La empresa no cuenta con una suscripción activa',
                    })
                }

                empresa.suscripciones = suscripciones.map((s) => ({
                    fecha_vencimiento: s.fecha_vencimiento,
                    limite_usuarios: s.limite_usuarios || 0,
                }))
            }

            await guardarEmpresa(empresa.id, empresa)
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

        // --- VERIFICAR CUPOS DE USUARIOS --- //
        if (empresa.subdominio !== 'admin') {
            const hoy = dayjs().startOf('day')
            const totalCupos = empresa.suscripciones.reduce((sum, sub) => {
                const vencimiento = dayjs(sub.fecha_vencimiento).startOf('day')
                if (!vencimiento.isBefore(hoy)) return sum + sub.limite_usuarios
                return sum
            }, 0)

            const sesionesActivas = await obtenerSesionesActivasPorEmpresa(empresa.id)
            const sesionExistente = await obtenerSesion(colaborador.id)

            if (!sesionExistente && sesionesActivas >= totalCupos) {
                return res.json({
                    code: 1,
                    msg: 'Ha alcanzado el límite de usuarios concurrentes.',
                })
            }
        }

        const correct = await bcrypt.compare(contrasena, colaborador.contrasena)
        if (!correct) return res.json({ code: 1, msg: 'Usuario o contraseña incorrecta' })

        // --- GUARDAR SESSION --- //
        const token = jwt.sign({ id: colaborador.id }, config.tokenMyApi, { expiresIn: '7d' })
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

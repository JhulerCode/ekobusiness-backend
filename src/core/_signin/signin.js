import bcrypt from 'bcrypt'
import config from "../../config.js"
import jat from '#shared/jat.js'
import { guardarSesion, borrarSesion, obtenerEmpresa, guardarEmpresa, empresasStore, sessionStore } from './sessions.js'

import { Router } from "express"
import { Colaborador } from '#db/models/Colaborador.js'
import { Empresa } from '#db/models/Empresa.js'

const router = Router()

const signin = async (req, res) => {
    try {
        const { usuario, contrasena } = req.body

        // --- VERIFICAR EMPRESA --- //
        const xEmpresa = req.headers["x-empresa"]

        let empresa = obtenerEmpresa(xEmpresa)
        if (!empresa) {
            empresa = await Empresa.findOne({ where: { subdominio: xEmpresa }, raw: true })
            if (!empresa) return res.json({ code: 1, msg: 'Empresa no encontrada' })

            guardarEmpresa(xEmpresa, empresa)
        }

        // -- VERIFICAR COLABORADOR --- //
        const colaborador = await Colaborador.findOne({
            where: {
                usuario,
                empresa: empresa.id,
            },
            raw: true
        })

        if (colaborador == null) return res.json({ code: 1, msg: 'Usuario o contraseña incorrecta' })

        const correct = await bcrypt.compare(contrasena, colaborador.contrasena)
        if (!correct) return res.json({ code: 1, msg: 'Usuario o contraseña incorrecta' })

        // -- GUARDAR SESSION --- //
        // const token = jat.encrypt({ colaborador: colaborador.id }, config.tokenMyApi)
        const token = jat.encrypt({ id: colaborador.id }, config.tokenMyApi)

        guardarSesion(colaborador.id, {
            token,
            ...colaborador
            // nombres: colaborador.nombres,
            // apellidos: colaborador.apellidos,
            // cargo: colaborador.cargo,
            // vista_inicial: colaborador.vista_inicial,
            // theme: colaborador.theme,
            // color: colaborador.color,
            // format_date: colaborador.format_date,
            // menu_visible: colaborador.menu_visible,
            // permisos: colaborador.permisos,
            // empresa: empresa,
        })

        res.json({ code: 0, token })
    }
    catch (error) {
        res.status(500).send({ code: -1, msg: error.message, error })
    }
}

const logout = async (req, res) => {
    try {
        const { id } = req.body
        borrarSesion(id)

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const getEmpresas = async (req, res) => {
    try {
        const data = Array.from(empresasStore.values())
        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const getSessions = async (req, res) => {
    try {
        const data = Array.from(sessionStore.values())
        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

router.post('/', signin)
router.post('/logout', logout)
router.get('/empresas', getEmpresas)
router.get('/sessions', getSessions)

export default router
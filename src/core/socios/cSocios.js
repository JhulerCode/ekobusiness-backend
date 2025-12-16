import { Repository } from '#db/Repository.js'
import { generarCodigo6 } from '#shared/mine.js'
import cSistema from "../_sistema/cSistema.js"
import bcrypt from 'bcrypt'
import config from "../../config.js"
import jat from '#shared/jat.js'
import { guardarSesion, actualizarSesion, borrarSesion } from '../_signin/sessions.js'
import dayjs from '#shared/dayjs.js'
import { nodeMailer } from "#mail/nodeMailer.js"
import { companyName, htmlCodigoVerificacion } from '#mail/templates.js'
import { customerWalletGet } from "#infrastructure/izipay.js"
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'

const repository = new Repository('Socio')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const data = await repository.find(qry, true)

        if (data.length > 0) {
            const documentos_identidadMap = cSistema.arrayMap('documentos_identidad')
            const estadosMap = cSistema.arrayMap('estados')

            for (const a of data) {
                if (qry?.cols?.includes('doc_tipo')) a.doc_tipo1 = documentos_identidadMap[a.doc_tipo]
                if (qry?.cols?.includes('activo')) a.activo1 = estadosMap[a.activo]
            }
        }

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const data = await repository.find({ id, ...qry })

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    try {
        const { colaborador, empresa } = req.user
        const {
            tipo, doc_tipo, doc_numero, nombres, apellidos,
            telefono1, telefono2, correo, web, activo,
            direcciones,
            contactos,
            precio_lista, pago_condicion, bancos,
            documentos,
        } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (doc_numero) {
            if (await repository.existe({ tipo, doc_numero, empresa }, res, `El Nro de documento ya existe, ingresa otro.`) == true) return
        }

        if (correo) {
            if (await repository.existe({ tipo, correo, empresa }, res, `El correo ya existe, ingresa otro.`) == true) return
        }

        // ----- CREAR ----- //
        const nuevo = await repository.create({
            tipo, doc_tipo, doc_numero, nombres, apellidos,
            telefono1, telefono2, correo, web, activo,
            direcciones,
            contactos,
            precio_lista, pago_condicion, bancos,
            documentos,
            empresa,
            createdBy: colaborador
        })

        const data = await loadOne(nuevo.id)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    try {
        const { colaborador, empresa } = req.user
        const { id } = req.params
        const {
            tipo, doc_tipo, doc_numero, nombres, apellidos,
            telefono1, telefono2, correo, web, activo,
            direcciones,
            contactos,
            precio_lista, pago_condicion, bancos, pago_metodos,
            documentos,
            comes_from,
        } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (doc_numero) {
            if (await repository.existe({ tipo, doc_numero, id, empresa }, res, `El Nro de documento ya existe, ingresa otro.`) == true) return
        }

        if (correo) {
            if (await repository.existe({ tipo, correo, id, empresa }, res, `El correo ya existe, ingresa otro.`) == true) return
        }

        //--- ACTUALIZAR ---//
        const updated = await repository.update({ id }, {
            tipo, doc_tipo, doc_numero, nombres, apellidos,
            telefono1, telefono2, correo, web, activo,
            direcciones,
            contactos,
            precio_lista, pago_condicion, bancos, pago_metodos,
            documentos,
            updatedBy: colaborador
        })

        if (updated == false) return resUpdateFalse(res)

        const data = await loadOne(id)
        if (comes_from == 'ecommerce') actualizarSesion(id, data)
        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params

        if (await repository.delete({ id }) == false) return resDeleteFalse(res)

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const deleteBulk = async (req, res) => {
    try {
        const { ids } = req.body

        if (await repository.delete(ids) == false) return

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const updateBulk = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { ids, prop, val } = req.body

        //--- ACTUALIZAR ---//
        const updated = await repository.update({ id: ids }, {
            [prop]: val,
            updatedBy: colaborador
        })

        if (updated == false) return resUpdateFalse(res)

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


//--- Helpers ---//
async function loadOne(id) {
    const data = await repository.find({ id }, true)

    if (data) {
        const documentos_identidadMap = cSistema.arrayMap('documentos_identidad')
        const estadosMap = cSistema.arrayMap('estados')

        data.doc_tipo1 = documentos_identidadMap[data.doc_tipo]
        data.activo1 = estadosMap[data.activo]
    }

    return data
}


//--- E-COMMERCE ---//
const createToNewsletter = async (req, res) => {
    try {
        const empresa = req.headers["x-empresa"]
        const { correo } = req.body

        // ----- VERIFY SI EXISTE CORREO ----- //
        if (await repository.existe({ correo, only_newsletter: true, empresa }, res, `El correo ya fue registrado anteriormente.`) == true) return

        // ----- CREAR ----- //
        await repository.create({ correo, only_newsletter: true })

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const createUser = async (req, res) => {
    try {
        const empresa = req.headers["x-empresa"]
        let { correo, contrasena } = req.body

        // ----- VERIFY SI EXISTE CORREO ----- //
        if (await repository.existe({ correo, tipo: 2, empresa }, res, `El correo ya fue registrado anteriormente.`) == true) return

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

        const token = jat.encrypt({ id: data.id }, config.tokenMyApi)

        guardarSesion(data.id, { token, ...data })

        res.json({ code: 0, token })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const signin = async (req, res) => {
    try {
        const empresa = req.headers["x-empresa"]
        let { correo, contrasena } = req.body

        //--- VERIFICAR CLIENTE --- //
        const qry = {
            fltr: {
                tipo: { op: 'Es', val: 2 },
                correo: { op: 'Es', val: correo },
                empresa: { op: 'Es', val: empresa },
            },
            cols: { exclude: [] }
        }
        const data = await repository.find(qry, true)
        if (data.length > 0) return res.json({ code: 1, msg: 'Usuario o contraseña incorrecta' })

        const cliente = data[0]
        const correct = await bcrypt.compare(contrasena, cliente.contrasena)
        if (!correct) return res.json({ code: 1, msg: 'Usuario o contraseña incorrecta' })

        //--- GUARDAR SESSION ---//
        const token = jat.encrypt({ id: cliente.id }, config.tokenMyApi)

        delete cliente.contrasena
        guardarSesion(cliente.id, { token, ...cliente })

        res.json({ code: 0, token, data: cliente })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const login = async (req, res) => {
    try {
        res.json({ code: 0, data: { ...req.user } })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const sendCodigo = async (req, res) => {
    try {
        const { id, correo } = req.body
        const codigo_verificacion = generarCodigo6()

        await repository.update({ id }, { codigo_verificacion })

        const nodemailer = nodeMailer()
        const result = await nodemailer.sendMail({
            from: `${companyName} <${config.SOPORTE_EMAIL}>`,
            to: correo,
            subject: 'Código de verificación',
            html: htmlCodigoVerificacion(codigo_verificacion)
        })

        if (result.error) {
            return res.json({ code: 1, msg: "No se pudo enviar el código", error: result.error });
        }
        else {
            res.json({ code: 0 })
        }
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const verifyCodigo = async (req, res) => {
    try {
        const { id, correo, codigo_verificacion } = req.body

        const qry = {
            fltr: {
                correo: { op: 'Es', val: correo },
                codigo_verificacion: { op: 'Es', val: codigo_verificacion },
            }
        }
        const data = await repository.find(qry, true)

        if (data.length == 0) return res.json({ code: 1, msg: 'Código ingresado incorrecto' })

        await repository.update({ id }, { codigo_verificacion: null })

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const updatePassword = async (req, res) => {
    try {
        let { id, contrasena } = req.body

        contrasena = await bcrypt.hash(contrasena, 10)

        const contrasena_updated_at = dayjs()

        await repository.update({ id }, {
            contrasena,
            contrasena_updated_at,
        })

        actualizarSesion(id, { contrasena_updated_at })

        res.json({ code: 0, data: { contrasena_updated_at } })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const deleteUser = async (req, res) => {
    try {
        let { id } = req.body

        await repository.update({ id }, {
            activo: 0,
        })

        borrarSesion(id)

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const getCustomerWallet = async (req, res) => {
    const { id } = req.params

    const dataPayment = {
        customerReference: id,
        tokenStatus: "ACTIVE"
    }

    try {
        const response = await customerWalletGet(dataPayment)
        // console.log(response)
        if (response.status !== "SUCCESS") {
            let msg = ''

            return res.json({ code: 1, msg, error: response });
        } else {
            res.json({ code: 0, data: response.answer });
        }
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error });
    }
};

export default {
    create,
    find,
    findById,
    delet,
    update,

    deleteBulk,
    updateBulk,

    createToNewsletter,
    createUser,
    signin,
    login,
    sendCodigo,
    verifyCodigo,
    updatePassword,
    deleteUser,
    getCustomerWallet,
}
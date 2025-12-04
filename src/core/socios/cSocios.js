import { Socio } from '#db/models/Socio.js'
import { Sequelize, Op } from 'sequelize'
import { applyFilters, existe, generarCodigo6 } from '#shared/mine.js'
import { PrecioLista } from '#db/models/PrecioLista.js'
import cSistema from "../_sistema/cSistema.js"
import sequelize from '#db/sequelize.js'
import bcrypt from 'bcrypt'
import config from "../../config.js"
import jat from '#shared/jat.js'
import { guardarSesion, actualizarSesion, borrarSesion, sessionStore } from '../_signin/sessions.js'
import dayjs from '#shared/dayjs.js'
import { nodeMailer } from "#mail/nodeMailer.js"
import { companyName, htmlCodigoVerificacion } from '#mail/templates.js'
import { customerWalletGet } from "#infrastructure/izipay.js"

const includes = {
    precio_lista1: {
        model: PrecioLista,
        as: 'precio_lista1',
        attributes: ['id', 'nombre', 'moneda']
    }
}

const create = async (req, res) => {
    try {
        const { colaborador } = req.user
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
            if (await existe(Socio, { tipo, doc_numero }, res, `El Nro de documento ya existe, ingresa otro.`) == true) return
        }

        if (correo) {
            if (await existe(Socio, { tipo, correo, id }, res, `El correo ya existe, ingresa otro.`) == true) return
        }

        // ----- CREAR ----- //
        const nuevo = await Socio.create({
            tipo, doc_tipo, doc_numero, nombres, apellidos,
            telefono1, telefono2, correo, web, activo,
            direcciones,
            contactos,
            precio_lista, pago_condicion, bancos,
            documentos,
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
        const { colaborador } = req.user
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
            if (await existe(Socio, { tipo, doc_numero, id }, res, `El Nro de documento ya existe, ingresa otro.`) == true) return
        }

        if (correo) {
            if (await existe(Socio, { tipo, correo, id }, res, `El correo ya existe, ingresa otro.`) == true) return
        }

        // ----- ACTUALIZAR ----- //
        const [affectedRows] = await Socio.update(
            {
                tipo, doc_tipo, doc_numero, nombres, apellidos,
                telefono1, telefono2, correo, web, activo,
                direcciones,
                contactos,
                precio_lista, pago_condicion, bancos, pago_metodos,
                documentos,
                updatedBy: colaborador
            },
            { where: { id } }
        )

        if (affectedRows > 0) {
            if (comes_from == 'ecommerce') {
                actualizarSesion(id, { nombres, apellidos, doc_tipo, doc_numero, telefono1, direcciones, pago_metodos })
            }

            const data = await loadOne(id)

            res.json({ code: 0, data })
        }
        else {
            res.json({ code: 1, msg: 'No se actualizó ningún registro' })
        }
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

async function loadOne(id) {
    let data = await Socio.findByPk(id, {
        include: [includes.precio_lista1],
        attributes: { exclude: ['contrasena'] }
    })

    if (data) {
        data = data.toJSON()

        const documentos_identidadMap = cSistema.arrayMap('documentos_identidad')
        const estadosMap = cSistema.arrayMap('estados')

        data.doc_tipo1 = documentos_identidadMap[data.doc_tipo]
        data.activo1 = estadosMap[data.activo]
    }

    return data
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id'],
            order: [[Sequelize.literal(`TRIM(CONCAT(COALESCE(nombres, ''), ' ', COALESCE(apellidos, '')))`), 'ASC']],
            where: {},
            include: []
        }

        if (qry) {
            if (qry.fltr) {
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }

            if (qry.cols) {
                findProps.attributes = findProps.attributes.concat(qry.cols)

                // ----- AGREAGAR LOS REF QUE SI ESTÁN EN LA BD ----- //
                if (qry.cols.includes('precio_lista')) findProps.include.push(includes.precio_lista1)
            }

            if (qry.incl) {
                for (const a of qry.incl) {
                    if (qry.incl.includes(a)) findProps.include.push(includes[a])
                }
            }
        }

        let data = await Socio.findAll(findProps)

        if (data.length > 0 && qry.cols) {
            data = data.map(a => a.toJSON())

            const documentos_identidadMap = cSistema.arrayMap('documentos_identidad')
            const estadosMap = cSistema.arrayMap('estados')

            for (const a of data) {
                if (qry.cols.includes('doc_tipo')) a.doc_tipo1 = documentos_identidadMap[a.doc_tipo]
                if (qry.cols.includes('activo')) a.activo1 = estadosMap[a.activo]
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

        const data = await Socio.findByPk(id, {
            include: [includes.precio_lista1]
        })

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params

        // ----- ELIMINAR ----- //
        const deletedCount = await Socio.destroy({ where: { id } })

        const send = deletedCount > 0 ? { code: 0 } : { code: 1, msg: 'No se eliminó ningún registro' }

        res.json(send)
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const deleteBulk = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { ids } = req.body

        // ----- ELIMINAR ----- //
        const deletedCount = await Socio.destroy({
            where: {
                id: {
                    [Op.in]: ids
                }
            },
            transaction
        })

        const send = deletedCount > 0 ? { code: 0 } : { code: 1, msg: 'No se eliminó ningún registro' }

        await transaction.commit()

        res.json(send)
    }
    catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const updateBulk = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { ids, prop, val } = req.body
        const edit = { [prop]: val }

        // ----- MODIFICAR ----- //
        await Socio.update(
            edit,
            {
                where: {
                    id: {
                        [Op.in]: ids
                    }
                },
                transaction
            }
        )

        await transaction.commit()

        res.json({ code: 0 })
    }
    catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


//--- E-COMMERCE ---//
const createToNewsletter = async (req, res) => {
    try {
        const { correo } = req.body

        // ----- VERIFY SI EXISTE CORREO ----- //
        if (await existe(Socio, { correo, only_newsletter: true }, res, 'El correo ya fue registrado anteriormente.') == true) return

        // ----- CREAR ----- //
        await Socio.create({ correo, only_newsletter: true })

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const createUser = async (req, res) => {
    try {
        let { correo, contrasena } = req.body

        // ----- VERIFY SI EXISTE CORREO ----- //
        if (await existe(Socio, { correo, tipo: 2 }, res, 'El correo ya fue registrado anteriormente.') == true) return

        // ----- CREAR ----- //
        contrasena = await bcrypt.hash(contrasena, 10)
        const contrasena_updated_at = dayjs()
        
        const data = await Socio.create({
            tipo: 2,
            correo,
            contrasena,
            contrasena_updated_at
        })

        const token = jat.encrypt({
            id: data.id,
        }, config.tokenMyApi)

        guardarSesion(data.id, {
            token,
            correo,
            direcciones: [],
            pago_metodos: [],
            contrasena_updated_at,
        })

        res.json({ code: 0, token })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const loginUser = async (req, res) => {
    try {
        let { correo, contrasena } = req.body

        const data = await Socio.findOne({
            where: { correo, tipo: 2 },
        })

        if (data == null) return res.json({ code: 1, msg: 'Usuario o contraseña incorrecta' })

        const correct = await bcrypt.compare(contrasena, data.contrasena)
        if (!correct) return res.json({ code: 1, msg: 'Usuario o contraseña incorrecta' })

        const token = jat.encrypt({
            id: data.id,
        }, config.tokenMyApi)

        const toSave = {
            token,

            doc_tipo: data.doc_tipo,
            doc_numero: data.doc_numero,
            nombres: data.nombres,
            apellidos: data.apellidos,

            correo: data.correo,
            telefono1: data.telefono1,
            telefono2: data.telefono2,
            web: data.web,
            activo: data.activo,

            direcciones: data.direcciones,

            pago_metodos: data.pago_metodos,

            nombres_apellidos: data.nombres_apellidos,

            contrasena_updated_at: data.contrasena_updated_at,
        }

        guardarSesion(data.id, toSave)

        res.json({ code: 0, token, data: toSave })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const verifyLogin = async (req, res) => {
    try {
        res.json({ code: 0, data: { ...req.user } })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const sendCodigo = async (req, res) => {
    try {
        const { correo } = req.body
        const codigo_verificacion = generarCodigo6()

        await Socio.update({ codigo_verificacion }, { where: { correo } })

        const nodemailer = nodeMailer()
        const result = await nodemailer.sendMail({
            from: `${companyName} <${config.SOPORTE_EMAIL}>`,
            to: correo,
            subject: 'Código de verificación',
            html: htmlCodigoVerificacion(codigo_verificacion)
        })

        res.status(200).json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const verifyCodigo = async (req, res) => {
    try {
        const { correo, codigo_verificacion } = req.body

        const data = await Socio.findOne({ where: { correo, codigo_verificacion } })

        if (data == null) return res.status(200).json({ code: 1, msg: 'Código ingresado incorrecto' })

        await Socio.update({ codigo_verificacion: null }, { where: { correo } })

        res.status(200).json({ code: 0 })
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

        await Socio.update(
            {
                contrasena,
                contrasena_updated_at,
            },
            { where: { id } }
        )

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

        await Socio.update(
            {
                activo: 0,
            },
            { where: { id } }
        )

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
    loginUser,
    verifyLogin,
    sendCodigo,
    verifyCodigo,
    updatePassword,
    deleteUser,
    getCustomerWallet,
}
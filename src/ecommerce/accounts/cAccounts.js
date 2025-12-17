import { Repository } from '#db/Repository.js'
import { generarCodigo6 } from '#shared/mine.js'
import bcrypt from 'bcrypt'
import config from "../../config.js"
import { actualizarSesion, borrarSesion } from '#store/sessions.js'
import dayjs from '#shared/dayjs.js'
import { nodeMailer } from "#mail/nodeMailer.js"
import { companyName, htmlCodigoVerificacion } from '#mail/templates.js'
import { customerWalletGet } from "#infrastructure/izipay.js"
import { resUpdateFalse } from '#http/helpers.js'

const repository = new Repository('Socio')

const login = async (req, res) => {
    try {
        res.json({ code: 0, data: { ...req.user } })
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
    login,
    update,
    sendCodigo,
    verifyCodigo,
    updatePassword,
    deleteUser,
    getCustomerWallet,
}
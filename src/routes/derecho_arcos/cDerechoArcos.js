import { DerechoArco } from '../../database/models/DerechoArco.js'
import config from '../../config.js'
import { minioClient, minioDomain, minioBucket } from "../../lib/minioClient.js"
// import { nodeMailer } from "../../lib/nodeMailer.js"
import { Resend } from 'resend'
import { companyName, arcoHtml } from '../../utils/layouts.js'

const create = async (req, res) => {
    try {

        if (req.body.datos) {
            const datos = JSON.parse(req.body.datos)
            req.body = { ...datos }
        }

        const {
            nombres, apellidos, doc_tipo, doc_numero, email, domicilio,
            rep_nombres, rep_apellidos, rep_doc_tipo, rep_doc_numero,
            tipo, detalle,
            captcha, fecha_recepcion,
        } = req.body

        const secretKey = config.RECAPTCHA_PRIVATE_KEY
        const archivos = req.files
        // console.log(archivos)
        // throw error

        // ----- VERIFY EL CAPTCHA ----- //
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${secretKey}&response=${captcha}`,
        })

        const data = await response.json()

        if (data.success) {
            // ----- SUBIR DOCUMENTOS ---- //
            let doc_file, rep_doc_file, extras_doc
            if (archivos.doc_file) doc_file = await minioPutObject(archivos.doc_file[0])
            if (archivos.rep_doc_file) rep_doc_file = await minioPutObject(archivos.rep_doc_file[0])
            if (archivos.extras_doc) extras_doc = await minioPutObject(archivos.extras_doc[0])

            const codigo = `ARCO-${new Date().getFullYear()}-${Date.now()}`
            const html = arcoHtml(nombres, apellidos, codigo, fecha_recepcion, tipo, email)

            // ----- GUARDAR ARCO ----- //
            await DerechoArco.create({
                codigo, estado: 1, fecha_recepcion,
                nombres, apellidos, doc_tipo, doc_numero, email, domicilio,
                rep_nombres, rep_apellidos, rep_doc_tipo, rep_doc_numero,
                tipo, detalle,
                doc_file, rep_doc_file, extras_doc,
            })

            // ----- ENVIAR CORREO ---- //
            // const nodemailer = nodeMailer()
            // const result = await nodemailer.sendMail({
            //     from: `SUNKA <${config.SOPORTE_EMAIL}>`,
            //     to: correo,
            //     subject: 'Código de verificación',
            //     html: 'HOLA'
            // })
            // console.log(result)

            const resend = new Resend(config.RESEND_API_KEY)
            const result = resend.emails.send({
                from: `${companyName} <invoices@divergerest.com>`,
                to: email,
                subject: `Confirmación de su solicitud de Derechos ARCO – Código ${codigo}`,
                html,
            })

            if (result.error) {
                console.error("Error al enviar email:", result.error);
                return res.status(500).json({ code: 1, msg: "No se pudo enviar el correo", error: result.error });
            }
            else {
                res.json({ code: 0 })
            }
        } else {
            res.json({ code: 1, error: data['error-codes'] })
        }
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

async function minioPutObject(file) {
    const timestamp = Date.now()
    const uniqueName = `${timestamp}-${file.originalname}`

    await minioClient.putObject(
        minioBucket,
        uniqueName,
        file.buffer,
        file.size,
        { "Content-Type": file.mimetype }
    )

    const publicUrl = `https://${minioDomain}/${minioBucket}/${uniqueName}`

    return {
        id: uniqueName,
        name: file.originalname,
        url: publicUrl,
    }
}

export default {
    create,
}
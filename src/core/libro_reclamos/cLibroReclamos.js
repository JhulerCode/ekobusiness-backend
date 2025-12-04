import { LibroReclamo } from '#db/models/LibroReclamo.js'
import config from '../../config.js'
import { nodeMailer } from "#mail/nodeMailer.js"
import { companyName, htmlLibroReclamos } from '#mail/templates.js'

const create = async (req, res) => {
    try {

        if (req.body.datos) {
            const datos = JSON.parse(req.body.datos)
            req.body = { ...datos }
        }

        const {
            nombres, apellidos, doc_tipo, doc_numero, correo, direccion, menor_edad,
            pedido_codigo, monto, producto_descripcion,
            tipo, resumen, detalle,
            fecha_recepcion,
        } = req.body

        const codigo = `LR-${new Date().getFullYear()}-${Date.now()}`
        const html = htmlLibroReclamos(nombres, apellidos, codigo, fecha_recepcion, tipo, resumen, detalle)

        // ----- GUARDAR ARCO ----- //
        await LibroReclamo.create({
            codigo, estado: 1, fecha_recepcion,
            nombres, apellidos, doc_tipo, doc_numero, correo, direccion, menor_edad,
            pedido_codigo, monto, producto_descripcion,
            tipo, resumen, detalle,
        })

        // ----- ENVIAR CORREO ---- //
        const nodemailer = nodeMailer()
        const result = await nodemailer.sendMail({
            from: `${companyName} <${config.SOPORTE_EMAIL}>`,
            to: correo,
            subject: `Confirmación de registro Libro de reclamaciones - Código ${codigo}`,
            html
        })
        console.log(result)
        if (result.error) {
            return res.json({ code: 1, msg: "No se pudo enviar el correo", error: result.error });
        }
        else {
            res.json({ code: 0 })
        }
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    create,
}
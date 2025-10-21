import { DerechoArco } from '../../database/models/DerechoArco.js'
import config from '../../config.js'

const create = async (req, res) => {
    try {
        const {
            nombres, apellidos, tipoDocumento, numeroDocumento, documento, email, domicilio,
            repNombres, repApellidos, repTipoDocumento, repNumeroDocumento, repDocumento,
            tipoSolicitud, detalle, adjuntoExtra,
            captcha
        } = req.body

        const secretKey = config.RECAPTCHA_PRIVATE_KEY

        // ----- VERIFY EL CAPTCHA ----- //
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${secretKey}&response=${captcha}`,
        })

        const data = await response.json()

        if (data.success) {
            // ----- GUARDAR ARCO ----- //
            await DerechoArco.create({
                nombres, apellidos, tipoDocumento, numeroDocumento, documento, email, domicilio,
                repNombres, repApellidos, repTipoDocumento, repNumeroDocumento, repDocumento,
                tipoSolicitud, detalle, adjuntoExtra,
            })

            res.json({ code: 0 })
        } else {
            res.json({ code: 1, error: data['error-codes'] })
        }
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    create,
}
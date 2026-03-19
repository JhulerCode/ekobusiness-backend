import { Repository } from '#db/Repository.js'
import { resUpdateFalse } from '#http/helpers.js'
import { minioPutObject, minioRemoveObject } from '#infrastructure/minioClient.js'
import { actualizarEmpresa } from '#store/empresas.js'

const repository = new Repository('Empresa')

const findById = async (req, res) => {
    try {
        const data = req.empresa

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params

        if (req.body.datos) {
            const datos = JSON.parse(req.body.datos)
            req.body = { ...datos }
        }

        const {
            ruc,
            razon_social,
            nombre_comercial,
            telefono,
            correo,
            logo,
            igv_porcentaje,
            direcciones,
            bancos,
            yape_number,
            ecommerce_url,
            facebook_url,
            instagram_url,
            whatsapp_ventas,
            whatsapp_ventas_url,
            subdominio,
        } = req.body

        //--- Subir archivo ---//
        let newFile
        if (req.file) {
            newFile = await minioPutObject(req.file)

            if (newFile == false) {
                res.status(500).json({ code: 1, msg: 'Error al subir el archivo' })
                return
            }
        }

        const send = {
            ruc,
            razon_social,
            nombre_comercial,
            telefono,
            correo,
            logo: newFile || logo,
            igv_porcentaje,
            direcciones,
            bancos,
            yape_number,
            ecommerce_url,
            facebook_url,
            instagram_url,
            whatsapp_ventas,
            whatsapp_ventas_url,
            subdominio,
            updatedBy: colaborador,
        }

        //--- ACTUALIZAR ---//
        const updated = await repository.update({ id }, send)

        if (updated == false) return resUpdateFalse(res)

        if (req.file && logo?.id) await minioRemoveObject(logo.id)

        actualizarEmpresa(id, { razon_social, ...send })

        res.json({ code: 0 })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    findById,
    update,
}

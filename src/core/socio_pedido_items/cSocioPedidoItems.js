import { Repository } from '#db/Repository.js'
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'

const repository = new Repository('SocioPedidoItem')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const data = await repository.find(qry)

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
            orden, articulo, nombre, unidad, has_fv,
            cantidad, entregado,
            pu, igv_afectacion, igv_porcentaje,
            blend_datos, nota,
            socio_pedido
        } = req.body

        //--- VERIFY SI EXISTE ---//
        if (await repository.existe({ articulo, socio_pedido, empresa }, res, 'El artículo ya fue agregado') == true) return

        //--- CREAR ---//
        const nuevo = await repository.create({
            orden, articulo, nombre, unidad, has_fv,
            cantidad, entregado,
            pu, igv_afectacion, igv_porcentaje,
            blend_datos, nota,
            socio_pedido,
            empresa,
            createdBy: colaborador,
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
            orden, articulo, nombre, unidad, has_fv,
            cantidad, entregado,
            pu, igv_afectacion, igv_porcentaje,
            blend_datos, nota,
            socio_pedido
        } = req.body

        //--- VERIFY SI EXISTE NOMBRE ---//
        if (await repository.existe({ articulo, socio_pedido, id, empresa }, res, 'El artículo ya fue agregado') == true) return

        //--- ACTUALIZAR ---//
        const updated = await repository.update({ id }, {
            orden, articulo, nombre, unidad, has_fv,
            cantidad, entregado,
            pu, igv_afectacion, igv_porcentaje,
            blend_datos, nota,
            updatedBy: colaborador
        })

        if (updated == false) return resUpdateFalse(res)

        res.json({ code: 0 })
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


//--- Helpers ---//
async function loadOne(id) {
    const data = await repository.find({ id })

    return data
}

export default {
    find,
    create,
    update,
    delet,
}
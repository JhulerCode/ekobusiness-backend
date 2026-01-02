import { Repository } from '#db/Repository.js'
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'

const repository = new Repository('SocioPedidoItem')
const TransaccionRepository = new Repository('Transaccion')
const KardexRepository = new Repository('Kardex')

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

const recalcularEntregados = async (req, res) => {
    try {
        const { empresa } = req.user
        const { socio_pedido } = req.body

        const qry = {
            fltr: {
                socio_pedido: { op: 'Es', val: socio_pedido },
            },
            cols: ['id', 'articulo'],
        }
        const socio_pedido_items = await repository.find(qry, true)

        const qry1 = {
            fltr: {
                socio_pedido: { op: 'Es', val: socio_pedido },
            },
            cols: ['id'],
        }
        const transacciones = await TransaccionRepository.find(qry1, true)

        const qry2 = {
            fltr: {
                transaccion: { op: 'Es', val: transacciones.map(d => d.id) },
            },
            cols: ['articulo', 'cantidad'],
        }
        const kardex = await KardexRepository.find(qry2, true)

        const entregados = {}
        for (const a of kardex) {
            if (!entregados[a.articulo]) entregados[a.articulo] = 0
            entregados[a.articulo] += Number(a.cantidad)
        }

        for (const a of socio_pedido_items) {
            const entregado = entregados[a.articulo] ? entregados[a.articulo] : 0
            await repository.update({ id: a.id }, { entregado })
        }

        res.json({ code: 0, socio_pedido_items, kardex, entregados })
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
    recalcularEntregados,
}
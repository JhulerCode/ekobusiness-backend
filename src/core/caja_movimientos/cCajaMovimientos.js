import { Repository } from '#db/Repository.js'
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'
import { formatDate } from '#shared/dayjs.js'

const repository = new Repository('CajaMovimiento')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const virtuals = ['fecha', 'comprobante_tipo']

        virtuals.forEach((v) => {
            if (qry?.cols?.includes(v)) qry.cols.push(`${v}1`)
        })

        const data = await repository.find(qry, true)

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    try {
        const { colaborador, empresa } = req.user
        const { fecha, tipo, comprobante_tipo, comprobante_numero, detalle, monto, caja_apertura } =
            req.body

        //--- CREAR ----- //
        const nuevo = await repository.create({
            fecha,
            tipo,
            comprobante_tipo,
            comprobante_numero,
            detalle,
            monto,
            caja_apertura,
            empresa,
            createdBy: colaborador,
        })

        const data = await loadOne(nuevo.id)

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params
        const { colaborador } = req.user
        const { fecha, comprobante_tipo, comprobante_numero, detalle, monto } = req.body

        //--- ACTUALIZAR ----- //
        const updated = await repository.update(
            { id },
            {
                fecha,
                comprobante_tipo,
                comprobante_numero,
                detalle,
                monto,
                updatedBy: colaborador,
            },
        )

        if (updated == false) return resUpdateFalse(res)

        const data = await loadOne(id)

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params

        if ((await repository.delete({ id })) == false) return resDeleteFalse(res)

        res.json({ code: 0 })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

//--- Helpers ---//
async function loadOne(id) {
    let data = await repository.find({ id }, true)

    return data
}

export default {
    find,
    create,
    update,
    delet,
}

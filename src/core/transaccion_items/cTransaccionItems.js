import { Repository } from '#db/Repository.js'

const repository = new Repository('TransaccionItem')

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
            orden,
            articulo, cantidad,
            pu, igv_afectacion, igv_porcentaje,
            lote, fv,
            transaccion
        } = req.body

        //--- CREAR ---//
        const nuevo = await repository.create({
            orden,
            articulo, cantidad,
            pu, igv_afectacion, igv_porcentaje,
            lote, fv,
            transaccion,
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
            orden,
            articulo, cantidad,
            pu, igv_afectacion, igv_porcentaje,
            lote, fv,
        } = req.body

        //--- ACTUALIZAR ---//
        const updated = await repository.update({ id }, {
            orden,
            articulo, cantidad,
            pu, igv_afectacion, igv_porcentaje,
            lote, fv,
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
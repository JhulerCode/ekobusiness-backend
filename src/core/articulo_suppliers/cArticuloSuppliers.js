import { Repository } from '#db/Repository.js'

const repository = new Repository('ArticuloSupplier')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const response = await repository.find(qry, true)

        const hasPage = qry?.page
        const data = hasPage ? response.data : response
        const meta = hasPage ? response.meta : null

        res.json({ code: 0, data, meta })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const data = await repository.find({ id, ...qry })

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    try {
        const { colaborador, empresa } = req.user
        const {
            articulo,
            socio,
            min_qty,
            price,
            currency_id,
            delay,
            date_start,
            date_end,
            product_code,
            product_name,
            sequence,
        } = req.body

        //--- CREAR ---//
        const nuevo = await repository.create({
            articulo,
            socio,
            min_qty,
            price,
            currency_id,
            delay,
            date_start,
            date_end,
            product_code,
            product_name,
            sequence,
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
        const { colaborador, empresa } = req.user
        const { id } = req.params
        const {
            articulo,
            socio,
            min_qty,
            price,
            currency_id,
            delay,
            date_start,
            date_end,
            product_code,
            product_name,
            sequence,
        } = req.body

        //--- ACTUALIZAR ---//
        const updated = await repository.update(
            { id },
            {
                articulo,
                socio,
                min_qty,
                price,
                currency_id,
                delay,
                date_start,
                date_end,
                product_code,
                product_name,
                sequence,
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
    const data = await repository.find({ id, incl: ['articulo1', 'socio1', 'currency_id1'] }, true)

    return data
}

export default {
    find,
    findById,
    create,
    delet,
    update,
}

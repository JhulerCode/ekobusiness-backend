import { Repository } from '#db/Repository.js'
import sequelize from '#db/sequelize.js'
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'

const repository = new Repository('HelpdeskTicket')

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

        const data = await repository.find({ id })

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    try {
        const { colaborador, empresa } = req.user
        const { nombre, descripcion, socio, articulo, estado, reclamo_fecha, reclamo_fuente } =
            req.body

        //--- VERIFY SI EXISTE ---//
        if ((await repository.existe({ fecha, moneda, empresa }, res, 'Ya existe')) == true) return

        //--- CREAR ---//
        const nuevo = await repository.create({
            nombre,
            descripcion,
            socio,
            articulo,
            estado,
            reclamo_fecha,
            reclamo_fuente,
            empresa,
            createdBy: colaborador,
        })

        // ----- DEVOLVER ----- //
        const data = await loadOne(nuevo.id)
        res.json({ code: 0, data })
    } catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    try {
        const { colaborador, empresa } = req.user
        const { id } = req.params
        const { nombre, descripcion, socio, articulo, estado, reclamo_fecha, reclamo_fuente } =
            req.body

        //--- VERIFY SI EXISTE ---//
        if ((await repository.existe({ fecha, moneda, id, empresa }, res, 'Ya existe')) == true)
            return

        //--- ACTUALIZAR ---//
        const updated = await repository.update(
            { id },
            {
                nombre,
                descripcion,
                socio,
                articulo,
                estado,
                reclamo_fecha,
                reclamo_fuente,
                updatedBy: colaborador,
            },
        )

        if (updated == false) return resUpdateFalse(res)

        // ----- DEVOLVER ----- //
        const data = await loadOne(id)
        res.json({ code: 0, data })
    } catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params

        if ((await repository.delete({ id })) == false) return resDeleteFalse(res)

        res.json({ code: 0 })
    } catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

//--- Helpers ---//
async function loadOne(id) {
    const data = await repository.find({ id })

    return data
}

export default {
    create,
    update,
    find,
    findById,
    delet,
}

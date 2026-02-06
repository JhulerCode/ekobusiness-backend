import { Repository } from '#db/Repository.js'
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'
// import { arrayMap } from '#store/system.js'
import sequelize from '#db/sequelize.js'

const repository = new Repository('MrpBom')
const MrpBomLineRepository = new Repository('MrpBomLine')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const data = await repository.find(qry)

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const data = await repository.find({ id, ...qry }, true)

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador, empresa } = req.user
        const { articulo, tipo, mrp_bom_lines } = req.body

        //--- CREAR ---//
        const nuevo = await repository.create(
            {
                articulo,
                tipo,
                empresa,
                createdBy: colaborador,
            },
            transaction,
        )

        const lines = mrp_bom_lines.map((a) => ({
            ...a,
            mrp_bom: nuevo.id,
            empresa,
            createdBy: colaborador,
        }))

        await MrpBomLineRepository.createBulk(lines, transaction)

        await transaction.commit()

        const data = await loadOne(id)

        res.json({ code: 0, data })
    } catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador, empresa } = req.user
        const { id } = req.params
        const { articulo, tipo, mrp_bom_lines } = req.body

        //--- ACTUALIZAR ---//
        const updated = await repository.update(
            { id },
            {
                articulo,
                tipo,
                updatedBy: colaborador,
            },
            transaction,
        )

        if (updated == false) return resUpdateFalse(res)

        await MrpBomLineRepository.delete({ mrp_bom: id }, transaction)

        const lines = mrp_bom_lines.map((a) => ({
            ...a,
            mrp_bom: id,
            empresa,
            createdBy: colaborador,
        }))

        await MrpBomLineRepository.createBulk(lines, transaction)

        await transaction.commit()

        const data = await loadOne(id)

        res.json({ code: 0 })
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
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

//--- Helpers ---//
async function loadOne(id) {
    const data = await repository.find({ id, incl: ['articulo1'] }, true)

    // if (data) {
    //     const mrp_bom_tiposMap = arrayMap('mrp_bom_tipos')

    //     data.tipo1 = mrp_bom_tiposMap[data.tipo]
    // }

    return data
}

export default {
    find,
    findById,
    create,
    delet,
    update,
}

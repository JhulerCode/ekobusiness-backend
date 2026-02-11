import { Repository } from '#db/Repository.js'
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'
// import { arrayMap } from '#store/system.js'
import sequelize from '#db/sequelize.js'

const MrpBomRepository = new Repository('MrpBom')
const MrpBomLineRepository = new Repository('MrpBomLine')
const MrpBomSocioRepository = new Repository('MrpBomSocio')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const data = await MrpBomRepository.find(qry)

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const data = await MrpBomRepository.find({ id, ...qry }, true)

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador, empresa } = req.user
        const { articulo, tipo, mrp_bom_lines, mrp_bom_socios } = req.body

        //--- CREAR ---//
        const nuevo = await MrpBomRepository.create(
            {
                articulo,
                tipo,
                empresa,
                createdBy: colaborador,
            },
            transaction,
        )

        const lines = mrp_bom_lines.map((a) => ({
            orden: a.orden,
            articulo: a.articulo,
            cantidad: a.cantidad,
            mrp_bom: nuevo.id,
            empresa,
            createdBy: colaborador,
        }))
        await MrpBomLineRepository.createBulk(lines, transaction)

        if (mrp_bom_socios.length > 0) {
            const socios = mrp_bom_socios.map((a) => ({
                socio: a.socio,
                mrp_bom: nuevo.id,
                empresa,
                createdBy: colaborador,
            }))
            await MrpBomSocioRepository.createBulk(socios, transaction)
        }

        await transaction.commit()

        const data = await loadOne(nuevo.id)
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
        const { articulo, tipo, mrp_bom_lines, mrp_bom_socios } = req.body

        //--- ACTUALIZAR ---//
        const updated = await MrpBomRepository.update(
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
        await MrpBomSocioRepository.delete({ mrp_bom: id }, transaction)

        const lines = mrp_bom_lines.map((a) => ({
            orden: a.orden,
            articulo: a.articulo,
            cantidad: a.cantidad,
            mrp_bom: id,
            empresa,
            createdBy: colaborador,
        }))
        await MrpBomLineRepository.createBulk(lines, transaction)

        if (mrp_bom_socios.length > 0) {
            const socios = mrp_bom_socios.map((a) => ({
                socio: a.socio,
                mrp_bom: id,
                empresa,
                createdBy: colaborador,
            }))
            await MrpBomSocioRepository.createBulk(socios, transaction)
        }

        await transaction.commit()

        const data = await loadOne(id)

        res.json({ code: 0, data })
    } catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { id } = req.params

        await MrpBomLineRepository.delete({ mrp_bom: id }, transaction)
        await MrpBomSocioRepository.delete({ mrp_bom: id }, transaction)

        if ((await MrpBomRepository.delete({ id }, transaction)) == false)
            return resDeleteFalse(res)

        await transaction.commit()

        res.json({ code: 0 })
    } catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

//--- Helpers ---//
async function loadOne(id) {
    const data = await MrpBomRepository.find({ id, incl: ['articulo1'] })

    return data
}

export default {
    find,
    findById,
    create,
    delet,
    update,
}

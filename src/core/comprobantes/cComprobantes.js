import { Repository } from '#db/Repository.js'
import sequelize from '#db/sequelize.js'
import { resUpdateFalse } from '#http/helpers.js'

const repository = new Repository('Comprobante')
const ComprobanteItemRepo = new Repository('ComprobanteItem')
const TransaccionRepo = new Repository('Transaccion')
const TransaccionItemRepo = new Repository('TransaccionItem')
const LoteRepo = new Repository('Lote')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }
        console.log(qry)
        const response = await repository.find(qry, true)
        console.log(response)
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
        const body = req.body

        const nuevo = await repository.create(
            {
                ...body,
                empresa,
                createdBy: colaborador,
            },
            transaction,
        )

        if (body.comprobante_items) {
            const items = body.comprobante_items.map((item) => ({
                ...item,
                comprobante: nuevo.id,
                empresa,
                createdBy: colaborador,
            }))
            await ComprobanteItemRepo.createBulk(items, transaction)
        }

        await transaction.commit()
        res.json({ code: 0, data: nuevo })
    } catch (error) {
        await transaction.rollback()
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const vincularTransacciones = async (req, res) => {
    const transaction = await sequelize.transaction()
    try {
        const { id: comprobanteId } = req.params
        const { transaccionIds } = req.body // Array de IDs

        // 1. Vincular transacciones al comprobante
        await TransaccionRepo.update(
            { id: { op: 'In', val: transaccionIds } },
            { comprobante_id: comprobanteId },
            transaction,
        )

        // 2. Recalcular costos
        const compItems = await ComprobanteItemRepo.find(
            {
                fltr: { comprobante: { op: 'Es', val: comprobanteId } },
            },
            true,
        )

        const transItems = await TransaccionItemRepo.find(
            {
                fltr: { transaccion: { op: 'In', val: transaccionIds } },
            },
            true,
        )

        for (const tItem of transItems) {
            const cItem = compItems.find((item) => item.articulo === tItem.articulo)
            if (cItem && cItem.vu) {
                await LoteRepo.update({ transaccion_item: tItem.id }, { vu: cItem.vu }, transaction)
            }
        }

        await transaction.commit()
        res.json({ code: 0 })
    } catch (error) {
        await transaction.rollback()
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const getPendingTransacciones = async (req, res) => {
    try {
        const { socio_id } = req.params
        const { empresa } = req.user

        // Buscar transacciones de tipo 'compra' (ej: tipo 1) que no tengan comprobante_id
        const transacciones = await TransaccionRepo.find(
            {
                fltr: {
                    socio: { op: 'Es', val: socio_id },
                    comprobante_id: { op: 'EsNulo', val: null },
                    empresa: { op: 'Es', val: empresa },
                },
                incl: ['transaccion_items'],
            },
            true,
        )

        res.json({ code: 0, data: transacciones })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    create,
    find,
    findById,
    vincularTransacciones,
    getPendingTransacciones,
}

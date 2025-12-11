import { Repository } from '#db/Repository.js'
import { Op } from 'sequelize'
import sequelize from '#db/sequelize.js'
import { TipoCambio } from '#db/models/TipoCambio.js'
import { Transaccion } from '#db/models/Transaccion.js'
import { Kardex } from '#db/models/Kardex.js'
import { applyFilters, existe } from '#shared/mine.js'

const TransaccionRepo = new Repository('Transaccion')
const KardexRepo = new Repository('Kardex')

const repository = new Repository('TipoCambio')

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

const findById = async (req, res) => {
    try {
        const { id } = req.params

        const data = await repository.find({ id })

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador, empresa } = req.user
        const { fecha, compra, venta, moneda } = req.body

        //--- VERIFY SI EXISTE ---//
        if (await repository.existe({ fecha, moneda, empresa }, res, 'Ya existe') == true) return

        //--- CREAR ---//
        const nuevo = await repository.create({
            fecha, compra, venta, moneda,
            empresa,
            createdBy: colaborador
        }, transaction)

        //--- Actualizar en transacciones ---//
        await Transaccion.update(
            {
                tipo_cambio: venta
            },
            {
                where: { fecha, moneda },
                transaction
            }
        )

        //--- Actualizar en kardex ---//
        await Kardex.update(
            {
                tipo_cambio: venta
            },
            {
                where: {
                    fecha, moneda,
                    is_lote_padre: true,
                },
                transaction
            }
        )

        await transaction.commit()

        // ----- DEVOLVER ----- //
        const data = await loadOne(nuevo.id)
        res.json({ code: 0, data })
    }
    catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador, empresa } = req.user
        const { id } = req.params
        const { fecha, compra, venta, moneda } = req.body

        //--- VERIFY SI EXISTE ---//
        if (await repository.existe({ fecha, moneda, id, empresa }, res, 'Ya existe') == true) return

        //--- ACTUALIZAR ---//
        const updated = await repository.update(id, {
            fecha, compra, venta, moneda,
            updatedBy: colaborador
        }, transaction)

        if (updated == false) return

        //--- Actualizar en transacciones ---//
        await Transaccion.update(
            {
                tipo_cambio: venta
            },
            {
                where: { fecha, moneda },
                transaction
            }
        )

        //--- Actualizar en kardex ---//
        await Kardex.update(
            {
                tipo_cambio: venta
            },
            {
                where: {
                    fecha, moneda,
                    is_lote_padre: true,
                },
                transaction
            }
        )

        await transaction.commit()

        // ----- DEVOLVER ----- //
        const data = await loadOne(id)
        res.json({ code: 0, data })
    }
    catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { id } = req.params
        const { fecha, moneda } = req.body

        if (await repository.delete(id) == false) return

        //--- Actualizar en transacciones ---//
        await Transaccion.update(
            {
                tipo_cambio: null
            },
            {
                where: { fecha, moneda },
                transaction
            }
        )

        //--- Actualizar en kardex ---//
        await Kardex.update(
            {
                tipo_cambio: null
            },
            {
                where: {
                    fecha, moneda,
                    is_lote_padre: true,
                },
                transaction
            }
        )

        await transaction.commit()

        res.json({ code: 0 })
    }
    catch (error) {
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
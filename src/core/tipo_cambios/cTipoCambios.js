import { Op } from 'sequelize'
import sequelize from '#db/sequelize.js'
import { TipoCambio } from '#db/models/TipoCambio.js'
import { Transaccion } from '#db/models/Transaccion.js'
import { Kardex } from '#db/models/Kardex.js'
import { applyFilters, existe } from '#shared/mine.js'

const create = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador } = req.user
        const { fecha, compra, venta, moneda } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await existe(TipoCambio, { fecha, moneda }, res, 'Ya existe') == true) return

        // ----- CREAR ----- //
        const nuevo = await TipoCambio.create({
            fecha, compra, venta, moneda,
            createdBy: colaborador
        }, { transaction })

        // ----- ACTUALIZAR EN TRANSACCIONES ----- //
        await Transaccion.update(
            {
                tipo_cambio: venta
            },
            {
                where: { fecha, moneda },
                transaction
            }
        )

        // ----- ACTUALIZAR EN KARDEX ----- //
        await Kardex.update(
            {
                tipo_cambio: venta
            },
            {
                where: {
                    fecha,
                    moneda,
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
        const { colaborador } = req.user
        const { id } = req.params
        const { fecha, compra, venta, moneda } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await existe(TipoCambio, { fecha, moneda, id }, res, 'Ya existe') == true) return

        // ----- ACTUALIZAR ----- //
        const [affectedRows] = await TipoCambio.update(
            {
                fecha, compra, venta, moneda,
                updatedBy: colaborador
            },
            { where: { id } }
        )

        if (affectedRows > 0) {
            // ----- ACTUALIZAR EN TRANSACCIONES ----- //
            await Transaccion.update(
                {
                    tipo_cambio: venta
                },
                {
                    where: { fecha, moneda },
                    transaction
                }
            )

            // ----- ACTUALIZAR EN KARDEX ----- //
            await Kardex.update(
                {
                    tipo_cambio: venta
                },
                {
                    where: {
                        fecha,
                        moneda,
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
        else {
            await transaction.commit()

            res.json({ code: 1, msg: 'No se actualizó ningún registro' })
        }
    }
    catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

async function loadOne(id) {
    let data = await TipoCambio.findByPk(id)

    return data
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id', 'fecha', 'compra', 'venta', 'moneda'],
            order: [['fecha', 'DESC']],
            where: {},
        }

        if (qry) {
            if (qry.fltr) {
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }

            if (qry.cols) {
                findProps.attributes = findProps.attributes.concat(qry.cols)
            }
        }

        let data = await TipoCambio.findAll(findProps)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params

        const data = await TipoCambio.findByPk(id)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { id } = req.params
        const { fecha, moneda } = req.body

        await TipoCambio.destroy({ where: { id } })

        // ----- ACTUALIZAR EN TRANSACCIONES ----- //
        await Transaccion.update(
            {
                tipo_cambio: null
            },
            {
                where: { fecha, moneda },
                transaction
            }
        )

        // ----- ACTUALIZAR EN KARDEX ----- //
        await Kardex.update(
            {
                tipo_cambio: null
            },
            {
                where: {
                    fecha,
                    moneda,
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

export default {
    create,
    update,
    find,
    findById,
    delet,
}
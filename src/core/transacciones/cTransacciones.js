import { Repository } from '#db/Repository.js'
import sequelize from '#db/sequelize.js'
import { resUpdateFalse } from '#http/helpers.js'
import { formatDate } from '#shared/dayjs.js'

const repository = new Repository('Transaccion')
const TransaccionItemRepo = new Repository('TransaccionItem')
const LoteRepo = new Repository('Lote')
const KardexRepo = new Repository('Kardex')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const virtuals = ['fecha', 'pago_condicion', 'estado']

        virtuals.forEach((v) => {
            if (qry?.cols?.includes(v)) qry.cols.push(`${v}1`)
        })

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

        const data = await repository.find({ id, ...qry }, true)

        if (data) {
            if (data.transaccion_items) data.transaccion_items.sort((a, b) => a.orden - b.orden)

            // for (const a of data.transaccion_items) {
            //     if (a.lote_padre) {
            //         // a.lotes = [...a.],
            //         a.lotes = [{
            //             id: a.lote_padre1.id,
            //             lote_fv_stock: a.lote_padre1.lote + (a.lote_padre1.fv ? ` | ${a.lote_padre1.fv}` : '') + (` | ${a.stock}`)
            //         }]
            //     }
            // }
        }

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

        // ----- CREAR ----- //
        const nuevo = await repository.create(
            {
                ...body,
                empresa,
                createdBy: colaborador,
            },
            transaction,
        )

        // ----- GUARDAR ITEMS ----- //
        const transaccion_items = body.transaccion_items.map((a, i) => ({
            ...a,
            transaccion: nuevo.id,
            empresa,
            createdBy: colaborador,
        }))
        await TransaccionItemRepo.createBulk(transaccion_items, transaction)

        //--- CUANDO SON LOTES NUEVOS ---//
        if (body.tipo == '1') {
            const lotes = []
            const kardexes = []
            for (const a of body.transaccion_items) {
                for (const b of a.lotes) {
                    lotes.push({
                        ...b,
                        articulo: a.articulo,
                        stock: b.cantidad,
                        transaccion_item: a.id,
                        empresa,
                        createdBy: colaborador,
                    })

                    kardexes.push({
                        tipo: body.tipo,
                        fecha: body.fecha,
                        articulo: a.articulo,
                        cantidad: b.cantidad,
                        lote_id: b.id,
                        // origen: body.origen,
                        // destino: body.destino,
                        transaccion_item: a.id,
                        transaccion: nuevo.id,
                        empresa,
                        createdBy: colaborador,
                    })
                }
            }

            await LoteRepo.createBulk(lotes, transaction)
            await KardexRepo.createBulk(kardexes, transaction)
        }

        //--- CUANDO SE USA LOTES EXISTENTES ---//
        if (body.tipo == '5' || body.tipo == 'abastacer_maquila') {
            const kardexes = []
            for (const a of body.transaccion_items) {
                for (const b of a.lotes) {
                    kardexes.push({
                        tipo: body.tipo,
                        fecha,
                        articulo: b.articulo,
                        cantidad: b.cantidad,
                        lote_id: b.id,
                        // origen: body.origen,
                        // destino: body.destino,
                        transaccion_item: a.id,
                        transaccion: nuevo.id,
                        empresa,
                        createdBy: colaborador,
                    })
                }
            }
            await KardexRepo.createBulk(kardexes, transaction)
        }

        // ----- ACTUALIZAR CANTIDAD ENTREGADA EN PEDIDO ----- //
        if (body.tipo == 1 || body.tipo == 5) {
            if (body.socio_pedido) {
                const cases = body.transaccion_items
                    .map((a) => `WHEN '${a.articulo}' THEN ${a.cantidad}`)
                    .join(' ')

                const articulos = body.transaccion_items.map((a) => `'${a.articulo}'`).join(',')

                await sequelize.query(
                    `
                        UPDATE socio_pedido_items
                        SET entregado = COALESCE(entregado, 0) + CASE articulo
                            ${cases}
                            ELSE 0
                        END
                        WHERE socio_pedido = '${body.socio_pedido}'
                        AND articulo IN (${articulos})
                    `,
                    { transaction },
                )
            }
        }

        //--- DESCONTAR STOCK DE LOTES ---//
        if (body.tipo == '5' || body.tipo == 'abastacer_maquila') {
            const lotesMap = {}

            for (const a of body.transaccion_items) {
                for (const b of a.lotes) {
                    lotesMap[b.id] = (lotesMap[b.id] || 0) + b.cantidad
                }
            }

            const lotes = Object.entries(lotesMap).map(([lote_id, cantidad]) => ({
                lote_id,
                cantidad,
            }))

            const cases = lotes.map((a) => `WHEN '${a.lote_id}' THEN ${a.cantidad}`).join(' ')

            const ids = lotes.map((a) => `'${a.lote_id}'`).join(',')

            await sequelize.query(
                `
                UPDATE lotes
                    SET stock = COALESCE(stock, 0) - CASE id
                        ${cases}
                        ELSE 0
                    END
                    WHERE id IN (${ids})
                `,
                { transaction },
            )
        }

        await transaction.commit()

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
        const { colaborador } = req.user
        const { id } = req.params
        const body = req.body

        const updated = await repository.update(
            { id },
            {
                ...body,
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
    const transaction = await sequelize.transaction()

    try {
        const { id } = req.params
        const { tipo, estado } = req.body

        await KardexRepo.delete({ transaccion: id }, transaction)

        await TransaccionItemRepo.delete({ transaccion: id }, transaction)

        await repository.delete({ id }, transaction)

        // ----- SI ES UNA VENTA ----- //
        if (tipo == 5) {
            const qry = {
                fltr: { transaccion: { op: 'Es', val: id } },
                cols: ['id', 'lote_padre', 'cantidad'],
            }
            const kardexes = await KardexRepo.find(qry)

            for (const a of kardexes) {
                await KardexRepo.update(
                    { id: a.lote_padre },
                    { stock: sequelize.literal(`COALESCE(stock, 0) + ${a.cantidad}`) },
                    transaction,
                )
            }
        }

        await transaction.commit()

        res.json({ code: 0 })
    } catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

// --- Helpers --- //
async function loadOne(id) {
    const data = await repository.find({ id, incl: ['socio1', 'moneda1', 'socio_pedido1'] }, true)

    return data
}

export default {
    create,
    update,
    find,
    findById,
    delet,
}

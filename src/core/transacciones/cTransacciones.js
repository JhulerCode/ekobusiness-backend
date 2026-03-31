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

        //--- CREAR ----- //
        const nuevo = await repository.create(
            {
                ...body,
                empresa,
                createdBy: colaborador,
            },
            transaction,
        )

        //--- GUARDAR ITEMS ----- //
        const transaccion_items = body.transaccion_items.map((a, i) => ({
            ...a,
            transaccion: nuevo.id,
            empresa,
            createdBy: colaborador,
        }))
        await TransaccionItemRepo.createBulk(transaccion_items, transaction)

        //--- CREAR KARDEXES ---//
        const lotes = []
        const kardexes = []
        for (const a of body.transaccion_items) {
            for (const b of a.kardexes) {
                //--- CUANDO SON LOTES NUEVOS ---//
                if (body.tipo == '1') {
                    lotes.push({
                        ...b.lote1,
                        articulo: a.articulo,
                        stock: b.cantidad,
                        transaccion_item: a.id,
                        empresa,
                        createdBy: colaborador,
                    })
                }

                kardexes.push({
                    tipo: body.tipo,
                    fecha: body.fecha,
                    articulo: b.articulo,
                    cantidad: b.cantidad,
                    lote_id: b.lote1.id,
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

        //--- ACTUALIZAR CANTIDAD ENTREGADA EN PEDIDO ----- //
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
                for (const b of a.kardexes) {
                    lotesMap[b.lote_id] = (lotesMap[b.lote_id] || 0) + b.cantidad
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

        //--- DEVOLVER ----- //
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
        const { tipo, estado, socio_pedido } = req.body

        //--- RECUPERAR ITEMS DE LA TRANSACCION --//
        const transaccion_items = await TransaccionItemRepo.find(
            {
                fltr: { transaccion: { op: 'Es', val: id } },
                cols: ['id', 'articulo', 'cantidad'],
            },
            true,
        )

        //--- RECUPERAR KARDEXES ---//
        const kardexes = await KardexRepo.find(
            {
                fltr: { transaccion: { op: 'Es', val: id } },
                cols: ['id', 'lote_id', 'cantidad'],
            },
            true,
        )

        //--- BORRAR TRANSACCION Y RELACIONES --//
        await KardexRepo.delete({ transaccion: id }, transaction)
        if (tipo == 1) {
            await LoteRepo.delete({ id: kardexes.map((a) => a.lote_id) }, transaction)
        }
        await TransaccionItemRepo.delete({ transaccion: id }, transaction)
        await repository.delete({ id }, transaction)

        //--- ACTUALIZAR CANTIDAD ENTREGADA EN PEDIDO ---//
        if (socio_pedido) {
            const articleQty = {}
            for (const item of transaccion_items) {
                articleQty[item.articulo] = (articleQty[item.articulo] || 0) + item.cantidad
            }

            const cases = Object.entries(articleQty)
                .map(([articulo, cantidad]) => `WHEN '${articulo}' THEN ${cantidad}`)
                .join(' ')

            const articulos = Object.keys(articleQty)
                .map((a) => `'${a}'`)
                .join(',')

            if (articulos.length > 0) {
                await sequelize.query(
                    `
                        UPDATE socio_pedido_items
                        SET entregado = COALESCE(entregado, 0) - CASE articulo
                            ${cases}
                            ELSE 0
                        END
                        WHERE socio_pedido = '${socio_pedido}'
                        AND articulo IN (${articulos})
                    `,
                    { transaction },
                )
            }
        }

        //--- SI ES UNA VENTA, DEVOLVER STOCK A LOTES ---//
        if (tipo == 5 && kardexes.length > 0) {
            const loteQty = {}
            for (const a of kardexes) {
                loteQty[a.lote_id] = (loteQty[a.lote_id] || 0) + a.cantidad
            }

            const cases = Object.entries(loteQty)
                .map(([lote_id, cantidad]) => `WHEN '${lote_id}' THEN ${cantidad}`)
                .join(' ')

            const ids = Object.keys(loteQty)
                .map((id) => `'${id}'`)
                .join(',')

            await sequelize.query(
                `
                    UPDATE lotes
                    SET stock = COALESCE(stock, 0) + CASE id
                        ${cases}
                        ELSE 0
                    END
                    WHERE id IN (${ids})
                `,
                { transaction },
            )
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

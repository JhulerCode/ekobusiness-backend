import { Repository } from '#db/Repository.js'
import sequelize from '#db/sequelize.js'
import cSistema from "../_sistema/cSistema.js"
import { resUpdateFalse } from '#http/helpers.js'

const repository = new Repository('Transaccion')
const TransaccionItemRepo = new Repository('TransaccionItem')
const KardexRepo = new Repository('Kardex')
const SocioPedidoItemRepo = new Repository('SocioPedidoItem')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const data = await repository.find(qry, true)

        if (data.length > 0) {
            const pago_condicionesMap = cSistema.arrayMap('pago_condiciones')
            const transaccion_estadosMap = cSistema.arrayMap('transaccion_estados')

            for (const a of data) {
                if (qry?.cols?.includes('pago_condicion')) a.pago_condicion1 = pago_condicionesMap[a.pago_condicion]
                if (qry?.cols?.includes('estado')) a.estado1 = transaccion_estadosMap[a.estado]
            }
        }

        res.json({ code: 0, data })
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador, empresa } = req.user
        const {
            tipo, fecha,
            socio_pedido, socio, guia, factura,
            pago_condicion, moneda, tipo_cambio, monto,
            observacion, estado,
            transaccion_items
        } = req.body

        // ----- CREAR ----- //
        const nuevo = await repository.create({
            tipo, fecha,
            socio_pedido, socio, guia, factura,
            pago_condicion, moneda, tipo_cambio, monto,
            observacion, estado,
            empresa,
            createdBy: colaborador
        }, transaction)

        // ----- GUARDAR ITEMS ----- //
        const items = transaccion_items.map((a, i) => ({
            id: a.id,
            orden: i,
            articulo: a.articulo,
            cantidad: a.cantidad,

            pu: a.pu,
            igv_afectacion: a.igv_afectacion,
            igv_porcentaje: a.igv_porcentaje,

            lote: a.lote,
            fv: a.fv,

            observacion: a.observacion,

            transaccion: nuevo.id,
            empresa,
            createdBy: colaborador
        }))

        await TransaccionItemRepo.createBulk(items, transaction)


        // ----- GUARDAR KARDEX ----- //
        let kardex_items = []
        if (tipo == 1) {
            kardex_items = transaccion_items.map(a => ({
                tipo, fecha,
                articulo: a.articulo,
                cantidad: a.cantidad,

                pu: a.pu,
                igv_afectacion: a.igv_afectacion,
                igv_porcentaje: a.igv_porcentaje,
                moneda: a.moneda,
                tipo_cambio: a.tipo_cambio,

                lote: a.lote,
                fv: a.fv,

                is_lote_padre: true,
                stock: a.cantidad,

                transaccion_item: a.id,
                transaccion: nuevo.id,
                empresa,
                createdBy: colaborador
            }))
        }
        else {
            for (const a of transaccion_items) {
                for (const b of a.kardexes) {
                    kardex_items.push({
                        tipo, fecha,
                        articulo: b.articulo,
                        cantidad: b.cantidad,

                        is_lote_padre: false,
                        lote_padre: b.lote_padre,

                        transaccion_item: a.id,
                        transaccion: nuevo.id,
                        empresa,
                        createdBy: colaborador
                    })
                }
            }
        }

        await KardexRepo.createBulk(kardex_items, transaction)


        // ----- ACTUALIZAR CANTIDAD ENTREGADA ----- //
        if (socio_pedido) {
            const cases = transaccion_items
                .map(a => `WHEN '${a.articulo}' THEN ${a.cantidad}`)
                .join(' ')

            const articulos = transaccion_items.map(a => `'${a.articulo}'`).join(',')

            await sequelize.query(`
                    UPDATE socio_pedido_items
                    SET entregado = COALESCE(entregado, 0) + CASE articulo
                        ${cases}
                        ELSE 0
                    END
                    WHERE socio_pedido = '${socio_pedido}'
                    AND articulo IN (${articulos})
                `,
                { transaction }
            )
        }


        // ----- SI ES UNA VENTA ----- //
        if (tipo == 5) {
            const kardexMap = {}

            for (const a of transaccion_items) {
                for (const b of a.kardexes) {
                    kardexMap[b.lote_padre] =
                        (kardexMap[b.lote_padre] || 0) + b.cantidad
                }
            }

            const kardexes = Object.entries(kardexMap).map(
                ([lote_padre, cantidad]) => ({ lote_padre, cantidad })
            )

            const cases = kardexes
                .map(k => `WHEN '${k.lote_padre}' THEN ${k.cantidad}`)
                .join(' ')

            const ids = kardexes.map(k => `'${k.lote_padre}'`).join(',')

            await sequelize.query(`
                UPDATE kardexes
                    SET stock = COALESCE(stock, 0) - CASE id
                        ${cases}
                        ELSE 0
                    END
                    WHERE id IN (${ids})
                `,
                { transaction }
            )
        }

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
    try {
        const { colaborador } = req.user
        const { id } = req.params
        const {
            tipo, fecha,
            socio_pedido, socio, guia, factura,
            pago_condicion, moneda, tipo_cambio, monto,
            observacion, estado,
        } = req.body

        const updated = await repository.update(id, {
            tipo, fecha,
            socio_pedido, socio, guia, factura,
            pago_condicion, moneda, tipo_cambio, monto,
            observacion, estado,
            updatedBy: colaborador
        })

        if (updated == false) return resUpdateFalse(res)

        const data = await loadOne(id)
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
        const { tipo, estado } = req.body

        await KardexRepo.delete({ transaccion: id }, transaction)

        await TransaccionItemRepo.delete({ transaccion: id }, transaction)

        await repository.delete({ id }, transaction)

        // ----- SI ES UNA VENTA ----- //
        if (tipo == 5) {
            const qry = {
                fltr: { transaccion: { op: 'Es', val: id } },
                cols: ['id', 'lote_padre', 'cantidad']
            }
            const kardexes = await KardexRepo.find(qry)

            for (const a of kardexes) {
                await KardexRepo.update(
                    { id: a.lote_padre },
                    { stock: sequelize.literal(`COALESCE(stock, 0) + ${a.cantidad}`) },
                    transaction
                )
            }
        }

        await transaction.commit()

        res.json({ code: 0 })
    }
    catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


async function loadOne(id) {
    const data = await repository.find({ id, incl: ['socio1', 'moneda1', 'socio_pedido1'] }, true)

    if (data) {
        const pago_condicionesMap = cSistema.arrayMap('pago_condiciones')
        const transaccion_estadosMap = cSistema.arrayMap('transaccion_estados')

        data.pago_condicion1 = pago_condicionesMap[data.pago_condicion]
        data.estado1 = transaccion_estadosMap[data.estado]
    }

    return data
}

export default {
    create,
    update,
    find,
    findById,
    delet,
}
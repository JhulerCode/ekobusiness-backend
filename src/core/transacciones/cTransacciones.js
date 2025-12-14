import { Repository } from '#db/Repository.js'
import sequelize from '#db/sequelize.js'
import cSistema from "../_sistema/cSistema.js"

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
            for (const a of data.transaccion_items) {
                if (a.lote_padre) {
                    // a.lotes = [...a.]
                    // a.lotes = [{
                    //     id: a.lote_padre1.id,
                    //     lote_fv_stock: a.lote_padre1.lote + (a.lote_padre1.fv ? ` | ${a.lote_padre1.fv}` : '') + (` | ${a.stock}`)
                    // }]
                }
            }
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
            has_pedido, socio_pedido, socio, guia, factura,
            pago_condicion, moneda, tipo_cambio, monto,
            observacion, estado,
            transaccion_items
        } = req.body

        // ----- CREAR ----- //
        const nuevo = await repository.create({
            tipo, fecha,
            has_pedido, socio_pedido, socio, guia, factura,
            pago_condicion, moneda, tipo_cambio, monto,
            observacion, estado,
            empresa,
            createdBy: colaborador
        }, transaction)

        // ----- GUARDAR ITEMS ----- //
        const items = transaccion_items.map(a => ({
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
        const kardex_items = transaccion_items.map(a => ({
            tipo, fecha,
            articulo: a.articulo,
            cantidad: a.cantidad,

            pu: a.pu,
            igv_afectacion: a.igv_afectacion,
            igv_porcentaje: a.igv_porcentaje,
            moneda: a.moneda,
            tipo_cambio: a.tipo_cambio,

            lote: tipo == 1 ? a.lote : null,
            fv: tipo == 1 ? a.fv : null,

            is_lote_padre: tipo == 1 ? true : false,
            stock: tipo == 1 ? a.cantidad : null,
            lote_padre: tipo == 1 ? null : a.lote_padre,

            observacion: a.observacion,

            transaccion: nuevo.id,
            empresa,
            createdBy: colaborador
        }))

        await KardexRepo.createBulk(kardex_items, transaction)


        // ----- ACTUALIZAR CANTIDAD ENTREGADA ----- //
        if (socio_pedido) {
            for (const a of transaccion_items) {
                await SocioPedidoItemRepo.update(
                    { articulo: a.articulo, socio_pedido },
                    { entregado: sequelize.literal(`COALESCE(entregado, 0) + ${a.cantidad}`) },
                    transaction
                )
            }
        }

        // ----- SI ES UNA VENTA ----- //
        if (tipo == 5) {
            for (const a of transaccion_items) {
                await KardexRepo.update(
                    { id: a.lote_padre },
                    { stock: sequelize.literal(`COALESCE(stock, 0) - ${a.cantidad}`) },
                    transaction
                )
            }
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
            has_pedido, socio_pedido, socio, guia, factura,
            pago_condicion, moneda, tipo_cambio, monto,
            observacion, estado,
        } = req.body

        const updated = await repository.update(id, {
            tipo, fecha,
            has_pedido, socio_pedido, socio, guia, factura,
            pago_condicion, moneda, tipo_cambio, monto,
            observacion, estado,
            updatedBy: colaborador
        })

        if (updated == false) return

        res.json({ code: 0 })
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
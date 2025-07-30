import sequelize from '../../database/sequelize.js'
import { Transaccion, TransaccionItem } from '../../database/models/Transaccion.js'
import { Op } from 'sequelize'
import { Socio } from '../../database/models/Socio.js'
import { SocioPedido, SocioPedidoItem } from '../../database/models/SocioPedido.js'
import { Articulo } from '../../database/models/Articulo.js'
import { Maquina } from '../../database/models/Maquina.js'
import { Moneda } from '../../database/models/Moneda.js'
import { ProduccionOrden } from '../../database/models/ProduccionOrden.js'
import { CuarentenaProducto } from '../../database/models/CuarentenaProducto.js'
import { applyFilters, cleanFloat } from '../../utils/mine.js'
import cSistema from "../_sistema/cSistema.js"

const includes = {
    socio1: {
        model: Socio,
        as: 'socio1',
        attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos']
    },
    moneda1: {
        model: Moneda,
        as: 'moneda1',
        attributes: ['nombre']
    },
}

const create = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador } = req.user
        const {
            tipo, fecha,
            has_pedido, socio_pedido, socio, guia, factura,
            pago_condicion, moneda, tipo_cambio, monto,
            observacion, estado,
            transaccion_items
        } = req.body

        // ----- CREAR ----- //
        const nuevo = await Transaccion.create({
            tipo, fecha,
            has_pedido, socio_pedido, socio, guia, factura,
            pago_condicion, moneda, tipo_cambio, monto,
            observacion, estado,
            createdBy: colaborador
        }, { transaction })

        // ----- GUARDAR ITEMS ----- //
        const items = transaccion_items.map(a => ({
            tipo, fecha,
            ...a,
            is_lote_padre: tipo == 1 ? true : false,
            stock: tipo == 1 ? a.cantidad : tipo == 5 ? a.stock : null,
            transaccion: nuevo.id,
            createdBy: colaborador
        }))

        await TransaccionItem.bulkCreate(items, { transaction })

        // ----- ACTUALIZAR CANTIDAD ENTREGADA ----- //
        if (socio_pedido) {
            for (const a of transaccion_items) {
                await SocioPedidoItem.update(
                    {
                        entregado: sequelize.literal(`COALESCE(entregado, 0) + ${a.cantidad}`)
                    },
                    {
                        where: { articulo: a.articulo, socio_pedido },
                        transaction
                    }
                )
            }
        }

        // ----- SI ES UNA VENTA ----- //
        if (tipo == 5) {
            for (const a of transaccion_items) {
                await TransaccionItem.update(
                    {
                        stock: sequelize.literal(`COALESCE(stock, 0) - ${a.cantidad}`)
                    },
                    {
                        where: { id: a.lote_padre },
                        transaction
                    }
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
        const { factura } = req.body

        await Transaccion.update({ factura, updatedBy: colaborador }, { where: { id } })

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

async function loadOne(id) {
    let data = await Transaccion.findByPk(id, {
        include: [includes.socio1, includes.moneda1]
    })

    if (data) {
        data = data.toJSON()

        const pago_condicionesMap = cSistema.arrayMap('pago_condiciones')
        const transaccion_estadosMap = cSistema.arrayMap('transaccion_estados')

        data.pago_condicion1 = pago_condicionesMap[data.pago_condicion]
        data.estado1 = transaccion_estadosMap[data.estado]
    }

    return data
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id', 'estado', 'calidad_revisado_despacho'],
            order: [['createdAt', 'DESC']],
            where: {},
            include: []
        }

        if (qry) {
            if (qry.fltr) {
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }

            if (qry.cols) {
                findProps.attributes = findProps.attributes.concat(qry.cols)

                // ----- AGREAGAR LOS REF QUE SI ESTÁN EN LA BD ----- //
                if (qry.cols.includes('socio')) findProps.include.push(includes.socio1)
                if (qry.cols.includes('moneda')) findProps.include.push(includes.moneda1)
            }

            if (qry.incl) {
                for (const a of qry.incl) {
                    if (qry.incl.includes(a)) findProps.include.push(includes[a])
                }
            }
        }

        let data = await Transaccion.findAll(findProps)

        if (data.length > 0 && qry.cols) {
            data = data.map(a => a.toJSON())

            const pago_condicionesMap = cSistema.arrayMap('pago_condiciones')
            const transaccion_estadosMap = cSistema.arrayMap('transaccion_estados')

            for (const a of data) {
                if (qry.cols.includes('pago_condicion')) a.pago_condicion1 = pago_condicionesMap[a.pago_condicion]
                if (qry.cols.includes('estado')) a.estado1 = transaccion_estadosMap[a.estado]
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

        let data = await Transaccion.findByPk(id, {
            include: [
                {
                    model: TransaccionItem,
                    as: 'transaccion_items',
                    include: [
                        {
                            model: Articulo,
                            as: 'articulo1',
                            attributes: ['nombre', 'unidad', 'has_fv']
                        },
                        {
                            model: TransaccionItem,
                            as: 'lote_padre1',
                            attributes: ['id', 'lote', 'pu', 'moneda', 'fv'],
                        }
                    ]
                },
                {
                    model: Socio,
                    as: 'socio1',
                    attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos', 'contactos']
                },
                {
                    model: SocioPedido,
                    as: 'socio_pedido1',
                    attributes: ['id', 'codigo']
                },
                {
                    model: Moneda,
                    as: 'moneda1',
                    attributes: ['id', 'nombre', 'simbolo', 'estandar']
                },
            ]
        })

        if (data) {
            data = data.toJSON()

            for (const a of data.transaccion_items) {
                if (a.lote_padre) {
                    a.lotes = [{
                        id: a.lote_padre1.id,
                        lote_fv_stock: a.lote_padre1.lote + (a.lote_padre1.fv ? ` | ${a.lote_padre1.fv}` : '') + (` | ${a.stock}`)
                    }]
                }
            }
        }

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

        const transaccion_items = await TransaccionItem.findAll({
            where: { transaccion: id },
            attributes: ['id', 'lote_padre', 'cantidad'],
        })

        await TransaccionItem.destroy({
            where: { transaccion: id },
            transaction
        })

        await Transaccion.destroy({
            where: { id },
            transaction
        })

        if (estado != 0) {
            const postivos = cSistema.sistemaData.transaccion_tipos
                .filter(a => a.operacion == 1)
                .map(a => a.id)

            for (const a of transaccion_items) {
                const signo = postivos.includes(tipo.toString()) ? '-' : '+'
                await TransaccionItem.update(
                    {
                        stock: sequelize.literal(`COALESCE(stock, 0) ${signo} ${a.cantidad}`)
                    },
                    {
                        where: { id: a.lote_padre },
                        transaction
                    }
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

const anular = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador } = req.user
        const { id } = req.params
        const { anulado_motivo, item } = req.body

        const transaccion_itemsPast = await TransaccionItem.findAll({
            where: { transaccion: id },
        })

        const transaccionPast = await Transaccion.findByPk(id)

        await TransaccionItem.destroy({
            where: { transaccion: id },
            transaction
        })

        await Transaccion.destroy({
            where: { id },
            transaction
        })
        let transaccionData = transaccionPast.toJSON()

        if (item.tipo == 5) {
            for (const a of transaccion_itemsPast) {
                await TransaccionItem.update(
                    {
                        stock: sequelize.literal(`COALESCE(stock, 0) + ${a.cantidad}`)
                    },
                    {
                        where: { id: a.lote_padre },
                        transaction
                    }
                )
            }
        }

        if (transaccionData.socio_pedido) {
            for (const a of transaccion_itemsPast) {
                await SocioPedidoItem.update(
                    {
                        entregado: sequelize.literal(`COALESCE(entregado, 0) - ${a.cantidad}`)
                    },
                    {
                        where: { articulo: a.articulo, socio_pedido: transaccionData.socio_pedido },
                        transaction
                    }
                )
            }
        }

        // ----- GUARDAR EL ANULADO ----- //
        transaccionData.estado = 0
        transaccionData.anulado_motivo = anulado_motivo
        transaccionData.updatedBy = colaborador
        const transaccionNew = await Transaccion.create(transaccionData, { transaction })

        const itemsNew = transaccion_itemsPast.map(a => {
            const plain = a.toJSON()
            plain.transaccion = transaccionNew.id
            return plain
        })
        await TransaccionItem.bulkCreate(itemsNew, { transaction })

        await transaction.commit()

        res.json({ code: 0 })
    }
    catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}





const findKardex = async (req, res) => {
    try {
        const { id } = req.params

        const findProps = {
            attributes: ['id', 'cantidad', 'igv_afectacion', 'igv_porcentaje', 'pu', 'moneda', 'tipo_cambio', 'fv', 'lote', 'stock', 'is_lote_padre'],
            where: {
                articulo: id,
            },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Transaccion,
                    as: 'transaccion1',
                    attributes: ['id', 'fecha', 'tipo', 'estado'],
                },
                {
                    model: TransaccionItem,
                    as: 'lote_padre1',
                    attributes: ['pu', 'moneda', 'tipo_cambio', 'fv', 'lote', 'igv_afectacion', 'igv_porcentaje'],
                }
            ],
        }

        let data = await TransaccionItem.findAll(findProps)

        if (data.length > 0) {
            data = data.map(a => a.toJSON())

            const transaccion_tiposMap = cSistema.arrayMap('transaccion_tipos')

            for (const a of data) {
                a.transaccion1.tipo1 = transaccion_tiposMap[a.transaccion1.tipo]
                a.cantidad = a.cantidad * transaccion_tiposMap[a.transaccion1.tipo].operacion

                a.pu = a.is_lote_padre ? a.pu : a.lote_padre1.pu
                a.tipo_cambio = a.is_lote_padre ? a.tipo_cambio : a.lote_padre1.tipo_cambio
                a.igv_afectacion = a.is_lote_padre ? a.igv_afectacion : a.lote_padre1.igv_afectacion
                a.igv_porcentaje = a.is_lote_padre ? a.igv_porcentaje : a.lote_padre1.igv_porcentaje

                a.pu_real = a.tipo_cambio == null ? 'error' : cleanFloat(a.pu * a.tipo_cambio)
                if (a.igv_afectacion == '10') {
                    if (a.pu_real == 'error') {
                        a.pu_igv = a.pu_real
                    }
                    else {
                        a.pu_igv = cleanFloat(a.pu_real / (1 + (a.igv_porcentaje / 100)))
                    }
                }
                else {
                    a.pu_igv = a.pu_real
                }

                a.lote = a.is_lote_padre ? a.lote : a.lote_padre1.lote
                a.fv = a.is_lote_padre ? a.fv : a.lote_padre1.fv
            }
        }

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


///// ----- TRANSACCION ITEMS ----- /////
const findItems = async (req, res) => {
    try {
        const { id } = req.params
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id', 'articulo', 'cantidad', 'lote', 'fv', 'calidad_revisado'],
            order: [['createdAt', 'DESC']],
            where: {},
            include: [
                {
                    model: Transaccion,
                    as: 'transaccion1',
                    attributes: ['id', 'tipo', 'fecha', 'socio', 'guia', 'factura'],
                    where: {},
                    include: [
                        {
                            model: Socio,
                            as: 'socio1',
                            attributes: ['nombres', 'apellidos', 'nombres_apellidos']
                        }
                    ]
                },
                {
                    model: Articulo,
                    as: 'articulo1',
                    attributes: ['id', 'nombre', 'unidad']
                },
                {
                    model: TransaccionItem,
                    as: 'lote_padre1',
                    attributes: ['id', 'lote', 'pu', 'moneda', 'fv'],
                },
            ]
        }

        if (qry) {
            if (qry.fltr) {
                const fltr_transaccion = {}
                if (qry.fltr.transaccion_tipo) fltr_transaccion.tipo = qry.fltr.transaccion_tipo
                if (qry.fltr.transaccion_fecha) fltr_transaccion.fecha = qry.fltr.transaccion_fecha
                if (qry.fltr.transaccion_socio) fltr_transaccion.socio = qry.fltr.transaccion_socio
                if (qry.fltr.transaccion_guia) fltr_transaccion.guia = qry.fltr.transaccion_guia
                if (qry.fltr.transaccion_factura) fltr_transaccion.guia = qry.fltr.transaccion_factura
                if (qry.fltr.transaccion_produccion_orden) fltr_transaccion.produccion_orden = qry.fltr.transaccion_produccion_orden
                Object.assign(findProps.include[0].where, applyFilters(fltr_transaccion))

                delete qry.fltr.transaccion_tipo
                delete qry.fltr.transaccion_fecha
                delete qry.fltr.transaccion_socio
                delete qry.fltr.transaccion_guia
                delete qry.fltr.transaccion_factura
                delete qry.fltr.transaccion_produccion_orden
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }
        }

        let data = await TransaccionItem.findAll(findProps)

        if (data.length > 0) {
            data = data.map(a => a.toJSON())

            const transaccion_tiposMap = cSistema.arrayMap('transaccion_tipos')
            const estadosMap = cSistema.arrayMap('estados')

            for (const a of data) {
                a.cantidad = transaccion_tiposMap[a.transaccion1.tipo]?.operacion * a.cantidad
                a.calidad_revisado1 = estadosMap[a.calidad_revisado]
            }
        }

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


///// ----- AJUSTE STOCK ----- /////
const ajusteStock = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador } = req.user

        const {
            tipo, fecha,
            estado,
            transaccion_items
        } = req.body

        // ----- CREAR ----- //
        const nuevo = await Transaccion.create({
            tipo, fecha,
            estado,
            createdBy: colaborador
        }, { transaction })

        // ----- GUARDAR ITEMS ----- //
        const items = transaccion_items.map(a => ({
            tipo, fecha,
            ...a,
            transaccion: nuevo.id,
            createdBy: colaborador
        }))

        await TransaccionItem.bulkCreate(items, { transaction })

        // ----- ACTUALIZAR STOCK ----- //
        for (const a of transaccion_items) {
            await TransaccionItem.update(
                {
                    stock: sequelize.literal(`COALESCE(stock, 0) ${tipo == 7 ? '-' : '+'} ${a.cantidad}`)
                },
                {
                    where: { id: a.lote_padre },
                    transaction
                }
            )
        }

        await transaction.commit()

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    create,
    update,
    find,
    findById,
    delet,
    anular,

    findKardex,

    findItems,

    ajusteStock,
}
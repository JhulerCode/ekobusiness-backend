import { Repository } from '#db/Repository.js'
import sequelize from '#db/sequelize.js'
import cSistema from "../_sistema/cSistema.js"

import config from '../../config.js'
import { nodeMailer } from "#mail/nodeMailer.js"
import { htmlConfirmacionCompra } from '#infrastructure/mail/templates.js'
import dayjs from '#shared/dayjs.js'

const repository = new Repository('SocioPedido')
const SocioPedidoItemRepo = new Repository('SocioPedidoItem')
const ArticuloRepo = new Repository('Articulo')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const data = await repository.find(qry, true)

        if (data.length > 0) {
            const pedido_estadosMap = cSistema.arrayMap('pedido_estados')
            const estadoMap = cSistema.arrayMap('estados')
            const entrega_tiposMap = cSistema.arrayMap('entrega_tipos')
            const pago_condicionesMap = cSistema.arrayMap('pago_condiciones')
            const pago_metodosMap = cSistema.arrayMap('pago_metodos')

            for (const a of data) {
                if (qry?.cols?.includes('estado')) a.estado1 = pedido_estadosMap[a.estado]
                if (qry?.cols?.includes('pagado')) a.pagado1 = estadoMap[a.pagado]
                if (qry?.cols?.includes('listo')) a.listo1 = estadoMap[a.listo]
                if (qry?.cols?.includes('entregado')) a.entregado1 = estadoMap[a.entregado]

                if (qry?.cols?.includes('entrega_tipo')) a.entrega_tipo1 = entrega_tiposMap[a.entrega_tipo]

                if (qry?.cols?.includes('pago_condicion')) a.pago_condicion1 = pago_condicionesMap[a.pago_condicion]
                if (qry?.cols?.includes('pago_metodo')) a.pago_metodo1 = pago_metodosMap[a.pago_metodo]
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
            const pedido_estadosMap = cSistema.arrayMap('pedido_estados')
            const estadoMap = cSistema.arrayMap('estados')
            const entrega_tiposMap = cSistema.arrayMap('entrega_tipos')
            const pago_condicionesMap = cSistema.arrayMap('pago_condiciones')
            const pago_metodosMap = cSistema.arrayMap('pago_metodos')
            const comprobante_tiposMap = cSistema.arrayMap('comprobante_tipos')
            const documentos_identidadMap = cSistema.arrayMap('documentos_identidad')

            data.entrega_tipo1 = entrega_tiposMap[data.entrega_tipo]

            data.pago_condicion1 = pago_condicionesMap[data.pago_condicion]
            data.pagado1 = estadoMap[data.pagado]
            data.pago_metodo1 = pago_metodosMap[data.pago_metodo]
            data.comprobante_tipo1 = comprobante_tiposMap[data.comprobante_tipo]

            data.estado1 = pedido_estadosMap[data.estado]

            if (data.socio_datos.doc_tipo) {
                data.socio_datos.doc_tipo1 = documentos_identidadMap[data.socio_datos.doc_tipo]
            }

            if (data.socio_pedido_items) data.socio_pedido_items.sort((a, b) => a.orden - b.orden)
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
        const {
            tipo, origin, fecha, codigo,
            socio, socio_datos, contacto, contacto_datos,
            moneda, tipo_cambio, monto,
            entrega_tipo, fecha_entrega, entrega_ubigeo, direccion_entrega, entrega_direccion_datos, entrega_costo,
            pago_condicion, pago_metodo, pago_id,
            comprobante_tipo, comprobante_ruc, comprobante_razon_social,
            observacion, estado,
            empresa_datos,
            socio_pedido_items,
        } = req.body

        if (req.user) {
            var { colaborador, empresa } = req.user
        }
        // const colaborador = origin != 'ecommerce' ? req.user.colaborador : undefined
        const etapas = [{ id: 1, fecha: dayjs() }]

        // ----- GUARDAR ----- //
        const nuevo = await repository.create({
            tipo, origin, fecha, codigo,
            socio, socio_datos, contacto, contacto_datos,
            moneda, tipo_cambio, monto,
            entrega_tipo, fecha_entrega, entrega_ubigeo, direccion_entrega, entrega_direccion_datos, entrega_costo,
            pago_condicion, pago_metodo, pago_id,
            comprobante_tipo, comprobante_ruc, comprobante_razon_social,
            observacion, estado, etapas,
            empresa_datos,
            empresa,
            createdBy: colaborador
        }, transaction)

        // ----- GUARDAR ITEMS ----- //
        const items = socio_pedido_items.map((a, i) => ({
            ...a,
            orden: i,
            socio_pedido: nuevo.id,
            empresa,
            createdBy: colaborador
        }))
        await SocioPedidoItemRepo.createBulk(items, transaction)

        await transaction.commit()

        // ----- ENVIAR CORREO ----- //
        let send_email_err = null
        if (origin == 'ecommerce') {
            // console.log('Enviando correo')
            const entrega_tipo1 = cSistema.sistemaData.entrega_tipos.find(a => a.id == entrega_tipo).nombre
            const html = htmlConfirmacionCompra(
                socio_datos.nombres, socio_datos.apellidos,
                codigo, entrega_tipo1, monto,
                socio_pedido_items
            )
            const nodemailer = nodeMailer()
            const result = await nodemailer.sendMail({
                from: `${cSistema.sistemaData.empresa.nombre_comercial} <${config.SOPORTE_EMAIL}>`,
                to: socio_datos.correo,
                subject: `Confirmación de compra - Código ${codigo}`,
                html
            })
            // console.log(result)
            if (result.error) send_email_err = result.error
        }

        // ----- DEVOLVER ----- //
        const data = await loadOne(nuevo.id)
        res.json({ code: 0, data, send_email_err })
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
            tipo, origin, fecha, codigo,
            socio, socio_datos, contacto, contacto_datos,
            moneda, tipo_cambio, monto,
            pago_condicion, pago_metodo, pago_id,
            entrega_tipo, fecha_entrega, entrega_ubigeo, direccion_entrega, entrega_direccion_datos, entrega_costo,
            comprobante_tipo, comprobante_ruc, comprobante_razon_social,
            observacion, estado,
            empresa_datos,
            socio_pedido_items,
        } = req.body

        //--- ACTUALIZAR ---//
        const updated = await repository.update({ id }, {
            tipo, origin, fecha, codigo,
            socio, socio_datos, contacto, contacto_datos,
            moneda, tipo_cambio, monto,
            pago_condicion, pago_metodo, pago_id,
            entrega_tipo, fecha_entrega, entrega_ubigeo, direccion_entrega, entrega_direccion_datos, entrega_costo,
            comprobante_tipo, comprobante_ruc, comprobante_razon_social,
            observacion, estado,
            empresa_datos,
            updatedBy: colaborador
        })


        // // ----- OBTENER ITEMS QUE ESTABAN ----- //
        // const socio_pedido_items_past = await SocioPedidoItem.findAll({
        //     where: { socio_pedido: id }
        // })

        // // ----- ELIMINAR ITEMS QUE YA NO ESTÁN ----- //
        // const idsItemsNew = socio_pedido_items.map(a => a.articulo)

        // const idsItemsGone = socio_pedido_items_past
        //     .filter(a => !idsItemsNew.includes(a.articulo))
        //     .map(a => a.articulo)

        // if (idsItemsGone.length > 0) {
        //     await SocioPedidoItem.destroy({
        //         where: {
        //             socio_pedido: id,
        //             articulo: { [Op.in]: idsItemsGone },
        //         },
        //         transaction
        //     })
        // }

        // const agregarItems = []

        // for (const a of socio_pedido_items) {
        //     const i = socio_pedido_items_past.findIndex(b => b.articulo == a.articulo)

        //     if (i === -1) {
        //         // ----- CREAR ARRAY DE ITEMS NUEVOS ----- //
        //         agregarItems.push({
        //             articulo: a.articulo,
        //             nombre: a.nombre,
        //             unidad: a.unidad,
        //             has_fv: a.has_fv,

        //             cantidad: a.cantidad,

        //             pu: a.pu,
        //             igv_afectacion: a.igv_afectacion,
        //             igv_porcentaje: a.igv_porcentaje,

        //             nota: a.nota,
        //             socio_pedido: id,
        //         })
        //     }
        //     else {
        //         // ----- ACTUALIZAR ITEMS QUE ESTABAN ----- //
        //         await SocioPedidoItem.update(
        //             {
        //                 nombre: a.nombre,
        //                 unidad: a.unidad,
        //                 has_fv: a.has_fv,

        //                 cantidad: a.cantidad,

        //                 pu: a.pu,

        //                 nota: a.nota,
        //             },
        //             {
        //                 where: { id: a.id },
        //                 transaction
        //             }
        //         )
        //     }
        // }

        // // ----- CREAR ITEMS NUEVOS ----- //
        // if (agregarItems.length > 0) {
        //     await SocioPedidoItem.bulkCreate(agregarItems, { transaction })
        // }

        // ----- DEVOLVER ----- //
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

        await SocioPedidoItemRepo.delete({ socio_pedido: id }, transaction)

        await repository.delete({ id }, transaction)

        await transaction.commit()

        res.json({ code: 0 })
    }
    catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


const confirmarPago = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params

        const ped = await repository.find({ id }, true)
        const etapas = ped.etapas
        etapas.push({ id: 2, fecha: dayjs() })

        const updated = await repository.update({ id }, {
            pagado: true,
            etapas,
            updatedBy: colaborador
        })

        if (updated == false) return

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const confirmarListo = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params

        const ped = await repository.find({ id }, true)
        const etapas = ped.etapas
        etapas.push({ id: 3, fecha: dayjs() })

        const updated = await repository.update({ id }, {
            listo: true,
            etapas,
            updatedBy: colaborador
        })

        if (updated == false) return

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const confirmarEntrega = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params

        const ped = await repository.find({ id }, true)
        const etapas = ped.etapas
        etapas.push({ id: 4, fecha: dayjs() })

        const updated = await repository.update({ id }, {
            entregado: true,
            etapas,
            estado: 2,
            updatedBy: colaborador
        })

        if (updated == false) return

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const terminar = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params

        const updated = await repository.update({ id }, {
            estado: 2,
            updatedBy: colaborador
        })

        if (updated == false) return

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findPendientes = async (req, res) => {
    try {
        const { empresa } = req.user
        const { socio, produccion_tipo } = req.query

        const qry = {
            fltr: {
                'socio_pedido1.tipo': { op: 'Es', val: 2 },
                'socio_pedido1.estado': { op: 'Es', val: 1 },
                'socio_pedido1.empresa': { op: 'Es', val: empresa },
            },
            cols: ['articulo', 'cantidad', 'entregado'],
            incl: ['socio_pedido1', 'articulo1'],
            iccl: {
                articulo1: {
                    cols: ['combo_articulos']
                },
            }
        }

        if (socio && socio !== 'null') qry.fltr['socio_pedido1.socio'] = { op: 'Es', val: socio }
        if (produccion_tipo && produccion_tipo !== 'null') qry.fltr['articulo1.produccion_tipo'] = { op: 'Es', val: produccion_tipo }

        const pedidos = await SocioPedidoItemRepo.find(qry, true)

        const productosMap = {}

        if (pedidos.length > 0) {
            const productos_pedidos_ids = []
            for (const a of pedidos) {
                if (a.articulo1.combo_articulos.length > 0) {
                    for (const b of a.articulo1.combo_articulos) {
                        productos_pedidos_ids.push(b.articulo)
                    }
                } else {
                    productos_pedidos_ids.push(a.articulo)
                }
            }

            const qry1 = {
                fltr: {
                    id: { op: 'Es', val: [...new Set(productos_pedidos_ids)] },
                },
                cols: ['id', 'nombre'],
                sqls: ['articulo_stock'],
            }
            const productosStock = await ArticuloRepo.find(qry1, true)
            const productosStockMap = productosStock.reduce((obj, a) => (obj[a.id] = a, obj), {})

            for (const a of pedidos) {
                if (a.articulo1.combo_articulos.length > 0) {
                    for (const b of a.articulo1.combo_articulos) {
                        if (!productosMap[b.articulo]) {
                            productosMap[b.articulo] = {
                                articulo: b.articulo,
                                nombre: productosStockMap[b.articulo].nombre,
                                stock: productosStockMap[b.articulo].stock,
                                cantidad: 0,
                                entregado: 0,
                                pendiente: 0,
                            }
                        }

                        productosMap[b.articulo].cantidad += (a.cantidad * b.cantidad)
                        productosMap[b.articulo].entregado += (a.entregado * b.cantidad)
                        productosMap[b.articulo].pendiente += ((a.cantidad - a.entregado) * b.cantidad)
                    }
                } else {
                    if (!productosMap[a.articulo]) {
                        productosMap[a.articulo] = {
                            articulo: a.articulo,
                            nombre: productosStockMap[a.articulo].nombre,
                            stock: productosStockMap[a.articulo].stock,
                            cantidad: 0,
                            entregado: 0,
                            pendiente: 0,
                        }
                    }

                    productosMap[a.articulo].cantidad += a.cantidad
                    productosMap[a.articulo].entregado += a.entregado
                    productosMap[a.articulo].pendiente += (a.cantidad - a.entregado)
                }
            }
        }

        res.json({ code: 0, data: Object.values(productosMap).sort((a, b) => a.nombre.localeCompare(b.nombre)) })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


//--- Helpers ---//
async function loadOne(id) {
    const data = await repository.find({ id, incl: ['socio1', 'moneda1', 'createdBy1'] }, true)

    if (data) {
        const pedido_estadosMap = cSistema.arrayMap('pedido_estados')
        const estadoMap = cSistema.arrayMap('estados')
        const entrega_tiposMap = cSistema.arrayMap('entrega_tipos')
        const pago_condicionesMap = cSistema.arrayMap('pago_condiciones')
        const pago_metodosMap = cSistema.arrayMap('pago_metodos')

        data.estado1 = pedido_estadosMap[data.estado]
        data.pagado1 = estadoMap[data.pagado]
        data.listo1 = estadoMap[data.listo]
        data.entregado1 = estadoMap[data.entregado]

        data.entrega_tipo1 = entrega_tiposMap[data.entrega_tipo]

        data.pago_condicion1 = pago_condicionesMap[data.pago_condicion]
        data.pago_metodo1 = pago_metodosMap[data.pago_metodo]
    }

    return data
}

export default {
    find,
    findById,
    create,
    update,
    delet,

    confirmarPago,
    confirmarListo,
    confirmarEntrega,
    terminar,

    findPendientes,
}
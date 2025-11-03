import { Op, Sequelize } from 'sequelize'
import sequelize from '../../database/sequelize.js'
import { SocioPedido, SocioPedidoItem } from '../../database/models/SocioPedido.js'
import { Socio } from '../../database/models/Socio.js'
import { Moneda } from '../../database/models/Moneda.js'
import { Colaborador } from '../../database/models/Colaborador.js'
import { Articulo } from '../../database/models/Articulo.js'
import { Transaccion } from '../../database/models/Transaccion.js'
import { applyFilters } from '../../utils/mine.js'
import cSistema from "../_sistema/cSistema.js"
import { PrecioLista } from '../../database/models/PrecioLista.js'

const includes = {
    socio1: {
        model: Socio,
        as: 'socio1',
        attributes: ['nombres']
    },
    moneda1: {
        model: Moneda,
        as: 'moneda1',
        attributes: ['nombre', 'simbolo']
    },
    socio_pedido_items: {
        model: SocioPedidoItem,
        as: 'socio_pedido_items',
        include: {
            model: Articulo,
            as: 'articulo1',
            attributes: ['nombre', 'unidad', 'fotos']
        }
    },
    createdBy1: {
        model: Colaborador,
        as: 'createdBy1',
        attributes: ['nombres', 'apellidos', 'nombres_apellidos']
    }
}

const create = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const {
            tipo, origin, fecha, codigo,
            socio, socio_datos, contacto, contacto_datos,
            pago_condicion, moneda, tipo_cambio, monto,
            entrega_tipo, fecha_entrega, entrega_ubigeo, direccion_entrega, entrega_direccion_datos,
            comprobante_tipo, comprobante_ruc, comprobante_razon_social,
            pago_metodo, pago_id,
            observacion, estado, pagado,
            empresa_datos,
            socio_pedido_items,
        } = req.body

        if (origin != 'ecommerce') {
            var { colaborador } = req.user
        }

        // ----- GUARDAR ----- //
        const nuevo = await SocioPedido.create({
            tipo, origin, fecha, codigo,
            socio, socio_datos, contacto, contacto_datos,
            pago_condicion, moneda, tipo_cambio, monto,
            entrega_tipo, fecha_entrega, entrega_ubigeo, direccion_entrega, entrega_direccion_datos,
            comprobante_tipo, comprobante_ruc, comprobante_razon_social,
            pago_metodo, pago_id,
            observacion, estado, pagado,
            empresa_datos,
            createdBy: colaborador
        }, { transaction })

        // ----- GUARDAR ITEMS ----- //
        const items = socio_pedido_items.map(a => ({ ...a, socio_pedido: nuevo.id, }))

        await SocioPedidoItem.bulkCreate(items, { transaction })

        await transaction.commit()

        // ----- ENVIAR CORREO ----- //
        let send_email_err = null
        if (origin == 'ecommerce') {
            try {
                const entrega_tipo1 = cSistema.sistemaData.entrega_tipos.find(a => a.id == entrega_tipo).nombre
                const html = htmlConfirmacionCompra(
                    socio_datos.nombres, socio_datos.apellidos,
                    codigo, entrega_tipo1, monto,
                    socio_pedido_items
                )
    
                const nodemailer = nodeMailer()
                const result = await nodemailer.sendMail({
                    from: `${companyName} <${config.SOPORTE_EMAIL}>`,
                    to: socio_datos.correo,
                    subject: `Confirmación de compra - Código ${codigo}`,
                    html
                })
            } catch (error) {
                send_email_err = error
            }
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
    const transaction = await sequelize.transaction()

    try {
        const { colaborador } = req.user
        const { id } = req.params
        const {
            tipo, fecha, fecha_entrega, codigo,
            socio, socio_datos, contacto, contacto_datos,
            pago_condicion, monto, moneda, tipo_cambio, direccion_entrega,
            observacion, estado, pagado,
            empresa_datos,
            socio_pedido_items,
        } = req.body

        // ----- ACTUALIZAR ----- //
        const [affectedRows] = await SocioPedido.update({
            tipo, fecha, fecha_entrega, codigo,
            socio, socio_datos, contacto, contacto_datos,
            pago_condicion, monto, moneda, tipo_cambio, direccion_entrega,
            observacion, estado, pagado,
            empresa_datos,
            updatedBy: colaborador
        }, {
            where: { id },
            transaction
        })

        if (affectedRows > 0) {
            // ----- OBTENER ITEMS QUE ESTABAN ----- //
            const socio_pedido_items_past = await SocioPedidoItem.findAll({
                where: { socio_pedido: id }
            })

            // ----- ELIMINAR ITEMS QUE YA NO ESTÁN ----- //
            const idsItemsNew = socio_pedido_items.map(a => a.articulo)

            const idsItemsGone = socio_pedido_items_past
                .filter(a => !idsItemsNew.includes(a.articulo))
                .map(a => a.articulo)

            if (idsItemsGone.length > 0) {
                await SocioPedidoItem.destroy({
                    where: {
                        socio_pedido: id,
                        articulo: { [Op.in]: idsItemsGone },
                    },
                    transaction
                })
            }

            const agregarItems = []

            for (const a of socio_pedido_items) {
                const i = socio_pedido_items_past.findIndex(b => b.articulo == a.articulo)

                if (i === -1) {
                    // ----- CREAR ARRAY DE ITEMS NUEVOS ----- //
                    agregarItems.push({
                        articulo: a.articulo,
                        nombre: a.nombre,
                        unidad: a.unidad,
                        has_fv: a.has_fv,

                        cantidad: a.cantidad,

                        pu: a.pu,
                        igv_afectacion: a.igv_afectacion,
                        igv_porcentaje: a.igv_porcentaje,

                        nota: a.nota,
                        socio_pedido: id,
                    })
                }
                else {
                    // ----- ACTUALIZAR ITEMS QUE ESTABAN ----- //
                    await SocioPedidoItem.update(
                        {
                            nombre: a.nombre,
                            unidad: a.unidad,
                            has_fv: a.has_fv,

                            cantidad: a.cantidad,

                            pu: a.pu,

                            nota: a.nota,
                        },
                        {
                            where: { id: a.id },
                            transaction
                        }
                    )
                }
            }

            // ----- CREAR ITEMS NUEVOS ----- //
            if (agregarItems.length > 0) {
                await SocioPedidoItem.bulkCreate(agregarItems, { transaction })
            }

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
    let data = await SocioPedido.findByPk(id, {
        include: [includes.socio1, includes.moneda1]
    })

    if (data) {
        data = data.toJSON()

        const pago_condicionesMap = cSistema.arrayMap('pago_condiciones')
        const pedido_estadosMap = cSistema.arrayMap('pedido_estados')
        const estadoMap = cSistema.arrayMap('estados')

        data.pago_condicion1 = pago_condicionesMap[data.pago_condicion]
        data.estado1 = pedido_estadosMap[data.estado]
        data.pagado1 = estadoMap[data.pagado]
    }

    return data
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id'],
            order: [['fecha', 'DESC']],
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
                if (qry.cols.includes('createdBy')) findProps.include.push(includes.createdBy1)
            }

            if (qry.incl) {
                for (const a of qry.incl) {
                    if (qry.incl.includes(a)) findProps.include.push(includes[a])
                }
            }
        }

        let data = await SocioPedido.findAll(findProps)

        if (data.length > 0 && qry.cols) {
            data = data.map(a => a.toJSON())

            const pago_condicionesMap = cSistema.arrayMap('pago_condiciones')
            const pedido_estadosMap = cSistema.arrayMap('pedido_estados')
            const estadoMap = cSistema.arrayMap('estados')

            for (const a of data) {
                if (qry.cols.includes('pago_condicion')) a.pago_condicion1 = pago_condicionesMap[a.pago_condicion]
                if (qry.cols.includes('estado')) a.estado1 = pedido_estadosMap[a.estado]
                if (qry.cols.includes('pagado')) a.pagado1 = estadoMap[a.pagado]
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

        let data = await SocioPedido.findByPk(id, {
            include: [
                {
                    model: SocioPedidoItem,
                    as: 'socio_pedido_items',
                    include: {
                        model: Articulo,
                        as: 'articulo1',
                        attributes: ['nombre', 'unidad', 'has_fv', 'fotos']
                    }
                },
                {
                    model: Socio,
                    as: 'socio1',
                    attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos', 'doc_numero', 'contactos', 'direcciones', 'precio_lista'],
                    include: {
                        model: PrecioLista,
                        as: 'precio_lista1',
                        attributes: ['id', 'moneda']
                    }
                },
                {
                    model: Moneda,
                    as: 'moneda1',
                    attributes: ['id', 'nombre', 'simbolo']
                },
                {
                    model: Colaborador,
                    as: 'createdBy1',
                    attributes: ['nombres', 'apellidos', 'nombres_apellidos', 'telefono', 'cargo']
                }
            ]
        })

        if (data) {
            data = data.toJSON()

            const pago_condicionesMap = cSistema.arrayMap('pago_condiciones')
            const pedido_estadosMap = cSistema.arrayMap('pedido_estados')
            const estadoMap = cSistema.arrayMap('estados')

            data.pago_condicion1 = pago_condicionesMap[data.pago_condicion]
            data.estado1 = pedido_estadosMap[data.estado]
            data.pagado1 = estadoMap[data.pagado]
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

        // ----- ELIMINAR ----- //
        await SocioPedidoItem.destroy({
            where: { socio_pedido: id },
            transaction
        })

        await SocioPedido.destroy({
            where: { id },
            transaction
        })

        await transaction.commit()

        res.json({ code: 0 })
    }
    catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const anular = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params
        const { anulado_motivo } = req.body

        // ----- VERIFY SI YA TIENE TRANSACCIONES ----- //
        const hasTransacciones = await Transaccion.findAll({
            where: { socio_pedido: id }
        })

        if (hasTransacciones.length > 0) {
            res.json({ code: 1, msg: 'Imposible anular, el pedido ya tiene transacciones' })
            return
        }

        // ----- ANULAR ----- //
        await SocioPedido.update(
            {
                estado: 0,
                anulado_motivo,
                updatedBy: colaborador
            },
            { where: { id } }
        )

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

        // ----- ANULAR ----- //
        await SocioPedido.update(
            {
                estado: 2,
                updatedBy: colaborador
            },
            { where: { id } }
        )

        const data = await loadOne(id)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findDetail = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['articulo', 'cantidad', 'entregado'],
            where: {
                entregado: {
                    [Op.lt]: sequelize.col('cantidad')
                }
            },
            include: [
                {
                    model: SocioPedido,
                    as: 'socio_pedido1',
                    attributes: ['id'],
                    where: {
                        tipo: 2,
                        estado: 1
                    }
                },
                {
                    model: Articulo,
                    as: 'articulo1',
                    attributes: ['combo_articulos'],
                    where: {},
                },
            ]
        }

        if (qry) {
            if (qry.socio) {
                findProps.include[0].where.socio = qry.socio
            }
        }

        let socioPedidoItems = await SocioPedidoItem.findAll(findProps)

        if (socioPedidoItems.length == 0) {
            res.json({ code: 0, data: [] })
        }
        else {
            const groupedItems = socioPedidoItems.reduce((acc, orderItem) => {
                const articulo1Instance = orderItem.articulo1
                const comboArticulos = articulo1Instance ? articulo1Instance.combo_articulos : null

                if (articulo1Instance && comboArticulos && comboArticulos.length > 0) {
                    comboArticulos.forEach(comboComponent => {
                        const componentId = comboComponent.articulo
                        const neededQuantityForComponent = orderItem.cantidad * comboComponent.cantidad
                        const deliveredQuantityForComponent = orderItem.entregado * comboComponent.cantidad

                        let existingComponent = acc.find(item => item.articulo === componentId)

                        if (existingComponent) {
                            existingComponent.cantidad += neededQuantityForComponent
                            existingComponent.entregado += deliveredQuantityForComponent
                        }
                        else {
                            acc.push({
                                articulo: componentId,
                                cantidad: neededQuantityForComponent,
                                entregado: deliveredQuantityForComponent,
                            })
                        }
                    })
                } else {
                    const existingArticle = acc.find(a => a.articulo === orderItem.articulo)

                    if (existingArticle) {
                        existingArticle.cantidad += orderItem.cantidad;
                        existingArticle.entregado += orderItem.entregado;
                    } else {
                        acc.push({
                            articulo: orderItem.articulo,
                            cantidad: orderItem.cantidad,
                            entregado: orderItem.entregado,
                        });
                    }
                }
                return acc
            }, [])

            if (groupedItems.length === 0) {
                res.json({ code: 0, data: [], msg: 'Ningún agrupado' });
                return;
            }

            const sqlStock = [Sequelize.literal(`(
                SELECT COALESCE(SUM(t.stock), 0)
                FROM transaccion_items AS t
                WHERE t.articulo = articulos.id AND t.is_lote_padre = TRUE
            )`), 'stock']

            const findProps1 = {
                where: {
                    id: {
                        [Op.in]: groupedItems.map(a => a.articulo)
                    },
                },
                attributes: ['id', 'nombre', 'produccion_tipo', sqlStock]
            }

            if (qry) {
                if (qry.produccion_tipo) {
                    findProps1.where.produccion_tipo = qry.produccion_tipo
                }
            }

            const articulosConStock = await Articulo.findAll(findProps1)

            const groupedItemsMap = groupedItems.reduce((map, item) => {
                map[item.articulo] = { cantidad: item.cantidad, entregado: item.entregado }
                return map
            }, {})

            const finalResult = articulosConStock.map(articuloInfo => {
                const orderData = groupedItemsMap[articuloInfo.id]

                const cantidad = orderData ? orderData.cantidad : 0;
                const entregado = orderData ? orderData.entregado : 0;

                return {
                    articulo: articuloInfo.id,
                    nombre: articuloInfo.nombre,
                    produccion_tipo: articuloInfo.produccion_tipo,
                    stock: articuloInfo.get('stock'),
                    cantidad: cantidad,
                    entregado: entregado
                };
            });

            res.json({ code: 0, data: finalResult })
        }
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    find,
    findById,
    create,
    delet,
    update,
    anular,
    terminar,
    findDetail,
}
import { Repository } from '#db/Repository.js'
import sequelize from '#db/sequelize.js'
import { sistemaData } from '#store/system.js'
import { arrayMap } from '#store/system.js'
import { resUpdateFalse } from '#http/helpers.js'
import config from '../../config.js'
import { nodeMailer } from '#mail/nodeMailer.js'
import { htmlConfirmacionCompra } from '#infrastructure/mail/templates.js'
import dayjs, { formatDate } from '#shared/dayjs.js'

const repository = new Repository('SocioPedido')
const SocioPedidoItemRepo = new Repository('SocioPedidoItem')
const ArticuloRepo = new Repository('Articulo')
const MrpBomSocioRepo = new Repository('MrpBomSocio')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const virtuals = [
            'estado',
            'pagado',
            'listo',
            'entregado',
            'entrega_tipo',
            'pago_condicion',
            'pago_metodo',
            'comprobante_tipo',
            'fecha',
            'fecha_entrega',
        ]

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
            const documentos_identidadMap = arrayMap('documentos_identidad')

            if (data.socio_pedido_items) data.socio_pedido_items.sort((a, b) => a.orden - b.orden)
        }

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { nombre_comercial } = req.empresa
        const { empresa } = req.user
        const body = req.body

        let colaborador,
            is_maquila = false

        if (body.origin == 'ecommerce') {
            if (!body.socio) body.socio = req.user.id
        } else {
            colaborador = req.user.colaborador

            //--- PARA MAQUILA ---//
            const qry = {
                fltr: {
                    socio: { op: 'Es', val: body.socio },
                    'mrp_bom1.articulo': {
                        op: 'Es',
                        val: socio_pedido_items.map((a) => a.articulo),
                    },
                },
                incl: ['mrp_bom1'],
            }
            const mrp_bom_socios = await MrpBomSocioRepo.find(qry, true)
            if (mrp_bom_socios.length > 0) is_maquila = true
        }

        const etapas = [{ id: 1, fecha: dayjs() }]

        // ----- GUARDAR ----- //
        const nuevo = await repository.create(
            {
                ...body,
                empresa,
                createdBy: colaborador,
            },
            transaction,
        )

        // ----- GUARDAR ITEMS ----- //
        const socio_pedido_items = body.socio_pedido_items.map((a, i) => ({
            ...a,
            socio_pedido: nuevo.id,
            empresa,
            createdBy: colaborador,
        }))
        await SocioPedidoItemRepo.createBulk(socio_pedido_items, transaction)

        await transaction.commit()

        // ----- ENVIAR CORREO ----- //
        let send_email_err = null
        if (origin == 'ecommerce') {
            // console.log('Enviando correo')
            const entrega_tipo1 = sistemaData.entrega_tipos.find((a) => a.id == entrega_tipo).nombre
            const html = htmlConfirmacionCompra(
                socio_datos.nombres,
                socio_datos.apellidos,
                codigo,
                entrega_tipo1,
                monto,
                socio_pedido_items,
            )
            const nodemailer = nodeMailer()
            const result = await nodemailer.sendMail({
                from: `${nombre_comercial} <${config.SOPORTE_EMAIL}>`,
                to: socio_datos.correo,
                subject: `Confirmación de compra - Código ${codigo}`,
                html,
            })
            // console.log(result)
            if (result.error) send_email_err = result.error
        }

        // ----- DEVOLVER ----- //
        const data = await loadOne(nuevo.id)
        res.json({ code: 0, data, send_email_err })
    } catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador, empresa } = req.user
        const { id } = req.params
        const body = req.body

        // Obtener el artículo actual
        const currentRecord = await repository.find({ id }, true)
        if (!currentRecord) {
            await transaction.rollback()
            return res.status(404).json({ code: -1, msg: 'Artículo no encontrado' })
        }

        // Detectar columnas modificadas
        const diff = repository.getDiff(currentRecord, body)
        if (diff) {
            diff.updatedBy = colaborador
            await repository.update({ id }, diff, transaction)
        }

        // Actualizar Relaciones (Items)
        if (body.socio_pedido_items) {
            await repository.syncHasMany(
                {
                    model: 'SocioPedidoItem',
                    foreignKey: 'socio_pedido',
                    parentId: id,
                    newData: body.socio_pedido_items,
                    empresa,
                    colaborador,
                },
                transaction,
            )
        }

        await transaction.commit()

        // const data = await loadOne(id)
        res.json({ code: 0 })
    } catch (error) {
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
    } catch (error) {
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

        const updated = await repository.update(
            { id },
            {
                pagado: true,
                etapas,
                updatedBy: colaborador,
            },
        )

        if (updated == false) return resUpdateFalse(res)

        const estados = arrayMap('estados')
        const data = {
            id,
            pagado: true,
            pagado1: estados[true],
            etapas,
        }

        res.json({ code: 0, data })
    } catch (error) {
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

        const updated = await repository.update(
            { id },
            {
                listo: true,
                etapas,
                updatedBy: colaborador,
            },
        )

        if (updated == false) return resUpdateFalse(res)

        const estados = arrayMap('estados')
        const data = {
            id,
            listo: true,
            listo1: estados[true],
            etapas,
        }

        res.json({ code: 0, data })
    } catch (error) {
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

        const updated = await repository.update(
            { id },
            {
                entregado: true,
                etapas,
                estado: 2,
                updatedBy: colaborador,
            },
        )

        if (updated == false) return resUpdateFalse(res)

        const estados = arrayMap('estados')
        const data = {
            id,
            entregado: true,
            entregado1: estados[true],
            etapas,
            estado: 2,
            estado1: estados[2],
        }

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const abrirCerrar = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { ids, estado } = req.body

        const updated = await repository.update(
            { id: ids },
            {
                estado,
                updatedBy: colaborador,
            },
        )

        if (updated == false) return resUpdateFalse(res)

        const estados = arrayMap('pedido_estados')
        const data = {
            id: ids,
            estado,
            estado1: estados[estado],
        }

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findPendientes = async (req, res) => {
    try {
        const { empresa } = req.user
        const { socio, linea } = req.query

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
                    cols: ['combo_articulos'],
                },
            },
        }

        if (socio && socio !== 'null') qry.fltr['socio_pedido1.socio'] = { op: 'Es', val: socio }
        if (linea && linea !== 'null') qry.fltr['articulo1.linea'] = { op: 'Es', val: linea }

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
            const productosStockMap = productosStock.reduce((obj, a) => ((obj[a.id] = a), obj), {})

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

                        productosMap[b.articulo].cantidad += a.cantidad * b.cantidad
                        productosMap[b.articulo].entregado += a.entregado * b.cantidad
                        productosMap[b.articulo].pendiente +=
                            (a.cantidad - a.entregado) * b.cantidad
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
                    productosMap[a.articulo].pendiente += a.cantidad - a.entregado
                }
            }
        }

        res.json({
            code: 0,
            data: Object.values(productosMap).sort((a, b) => a.nombre.localeCompare(b.nombre)),
        })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

//--- Helpers ---//
async function loadOne(id) {
    const data = await repository.find({ id, incl: ['socio1', 'moneda1', 'createdBy1'] }, true)

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
    abrirCerrar,

    findPendientes,
}

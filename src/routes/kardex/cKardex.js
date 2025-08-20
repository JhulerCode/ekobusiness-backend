import sequelize from '../../database/sequelize.js'
import { Transaccion, TransaccionItem } from '../../database/models/Transaccion.js'
import { Op, where } from 'sequelize'
import { Socio } from '../../database/models/Socio.js'
import { Articulo } from '../../database/models/Articulo.js'
import { Maquina } from '../../database/models/Maquina.js'
import { ProduccionOrden } from '../../database/models/ProduccionOrden.js'
import { applyFilters, cleanFloat } from '../../utils/mine.js'
import cSistema from "../_sistema/cSistema.js"


const update = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params
        const {
            tipo, fecha,
            articulo, cantidad,
            moneda, tipo_cambio, pu, igv_afectacion, igv_porcentaje,
            lote, fv,
            is_lote_padre, stock,
            calidad_revisado,
            lote_padre, transaccion, produccion_orden, maquina
        } = req.body

        await TransaccionItem.update({
            tipo, fecha,
            articulo, cantidad,
            moneda, tipo_cambio, pu, igv_afectacion, igv_porcentaje,
            lote, fv,
            is_lote_padre, stock,
            calidad_revisado,
            lote_padre, transaccion, produccion_orden, maquina,
            updatedBy: colaborador
        }, { where: { id } })

        const data = await TransaccionItem.findByPk(id)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id'],
            where: {},
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Transaccion,
                    as: 'transaccion1',
                    attributes: ['id', 'socio'],
                    include: [
                        {
                            model: Socio,
                            as: 'socio1',
                            attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos']
                        }
                    ]
                },
                {
                    model: TransaccionItem,
                    as: 'lote_padre1',
                    attributes: ['moneda', 'tipo_cambio', 'igv_afectacion', 'igv_porcentaje', 'pu', 'fv', 'lote'],
                }
            ],
        }

        if (qry) {
            if (qry.fltr) {
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }

            if (qry.cols) {
                findProps.attributes = findProps.attributes.concat(qry.cols)
                // console.log(findProps.attributes)
            }
        }

        let data = await TransaccionItem.findAll(findProps)

        if (data.length > 0) {
            data = data.map(a => a.toJSON())

            const transaccion_tiposMap = cSistema.arrayMap('transaccion_tipos')

            for (const a of data) {
                const tipoInfo = transaccion_tiposMap[a.tipo]
                const loteFuente = a.is_lote_padre ? a : a.lote_padre1 || {}

                a.tipo1 = tipoInfo
                a.cantidad *= tipoInfo.operacion

                a.pu = loteFuente.pu
                a.tipo_cambio = loteFuente.tipo_cambio
                a.igv_afectacion = loteFuente.igv_afectacion
                a.igv_porcentaje = loteFuente.igv_porcentaje
                a.lote = loteFuente.lote
                a.fv = loteFuente.fv

                a.pu_real = a.tipo_cambio == null ? 'error' : cleanFloat((a.pu || 0) * a.tipo_cambio)

                if (a.igv_afectacion === '10') {
                    a.pu_igv = a.pu_real === 'error'
                        ? a.pu_real
                        : cleanFloat(a.pu_real / (1 + (a.igv_porcentaje / 100)))
                } else {
                    a.pu_igv = a.pu_real
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
        const { tipo, lote_padre, cantidad } = req.body

        // ----- ELIMINAR ----- //
        await TransaccionItem.destroy({
            where: { id },
            transaction
        })

        // ----- ACTUALIZAR STOCK ----- //
        if (lote_padre) {
            const ope = cSistema.sistemaData.transaccion_tipos.find(a => a.id == tipo)
            const signo = ope.operacion == 1 ? '-' : '+'

            await TransaccionItem.update(
                {
                    stock: sequelize.literal(`COALESCE(stock, 0) ${signo} ${cantidad}`)
                },
                {
                    where: { id: lote_padre },
                    transaction
                }
            )
        }

        await transaction.commit()

        res.json({ code: 0 })
    }
    catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}



const findLotes = async (req, res) => {
    try {
        const { id } = req.params

        const findProps = {
            attributes: ['id', 'fecha', 'moneda', 'tipo_cambio', 'pu', 'igv_afectacion', 'igv_porcentaje', 'fv', 'lote', 'stock'],
            order: [['createdAt', 'DESC']],
            where: {
                articulo: id,
                is_lote_padre: true,
            },
            include: [
                // {
                //     model: Transaccion,
                //     as: 'transaccion1',
                //     attributes: ['id', 'fecha'],
                //     where: {
                //         estado: {
                //             [Op.in]: [1, 2]
                //         }
                //     }
                // },
                {
                    model: Articulo,
                    as: 'articulo1',
                    attributes: ['nombre', 'unidad']
                },
            ],
        }

        let data = await TransaccionItem.findAll(findProps)

        if (data.length > 0) {
            data = data.map(a => a.toJSON())

            const igv_afectacionesMap = cSistema.arrayMap('igv_afectaciones')

            for (const a of data) {
                a.igv_afectacion1 = igv_afectacionesMap[a.igv_afectacion]

                a.pu_real = a.tipo_cambio == null ? 'error' : cleanFloat(a.pu * a.tipo_cambio)

                a.lote_fv_stock = a.lote + (a.fv ? ` | ${a.fv}` : '') + (` | ${a.stock.toLocaleString('es-US', { maximumFractionDigits: 2 })}`)
            }
        }

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


///// ----- PARA PRODUCCION INSUMOS ----- /////
const createProduccionInsumo = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador } = req.user
        const {
            tipo, fecha, produccion_orden, maquina,
            articulo, lote_padre, cantidad,
        } = req.body

        // ----- CREAR ----- //
        const nuevo = await TransaccionItem.create({
            tipo, fecha, produccion_orden, maquina,
            articulo, lote_padre, cantidad,
            createdBy: colaborador
        }, { transaction })

        // ----- ACTUALIZAR STOCK ----- //
        await TransaccionItem.update(
            {
                stock: sequelize.literal(`COALESCE(stock, 0) ${tipo == 2 ? '-' : '+'} ${cantidad}`)
            },
            {
                where: { id: lote_padre },
                transaction
            }
        )

        await transaction.commit()

        // ----- DEVOLVER ----- //
        let data = await TransaccionItem.findByPk(nuevo.id, {
            attributes: ['id', 'tipo', 'fecha', 'articulo', 'lote_padre', 'cantidad'],
            include: [
                {
                    model: Articulo,
                    as: 'articulo1',
                    attributes: ['nombre', 'unidad']
                },
                {
                    model: TransaccionItem,
                    as: 'lote_padre1',
                    attributes: ['pu', 'moneda', 'lote', 'fv'],
                },
            ]
        })

        if (data) {
            data = data.toJSON()

            const transaccion_tiposMap = cSistema.arrayMap('transaccion_tipos')

            data.cantidad = transaccion_tiposMap[data.tipo]?.operacion * data.cantidad
        }

        res.json({ code: 0, data })
    }
    catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findProduccionProductos = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id', 'tipo', 'fecha', 'articulo', 'lote_padre', 'cantidad'],
            order: [['createdAt', 'DESC']],
            where: {
                tipo: {
                    [Op.in]: [2, 3]
                }
            },
            include: [
                {
                    model: Articulo,
                    as: 'articulo1',
                    attributes: ['nombre', 'unidad']
                },
                {
                    model: TransaccionItem,
                    as: 'lote_padre1',
                    attributes: ['pu', 'moneda', 'lote', 'fv'],
                },
            ]
        }
        
        if (qry) {
            if (qry.fltr) {
                console.log(1)
                Object.assign(findProps.where, applyFilters(qry.fltr))
                console.log(2)
            }
        }

        let data = await TransaccionItem.findAll(findProps)

        if (data.length > 0) {
            data = data.map(a => a.toJSON())

            const transaccion_tiposMap = cSistema.arrayMap('transaccion_tipos')

            for (const a of data) {
                a.cantidad = transaccion_tiposMap[a.tipo]?.operacion * a.cantidad
            }
        }

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

// const findProduccionProductos = async (req, res) => {
//     try {
//         const { id } = req.params

//         const findProps = {
//             attributes: ['id', 'tipo', 'fecha', 'articulo', 'lote_padre', 'cantidad'],
//             order: [['createdAt', 'DESC']],
//             where: {
//                 produccion_orden: id,
//                 tipo: {
//                     [Op.in]: [2, 3]
//                 }
//             },
//             include: [
//                 {
//                     model: Articulo,
//                     as: 'articulo1',
//                     attributes: ['nombre', 'unidad']
//                 },
//                 {
//                     model: TransaccionItem,
//                     as: 'lote_padre1',
//                     attributes: ['pu', 'moneda', 'lote', 'fv'],
//                 },
//             ]
//         }

//         let data = await TransaccionItem.findAll(findProps)

//         if (data.length > 0) {
//             data = data.map(a => a.toJSON())

//             const transaccion_tiposMap = cSistema.arrayMap('transaccion_tipos')

//             for (const a of data) {
//                 a.cantidad = transaccion_tiposMap[a.tipo]?.operacion * a.cantidad
//             }
//         }

//         res.json({ code: 0, data })
//     }
//     catch (error) {
//         res.status(500).json({ code: -1, msg: error.message, error })
//     }
// }


///// ----- PARA PRODUCCION PRODUCTOS ----- /////
const createProduccionProductos = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador } = req.user
        const {
            tipo, fecha, produccion_orden,
            articulo, lote, fv, cantidad,
        } = req.body

        // ----- CREAR ----- //
        const nuevo = await TransaccionItem.create({
            tipo, fecha, produccion_orden,
            articulo, lote, fv, cantidad,
            createdBy: colaborador
        }, { transaction })

        await transaction.commit()

        // ----- DEVOLVER ----- //
        let data = await TransaccionItem.findByPk(nuevo.id, {
            attributes: ['id', 'lote', 'fv', 'cantidad'],
        })

        data = data.toJSON()
        const cuarentena_productos_estadosMap = cSistema.arrayMap('cuarentena_productos_estados')
        data.producto_estado = 1
        data.producto_estado1 = cuarentena_productos_estadosMap[data.producto_estado]

        res.json({ code: 0, data })
    }
    catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findProductosTerminados = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const includess = {
            produccion_orden1: {
                model: ProduccionOrden,
                as: 'produccion_orden1',
                attributes: ['id', 'tipo', 'maquina'],
                where: {},
                include: {
                    model: Maquina,
                    as: 'maquina1',
                    attributes: ['nombre'],
                }
            },
            articulo1: {
                model: Articulo,
                as: 'articulo1',
                attributes: ['nombre', 'unidad'],
                where: {}
            },
        }

        const findProps = {
            attributes: ['id', 'is_lote_padre'],
            order: [['createdAt', 'DESC']],
            where: {
                tipo: 4
            },
            include: []
        }

        if (qry) {
            if (qry.incl) {
                for (const a of qry.incl) {
                    if (qry.incl.includes(a)) findProps.include.push(includess[a])
                }
            }

            if (qry.fltr) {
                const fltr1 = JSON.parse(JSON.stringify(qry.fltr))
                delete qry.fltr.articulo
                delete qry.fltr.unidad
                delete qry.fltr.tipo
                delete qry.fltr.maquina
                Object.assign(findProps.where, applyFilters(qry.fltr))

                if (fltr1.articulo) {
                    const a = findProps.include.find(b => b.as == 'articulo1')
                    Object.assign(a.where, applyFilters({ nombre: fltr1.articulo }))
                }

                if (fltr1.tipo) {
                    const a = findProps.include.find(b => b.as == 'produccion_orden1')
                    Object.assign(a.where, applyFilters({ tipo: fltr1.tipo }))
                }

                if (fltr1.maquina) {
                    const a = findProps.include.find(b => b.as == 'produccion_orden1')
                    Object.assign(a.where, applyFilters({ maquina: fltr1.maquina }))
                }
            }

            if (qry.cols) {
                const excludeCols = ['articulo', 'unidad', 'tipo', 'maquina', 'producto_estado']
                const cols1 = qry.cols.filter(a => !excludeCols.includes(a))
                findProps.attributes = findProps.attributes.concat(cols1)
            }
        }

        let data = await TransaccionItem.findAll(findProps)

        if (data.length > 0) {
            data = data.map(a => a.toJSON())

            const produccion_tiposMap = cSistema.arrayMap('produccion_tipos')
            const cuarentena_productos_estadosMap = cSistema.arrayMap('cuarentena_productos_estados')

            for (const a of data) {
                if (qry.incl) a.produccion_orden1.tipo1 = produccion_tiposMap[a.produccion_orden1.tipo]
                a.producto_estado = a.is_lote_padre ? 2 : 1
                a.producto_estado1 = cuarentena_productos_estadosMap[a.producto_estado]
            }
        }

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const updateProduccionProductos = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador } = req.user
        const { fecha, transaccion_items } = req.body

        for (const a of transaccion_items) {
            await TransaccionItem.update(
                {
                    fecha: fecha,
                    cantidad: a.cantidad_real,
                    is_lote_padre: true,
                    stock: a.cantidad_real,
                    updatedBy: colaborador
                },
                { where: { id: a.id }, transaction }
            )
        }

        await transaction.commit()

        res.json({ code: 0 })
    }
    catch (error) {
        await transaction.rollback()
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
    update,
    find,
    delet,

    findLotes,

    createProduccionInsumo,
    findProduccionProductos,

    createProduccionProductos,
    findProductosTerminados,
    updateProduccionProductos,

    findItems,

    ajusteStock,
}
import sequelize from '../../database/sequelize.js'
import { Transaccion } from '../../database/models/Transaccion.js'
import { Kardex } from '../../database/models/Kardex.js'
import { Op, Sequelize } from 'sequelize'
import { Socio } from '../../database/models/Socio.js'
import { Articulo } from '../../database/models/Articulo.js'
import { Maquina } from '../../database/models/Maquina.js'
import { ProduccionOrden } from '../../database/models/ProduccionOrden.js'
import { applyFilters, cleanFloat } from '../../utils/mine.js'
import cSistema from "../_sistema/cSistema.js"
import { RecetaInsumo } from '../../database/models/RecetaInsumo.js'
import { ArticuloCategoria } from '../../database/models/ArticuloCategoria.js'
import { redondear } from '../../utils/mine.js'

const create = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador } = req.user
        const {
            tipo, fecha,
            articulo, cantidad,
            pu, igv_afectacion, igv_porcentaje, moneda, tipo_cambio,
            lote, fv,
            is_lote_padre, stock, lote_padre,
            // observacion, estado,
            transaccion, transaccion_item, produccion_orden, maquina,
        } = req.body

        // ----- CREAR ----- //
        const nuevo = await Kardex.create({
            tipo, fecha,
            articulo, cantidad,
            pu, igv_afectacion, igv_porcentaje, moneda, tipo_cambio,
            lote, fv,
            is_lote_padre, stock, lote_padre,
            // observacion, estado,
            transaccion, transaccion_item, produccion_orden, maquina,
            createdBy: colaborador
        }, { transaction })

        const transaccion_tiposMap = cSistema.arrayMap('transaccion_tipos')
        const tipoInfo = transaccion_tiposMap[tipo]

        // ----- ACTUALIZAR STOCK ----- //
        if ([2, 3, 6, 7].includes(Number(tipo))) {
            if (lote_padre) {
                await Kardex.update(
                    {
                        stock: sequelize.literal(`COALESCE(stock, 0) ${tipoInfo.operacion == 1 ? '+' : '-'} ${cantidad}`)
                    },
                    {
                        where: { id: lote_padre },
                        transaction
                    }
                )
            }
        }

        await transaction.commit()

        // ----- DEVOLVER ----- //
        const findProps = { include: [] }

        if ([2, 3].includes(Number(tipo))) {
            findProps.include.push(
                {
                    model: Articulo,
                    as: 'articulo1',
                    attributes: ['nombre', 'unidad']
                },
                {
                    model: Kardex,
                    as: 'lote_padre1',
                    attributes: ['pu', 'moneda', 'lote', 'fv'],
                },
            )
        }

        let data = await Kardex.findByPk(nuevo.id, findProps)

        if (data) {
            data = data.toJSON()

            data.cantidad = tipoInfo.operacion * data.cantidad

            if (tipo == 4) {
                const cuarentena_productos_estadosMap = cSistema.arrayMap('cuarentena_productos_estados')
                data.producto_estado = 1
                data.producto_estado1 = cuarentena_productos_estadosMap[data.producto_estado]
            }
        }

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
            articulo, cantidad,
            pu, igv_afectacion, igv_porcentaje, moneda, tipo_cambio,
            lote, fv,
            is_lote_padre, stock, lote_padre,
            // observacion, estado,
            transaccion, transaccion_item, produccion_orden, maquina,
        } = req.body

        await Kardex.update({
            tipo, fecha,
            articulo, cantidad,
            pu, igv_afectacion, igv_porcentaje, moneda, tipo_cambio,
            lote, fv,
            is_lote_padre, stock, lote_padre,
            // observacion, estado,
            transaccion, transaccion_item, produccion_orden, maquina,
            updatedBy: colaborador
        }, { where: { id } })

        const data = await Kardex.findByPk(id)

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
            order: [['createdAt', 'DESC'], ['fecha', 'DESC']],
            where: {},
            include: [],
        }

        const include1 = {
            lote_padre1: {
                model: Kardex,
                as: 'lote_padre1',
                attributes: ['moneda', 'tipo_cambio', 'igv_afectacion', 'igv_porcentaje', 'pu', 'fv', 'lote'],
                required: false
            },
            transaccion1: {
                model: Transaccion,
                as: 'transaccion1',
                attributes: ['id', 'socio', 'guia', 'factura'],
                required: false,
                include: [
                    {
                        model: Socio,
                        as: 'socio1',
                        attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos']
                    }
                ],
            },
            maquina1: {
                model: Maquina,
                as: 'maquina1',
                attributes: ['id', 'nombre'],
                required: false,
            },
            produccion_orden1: {
                model: ProduccionOrden,
                as: 'produccion_orden1',
                attributes: ['id', 'tipo', 'maquina', 'fecha', 'articulo'],
                include: [
                    {
                        model: Maquina,
                        as: 'maquina1',
                        attributes: ['id', 'nombre'],
                    }
                ],
                required: false,
            },
            articulo1: {
                model: Articulo,
                as: 'articulo1',
                attributes: ['nombre', 'unidad'],
            },
        }

        if (qry) {
            if (qry.incl) {
                for (const a of qry.incl) {
                    if (qry.incl.includes(a)) findProps.include.push(include1[a])
                }
            }

            if (qry.fltr) {
                const fltr1 = JSON.parse(JSON.stringify(qry.fltr))

                delete qry.fltr.articulo_nombre

                delete qry.fltr.produccion_orden_tipo
                delete qry.fltr.produccion_orden_maquina

                delete qry.fltr.transaccion_guia
                delete qry.fltr.transaccion_factura
                delete qry.fltr.transaccion_socio

                Object.assign(findProps.where, applyFilters(qry.fltr))

                if (fltr1.articulo_nombre) {
                    Object.assign(findProps.where, applyFilters({ '$articulo1.nombre$': fltr1.articulo_nombre }))
                }

                if (fltr1.produccion_orden_tipo) {
                    Object.assign(findProps.where, applyFilters({ '$produccion_orden1.tipo$': fltr1.produccion_orden_tipo }))
                }

                if (fltr1.produccion_orden_maquina) {
                    Object.assign(findProps.where, applyFilters({ '$produccion_orden1.maquina$': fltr1.produccion_orden_maquina }))
                }

                if (fltr1.transaccion_guia) {
                    Object.assign(findProps.where, applyFilters({ '$transaccion1.guia$': fltr1.transaccion_guia }))
                }

                if (fltr1.transaccion_factura) {
                    Object.assign(findProps.where, applyFilters({ '$transaccion1.factura$': fltr1.transaccion_factura }))
                }

                if (fltr1.transaccion_socio) {
                    Object.assign(findProps.where, applyFilters({ '$transaccion1.socio$': fltr1.transaccion_socio }))
                }
            }

            if (qry.cols) {
                const excludeCols = [
                    'articulo_nombre', 'articulo_unidad',
                    'produccion_orden_tipo', 'produccion_orden_maquina', 'producto_estado',
                    'transaccion_guia', 'transaccion_factura', 'transaccion_socio',
                ]
                const cols1 = qry.cols.filter(a => !excludeCols.includes(a))
                findProps.attributes = findProps.attributes.concat(cols1)
            }
        }

        let data = await Kardex.findAll(findProps)

        if (data.length > 0) {
            data = data.map(a => a.toJSON())

            const transaccion_tiposMap = cSistema.arrayMap('transaccion_tipos')
            const produccion_tiposMap = cSistema.arrayMap('produccion_tipos')
            const cuarentena_productos_estadosMap = cSistema.arrayMap('cuarentena_productos_estados')
            const estadosMap = cSistema.arrayMap('estados')

            for (const a of data) {
                // DATOS DE LOTE PADRE
                if (a.tipo) {
                    const tipoInfo = transaccion_tiposMap[a.tipo]
                    const loteFuente = a.is_lote_padre ? a : a.lote_padre1 || {}

                    a.tipo1 = tipoInfo
                    a.cantidad *= tipoInfo.operacion

                    a.vu = loteFuente.pu
                    a.tipo_cambio = loteFuente.tipo_cambio
                    a.igv_afectacion = loteFuente.igv_afectacion
                    a.igv_porcentaje = loteFuente.igv_porcentaje
                    a.lote = loteFuente.lote
                    a.fv = loteFuente.fv

                    a.vu_real = a.tipo_cambio == null ? 'error' : cleanFloat((a.vu || 0) * a.tipo_cambio)

                    if (a.igv_afectacion === '10') {
                        a.pu = a.vu_real === 'error'
                            ? a.vu_real
                            : cleanFloat(a.vu_real * (1 + (a.igv_porcentaje / 100)))
                    } else {
                        a.pu = a.vu_real
                    }
                }

                // DATOS PARA PRODUCTOS TERMINADOS
                if (qry.cols.includes('producto_estado')) {
                    a.producto_estado = a.is_lote_padre ? 2 : 1
                    a.producto_estado1 = cuarentena_productos_estadosMap[a.producto_estado]
                }

                if (qry.cols.includes('produccion_orden_tipo')) {
                    if (a.produccion_orden1) {
                        a.produccion_orden1.tipo1 = produccion_tiposMap[a.produccion_orden1.tipo]
                    }
                }

                if (qry.cols.includes('calidad_revisado')) {
                    a.calidad_revisado1 = estadosMap[a.calidad_revisado]
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
        await Kardex.destroy({
            where: { id },
            transaction
        })

        // ----- ACTUALIZAR STOCK ----- //
        if (lote_padre) {
            const ope = cSistema.sistemaData.transaccion_tipos.find(a => a.id == tipo)
            const signo = ope.operacion == 1 ? '-' : '+'

            await Kardex.update(
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
            order: [['fv', 'DESC'], ['createdAt', 'DESC']],
            where: {
                articulo: id,
                is_lote_padre: true,
            },
            include: [
                {
                    model: Articulo,
                    as: 'articulo1',
                    attributes: ['nombre', 'unidad']
                },
            ],
        }

        let data = await Kardex.findAll(findProps)

        if (data.length > 0) {
            data = data.map(a => a.toJSON())

            const igv_afectacionesMap = cSistema.arrayMap('igv_afectaciones')

            for (const a of data) {
                a.igv_afectacion1 = igv_afectacionesMap[a.igv_afectacion]

                let fecha_vencimiento = ''
                if (a.fv) {
                    const [año, mes, dia] = a.fv.split("-")
                    fecha_vencimiento = `${dia}-${mes}-${año}`
                }
                a.lote_fv_stock = a.lote + (a.fv ? ` | ${fecha_vencimiento}` : '') + (` | ${redondear(Number(a.stock))}`)
            }
        }

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


///// ----- PARA PRODUCCION PRODUCTOS ----- /////
const ingresarProduccionProductos = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador } = req.user
        const { fecha, transaccion_items } = req.body

        for (const a of transaccion_items) {
            await Kardex.update(
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


//--- Inventario hasta fecha ---//
const findInventario = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const data = await findMovimientosCantidad(qry, { fecha: { [Op.lte]: qry.transaccion_items.f2.val } })

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


///// ----- PARA PRODUCCIÓN ----- /////
const findReporteProduccion = async (req, res) => {
    try {
        const { linea, f1, f2 } = req.params

        const data = {
            produccion_mes: [],
            produccion_mes_total: 0,
            insumos: [],
            insumos_categorias: [],
        }

        const qry = {
            incl: ['categoria1'],
            cols: ['nombre'],
            fltr: { produccion_tipo: { op: 'Es', val: linea } }
        }
        const ti_where = {
            fecha: { [Op.between]: [f1, f2] },
            tipo: 4
        }
        data.produccion_mes = await findMovimientosCantidad(qry, ti_where)

        data.produccion_mes_total = data.produccion_mes.reduce((acc, a) => acc + Number(a.cantidad), 0);

        const produccion_mes_insumos = await RecetaInsumo.findAll({
            attributes: ['articulo_principal', 'articulo', 'cantidad'],
            where: {
                articulo_principal: { [Op.in]: data.produccion_mes.map(a => a.id) },
            },
            include: {
                model: Articulo,
                as: 'articulo1',
                attributes: ['nombre'],
            },
            raw: true,
        });

        //--- Lo que debería haberse consumido ---//
        const recetaMap = {};
        for (const r of produccion_mes_insumos) {
            if (!recetaMap[r.articulo_principal]) recetaMap[r.articulo_principal] = [];
            recetaMap[r.articulo_principal].push(r);
        }

        const insumos_esperados_obj = {};
        for (const prod of data.produccion_mes) {
            prod.cantidad = Number(prod.cantidad);
            const receta = recetaMap[prod.id] || [];

            for (const r of receta) {
                const total = r.cantidad * prod.cantidad;

                if (!insumos_esperados_obj[r.articulo]) {
                    insumos_esperados_obj[r.articulo] = {
                        id: r.articulo,
                        nombre: r['articulo1.nombre'],
                        cantidad: 0
                    };
                }

                insumos_esperados_obj[r.articulo].cantidad += total;
            }
        }

        //--- Lo que se consumió realmente ---//
        const qry1 = {
            incl: ['categoria1'],
            cols: ['nombre'],
            fltr: { id: { op: 'Es', val: produccion_mes_insumos.map(a => a.articulo) } }
        }
        const ti_where1 = {
            fecha: { [Op.between]: [f1, f2] },
            tipo: { [Op.in]: [2, 3] }
        }
        const insumos_mes_consumos = await findMovimientosCantidad(qry1, ti_where1)

        const insumos_utilizados_obj = {}
        for (const a of insumos_mes_consumos) {
            if (!insumos_utilizados_obj[a.id]) {
                insumos_utilizados_obj[a.id] = {
                    ...a,
                    cantidad_plan: 0,
                    cantidad: 0,
                    diferencia: 0,
                }
            }

            insumos_utilizados_obj[a.id].cantidad_plan += insumos_esperados_obj[a.id].cantidad
            insumos_utilizados_obj[a.id].cantidad += a.cantidad * -1
            insumos_utilizados_obj[a.id].diferencia += insumos_utilizados_obj[a.id].cantidad_plan - insumos_utilizados_obj[a.id].cantidad
        }
        data.insumos = Object.values(insumos_utilizados_obj);

        //--- Agrupar por categoria ---//
        const insumos_categorias_obj = {};
        for (const a of data.insumos) {
            const cat = a['categoria1.nombre'] || 'SIN CATEGORÍA';

            if (!insumos_categorias_obj[cat]) {
                insumos_categorias_obj[cat] = {
                    nombre: cat,
                    cantidad_plan: 0,
                    cantidad: 0,
                    diferencia: 0,
                };
            }

            insumos_categorias_obj[cat].cantidad_plan += a.cantidad_plan;
            insumos_categorias_obj[cat].cantidad += a.cantidad;
            insumos_categorias_obj[cat].diferencia += a.diferencia;
        }
        data.insumos_categorias = Object.values(insumos_categorias_obj);

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


async function findMovimientosCantidad(qry, ti_where) {
    const findProps = {
        include: [],
        attributes: ['id'],
        where: {},
        order: [['nombre', 'ASC']],
        group: ['articulos.id'],
        raw: true,
    }

    const include1 = {
        categoria1: {
            model: ArticuloCategoria,
            as: 'categoria1',
            attributes: ['id', 'nombre']
        }
    }

    if (qry) {
        if (qry.incl) {
            for (const a of qry.incl) {
                if (qry.incl.includes(a)) findProps.include.push(include1[a])
            }
        }

        if (qry.cols) {
            const columns = Object.keys(Articulo.getAttributes());
            const cols1 = qry.cols.filter(a => columns.includes(a))
            findProps.attributes = findProps.attributes.concat(cols1)
        }

        if (qry.fltr) {
            Object.assign(findProps.where, applyFilters(qry.fltr))
        }
    }

    findProps.include.push({
        model: Kardex,
        as: 'kardexes',
        attributes: [],
        required: false,
        where: ti_where
    })

    const operacionesMap = cSistema.arrayMap('transaccion_tipos')
    const caseParts = Object.entries(operacionesMap)
        .map(([tipo, obj]) => `WHEN kardexes.tipo = ${tipo} THEN ${obj.operacion} * kardexes.cantidad`)
        .join(' ');
    const caseExpression = `CASE ${caseParts} ELSE 0 END`;

    findProps.attributes.push([Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal(caseExpression)), 0), 'cantidad'])

    return await Articulo.findAll(findProps)
}

export default {
    update,
    find,
    delet,
    create,

    findLotes,

    ingresarProduccionProductos,

    findInventario,
    findReporteProduccion,
}
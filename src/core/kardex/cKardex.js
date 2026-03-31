import { Repository } from '#db/Repository.js'
import { arrayMap } from '#store/system.js'
import sequelize from '#db/sequelize.js'
import { cleanFloat } from '#shared/mine.js'

const repository = new Repository('Kardex')
const ProduccionOrdenRep = new Repository('ProduccionOrden')
const ArticuloRep = new Repository('Articulo')
const RecetaInsumoRep = new Repository('RecetaInsumo')
const LoteRepo = new Repository('Lote')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const virtuals = ['tipo', 'fecha', 'fv', 'cantidad', 'pt_cuarentena']

        virtuals.forEach((v) => {
            if (qry?.cols?.includes(v)) qry.cols.push(`${v}1`)
        })

        const response = await repository.find(qry, true)

        const hasPage = qry?.page
        const data = hasPage ? response.data : response
        const meta = hasPage ? response.meta : null

        if (data.length > 0) {
            const cuarentena_productos_estadosMap = arrayMap('cuarentena_productos_estados')
            const estadosMap = arrayMap('estados')

            for (const a of data) {
                if (a.tipo) {
                    a.cantidad = Number(a.cantidad)

                    //--- calcular pu ---//
                    if (a.lote1) {
                        a.lote1.vu_real =
                            a.lote1.tipo_cambio == null
                                ? 'error'
                                : cleanFloat((a.lote1.vu || 0) * a.lote1.tipo_cambio)

                        if (a.lote1.igv_afectacion === '10') {
                            a.lote1.pu =
                                a.lote1.vu_real === 'error'
                                    ? a.lote1.vu_real
                                    : cleanFloat(
                                          a.lote1.vu_real * (1 + a.lote1.igv_porcentaje / 100),
                                      )
                        } else {
                            a.lote1.pu = a.lote1.vu_real
                        }
                    }
                }

                //--- Datos para productos terminados ---//
                if (qry?.cols?.includes('producto_estado')) {
                    a.producto_estado = a.is_lote_padre ? 2 : 1
                    a.producto_estado1 = cuarentena_productos_estadosMap[a.producto_estado]
                }

                //--- Datos para compra items ---//
                if (qry?.cols?.includes('calidad_revisado')) {
                    a.calidad_revisado1 = estadosMap[a.calidad_revisado]
                }
            }
        }

        res.json({ code: 0, data, meta })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { empresa } = req.user
        const { colaborador } = req.user
        const body = req.body

        //--- CREAR LOTE ---//
        if (body.tipo == 4 || (body.tipo == 6 && body.is_nuevo_lote)) {
            await LoteRepo.create(
                {
                    ...body.lote1,
                    stock: body.cantidad,
                    empresa,
                    createdBy: colaborador,
                },
                transaction,
            )
        }

        //--- CREAR ---
        const nuevo = await repository.create(
            {
                ...body,
                lote_id: body.lote_id || body.lote1.id,
                empresa,
                createdBy: colaborador,
            },
            transaction,
        )

        //--- ACTUALIZAR STOCK ---//
        if (body.tipo == 2 || (body.tipo == 6 && !body.is_nuevo_lote) || body.tipo == 7) {
            if (body.lote_id) {
                const transaccion_tiposMap = arrayMap('kardex_operaciones')
                const tipoInfo = transaccion_tiposMap[body.tipo]
                const signo = tipoInfo.operacion == 1 ? '+' : '-'
                const stock = sequelize.literal(`COALESCE(stock, 0) ${signo} ${body.cantidad}`)

                await LoteRepo.update({ id: body.lote_id }, { stock }, transaction)
            }
        }

        await transaction.commit()

        //--- DEVOLVER ---
        const incl = ['articulo1', 'lote1']
        const data = await repository.find({ id: nuevo.id, incl }, true)

        if (data) {
            if (body.tipo == 4) {
                const cuarentena_productos_estadosMap = arrayMap('cuarentena_productos_estados')
                data.producto_estado = data.is_lote_padre ? 2 : 1
                data.producto_estado1 = cuarentena_productos_estadosMap[data.producto_estado]
            }
        }

        res.json({ code: 0, data })
    } catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador } = req.user
        const { id } = req.params
        const body = req.body

        const currentRecord = await repository.find({ id }, true)
        if (!currentRecord) {
            await transaction.rollback()
            return res.status(404).json({ code: -1, msg: 'Registro no encontrado' })
        }

        const diff = repository.getDiff(currentRecord, body)
        if (diff) {
            diff.updatedBy = colaborador
            await repository.update({ id }, diff, transaction)
        }

        if (body.tipo == 2) {
            const oldLoteId = currentRecord.lote_id
            const oldCantidad = Number(currentRecord.cantidad)
            const newLoteId = body.lote_id
            const newCantidad = Number(body.cantidad)

            if (oldLoteId !== newLoteId) {
                // Devolvemos al lote antiguo
                const stockOld = sequelize.literal(`COALESCE(stock, 0) + ${oldCantidad}`)
                await LoteRepo.update({ id: oldLoteId }, { stock: stockOld }, transaction)

                // Restamos del nuevo lote
                const stockNew = sequelize.literal(`COALESCE(stock, 0) - ${newCantidad}`)
                await LoteRepo.update({ id: newLoteId }, { stock: stockNew }, transaction)
            } else if (oldCantidad !== newCantidad) {
                // Ajustamos la diferencia (Salida -> restamos el incremento)
                const diffCant = newCantidad - oldCantidad
                const stock = sequelize.literal(`COALESCE(stock, 0) - ${diffCant}`)
                await LoteRepo.update({ id: oldLoteId }, { stock }, transaction)
            }
        }
        if (body.tipo == 4) {
            await LoteRepo.update(
                { id: body.lote_id },
                { codigo: body.lote1.codigo, fv: body.lote1.fv, stock: body.cantidad },
                transaction,
            )
        }

        await transaction.commit()

        const data = await repository.find({ id })

        res.json({ code: 0, data })
    } catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { id } = req.params
        const { tipo, lote_id, cantidad } = req.body

        //--- ELIMINAR ---
        if ((await repository.delete({ id }, transaction)) == false) return

        if (tipo == 2) {
            //--- ACTUALIZAR STOCK ---
            if (lote_id) {
                const transaccion_tiposMap = arrayMap('kardex_operaciones')
                const tipoInfo = transaccion_tiposMap[tipo]
                const signo = tipoInfo.operacion == 1 ? '-' : '+'
                const stock = sequelize.literal(`COALESCE(stock, 0) ${signo} ${cantidad}`)

                await LoteRepo.update({ id: lote_id }, { stock }, transaction)
            }
        }

        if (tipo == 4) {
            await LoteRepo.delete({ id: lote_id }, transaction)
        }

        await transaction.commit()

        res.json({ code: 0 })
    } catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const ingresarProduccionProductos = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador } = req.user
        const { fecha, produccion_ordenes_pts_reales } = req.body

        if (!produccion_ordenes_pts_reales || produccion_ordenes_pts_reales.length === 0) {
            await transaction.rollback()
            return res.json({ code: 0, msg: 'No hay datos para procesar' })
        }

        const ids = produccion_ordenes_pts_reales.map((a) => a.id)
        const loteIds = produccion_ordenes_pts_reales.map((a) => a.lote_id)
        const produccion_ordenes_ids = [
            ...new Set(produccion_ordenes_pts_reales.map((a) => a.produccion_orden1.id)),
        ]

        //--- 1. Actualizar Kardex con CASE (Optimizado) ---
        let caseCantidad = 'CASE id '
        for (const a of produccion_ordenes_pts_reales) {
            caseCantidad += `WHEN ${sequelize.escape(a.id)} THEN ${Number(a.cantidad_real)} `
        }
        caseCantidad += 'END'

        await repository.update(
            { id: ids },
            {
                cantidad: sequelize.literal(caseCantidad),
                fecha: fecha,
                // tipo: 4,
                pt_cuarentena: false,
                updatedBy: colaborador,
            },
            transaction,
        )

        //--- 2. Actualizar stock de los Lotas con CASE (Optimizado) ---
        let caseStock = 'CASE id '
        for (const a of produccion_ordenes_pts_reales) {
            caseStock += `WHEN ${sequelize.escape(a.lote_id)} THEN ${Number(a.cantidad_real)} `
        }
        caseStock += 'END'

        await LoteRepo.update(
            { id: loteIds },
            {
                stock: sequelize.literal(caseStock),
                updatedBy: colaborador,
            },
            transaction,
        )

        //--- 3. Actualizar estado de las ordenes ---
        await ProduccionOrdenRep.update({ id: produccion_ordenes_ids }, { estado: 2 }, transaction)

        await transaction.commit()

        res.json({ code: 0 })
    } catch (error) {
        await transaction.rollback()
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const recalcularStock = async (req, res) => {
    try {
        const qry = {
            incl: ['lote_padre_items'],
            cols: ['id', 'cantidad'],
            sqls: ['lote_padre_movimientos_cantidad'],
            fltr: {
                is_lote_padre: { op: 'Es', val: true },
                // fecha: { op: 'Está dentro de', val: '2025-11-15', val1: '2025-11-30' },
                articulo: { op: 'Es', val: '8b40851b-e6c6-4607-936d-81be73a8f845' },
            },
            grop: ['id'],
            ordr: [['fecha', 'ASC']],
            // sqls: ['lote_padre_movimientos_cantidad']
        }

        const lotes_padre = await repository.find(qry, true)

        if (lotes_padre.length > 0) {
            console.log('Total a actualizar:', lotes_padre.length)
            let i = 1

            for (let a of lotes_padre) {
                const stock = Number(a.cantidad) + Number(a.movimientos_cantidad)
                console.log(
                    'Actualizando ',
                    i,
                    `Cantidad: ${a.cantidad}`,
                    `Movimientos: ${a.movimientos_cantidad}`,
                    `Stock: ${stock}`,
                )

                await repository.update({ id: a.id }, { stock })

                i++
            }

            console.log('Registros actualizados:', lotes_padre.length)
        }

        res.json({ code: 0 })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

//--- Inventario hasta fecha ---//
const findInventario = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const response = await ArticuloRep.find(qry, true)

        const hasPage = qry?.page
        const data = hasPage ? response.data : response
        const meta = hasPage ? response.meta : null

        res.json({ code: 0, data, meta })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

//--- Producción e insumos utilizados entre fechas ---///
const findReporteProduccion = async (req, res) => {
    try {
        const { linea, f1, f2 } = req.params

        const data = {
            produccion_mes: [],
            produccion_mes_total: 0,
            insumos: [],
            insumos_categorias: [],
        }

        //--- Lo que se ha producido ---//
        const qry = {
            incl: ['categoria1', 'kardexes'],
            cols: ['nombre'],
            sqls: ['articulo_movimientos_cantidad'],
            fltr: {
                linea: { op: 'Es', val: linea },
                'kardexes.fecha': { op: 'Está dentro de', val: f1, val1: f2 },
                'kardexes.tipo': { op: 'Es', val: 4 },
            },
            grop: ['id'],
            ordr: [['nombre', 'ASC']],
        }

        data.produccion_mes = await ArticuloRep.find(qry, true)

        data.produccion_mes_total = data.produccion_mes.reduce(
            (acc, a) => acc + Number(a.cantidad),
            0,
        )

        //--- Lo que debería haberse consumido ---//
        const qry1 = {
            incl: ['articulo1'],
            cols: ['articulo_principal', 'articulo', 'cantidad'],
            fltr: { articulo_principal: { op: 'Es', val: data.produccion_mes.map((a) => a.id) } },
        }

        const produccion_mes_insumos = await RecetaInsumoRep.find(qry1, true)

        const recetaMap = {}
        for (const r of produccion_mes_insumos) {
            if (!recetaMap[r.articulo_principal]) recetaMap[r.articulo_principal] = []
            recetaMap[r.articulo_principal].push(r)
        }

        const insumos_esperados_obj = {}
        for (const prod of data.produccion_mes) {
            prod.cantidad = Number(prod.cantidad)
            const receta = recetaMap[prod.id] || []

            for (const r of receta) {
                const total = r.cantidad * prod.cantidad

                if (!insumos_esperados_obj[r.articulo]) {
                    insumos_esperados_obj[r.articulo] = {
                        id: r.articulo,
                        nombre: r['articulo1.nombre'],
                        cantidad: 0,
                    }
                }

                insumos_esperados_obj[r.articulo].cantidad += total
            }
        }

        //--- Lo que se consumió realmente ---//
        const qry2 = {
            incl: ['categoria1', 'kardexes'],
            cols: ['nombre'],
            sqls: ['articulo_movimientos_cantidad'],
            fltr: {
                id: { op: 'Es', val: produccion_mes_insumos.map((a) => a.articulo) },
                'kardexes.fecha': { op: 'Está dentro de', val: f1, val1: f2 },
                'kardexes.tipo': { op: 'Es', val: [2, 3] },
            },
            grop: ['id'],
            ordr: [['nombre', 'ASC']],
        }
        const insumos_mes_consumos = await ArticuloRep.find(qry2, true)

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
            insumos_utilizados_obj[a.id].diferencia +=
                insumos_utilizados_obj[a.id].cantidad_plan - insumos_utilizados_obj[a.id].cantidad
        }
        data.insumos = Object.values(insumos_utilizados_obj)

        //--- Agrupar por categoria ---//
        const insumos_categorias_obj = {}
        for (const a of data.insumos) {
            const cat = a.categoria1.nombre || 'SIN CATEGORÍA'
            console.log(cat)

            if (!insumos_categorias_obj[cat]) {
                insumos_categorias_obj[cat] = {
                    nombre: cat,
                    cantidad_plan: 0,
                    cantidad: 0,
                    diferencia: 0,
                }
            }

            insumos_categorias_obj[cat].cantidad_plan += a.cantidad_plan
            insumos_categorias_obj[cat].cantidad += a.cantidad
            insumos_categorias_obj[cat].diferencia += a.diferencia
        }
        data.insumos_categorias = Object.values(insumos_categorias_obj)

        //--- Programado ---//
        const qry3 = {
            fltr: {
                linea: { op: 'Es', val: linea },
                fecha: { op: 'Está dentro de', val: f1, val1: f2 },
            },
            cols: ['fecha', 'cantidad', 'articulo', 'responsable'],
            incl: ['responsable1'],
            sqls: ['productos_terminados'],
            ordr: [['fecha', 'ASC']],
        }

        const programados = await ProduccionOrdenRep.find(qry3, true)
        const responsablesMap = {}
        for (const a of programados) {
            if (!responsablesMap[a.responsable]) {
                responsablesMap[a.responsable] = {
                    ...a,
                    cantidad: 0,
                    productos_terminados: 0,
                    diferencia: 0,
                }
            }

            responsablesMap[a.responsable].cantidad += Number(a.cantidad)
            responsablesMap[a.responsable].productos_terminados += Number(a['productos_terminados'])
            responsablesMap[a.responsable].diferencia +=
                responsablesMap[a.responsable].productos_terminados -
                responsablesMap[a.responsable].cantidad
        }
        data.por_responsable = Object.values(responsablesMap)

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    update,
    find,
    delet,
    create,
    ingresarProduccionProductos,
    findInventario,
    findReporteProduccion,
    recalcularStock,
}

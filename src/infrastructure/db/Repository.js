import { Op, Sequelize } from 'sequelize'
import { Empresa } from '#db/models/Empresa.js'
import { ActivityLog } from '#db/models/ActivityLog.js'
import { Articulo } from '#db/models/Articulo.js'
import { ArticuloCategoria } from '#db/models/ArticuloCategoria.js'
import { ArticuloLinea } from '#db/models/ArticuloLinea.js'
import { ArticuloSupplier } from '#db/models/ArticuloSupplier.js'
import { Asistencia } from '#db/models/Asistencia.js'
import { CajaApertura } from '#db/models/CajaApertura.js'
import { CajaMovimiento } from '#db/models/CajaMovimiento.js'
import { Colaborador } from '#db/models/Colaborador.js'
import { ComboComponente } from './models/ComboComponente.js'
import { DerechoArco } from '#db/models/DerechoArco.js'
import { Documento } from '#db/models/Documento.js'
import { FormatoValue } from '#db/models/FormatoValue.js'
import { HelpdeskTicket } from '#db/models/HelpdeskTicket.js'
import { Inspeccion } from '#db/models/Inspeccion.js'
import { Kardex } from '#db/models/Kardex.js'
import { Lote } from '#infrastructure/db/models/Lote.js'
import { LibroReclamo } from '#db/models/LibroReclamo.js'
import { Maquina } from '#db/models/Maquina.js'
import { Moneda } from '#db/models/Moneda.js'
import { MrpBom } from '#db/models/MrpBom.js'
import { MrpBomLine } from '#db/models/MrpBomLine.js'
import { MrpBomSocio } from '#db/models/MrpBomSocio.js'
import { PrecioLista } from '#db/models/PrecioLista.js'
import { PrecioListaItem } from '#db/models/PrecioListaItem.js'
import { ProduccionOrden } from '#db/models/ProduccionOrden.js'
import { RecetaInsumo } from '#db/models/RecetaInsumo.js'
import { Socio } from '#db/models/Socio.js'
import { SocioPedido, SocioPedidoItem } from '#db/models/SocioPedido.js'
import { TipoCambio } from '#db/models/TipoCambio.js'
import { Transaccion, TransaccionItem } from '#db/models/Transaccion.js'
import { Suscripcion } from '#db/models/Suscripcion.js'
import { Ubigeo } from '#db/models/Ubigeo.js'
import { Ubicacion } from '#infrastructure/db/models/Ubicacion.js'

import { applyFilters } from '#db/helpers.js'
import { sistemaData } from '#store/system.js'

export const models = {
    Empresa,
    ActivityLog,
    Articulo,
    ArticuloCategoria,
    ArticuloLinea,
    ArticuloSupplier,
    Asistencia,
    CajaApertura,
    CajaMovimiento,
    Colaborador,
    ComboComponente,
    DerechoArco,
    Documento,
    FormatoValue,
    HelpdeskTicket,
    Inspeccion,
    Kardex,
    Lote,
    LibroReclamo,
    Maquina,
    Moneda,
    MrpBom,
    MrpBomLine,
    MrpBomSocio,
    PrecioLista,
    PrecioListaItem,
    ProduccionOrden,
    RecetaInsumo,
    Socio,
    SocioPedido,
    SocioPedidoItem,
    TipoCambio,
    Transaccion,
    TransaccionItem,
    Suscripcion,
    Ubigeo,
    Ubicacion,
}

const include1 = {
    linea1: {
        model: ArticuloLinea,
        as: 'linea1',
        attributes: ['id', 'nombre'],
    },
    // tipo1: {
    //     model: ArticuloLinea,
    //     as: 'tipo1',
    //     attributes: ['id', 'nombre'],
    // },
    categoria1: {
        model: ArticuloCategoria,
        as: 'categoria1',
        attributes: ['id', 'nombre'],
    },
    articulo1: {
        model: Articulo,
        as: 'articulo1',
        attributes: ['id', 'nombre', 'type', 'purchase_ok', 'sale_ok', 'unidad', 'has_fv'],
    },
    articulo_suppliers: {
        model: ArticuloSupplier,
        as: 'articulo_suppliers',
        attributes: [
            'id',
            'articulo',
            'socio',
            'min_qty',
            'price',
            'currency_id',
            'delay',
            'date_start',
            'date_end',
            'product_code',
            'product_name',
            'sequence',
        ],
    },
    empresa1: {
        model: Empresa,
        as: 'empresa1',
        attributes: ['id', 'razon_social'],
    },
    colaborador1: {
        model: Colaborador,
        as: 'colaborador1',
        attributes: ['id', 'nombres'],
    },
    createdBy1: {
        model: Colaborador,
        as: 'createdBy1',
        attributes: ['id', 'nombres'],
    },
    updatedBy1: {
        model: Colaborador,
        as: 'updatedBy1',
        attributes: ['id', 'nombres'],
    },
    caja_movimientos: {
        model: CajaMovimiento,
        as: 'caja_movimientos',
    },
    combo_componentes: {
        model: ComboComponente,
        as: 'combo_componentes',
        attributes: ['id', 'articulo', 'cantidad', 'orden'],
    },
    currency_id1: {
        model: Moneda,
        as: 'currency_id1',
        attributes: ['id', 'nombre'],
    },
    kardexes: {
        model: Kardex,
        as: 'kardexes',
        attributes: [],
        required: false,
    },
    kardexes_all: {
        model: Kardex,
        as: 'kardexes',
        attributes: ['id', 'tipo', 'fecha', 'articulo', 'cantidad', 'cantidad1', 'lote_id'],
        required: false,
    },
    lote1: {
        model: Lote,
        as: 'lote1',
        attributes: [
            'id',
            'codigo',
            'fv',
            'fv1',
            'tipo_cambio',
            'vu',
            'igv_afectacion',
            'igv_porcentaje',
            'stock',
            'lote_fv_stock',
            'lote_fv',
        ],
    },
    lote_padre_items: {
        model: Kardex,
        as: 'lote_padre_items',
        attributes: [],
        required: false,
    },
    lote_padre1: {
        model: Kardex,
        as: 'lote_padre1',
        attributes: [
            'id',
            'moneda',
            'tipo_cambio',
            'igv_afectacion',
            'igv_porcentaje',
            'pu',
            'fv',
            'lote',
            'stock',
            'lote_fv_stock',
        ],
        required: false,
    },
    lote_padre2: {
        model: Kardex,
        as: 'lote_padre1',
        attributes: [],
        required: false,
    },
    lotes: {
        model: Lote,
        as: 'lotes',
        attributes: [
            'id',
            'codigo',
            'fv',
            'vu',
            'igv_afectacion',
            'igv_porcentaje',
            'stock',
            'lote_fv_stock',
            'lote_fv',
        ],
    },
    maquina1: {
        model: Maquina,
        as: 'maquina1',
        attributes: ['id', 'nombre'],
        required: false,
    },
    moneda1: {
        model: Moneda,
        as: 'moneda1',
        attributes: ['id', 'nombre'],
    },
    mrp_bom1: {
        model: MrpBom,
        as: 'mrp_bom1',
        attributes: ['id', 'referencia'],
    },
    mrp_bom_lines: {
        model: MrpBomLine,
        as: 'mrp_bom_lines',
        attributes: ['id', 'articulo', 'cantidad', 'orden'],
    },
    mrp_bom_socios: {
        model: MrpBomSocio,
        as: 'mrp_bom_socios',
        attributes: ['id', 'socio'],
    },
    precio_lista1: {
        model: PrecioLista,
        as: 'precio_lista1',
        attributes: ['id', 'nombre', 'moneda'],
    },
    produccion_orden1: {
        model: ProduccionOrden,
        as: 'produccion_orden1',
        attributes: ['id', 'linea', 'maquina', 'fecha', 'articulo'],
        required: false,
    },
    receta_insumos: {
        model: RecetaInsumo,
        as: 'receta_insumos',
        attributes: ['id', 'articulo', 'cantidad', 'orden'],
    },
    responsable1: {
        model: Colaborador,
        as: 'responsable1',
        attributes: ['id', 'nombres', 'produccion_codigo'],
    },
    socio1: {
        model: Socio,
        as: 'socio1',
        attributes: ['id', 'nombres'],
    },
    socio_pedido1: {
        model: SocioPedido,
        as: 'socio_pedido1',
        attributes: ['id', 'fecha', 'fecha1', 'socio', 'codigo'],
    },
    socio_pedido_items: {
        model: SocioPedidoItem,
        as: 'socio_pedido_items',
    },
    transaccion1: {
        model: Transaccion,
        as: 'transaccion1',
        attributes: ['id', 'fecha', 'fecha1', 'socio', 'guia', 'factura'],
        required: false,
    },
    transaccion_items: {
        model: TransaccionItem,
        as: 'transaccion_items',
    },
    ubicacion1: {
        model: Ubicacion,
        as: 'ubicacion1',
        attributes: ['id', 'nombre', 'tipo'],
    },
    origen1: {
        model: Ubicacion,
        as: 'origen1',
        attributes: ['id', 'nombre'],
    },
    destino1: {
        model: Ubicacion,
        as: 'destino1',
        attributes: ['id', 'nombre'],
    },
}

const sqls1 = {
    articulo_movimientos_valorizado: [
        Sequelize.fn(
            'COALESCE',
            Sequelize.fn(
                'SUM',
                Sequelize.literal(`
                    CASE ${sistemaData.kardex_operaciones
                        .map(
                            (t) => `
                            WHEN kardexes.tipo = '${t.id}'
                            THEN kardexes.cantidad * ${t.operacion} * COALESCE(\`kardexes->lote_padre1\`.pu, kardexes.pu) * COALESCE(\`kardexes->lote_padre1\`.tipo_cambio, kardexes.tipo_cambio)
                        `,
                        )
                        .join(' ')}
                    ELSE 0 END
                `),
            ),
            0,
        ),
        'articulo_movimientos_valorizado',
    ],
    articulo_movimientos_cantidad: [
        Sequelize.fn(
            'COALESCE',
            Sequelize.fn(
                'SUM',
                Sequelize.literal(`
                    CASE ${sistemaData.kardex_operaciones
                        .map(
                            (t) => `
                            WHEN kardexes.tipo = '${t.id}'
                            THEN kardexes.cantidad * ${t.operacion}`,
                        )
                        .join(' ')}
                    ELSE 0 END
                `),
            ),
            0,
        ),
        'cantidad',
    ],
    lote_padre_movimientos_cantidad: [
        Sequelize.fn(
            'COALESCE',
            Sequelize.fn(
                'SUM',
                Sequelize.literal(`
                        CASE ${sistemaData.kardex_operaciones
                            .map(
                                (t) => `
                                WHEN lote_padre_items.tipo = '${t.id}'
                                THEN lote_padre_items.cantidad * ${t.operacion}`,
                            )
                            .join(' ')}
                        ELSE 0 END
                    `),
            ),
            0,
        ),
        'movimientos_cantidad',
    ],
    articulo_stock: [
        Sequelize.literal(`(
            SELECT COALESCE(SUM(k.stock), 0)
            FROM kardexes AS k
            WHERE k.articulo = articulos.id AND k.is_lote_padre = TRUE
        )`),
        'stock',
    ],
    mrp_bom_line_articulo_stock: [
        Sequelize.literal(`(
            SELECT COALESCE(SUM(k.stock), 0)
            FROM kardexes AS k
            WHERE k.articulo = mrp_bom_lines.articulo AND k.is_lote_padre = TRUE
        )`),
        'mrp_bom_line_articulo_stock',
    ],
    productos_terminados: [
        Sequelize.literal(`(
            SELECT COALESCE(SUM(k.cantidad), 0)
            FROM kardexes AS k
            WHERE k.produccion_orden = produccion_ordenes.id AND k.tipo = 4
        )`),
        'productos_terminados',
    ],
}

export class Repository {
    constructor(modelId) {
        this.model = models[modelId]
    }

    async find(qry, tojson = false) {
        const columns = Object.keys(this.model.getAttributes())

        const findProps = {
            include: [],
            attributes: ['id'],
        }

        if (qry?.incl) {
            for (const a of qry.incl) {
                findProps.include.push({
                    ...include1[a],
                    attributes: include1[a].attributes ? [...include1[a].attributes] : undefined,
                    include: [],
                })
            }
        }

        if (qry?.iccl) {
            for (const [key, val] of Object.entries(qry.iccl)) {
                const item = findProps.include.find((b) => b.as === key)
                if (item) {
                    if (val.incl) {
                        for (const a of val.incl) {
                            item.include.push({ ...include1[a] })
                        }
                    }

                    if (val.cols) {
                        item.attributes.push(...val.cols)
                    }
                }
            }
        }

        if (qry?.sqls) {
            for (const a of qry.sqls) {
                findProps.attributes.push(sqls1[a])
            }
        }

        if (qry?.id) {
            delete findProps.attributes
            const data = await this.model.findByPk(qry.id, findProps)

            if (data && tojson) {
                return data.toJSON()
            } else {
                return data
            }
        } else {
            findProps.where = {}
            findProps.order = [['createdAt', 'DESC']]

            if (qry?.cols) {
                if (qry.cols.exclude) {
                    findProps.attributes = { exclude: qry.cols.exclude }
                } else {
                    const cols1 = qry.cols.filter((a) => columns.includes(a))
                    findProps.attributes.push(...cols1)
                    // findProps.attributes = findProps.attributes.concat(cols1)
                }
            }

            if (qry?.fltr) {
                const fltr1 = Object.fromEntries(
                    Object.entries(qry.fltr).filter(([key]) => columns.includes(key)),
                )
                Object.assign(findProps.where, applyFilters(fltr1))

                // Filtros de relaciones ($Relacion.Campo$)
                Object.entries(qry.fltr)
                    .filter(([k]) => Object.keys(include1).some((pref) => k.startsWith(pref)))
                    .forEach(([k, v]) =>
                        Object.assign(findProps.where, applyFilters({ [`$${k}$`]: v })),
                    )
            }

            if (qry?.sqls || qry?.grop) {
                findProps.subQuery = false
            }

            if (qry?.grop) {
                findProps.group = qry.grop
            }

            if (qry?.ordr) {
                findProps.order = qry.ordr
            }

            if (qry?.limt) findProps.limit = qry.limt

            if (qry?.page) {
                const pageSize = findProps.limit ?? 100
                findProps.limit = pageSize
                findProps.offset = pageSize * (qry.page - 1)

                let { count, rows } = await this.model.findAndCountAll(findProps)

                if (Array.isArray(count)) {
                    count = count.length
                }

                const meta = {
                    per_page: pageSize,
                    current_page: qry.page,
                    last_page: Math.ceil(count / pageSize),
                    total_records: count,
                }

                return { data: rows.map((a) => a.toJSON()), meta }
            } else {
                const data = await this.model.findAll(findProps)

                if (tojson) {
                    return data.map((a) => a.toJSON())
                } else {
                    return data
                }
            }
        }
    }

    async existe(where, res, ms) {
        if (where.id) {
            where.id = { [Op.not]: where.id }
        }

        const result = await this.model.findAll({ where, attributes: ['id'] })

        if (result.length > 0) {
            res.json({ code: 1, msg: ms ? ms : 'El nombre ya existe' })
            return true
        }
    }

    async create(data, transaction) {
        return await this.model.create(data, { transaction })
    }

    async update(where, data, transaction) {
        const [affectedRows] = await this.model.update(data, { where, transaction })

        if (affectedRows == 0) {
            // if (res) res.json({ code: 1, msg: 'No se actualizó ningún registro' })
            return false
        } else {
            return true
        }
    }

    async delete(where, transaction) {
        const deletedCount = await this.model.destroy({ where, transaction })
        // console.log('Cantidad de eliminados', deletedCount)
        if (deletedCount == 0) {
            // res.json({ code: 1, msg: 'No se eliminó ningún registro' })
            return false
        } else {
            return true
        }
    }

    async createBulk(data, transaction) {
        await this.model.bulkCreate(data, { transaction })
    }

    async syncHasMany(props, transaction) {
        const { model, foreignKey, parentId, newData, empresa, colaborador } = props

        const modelRel = models[model]

        //--- 0. Obtener campos para update automáticamente ---
        const fields = Object.keys(modelRel.getAttributes())

        // 1️⃣ Obtener registros actualmente en la BD para este padre
        const currentRows = await modelRel.findAll({
            where: { [foreignKey]: parentId },
            attributes: ['id'],
            transaction,
        })
        const currentIds = currentRows.map((r) => r.id)

        // 2️⃣ Clasificar datos entrantes: Update vs Create
        const toUpdate = []
        const toCreate = []
        const incomingMatchedIds = []

        newData.forEach((item) => {
            if (item.id && currentIds.includes(item.id)) {
                //--- UPDATE: Solo inyectamos updatedBy ---
                if (colaborador) item.updatedBy = colaborador
                toUpdate.push(item)
                incomingMatchedIds.push(item.id)
            } else {
                //--- CREATE: Inyectamos todo ---
                const newItem = { ...item, [foreignKey]: parentId }
                if (empresa) newItem.empresa = empresa
                if (colaborador) newItem.createdBy = colaborador
                if (colaborador) newItem.updatedBy = colaborador
                toCreate.push(newItem)
            }
        })

        // 3️⃣ Identificar registros a eliminar (Están en BD pero no llegaron en newData)
        const toDelete = currentIds.filter((id) => !incomingMatchedIds.includes(id))

        // 4️⃣ Operaciones en BD
        if (toDelete.length > 0) {
            await modelRel.destroy({
                where: { id: { [Op.in]: toDelete } },
                transaction,
            })
        }

        if (toUpdate.length > 0) {
            // Usamos bulkCreate con updateOnDuplicate para eficiencia
            await modelRel.bulkCreate(toUpdate, {
                updateOnDuplicate: fields,
                transaction,
            })
        }

        if (toCreate.length > 0) {
            await modelRel.bulkCreate(toCreate, { transaction })
        }

        return {
            created: toCreate.length,
            updated: toUpdate.length,
            deleted: toDelete.length,
        }
    }

    getDiff(original, updated) {
        const attributes = this.model.getAttributes()
        const diff = {}
        let changed = false
        Object.keys(attributes).forEach((f) => {
            //--- Omitir campo ID y campos de sistema
            if (['id', 'createdAt', 'updatedAt', 'deletedAt'].includes(f)) return
            //--- Omitir campos VIRTUALES (los que terminan en 1 en tu sistema)
            if (attributes[f].type.constructor.name === 'VIRTUAL') return
            const v1 = original[f] ?? null
            const v2 = updated[f] ?? null
            //--- Comparación inteligente (especial para objetos/JSON)
            const isObject = typeof v1 === 'object' && v1 !== null
            const isDifferent = isObject ? JSON.stringify(v1) !== JSON.stringify(v2) : v1 !== v2
            if (isDifferent) {
                diff[f] = updated[f]
                changed = true
            }
        })

        return changed ? diff : null
    }
}

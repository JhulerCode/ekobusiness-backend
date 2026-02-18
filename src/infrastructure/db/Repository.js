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
import { DerechoArco } from '#db/models/DerechoArco.js'
import { Documento } from '#db/models/Documento.js'
import { FormatoValue } from '#db/models/FormatoValue.js'
import { Inspeccion } from '#db/models/Inspeccion.js'
import { Kardex } from '#db/models/Kardex.js'
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
import { Ubigeo } from '#db/models/Ubigeo.js'

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
    DerechoArco,
    Documento,
    FormatoValue,
    Inspeccion,
    Kardex,
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
    Ubigeo,
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
    colaborador1: {
        model: Colaborador,
        as: 'colaborador1',
        attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos'],
    },
    createdBy1: {
        model: Colaborador,
        as: 'createdBy1',
        attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos'],
    },
    caja_movimientos: {
        model: CajaMovimiento,
        as: 'caja_movimientos',
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
        attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos', 'produccion_codigo'],
    },
    socio1: {
        model: Socio,
        as: 'socio1',
        attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos'],
    },
    socio_pedido1: {
        model: SocioPedido,
        as: 'socio_pedido1',
        attributes: ['id', 'fecha', 'socio', 'codigo'],
    },
    socio_pedido_items: {
        model: SocioPedidoItem,
        as: 'socio_pedido_items',
    },
    transaccion1: {
        model: Transaccion,
        as: 'transaccion1',
        attributes: ['id', 'fecha', 'socio', 'guia', 'factura'],
        required: false,
    },
    transaccion_items: {
        model: TransaccionItem,
        as: 'transaccion_items',
    },
}

const sqls1 = {
    // lote_padre_movimientos_cantidad1: [
    //     Sequelize.literal(`(
    //         SELECT SUM(
    //             CASE ${sistemaData.kardex_operaciones.map(t => `WHEN lote_padre_items.tipo = ${t.id} THEN lote_padre_items.cantidad * ${t.operacion}`).join(' ')}
    //             ELSE 0 END
    //         )
    //         FROM kardexes AS lote_padre_items
    //         WHERE lote_padre_items.lote_padre = kardexes.id
    //     )`),
    //     'movimientos'
    // ],

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
            where: {},
            order: [['createdAt', 'DESC']],
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

        if (qry?.cols) {
            if (qry.cols.exclude) {
                findProps.attributes = { exclude: qry.cols.exclude }
            } else {
                const cols1 = qry.cols.filter((a) => columns.includes(a))
                findProps.attributes.push(...cols1)
                // findProps.attributes = findProps.attributes.concat(cols1)
            }
        }

        if (qry?.sqls) {
            for (const a of qry.sqls) {
                findProps.attributes.push(sqls1[a])
            }
        }

        if (qry?.fltr) {
            const fltr1 = Object.fromEntries(
                Object.entries(qry.fltr).filter(([key]) => columns.includes(key)),
            )
            Object.assign(findProps.where, applyFilters(fltr1))

            // Filtros de relaciones
            Object.entries(qry.fltr)
                .filter(([k]) => Object.keys(include1).some((pref) => k.startsWith(pref)))
                .forEach(([k, v]) =>
                    Object.assign(findProps.where, applyFilters({ [`$${k}$`]: v })),
                )
        }

        if (qry?.grop) {
            findProps.group = qry.grop
        }

        if (qry?.ordr) {
            findProps.order = qry.ordr
        }

        if (qry?.id) {
            delete findProps.attributes
            const data = await this.model.findByPk(qry.id, findProps)

            if (tojson) {
                return data.toJSON()
            } else {
                return data
            }
        } else {
            const data = await this.model.findAll(findProps)

            if (tojson) {
                return data.map((a) => a.toJSON())
            } else {
                return data
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
        const { model, foreignKey, parentId, newData, updateFields } = props

        const modelRel = models[model]

        // 1️⃣ Obtener ids entrantes (solo los que ya existen)
        const incomingIds = newData.filter((a) => a.id).map((a) => a.id)

        // 2️⃣ DELETE
        if (incomingIds.length > 0) {
            await modelRel.destroy({
                where: {
                    [foreignKey]: parentId,
                    id: {
                        [Op.notIn]: incomingIds,
                    },
                },
                transaction,
            })
        } else {
            // Si no viene ningún id existente → borrar todo
            await modelRel.destroy({
                where: { [foreignKey]: parentId },
                transaction,
            })
        }

        // 3️⃣ Preparar datos para UPSERT
        const rows = newData.map((item) => ({
            ...item,
            [foreignKey]: parentId,
        }))

        if (rows.length > 0) {
            await modelRel.bulkCreate(rows, {
                updateOnDuplicate: updateFields,
                transaction,
            })
        }
    }
}

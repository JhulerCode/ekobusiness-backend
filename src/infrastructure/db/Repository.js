import { Op, Sequelize } from 'sequelize'
import { Empresa } from '#db/models/Empresa.js'
import { ActivityLog } from '#db/models/ActivityLog.js'
import { Articulo } from '#db/models/Articulo.js'
import { ArticuloCategoria } from '#db/models/ArticuloCategoria.js'
import { ArticuloLinea } from '#db/models/ArticuloLinea.js'
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
import { PrecioLista } from '#db/models/PrecioLista.js'
import { PrecioListaItem } from '#db/models/PrecioListaItem.js'
import { ProduccionOrden } from '#db/models/ProduccionOrden.js'
import { RecetaInsumo } from '#db/models/RecetaInsumo.js'
import { Socio } from '#db/models/Socio.js'
import { SocioPedido } from '#db/models/SocioPedido.js'
import { TipoCambio } from '#db/models/TipoCambio.js'
import { Transaccion } from '#db/models/Transaccion.js'
import { Ubigeo } from '#db/models/Ubigeo.js'

import { applyFilters } from '#db/helpers.js'
import cSistema from "#core/_sistema/cSistema.js"

const include1 = {
    produccion_tipo1: {
        model: ArticuloLinea,
        as: 'produccion_tipo1',
        attributes: ['id', 'nombre']
    },
    categoria1: {
        model: ArticuloCategoria,
        as: 'categoria1',
        attributes: ['id', 'nombre']
    },
    articulo1: {
        model: Articulo,
        as: 'articulo1',
        attributes: ['id', 'nombre', 'unidad'],
    },
    colaborador1: {
        model: Colaborador,
        as: 'colaborador1',
        attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos']
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
        attributes: ['id', 'moneda', 'tipo_cambio', 'igv_afectacion', 'igv_porcentaje', 'pu', 'fv', 'lote', 'stock'],
        required: false
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
                model: ArticuloLinea,
                as: 'tipo1',
                attributes: ['id', 'nombre'],
            }
        ],
        required: false,
    },
    socio1: {
        model: Socio,
        as: 'socio1',
        attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos']
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
}

const sqls1 = {
    lote_padre_movimientos_cantidad1: [
        Sequelize.literal(`(
            SELECT SUM(
                CASE ${cSistema.sistemaData.transaccion_tipos.map(t => `WHEN lote_padre_items.tipo = ${t.id} THEN lote_padre_items.cantidad * ${t.operacion}`).join(' ')}
                ELSE 0 END
            )
            FROM kardexes AS lote_padre_items
            WHERE lote_padre_items.lote_padre = kardexes.id
        )`),
        'movimientos'
    ],
    lote_padre_movimientos_cantidad: [
        Sequelize.fn('COALESCE',
            Sequelize.fn('SUM',
                Sequelize.literal(`
                    CASE ${cSistema.sistemaData.transaccion_tipos.map(t => `WHEN lote_padre_items.tipo = ${t.id} THEN lote_padre_items.cantidad * ${t.operacion}`).join(' ')}
                    ELSE 0 END
                `)
            ), 0
        ),
        'movimientos_cantidad'
    ],
    articulo_movimientos_cantidad: [
        Sequelize.fn('COALESCE',
            Sequelize.fn('SUM',
                Sequelize.literal(`
                    CASE ${cSistema.sistemaData.transaccion_tipos.map(t => `WHEN kardexes.tipo = ${t.id} THEN kardexes.cantidad * ${t.operacion}`).join(' ')}
                    ELSE 0 END
                `)
            ), 0
        ),
        'cantidad'
    ],
}

export const models = {
    Empresa,
    ActivityLog,
    Articulo,
    ArticuloCategoria,
    ArticuloLinea,
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
    PrecioLista,
    PrecioListaItem,
    ProduccionOrden,
    RecetaInsumo,
    Socio,
    SocioPedido,
    TipoCambio,
    Transaccion,
    Ubigeo,
}

export class Repository {
    constructor(modelId) {
        this.model = models[modelId]
    }

    async find(qry, tojson = false) {
        const columns = Object.keys(this.model.getAttributes());

        const findProps = {
            include: [],
            attributes: ['id'],
            where: {},
            order: [['createdAt', 'DESC']],
        }

        if (qry?.incl) {
            for (const a of qry.incl) {
                if (qry.incl.includes(a)) findProps.include.push(include1[a])
            }
        }

        if (qry?.cols) {
            const cols1 = qry.cols.filter(a => columns.includes(a))
            findProps.attributes = findProps.attributes.concat(cols1)
        }

        if (qry?.sqls) {
            for (const a of qry.sqls) {
                if (qry.sqls.includes(a)) findProps.attributes.push(sqls1[a])
            }
        }

        if (qry?.fltr) {
            const fltr1 = Object.fromEntries(
                Object.entries(qry.fltr).filter(([key]) => columns.includes(key))
            )
            Object.assign(findProps.where, applyFilters(fltr1))

            // Filtros de relaciones
            Object.entries(qry.fltr)
                .filter(([k]) => Object.keys(include1).some(pref => k.startsWith(pref)))
                .forEach(([k, v]) =>
                    Object.assign(findProps.where, applyFilters({ [`$${k}$`]: v }))
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
            }
            else {
                return data
            }
        }
        else {
            const data = await this.model.findAll(findProps)

            if (tojson) {
                return data.map(a => a.toJSON())
            }
            else {
                return data
            }
        }
    }

    async existe(where, res, ms) {
        if (where.id) {
            where.id = { [Op.not]: where.id }
        }

        const result = await this.model.findAll({ where })

        if (result.length > 0) {
            res.json({ code: 1, msg: ms ? ms : 'El nombre ya existe' })
            return true
        }
    }

    async create(data, transaction) {
        return await this.model.create(data, { transaction })
    }

    async update(id, data, transaction) {
        const [affectedRows] = await this.model.update(data, { where: { id }, transaction })

        if (affectedRows == 0) {
            res.json({ code: 1, msg: 'No se actualizó ningún registro' })
            return false
        }
        else {
            return true
        }
    }

    async delete(id, transaction) {
        const deletedCount = await this.model.destroy({ where: { id }, transaction })
        // console.log('ELIMINADOS', deletedCount)
        if (deletedCount == 0) {
            res.json({ code: 1, msg: 'No se eliminó ningún registro' })
            return false
        }
        else {
            return true
        }
    }

    async createBulk(data) {
        await this.model.bulkCreate(data)
    }
}
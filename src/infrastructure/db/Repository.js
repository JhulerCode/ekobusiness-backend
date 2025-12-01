import { ArticuloCategoria } from "#db/models/ArticuloCategoria.js"
import { Transaccion } from "#db/models/Transaccion.js"
import { Socio } from "#db/models/Socio.js"
import { Maquina } from "#db/models/Maquina.js"
import { ProduccionOrden } from "#db/models/ProduccionOrden.js"
import { ArticuloLinea } from "#db/models/ArticuloLinea.js"
import { Articulo } from "#db/models/Articulo.js"
import { jdFindAll } from '#db/helpers.js'
import { applyFilters } from '#db/helpers.js'
import { Op } from 'sequelize'

const include1 = {
    lote_padre1: {
        model: ArticuloCategoria,
        as: 'lote_padre1',
        attributes: ['moneda', 'tipo_cambio', 'igv_afectacion', 'igv_porcentaje', 'pu', 'fv', 'lote', 'stock'],
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
                model: ArticuloLinea,
                as: 'tipo1',
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

export const models = {
    ArticuloCategoria,
    Transaccion,
    Socio,
    Maquina,
    ProduccionOrden,
    ArticuloLinea,
    Articulo,
}

export class Repository {
    constructor(modelId) {
        this.model = models[modelId]
    }

    async find(qry, tojson) {
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

    async create(data) {
        return await this.model.create(data)
    }

    async update(id, data) {
        const [affectedRows] = await this.model.update(data, { where: { id } })

        if (affectedRows == 0) {
            res.json({ code: 1, msg: 'No se actualizó ningún registro' })
            return false
        }
        else {
            return true
        }
    }

    async delete(id) {
        const deletedCount = await this.model.destroy({ where: { id } })
        // console.log('ELIMINADOS', deletedCount)
        if (deletedCount == 0) {
            res.json({ code: 1, msg: 'No se eliminó ningún registro' })
            return false
        }
        else {
            return true
        }
    }
}
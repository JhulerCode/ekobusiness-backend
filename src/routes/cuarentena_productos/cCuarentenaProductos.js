import { ProduccionOrden } from '../../database/models/ProduccionOrden.js'
import { CuarentenaProducto } from '../../database/models/CuarentenaProducto.js'
import { Articulo } from '../../database/models/Articulo.js'
import { Maquina } from '../../database/models/Maquina.js'
import { applyFilters } from '../../utils/mine.js'
import cSistema from '../_sistema/cSistema.js'

const create = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { lote, fv, cantidad, estado, produccion_orden } = req.body

        const nuevo = await CuarentenaProducto.create({
            lote, fv, cantidad, estado, produccion_orden,
            createdBy: colaborador
        })

        const data = await loadOne(nuevo.id)
        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params
        const { lote, fv, cantidad, estado, produccion_orden } = req.body

        await CuarentenaProducto.update({
            lote, fv, cantidad, estado, produccion_orden,
            updatedBy: colaborador
        }, { where: { id } })

        const data = await loadOne(id)
        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

async function loadOne(id) {
    let data = await CuarentenaProducto.findByPk(id)

    if (data) {
        data = data.toJSON()

        const cuarentena_productos_estadosMap = cSistema.arrayMap('cuarentena_productos_estados')

        data.estado1 = cuarentena_productos_estadosMap[data.estado]
    }

    return data
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id', 'cf_liberacion_lote'],
            where: {},
            include: [
                {
                    model: ProduccionOrden,
                    as: 'produccion_orden1',
                    attributes: ['id', 'tipo', 'maquina', 'fecha', 'articulo'],
                    where: {},
                    include: [
                        {
                            model: Articulo,
                            as: 'articulo1',
                            attributes: ['nombre', 'unidad'],
                        },
                        {
                            model: Maquina,
                            as: 'maquina1',
                            attributes: ['nombre'],
                        },
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        }

        if (qry) {
            if (qry.cols) {
                const columns = Object.keys(Articulo.getAttributes())
                const cols1 = cols.filter(a => columns.includes(a))
                findProps.attributes = findProps.attributes.concat(cols1)
            }

            if (qry.fltr) {
                const fltr_produccionOrden = {}
                if (qry.fltr.produccionOrden_fecha) fltr_produccionOrden.fecha = qry.fltr.produccionOrden_fecha
                if (qry.fltr.produccionOrden_tipo) fltr_produccionOrden.tipo = qry.fltr.produccionOrden_tipo
                if (qry.fltr.produccionOrden_maquina) fltr_produccionOrden.maquina = qry.fltr.produccionOrden_maquina
                if (qry.fltr.produccionOrden_articulo) fltr_produccionOrden.articulo = qry.fltr.produccionOrden_articulo
                Object.assign(findProps.include[0].where, applyFilters(fltr_produccionOrden))

                delete qry.fltr.produccionOrden_fecha
                delete qry.fltr.produccionOrden_tipo
                delete qry.fltr.produccionOrden_maquina
                delete qry.fltr.produccionOrden_articulo
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }
        }

        let data = await CuarentenaProducto.findAll(findProps)

        if (data.length > 0) {
            data = data.map(a => a.toJSON())

            const produccion_tiposMap = cSistema.arrayMap('produccion_tipos')
            const cuarentena_productos_estadosMap = cSistema.arrayMap('cuarentena_productos_estados')

            for (const a of data) {
                if (a.produccion_orden1) {
                    a.produccion_orden1.tipo1 = produccion_tiposMap[a.produccion_orden1.tipo]
                }

                a.estado1 = cuarentena_productos_estadosMap[a.estado]
            }
        }

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

// const findById = async (req, res) => {
//     try {
//         const { id } = req.params

//         const findProps = {}

//         const data = await CuarentenaProducto.findByPk(id, findProps)

//         res.json({ code: 0, data })
//     }
//     catch (error) {
//         res.status(500).json({ code: -1, msg: error.message, error })
//     }
// }

const delet = async (req, res) => {
    try {
        const { id } = req.params

        const deletedCount = await CuarentenaProducto.destroy({ where: { id } })

        const send = deletedCount > 0 ? { code: 0 } : { code: 1, msg: 'No se eliminó ningun registro' }

        res.json(send)
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    create,
    update,
    find,
    // findById,
    delet
}
import { ProduccionOrden } from '#db/models/ProduccionOrden.js'
import { Articulo } from '#db/models/Articulo.js'
import { Maquina } from '#db/models/Maquina.js'
import { applyFilters, setFindAllProps } from '#shared/mine.js'
import cSistema from '../_sistema/cSistema.js'
import { Kardex } from '#db/models/Kardex.js'
import { ArticuloLinea } from '#db/models/ArticuloLinea.js'
import { Sequelize } from 'sequelize'

const includes = {
    articulo1: {
        model: Articulo,
        as: 'articulo1',
        attributes: ['nombre', 'unidad'],
    },
    maquina1: {
        model: Maquina,
        as: 'maquina1',
        attributes: ['nombre', 'produccion_tipo'],
    },
}

const create = async (req, res) => {
    try {
        const { colaborador } = req.user
        const {
            fecha, tipo, orden, maquina, maquina_info,
            articulo, articulo_info, cantidad, estado,
        } = req.body

        // ----- CREAR ----- //
        const nuevo = await ProduccionOrden.create({
            fecha, tipo, orden, maquina, maquina_info,
            articulo, articulo_info, cantidad, estado,
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
        const {
            fecha, tipo, orden, maquina, maquina_info,
            articulo, articulo_info, cantidad, estado,
        } = req.body

        // ----- ACTUALIZAR ----- //
        const [affectedRows] = await ProduccionOrden.update(
            {
                fecha, tipo, orden, maquina, maquina_info,
                articulo, articulo_info, cantidad, estado,
                updatedBy: colaborador
            },
            { where: { id } }
        )

        if (affectedRows > 0) {
            const data = await loadOne(id)

            res.json({ code: 0, data })
        }
        else {
            res.json({ code: 1, msg: 'No se actualizó ningún registro' })
        }
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

async function loadOne(id) {
    let data = await ProduccionOrden.findByPk(id, {
        include: [includes.articulo1, includes.maquina1]
    })

    if (data) {
        data = data.toJSON()

        const produccion_orden_estadosMap = cSistema.arrayMap('produccion_orden_estados')

        data.estado1 = produccion_orden_estadosMap[data.estado]
    }

    return data
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const include1 = {
            articulo1: {
                model: Articulo,
                as: 'articulo1',
                attributes: ['id', 'nombre', 'unidad'],
                where: {},
            },
            maquina1: {
                model: Maquina,
                as: 'maquina1',
                attributes: ['id', 'nombre'],
                where: {},
            },
            tipo1: {
                model: ArticuloLinea,
                as: 'tipo1',
                attributes: ['id', 'nombre'],
                where: {},
            },
        }

        const sqls1 = {
            productos_terminados: [
                Sequelize.literal(`(
                    SELECT COALESCE(SUM(k.cantidad), 0)
                    FROM kardexes AS k
                    WHERE k.produccion_orden = produccion_ordenes.id AND k.tipo = 4
                )`),
                'productos_terminados'
            ]
        }

        const findProps = setFindAllProps(ProduccionOrden, qry, include1, sqls1)

        let data = await ProduccionOrden.findAll(findProps)

        if (data.length > 0) {
            data = data.map(a => a.toJSON())

            const produccion_orden_estadosMap = cSistema.arrayMap('produccion_orden_estados')
            const cumplidado_estadosMap = cSistema.arrayMap('cumplidado_estados')

            for (const a of data) {
                if (qry.cols.includes('estado')) a.estado1 = produccion_orden_estadosMap[a.estado]
                if (a.estado_calidad_revisado) a.estado_calidad_revisado1 = cumplidado_estadosMap[a.estado_calidad_revisado]
                if (a.estado_cf_ppc) a.estado_cf_ppc1 = cumplidado_estadosMap[a.estado_cf_ppc]
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

        const data = await ProduccionOrden.findByPk(id, {
            include: [includes.maquina1, includes.articulo1]
        })

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params

        // ----- ELIMINAR ----- //
        const deletedCount = await ProduccionOrden.destroy({ where: { id } })

        const send = deletedCount > 0 ? { code: 0 } : { code: 1, msg: 'No se eliminó ningún registro' }

        res.json(send)
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
        await ProduccionOrden.update(
            {
                estado: 2,
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

const findTrazabilidad = async (req, res) => {
    try {
        const { id } = req.params

        let data = await ProduccionOrden.findByPk(id, {
            include: [
                {
                    model: Articulo,
                    as: 'articulo1',
                    attributes: ['nombre', 'unidad'],
                    where: {},
                },
                {
                    model: Maquina,
                    as: 'maquina1',
                    attributes: ['nombre', 'produccion_tipo'],
                },
                {
                    model: Kardex,
                    as: 'kardexes',
                    include: [
                        {
                            model: Kardex,
                            as: 'lote_padre1',
                            attributes: ['moneda', 'tipo_cambio', 'pu', 'igv_afectacion', 'igv_porcentaje', 'fv', 'lote'],
                        },
                        {
                            model: Articulo,
                            as: 'articulo1',
                            attributes: ['nombre', 'unidad'],
                        }
                    ]
                },
            ]
        })

        if (data) {
            data = data.toJSON()

            const insumosMap = {}
            data.productos_terminados = []

            for (const a of data.transaccion_items) {
                if (a.tipo == 2 || a.tipo == 3) {
                    const key = a.articulo + '-' + a.lote_padre

                    if (!insumosMap[key]) {
                        insumosMap[key] = { ...a, cantidad: 0 };
                    }
                    if (a.tipo == 2) {
                        insumosMap[key].cantidad += a.cantidad;
                    } else if (a.tipo == 3) {
                        insumosMap[key].cantidad -= a.cantidad;
                    }
                }

                if (a.tipo == 4) {
                    data.productos_terminados.push(a)
                }
            }

            data.insumos = Object.values(insumosMap)
            delete data.transaccion_items
        }

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    find,
    findById,
    create,
    update,
    delet,
    terminar,
    findTrazabilidad
}
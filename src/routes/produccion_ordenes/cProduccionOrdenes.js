import { ProduccionOrden } from '../../database/models/ProduccionOrden.js'
import { Articulo } from '../../database/models/Articulo.js'
import { Maquina } from '../../database/models/Maquina.js'
import { applyFilters } from '../../utils/mine.js'
import cSistema from '../_sistema/cSistema.js'
import { Kardex } from '../../database/models/Kardex.js'

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

        const findProps = {
            include: [],
            attributes: ['id', 'calidad_revisado', 'cf_ppc'],
            where: {},
            order: [['fecha', 'DESC'], ['maquina', 'ASC'], ['orden', 'ASC']],
        }

        const include1 = {
            articulo1: {
                model: Articulo,
                as: 'articulo1',
                attributes: ['nombre', 'unidad'],
                where: {},
            },
            maquina1: {
                model: Maquina,
                as: 'maquina1',
                attributes: ['nombre', 'produccion_tipo'],
            },
            kardexes: {
                model: Kardex,
                as: 'kardexes',
                attributes: ['tipo', 'cantidad'],
                where: {
                    tipo: 4
                },
                required: false,
            }
        }

        if (qry) {
            if (qry.incl) {
                for (const a of qry.incl) {
                    if (qry.incl.includes(a)) findProps.include.push(include1[a])
                }
            }

            if (qry.cols) {
                const columns = Object.keys(ProduccionOrden.getAttributes());
                const cols1 = qry.cols.filter(a => columns.includes(a))
                findProps.attributes = findProps.attributes.concat(cols1)
            }

            if (qry.fltr) {
                const fltr1 = JSON.parse(JSON.stringify(qry.fltr))
                delete qry.fltr.articulo
                Object.assign(findProps.where, applyFilters(qry.fltr))

                if (fltr1.articulo) {
                    Object.assign(findProps.include[0].where, applyFilters({ nombre: fltr1.articulo }))
                }
            }
        }

        let data = await ProduccionOrden.findAll(findProps)

        if (data.length > 0) {
            data = data.map(a => a.toJSON())

            const produccion_tiposMap = cSistema.arrayMap('produccion_tipos')
            const produccion_orden_estadosMap = cSistema.arrayMap('produccion_orden_estados')
            const cumplidado_estadosMap = cSistema.arrayMap('cumplidado_estados')

            for (const a of data) {
                if (qry.cols.includes('tipo')) a.tipo1 = produccion_tiposMap[a.tipo]
                if (qry.cols.includes('estado')) a.estado1 = produccion_orden_estadosMap[a.estado]
                if (a.estado_calidad_revisado) a.estado_calidad_revisado1 = cumplidado_estadosMap[a.estado_calidad_revisado]
                if (a.estado_cf_ppc) a.estado_cf_ppc1 = cumplidado_estadosMap[a.estado_cf_ppc]

                a.productos_terminados = 0

                if (a.transaccion_items) {
                    for (const b of a.transaccion_items) {
                        a.productos_terminados += b.cantidad
                    }
                }
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
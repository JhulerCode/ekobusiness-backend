import sequelize from '../../database/sequelize.js'
import { ProduccionOrden } from '../../database/models/ProduccionOrden.js'
import { Articulo } from '../../database/models/Articulo.js'
import { Maquina } from '../../database/models/Maquina.js'
import { applyFilters } from '../../utils/mine.js'
import cSistema from '../_sistema/cSistema.js'

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

        //----- CREAR ----- //
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

        //----- ACTUALIZAR ----- //
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
            attributes: ['id', 'fecha', 'calidad_revisado'],
            order: [['fecha', 'ASC'], ['maquina', 'ASC'], ['orden', 'ASC']],
            where: {},
            include: [
                {
                    model: Articulo,
                    as: 'articulo1',
                    attributes: ['nombre', 'unidad'],
                    where: {},
                },
                includes.maquina1
            ]
        }

        if (qry) {
            if (qry.fltr) {
                const newfltr = JSON.parse(JSON.stringify(qry.fltr))
                delete qry.fltr.articulo
                Object.assign(findProps.where, applyFilters(qry.fltr))

                if (newfltr.articulo) {
                    Object.assign(findProps.include[0].where, applyFilters({ nombre: newfltr.articulo }))
                }
            }

            if (qry.cols) {
                findProps.attributes = findProps.attributes.concat(qry.cols)
            }

            if (qry.incl) {
                for (const a of qry.incl) {
                    if (qry.incl.includes(a)) findProps.include.push(includes[a])
                }
            }
        }

        let data = await ProduccionOrden.findAll(findProps)

        if (data.length > 0 && qry.cols) {
            data = data.map(a => a.toJSON())

            const produccion_tiposMap = cSistema.arrayMap('produccion_tipos')
            const produccion_orden_estadosMap = cSistema.arrayMap('produccion_orden_estados')

            for (const a of data) {
                if (qry.cols.includes('tipo')) a.tipo1 = produccion_tiposMap[a.tipo]
                if (qry.cols.includes('estado')) a.estado1 = produccion_orden_estadosMap[a.estado]
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
            include: [includes.maquina1]
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

        //----- ELIMINAR ----- //
        const deletedCount = await ProduccionOrden.destroy({ where: { id } })

        const send = deletedCount > 0 ? { code: 0 } : { code: 1, msg: 'No se eliminó ningún registro' }

        res.json(send)
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
}
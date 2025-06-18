import { Op } from 'sequelize'
import sequelize from '../../database/sequelize.js'
import { RecetaInsumo } from '../../database/models/RecetaInsumo.js'
import { existe } from '../../utils/mine.js'
import { Articulo } from '../../database/models/Articulo.js'

const attributes = [
    'id', 'nombre', 'activo'
]

const find = async (req, res) => {
    try {
        const { id } = req.params

        const data = await RecetaInsumo.findAll({
            where: { articulo_principal: id },
            order: [['orden', 'ASC']],
            include: {
                model: Articulo,
                as: 'articulo1',
                attributes: ['nombre', 'unidad'],
            }
        })

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { articulo_principal, articulo, cantidad, orden } = req.body

        //----- CREAR ----- //
        const nuevo = await RecetaInsumo.create({
            articulo_principal, articulo, cantidad, orden,
            createdBy: colaborador
        })

        const data = await RecetaInsumo.findByPk(nuevo.id, {
            include: {
                model: Articulo,
                as: 'articulo1',
                attributes: ['nombre', 'unidad']
            }
        })

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
        const { articulo_principal, articulo, cantidad, orden } = req.body

        //----- ACTUALIZAR ----- //
        const [affectedRows] = await RecetaInsumo.update(
            {
                cantidad, orden,
                updatedBy: colaborador
            },
            { where: { id } }
        )

        if (affectedRows > 0) {
            res.json({ code: 0 })
        }
        else {
            res.json({ code: 1, msg: 'No se actualizó ningún registro' })
        }
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params

        //----- ELIMINAR ----- //
        const deletedCount = await RecetaInsumo.destroy({ where: { id } })

        const send = deletedCount > 0 ? { code: 0 } : { code: 1, msg: 'No se eliminó ningún registro' }

        res.json(send)
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    find,
    create,
    delet,
    update,
}
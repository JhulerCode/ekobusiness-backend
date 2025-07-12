import { Inspeccion } from '../../database/models/Inspeccion.js'
import { applyFilters } from '../../utils/mine.js'
import { Socio } from '../../database/models/Socio.js'

const create = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { fecha, socio, puntuacion, puntuacion_maxima, correcciones, documento } = req.body

        const nuevo = await Inspeccion.create({
            fecha, socio, puntuacion, puntuacion_maxima, correcciones,
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
        const { fecha, socio, puntuacion, puntuacion_maxima, correcciones, documento } = req.body

        //----- ACTUALIZAR ----- //
        const [affectedRows] = await Inspeccion.update(
            {
                fecha, socio, puntuacion, puntuacion_maxima, correcciones,
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
    let data = await Inspeccion.findByPk(id, {
        include: [
            {
                model: Socio,
                as: 'socio1',
                attributes: ['nombres']
            },
        ]
    })

    return data
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id', 'fecha', 'socio', 'puntuacion', 'puntuacion_maxima', 'correcciones', 'documento'],
            order: [['fecha', 'DESC']],
            where: {},
            include: [
                {
                    model: Socio,
                    as: 'socio1',
                    attributes: ['nombres']
                },
            ]
        }

        if (qry) {
            if (qry.fltr) {
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }
        }

        let data = await Inspeccion.findAll(findProps)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params

        const data = await Inspeccion.findByPk(id, {
            include: [
                {
                    model: Socio,
                    as: 'socio1',
                    attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos']
                },
            ]
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

        const deletedCount = await Inspeccion.destroy({ where: { id } })

        const send = deletedCount > 0 ? { code: 0 } : { code: 1, msg: 'No se eliminó ningún registro' }

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
    findById,
    delet,
}
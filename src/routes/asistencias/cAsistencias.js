import { Asistencia } from '../../database/models/Asistencia.js'
import { Colaborador } from '../../database/models/Colaborador.js'
import { applyFilters } from '../../utils/mine.js'

const include1 = {
    colaborador1: {
        model: Colaborador,
        as: 'colaborador1',
        attributes: ['nombres', 'apellidos', 'nombres_apellidos']
    }
}

const create = async (req, res) => {
    try {
        const { colaborador, fecha_entrada, fecha_salida, hora_entrada, hora_salida } = req.body

        // ----- CREAR ----- //
        const nuevo = await Asistencia.create({
            colaborador, fecha_entrada, fecha_salida, hora_entrada, hora_salida,
            createdBy: req.user.colaborador
        })

        const data = await loadOne(nuevo.id)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

async function loadOne(id) {
    let data = await Asistencia.findByPk(id, { include: [include1.colaborador1] })

    // if (data) {
    //     data = data.toJSON()

    //     const estadosMap = cSistema.arrayMap('caja_apertura_estados')

    //     data.estado1 = estadosMap[data.estado]
    // }

    return data
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            include: [],
            attributes: ['id'],
            where: {},
            order: [['createdAt', 'DESC']],
        }

        if (qry) {
            if (qry.incl) {
                for (const a of qry.incl) {
                    if (qry.incl.includes(a)) findProps.include.push(include1[a])
                }
            }

            if (qry.cols) {
                findProps.attributes = findProps.attributes.concat(qry.cols)
            }

            if (qry.fltr) {
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }
        }

        const data = await Asistencia.findAll(findProps)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params

        const data = await Asistencia.findByPk(id)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params
        const {
            colaborador, fecha_entrada, fecha_salida, hora_entrada, hora_salida
        } = req.body

        // ----- ACTUALIZAR -----//
        const [affectedRows] = await Asistencia.update(
            {
                colaborador, fecha_entrada, fecha_salida, hora_entrada, hora_salida,
                updatedBy: req.user.colaborador
            },
            {
                where: { id },
            }
        )

        if (affectedRows > 0) {
            // ----- DEVOLVER ----- //
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

const delet = async (req, res) => {
    try {
        const { id } = req.params

        const deletedCount = await Asistencia.destroy({ where: { id } })

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
    findById,
    update,
    delet,
}
import { Repository } from '#db/Repository.js'
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'
import { formatDate } from '#shared/dayjs.js'

const repository = new Repository('Asistencia')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const response = await repository.find(qry, true)

        const hasPage = qry?.page
        const data = hasPage ? response.data : response
        const meta = hasPage ? response.meta : null

        for (const a of data) {
            if (qry?.cols.includes('fecha_entrada'))
                a.fecha_entrada_format = formatDate(a.fecha_entrada, req.user.format_date)
            if (qry?.cols.includes('fecha_salida'))
                a.fecha_salida_format = formatDate(a.fecha_salida, req.user.format_date)
        }

        res.json({ code: 0, data, meta })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params

        const data = await repository.find({ id })

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    try {
        const { empresa } = req.user
        const { colaborador, fecha_entrada, fecha_salida, hora_entrada, hora_salida } = req.body

        // ----- CREAR ----- //
        const nuevo = await repository.create({
            colaborador,
            fecha_entrada,
            fecha_salida,
            hora_entrada,
            hora_salida,
            empresa,
            createdBy: req.user.colaborador,
        })

        const data = await loadOne(nuevo.id)

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params
        const { colaborador, fecha_entrada, fecha_salida, hora_entrada, hora_salida } = req.body

        // ----- ACTUALIZAR -----//
        const updated = await repository.update(
            { id },
            {
                colaborador,
                fecha_entrada,
                fecha_salida,
                hora_entrada,
                hora_salida,
                updatedBy: req.user.colaborador,
            },
        )

        if (updated == false) return resUpdateFalse(res)

        const data = await loadOne(id)

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params

        if ((await repository.delete({ id })) == false) return resDeleteFalse(res)

        res.json({ code: 0 })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

//--- Helpers ---//
async function loadOne(id) {
    let data = await repository.find({ id, incl: ['colaborador1'] })

    return data
}

export default {
    find,
    create,
    findById,
    update,
    delet,
}

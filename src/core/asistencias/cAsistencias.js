import { Repository } from '#db/Repository.js'

const repository = new Repository('Asistencia')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const data = await repository.find(qry)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params

        const data = await repository.find({ id })

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    try {
        const { empresa } = req.user
        const { colaborador, fecha_entrada, fecha_salida, hora_entrada, hora_salida } = req.body

        // ----- CREAR ----- //
        const nuevo = await repository.create({
            colaborador, fecha_entrada, fecha_salida, hora_entrada, hora_salida,
            empresa,
            createdBy: req.user.colaborador
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
        const { id } = req.params
        const { colaborador, fecha_entrada, fecha_salida, hora_entrada, hora_salida } = req.body

        // ----- ACTUALIZAR -----//
        const updated = await repository.update({ id }, {
            colaborador, fecha_entrada, fecha_salida, hora_entrada, hora_salida,
            updatedBy: req.user.colaborador
        })

        if (updated == false) return

        const data = await loadOne(id)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params

        if (await repository.delete({ id }) == false) return

        res.json({ code: 0 })
    }
    catch (error) {
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
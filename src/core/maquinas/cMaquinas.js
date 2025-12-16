import { Repository } from '#db/Repository.js'
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'

const repository = new Repository('Maquina')

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
        const { colaborador, empresa } = req.user
        const { tipo, codigo, nombre, fecha_compra, linea, velocidad, limpieza_tiempo } = req.body

        //--- VERIFY SI EXISTE NOMBRE ---//
        if (await repository.existe({ nombre, empresa }, res) == true) return

        //--- CREAR ---//
        const nuevo = await repository.create({
            tipo, codigo, nombre, fecha_compra, linea, velocidad, limpieza_tiempo,
            empresa,
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
        const { colaborador, empresa } = req.user
        const { id } = req.params
        const { tipo, codigo, nombre, fecha_compra, linea, velocidad, limpieza_tiempo } = req.body

        //--- VERIFY SI EXISTE NOMBRE ---//
        if (await repository.existe({ nombre, id, empresa }, res) == true) return

        //--- ACTUALIZAR ---//
        const updated = await repository.update({ id }, {
            tipo, codigo, nombre, fecha_compra, linea, velocidad, limpieza_tiempo,
            updatedBy: colaborador
        })

        if (updated == false) return resUpdateFalse(res)

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

        if (await repository.delete({ id }) == false) return resDeleteFalse(res)

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


//--- Helpers ---//
async function loadOne(id) {
    let data = await repository.find({ id, incl: ['linea1'] })

    return data
}

export default {
    find,
    findById,
    create,
    update,
    delet,
}
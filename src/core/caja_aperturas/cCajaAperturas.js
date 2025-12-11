import { Repository } from '#db/Repository.js'
import cSistema from "../_sistema/cSistema.js"
import dayjs from '#shared/dayjs.js'

const repository = new Repository('CajaApertura')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const data = await repository.find(qry, true)

        if (data.length > 0) {
            const estadosMap = cSistema.arrayMap('caja_apertura_estados')

            for (const a of data) {
                if (qry?.cols?.includes('estado')) a.estado1 = estadosMap[a.estado]
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
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const data = await repository.find({ id, ...qry })

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    try {
        const { colaborador, empresa } = req.user
        const { fecha_apertura, fecha_cierre, monto_apertura, monto_cierre, estado } = req.body

        // ----- CREAR ----- //
        const nuevo = await repository.create({
            fecha_apertura, monto_apertura, estado,
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

const delet = async (req, res) => {
    try {
        const { id } = req.params

        if (await repository.delete(id) == false) return

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const cerrar = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params

        // ----- ACTUALIZAR ----- //
        const updated = await repository.update(id, {
            fecha_cierre: dayjs(), estado: 2,
            updatedBy: colaborador
        })

        if (updated == false) return

        const data = await loadOne(id)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

//--- Helpers ---//
async function loadOne(id) {
    let data = await repository.find({ id }, true)

    if (data) {
        const estadosMap = cSistema.arrayMap('caja_apertura_estados')

        data.estado1 = estadosMap[data.estado]
    }

    return data
}

export default {
    find,
    findById,
    create,
    delet,
    cerrar
}
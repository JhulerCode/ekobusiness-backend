import { Repository } from '#db/Repository.js'
import { resUpdateFalse } from '#http/helpers.js'

const repository = new Repository('Lote')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : {}

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const response = await repository.find(qry, true)

        const hasPage = qry?.page
        const data = hasPage ? response.data : response
        const meta = hasPage ? response.meta : null

        res.json({ code: 0, data, meta })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    try {
        const { empresa, colaborador } = req.user
        const data = { ...req.body, empresa, createdBy: colaborador }

        const nuevo = await repository.create(data)
        res.json({ code: 0, data: nuevo })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params
        const data = { ...req.body, updatedBy: colaborador }

        const updated = await repository.update({ id }, data)
        if (updated === false) return resUpdateFalse(res)

        const response = await repository.find({ id })
        res.json({ code: 0, data: response })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await repository.delete({ id })
        if (deleted === false)
            return res.status(400).json({ code: -1, msg: 'No se pudo eliminar el lote' })

        res.json({ code: 0 })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    find,
    create,
    update,
    delet,
}

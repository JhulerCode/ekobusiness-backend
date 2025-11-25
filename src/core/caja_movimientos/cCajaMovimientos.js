import { CajaMovimiento } from '#db/models/CajaMovimiento.js'
import { applyFilters } from '../../utils/mine.js'

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id'],
            order: [['fecha', 'DESC']],
            where: {},
        }

        if (qry) {
            if (qry.fltr) {
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }

            if (qry.cols) {
                findProps.attributes = findProps.attributes.concat(qry.cols)
            }
        }

        let data = await CajaMovimiento.findAll(findProps)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { fecha, tipo, detalle, monto, caja_apertura } = req.body

        // ----- CREAR ----- //
        const nuevo = await CajaMovimiento.create({
            fecha, tipo, detalle, monto, caja_apertura,
            createdBy: colaborador
        })

        const data = await CajaMovimiento.findByPk(nuevo.id)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    try {
        const { id } = req.params
        const { colaborador } = req.user
        const { fecha, detalle, monto } = req.body

        // ----- ACTUALIZAR ----- //
        const [affectedRows] = await CajaMovimiento.update(
            {
                fecha, detalle, monto,
                updatedBy: colaborador
            },
            { where: { id } }
        )

        if (affectedRows > 0) {
            const data = await CajaMovimiento.findByPk(id)

            res.json({ code: 0, data })
        }
        else {
            res.json({ code: 1, msg: 'No se actualizó ningú registro' })
        }
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params

        const deletedCount = await CajaMovimiento.destroy({ where: { id } })

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
    update,
    delet,
}
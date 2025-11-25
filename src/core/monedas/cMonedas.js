import { Moneda } from '#db/models/Moneda.js'
import { TipoCambio } from '#db/models/TipoCambio.js'
import { applyFilters, existe } from '#shared/mine.js'

const includes = {
    tipo_cambios: {
        model: TipoCambio,
        as: 'tipo_cambios',
        attributes: ['id', 'fecha', 'compra', 'venta']
    }
}

const create = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { nombre, codigo, simbolo, plural, estandar } = req.body

        // ----- VERIFY SI EXISTE ----- //
        if (await existe(Moneda, { nombre }, res) == true) return

        // ----- CREAR ----- //
        const nuevo = await Moneda.create({
            nombre, codigo, simbolo, plural, estandar,
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
        const { nombre, codigo, simbolo, plural, estandar } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await existe(Moneda, { nombre, id }, res) == true) return

        // ----- ACTUALIZAR ----- //
        const [affectedRows] = await Moneda.update(
            {
                nombre, codigo, simbolo, plural, estandar,
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
    let data = await Moneda.findByPk(id)

    return data
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id', 'estandar'],
            order: [['nombre', 'ASC']],
            where: {},
            include: []
        }

        if (qry) {
            if (qry.fltr) {
                Object.assign(findProps.where, applyFilters(qry.fltr))
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

        let data = await Moneda.findAll(findProps)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params

        const data = await Moneda.findByPk(id)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params

        const deletedCount = await Moneda.destroy({ where: { id } })

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
import { Maquina } from '#db/models/Maquina.js'
import { ArticuloLinea } from '#db/models/ArticuloLinea.js'
import { applyFilters, existe } from '#shared/mine.js'
import cSistema from "../_sistema/cSistema.js"

const include1 = {
    produccion_tipo1: {
        model: ArticuloLinea,
        as: 'produccion_tipo1',
        attributes: ['id', 'nombre']
    }
}

const create = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { tipo, codigo, nombre, fecha_compra, produccion_tipo, velocidad, limpieza_tiempo } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await existe(Maquina, { nombre }, res) == true) return

        // ----- CREAR ----- //
        const nuevo = await Maquina.create({
            tipo, codigo, nombre, fecha_compra, produccion_tipo, velocidad, limpieza_tiempo,
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
        const { tipo, codigo, nombre, fecha_compra, produccion_tipo, velocidad, limpieza_tiempo } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await existe(Maquina, { nombre, id }, res) == true) return

        // ----- ACTUALIZAR ----- //
        const [affectedRows] = await Maquina.update(
            {
                tipo, codigo, nombre, fecha_compra, produccion_tipo, velocidad, limpieza_tiempo,
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
    let data = await Maquina.findByPk(id, {
        include: [include1.produccion_tipo1]
    })

    return data
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id'],
            order: [['nombre', 'ASC']],
            where: {},
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

        const data = await Maquina.findAll(findProps)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params

        const data = await Maquina.findByPk(id)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params

        const deletedCount = await Maquina.destroy({ where: { id } })

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
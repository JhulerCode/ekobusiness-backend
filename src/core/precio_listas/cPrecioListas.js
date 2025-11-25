import { PrecioLista } from '#db/models/PrecioLista.js'
import { Moneda } from '#db/models/Moneda.js'
import { existe, applyFilters } from '../../utils/mine.js'
import cSistema from "../_sistema/cSistema.js"

const attributes = [
    'id', 'nombre'
]

const includes = {
    moneda1: {
        model: Moneda,
        as: 'moneda1',
        attributes: ['nombre']
    }
}

const create = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { nombre, descripcion, moneda, activo } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await existe(PrecioLista, { nombre }, res) == true) return

        // ----- CREAR ----- //
        const nuevo = await PrecioLista.create({
            nombre, descripcion, moneda, activo,
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
        const { nombre, descripcion, moneda, activo } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await existe(PrecioLista, { nombre, id }, res) == true) return

        // ----- ACTUALIZAR ----- //
        const [affectedRows] = await PrecioLista.update(
            {
                nombre, descripcion, moneda, activo,
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
    let data = await PrecioLista.findByPk(id, {
        include: [includes.moneda1]
    })

    if (data) {
        data = data.toJSON()

        const estadosMap = cSistema.arrayMap('estados')

        data.activo1 = estadosMap[data.activo]
    }

    return data
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes,
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

                // ----- AGREAGAR LOS REF QUE SI ESTÁN EN LA BD ----- //
                if (qry.cols.includes('moneda')) findProps.include.push(includes.moneda1)
            }
        }

        let data = await PrecioLista.findAll(findProps)

        if (data.length > 0 && qry.cols) {
            data = data.map(a => a.toJSON())

            const estadosMap = cSistema.arrayMap('estados')

            for (const a of data) {
                if (qry.cols.includes('activo')) a.activo1 = estadosMap[a.activo]
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

        const data = await PrecioLista.findByPk(id)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params

        // ----- ELIMINAR ----- //
        const deletedCount = await PrecioLista.destroy({ where: { id } })

        const send = deletedCount > 0 ? { code: 0 } : { code: 1, msg: 'No se eliminó ningún registro' }

        res.json(send)
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    find,
    findById,
    create,
    delet,
    update,
}
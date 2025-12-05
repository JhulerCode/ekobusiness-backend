import { RecetaInsumo } from '#db/models/RecetaInsumo.js'
import { Articulo } from '#db/models/Articulo.js'
import { applyFilters } from '#shared/mine.js'
import { Op } from 'sequelize'
import controllerArticulos from "../articulos/cArticulos.js"

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const data = await findAll(qry)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { articulo_principal, articulo, cantidad, orden } = req.body

        // ----- CREAR ----- //
        const nuevo = await RecetaInsumo.create({
            articulo_principal, articulo, cantidad, orden,
            createdBy: colaborador
        })

        const data = await RecetaInsumo.findByPk(nuevo.id, {
            include: {
                model: Articulo,
                as: 'articulo1',
                attributes: ['nombre', 'unidad']
            }
        })

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
        const { articulo_principal, articulo, cantidad, orden } = req.body

        // ----- ACTUALIZAR ----- //
        const [affectedRows] = await RecetaInsumo.update(
            {
                cantidad, orden,
                updatedBy: colaborador
            },
            { where: { id } }
        )

        if (affectedRows > 0) {
            res.json({ code: 0 })
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

        // ----- ELIMINAR ----- //
        const deletedCount = await RecetaInsumo.destroy({ where: { id } })

        const send = deletedCount > 0 ? { code: 0 } : { code: 1, msg: 'No se eliminó ningún registro' }

        res.json(send)
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const calcularNecesidad = async (req, res) => {
    try {
        const { articulos } = req.body

        const qry = {
            fltr: {
                id: { op: 'Es', val: articulos.map(a => a.articulo) }
            },
            incl: ['receta_insumos']
        }

        let data = await controllerArticulos.findAll(qry)

        if (data.length > 0) {
            data = data.map(a => a.toJSON())

            for (const a of articulos) {
                const receta = data.find(b => b.id == a.articulo).receta_insumos

                a.receta = receta.map(b => ({
                    ...b,
                    cantidad_necesitada: b.cantidad * (a.cantidad || 0),
                }));
            }
        }

        res.json({ code: 0, data: articulos })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

async function findAll({ incl, cols, fltr }) {
    const findProps = {
        include: [],
        attributes: ['id'],
        where: {},
        order: [['orden', 'ASC']],
    }

    const include1 = {
        articulo1: {
            model: Articulo,
            as: 'articulo1',
            attributes: ['nombre', 'unidad'],
        }
    }

    if (fltr) {
        Object.assign(findProps.where, applyFilters(fltr))
    }

    if (cols) {
        findProps.attributes = findProps.attributes.concat(cols)
    }

    if (incl) {
        for (const a of incl) {
            if (incl.includes(a)) findProps.include.push(include1[a])
        }
    }

    return await RecetaInsumo.findAll(findProps)
}

export default {
    find,
    create,
    delet,
    update,
    calcularNecesidad,
}
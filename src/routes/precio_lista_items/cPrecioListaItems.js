import { PrecioListaItem } from '../../database/models/PrecioListaItem.js'
import { existe, applyFilters } from '../../utils/mine.js'
import { Articulo } from '../../database/models/Articulo.js'

const includes = {
    articulo1: {
        model: Articulo,
        as: 'articulo1',
        attributes: ['nombre', 'unidad', 'has_fv', 'igv_afectacion']
    }
}


//----- ITEMS ----- //
const create = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { precio_lista, articulo, precio } = req.body

        //----- VERIFY SI EXISTE NOMBRE ----- //
        if (await existe(PrecioListaItem, { precio_lista, articulo }, res, 'El artículo ya fue agregado') == true) return

        //----- CREAR ----- //
        const nuevo = await PrecioListaItem.create({
            precio_lista, articulo, precio,
            createdBy: colaborador
        })

        const data = await loadOneItem(nuevo.id)

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
        const { precio_lista, articulo, precio } = req.body

        //----- ACTUALIZAR ----- //
        const [affectedRows] = await PrecioListaItem.update(
            {
                precio,
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

async function loadOneItem(id) {
    let data = await PrecioListaItem.findByPk(id, {
        include: [includes.articulo1]
    })

    return data
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id'],
            where: {},
            include: []
        }

        if (qry) {
            if (qry.fltr) {
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }

            if (qry.cols) {
                findProps.attributes = findProps.attributes.concat(qry.cols)

                //----- AGREAGAR LOS REF QUE SI ESTÁN EN LA BD ----- //
                if (qry.cols.includes('articulo')) findProps.include.push(includes.articulo1)
            }
        }

        let data = await PrecioListaItem.findAll(findProps)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params

        //----- ELIMINAR ----- //
        const deletedCount = await PrecioListaItem.destroy({ where: { id } })

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
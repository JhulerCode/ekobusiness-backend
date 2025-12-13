import { Repository } from '#db/Repository.js'

const repository = new Repository('PrecioListaItem')

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

const create = async (req, res) => {
    try {
        const { colaborador, empresa } = req.user
        const { precio_lista, articulo, precio } = req.body

        //--- VERIFY SI EXISTE ---//
        if (await repository.existe({ precio_lista, articulo, empresa }, res) == true) return

        //--- CREAR ---//
        const nuevo = await repository.create({
            precio_lista, articulo, precio,
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
        const { precio_lista, articulo, precio } = req.body

        //--- VERIFY SI EXISTE ---//
        // if (await repository.existe({ precio_lista, articulo, id, empresa }, res) == true) return

        const updated = await repository.update({ id }, {
            precio,
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
    const data = await repository.find({ id, incl: ['articulo1'] }, true)

    return data
}

export default {
    find,
    create,
    update,
    delet,
}
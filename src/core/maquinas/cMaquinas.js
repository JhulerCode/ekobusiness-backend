import { Repository } from '#db/Repository.js'
import { Maquina } from '#db/models/Maquina.js'
import { ArticuloLinea } from '#db/models/ArticuloLinea.js'
import { applyFilters, existe } from '#shared/mine.js'
import cSistema from "../_sistema/cSistema.js"

const repository = new Repository('Maquina')

const include1 = {
    produccion_tipo1: {
        model: ArticuloLinea,
        as: 'produccion_tipo1',
        attributes: ['id', 'nombre']
    }
}

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
        const { tipo, codigo, nombre, fecha_compra, produccion_tipo, velocidad, limpieza_tiempo } = req.body

        //--- VERIFY SI EXISTE NOMBRE ---//
        if (await repository.existe({ nombre, empresa }, res) == true) return

        //--- CREAR ---//
        const nuevo = await repository.create({
            tipo, codigo, nombre, fecha_compra, produccion_tipo, velocidad, limpieza_tiempo,
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
        const { tipo, codigo, nombre, fecha_compra, produccion_tipo, velocidad, limpieza_tiempo } = req.body

        //--- VERIFY SI EXISTE NOMBRE ---//
        if (await repository.existe({ nombre, id, empresa }, res) == true) return

        //--- ACTUALIZAR ---//
        const updated = await repository.update(id, {
            tipo, codigo, nombre, fecha_compra, produccion_tipo, velocidad, limpieza_tiempo,
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

        if (await repository.delete(id) == false) return

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


//--- Helpers ---//
async function loadOne(id) {
    let data = await repository.find({ id }, ['produccion_tipo1'])

    return data
}

export default {
    find,
    findById,
    create,
    update,
    delet,
}
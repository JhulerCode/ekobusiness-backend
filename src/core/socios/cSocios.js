import { Repository } from '#db/Repository.js'
import { arrayMap } from '#store/system.js'
import { actualizarSesion } from '#store/sessions.js'
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'

const repository = new Repository('Socio')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const data = await repository.find(qry, true)

        if (data.length > 0) {
            const documentos_identidadMap = arrayMap('documentos_identidad')
            const estadosMap = arrayMap('estados')

            for (const a of data) {
                if (qry?.cols?.includes('doc_tipo')) a.doc_tipo1 = documentos_identidadMap[a.doc_tipo]
                if (qry?.cols?.includes('activo')) a.activo1 = estadosMap[a.activo]
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
        const {
            tipo, doc_tipo, doc_numero, nombres, apellidos,
            telefono1, telefono2, correo, web, activo,
            direcciones,
            contactos,
            precio_lista, pago_condicion, bancos,
            documentos,
        } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (doc_numero) {
            if (await repository.existe({ tipo, doc_numero, empresa }, res, `El Nro de documento ya existe, ingresa otro.`) == true) return
        }

        if (correo) {
            if (await repository.existe({ tipo, correo, empresa }, res, `El correo ya existe, ingresa otro.`) == true) return
        }

        // ----- CREAR ----- //
        const nuevo = await repository.create({
            tipo, doc_tipo, doc_numero, nombres, apellidos,
            telefono1, telefono2, correo, web, activo,
            direcciones,
            contactos,
            precio_lista, pago_condicion, bancos,
            documentos,
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
        const {
            tipo, doc_tipo, doc_numero, nombres, apellidos,
            telefono1, telefono2, correo, web, activo,
            direcciones,
            contactos,
            precio_lista, pago_condicion, bancos, pago_metodos,
            documentos,
            comes_from,
        } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (doc_numero) {
            if (await repository.existe({ tipo, doc_numero, id, empresa }, res, `El Nro de documento ya existe, ingresa otro.`) == true) return
        }

        if (correo) {
            if (await repository.existe({ tipo, correo, id, empresa }, res, `El correo ya existe, ingresa otro.`) == true) return
        }

        //--- ACTUALIZAR ---//
        const updated = await repository.update({ id }, {
            tipo, doc_tipo, doc_numero, nombres, apellidos,
            telefono1, telefono2, correo, web, activo,
            direcciones,
            contactos,
            precio_lista, pago_condicion, bancos, pago_metodos,
            documentos,
            updatedBy: colaborador
        })

        if (updated == false) return resUpdateFalse(res)

        const data = await loadOne(id)
        if (comes_from == 'ecommerce') actualizarSesion(id, data)
        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params

        if (await repository.delete({ id }) == false) return resDeleteFalse(res)

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const deleteBulk = async (req, res) => {
    try {
        const { ids } = req.body

        if (await repository.delete(ids) == false) return

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const updateBulk = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { ids, prop, val } = req.body

        //--- ACTUALIZAR ---//
        const updated = await repository.update({ id: ids }, {
            [prop]: val,
            updatedBy: colaborador
        })

        if (updated == false) return resUpdateFalse(res)

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


//--- Helpers ---//
async function loadOne(id) {
    const data = await repository.find({ id }, true)

    if (data) {
        const documentos_identidadMap = arrayMap('documentos_identidad')
        const estadosMap = arrayMap('estados')

        data.doc_tipo1 = documentos_identidadMap[data.doc_tipo]
        data.activo1 = estadosMap[data.activo]
    }

    return data
}

export default {
    create,
    find,
    findById,
    delet,
    update,

    deleteBulk,
    updateBulk,
}
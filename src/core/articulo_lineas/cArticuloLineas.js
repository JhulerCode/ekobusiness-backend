import { Repository } from '#db/Repository.js'
import { minioPutObject, minioRemoveObject } from '#infrastructure/minioClient.js'
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'

const repository = new Repository('ArticuloLinea')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const virtuals = ['activo', 'is_ecommerce']
// is_destacado no existe en el modelo ArticuloLinea, se remueve.

        virtuals.forEach((v) => {
            if (qry?.cols?.includes(v)) qry.cols.push(`${v}1`)
        })

        const response = await repository.find(qry, true)

        const hasPage = qry.page
        const data = hasPage ? response.data : response
        const meta = hasPage ? response.meta : null

        res.json({ code: 0, data, meta })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params

        const data = await repository.find({ id })

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    try {
        const { colaborador, empresa } = req.user
        const { nombre, activo, is_ecommerce, descripcion } = req.body

        //--- VERIFY SI EXISTE NOMBRE ---//
        if ((await repository.existe({ nombre, empresa }, res)) == true) return

        //--- CREAR ---//
        const nuevo = await repository.create({
            nombre,
            activo,
            is_ecommerce,
            descripcion,
            empresa,
            createdBy: colaborador,
        })

        const data = await loadOne(nuevo.id)

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    try {
        const { colaborador, empresa } = req.user
        const { id } = req.params
        const { nombre, activo, is_ecommerce, descripcion } = req.body

        //---- VERIFY SI EXISTE NOMBRE ---//
        if ((await repository.existe({ nombre, id, empresa }, res)) == true) return

        //--- ACTUALIZAR ---//
        const updated = await repository.update(
            { id },
            {
                nombre,
                activo,
                is_ecommerce,
                descripcion,
                updatedBy: colaborador,
            },
        )

        if (updated == false) return resUpdateFalse(res)

        const data = await loadOne(id)

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params
        const { fotos } = req.body

        if ((await repository.delete({ id })) == false) return resDeleteFalse(res)

        for (const a of fotos) await minioRemoveObject(a.id)

        res.json({ code: 0 })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const updateFotos = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params

        if (req.body.datos) {
            const datos = JSON.parse(req.body.datos)
            req.body = { ...datos }
        }

        const { vigentes, eliminados } = req.body
        const archivos = req.files // multer los guarda en memoria o en req.files[]

        const files = []

        //--- SUBIR ARCHIVOS NUEVOS A MINIO ---//
        for (const a of vigentes) {
            // Buscar si hay un nuevo archivo con ese nombre
            // b.originalname = lo pone multer
            // a.name = viene en el array vigentes
            const file = archivos.find((b) => b.originalname === a.name)

            const entry = file ? await minioPutObject(file) : a

            files.push(entry)
        }

        //--- ACTUALIZAR EN BASE DE DATOS ---//
        const updated = await repository.update(
            { id },
            {
                fotos: files,
                updatedBy: colaborador,
            },
        )

        if (updated == false) return resUpdateFalse(res)

        //--- ELIMINAR ARCHIVOS DE MINIO QUE YA NO ESTÁN ---//
        for (const a of eliminados) await minioRemoveObject(a.id)

        res.json({ code: 0, data: files })
    } catch (error) {
        console.error('Error en updateFotos:', error)
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

//--- Helpers ---//
async function loadOne(id) {
    const data = await repository.find({ id }, true)

    return data
}

export default {
    find,
    findById,
    create,
    delet,
    update,

    updateFotos,
}

import { Repository } from '#db/Repository.js'
import cSistema from "../_sistema/cSistema.js"
import { minioClient, minioDomain, minioBucket } from "#infrastructure/minioClient.js"

const repository = new Repository('ArticuloCategoria')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const data = await repository.find(qry, true)

        if (data.length > 0) {
            const estadosMap = cSistema.arrayMap('estados')

            for (const a of data) {
                if (qry?.cols?.includes('activo')) a.activo1 = estadosMap[a.activo]
                if (qry?.cols?.includes('is_destacado')) a.is_destacado1 = estadosMap[a.is_destacado]
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
        const { tipo, nombre, descripcion, activo } = req.body

        //--- VERIFY SI EXISTE NOMBRE ---//
        if (await repository.existe({ nombre, empresa }, res) == true) return

        //--- CREAR ---//
        const nuevo = await repository.create({
            tipo, nombre, descripcion, activo,
            empresa,
            createdBy: colaborador,
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
        const { tipo, nombre, descripcion, activo } = req.body

        //--- VERIFY SI EXISTE NOMBRE ---//
        if (await repository.existe({ nombre, id, empresa }, res) == true) return

        //--- ACTUALIZAR ---//
        const updated = await repository.update(id, {
            tipo, nombre, descripcion, activo,
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

const updateFotos = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params

        if (req.body.datos) {
            const datos = JSON.parse(req.body.datos)
            req.body = { ...datos }
        }

        const { vigentes, eliminados } = req.body
        const archivos = req.files

        const new_fotos = []

        //--- SUBIR ARCHIVOS NUEVOS A MINIO ---//
        for (const a of vigentes) {
            const arch = archivos.find(b => b.originalname === a.name)

            if (arch) {
                const timestamp = Date.now()
                const uniqueName = `${timestamp}-${arch.originalname}`

                await minioClient.putObject(
                    minioBucket,
                    uniqueName,
                    arch.buffer,
                    arch.size,
                    { "Content-Type": arch.mimetype }
                )

                const publicUrl = `https://${minioDomain}/${minioBucket}/${uniqueName}`

                new_fotos.push({
                    id: uniqueName,
                    name: arch.originalname,
                    url: publicUrl
                })
            } else {
                new_fotos.push(a)
            }
        }

        //--- ACTUALIZAR EN BASE DE DATOS ---//
        const updated = await repository.update(id, {
            fotos: new_fotos,
            updatedBy: colaborador
        })

        if (updated == false) return

        //--- ELIMINAR ARCHIVOS DE MINIO QUE YA NO ESTÁN ---//
        for (const a of eliminados) {
            try {
                await minioClient.removeObject(minioBucket, a.id)
            } catch (err) {
                console.error(`Error al eliminar ${a.id}:`, err.message)
            }
        }

        res.json({ code: 0, data: new_fotos })
    }
    catch (error) {
        console.error('Error en updateFotos:', error)
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


//--- Helpers ---//
async function loadOne(id) {
    let data = await repository.find({ id }, true)

    if (data) {
        const estadosMap = cSistema.arrayMap('estados')

        data.activo1 = estadosMap[data.activo]
        data.is_destacado1 = estadosMap[data.is_destacado]
    }

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
import { ArticuloCategoria } from '../../database/models/ArticuloCategoria.js'
import { existe, applyFilters } from '../../utils/mine.js'
import cSistema from "../_sistema/cSistema.js"
import { minioClient, minioDomain, minioBucket } from "../../lib/minioClient.js"

const create = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { tipo, nombre, descripcion, activo } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await existe(ArticuloCategoria, { nombre }, res) == true) return

        // ----- CREAR ----- //
        const nuevo = await ArticuloCategoria.create({
            tipo, nombre, descripcion, activo,
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
        const { colaborador } = req.user
        const { id } = req.params
        const { tipo, nombre, descripcion, activo } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await existe(ArticuloCategoria, { nombre, id }, res) == true) return

        // ----- ACTUALIZAR ----- //
        const [affectedRows] = await ArticuloCategoria.update({
            tipo, nombre, descripcion, activo,
            updatedBy: colaborador
        }, { where: { id } })

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
    let data = await ArticuloCategoria.findByPk(id)

    if (data) {
        data = data.toJSON()

        const estadosMap = cSistema.arrayMap('estados')

        data.activo1 = estadosMap[data.activo]
        data.is_destacado1 = estadosMap[data.is_destacado]
    }

    return data
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id', 'nombre'],
            order: [['nombre', 'ASC']],
            where: {},
        }
        // console.log(qry)
        if (qry) {
            if (qry.fltr) {
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }

            if (qry.cols) {
                findProps.attributes = findProps.attributes.concat(qry.cols)
            }
        }

        let data = await ArticuloCategoria.findAll(findProps)

        if (data.length > 0 && qry && qry.cols) {
            data = data.map(a => a.toJSON())

            const estadosMap = cSistema.arrayMap('estados')

            for (const a of data) {
                if (qry.cols.includes('activo')) a.activo1 = estadosMap[a.activo]
                if (qry.cols.includes('is_destacado')) a.is_destacado1 = estadosMap[a.is_destacado]
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

        let data = await ArticuloCategoria.findByPk(id)

        if (data) {
            data = data.toJSON()
            data.previous_imagen = data.imagen
        }

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
        const deletedCount = await ArticuloCategoria.destroy({ where: { id } })

        const send = deletedCount > 0 ? { code: 0 } : { code: 1, msg: 'No se eliminó ningún registro' }

        res.json(send)
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
        const archivos = req.files // multer los guarda en memoria o en req.files[]

        const new_fotos = []

        for (const a of vigentes) {
            // Buscar si hay un nuevo archivo con ese nombre
            const arch = archivos.find(b => b.originalname === a.name)

            if (arch) {
                // --- SUBIR ARCHIVO NUEVO A MINIO ---
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
                    id: uniqueName, // ID interno = nombre único del archivo
                    name: arch.originalname,
                    url: publicUrl
                })
            } else {
                // --- ARCHIVO EXISTENTE ---
                new_fotos.push(a)
            }
        }

        // --- ACTUALIZAR EN BASE DE DATOS ---
        const [affectedRows] = await ArticuloCategoria.update(
            {
                fotos: new_fotos,
                updatedBy: colaborador
            },
            { where: { id } }
        )

        if (affectedRows > 0) {
            // --- ELIMINAR ARCHIVOS DE MINIO QUE YA NO ESTÁN ---
            for (const a of eliminados) {
                try {
                    await minioClient.removeObject(minioBucket, a.id)
                } catch (err) {
                    console.error(`Error al eliminar ${a.id}:`, err.message)
                }
            }

            res.json({ code: 0, data: new_fotos })
        } else {
            res.json({ code: 1, msg: 'No se actualizó ningún registro' })
        }
    } catch (error) {
        console.error('Error en updateFotos:', error)
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    find,
    findById,
    create,
    delet,
    update,
    updateFotos,
}
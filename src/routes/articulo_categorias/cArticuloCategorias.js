import { ArticuloCategoria } from '../../database/models/ArticuloCategoria.js'
import { existe, applyFilters } from '../../utils/mine.js'
import cSistema from "../_sistema/cSistema.js"
import { deleteFile } from '../../utils/uploadFiles.js'
import { minioClient, minioDomain, minioBucket } from "../../lib/minioClient.js"

const create = async (req, res) => {
    try {
        const { colaborador } = req.user

        if (req.body.datos) {
            const datos = JSON.parse(req.body.datos)
            req.body = { ...req.body, ...datos }
        }

        const { tipo, nombre, descripcion, activo } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await existe(ArticuloCategoria, { nombre }, res) == true) return

        // ----- CREAR ----- //
        const nuevo = await ArticuloCategoria.create({
            tipo, nombre, descripcion, activo,
            imagen: req.file ? req.file.filename : null,
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

        if (req.body.datos) {
            const datos = JSON.parse(req.body.datos)
            req.body = { ...datos }
        }

        const {
            tipo, nombre, descripcion, activo,
            imagen, previous_imagen
        } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await existe(ArticuloCategoria, { nombre, id }, res) == true) return

        // ----- ACTUALIZAR ----- //
        const send = {
            tipo, nombre, descripcion, activo,
            imagen,
            updatedBy: colaborador
        }

        if (req.file) {
            const timestamp = Date.now();
            const uniqueName = `${timestamp}-${req.file.originalname}`;

            // Subir a MinIO
            await minioClient.putObject(
                minioBucket,
                uniqueName,
                req.file.buffer,
                req.file.size,
                { "Content-Type": req.file.mimetype }
            );

            send.imagen = uniqueName;

            // Borrar logo anterior del bucket si existe
            if (previous_imagen && previous_imagen !== uniqueName) {
                try {
                    await minioClient.removeObject(minioBucket, previous_logo);
                } catch (err) {
                    console.error("Error al borrar logo anterior:", err.message);
                }
            }

            // Generar URL pública HTTPS permanente
            const publicUrl = `https://${minioDomain}/${minioBucket}/${uniqueName}`;
            send.imagen_url = publicUrl;
        }

        const [affectedRows] = await ArticuloCategoria.update(send, { where: { id } })

        if (affectedRows > 0) {
            let data = await loadOne(id)

            if (data) {
                data = data.toJSON()
                data.imagen_url = send.imagen_url || null
            }

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

// const update = async (req, res) => {
//     try {
//         const { colaborador } = req.user
//         const { id } = req.params

//         if (req.body.datos) {
//             const datos = JSON.parse(req.body.datos)
//             req.body = { ...datos }
//         }

//         const {
//             tipo, nombre, descripcion, activo,
//             imagen, previous_imagen
//         } = req.body

//         // ----- VERIFY SI EXISTE NOMBRE ----- //
//         if (await existe(ArticuloCategoria, { nombre, id }, res) == true) return

//         // ----- ACTUALIZAR ----- //
//         const send = {
//             tipo, nombre, descripcion, activo,
//             imagen,
//             updatedBy: colaborador
//         }

//         if (req.file) send.imagen = req.file.filename
//         console.log(req.file)

//         const [affectedRows] = await ArticuloCategoria.update(
//             send,
//             { where: { id } }
//         )

//         if (affectedRows > 0) {
//             if (send.imagen != previous_imagen && previous_imagen != null) {
//                 deleteFile(previous_imagen)
//             }

//             const data = await loadOne(id)

//             res.json({ code: 0, data })
//         }
//         else {
//             res.json({ code: 1, msg: 'No se actualizó ningún registro' })
//         }
//     }
//     catch (error) {
//         res.status(500).json({ code: -1, msg: error.message, error })
//     }
// }

async function loadOne(id) {
    let data = await ArticuloCategoria.findByPk(id)

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
            attributes: ['id', 'nombre'],
            order: [['nombre', 'ASC']],
            where: {},
        }
        console.log(qry)
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

export default {
    find,
    findById,
    create,
    delet,
    update
}
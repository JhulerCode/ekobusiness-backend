import { Documento } from '../../database/models/Documento.js'
import { applyFilters } from '../../utils/mine.js'
import cSistema from "../_sistema/cSistema.js"
// import { deleteFile, getFile, getFilePath } from '../../utils/uploadFiles.js'

const create = async (req, res) => {
    try {
        const { colaborador } = req.user
        const {
            tipo, nombre, descripcion,
            denominacion_legal, denominacion_comercial, registro_sanitario,
            fecha_emision, fecha_vencimiento, recordar_dias,
        } = req.body

        // ----- CREAR ----- //
        const nuevo = await Documento.create({
            tipo, nombre, descripcion,
            denominacion_legal, denominacion_comercial, registro_sanitario,
            fecha_emision, fecha_vencimiento, recordar_dias,
            file_name: req.file ? req.file.filename : undefined,
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
        const {
            tipo, nombre, descripcion,
            denominacion_legal, denominacion_comercial, registro_sanitario,
            fecha_emision, fecha_vencimiento, recordar_dias, file_name, previous_file_name
        } = req.body

        // ----- ACTUALIZAR ----- //
        const send = {
            tipo, nombre, descripcion,
            denominacion_legal, denominacion_comercial, registro_sanitario,
            fecha_emision, fecha_vencimiento, recordar_dias,
            updatedBy: colaborador
        }

        if (req.file) send.file_name = req.file.filename
        if (file_name == null) send.file_name = null

        const [affectedRows] = await Documento.update(
            send,
            { where: { id } }
        )

        if (affectedRows > 0) {
            if (req.file || file_name == null) {
                // deleteFile(previous_file_name)
            }

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
    let data = await Documento.findByPk(id)

    if (data) {
        data = data.toJSON()

        const estadosMap = cSistema.arrayMap('documentos_estados')

        data.estado1 = estadosMap[data.estado]
    }

    return data
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id', 'file_name'],
            order: [['nombre', 'ASC']],
            where: {},
        }

        if (qry) {
            if (qry.fltr) {
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }

            if (qry.cols) {
                findProps.attributes = findProps.attributes.concat(qry.cols)
            }
        }

        let data = await Documento.findAll(findProps)

        if (data.length > 0 && qry.cols) {
            data = data.map(a => a.toJSON())

            const estadosMap = cSistema.arrayMap('documentos_estados')

            for (const a of data) {
                a.estado1 = estadosMap[a.estado]
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

        let data = await Documento.findByPk(id)

        if (data) {
            data = data.toJSON()
            data.previous_file_name = data.file_name
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

        const deletedCount = await Documento.destroy({ where: { id } })

        const send = deletedCount > 0 ? { code: 0 } : { code: 1, msg: 'No se eliminó ningún registro' }

        res.json(send)
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const verfile = async (req, res) => {
    const { id } = req.params
    const file = getFile(id)
    const rutaArchivo = getFilePath(id)

    if (file) {
        res.sendFile(rutaArchivo)
    } else {
        res.status(404).json({ msg: 'Archivo no encontrado' })
    }
}

export default {
    create,
    update,
    find,
    findById,
    delet,
    verfile,
}
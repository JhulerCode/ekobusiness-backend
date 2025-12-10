import { Repository } from '#db/Repository.js'
import cSistema from "../_sistema/cSistema.js"
import { minioPutObject, minioRemoveObject } from "#infrastructure/minioClient.js"

const repository = new Repository('Documento')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const data = await repository.find(qry, true)

        if (data.length > 0) {
            const estadosMap = cSistema.arrayMap('documentos_estados')

            for (const a of data) {
                if (qry?.cols?.includes('estado')) a.estado1 = estadosMap[a.estado]
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

        const data = await repository.find({ id }, true)

        if (data) {
            data.previous_file = data.file
            data.file_name = data.file.name
        }

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    try {
        const { colaborador, empresa } = req.user
        if (req.body.datos) req.body = { ...JSON.parse(req.body.datos) }
        const {
            tipo, nombre, descripcion,
            denominacion_legal, denominacion_comercial, registro_sanitario,
            fecha_emision, fecha_vencimiento, recordar_dias,
        } = req.body

        //--- VERIFY SI EXISTE NOMBRE ---//
        if (nombre) {
            if (await repository.existe({ tipo, nombre, empresa }, res) == true) return
        }

        //--- Upload file ---//
        let file
        if (req.file) {
            file = await minioPutObject(req.file)

            if (file == false) {
                res.status(500).json({ code: 1, msg: 'Error al subir el archivo' })
                return
            }
        }

        // ----- CREAR ----- //
        const nuevo = await repository.create({
            tipo, nombre, descripcion,
            denominacion_legal, denominacion_comercial, registro_sanitario,
            fecha_emision, fecha_vencimiento, recordar_dias,
            file,
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
        if (req.body.datos) req.body = { ...JSON.parse(req.body.datos) }
        const {
            tipo, nombre, descripcion,
            denominacion_legal, denominacion_comercial, registro_sanitario,
            fecha_emision, fecha_vencimiento, recordar_dias,
            file,
        } = req.body

        //--- VERIFY SI EXISTE NOMBRE ---//
        if (nombre) {
            if (await repository.existe({ tipo, nombre, empresa, id }, res) == true) return
        }

        //--- Subir archivo ---//
        let newFile
        if (req.file) {
            newFile = await minioPutObject(req.file)

            if (newFile == false) {
                res.status(500).json({ code: 1, msg: 'Error al subir el archivo' })
                return
            }
        }

        // ----- ACTUALIZAR ----- //
        const updated = await repository.update(id, {
            tipo, nombre, descripcion,
            denominacion_legal, denominacion_comercial, registro_sanitario,
            fecha_emision, fecha_vencimiento, recordar_dias,
            file: newFile,
            createdBy: colaborador
        })

        if (updated == false) return

        //--- Eliminar archivo de minio ---//
        if (req.file) await minioRemoveObject(file.id)

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
        const { file } = req.body

        if (await repository.delete(id) == false) return

        if (file) await minioRemoveObject(file.id)

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


//--- Helpers ---//
async function loadOne(id) {
    let data = await repository.find({ id }, true)

    if (data) {
        const estadosMap = cSistema.arrayMap('documentos_estados')

        data.estado1 = estadosMap[data.estado]
        data.file_name = data.file.name
    }

    return data
}

export default {
    create,
    update,
    find,
    findById,
    delet,
}
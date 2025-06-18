import { Documento } from '../../database/models/Documento.js'
import { existe, applyFilters } from '../../utils/mine.js'
import cSistema from "../_sistema/cSistema.js"
import axios from 'axios'
import { deleteFile, saveFile } from '../../utils/uploadFiles.js'
import { format, tzDate } from '@formkit/tempo'

const create = async (req, res) => {
    try {
        const { colaborador } = req.user
        const {
            tipo, nombre, descripcion,
            denominacion_legal, denominacion_comercial, registro_sanitario,
            fecha_emision, fecha_vencimiento, recordar_dias, documento
        } = req.body

        //----- CREAR ----- //
        const nuevo = await Documento.create({
            tipo, nombre, descripcion,
            denominacion_legal, denominacion_comercial, registro_sanitario,
            fecha_emision, fecha_vencimiento, recordar_dias,
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
            fecha_emision, fecha_vencimiento, recordar_dias, documento
        } = req.body

        //----- ACTUALIZAR ----- //
        const [affectedRows] = await Documento.update(
            {
                tipo, nombre, descripcion,
                denominacion_legal, denominacion_comercial, registro_sanitario,
                fecha_emision, fecha_vencimiento, recordar_dias,
                updatedBy: colaborador
            },
            { where: { id } }
        )

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
    let data = await Documento.findByPk(id)

    if (data) {
        data = data.toJSON()

        const estadosMap = cSistema.arrayMap('documentos_estados')

        data.estado = setEstado(data.fecha_vencimiento, data.recordar_dias)
        data.estado1 = estadosMap[data.estado]
    }

    return data
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id'],
            order: [['nombre', 'ASC']],
            where: {},
        }

        if (qry) {
            if (qry.fltr) {
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }

            if (qry.cols) {
                findProps.attributes = findProps.attributes.concat(qry.cols.filter(c => c !== 'estado'))
            }
        }

        let data = await Documento.findAll(findProps)

        if (data.length > 0 && qry.cols) {
            data = data.map(a => a.toJSON())

            const estadosMap = cSistema.arrayMap('documentos_estados')

            for (const a of data) {
                a.estado = setEstado(a.fecha_vencimiento, a.recordar_dias)
                a.estado1 = estadosMap[a.estado]
            }
        }

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

function setEstado(fecha_vencimiento, recordar_dias) {
    // const hoy = new Date()
    // hoy.setHours(10, 0, 0, 0)
    const hoy = tzDate(new Date(), 'America/Lima')
    hoy.setHours(10, 0, 0, 0)

    const vencimiento = new Date(fecha_vencimiento + " 10:00:00")

    const fechaRecordatorio = new Date(vencimiento)
    fechaRecordatorio.setDate(vencimiento.getDate() - recordar_dias)

    if (hoy > vencimiento) {
        return 0
    } else if (
        hoy.getFullYear() === vencimiento.getFullYear() &&
        hoy.getMonth() === vencimiento.getMonth() &&
        hoy.getDate() === vencimiento.getDate()
    ) {
        return 0.1
    } else if (hoy >= fechaRecordatorio) {
        return 1
    } else {
        return 2
    }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params

        const data = await Documento.findByPk(id)

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

const uploadDoc = async (req, res) => {
    try {
        const { id } = req.params
        const { files } = req.body
        console.log({ id, files })

        const uploaded = []

        for (const a of files) {
            const fileName = saveFile(a.b64)

            await Documento.update(
                { documento: fileName },
                { where: { id } }
            )

            uploaded.push({
                name: a.name,
                fileName
            })
        }

        res.json({ code: 0, uploaded })
        // await axios.post(
        //     'https://hook.us2.make.com/r4t9ut706j622rrg60npp54o657x18g5',
        //     {
        //         nombre,
        //         documento // aquí asumo que 'documento' es el contenido base64 o la URL temporal del archivo
        //     }
        // )
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    create,
    update,
    find,
    findById,
    delet,
    uploadDoc,
}
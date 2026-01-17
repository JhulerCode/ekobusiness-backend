import { Repository } from '#db/Repository.js'
import { arrayMap } from '#store/system.js'
import { minioPutObject, minioRemoveObject } from "#infrastructure/minioClient.js"
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'

const repository = new Repository('Articulo')

// const sqlValor = [Sequelize.literal(`(
//     SELECT COALESCE(SUM(t.stock * t.pu), 0)
//     FROM transaccion_items AS t
//     WHERE t.articulo = articulos.id AND t.is_lote_padre = TRUE
// )`), 'valor']

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        let data = await repository.find(qry, true)

        if (data.length > 0) {
            const estadosMap = arrayMap('estados')
            const igv_afectacionesMap = arrayMap('igv_afectaciones')

            for (const a of data) {
                if (qry?.cols?.includes('has_fv')) a.has_fv1 = estadosMap[a.has_fv]
                if (qry?.cols?.includes('activo')) a.activo1 = estadosMap[a.activo]
                if (qry?.cols?.includes('igv_afectacion')) a.igv_afectacion1 = igv_afectacionesMap[a.igv_afectacion]
                if (qry?.cols?.includes('is_ecommerce')) a.is_ecommerce1 = estadosMap[a.is_ecommerce]
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
        const {
            codigo, codigo_barra, nombre, unidad, marca,
            vende, has_fv, activo,
            igv_afectacion,
            tipo, categoria, mp_tipo, linea, filtrantes, contenido_neto,
            is_combo, combo_articulos,
            is_ecommerce, descripcion, precio, precio_anterior, fotos, dimenciones, envase_tipo, is_destacado, ingredientes, beneficios,
        } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await repository.existe({ nombre, empresa }, res) == true) return

        // ----- CREAR ----- //
        const nuevo = await repository.create({
            codigo, codigo_barra, nombre, unidad, marca,
            vende, has_fv, activo,
            igv_afectacion,
            tipo, categoria, mp_tipo, linea, filtrantes, contenido_neto,
            is_combo, combo_articulos,
            is_ecommerce, descripcion, precio, precio_anterior, fotos, dimenciones, envase_tipo, is_destacado, ingredientes, beneficios,
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
            codigo, codigo_barra, nombre, unidad, marca,
            vende, has_fv, activo,
            igv_afectacion,
            tipo, categoria, mp_tipo, linea, filtrantes, contenido_neto,
            is_combo, combo_articulos,
            is_ecommerce, descripcion, precio, precio_anterior, fotos, dimenciones, envase_tipo, is_destacado, ingredientes, beneficios,
        } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await repository.existe({ nombre, id, empresa }, res) == true) return

        // ----- ACTUALIZAR ----- //
        const updated = await repository.update({ id }, {
            codigo, codigo_barra, nombre, unidad, marca,
            vende, has_fv, activo,
            igv_afectacion,
            tipo, categoria, mp_tipo, linea, filtrantes, contenido_neto,
            is_combo, combo_articulos,
            is_ecommerce, descripcion, precio, precio_anterior, fotos, dimenciones, envase_tipo, is_destacado, ingredientes, beneficios,
            updatedBy: colaborador
        })

        if (updated == false) return resUpdateFalse(res)

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

        if (await repository.delete({ id }) == false) return resDeleteFalse(res)

        for (const a of fotos) await minioRemoveObject(a.id)

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

        const files = []

        //--- SUBIR ARCHIVOS NUEVOS A MINIO ---//
        for (const a of vigentes) {
            const file = archivos.find(b => b.originalname === a.name)

            const entry = file ? await minioPutObject(file) : a

            files.push(entry)
        }

        //--- ACTUALIZAR EN BASE DE DATOS ---//
        const updated = await repository.update({ id }, {
            fotos: files,
            updatedBy: colaborador
        })

        if (updated == false) return resUpdateFalse(res)

        //--- ELIMINAR ARCHIVOS DE MINIO QUE YA NO ESTÁN ---//
        for (const a of eliminados) await minioRemoveObject(a.id)

        res.json({ code: 0, data: files })
    }
    catch (error) {
        console.error('Error en updateFotos:', error)
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const createBulk = async (req, res) => {
    try {
        const { colaborador, empresa } = req.user
        const { tipo, articulos } = req.body
        
        const send = articulos.map(a => ({
            codigo_barra: a.EAN,
            nombre: a.Nombre,
            unidad: a.Unidad,
            marca: a.Marca,

            vende: tipo == 1 ? false : true,
            has_fv: tipo == 1 ? false : true,
            activo: true,

            igv_afectacion: a.Tributo,

            tipo,
            linea: a.Linea,
            categoria: a.Categoria,
            filtrantes: a.Sobres_caja,
            is_combo: false,

            empresa,
            createdBy: colaborador
        }))

        await repository.createBulk(send)

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const deleteBulk = async (req, res) => {
    try {
        const { ids } = req.body

        if (await repository.delete(ids) == false) return resDeleteFalse(res)

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
    const data = await repository.find({ id, incl: ['categoria1', 'linea1'] }, true)

    if (data) {
        const estadosMap = arrayMap('estados')
        const igv_afectacionesMap = arrayMap('igv_afectaciones')

        data.has_fv1 = estadosMap[data.has_fv]
        data.activo1 = estadosMap[data.activo]
        data.igv_afectacion1 = igv_afectacionesMap[data.igv_afectacion]
        data.is_ecommerce1 = estadosMap[data.is_ecommerce]
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
    createBulk,
    deleteBulk,
    updateBulk,
}
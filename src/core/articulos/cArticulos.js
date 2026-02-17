import { Repository } from '#db/Repository.js'
import { arrayMap } from '#store/system.js'
import { minioPutObject, minioRemoveObject } from '#infrastructure/minioClient.js'
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'

const repository = new Repository('Articulo')

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
                if (qry?.cols?.includes('igv_afectacion'))
                    a.igv_afectacion1 = igv_afectacionesMap[a.igv_afectacion]
                if (qry?.cols?.includes('is_ecommerce'))
                    a.is_ecommerce1 = estadosMap[a.is_ecommerce]

                if (qry?.cols?.includes('purchase_ok'))
                    a.purchase_ok1 = estadosMap[a.purchase_ok]

                if (qry?.cols?.includes('sale_ok'))
                    a.sale_ok1 = estadosMap[a.sale_ok]

                if (qry?.cols?.includes('produce_ok'))
                    a.produce_ok1 = estadosMap[a.produce_ok]
            }
        }

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const data = await repository.find({ id, ...qry })

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    try {
        const { colaborador, empresa } = req.user
        const {
            nombre,
            code,
            codigo_barra,
            type,
            purchase_ok,
            sale_ok,
            produce_ok,
            activo,

            unidad,
            categoria,
            marca,

            tracking,

            list_price,

            is_ecommerce,
            descripcion,
            precio,
            precio_anterior,
            contenido_neto,
            dimenciones,
            envase_tipo,
            is_destacado,
            fotos,
            ingredientes,
            beneficios,

            linea,
            filtrantes,

            combo_articulos,
            tipo,
            mp_tipo,
            has_fv,
            igv_afectacion,
        } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if ((await repository.existe({ nombre, empresa }, res)) == true) return

        // ----- CREAR ----- //
        const nuevo = await repository.create({
            nombre,
            code,
            codigo_barra,
            type,
            purchase_ok,
            sale_ok,
            produce_ok,
            activo,

            unidad,
            categoria,
            marca,

            tracking,

            list_price,

            is_ecommerce,
            descripcion,
            precio,
            precio_anterior,
            contenido_neto,
            dimenciones,
            envase_tipo,
            is_destacado,
            fotos,
            ingredientes,
            beneficios,

            linea,
            filtrantes,

            combo_articulos,
            tipo,
            mp_tipo,
            has_fv,
            igv_afectacion,

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
        const {
            nombre,
            code,
            codigo_barra,
            type,
            purchase_ok,
            sale_ok,
            produce_ok,
            activo,

            unidad,
            categoria,
            marca,

            tracking,

            list_price,

            is_ecommerce,
            descripcion,
            precio,
            precio_anterior,
            contenido_neto,
            dimenciones,
            envase_tipo,
            is_destacado,
            fotos,
            ingredientes,
            beneficios,

            linea,
            filtrantes,

            combo_articulos,
            tipo,
            mp_tipo,
            has_fv,
            igv_afectacion,
        } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if ((await repository.existe({ nombre, id, empresa }, res)) == true) return

        // ----- ACTUALIZAR ----- //
        const updated = await repository.update(
            { id },
            {
                nombre,
                code,
                codigo_barra,
                type,
                purchase_ok,
                sale_ok,
                produce_ok,
                activo,

                unidad,
                categoria,
                marca,

                tracking,

                list_price,

                is_ecommerce,
                descripcion,
                precio,
                precio_anterior,
                contenido_neto,
                dimenciones,
                envase_tipo,
                is_destacado,
                fotos,
                ingredientes,
                beneficios,

                linea,
                filtrantes,

                combo_articulos,
                tipo,
                mp_tipo,
                has_fv,
                igv_afectacion,

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
        const archivos = req.files

        const files = []

        //--- SUBIR ARCHIVOS NUEVOS A MINIO ---//
        for (const a of vigentes) {
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

const createBulk = async (req, res) => {
    try {
        const { colaborador, empresa } = req.user
        const { articulos } = req.body

        const send = articulos.map((a) => ({
            // id: a.id,
            nombre: a.nombre,
            codigo_barra: a.codigo_barra,
            type: a.type,
            purchase_ok: a.purchase_ok,
            sale_ok: a.sale_ok,
            produce_ok: a.produce_ok,

            igv_afectacion: a.igv_afectacion,
            unidad: a.unidad,
            categoria: a.categoria,
            marca: a.marca,

            has_fv: a.has_fv,

            // linea: a.Linea,
            // filtrantes: a.Sobres_caja,

            empresa,
            createdBy: colaborador,
        }))

        await repository.createBulk(send)

        res.json({ code: 0 })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const deleteBulk = async (req, res) => {
    try {
        const { ids } = req.body

        if ((await repository.delete(ids)) == false) return resDeleteFalse(res)

        res.json({ code: 0 })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const updateBulk = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { ids, prop, val } = req.body

        //--- ACTUALIZAR ---//
        const updated = await repository.update(
            { id: ids },
            {
                [prop]: val,
                updatedBy: colaborador,
            },
        )

        if (updated == false) return resUpdateFalse(res)

        res.json({ code: 0 })
    } catch (error) {
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
        data.purchase_ok1 = estadosMap[data.purchase_ok]
        data.sale_ok1 = estadosMap[data.sale_ok]
        data.produce_ok1 = estadosMap[data.produce_ok]
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

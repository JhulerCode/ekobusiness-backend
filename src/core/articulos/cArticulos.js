import { Op, Sequelize } from 'sequelize'
import sequelize from '#db/sequelize.js'

import { Articulo } from '#db/models/Articulo.js'
import { ArticuloLinea } from '#db/models/ArticuloLinea.js'
import { ArticuloCategoria } from '#db/models/ArticuloCategoria.js'
import { RecetaInsumo } from '#db/models/RecetaInsumo.js'
import { existe, applyFilters } from '../../utils/mine.js'
import cSistema from "../_sistema/cSistema.js"
import { minioClient, minioDomain, minioBucket } from "../../lib/minioClient.js"

// ----- PARA INCLUDES EN SELECT ----- //
const attributes = ['id', 'nombre', 'unidad']

const stock1 = [Sequelize.literal(`(
    SELECT COALESCE(SUM(t.stock), 0)
    FROM transaccion_items AS t
    WHERE t.articulo = receta_insumos.articulo AND t.is_lote_padre = TRUE
)`), 'stock']

const includes = {
    produccion_tipo1: {
        model: ArticuloLinea,
        as: 'produccion_tipo1',
        attributes: ['id', 'nombre']
    },
    categoria1: {
        model: ArticuloCategoria,
        as: 'categoria1',
        attributes: ['id', 'nombre']
    },
    receta_insumos: {
        model: RecetaInsumo,
        as: 'receta_insumos',
        attributes: ['articulo', 'cantidad', 'orden'],
        include: {
            model: Articulo,
            as: 'articulo1',
            attributes: ['nombre', stock1]
        }
    },
}

const sqlStock = [Sequelize.literal(`(
    SELECT COALESCE(SUM(t.stock), 0)
    FROM transaccion_items AS t
    WHERE t.articulo = articulos.id AND t.is_lote_padre = TRUE
)`), 'stock']

const sqlValor = [Sequelize.literal(`(
    SELECT COALESCE(SUM(t.stock * t.pu), 0)
    FROM transaccion_items AS t
    WHERE t.articulo = articulos.id AND t.is_lote_padre = TRUE
)`), 'valor']

const create = async (req, res) => {
    try {
        const { colaborador } = req.user
        const {
            codigo, codigo_barra, nombre, unidad, marca,
            vende, has_fv, activo,
            igv_afectacion,
            tipo, categoria, mp_tipo, produccion_tipo, filtrantes, contenido_neto,
            is_combo, combo_articulos,
            is_ecommerce, descripcion, precio, precio_anterior, fotos, dimenciones, envase_tipo, ingredientes, beneficios,
        } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await existe(Articulo, { nombre, codigo_barra }, res) == true) return


        // ----- CREAR ----- //
        const nuevo = await Articulo.create({
            codigo, codigo_barra, nombre, unidad, marca,
            vende, has_fv, activo,
            igv_afectacion,
            tipo, categoria, mp_tipo, produccion_tipo, filtrantes, contenido_neto,
            is_combo, combo_articulos,
            is_ecommerce, descripcion, precio, precio_anterior, fotos, dimenciones, envase_tipo, ingredientes, beneficios,
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
            codigo, codigo_barra, nombre, unidad, marca,
            vende, has_fv, activo,
            igv_afectacion,
            tipo, categoria, mp_tipo, produccion_tipo, filtrantes, contenido_neto,
            is_combo, combo_articulos,
            is_ecommerce, descripcion, precio, precio_anterior, fotos, dimenciones, envase_tipo, ingredientes, beneficios,
        } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await existe(Articulo, { nombre, codigo_barra, id }, res) == true) return

        // ----- ACTUALIZAR ----- //
        const [affectedRows] = await Articulo.update(
            {
                codigo, codigo_barra, nombre, unidad, marca,
                vende, has_fv, activo,
                igv_afectacion,
                tipo, categoria, mp_tipo, produccion_tipo, filtrantes, contenido_neto,
                is_combo, combo_articulos,
                is_ecommerce, descripcion, precio, precio_anterior, fotos, dimenciones, envase_tipo, ingredientes, beneficios,
                updatedBy: colaborador
            },
            { where: { id } }
        )

        if (affectedRows > 0) {
            const data = await loadOne(id)

            res.json({ code: 0, data })
        }
        else {
            await transaction.rollback()

            res.json({ code: 1, msg: 'No se actualizó ningún registro' })
        }
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

async function loadOne(id) {
    let data = await Articulo.findByPk(id, {
        include: [includes.categoria1, includes.produccion_tipo1]
    })

    if (data) {
        data = data.toJSON()

        const estadosMap = cSistema.arrayMap('estados')
        const igv_afectacionesMap = cSistema.arrayMap('igv_afectaciones')

        data.has_fv1 = estadosMap[data.has_fv]
        data.activo1 = estadosMap[data.activo]
        data.igv_afectacion1 = igv_afectacionesMap[data.igv_afectacion]
    }

    return data
}

async function findAll({ incl, cols, fltr }) {
    const findProps = {
        include: [],
        attributes,
        where: {},
        order: [['tipo', 'ASC'], ['nombre', 'ASC']],
    }

    if (incl) {
        for (const a of incl) {
            if (incl.includes(a)) findProps.include.push(includes[a])
        }
    }

    if (cols) {
        const columns = Object.keys(Articulo.getAttributes());
        const cols1 = cols.filter(a => columns.includes(a))
        findProps.attributes = findProps.attributes.concat(cols1)

        if (cols.includes('stock')) findProps.attributes.push(sqlStock)
        if (cols.includes('valor')) findProps.attributes.push(sqlValor)

        // ----- AGREAGAR LOS REF QUE SI ESTÁN EN LA BD ----- //
        if (cols.includes('categoria')) findProps.include.push(includes.categoria1)
    }

    if (fltr) {
        Object.assign(findProps.where, applyFilters(fltr))
    }
    
    return await Articulo.findAll(findProps)
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        let data = await findAll(qry)

        // ----- AGREAGAR LOS REF QUE NO ESTÁN EN LA BD ----- //
        if (data.length > 0 && qry && qry.cols) {
            data = data.map(a => a.toJSON())

            const estadosMap = cSistema.arrayMap('estados')
            const igv_afectacionesMap = cSistema.arrayMap('igv_afectaciones')

            for (const a of data) {
                if (qry.cols.includes('has_fv')) a.has_fv1 = estadosMap[a.has_fv]
                if (qry.cols.includes('activo')) a.activo1 = estadosMap[a.activo]
                if (qry.cols.includes('igv_afectacion')) a.igv_afectacion1 = igv_afectacionesMap[a.igv_afectacion]
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

        const data = await Articulo.findByPk(id)

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
        const deletedCount = await Articulo.destroy({ where: { id } })

        const send = deletedCount > 0 ? { code: 0 } : { code: 1, msg: 'No se eliminó ningún registro' }

        res.json(send)
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const createBulk = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { tipo, articulos } = req.body
        const { colaborador } = req.user
        // console.log(articulos)
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
            categoria: a.Categoria,
            produccion_tipo: a.Tipo_produccion,
            filtrantes: a.Sobres_caja,
            is_combo: false,

            createdBy: colaborador
        }))

        await Articulo.bulkCreate(send, { transaction })
        await transaction.commit()

        res.json({ code: 0 })
    }
    catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const deleteBulk = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { ids } = req.body

        // ----- ELIMINAR ----- //
        const deletedCount = await Articulo.destroy({
            where: {
                id: {
                    [Op.in]: ids
                }
            },
            transaction
        })

        const send = deletedCount > 0 ? { code: 0 } : { code: 1, msg: 'No se eliminó ningún registro' }

        await transaction.commit()

        res.json(send)
    }
    catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const updateBulk = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { ids, prop, val } = req.body

        const edit = { [prop]: val }

        // ----- MODIFICAR ----- //
        await Articulo.update(
            edit,
            {
                where: {
                    id: {
                        [Op.in]: ids
                    }
                },
                transaction
            }
        )

        await transaction.commit()

        res.json({ code: 0 })
    }
    catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const updateFotos = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params

        // Si los datos llegan como string JSON, conviértelos
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
                // --- FOTO EXISTENTE ---
                new_fotos.push(a)
            }
        }

        // --- ACTUALIZAR EN BASE DE DATOS ---
        const [affectedRows] = await Articulo.update(
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

    createBulk,
    deleteBulk,
    updateBulk,

    updateFotos,
    findAll,
}
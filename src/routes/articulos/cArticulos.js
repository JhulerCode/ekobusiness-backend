import { Op, Sequelize } from 'sequelize'
import sequelize from '../../database/sequelize.js'
import { Articulo } from '../../database/models/Articulo.js'
import { ArticuloCategoria } from '../../database/models/ArticuloCategoria.js'
import { RecetaInsumo } from '../../database/models/RecetaInsumo.js'
import { existe, applyFilters } from '../../utils/mine.js'
import cSistema from "../_sistema/cSistema.js"

// ----- PARA INCLUDES EN SELECT ----- //
const attributes = ['id', 'nombre', 'unidad']

const stock1 = [Sequelize.literal(`(
    SELECT COALESCE(SUM(t.stock), 0)
    FROM transaccion_items AS t
    WHERE t.articulo = receta_insumos.articulo AND t.is_lote_padre = TRUE
)`), 'stock']

const includes = {
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
    }
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
            tipo, categoria, produccion_tipo, filtrantes,
            is_combo, combo_articulos,
        } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await existe(Articulo, { nombre, codigo_barra }, res) == true) return


        // ----- CREAR ----- //
        const nuevo = await Articulo.create({
            codigo, codigo_barra, nombre, unidad, marca,
            vende, has_fv, activo,
            igv_afectacion,
            tipo, categoria, produccion_tipo, filtrantes,
            is_combo, combo_articulos,
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
            tipo, categoria, produccion_tipo, filtrantes,
            is_combo, combo_articulos,
        } = req.body

        // ----- VERIFY SI EXISTE NOMBRE ----- //
        if (await existe(Articulo, { nombre, codigo_barra, id }, res) == true) return

        // ----- ACTUALIZAR ----- //
        const [affectedRows] = await Articulo.update(
            {
                codigo, codigo_barra, nombre, unidad, marca,
                vende, has_fv, activo,
                igv_afectacion,
                tipo, categoria, produccion_tipo, filtrantes,
                is_combo, combo_articulos,
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
        include: [includes.categoria1]
    })

    if (data) {
        data = data.toJSON()

        const estadosMap = cSistema.arrayMap('estados')
        const igv_afectacionesMap = cSistema.arrayMap('igv_afectaciones')
        const produccion_tiposMap = cSistema.arrayMap('produccion_tipos')

        data.has_fv1 = estadosMap[data.has_fv]
        data.activo1 = estadosMap[data.activo]
        data.igv_afectacion1 = igv_afectacionesMap[data.igv_afectacion]
        data.produccion_tipo1 = produccion_tiposMap[data.produccion_tipo]
    }

    return data
}

const find = async (req, res) => {
    try {
        const { colaborador, permisos } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes,
            order: [['tipo', 'ASC'], ['nombre', 'ASC']],
            where: {},
            include: []
        }

        if (qry) {
            if (qry.fltr) {
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }

            if (qry.cols) {
                findProps.attributes = findProps.attributes.concat(qry.cols.filter(a => a != 'stock' && a != 'valor'))

                if (qry.cols.includes('stock')) findProps.attributes.push(sqlStock)
                if (qry.cols.includes('valor')) findProps.attributes.push(sqlValor)

                // ----- AGREAGAR LOS REF QUE SI ESTÁN EN LA BD ----- //
                if (qry.cols.includes('categoria')) findProps.include.push(includes.categoria1)
            }

            if (qry.incl) {
                for (const a of qry.incl) {
                    if (qry.incl.includes(a)) findProps.include.push(includes[a])
                }
            }
        }

        let data = await Articulo.findAll(findProps)

        // ----- AGREAGAR LOS REF QUE NO ESTÁN EN LA BD ----- //
        if (data.length > 0 && qry.cols) {
            data = data.map(a => a.toJSON())

            const estadosMap = cSistema.arrayMap('estados')
            const igv_afectacionesMap = cSistema.arrayMap('igv_afectaciones')
            const produccion_tiposMap = cSistema.arrayMap('produccion_tipos')

            for (const a of data) {
                if (qry.cols.includes('has_fv')) a.has_fv1 = estadosMap[a.has_fv]
                if (qry.cols.includes('activo')) a.activo1 = estadosMap[a.activo]
                if (qry.cols.includes('igv_afectacion')) a.igv_afectacion1 = igv_afectacionesMap[a.igv_afectacion]
                if (qry.cols.includes('produccion_tipo')) a.produccion_tipo1 = produccion_tiposMap[a.produccion_tipo]
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
        console.log(articulos)
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

export default {
    find,
    findById,
    create,
    delet,
    update,

    createBulk,
    deleteBulk,
    updateBulk,
}
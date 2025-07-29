import sequelize from '../../database/sequelize.js'
import { FormatoValue } from '../../database/models/FormatoValue.js'
import { Transaccion, TransaccionItem } from '../../database/models/Transaccion.js'
import { Socio } from '../../database/models/Socio.js'
import { Articulo } from '../../database/models/Articulo.js'
import { ProduccionOrden } from '../../database/models/ProduccionOrden.js'
import { Maquina } from '../../database/models/Maquina.js'
import { Colaborador } from '../../database/models/Colaborador.js'
import { CuarentenaProducto } from '../../database/models/CuarentenaProducto.js'
import { existe, applyFilters } from '../../utils/mine.js'
import cSistema from "../_sistema/cSistema.js"

const includes = {
    transaccion_item1: {
        model: TransaccionItem,
        as: 'transaccion_item1',
        attributes: ['id', 'articulo', 'cantidad', 'lote', 'fv', 'calidad_revisado'],
        include: [
            {
                model: Transaccion,
                as: 'transaccion1',
                attributes: ['id', 'tipo', 'fecha', 'socio', 'guia'],
                include: [
                    {
                        model: Socio,
                        as: 'socio1',
                        attributes: ['nombres', 'apellidos', 'nombres_apellidos']
                    }
                ]
            },
            {
                model: Articulo,
                as: 'articulo1',
                attributes: ['id', 'nombre', 'unidad']
            },
        ]
    },
    produccion_orden1: {
        model: ProduccionOrden,
        as: 'produccion_orden1',
        attributes: ['id', 'fecha', 'maquina', 'articulo'],
        include: [
            {
                model: Articulo,
                as: 'articulo1',
                attributes: ['nombre', 'unidad']
            },
            {
                model: Maquina,
                as: 'maquina1',
                attributes: ['nombre']
            }
        ]
    },
    transaccion1: {
        model: Transaccion,
        as: 'transaccion1',
        attributes: ['id', 'fecha', 'socio', 'guia'],
        include: [
            {
                model: Socio,
                as: 'socio1',
                attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos']
            }
        ]
    },
    cuarentena_producto1: {
        model: CuarentenaProducto,
        as: 'cuarentena_producto1',
        attributes: ['id', 'lote', 'fv', 'cantidad', 'estado', 'produccion_orden'],
        include: {
            model: ProduccionOrden,
            as: 'produccion_orden1',
            attributes: ['id', 'tipo', 'maquina', 'fecha', 'articulo'],
            include: [
                {
                    model: Articulo,
                    as: 'articulo1',
                    attributes: ['nombre', 'unidad'],
                },
                {
                    model: Maquina,
                    as: 'maquina1',
                    attributes: ['nombre'],
                },
            ]
        }
    },
    maquina1: {
        model: Maquina,
        as: 'maquina1',
        attributes: ['id', 'nombre']
    },
    articulo1: {
        model: Articulo,
        as: 'articulo1',
        attributes: ['id', 'nombre', 'unidad']
    },
    colaborador1: {
        model: Colaborador,
        as: 'colaborador1',
        attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos']
    }
}

const create = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { codigo, values, transaccion_item, produccion_orden, transaccion, cuarentena_producto, maquina, articulo, colaborador } = req.body

        //----- CREAR ----- //
        const nuevo = await FormatoValue.create({
            codigo, values, transaccion_item, produccion_orden, transaccion, cuarentena_producto, maquina, articulo, colaborador,
            createdBy: req.user.colaborador
        }, { transaction })

        if (transaccion_item) {
            await TransaccionItem.update(
                {
                    calidad_revisado: nuevo.id,
                    updatedBy: colaborador
                },
                {
                    where: { id: transaccion_item },
                    transaction
                }
            )
        }

        if (codigo == 'RE-BPM-06' || codigo == 'RE-BPM-07' || codigo == 'RE-BPM-08') {
            await ProduccionOrden.update(
                {
                    calidad_revisado: nuevo.id,
                    updatedBy: colaborador
                },
                {
                    where: { id: produccion_orden },
                    transaction
                }
            )
        }

        if (codigo == 'RE-HACCP 03') {
            await ProduccionOrden.update(
                {
                    cf_ppc: nuevo.id,
                    updatedBy: colaborador
                },
                {
                    where: { id: produccion_orden },
                    transaction
                }
            )
        }

        if (transaccion) {
            await Transaccion.update(
                {
                    calidad_revisado_despacho: nuevo.id,
                    updatedBy: colaborador
                },
                {
                    where: { id: transaccion },
                    transaction
                }
            )
        }

        if (cuarentena_producto) {
            await CuarentenaProducto.update(
                {
                    cf_liberacion_lote: nuevo.id,
                    updatedBy: colaborador
                },
                {
                    where: { id: cuarentena_producto },
                    transaction
                }
            )
        }

        await transaction.commit()

        const data = await loadOne(nuevo.id, transaccion_item, produccion_orden, transaccion, cuarentena_producto, maquina, articulo, colaborador)
        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { id } = req.params
        const { codigo, values, transaccion_item, produccion_orden, transaccion, cuarentena_producto, maquina, articulo, colaborador } = req.body

        //----- ACTUALIZAR ----- //
        await FormatoValue.update(
            {
                codigo, values, transaccion_item, produccion_orden, transaccion, cuarentena_producto, maquina, articulo, colaborador,
                updatedBy: req.user.colaborador
            },
            {
                where: { id },
                transaction
            }
        )

        await transaction.commit()

        const data = await loadOne(id, transaccion_item, produccion_orden, transaccion, cuarentena_producto, maquina, articulo, colaborador)
        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

async function loadOne(id, transaccion_item, produccion_orden, transaccion, cuarentena_producto, maquina, articulo, colaborador) {
    const include = []

    if (transaccion_item) include.push(includes.transaccion_item1)
    if (produccion_orden) include.push(includes.produccion_orden1)
    if (transaccion) include.push(includes.transaccion1)
    if (cuarentena_producto) include.push(includes.cuarentena_producto1)
    if (maquina) include.push(includes.maquina1)
    if (articulo) include.push(includes.articulo1)
    if (colaborador) include.push(includes.colaborador1)

    let data = await FormatoValue.findByPk(id, {
        include
    })

    if (data) {
        data = data.toJSON()

        const conformidad_estadosMap = cSistema.arrayMap('conformidad_estados')
        const cf_re_bpm_20_coloresMap = cSistema.arrayMap('cf_re_bpm_20_colores')
        const cf_re_bpm_20_estadosMap = cSistema.arrayMap('cf_re_bpm_20_estados')
        const estadosMap = cSistema.arrayMap('estados')
        const cf_re_bpm_31_tiposMap = cSistema.arrayMap('cf_re_bpm_31_tipos')

        for (const b of data.values) {
            data[b.id] = b.value

            if (b.relacion == 'conformidad_estados') {
                data[b.id + '1'] = conformidad_estadosMap[data[b.id]]
            }

            if (b.relacion == 'cf_re_bpm_20_colores') {
                data[b.id + '1'] = cf_re_bpm_20_coloresMap[data[b.id]]
            }

            if (b.relacion == 'cf_re_bpm_20_estados') {
                data[b.id + '1'] = cf_re_bpm_20_estadosMap[data[b.id]]
            }

            if (b.relacion == 'estados') {
                data[b.id + '1'] = estadosMap[data[b.id]]
            }

            if (b.relacion == 'cf_re_bpm_31_tipos') {
                data[b.id + '1'] = cf_re_bpm_31_tiposMap[data[b.id]]
            }
        }

        delete data.values
    }

    return data
}

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id', 'codigo', 'values'],
            order: [['createdAt', 'DESC']],
            where: {},
            include: [],
        }

        if (qry) {
            if (qry.fltr) {
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }

            if (qry.cols) {
                findProps.attributes = findProps.attributes.concat(qry.cols)

                //----- AGREAGAR LOS REF QUE SI ESTÁN EN LA BD ----- //
                if (qry.cols.includes('transaccion_item')) findProps.include.push(includes.transaccion_item1)
                if (qry.cols.includes('produccion_orden')) findProps.include.push(includes.produccion_orden1)
                if (qry.cols.includes('transaccion')) findProps.include.push(includes.transaccion1)
                if (qry.cols.includes('cuarentena_producto')) findProps.include.push(includes.cuarentena_producto1)
                if (qry.cols.includes('maquina')) findProps.include.push(includes.maquina1)
                if (qry.cols.includes('articulo')) findProps.include.push(includes.articulo1)
                if (qry.cols.includes('colaborador')) findProps.include.push(includes.colaborador1)
            }
        }

        let data = await FormatoValue.findAll(findProps)

        if (data.length > 0) {
            data = data.map(a => a.toJSON())

            const conformidad_estadosMap = cSistema.arrayMap('conformidad_estados')
            const cf_re_bpm_20_coloresMap = cSistema.arrayMap('cf_re_bpm_20_colores')
            const cf_re_bpm_20_estadosMap = cSistema.arrayMap('cf_re_bpm_20_estados')
            const estadosMap = cSistema.arrayMap('estados')
            const cf_re_bpm_31_tiposMap = cSistema.arrayMap('cf_re_bpm_31_tipos')

            for (const a of data) {
                for (const b of a.values) {
                    a[b.id] = b.value

                    if (b.relacion == 'conformidad_estados') {
                        a[b.id + '1'] = conformidad_estadosMap[a[b.id]]
                    }

                    if (b.relacion == 'cf_re_bpm_20_colores') {
                        a[b.id + '1'] = cf_re_bpm_20_coloresMap[a[b.id]]
                    }

                    if (b.relacion == 'cf_re_bpm_20_estados') {
                        a[b.id + '1'] = cf_re_bpm_20_estadosMap[a[b.id]]
                    }

                    if (b.relacion == 'estados') {
                        a[b.id + '1'] = estadosMap[a[b.id]]
                    }

                    if (b.relacion == 'cf_re_bpm_31_tipos') {
                        a[b.id + '1'] = cf_re_bpm_31_tiposMap[a[b.id]]
                    }
                }

                delete a.values
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

        let data = await FormatoValue.findByPk(id, {
            include: [
                includes.transaccion_item1,
                includes.produccion_orden1,
                includes.transaccion1,
                includes.cuarentena_producto1,
                includes.maquina1,
                includes.articulo1,
                includes.colaborador1,
            ]
        })

        if (data) {
            data = data.toJSON()

            for (const b of data.values) {
                data[b.id] = b.value
            }

            delete data.values
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

        const deletedCount = await FormatoValue.destroy({ where: { id } })

        const send = deletedCount > 0 ? { code: 0 } : { code: 1, msg: 'No se eliminó ningún registro' }

        res.json(send)
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
}
import sequelize from '#db/sequelize.js'
import { Repository } from '#db/Repository.js'
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'
import { formatDate } from '#shared/dayjs.js'
import { arrayMap } from '#store/system.js'

const repository = new Repository('ProduccionOrden')
const KardexRep = new Repository('Kardex')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const virtuals = ['fecha', 'estado', 'estado_calidad_revisado', 'estado_cf_ppc']

        virtuals.forEach((v) => {
            if (qry?.cols?.includes(v) || qry?.cols?.includes(v.replace('estado_', '')))
                qry.cols.push(`${v}1`)
        })

        const response = await repository.find(qry, true)

        const hasPage = qry?.page
        const data = hasPage ? response.data : response
        const meta = hasPage ? response.meta : null

        res.json({ code: 0, data, meta })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const data = await repository.find({ id, ...qry }, true)

        res.json({
            code: 0,
            data: { ...data, produccion_orden_insumos: [], produccion_orden_pts: [] },
        })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador, empresa } = req.user
        const body = req.body

        //--- CREAR ----- //
        const nuevo = await repository.create(
            {
                ...body,
                empresa,
                createdBy: colaborador,
            },
            transaction,
        )

        // const produccion_orden_insumos = body.produccion_orden_insumos.map((a) => {
        //     return {
        //         ...a,
        //         produccion_orden: nuevo.id,
        //         empresa,
        //         createdBy: colaborador,
        //     }
        // })
        // await KardexRep.createBulk(produccion_orden_insumos, transaction)

        await transaction.commit()

        const data = await loadOne(nuevo.id)

        res.json({ code: 0, data })
    } catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador, empresa } = req.user
        const { id } = req.params
        const body = req.body

        //--- Obtener el artículo actual ---//
        const currentRecord = await repository.find({ id }, true)
        if (!currentRecord) {
            await transaction.rollback()
            return res.status(404).json({ code: -1, msg: 'Orden de producción no encontrada' })
        }

        //--- Detectar columnas modificadas ---//
        const diff = repository.getDiff(currentRecord, body)
        if (diff) {
            diff.updatedBy = colaborador
            await repository.update({ id }, diff, transaction)
        }

        //--- Si el articulo es diferente, eliminar los kardex y crear nuevos ---//
        // if (diff.articulo) {
        //     await KardexRep.delete({ produccion_orden: id }, transaction)

        //     const produccion_orden_insumos = body.produccion_orden_insumos.map((a) => {
        //         return {
        //             ...a,
        //             produccion_orden: id,
        //             empresa,
        //             createdBy: colaborador,
        //         }
        //     })
        //     await KardexRep.createBulk(produccion_orden_insumos, transaction)
        // }

        await transaction.commit()

        const data = await loadOne(id)

        res.json({ code: 0, data })
    } catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params

        if ((await repository.delete({ id })) == false) return resDeleteFalse(res)

        res.json({ code: 0 })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const abrirCerrar = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { ids, estado } = req.body

        //--- ABRIR ----- //
        const updated = await repository.update(
            { id: ids },
            {
                estado,
                updatedBy: colaborador,
            },
        )

        if (updated == false) return resUpdateFalse(res)

        const estados = arrayMap('produccion_orden_estados')
        const data = {
            id: ids,
            estado,
            estado1: estados[estado],
        }

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const inicioFin = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params
        const { inicio, fin } = req.body

        let send = { id, updatedBy: colaborador }
        if (inicio) send.inicio = inicio
        if (fin) send.fin = fin

        //--- ABRIR ----- //
        const updated = await repository.update({ id }, send)

        if (updated == false) return resUpdateFalse(res)

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findTrazabilidad = async (req, res) => {
    try {
        const { id } = req.params

        // const data = await repository.find({ id, incl: ['articulo1', 'maquina1'] }, true)

        const kardexes = await KardexRep.find(
            {
                cols: ['tipo', 'articulo', 'cantidad', 'lote', 'fv'],
                incl: ['articulo1', 'lote_padre1'],
                fltr: {
                    produccion_orden: { op: 'Es', val: id },
                },
                ordr: [['articulo1', 'nombre', 'ASC']],
            },
            true,
        )

        const insumosMap = {}
        const data = { productos_terminados: [] }

        for (const a of kardexes) {
            if (a.tipo == 2 || a.tipo == 3) {
                const key = a.articulo + '-' + a.lote_padre

                if (!insumosMap[key]) {
                    insumosMap[key] = { ...a, cantidad: 0 }
                }

                if (a.tipo == 2) {
                    insumosMap[key].cantidad += Number(a.cantidad)
                } else if (a.tipo == 3) {
                    insumosMap[key].cantidad -= Number(a.cantidad)
                }
            }

            if (a.tipo == 4) {
                data.productos_terminados.push(a)
            }
        }

        data.insumos = Object.values(insumosMap)

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

//--- Helpers ---//
async function loadOne(id) {
    const data = await repository.find(
        { id, incl: ['articulo1', 'maquina1', 'responsable1', 'linea1'] },
        true,
    )

    return data
}

export default {
    find,
    findById,
    create,
    update,
    delet,
    abrirCerrar,
    inicioFin,
    findTrazabilidad,
}

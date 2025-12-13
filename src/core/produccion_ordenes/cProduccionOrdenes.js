import { Repository } from '#db/Repository.js'
import cSistema from '../_sistema/cSistema.js'

const repository = new Repository('ProduccionOrden')
const KardexRep = new Repository('Kardex')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const data = await repository.find(qry, true)

        if (data.length > 0) {
            const produccion_orden_estadosMap = cSistema.arrayMap('produccion_orden_estados')
            const cumplidado_estadosMap = cSistema.arrayMap('cumplidado_estados')

            for (const a of data) {
                if (qry?.cols?.includes('estado')) a.estado1 = produccion_orden_estadosMap[a.estado]
                if (a.estado_calidad_revisado) a.estado_calidad_revisado1 = cumplidado_estadosMap[a.estado_calidad_revisado]
                if (a.estado_cf_ppc) a.estado_cf_ppc1 = cumplidado_estadosMap[a.estado_cf_ppc]
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

        const data = await repository.find({ id, incl: ['maquina1', 'articulo1'] })

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
            fecha, tipo, orden, maquina, maquina_info,
            articulo, articulo_info, cantidad, estado, observacion,
        } = req.body

        // ----- CREAR ----- //
        const nuevo = await repository.create({
            fecha, tipo, orden, maquina, maquina_info,
            articulo, articulo_info, cantidad, estado, observacion,
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
        const { colaborador } = req.user
        const { id } = req.params
        const {
            fecha, tipo, orden, maquina, maquina_info,
            articulo, articulo_info, cantidad, estado, observacion,
        } = req.body

        //--- ACTUALIZAR ---//
        const updated = await repository.update({ id }, {
            fecha, tipo, orden, maquina, maquina_info,
            articulo, articulo_info, cantidad, estado, observacion,
            updatedBy: colaborador
        })

        if (updated == false) return

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

        if (await repository.delete({ id }) == false) return

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const terminar = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params

        //--- CERRAR ---//
        const updated = await repository.update({ id }, {
            estado: 2,
            updatedBy: colaborador
        })

        if (updated == false) return

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const abrir = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params

        // ----- ABRIR ----- //
        const updated = await repository.update({ id }, {
            estado: 1,
            updatedBy: colaborador
        })

        if (updated == false) return

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findTrazabilidad = async (req, res) => {
    try {
        const { id } = req.params

        // const data = await repository.find({ id, incl: ['articulo1', 'maquina1'] }, true)

        const kardexes = await KardexRep.find({
            cols: ['tipo', 'articulo', 'cantidad'],
            incl: ['articulo1', 'lote_padre1'],
            fltr: {
                produccion_orden: { op: 'Es', val: id }
            },
            ordr: [['articulo1', 'nombre', 'ASC']]
        }, true)

        const insumosMap = {}
        const data = { productos_terminados: [] }

        for (const a of kardexes) {
            if (a.tipo == 2 || a.tipo == 3) {
                const key = a.articulo + '-' + a.lote_padre

                if (!insumosMap[key]) {
                    insumosMap[key] = { ...a, cantidad: 0 };
                }

                if (a.tipo == 2) {
                    insumosMap[key].cantidad += Number(a.cantidad);
                } else if (a.tipo == 3) {
                    insumosMap[key].cantidad -= Number(a.cantidad);
                }
            }

            if (a.tipo == 4) {
                data.productos_terminados.push(a)
            }
        }

        data.insumos = Object.values(insumosMap)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


//--- Helpers ---//
async function loadOne(id) {
    const data = await repository.find({ id, incl: ['articulo1', 'maquina1'] }, true)

    if (data) {
        const produccion_orden_estadosMap = cSistema.arrayMap('produccion_orden_estados')

        data.estado1 = produccion_orden_estadosMap[data.estado]
    }

    return data
}
export default {
    find,
    findById,
    create,
    update,
    delet,
    terminar,
    abrir,
    findTrazabilidad,
}
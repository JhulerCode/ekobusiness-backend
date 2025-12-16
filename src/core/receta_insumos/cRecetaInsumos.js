import { Repository } from '#db/Repository.js'
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'

const repository = new Repository('RecetaInsumo')
const ArticuloRepo = new Repository('Articulo')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const data = await repository.find(qry)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    try {
        const { colaborador, empresa } = req.user
        const { articulo_principal, articulo, cantidad, orden } = req.body

        //--- CREAR ---//
        const nuevo = await repository.create({
            articulo_principal, articulo, cantidad, orden,
            empresa,
            createdBy: colaborador
        })

        const data = await repository.find({ id: nuevo.id, incl: ['articulo1'] })

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
        const { articulo_principal, articulo, cantidad, orden } = req.body

        //--- ACTUALIZAR ---//
        const updated = await repository.update({ id }, {
            cantidad, orden,
            updatedBy: colaborador
        })

        if (updated == false) return resUpdateFalse(res)

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    try {
        const { id } = req.params

        if (await repository.delete({ id }) == false) return resDeleteFalse(res)

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const calcularNecesidad = async (req, res) => {
    try {
        const { articulos } = req.body

        //--- Receta de los productos ---//
        const qry = {
            fltr: { id: { op: 'Es', val: articulos.map(a => a.id) } },
            incl: ['receta_insumos'],
            iccl: {
                receta_insumos: {
                    incl: ['articulo1']
                }
            }
        }

        const recetas = await ArticuloRepo.find(qry, true)
        const recetasMap = recetas.reduce((obj, a) => (obj[a.id] = a, obj), {})
        const insumosId = recetas.flatMap(a => a.receta_insumos.map(b => b.articulo))

        //--- Stock de insumos ---//
        const qry1 = {
            fltr: { id: { op: 'Es', val: insumosId } },
            sqls: ['articulo_stock'],
        }

        const insumos = await ArticuloRepo.find(qry1, true)
        const insumosMap = insumos.reduce((obj, a) => (obj[a.id] = a, obj), {})

        for (const a of articulos) {
            const receta = recetasMap[a.id].receta_insumos

            a.receta = receta.map(b => ({
                ...b,
                cantidad_necesitada: b.cantidad * (a.cantidad || 0),
                stock: insumosMap[b.articulo].stock
            }));
        }

        res.json({ code: 0, data: articulos })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    find,
    create,
    delet,
    update,
    calcularNecesidad,
}
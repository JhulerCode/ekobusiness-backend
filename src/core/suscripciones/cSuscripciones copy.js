import { Repository } from '#db/Repository.js'
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'
import { actualizarEmpresa } from '#store/empresas.js'
import dayjs from '#shared/dayjs.js'

const repository = new Repository('Suscripcion')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const { subdominio } = req.empresa
        const qry = req.query.qry ? JSON.parse(req.query.qry) : { fltr: {} }

        if (subdominio != 'admin') qry.fltr.empresa = { op: 'Es', val: empresa }

        const virtuals = [
            'fecha_inicio',
            'fecha_vencimiento',
            'fecha_ultimo_pago',
            'prox_fecha_pago',
            'estado',
        ]

        virtuals.forEach((v) => {
            if (qry?.cols?.includes(v)) qry.cols.push(`${v}1`)
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

        const data = await repository.find({ id, ...qry })

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const create = async (req, res) => {
    try {
        const { colaborador } = req.user
        const {
            plan_nombre,
            periodo,
            limite_usuarios,
            precio,
            moneda,
            fecha_inicio,
            fecha_vencimiento,
            fecha_ultimo_pago,
            prox_fecha_pago,
            estado,
            autorenovar,
            observaciones,
            metadata,
            empresa,
        } = req.body

        //--- CREAR ---//
        const nuevo = await repository.create({
            plan_nombre,
            periodo,
            limite_usuarios,
            precio,
            moneda,
            fecha_inicio,
            fecha_vencimiento,
            fecha_ultimo_pago,
            prox_fecha_pago,
            estado,
            autorenovar,
            observaciones,
            metadata,
            empresa,
            createdBy: colaborador,
            updatedBy: colaborador,
        })

        const data = await loadOne(nuevo.id)

        // --- ACTUALIZAR CACHÉ DE LA EMPRESA --- //
        if (data.empresa) {
            await syncEmpresaCache(data.empresa)
        }

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    try {
        const { colaborador } = req.user
        const { id } = req.params
        const {
            plan_nombre,
            periodo,
            limite_usuarios,
            precio,
            moneda,
            fecha_inicio,
            fecha_vencimiento,
            fecha_ultimo_pago,
            prox_fecha_pago,
            estado,
            autorenovar,
            observaciones,
            metadata,
            empresa,
        } = req.body

        //--- ACTUALIZAR ---//
        const updated = await repository.update(
            { id },
            {
                plan_nombre,
                periodo,
                limite_usuarios,
                precio,
                moneda,
                fecha_inicio,
                fecha_vencimiento,
                fecha_ultimo_pago,
                prox_fecha_pago,
                estado,
                autorenovar,
                observaciones,
                metadata,
                empresa,
                updatedBy: colaborador,
            },
        )

        if (updated == false) return resUpdateFalse(res)

        const data = await loadOne(id)

        // --- ACTUALIZAR CACHÉ DE LA EMPRESA --- //
        if (data.empresa) {
            await syncEmpresaCache(data.empresa)
        }

        res.json({ code: 0, data })
    } catch (error) {
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

//--- Helpers ---//
async function loadOne(id) {
    let data = await repository.find({
        id,
        incl: ['moneda1', 'empresa1'],
    })

    return data
}

async function syncEmpresaCache(empresaId) {
    if (!empresaId) return
    const qrySub = {
        fltr: {
            empresa: { op: 'Es', val: empresaId },
            fecha_vencimiento: {
                op: 'Es igual o posterior a',
                val: dayjs().format('YYYY-MM-DD'),
            },
        },
        cols: ['fecha_vencimiento', 'limite_usuarios'],
        sort: [['fecha_vencimiento', 'DESC']],
    }
    const suscripciones = await repository.find(qrySub)

    await actualizarEmpresa(empresaId, {
        suscripciones: suscripciones.map((s) => ({
            fecha_vencimiento: s.fecha_vencimiento,
            limite_usuarios: s.limite_usuarios || 0,
        })),
    })
}

export default {
    create,
    update,
    find,
    findById,
    delet,
}

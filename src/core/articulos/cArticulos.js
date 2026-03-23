import sequelize from '#db/sequelize.js'
import { Repository } from '#db/Repository.js'
import { minioPutObject, minioRemoveObject } from '#infrastructure/minioClient.js'
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'

const repository = new Repository('Articulo')
const ArticuloSupplierRepository = new Repository('ArticuloSupplier')
const ComboComponenteRepository = new Repository('ComboComponente')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const virtuals = [
            'activo',
            'has_fv',
            'igv_afectacion',
            'is_ecommerce',
            'purchase_ok',
            'sale_ok',
            'produce_ok',
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
    const transaction = await sequelize.transaction()

    try {
        const { colaborador, empresa } = req.user
        const body = req.body

        //--- VERIFY SI EXISTE NOMBRE ---//
        if ((await repository.existe({ nombre: body.nombre, empresa }, res)) == true) return

        //--- CREAR ---//
        const nuevo = await repository.create(
            {
                ...body,
                empresa,
                createdBy: colaborador,
            },
            transaction,
        )

        //--- CREAR SUPLIERS ---//
        const send_articulo_suppliers = body.articulo_suppliers.map((a) => ({
            ...a,
            articulo: nuevo.id,
            empresa,
            createdBy: colaborador,
            updatedBy: colaborador,
        }))
        await ArticuloSupplierRepository.createBulk(send_articulo_suppliers, transaction)

        //--- CREAR COMBO COMPONENTES ---//
        if (body.type == 'combo') {
            const send_combo_componentes = body.combo_componentes.map((a) => ({
                ...a,
                articulo_principal: nuevo.id,
                empresa,
                createdBy: colaborador,
                updatedBy: colaborador,
            }))

            await ComboComponenteRepository.createBulk(send_combo_componentes, transaction)
        }

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

        // 1️⃣ Obtener el artículo actual
        const currentArticulo = await repository.find({ id }, true)
        if (!currentArticulo) {
            await transaction.rollback()
            return res.status(404).json({ code: -1, msg: 'Artículo no encontrado' })
        }

        // 2️⃣ Verificar si el nuevo nombre ya existe (si cambió)
        if (body.nombre && body.nombre !== currentArticulo.nombre) {
            if ((await repository.existe({ nombre: body.nombre, id, empresa }, res)) == true) {
                await transaction.rollback()
                return
            }
        }

        // 3️⃣ Detectar columnas modificadas
        const diff = repository.getDiff(currentArticulo, body)
        if (diff) {
            diff.updatedBy = colaborador
            await repository.update({ id }, diff, transaction)
        }

        // 4️⃣ Actualizar Relaciones (Proveedores)
        if (body.articulo_suppliers) {
            await repository.syncHasMany(
                {
                    model: 'ArticuloSupplier',
                    foreignKey: 'articulo',
                    parentId: id,
                    newData: body.articulo_suppliers,
                    empresa,
                    colaborador,
                },
                transaction,
            )
        }

        // // 5️⃣ Actualizar Relaciones (Componentes de Combo)
        if (body.combo_componentes) {
            await repository.syncHasMany(
                {
                    model: 'ComboComponente',
                    foreignKey: 'articulo_principal',
                    parentId: id,
                    newData: body.combo_componentes,
                    updateFields: ['articulo', 'cantidad', 'orden', 'updatedBy'],
                },
                transaction,
            )
        }

        await transaction.commit()

        // const data = await loadOne(id)
        res.json({ code: 0 })
    } catch (error) {
        if (transaction) await transaction.rollback()
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const delet = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { id } = req.params
        const { fotos } = req.body

        await ArticuloSupplierRepository.delete({ articulo: id }, transaction)
        await ComboComponenteRepository.delete({ articulo_principal: id }, transaction)

        if ((await repository.delete({ id }, transaction)) == false) return resDeleteFalse(res)

        await transaction.commit()

        if (fotos && fotos.length > 0) {
            for (const a of fotos) await minioRemoveObject(a.id)
        }

        res.json({ code: 0 })
    } catch (error) {
        await transaction.rollback()

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

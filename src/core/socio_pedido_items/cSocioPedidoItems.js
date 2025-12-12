import { Repository } from '#db/Repository.js'
import { SocioPedido, SocioPedidoItem } from '#db/models/SocioPedido.js'
import { Socio } from '#db/models/Socio.js'
import { Articulo } from '#db/models/Articulo.js'
import { applyFilters } from '#shared/mine.js'

const repository = new Repository('SocioPedidoItem')

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id'],
            order: [['createdAt', 'DESC']],
            where: {},
            include: [
            ]
        }

        const include1 = {
            socio_pedido1: {
                model: SocioPedido,
                as: 'socio_pedido1',
                attributes: ['id', 'fecha', 'socio', 'codigo'],
                include: [
                    {
                        model: Socio,
                        as: 'socio1',
                        attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos']
                    }
                ],
            },
            articulo1: {
                model: Articulo,
                as: 'articulo1',
                attributes: ['nombre', 'unidad'],
                where: {},
            },
        }

        if (qry) {
            if (qry.incl) {
                for (const a of qry.incl) {
                    if (qry.incl.includes(a)) findProps.include.push(include1[a])
                }
            }

            if (qry.fltr) {
                const fltr1 = JSON.parse(JSON.stringify(qry.fltr))

                delete qry.fltr.socio_pedido_tipo
                delete qry.fltr.socio_pedido_fecha
                delete qry.fltr.socio_pedido_socio

                delete qry.fltr.articulo_nombre

                Object.assign(findProps.where, applyFilters(qry.fltr))

                if (fltr1.socio_pedido_tipo) {
                    Object.assign(findProps.where, applyFilters({ '$socio_pedido1.tipo$': fltr1.socio_pedido_tipo }))
                }

                if (fltr1.socio_pedido_fecha) {
                    Object.assign(findProps.where, applyFilters({ '$socio_pedido1.fecha$': fltr1.socio_pedido_fecha }))
                }

                if (fltr1.socio_pedido_socio) {
                    Object.assign(findProps.where, applyFilters({ '$socio_pedido1.socio$': fltr1.socio_pedido_socio }))
                }

                if (fltr1.articulo_nombre) {
                    Object.assign(findProps.where, applyFilters({ '$articulo1.nombre$': fltr1.articulo_nombre }))
                }
            }

            if (qry.cols) {
                const excludeCols = [
                    'socio_pedido_fecha', 'socio_pedido_codigo', 'socio_pedido_socio',
                    'articulo_nombre',
                ]
                const cols1 = qry.cols.filter(a => !excludeCols.includes(a))
                findProps.attributes = findProps.attributes.concat(cols1)
            }
        }

        let data = await SocioPedidoItem.findAll(findProps)

        // if (data.length > 0) {
        //     data = data.map(a => a.toJSON())

        //     for (const a of data) {
        //     }
        // }

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
            articulo, nombre, unidad, has_fv,
            cantidad, entregado,
            pu, igv_afectacion, igv_porcentaje,
            blend_datos, nota,
            socio_pedido
        } = req.body

        //--- VERIFY SI EXISTE ---//
        if (await repository.existe({ articulo, socio_pedido, empresa }, res, 'El artículo ya fue agregado') == true) return

        //--- CREAR ---//
        const nuevo = await repository.create({
            articulo, nombre, unidad, has_fv,
            cantidad, entregado,
            pu, igv_afectacion, igv_porcentaje,
            blend_datos, nota,
            socio_pedido,
            empresa,
            createdBy: colaborador,
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
            articulo, nombre, unidad, has_fv,
            cantidad, entregado,
            pu, igv_afectacion, igv_porcentaje,
            blend_datos, nota,
            socio_pedido
        } = req.body

        //--- VERIFY SI EXISTE NOMBRE ---//
        if (await repository.existe({ articulo, socio_pedido, id, empresa }, res, 'El artículo ya fue agregado') == true) return

        //--- ACTUALIZAR ---//
        const updated = await repository.update(id, {
            articulo, nombre, unidad, has_fv,
            cantidad, entregado,
            pu, igv_afectacion, igv_porcentaje,
            blend_datos, nota,
            updatedBy: colaborador
        })

        if (updated == false) return

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


//--- Helpers ---//
async function loadOne(id) {
    const data = await repository.find({ id })

    return data
}

export default {
    find,
    update,
}
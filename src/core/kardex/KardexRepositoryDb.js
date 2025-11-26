import { Kardex } from "#db/models/Kardex.js"
import { Transaccion } from "#db/models/Transaccion.js"
import { Socio } from "#db/models/Socio.js"
import { Maquina } from "#db/models/Maquina.js"
import { ProduccionOrden } from "#db/models/ProduccionOrden.js"
import { ArticuloLinea } from "#db/models/ArticuloLinea.js"
import { Articulo } from "#db/models/Articulo.js"
import { jdFindAll } from '#db/helpers.js'

const include1 = {
    lote_padre1: {
        model: Kardex,
        as: 'lote_padre1',
        attributes: ['moneda', 'tipo_cambio', 'igv_afectacion', 'igv_porcentaje', 'pu', 'fv', 'lote'],
        required: false
    },
    transaccion1: {
        model: Transaccion,
        as: 'transaccion1',
        attributes: ['id', 'socio', 'guia', 'factura'],
        required: false,
        include: [
            {
                model: Socio,
                as: 'socio1',
                attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos']
            }
        ],
    },
    maquina1: {
        model: Maquina,
        as: 'maquina1',
        attributes: ['id', 'nombre'],
        required: false,
    },
    produccion_orden1: {
        model: ProduccionOrden,
        as: 'produccion_orden1',
        attributes: ['id', 'tipo', 'maquina', 'fecha', 'articulo'],
        include: [
            {
                model: ArticuloLinea,
                as: 'tipo1',
                attributes: ['id', 'nombre'],
            }
        ],
        required: false,
    },
    articulo1: {
        model: Articulo,
        as: 'articulo1',
        attributes: ['nombre', 'unidad'],
    },
}

export default class KardexRepositoryDb {
    async find(qry, tojson) {
        const send = {
            model: Kardex,
            qry,
            include1,
            tojson
        }
        return await jdFindAll(send)
    }

    async findById(id) {
        const data = await Kardex.findByPk(id)

        return data ? data.toJSON() : null
    }

    async create(data) {
        return await Kardex.create(data)
    }

    async update(id, data) {
        const socio = await Kardex.findByPk(id)
        if (!socio) throw new Error("Kardex no encontrado")
        return await socio.update(data)
    }

    async delete(id) {
        const socio = await Kardex.findByPk(id)
        if (!socio) throw new Error("Kardex no encontrado")
        return await socio.destroy()
    }
}
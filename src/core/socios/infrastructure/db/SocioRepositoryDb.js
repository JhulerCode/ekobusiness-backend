import { Socio } from "#db/models/Socio.js"
import { PrecioLista } from "#db/models/PrecioLista.js"
import { applyFilters, setFindAllProps } from '#db/helpers.js'
import SocioRepository from '../../domain/SocioRepository.js'

export default class SocioRepositoryDb extends SocioRepository {
    async find(qry) {
        const include1 = {
            precio_lista1: {
                model: PrecioLista,
                as: 'precio_lista1',
                attributes: ['id', 'nombre']
            }
        }

        const findProps = setFindAllProps(Socio, qry, include1)

        return await Socio.findAll(findProps)
    }

    async findById(id) {
        return await Socio.findByPk(id)
    }

    async findByDocNumero(doc_numero) {
        return await Socio.findOne({ where: { doc_numero } })
    }

    async create(data) {
        return await Socio.create(data)
    }

    async update(id, data) {
        const socio = await Socio.findByPk(id)
        if (!socio) throw new Error("Socio no encontrado")
        return await socio.update(data)
    }

    async delete(id) {
        const socio = await Socio.findByPk(id)
        if (!socio) throw new Error("Socio no encontrado")
        return await socio.destroy()
    }
}
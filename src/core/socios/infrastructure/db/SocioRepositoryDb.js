import { Socio } from "#db/models/Socio.js"
import { PrecioLista } from "#db/models/PrecioLista.js"
import { applyFilters, jdFindAll } from '#db/helpers.js'
import SocioRepository from '../../domain/SocioRepository.js'

const include1 = {
    precio_lista1: {
        model: PrecioLista,
        as: 'precio_lista1',
        attributes: ['id', 'nombre']
    }
}

export default class SocioRepositoryDb extends SocioRepository {
    async find(qry) {
        const findProps = jdFindAll(Socio, qry, include1)

        const data = await Socio.findAll(findProps)
        return data.map(a => a.toJSON())
    }

    async findById(id) {
        const data = await Socio.findByPk(id)

        return data ? data.toJSON() : null
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
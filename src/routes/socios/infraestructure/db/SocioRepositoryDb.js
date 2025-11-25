import { SocioModel } from "./SocioModel.js"
import { PrecioLista } from "../models/PrecioLista.js"
import { applyFilters } from '../helpers/db.js'
import SocioRepository from '../../domain/SocioRepository.js'

export default class SocioRepositoryDb extends SocioRepository {
    async find(qry) {
        const include1 = {
            precio_lista1: {
                model: PrecioLista,
                as: 'precio_lista1',
                attributes: ['id', 'nombre', 'moneda']
            }
        }

        const findProps = {
            include: [],
            attributes: ['id'],
            where: {},
            order: [['nombres', 'ASC']],
        }

        if (qry.incl) {
            for (const a of qry.incl) {
                if (include1[a]) findProps.include.push(include1[a])
            }
        }

        if (qry.cols) {
            findProps.attributes = findProps.attributes.concat(qry.cols)
        }

        if (qry.fltr) {
            Object.assign(findProps.where, applyFilters(qry.fltr))
        }

        return await SocioModel.findAll(findProps)
    }

    async findById(id) {
        return await SocioModel.findByPk(id, { raw: true })
    }

    async findByDocNumero(doc_numero) {
        return await SocioModel.findOne({ where: { doc_numero } })
    }

    async create(data) {
        return await SocioModel.create(data)
    }

    async update(id, data) {
        const socio = await SocioModel.findByPk(id)
        if (!socio) throw new Error("SocioModel no encontrado")
        return await socio.update(data)
    }

    async delete(id) {
        const socio = await SocioModel.findByPk(id)
        if (!socio) throw new Error("SocioModel no encontrado")
        return await socio.destroy()
    }
}
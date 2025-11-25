import cSistema from "#core/_sistema/cSistema.js"

export default class SocioUseCases {
	constructor(socioRepository) {
		this.repo = socioRepository
	}

	async find(qry) {
		const data = await this.repo.find(qry)

		const documentos_identidadMap = cSistema.arrayMap('documentos_identidad')
		const estadosMap = cSistema.arrayMap('estados')

		for (const a of data) {
			if (qry.cols?.includes('doc_tipo')) a.doc_tipo1 = documentos_identidadMap[a.doc_tipo]
			if (qry.cols?.includes('activo')) a.activo1 = estadosMap[a.activo]
		}

		return data
	}

	async findById(id) {
		return await this.repo.findById(id)
	}

	async create(data) {
		if (!data.nombres) throw new Error("Falta nombre")
		return await this.repo.create(data)
	}

	async update(id, data) {
		return await this.repo.update(id, data)
	}

	async delete(id) {
		return await this.repo.delete(id)
	}
}
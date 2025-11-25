export default class SocioUseCases {
	constructor(socioRepository) {
		this.repo = socioRepository
	}

	async find(qry) {
		return await this.repo.find(qry)
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
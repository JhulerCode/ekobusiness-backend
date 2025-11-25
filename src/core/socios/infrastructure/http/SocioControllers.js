import SocioApplication from '../../application/SocioApplication.js'
import SocioRepositoryDb from '../db/SocioRepositoryDb.js'

const socioRepository = new SocioRepositoryDb()
const socioUseCases = new SocioApplication(socioRepository)

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : {};
        const data = await socioUseCases.find(qry)
        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const findById = async (req, res) => {
    try {
        const { id } = req.params
        const data = await socioUseCases.findById(id)
        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message })
    }
}

export default {
    find,
    findById
}
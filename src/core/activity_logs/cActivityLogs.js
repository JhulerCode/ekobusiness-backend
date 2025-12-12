import { Repository } from '#db/Repository.js'

const repository = new Repository('ActivityLog')

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const data = await repository.find(qry)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    find,
}
import { Repository } from '#db/Repository.js'
import { resUpdateFalse, resDeleteFalse } from '#http/helpers.js'

const repository = new Repository('MrpBomSocio')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const data = await repository.find(qry)

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    find,
}

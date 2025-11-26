import { ActivityLog } from '#db/models/ActivityLog.js'
import { Colaborador } from "#db/models/Colaborador.js"
import { jdFindAll } from '#db/helpers.js'

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const include1 = {
            colaborador1: {
                model: Colaborador,
                as: 'colaborador1',
                attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos']
            }
        }

        const data = await jdFindAll({ model: ActivityLog, qry, include1 })

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    find,
}
import { ActivityLog } from '#db/models/ActivityLog.js'
import { Colaborador } from "#db/models/Colaborador.js"
import { applyFilters } from "../../utils/mine.js"

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            order: [['createdAt', 'DESC']],
            where: {},
            include: [
                {
                    model: Colaborador,
                    as: 'colaborador1',
                    attributes: ['id', 'nombres', 'apellidos', 'nombres_apellidos']
                }
            ],
            logging: console.log
        }

        if (qry) {
            if (qry.fltr) {
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }
        }

        const data = await ActivityLog.findAll(findProps)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    find,
}
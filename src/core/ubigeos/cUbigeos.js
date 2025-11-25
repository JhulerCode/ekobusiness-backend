import { Ubigeo } from '#db/models/Ubigeo.js'
import { Sequelize, Op } from 'sequelize'
import { applyFilters, existe } from '#shared/mine.js'

const find = async (req, res) => {
    try {
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        const findProps = {
            attributes: ['id'],
            order: [[Sequelize.literal(`TRIM(CONCAT(COALESCE(departamento, ''), ' ', COALESCE(provincia, ''), ' ', COALESCE(distrito, '')))`), 'ASC']],
            where: {},
            include: []
        }

        if (qry) {
            if (qry.fltr) {
                Object.assign(findProps.where, applyFilters(qry.fltr))
            }

            if (qry.cols) {
                findProps.attributes = findProps.attributes.concat(qry.cols)
            }
        }

        let data = await Ubigeo.findAll(findProps)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    find,
}
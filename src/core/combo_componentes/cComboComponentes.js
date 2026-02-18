import sequelize from '#db/sequelize.js'
import { Repository } from '#db/Repository.js'

const repository = new Repository('ComboComponente')

const find = async (req, res) => {
    try {
        const { empresa } = req.user
        const qry = req.query.qry ? JSON.parse(req.query.qry) : null

        qry.fltr.empresa = { op: 'Es', val: empresa }

        const data = await repository.find(qry, true)

        res.json({ code: 0, data })
    } catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const createBulk = async (req, res) => {
    const transaction = await sequelize.transaction()

    try {
        const { colaborador, empresa } = req.user
        const { articulos } = req.body

        const send = articulos.map((a) => ({
            articulo_principal: a.articulo_principal,
            articulo: a.articulo,
            cantidad: a.cantidad,

            empresa: empresa.id,
            createdBy: colaborador,
        }))

        await repository.createBulk(send, transaction)
        await transaction.commit()

        res.json({ code: 0 })
    } catch (error) {
        await transaction.rollback()

        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    find,
    createBulk,
}

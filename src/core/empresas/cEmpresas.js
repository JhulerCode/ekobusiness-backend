import { Repository } from '#db/Repository.js'
import { obtenerEmpresa, empresasStore } from '../_signin/sessions.js'
import { resUpdateFalse } from '#http/helpers.js'

const repository = new Repository('Empresa')

const findById = async (req, res) => {
    try {
        const { id } = req.params

        // const data = await repository.find({ id })
        // const data = obtenerEmpresa(id)
        // console.log(data)
        // console.log(empresasStore)
        const data = req.empresa

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const update = async (req, res) => {
    try {
        const { colaborador, empresa } = req.user
        const { id } = req.params
        const { nombre, descripcion, activo } = req.body

        //---- VERIFY SI EXISTE NOMBRE ---//
        if (await repository.existe({ nombre, id, empresa }, res) == true) return

        //--- ACTUALIZAR ---//
        const updated = await repository.update({ id }, {
            nombre, descripcion, activo,
            updatedBy: colaborador
        })

        if (updated == false) return resUpdateFalse(res)

        const data = await loadOne(id)

        res.json({ code: 0, data })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}


//--- Helpers ---//
async function loadOne(id) {
    const data = await repository.find({ id })

    return data
}

export default {
    findById,
    update,
}
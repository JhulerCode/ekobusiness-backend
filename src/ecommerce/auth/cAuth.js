import { Repository } from '#db/Repository.js'
import bcrypt from 'bcrypt'
import config from "../../config.js"
import jat from '#shared/jat.js'
import { guardarSesion } from '#store/sessions.js'
import dayjs from '#shared/dayjs.js'

const repository = new Repository('Socio')

//--- E-COMMERCE ---//
const createToNewsletter = async (req, res) => {
    try {
        const empresa = req.headers["x-empresa"]
        const { correo } = req.body

        // ----- VERIFY SI EXISTE CORREO ----- //
        if (await repository.existe({ correo, only_newsletter: true, empresa }, res, `El correo ya fue registrado anteriormente.`) == true) return

        // ----- CREAR ----- //
        await repository.create({ correo, only_newsletter: true })

        res.json({ code: 0 })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const createUser = async (req, res) => {
    try {
        const empresa = req.headers["x-empresa"]
        let { correo, contrasena } = req.body

        // ----- VERIFY SI EXISTE CORREO ----- //
        if (await repository.existe({ correo, tipo: 2, empresa }, res, `El correo ya fue registrado anteriormente.`) == true) return

        // ----- CREAR ----- //
        contrasena = await bcrypt.hash(contrasena, 10)
        const contrasena_updated_at = dayjs()

        const nuevo = await repository.create({
            tipo: 2,
            correo,
            contrasena,
            contrasena_updated_at,
            empresa,
        })

        const data = await repository.find({ id: nuevo.id }, true)

        const token = jat.encrypt({ id: data.id }, config.tokenMyApi)

        guardarSesion(data.id, { token, ...data })

        res.json({ code: 0, token })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

const signin = async (req, res) => {
    try {
        const empresa = req.headers["x-empresa"]
        let { correo, contrasena } = req.body

        //--- VERIFICAR CLIENTE --- //
        const qry = {
            fltr: {
                tipo: { op: 'Es', val: 2 },
                correo: { op: 'Es', val: correo },
                empresa: { op: 'Es', val: empresa },
            },
            cols: { exclude: [] }
        }
        const data = await repository.find(qry, true)
        if (data.length == 0) return res.json({ code: 1, msg: 'Correo o contraseña incorrecta' })

        const cliente = data[0]
        const correct = await bcrypt.compare(contrasena, cliente.contrasena)
        if (!correct) return res.json({ code: 1, msg: 'Correo o contraseña incorrecta' })

        //--- GUARDAR SESSION ---//
        const token = jat.encrypt({ id: cliente.id }, config.tokenMyApi)

        delete cliente.contrasena
        guardarSesion(cliente.id, { token, ...cliente })

        res.json({ code: 0, token, data: cliente })
    }
    catch (error) {
        res.status(500).json({ code: -1, msg: error.message, error })
    }
}

export default {
    createToNewsletter,
    createUser,
    signin,
}
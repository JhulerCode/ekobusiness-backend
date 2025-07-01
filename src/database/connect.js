import sequelize from './sequelize.js'
import './createdBy.js'
// import initData from './initData.js'
import { Transaccion } from './models/Transaccion.js'
import { Maquina } from './models/Maquina.js'

async function connect() {
    try {
        await sequelize.authenticate()
        console.log('Connection to database has been established successfully.')
    }
    catch (error) {
        console.log('Unable to connect to the database:', error.message)
    }

    // await Maquina.sync({ alter: true })
    // console.log('Tabla alterada')

    // await sequelize.sync({ force: true })
    // console.log('Base de datos forzada')

    // await initData()
}

export default connect
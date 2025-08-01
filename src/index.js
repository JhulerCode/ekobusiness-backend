import express from 'express'
import cors from 'cors'
import config from './config.js'
import routes from './routes/index.js'
import connDb from './database/connect.js'

const app = express()

// ----- MIDDLEWARES -----//
app.disable('x-powered-by')
const corsOptions = {
    origin: [config.hostFrontend]
}
app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.set('port', process.env.PORT || 4000)

// ----- RUTAS -----//
routes(app)

// ----- START SERVER -----//
app.listen(app.get('port'), async () => {
    console.log('Server on port', app.get('port'))
})

// ----- TEST CONN DB -----//
// await connDb()
import express from 'express'
import cors from 'cors'
import config from './config.js'
import routes from '#http/routes.js'
import routesEcommerce from '#http/routesEcommerce.js'

const app = express()

// ----- MIDDLEWARES -----//
app.disable('x-powered-by')
app.use(cors({ origin: JSON.parse(config.hostFrontend) }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ----- RUTAS -----//
app.use(routes)
app.use(routesEcommerce)

// ----- START SERVER -----//
const PORT = config.PORT || 4000
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
})
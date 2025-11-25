import express from 'express'
import cors from 'cors'
import config from './config.js'
import routes from './routes/index.js'
// import { pathUploads } from './utils/uploadFiles.js'

const app = express()

// ----- MIDDLEWARES -----//
app.disable('x-powered-by')
app.use(cors({ origin: JSON.parse(config.hostFrontend) }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
// app.use('/uploads', express.static(pathUploads))

// ----- RUTAS -----//
app.use(routes)

// ----- START SERVER -----//
const PORT = config.PORT || 4000
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
})

// ----- TEST CONN DB -----//
// await connDb()
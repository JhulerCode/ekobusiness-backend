import { Router } from "express"
import controller from "#core/articulo_lineas/cArticuloLineas.js"

const router = Router()

router.get('/', controller.find)

export default router
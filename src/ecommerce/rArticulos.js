import { Router } from "express"
import controller from "#core/articulos/cArticulos.js"

const router = Router()

router.get('/', controller.find)

export default router
import { Router } from "express"
import controller from "../articulos/cArticulos.js"

const router = Router()

router.get('/', controller.find)

export default router
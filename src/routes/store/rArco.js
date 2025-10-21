import { Router } from "express"
import controller from "../derecho_arcos/cDerechoArcos.js"

const router = Router()

router.post('/', controller.create)

export default router
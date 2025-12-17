import { Router } from "express"
import controller from "#core/libro_reclamos/cLibroReclamos.js"

const router = Router()

router.post('/', controller.create)

export default router
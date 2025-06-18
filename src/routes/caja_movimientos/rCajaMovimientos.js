import { Router } from "express"
import controller from "./cCajaMovimientos.js"

const router = Router()

router.post('/', controller.create)
router.get('/', controller.find)
router.delete('/:id', controller.delet)

export default router
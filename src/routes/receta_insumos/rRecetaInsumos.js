import { Router } from "express"
import controller from "./cRecetaInsumos.js"

const router = Router()

router.post('/', controller.create)
router.get('/:id', controller.find)
router.patch('/:id', controller.update)
router.delete('/:id', controller.delet)

export default router
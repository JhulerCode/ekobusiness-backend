import { Router } from "express"
import controller from "./cPrecioListaItems.js"

const router = Router()

router.post('/', controller.create)
router.patch('/:id', controller.update)
router.get('/', controller.find)
router.delete('/:id', controller.delet)

export default router
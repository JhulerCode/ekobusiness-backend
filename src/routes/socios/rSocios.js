import { Router } from "express"
import controller from "./cSocios.js"

const router = Router()

router.post('/', controller.create)
router.get('/', controller.find)
router.get('/uno/:id', controller.findById)
router.delete('/:id', controller.delet)
router.patch('/:id', controller.update)

router.delete('/bulk/:id', controller.deleteBulk)
router.patch('/bulk/:id', controller.updateBulk)

export default router
import { Router } from "express"
import controller from "./cSocioPedidos.js"

const router = Router()

router.post('/', controller.create)
router.patch('/:id', controller.update)
router.get('/', controller.find)
router.get('/uno/:id', controller.findById)
router.delete('/:id', controller.delet)
router.patch('/anular/:id', controller.anular)

router.get('/pendientes', controller.findDetail)

export default router
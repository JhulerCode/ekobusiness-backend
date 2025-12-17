import { Router } from "express"
import controller from "#core/socio_pedidos/cSocioPedidos.js"

const router = Router()

router.post('/', controller.create)
router.get('/uno/:id', controller.findById)
router.get('/', controller.find)

export default router
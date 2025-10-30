import { Router } from "express"
import controller from "../socio_pedidos/cSocioPedidos.js"

const router = Router()

router.post('/', controller.create)

export default router
import { Router } from "express"
import controller from "./cSocioPedidoItems.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso(),
    controller.find
)

export default router
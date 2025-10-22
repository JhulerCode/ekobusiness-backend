import { Router } from "express"
import controller from "./cSocioPedidoItems.js"
import verifyPermiso from '../../middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso(),
    controller.find
)

export default router
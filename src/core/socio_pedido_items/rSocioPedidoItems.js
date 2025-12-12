import { Router } from "express"
import controller from "./cSocioPedidoItems.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso(),
    controller.find
)

router.post(
    '/',
    controller.create
)

router.patch(
    '/:id',
    controller.update
)

export default router
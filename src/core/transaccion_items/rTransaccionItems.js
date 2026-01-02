import { Router } from "express"
import controller from "./cTransaccionItems.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
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

router.delete(
    '/:id',
    controller.delet
)

export default router
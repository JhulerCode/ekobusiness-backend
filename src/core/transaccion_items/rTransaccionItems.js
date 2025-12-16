import { Router } from "express"
import controller from "./cTransaccionItems.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    controller.find
)

export default router
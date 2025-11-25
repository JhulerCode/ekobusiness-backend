import { Router } from "express"
import controller from "./cSessions.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso(['vSessions:listar']),
    controller.find
)

export default router
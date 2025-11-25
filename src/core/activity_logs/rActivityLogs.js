import { Router } from "express"
import controller from "./cActivityLogs.js"
import verifyPermiso from '#http/middlewares/verifyPermiso.js'

const router = Router()

router.get(
    '/',
    verifyPermiso(['vActivityLogs:listar']),
    controller.find
)

export default router
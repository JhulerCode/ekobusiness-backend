import { Router } from "express"
import controller from "./cMrpBomLines.js"
import verifyPermiso from "#http/middlewares/verifyPermiso.js"

const router = Router()

router.get(
    '/',
    verifyPermiso([
        'vReceta:listar',
    ]),
    controller.find
)

export default router
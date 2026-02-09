import { Router } from "express"
import controller from "./cMrpBomSocios.js"
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